import React from 'react';
import MithrilSyncContainer from '../../../../source/renderer/app/containers/loading/MithrilSyncContainer';
import { screenDecorator } from '../../_support/harness/ScreenStory';
import { backendPhase } from '../../_support/harness/storeDefaults';

/*
 * One container, three views, chosen by two fields rather than one: the decision
 * view on `loadingPhase`, the error view on `mithrilPhase`, and the progress
 * view for everything else. Each story takes a whole backend state so the two
 * fields agree, which is what keeps a progress view from claiming a download
 * that is not running.
 */
export default {
  title: 'Screens / Loading / Mithril Sync',
  decorators: [screenDecorator({ backend: backendPhase.mithrilSyncing() })],
};

export const BootstrapDecision = {
  decorators: [screenDecorator({ backend: backendPhase.bootstrapDecision() })],
  render: () => <MithrilSyncContainer />,
  name: 'Offering the snapshot',
};

export const Downloading = {
  render: () => <MithrilSyncContainer />,
  name: 'Downloading the snapshot',
};

/*
 * `verifying` is the ledger phase rather than the snapshot one, and the
 * container routes the same byte counters to a different pair of props for it.
 * The two states look alike in the fixture and different on screen.
 */
export const Verifying = {
  decorators: [
    screenDecorator({ backend: backendPhase.mithrilSyncing('verifying') }),
  ],
  render: () => <MithrilSyncContainer />,
  name: 'Verifying the ledger',
};

export const Failed = {
  decorators: [
    screenDecorator({
      backend: {
        ...backendPhase.mithrilSyncing('error'),
        lastError: 'Snapshot download stalled after repeated retries.',
      },
    }),
  ],
  render: () => <MithrilSyncContainer />,
  name: 'Download failed',
};
