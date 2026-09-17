import { v4 as uuidv4 } from 'uuid';
import { RendererIpcChannel } from './lib/RendererIpcChannel';
// TEMPORARY DIAGNOSTIC INSTRUMENTATION. Revert before this work leaves draft.
import { assetLogger } from '../utils/assetLogging';
import {
  ASSET_IMAGE_CHANNEL,
  ASSET_METADATA_CHANNEL,
  ASSET_METADATA_UPDATE_CHANNEL,
} from '../../../common/ipc/api';
import type {
  AssetImageMainResponse,
  AssetImageRendererRequest,
  AssetMetadataMainResponse,
  AssetMetadataRendererRequest,
  AssetMetadataUpdateMainRequest,
  AssetMetadataUpdateRendererResponse,
} from '../../../common/ipc/api';

export const assetMetadataChannel: RendererIpcChannel<
  AssetMetadataMainResponse,
  AssetMetadataRendererRequest
> = new RendererIpcChannel(ASSET_METADATA_CHANNEL);

export const assetMetadataUpdateChannel: RendererIpcChannel<
  AssetMetadataUpdateMainRequest,
  AssetMetadataUpdateRendererResponse
> = new RendererIpcChannel(ASSET_METADATA_UPDATE_CHANNEL);

export const assetImageChannel: RendererIpcChannel<
  AssetImageMainResponse,
  AssetImageRendererRequest
> = new RendererIpcChannel(ASSET_IMAGE_CHANNEL);

type Correlated = { requestId: string };

/**
 * TEMPORARY DIAGNOSTIC INSTRUMENTATION. Revert before this work leaves draft.
 *
 * The subject each outstanding image request named, so a delivery can say which
 * asset it was about. The response carries only a `requestId`.
 */
const requestSubjects = new Map<string, string>();

/**
 * Waiters for one channel, keyed by the id each of them issued.
 *
 * `IpcChannel.request` registers a one-shot listener on the channel's single
 * response name and resolves on the next message to arrive, whatever request
 * that message answers. Two reads in flight are two listeners on one stream,
 * fired in registration order by arrival order, so a response can land on the
 * wrong promise.
 *
 * Correlation therefore cannot live inside one call. A call that checked the id
 * on its own promise and kept waiting would wait forever, because the message it
 * wanted was already consumed by the other listener. The waiters share a
 * registry instead: whichever promise settles hands the payload to the waiter
 * whose id it carries, and a payload nobody is waiting for is discarded.
 */
const deliver = <TResponse extends Correlated>(
  waiters: Map<string, (response: TResponse) => void>,
  response: TResponse,
  channel: string
): void => {
  const requestId = response?.requestId;
  const waiter = typeof requestId === 'string' ? waiters.get(requestId) : null;
  const subject =
    typeof requestId === 'string'
      ? (requestSubjects.get(requestId) ?? null)
      : null;
  if (!waiter) {
    // TEMPORARY DIAGNOSTIC INSTRUMENTATION. Revert before this work leaves
    // draft. A payload nobody is waiting for is discarded here without a word,
    // and so is the fact that some other waiter is still holding. Both halves
    // are on the record now: how many are still waiting, and which subject this
    // payload belonged to.
    assetLogger.warn('Asset IPC renderer: response matched no waiter', {
      channel,
      requestId: typeof requestId === 'string' ? requestId : null,
      subject,
      waiting: waiters.size,
    });
    return;
  }
  waiters.delete(requestId);
  requestSubjects.delete(requestId);
  assetLogger.debug('Asset IPC renderer: response matched its waiter', {
    channel,
    requestId,
    subject,
    waitingBefore: waiters.size + 1,
    waitingAfter: waiters.size,
  });
  waiter(response);
};

const metadataWaiters = new Map<
  string,
  (response: AssetMetadataMainResponse) => void
>();

const imageWaiters = new Map<
  string,
  (response: AssetImageMainResponse) => void
>();

/**
 * Asks for the rows the cache holds for these subjects and returns what it has.
 * Subjects it has no row for come back under `unresolved`, and resolution for
 * them is scheduled in the main process, so the answer is never behind a
 * request to the registry.
 *
 * `refresh` asks the main process to schedule these subjects whether or not
 * their refresh window has elapsed and whether or not they are inside a retry
 * backoff. It does not change what comes back now, only what is fetched next.
 *
 * `sourceUrl` is the user's selected pointer source. It travels with every read
 * because the setting lives here and the client that uses it lives there.
 *
 * `connectivityRestored` reports that this window observed the machine come back
 * online. It names no subjects: which of them were waiting on the network is
 * known in the main process and not here.
 */
