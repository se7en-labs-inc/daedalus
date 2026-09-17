import { logger } from '../utils/logging';
// TEMPORARY DIAGNOSTIC INSTRUMENTATION. Revert before this work leaves draft.
import { assetLogger } from '../utils/assetLogging';
import type { AssetImageRow, AssetMetadataDatabase } from './assetMetadataDb';
import {
  ASSET_IMAGE_MAX_ENTRY_BYTES,
  openAssetMetadataDatabase,
} from './assetMetadataDb';
import {
  ASSET_REGISTRY_TIMEOUT_MS,
  assetRegistryEndpoint,
  assetRegistryQueryUrl,
  httpRegistryTransport,
} from './assetRegistryClient';
import type { RegistryTransport } from './assetRegistryClient';

/**
 * Measured over 400 registry subjects on 2026-09-14: 374 carry a logo, every
 * one a PNG, from 806 bytes to 65,249 with a median of 23,251. The cap is about
 * four times the largest entry seen. It lives with the table, because the
 * eviction sweep floor is derived from it.
 */
export const ASSET_IMAGE_MAX_BYTES = ASSET_IMAGE_MAX_ENTRY_BYTES;

/**
 * Both bounds, not one. At the measured median entry size they bite at roughly
 * the same point, which is the intent: the entry bound stops a flood of small
 * images and the byte bound stops a handful of large ones. The shape is the one
 * already used for DRep anchors.
 */
export const ASSET_IMAGE_MAX_ENTRIES = 2000;
export const ASSET_IMAGE_MAX_TOTAL_BYTES = 64 * 1024 * 1024;

/**
 * A read moves a row to the end of the eviction ordering, but SQLite rewrites
 * a whole row on an update, blob included, so an unconditional touch would
 * write tens of kilobytes per rendered row per paint. The ordering needs to
 * separate an image used today from one used last month, so an hour is three
 * orders of magnitude finer than it needs.
 */
export const ASSET_IMAGE_TOUCH_INTERVAL_MS = 60 * 60 * 1000;

const PNG_SIGNATURE = '89504e470d0a1a0a';
const JPEG_SIGNATURE = 'ffd8ff';

/**
 * The registry publishes a logo as bare base64 with no content type beside it,
 * so the type is detected from the decoded bytes rather than taken from the
 * response.
 *
 * SVG is refused. It is markup rather than raster bytes, it can carry script,
 * and the window it would render in runs with node integration enabled. None of
 * the 374 logos sampled is one, so the measured cost of refusing it is zero.
 */
export const detectImageMediaType = (bytes: Uint8Array): string | null => {
  const buffer = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.length);
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).toString('hex') === PNG_SIGNATURE
  ) {
    return 'image/png';
  }
  if (
    buffer.length >= 3 &&
    buffer.subarray(0, 3).toString('hex') === JPEG_SIGNATURE
  ) {
    return 'image/jpeg';
  }
  if (buffer.length >= 6) {
    const header = buffer.subarray(0, 6).toString('latin1');
    if (header === 'GIF87a' || header === 'GIF89a') return 'image/gif';
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('latin1') === 'RIFF' &&
    buffer.subarray(8, 12).toString('latin1') === 'WEBP'
  ) {
    return 'image/webp';
  }
  return null;
};

export type AssetImageStoreOptions = {
  database?: AssetMetadataDatabase;
  transport?: RegistryTransport;
  endpoint?: string | null;
  now?: () => number;
  maxEntries?: number;
  maxTotalBytes?: number;
};

const logoRequestBody = (subject: string): string =>
  JSON.stringify({ subjects: [subject], properties: ['logo'] });

/**
 * TEMPORARY DIAGNOSTIC INSTRUMENTATION. Revert before this work leaves draft.
 *
 * `logoValue` used to answer `null` to four different questions, and the caller
 * treated all four the same way: remember the subject and never ask again. Two
 * of them mean the registry has no picture of this asset, which is ordinary and
 * correct to remember. The other two mean the answer could not be read at all,
 * which is a fault and is remembered just as permanently.
 *
 * The verdict travels with the value so the caller can say which happened. What
 * the caller then does is unchanged.
 */
