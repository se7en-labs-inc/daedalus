/**
 * The renderer clients for the asset metadata channels, against a fake
 * `ipcRenderer` that answers in whatever order the case chooses.
 *
 * The fake is a real `EventEmitter`, because `ipcRenderer` is one and because
 * the property under test is what happens when several requests are waiting at
 * once. A fake that walks a list and calls one listener per message would hide
 * the thing that matters: a single `emit` runs every one-shot listener
 * registered for a name and unregisters all of them.
 */
import { EventEmitter } from 'events';
import {
  assetImageChannel,
  assetMetadataChannel,
  onAssetMetadataUpdate,
  requestAssetImage,
  requestAssetImageUrl,
  requestAssetMetadata,
} from './assetMetadataChannel';

type Sent = { channel: string; conversationId: string; message: any };

const sent: Array<Sent> = [];

const fakeIpcRenderer = Object.assign(new EventEmitter(), {
  send: (channel: string, conversationId: string, message: any) => {
    sent.push({ channel, conversationId, message });
  },
});
// A token list asks for one logo per row, so more than ten listeners on one
// channel is the ordinary case rather than a leak.
fakeIpcRenderer.setMaxListeners(0);

const METADATA_CHANNEL = 'ASSET_METADATA_CHANNEL';
const IMAGE_CHANNEL = 'ASSET_IMAGE_CHANNEL';
const UPDATE_BROADCAST_CHANNEL = 'ASSET_METADATA_UPDATE_CHANNEL-broadcast';

/** Answers one conversation, the way the main process would. */
const answer = (
  channel: string,
  conversationId: string,
  payload: any,
  isOk = true
) => {
  fakeIpcRenderer.emit(
    channel,
    { sender: fakeIpcRenderer },
    conversationId,
    isOk,
    payload
  );
};

const FIRST = `${'a'.repeat(56)}01`;
const SECOND = `${'b'.repeat(56)}02`;

/**
 * `requestAssetImageUrl` memoises per subject for the life of the module, and
 * the suite has no way to clear it without an export that exists only for
 * tests. Each case that touches the memo therefore uses a subject of its own.
 */
const memoSubject = (name: string) => `${'c'.repeat(56)}${name}`;

const sentOn = (channel: string) =>
  sent.filter((message) => message.channel === channel);

const subjectsSentOn = (channel: string) =>
  sentOn(channel).map((message) => message.message.subject);

const idsSentOn = (channel: string) =>
  sentOn(channel).map((message) => message.conversationId);

const metadataResponse = (subject: string) => ({
  entries: [{ subject, ticker: subject.slice(-2) }],
  unresolved: [],
});

