/**
 * The two request/response primitives driven side by side over real
 * `EventEmitter`s, which is what `ipcMain` and `ipcRenderer` are.
 *
 * The emitter is the point. A hand-written fake that walks a list of listeners
 * and calls one of them per message will let both primitives pass: it hides the
 * fact that `emit` runs every one-shot listener registered for a name, hands
 * each of them the same payload and unregisters all of them. That is the whole
 * difference between the two, so the harness here uses the real thing.
 */
import { EventEmitter } from 'events';
import { IpcChannel } from './IpcChannel';
import { IpcConversation } from './IpcConversation';

/** What both primitives expose, and all this suite asks of either. */
type RequestResponsePrimitive = {
  onRequest: (handler: (message: any) => Promise<any>, receiver: any) => void;
  request: (message: any, sender: any, receiver: any) => Promise<any>;
};

/**
 * Both primitives enforce one instance per channel name for the life of the
 * process, so every case names its own channel.
 */
let channelsCreated = 0;
const nextChannelName = () => {
  channelsCreated += 1;
  return `IpcConversationSpecChannel${channelsCreated}`;
};

type Wire = {
  /** Stands in for `ipcMain`: where the responder listens. */
  main: EventEmitter;
  /** Stands in for `ipcRenderer` as a receiver: where answers arrive. */
  renderer: EventEmitter;
  /** Stands in for `ipcRenderer` as a sender. */
  sender: { send: (channel: string, ...args: Array<any>) => void };
  /**
   * Everything the requester put on the wire. `IpcConversation` keeps the id it
   * minted inside the promise and exposes it nowhere, so a case that wants to
   * answer by hand reads it off the request that carried it.
   */
  sentToMain: Array<Array<any>>;
};

const createWire = (): Wire => {
  const main = new EventEmitter();
  const renderer = new EventEmitter();
  const sentToMain: Array<Array<any>> = [];
  // Ten concurrent requests are ten listeners, and the warning at eleven is
  // noise here rather than a finding.
  main.setMaxListeners(0);
  renderer.setMaxListeners(0);
  // What a responder replies through. Electron hands it to the handler as
  // `event.sender`; here it puts the message on the renderer's emitter.
  const replyToRenderer = {
    send: (channel: string, ...args: Array<any>) => {
      renderer.emit(channel, { sender: replyToRenderer }, ...args);
    },
  };
  return {
    main,
    renderer,
    sentToMain,
    sender: {
      send: (channel: string, ...args: Array<any>) => {
        sentToMain.push([channel, ...args]);
        main.emit(channel, { sender: replyToRenderer }, ...args);
      },
    },
  };
};

const SUBJECTS = Array.from({ length: 10 }, (_, index) => `subject-${index}`);

type Outcome = { settled: boolean; value: any };

/** One turn of the event loop, which is more than any reply here needs. */
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Ten requests issued before any of them is answered, then answered in reverse,
 * one at a time.
 *
 * Reverse order matters: a primitive that settles requests in arrival order is
 * right by accident when answers come back in the order they were asked for.
 * The responder parks on a gate per request rather than on a timer, so the case
 * asserts an order rather than hoping for one.
 */
const tenConcurrentRequests = async (
  channel: RequestResponsePrimitive,
  wire: Wire
): Promise<Array<Outcome>> => {
  const gates = new Map<string, () => void>();
  channel.onRequest(async (message: any) => {
    await new Promise<void>((release) => {
      gates.set(message.subject, release);
    });
    return { subject: message.subject };
  }, wire.main);

  const outcomes: Array<Outcome> = SUBJECTS.map(() => ({
    settled: false,
    value: null,
  }));
  SUBJECTS.forEach((subject, index) => {
    channel.request({ subject }, wire.sender, wire.renderer).then(
      (value) => {
        outcomes[index] = { settled: true, value };
      },
      (reason) => {
        outcomes[index] = { settled: true, value: reason };
      }
    );
  });
  expect(gates.size).toBe(SUBJECTS.length);

  const inReverse = [...SUBJECTS].reverse();
  for (const subject of inReverse) {
    gates.get(subject)();
    await tick();
  }
  return outcomes;
};