type LogoLookupOutcome = 'found' | 'answered-without-logo' | 'unreadable';

type LogoLookup = {
  value: string | null;
  outcome: LogoLookupOutcome;
  reason: string;
};

const logoValue = (body: string, subject: string): LogoLookup => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return { value: null, outcome: 'unreadable', reason: 'body-is-not-json' };
  }
  const subjects = (parsed as { subjects?: unknown })?.subjects;
  if (!Array.isArray(subjects)) {
    return {
      value: null,
      outcome: 'unreadable',
      reason: 'no-subjects-array',
    };
  }
  const entry = subjects.find(
    (candidate) =>
      typeof (candidate as { subject?: unknown })?.subject === 'string' &&
      (candidate as { subject: string }).subject === subject
  ) as { logo?: { value?: unknown } } | undefined;
  // A server answering a question nobody asked must not be able to create a
  // row, and here the consequence would be one asset wearing another's logo.
  if (!entry) {
    return {
      value: null,
      outcome: 'answered-without-logo',
      reason: 'subject-not-in-response',
    };
  }
  const value = entry.logo?.value;
  if (typeof value !== 'string') {
    return {
      value: null,
      outcome: 'answered-without-logo',
      reason: 'entry-carries-no-logo',
    };
  }
  return { value, outcome: 'found', reason: 'logo-present' };
};

export class AssetImageStore {
  private _db: AssetMetadataDatabase;

  private _transport: RegistryTransport;

  private _endpoint?: string | null;

  private _now: () => number;

  private _maxEntries: number;

  private _maxTotalBytes: number;

  // A subject the registry answered without a logo. Deliberately in memory
  // rather than in asset_resolution, which records metadata resolution: one
  // subject's metadata state should not depend on whether its picture exists.
  private _withoutImage = new Set<string>();

  private _inFlight = new Map<string, Promise<AssetImageRow | null>>();

  constructor(options: AssetImageStoreOptions = {}) {
    this._db = options.database ?? openAssetMetadataDatabase();
    this._transport = options.transport ?? httpRegistryTransport;
    this._endpoint = options.endpoint;
    this._now = options.now ?? Date.now;
    this._maxEntries = options.maxEntries ?? ASSET_IMAGE_MAX_ENTRIES;
    this._maxTotalBytes = options.maxTotalBytes ?? ASSET_IMAGE_MAX_TOTAL_BYTES;
  }

  read(subject: string): AssetImageRow | null {
    const row = this._db.readImage(subject);
    if (row) this._touch(row);
    return row;
  }

  private _touch(row: AssetImageRow): void {
    const now = this._now();
    if (now - row.fetchedAt <= ASSET_IMAGE_TOUCH_INTERVAL_MS) return;
    this._db.touchImage(row.subject, now);
  }

  fetch(subject: string): Promise<AssetImageRow | null> {
    if (typeof subject !== 'string' || subject.length === 0) {
      assetLogger.debug('Asset image store: refused a subject', {
        reason: 'subject-is-empty',
      });
      return Promise.resolve(null);
    }
    const stored = this._db.readImage(subject);
    if (stored) {
      this._touch(stored);
      assetLogger.debug('Asset image store: served from cache', {
        subject,
        byteLength: stored.bytes.length,
        mediaType: stored.mediaType,
      });
      return Promise.resolve(stored);
    }
    if (this._withoutImage.has(subject)) {
      assetLogger.debug('Asset image store: skipped, known to have no image', {
        subject,
        withoutImageCount: this._withoutImage.size,
      });
      return Promise.resolve(null);
    }
    const existing = this._inFlight.get(subject);
    // A token list is thirty components each deciding independently whether to
    // show a picture, so sharing the request is the ordinary case.
    if (existing) {
      assetLogger.debug('Asset image store: joined a request in flight', {
        subject,
        inFlightCount: this._inFlight.size,
      });
      return existing;
    }

    const pending = this._fetchOne(subject).finally(() => {
      this._inFlight.delete(subject);
    });
    this._inFlight.set(subject, pending);
    assetLogger.debug('Asset image store: fetch started', {
      subject,
      inFlightCount: this._inFlight.size,
    });
    return pending;
  }