const settled = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('assetMetadataChannel', () => {
  beforeEach(() => {
    sent.length = 0;
    fakeIpcRenderer.removeAllListeners();
    // The renderer channels default their sender and receiver to this global.
    (global as any).ipcRenderer = fakeIpcRenderer;
  });

  describe('requestAssetMetadata', () => {
    it('sends one request carrying the subjects it was given', async () => {
      const pending = requestAssetMetadata([FIRST]);
      expect(sent).toHaveLength(1);
      expect(sent[0].channel).toBe(METADATA_CHANNEL);
      expect(sent[0].message.subjects).toEqual([FIRST]);
      expect(typeof sent[0].conversationId).toBe('string');
      answer(METADATA_CHANNEL, sent[0].conversationId, metadataResponse(FIRST));
      await expect(pending).resolves.toEqual(metadataResponse(FIRST));
    });

    it('asks for an ordinary read unless a refresh is asked for', () => {
      requestAssetMetadata([FIRST]);
      expect(sent[0].message.refresh).toBe(false);
    });

    it('carries the refresh flag to the main process when one is asked for', () => {
      requestAssetMetadata([FIRST], { refresh: true });
      expect(sent[0].message.refresh).toBe(true);
      expect(sent[0].message.subjects).toEqual([FIRST]);
    });

    it('reports no connectivity transition unless one is asked for', () => {
      requestAssetMetadata([FIRST]);
      expect(sent[0].message.connectivityRestored).toBe(false);
    });

    it('carries a connectivity transition with no subjects', () => {
      requestAssetMetadata([], { connectivityRestored: true });
      expect(sent[0].message.connectivityRestored).toBe(true);
      expect(sent[0].message.subjects).toEqual([]);
    });

    it('sends no correlation of its own, because the channel carries one', () => {
      requestAssetMetadata([FIRST]);
      expect(sent[0].message.requestId).toBeUndefined();
    });

    it('gives each of two overlapping requests the answer it asked for, in whatever order they arrive', async () => {
      const firstPending = requestAssetMetadata([FIRST]);
      const secondPending = requestAssetMetadata([SECOND]);
      const [firstId, secondId] = idsSentOn(METADATA_CHANNEL);
      expect(firstId).not.toBe(secondId);

      // The second request is answered first, which is the case a channel that
      // settles on arrival order gets wrong.
      answer(METADATA_CHANNEL, secondId, metadataResponse(SECOND));
      answer(METADATA_CHANNEL, firstId, metadataResponse(FIRST));

      await expect(firstPending).resolves.toEqual(metadataResponse(FIRST));
      await expect(secondPending).resolves.toEqual(metadataResponse(SECOND));
    });

    it('discards a response it did not issue and keeps waiting', async () => {
      const pending = requestAssetMetadata([FIRST]);
      const [conversationId] = idsSentOn(METADATA_CHANNEL);
      let resolved = false;
      pending.then(() => {
        resolved = true;
      });

      answer(METADATA_CHANNEL, 'an-id-nobody-issued', metadataResponse(SECOND));
      await settled();
      expect(resolved).toBe(false);

      // The stray response consumed no listener, so the real answer still has
      // one to arrive at and nothing had to be issued to supply it.
      answer(METADATA_CHANNEL, conversationId, metadataResponse(FIRST));
      await expect(pending).resolves.toEqual(metadataResponse(FIRST));
    });

    it('answers an empty read rather than rejecting when the main process reports failure', async () => {
      const pending = requestAssetMetadata([FIRST]);
      const [conversationId] = idsSentOn(METADATA_CHANNEL);
      answer(
        METADATA_CHANNEL,
        conversationId,
        new Error('the handler fell over'),
        false
      );
      await expect(pending).resolves.toEqual({ entries: [], unresolved: [] });
    });

    it('leaves a request pending rather than expiring it', async () => {
      const pending = requestAssetMetadata([FIRST]);
      let resolved = false;
      pending.then(() => {
        resolved = true;
      });
      await settled();
      await settled();
      expect(resolved).toBe(false);
    });
  });

  describe('requestAssetImage', () => {
    /**
     * The shape the token list actually produces: one request per row, all of
     * them outstanding at once, answered in an order nobody controls. Under a
     * channel that settles on the next message to arrive, the first answer
     * settles all ten with one subject's payload and the nine behind it reach
     * nobody.
     */
    it('gives each of ten concurrent requests its own answer', async () => {
      const subjects = Array.from(
        { length: 10 },
        (_, index) => `${'d'.repeat(56)}${index}`
      );
      const pending = subjects.map((subject) => requestAssetImage(subject));
      const ids = idsSentOn(IMAGE_CHANNEL);
      expect(ids).toHaveLength(10);

      [...ids].reverse().forEach((conversationId, reverseIndex) => {
        const index = ids.length - 1 - reverseIndex;
        answer(IMAGE_CHANNEL, conversationId, {
          status: 'present',
          mediaType: 'image/png',
          bytes: new Uint8Array([index]),
        });
      });

      const answers = await Promise.all(pending);
      expect(
        answers.map((response) =>
          response.status === 'present' ? response.bytes[0] : -1
        )
      ).toEqual(subjects.map((_, index) => index));
    });

    it('gives each of two overlapping requests its own answer', async () => {
      const firstPending = requestAssetImage(FIRST);
      const secondPending = requestAssetImage(SECOND);
      const [firstId, secondId] = idsSentOn(IMAGE_CHANNEL);

      answer(IMAGE_CHANNEL, secondId, { status: 'absent' });
      answer(IMAGE_CHANNEL, firstId, {
        status: 'present',
        mediaType: 'image/png',
        bytes: new Uint8Array([1, 2, 3]),
      });

      const first = await firstPending;
      const second = await secondPending;
      expect(first.status).toBe('present');
      expect(second.status).toBe('absent');
    });

    it('sends one subject per request', () => {
      requestAssetImage(FIRST);
      expect(sent).toHaveLength(1);
      expect(sent[0].message.subject).toBe(FIRST);
    });

    it('does not answer a request from another channel', async () => {
      const pending = requestAssetImage(FIRST);
      const [imageId] = idsSentOn(IMAGE_CHANNEL);
      let resolved = false;
      pending.then(() => {
        resolved = true;
      });

      requestAssetMetadata([FIRST]);
      const [metadataId] = idsSentOn(METADATA_CHANNEL);
      answer(METADATA_CHANNEL, metadataId, metadataResponse(FIRST));
      await settled();
      expect(resolved).toBe(false);

      answer(IMAGE_CHANNEL, imageId, { status: 'absent' });
      await expect(pending).resolves.toEqual({ status: 'absent' });
    });

    it('answers absent rather than rejecting when the main process reports failure', async () => {
      const pending = requestAssetImage(FIRST);
      const [conversationId] = idsSentOn(IMAGE_CHANNEL);
      answer(
        IMAGE_CHANNEL,
        conversationId,
        new Error('the handler fell over'),
        false
      );
      await expect(pending).resolves.toEqual({ status: 'absent' });
    });
  });

  describe('requestAssetImageUrl', () => {
    it('asks once for a subject however many rows want it', async () => {
      const subject = memoSubject('01');
      const first = requestAssetImageUrl(subject);
      const second = requestAssetImageUrl(subject);
      expect(subjectsSentOn(IMAGE_CHANNEL)).toEqual([subject]);

      const [conversationId] = idsSentOn(IMAGE_CHANNEL);
      answer(IMAGE_CHANNEL, conversationId, {
        status: 'present',
        mediaType: 'image/png',
        bytes: new Uint8Array([137, 80, 78, 71]),
      });

      const url = 'data:image/png;base64,iVBORw==';
      await expect(first).resolves.toBe(url);
      await expect(second).resolves.toBe(url);
      expect(subjectsSentOn(IMAGE_CHANNEL)).toEqual([subject]);
    });

    it('asks again for a subject it has not been asked about', () => {
      requestAssetImageUrl(memoSubject('02'));
      requestAssetImageUrl(memoSubject('03'));
      expect(subjectsSentOn(IMAGE_CHANNEL)).toEqual([
        memoSubject('02'),
        memoSubject('03'),
      ]);
    });

    it('remembers that a subject has no logo and does not ask twice', async () => {
      const subject = memoSubject('04');
      const first = requestAssetImageUrl(subject);
      const [conversationId] = idsSentOn(IMAGE_CHANNEL);
      answer(IMAGE_CHANNEL, conversationId, { status: 'absent' });
      await expect(first).resolves.toBeNull();

      await expect(requestAssetImageUrl(subject)).resolves.toBeNull();
      expect(subjectsSentOn(IMAGE_CHANNEL)).toEqual([subject]);
    });

    /**
     * Ten rows, ten pictures. The memo holds the promise rather than the result,
     * so a request that never settles is a subject that never shows a picture
     * again for the life of the window: this is the case that failed in a real
     * wallet and the reason the channel was changed.
     */
    it('resolves a url for every one of ten subjects asked for at once', async () => {
      const subjects = Array.from({ length: 10 }, (_, index) =>
        memoSubject(`1${index}`)
      );
      const pending = subjects.map((subject) => requestAssetImageUrl(subject));
      const ids = idsSentOn(IMAGE_CHANNEL);
      expect(ids).toHaveLength(10);

      ids.forEach((conversationId) => {
        answer(IMAGE_CHANNEL, conversationId, {
          status: 'present',
          mediaType: 'image/png',
          bytes: new Uint8Array([137, 80, 78, 71]),
        });
      });

      const urls = await Promise.all(pending);
      expect(urls.filter((url) => url != null)).toHaveLength(10);
    });
  });

  describe('onAssetMetadataUpdate', () => {
    it('delivers a pushed message to the subscribed handler', async () => {
      const received: Array<any> = [];
      onAssetMetadataUpdate((message) => received.push(message));
      const entries = [{ subject: FIRST, ticker: 'ONE' }];
      fakeIpcRenderer.emit(
        UPDATE_BROADCAST_CHANNEL,
        { sender: fakeIpcRenderer },
        { entries }
      );
      await settled();
      expect(received).toEqual([{ entries }]);
    });
  });

  describe('the channel declarations', () => {
    it('puts the read channels on one wire name in both directions', () => {
      expect(assetImageChannel).toBeDefined();
      expect(assetMetadataChannel).toBeDefined();
      requestAssetImage(FIRST);
      requestAssetMetadata([FIRST]);
      expect(sent.map((message) => message.channel)).toEqual([
        IMAGE_CHANNEL,
        METADATA_CHANNEL,
      ]);
    });
  });
});
