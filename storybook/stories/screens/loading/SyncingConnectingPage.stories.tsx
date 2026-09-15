import React from 'react';
import SyncingConnectingPage from '../../../../source/renderer/app/containers/loading/SyncingConnectingPage';
import { screenDecorator } from '../../_support/harness/ScreenStory';
import { backendPhase } from '../../_support/harness/storeDefaults';
import { behindTheCertifiedTip } from '../../_support/harness/fixtures/backend';

/*
 * The screen a user watches for as long as the chain takes. It reads six stores,
 * and the harness default has the node connected and synced, which is the state
 * in which this screen is on its way out. Each story therefore says which part
 * of the climb it shows.
 */
export default {
  title: 'Screens / Loading / Syncing and Connecting',
  decorators: [
    screenDecorator({
      backend: backendPhase.nodeStarting(),
      networkStatus: { isSynced: false, syncPercentage: 42 },
    }),
  ],
};

export const Default = {
  render: () => <SyncingConnectingPage />,
  name: 'Syncing the chain',
};

export const Connecting = {
  // Before the node answers at all, which is the first screen after launch.
  decorators: [
    screenDecorator({
      backend: backendPhase.starting(),
      networkStatus: {
        isConnected: false,
        isSynced: false,
        isNodeResponding: false,
        isNodeSyncing: false,
        hasBeenConnected: false,
        syncPercentage: 0,
      },
    }),
  ],
  render: () => <SyncingConnectingPage />,
  name: 'Connecting to the node',
};

/*
 * The Mithril offer made to someone already running. It appears when the node is
 * far enough behind the certified tip, or when a long chain replay is under way,
 * and it is dismissible, so `mithrilPromptDismissed` is part of the state that
 * decides it.
 */
export const MithrilOffer = {
  decorators: [
    screenDecorator({
      backend: backendPhase.nodeStarting({
        mithrilSignificantlyBehind: behindTheCertifiedTip,
      }),
      networkStatus: { isSynced: false, syncPercentage: 42 },
    }),
  ],
  render: () => <SyncingConnectingPage />,
  name: 'Offering Mithril to a running node',
};

/*
 * A long replay, which is the other way the offer appears: the node is up and
 * the wallet is not, and the block counters say it will be a while.
 */
export const LongReplay = {
  decorators: [
    screenDecorator({
      backend: backendPhase.nodeStarting({
        blockSyncProgress: {
          replayedBlock: 38,
          validatingChunk: 0,
          pushingLedger: 0,
        },
      }),
      networkStatus: { isSynced: false, syncPercentage: 12 },
    }),
  ],
  render: () => <SyncingConnectingPage />,
  name: 'Replaying the chain',
};
