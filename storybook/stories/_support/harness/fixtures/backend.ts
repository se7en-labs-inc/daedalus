import type {
  LoadingPhase,
  MithrilProgress,
} from '../../../../../source/common/types/watchdog.types';
import {
  ancillaryBytesTotal,
  customChainPath,
  defaultChainPath,
  snapshotFilesTotal,
  snapshotSize,
} from '../../../loading/_support/mithrilFixtures';

/*
 * BackendStore's observables, and the states a loading screen can be in.
 *
 * `loadingPhase` is the one field in the harness that a story must not set on
 * its own. In the store it is computed (BackendStore.ts:222-255) from six of the
 * observables below, and the screens read both: LoadingPage branches on the
 * phase while MithrilSyncContainer reads `mithrilPhase` and `lastError`
 * directly. A fixture that set the phase without the observables behind it would
 * put the two halves of that pair into states that cannot occur together, and
 * the story would show something the application cannot produce.
 *
 * So the states are named presets rather than fields. Each carries the
 * observables that cause the phase and the phase they cause, and a story picks
 * one whole rather than merging parts of it. The phase values here encode the
 * rule in BackendStore's getter; they are a second copy of it, and that is the
 * cost of not constructing a store.
 */

const noop = () => {};

// The store starts every one of these at the value below and fills them from the
// watchdog poll. Nothing derives from most of them, so they stay as declared.
const observableDefaults = {
  watchdogPid: 0,
  nodePid: 0,
  walletPid: 0,
  nodeStartedAt: null,
  walletStartedAt: null,
  walletRestartCount: 0,
  walletPort: null,
  hasChain: null,
  nodeStartupPhase: null,
  blockSyncProgress: {
    replayedBlock: 0,
    validatingChunk: 0,
    pushingLedger: 0,
  },
  mithrilPhase: null,
  mithrilProgress: null,
  lastError: null,
  walletUnrecoverable: false,
  nodeSocketWaitMs: null,
  walletReadyWaitMs: null,
  nodeForceKilled: false,
  lastWalletExitCode: null,
  lastWalletExitSignal: null,
  mithrilSignificantlyBehind: null,
  isStopping: false,
  defaultChainPath,
  customChainPath: null,
  chainPathConfirmed: false,
};

/*
 * The commands the loading screens send. Every one of them reaches the watchdog
 * over an ipc channel, so in a story they do nothing: a screen that offers to
 * start a Mithril download must be able to render the offer without a workbench
 * being able to accept it.
 */
const commands = {
  startMithril: noop,
  startMithrilForce: noop,
  startNode: noop,
  cancelMithril: noop,
  probeMithril: noop,
  dismissMithrilPrompt: noop,
  confirmStorageLocation: noop,
  validateChainStorageDirectory: () => Promise.resolve(null),
  setChainStorageDirectory: () => Promise.resolve(null),
  resetChainStorageDirectory: () => Promise.resolve(null),
};

const backendState = (
  loadingPhase: LoadingPhase,
  state: Record<string, unknown> = {}
) => ({
  ...observableDefaults,
  ...commands,
  mithrilPromptDismissed: false,
  ...state,
  loadingPhase,
});

// Mid-download, on the snapshot files rather than the ledger, using the same
// snapshot dimensions the component-level Mithril stories are built from.
export const mithrilProgressFixture: MithrilProgress = {
  filesDownloaded: Math.round(snapshotFilesTotal * 0.47),
  filesTotal: snapshotFilesTotal,
  bytesDownloaded: Math.round(snapshotSize * 0.47),
  bytesTotal: snapshotSize,
  secondsElapsed: 18 * 60,
  stepNum: 3,
  totalSteps: 7,
  phase: 'snapshot',
};

export const backendPhase = {
  // No chain_status from the watchdog yet, which is the first half-second of
  // every session.
  starting: () => backendState('starting', { hasChain: null }),

  // A machine with no chain, before the user has said where to keep it.
  chainStorageSetup: () =>
    backendState('chain-storage-setup', {
      hasChain: false,
      chainPathConfirmed: false,
      customChainPath,
    }),

  // Location settled, now asking whether to bootstrap from a Mithril snapshot.
  bootstrapDecision: () =>
    backendState('bootstrap-decision', {
      hasChain: false,
      chainPathConfirmed: true,
    }),

  // The snapshot download itself. `mithrilPhase` is what the sync container
  // branches on, so it is part of the state rather than decoration on it.
  mithrilSyncing: (mithrilPhase = 'downloading') =>
    backendState('mithril-syncing', {
      hasChain: false,
      chainPathConfirmed: true,
      mithrilPhase,
      mithrilProgress: mithrilProgressFixture,
    }),

  // The node is up and replaying the chain; the wallet has not opened its port.
  nodeStarting: (state: Record<string, unknown> = {}) =>
    backendState('node-starting', {
      hasChain: true,
      chainPathConfirmed: true,
      mithrilPhase: 'completed',
      nodeStartedAt: Date.now(),
      nodeStartupPhase: 'replaying',
      walletPort: null,
      ...state,
    }),

  // Everything up. This is the default, for the same reason networkStatus
  // defaults to connected: it is the state a screen is in for all but the first
  // seconds, and a screen that wants an earlier one says so.
  ready: () =>
    backendState('ready', {
      hasChain: true,
      chainPathConfirmed: true,
      mithrilPhase: 'completed',
      nodeStartedAt: Date.now(),
      walletStartedAt: Date.now(),
      walletPort: 8090,
      nodePid: 4242,
      walletPid: 4243,
      watchdogPid: 4241,
    }),

  // The wallet failed in a way a restart will not fix, which outranks every
  // other phase in the store's getter.
  error: (lastError = 'cardano-wallet exited with code 1') =>
    backendState('error', {
      hasChain: true,
      walletUnrecoverable: true,
      lastError,
      lastWalletExitCode: 1,
    }),
};

// A long chain replay, which is what makes the syncing screen offer Mithril to
// someone who is already running.
export const behindTheCertifiedTip = {
  localImmutableCount: 9800,
  latestCertifiedImmutable: 12400,
};

export { ancillaryBytesTotal, customChainPath, defaultChainPath };

export const backendDefaults = backendPhase.ready();
