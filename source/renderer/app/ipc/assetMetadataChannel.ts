import { RendererIpcChannel } from './lib/RendererIpcChannel';
import { RendererIpcConversation } from './lib/RendererIpcConversation';
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

/**
 * The two read channels are conversations and the push channel is not.
 *
 * A conversation puts an id on the wire, keeps listening when a message carries
 * someone else's, and takes only its own listener away when its own answer
 * arrives. `IpcChannel` instead parks a one-shot listener on a response name
 * shared by every caller, and one `emit` fires all of them with the same
 * payload and unregisters all of them. Both of these channels are asked more
 * than once at a time, so under `IpcChannel` the first answer would settle every
 * outstanding request with one subject's payload and the answers behind it would
 * arrive to an empty listener list.
 *
 * The push channel has no such problem to solve. Nothing requests it, its
 * payload travels main to renderer, and the acknowledgement going back carries
 * no information at all, so there is nothing a mis-delivered acknowledgement
 * could get wrong.
 */
export const assetMetadataChannel: RendererIpcConversation<
  AssetMetadataMainResponse,
  AssetMetadataRendererRequest
> = new RendererIpcConversation(ASSET_METADATA_CHANNEL);

export const assetMetadataUpdateChannel: RendererIpcChannel<
  AssetMetadataUpdateMainRequest,
  AssetMetadataUpdateRendererResponse
> = new RendererIpcChannel(ASSET_METADATA_UPDATE_CHANNEL);

export const assetImageChannel: RendererIpcConversation<
  AssetImageMainResponse,
  AssetImageRendererRequest
> = new RendererIpcConversation(ASSET_IMAGE_CHANNEL);

/**
 * TEMPORARY DIAGNOSTIC INSTRUMENTATION. Revert before this work leaves draft.
 *
 * How many image requests are outstanding. It correlates nothing: the channel
 * does that. It is here so that one file answers "ten rows asked and ten were
 * answered" without the reader having to pair lines up by hand, and so that the
 * defect this instrument was attached to find would still be legible if it
 * recurred, as a count that climbs and never returns to zero.
 */
let imageRequestsInFlight = 0;

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
 *
 * Never rejects. The main handler answers on every path, so the only thing that
 * could reject is the transport itself, and a caller merging rows into a store
 * is not a place to handle that. An empty answer is the same shape as a cache
 * that knew nothing, which is what a read that could not be made amounts to.
 */
export const requestAssetMetadata = (
  subjects: Array<string>,
  options: {
    refresh?: boolean;
    sourceUrl?: string | null;
    connectivityRestored?: boolean;
  } = {}
): Promise<AssetMetadataMainResponse> =>
  assetMetadataChannel
    .request({
      subjects,
      refresh: options.refresh === true,
      sourceUrl: options.sourceUrl ?? null,
      connectivityRestored: options.connectivityRestored === true,
    })
    .catch((error) => {
      assetLogger.warn('Asset IPC renderer: request rejected', {
        channel: 'metadata',
        subjectCount: subjects.length,
        reason: error instanceof Error ? error.message : 'unknown',
      });
      return { entries: [], unresolved: [] };
    });

/** Asks for one subject's logo. Answers `absent` rather than failing. */
export const requestAssetImage = (
  subject: string
): Promise<AssetImageMainResponse> => {
  // TEMPORARY DIAGNOSTIC INSTRUMENTATION. Revert before this work leaves draft.
  imageRequestsInFlight += 1;
  assetLogger.debug('Asset image renderer: request sent', {
    channel: 'image',
    subject,
    inFlight: imageRequestsInFlight,
  });
  return assetImageChannel
    .request({ subject })
    .then((response) => {
      // TEMPORARY DIAGNOSTIC INSTRUMENTATION. Revert before this work leaves
      // draft. One of these per request, each naming its own subject. Ten rows
      // asking at once read as `inFlight` climbing to ten and then coming back
      // down to zero, one subject at a time.
      imageRequestsInFlight -= 1;
      assetLogger.debug('Asset image renderer: response received', {
        channel: 'image',
        subject,
        status: response.status,
        inFlight: imageRequestsInFlight,
      });
      return response;
    })
    .catch((error) => {
      imageRequestsInFlight -= 1;
      assetLogger.warn('Asset IPC renderer: request rejected', {
        channel: 'image',
        subject,
        inFlight: imageRequestsInFlight,
        reason: error instanceof Error ? error.message : 'unknown',
      });
      // The main handler catches its own failures and answers `absent`, so this
      // is the transport itself failing. A row that asked for a picture is told
      // there is none, which is what every other failure on this path already
      // resolves to.
      return { status: 'absent' } as AssetImageMainResponse;
    });
};

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