export const requestAssetMetadata = (
  subjects: Array<string>,
  options: {
    refresh?: boolean;
    sourceUrl?: string | null;
    connectivityRestored?: boolean;
  } = {}
): Promise<AssetMetadataMainResponse> =>
  new Promise((resolve) => {
    const requestId = uuidv4();
    metadataWaiters.set(requestId, resolve);
    assetMetadataChannel
      .request({
        requestId,
        subjects,
        refresh: options.refresh === true,
        sourceUrl: options.sourceUrl ?? null,
        connectivityRestored: options.connectivityRestored === true,
      })
      .then((response) => deliver(metadataWaiters, response, 'metadata'))
      // A rejected response arrives without an id, so it cannot be handed to the
      // waiter it belongs to. The main handlers answer on every path and never
      // reject, which is what keeps this unreachable; rejecting some other
      // waiter to be rid of it would be worse than leaving this one waiting.
      .catch(() => {
        assetLogger.warn('Asset IPC renderer: request rejected', {
          channel: 'metadata',
          requestId,
          subject: null,
          waiting: metadataWaiters.size,
        });
      });
  });

/** Asks for one subject's logo. Answers `absent` rather than failing. */
export const requestAssetImage = (
  subject: string
): Promise<AssetImageMainResponse> =>
  new Promise((resolve) => {
    const requestId = uuidv4();
    imageWaiters.set(requestId, resolve);
    requestSubjects.set(requestId, subject);
    // TEMPORARY DIAGNOSTIC INSTRUMENTATION. Revert before this work leaves
    // draft. `waiting` is the count after this one was parked, so a burst of
    // rows asking at once is visible as a rising number, and a number that
    // rises and never comes back down is a set of requests that were answered
    // by nobody.
    assetLogger.debug('Asset image renderer: request sent', {
      channel: 'image',
      requestId,
      subject,
      waiting: imageWaiters.size,
    });
    assetImageChannel
      .request({
        requestId,
        subject,
      })
      .then((response) => deliver(imageWaiters, response, 'image'))
      .catch(() => {
        assetLogger.warn('Asset IPC renderer: request rejected', {
          channel: 'image',
          requestId,
          subject,
          waiting: imageWaiters.size,
        });
      });
  });

/**
 * One `data:` URL per subject, for the life of the renderer.
 *
 * A token list unmounts and remounts its rows as the user scrolls, sorts and
 * searches, so a request held by the row that made it is a request per scroll.
 * The promise is memoised rather than its result, so two rows mounting in the
 * same frame share one request instead of issuing two and discarding one.
 *
 * `null` is remembered as firmly as a URL is. A wallet holding many tokens the
 * registry has no picture for is the ordinary case, and asking again each time
 * such a row is drawn is the cost this map exists to avoid.
 */
const imageUrls = new Map<string, Promise<string | null>>();

const dataUrl = (mediaType: string, bytes: Uint8Array): string =>
  `data:${mediaType};base64,${Buffer.from(bytes).toString('base64')}`;

/**
 * The logo for one subject, as something an `img` can render, or `null` when
 * there is none. Never rejects: the main handler answers `absent` on every
 * failure, and a missing picture is not a condition a row should have to handle.
 */
export const requestAssetImageUrl = (
  subject: string
): Promise<string | null> => {
  const existing = imageUrls.get(subject);
  if (existing) {
    // TEMPORARY DIAGNOSTIC INSTRUMENTATION. Revert before this work leaves
    // draft. A memo hit on a promise that never settles is indistinguishable
    // from a memo hit on a picture, from the row's point of view.
    assetLogger.debug('Asset image renderer: memo hit', { subject });
    return existing;
  }
  const pending = requestAssetImage(subject).then((response) => {
    // Narrowed by the literal rather than by truthiness: `strict` is off, so a
    // check on the absence of a property does not narrow this union at all.
    const url =
      response.status === 'present'
        ? dataUrl(response.mediaType, response.bytes)
        : null;
    assetLogger.debug('Asset image renderer: url resolved', {
      subject,
      status: response.status,
      byteLength: response.status === 'present' ? response.bytes.length : 0,
      hasUrl: url != null,
    });
    return url;
  });
  imageUrls.set(subject, pending);
  return pending;
};

/** Subscribes to rows the main process resolves after the fact. */
export const onAssetMetadataUpdate = (
  handler: (message: AssetMetadataUpdateMainRequest) => void
): void => {
  assetMetadataUpdateChannel.onReceive((message) => {
    handler(message);
    return Promise.resolve();
  });
};