/** The property: ten requests, ten answers, each to the one that asked. */
const expectEveryRequestGotItsOwnResponse = (outcomes: Array<Outcome>) => {
  expect(outcomes.map((outcome) => outcome.settled)).toEqual(
    SUBJECTS.map(() => true)
  );
  expect(outcomes.map((outcome) => outcome.value?.subject)).toEqual(SUBJECTS);
};

describe('IpcConversation', () => {
  it('gives each of ten concurrent requests the answer to its own request', async () => {
    const name = nextChannelName();
    const wire = createWire();
    const outcomes = await tenConcurrentRequests(
      new IpcConversation(name),
      wire
    );

    expectEveryRequestGotItsOwnResponse(outcomes);
    // Each request took its own listener away and nobody else's.
    expect(wire.renderer.listenerCount(name)).toBe(0);
  });

  it('keeps waiting through a message carrying another conversation id', async () => {
    const name = nextChannelName();
    const wire = createWire();
    const channel = new IpcConversation(name);

    let settled = false;
    const pending = channel
      .request({ subject: 'mine' }, wire.sender, wire.renderer)
      .then((value) => {
        settled = true;
        return value;
      });

    wire.renderer.emit(
      name,
      { sender: wire.sender },
      'an-id-nobody-minted',
      true,
      { subject: 'not mine' }
    );
    await tick();
    expect(settled).toBe(false);
    // The stray message consumed nothing, so the real answer still has a
    // listener to arrive at.
    expect(wire.renderer.listenerCount(name)).toBe(1);

    const [, conversationId] = wire.sentToMain[0];
    wire.renderer.emit(name, { sender: wire.sender }, conversationId, true, {
      subject: 'mine',
    });
    await expect(pending).resolves.toEqual({ subject: 'mine' });
  });

  it('rejects with the payload when the responder reports failure', async () => {
    const name = nextChannelName();
    const wire = createWire();
    const channel = new IpcConversation(name);
    channel.onRequest(async () => {
      throw new Error('the handler fell over');
    }, wire.main);

    await expect(
      channel.request({ subject: 'mine' }, wire.sender, wire.renderer)
    ).rejects.toThrow('the handler fell over');
    expect(wire.renderer.listenerCount(name)).toBe(0);
  });
});

/**
 * The control. Without it the case above passes for any implementation, and
 * the absence of exactly this control is why a defect that had already been
 * written down was shipped and then found by looking at a wallet.
 */
describe('IpcChannel, the primitive IpcConversation replaces', () => {
  it('settles all ten concurrent requests on the first answer and drops the other nine', async () => {
    const name = nextChannelName();
    const wire = createWire();
    const outcomes = await tenConcurrentRequests(new IpcChannel(name), wire);

    // The same property, asserted the same way, against the other primitive.
    expect(() => expectEveryRequestGotItsOwnResponse(outcomes)).toThrow();

    // What happens instead: the first answer to arrive is for the request that
    // was released first, and every one of the ten one-shot listeners fires on
    // it with that one payload.
    expect(outcomes.every((outcome) => outcome.settled)).toBe(true);
    expect(outcomes.map((outcome) => outcome.value?.subject)).toEqual(
      SUBJECTS.map(() => 'subject-9')
    );

    // And every listener was unregistered by that one emit, so the nine answers
    // behind it arrived to nobody.
    expect(wire.renderer.listenerCount(`${name}-response`)).toBe(0);
  });

  it('consumes a one-shot listener on a message meant for another request', async () => {
    const name = nextChannelName();
    const wire = createWire();
    const channel = new IpcChannel(name);

    const pending = channel.request(
      { subject: 'mine' },
      wire.sender,
      wire.renderer
    );
    expect(wire.renderer.listenerCount(`${name}-response`)).toBe(1);

    wire.renderer.emit(`${name}-response`, { sender: wire.sender }, true, {
      subject: 'not mine',
    });
    // Nothing correlates, so the waiting request takes it.
    await expect(pending).resolves.toEqual({ subject: 'not mine' });
    expect(wire.renderer.listenerCount(`${name}-response`)).toBe(0);
  });
});