  private async _fetchOne(subject: string): Promise<AssetImageRow | null> {
    const url = assetRegistryQueryUrl(assetRegistryEndpoint(this._endpoint));
    const result = await this._transport.post(
      url,
      logoRequestBody(subject),
      ASSET_REGISTRY_TIMEOUT_MS
    );
    if (result.ok === false || result.status !== 200) {
      // Cosmetic and retryable. Nothing is recorded, so the next render may ask
      // again; only a successful answer without a logo is remembered.
      logger.debug('Asset image: request did not answer');
      // `reason` separates the transport's own refusals from an HTTP status:
      // `too-large` is the 1MB response cap, `timeout` and `network` are the
      // connection. None of them is remembered, so the next render may ask
      // again, which is why this line says so.
      assetLogger.debug('Asset image: registry request did not answer', {
        subject,
        ok: result.ok,
        reason: result.ok === false ? result.reason : 'http-status',
        status: result.ok === false ? null : result.status,
        neverRetried: false,
      });
      return null;
    }

    const logo = logoValue(result.body, subject);
    if (logo.value === null) {
      this._withoutImage.add(subject);
      // Two outcomes that were one silence. `unreadable` says the response
      // could not be read; `answered-without-logo` says it was read and the
      // registry has no picture of this asset. Either way the subject is now in
      // `_withoutImage` and is never asked for again while this process lives,
      // which is why the distinction has to be on the record.
      if (logo.outcome === 'unreadable') {
        assetLogger.warn('Asset image: registry response could not be read', {
          subject,
          reason: logo.reason,
          bodyLength: result.body.length,
          neverRetried: true,
          withoutImageCount: this._withoutImage.size,
        });
      } else {
        assetLogger.debug('Asset image: registry answered without a logo', {
          subject,
          reason: logo.reason,
          bodyLength: result.body.length,
          neverRetried: true,
          withoutImageCount: this._withoutImage.size,
        });
      }
      return null;
    }
    const value = logo.value;

    // Decoding before the cap check is safe because the transport has already
    // bounded the response. Base64 decoding is lenient and skips what it cannot
    // read rather than refusing, so it is the media-type check below that
    // refuses whatever a malformed value decoded to.
    const bytes = new Uint8Array(Buffer.from(value, 'base64'));
    if (bytes.length === 0 || bytes.length > ASSET_IMAGE_MAX_BYTES) {
      logger.debug('Asset image: entry discarded on size', {
        byteLength: bytes.length,
      });
      assetLogger.debug('Asset image: entry discarded on size', {
        subject,
        byteLength: bytes.length,
        maxBytes: ASSET_IMAGE_MAX_BYTES,
        encodedLength: value.length,
      });
      return null;
    }

    const mediaType = detectImageMediaType(bytes);
    if (!mediaType) {
      logger.debug('Asset image: entry discarded on media type');
      assetLogger.debug('Asset image: entry discarded on media type', {
        subject,
        byteLength: bytes.length,
      });
      return null;
    }

    if (!this._db.writeImage({ subject, mediaType, bytes }, this._now())) {
      // The refusal itself is logged by `writeImage`, which is the only place
      // that knows whether the pre-check or SQLite refused it.
      assetLogger.debug('Asset image: write refused, nothing cached', {
        subject,
        byteLength: bytes.length,
        mediaType,
      });
      return null;
    }
    // A write is the only moment a bound can be crossed; a read can only move a
    // row later in the ordering.
    this._db.enforceImageBounds(this._maxEntries, this._maxTotalBytes);
    const written = this._db.readImage(subject);
    assetLogger.debug('Asset image: fetch finished', {
      subject,
      byteLength: bytes.length,
      mediaType,
      storedAndReadBack: written != null,
    });
    return written;
  }
}

export const openAssetImageStore = (
  options: AssetImageStoreOptions = {}
): AssetImageStore => new AssetImageStore(options);
