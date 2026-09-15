import React from 'react';
import LoadingPage from '../../../../source/renderer/app/containers/loading/LoadingPage';
import { screenDecorator } from '../../_support/harness/ScreenStory';
import { backendPhase } from '../../_support/harness/storeDefaults';

/*
 * The first screen with nested containers, and the first real test of mounting
 * containers rather than components.
 *
 * `LoadingPage` renders nothing of its own. It picks one of three trees from
 * `backend.loadingPhase` and, on the third, layers an overlay chosen from
 * `networkStatus`. So a story here is not a fixture for one screen: whichever
 * branch it selects, the fixture has to satisfy every store the containers below
 * it read, and the deepest branch reaches four of them.
 *
 * Which is why the stories name a whole backend state rather than a phase. The
 * phase chooses the branch; the observables inside the state are what the
 * containers on that branch read.
 */
export default {
  title: 'Screens / Loading / Loading Page',
  decorators: [
    screenDecorator({
      backend: backendPhase.nodeStarting(),
      networkStatus: { isSynced: false, syncPercentage: 42 },
    }),
  ],
};

export const Default = {
  render: () => <LoadingPage />,
  name: 'Syncing',
};

export const ChainStorageSetup = {
  decorators: [screenDecorator({ backend: backendPhase.chainStorageSetup() })],
  render: () => <LoadingPage />,
  name: 'Choosing where the chain goes',
};

export const BootstrapDecision = {
  decorators: [screenDecorator({ backend: backendPhase.bootstrapDecision() })],
  render: () => <LoadingPage />,
  name: 'Offering the snapshot',
};

export const MithrilSyncing = {
  decorators: [screenDecorator({ backend: backendPhase.mithrilSyncing() })],
  render: () => <LoadingPage />,
  name: 'Downloading the snapshot',
};

/*
 * The two overlays sit on top of the syncing branch rather than replacing it, so
 * these stories carry the syncing fixture as well as the condition that raises
 * the overlay.
 */
export const NoDiskSpace = {
  decorators: [
    screenDecorator({
      backend: backendPhase.nodeStarting(),
      networkStatus: {
        isSynced: false,
        isNotEnoughDiskSpace: true,
        diskSpaceRequired: '2 GB',
        diskSpaceMissing: '1.2 GB',
        diskSpaceRecommended: '5 GB',
      },
    }),
  ],
  render: () => <LoadingPage />,
  name: 'Out of disk space',
};

export const SystemTimeError = {
  decorators: [
    screenDecorator({
      backend: backendPhase.nodeStarting(),
      networkStatus: {
        isSynced: false,
        isSystemTimeCorrect: false,
        localTimeDifference: 90 * 1000 * 1000,
      },
    }),
  ],
  render: () => <LoadingPage />,
  name: 'Machine clock out of step',
};
