import React from 'react';
import StoryDecorator from '../../_support/StoryDecorator';
import LoadingOverlayStoryFrame from '../_support/LoadingOverlayStoryFrame';
import { ManagedMithrilDecisionView } from '../_support/mithrilHarness';
import {
  inCategory,
  optionsFrom,
  radioOptionsFrom,
} from '../../_support/argTypes';
import {
  defaultChainPath,
  explicitSnapshot,
  latestSnapshot,
  snapshots,
} from '../_support/mithrilFixtures';

const snapshotPresetOptions = {
  None: 'none',
  Single: 'single',
  Multiple: 'multiple',
};

const snapshotSelectionOptions = {
  Latest: 'latest',
  'Explicit Snapshot': explicitSnapshot.digest,
};

export default {
  title: 'Loading / Mithril / Snapshot Picker',

  decorators: [
    (story) => (
      <StoryDecorator>
        <LoadingOverlayStoryFrame>{story()}</LoadingOverlayStoryFrame>
      </StoryDecorator>
    ),
  ],
};

const interactiveArgs = {
  snapshotPreset: 'multiple',
  selectedSnapshot: 'latest',
  isFetchingSnapshots: false,
  showCustomChainPath: true,
  customChainPath: '/mnt/fast-ssd/daedalus-chain',
  includeReturnToStorageAction: true,
};

export const InteractiveDecisionView = {
  args: interactiveArgs,

  argTypes: inCategory('Loading', interactiveArgs, {
    snapshotPreset: radioOptionsFrom(snapshotPresetOptions),
    selectedSnapshot: optionsFrom(snapshotSelectionOptions),
  }),

  render: ({
    snapshotPreset,
    selectedSnapshot,
    isFetchingSnapshots,
    showCustomChainPath,
    customChainPath,
    includeReturnToStorageAction,
  }) => {
    let availableSnapshots = snapshots;

    if (snapshotPreset === 'none') {
      availableSnapshots = [];
    } else if (snapshotPreset === 'single') {
      availableSnapshots = [latestSnapshot];
    }

    return (
      <ManagedMithrilDecisionView
        snapshots={availableSnapshots}
        selectedDigest={selectedSnapshot === 'latest' ? null : selectedSnapshot}
        isFetchingSnapshots={isFetchingSnapshots}
        customChainPath={showCustomChainPath ? customChainPath : null}
        defaultChainPath={defaultChainPath}
        includeReturnToStorageAction={includeReturnToStorageAction}
      />
    );
  },
};

export const LoadingSnapshots = () => (
  <ManagedMithrilDecisionView
    snapshots={[]}
    selectedDigest={null}
    isFetchingSnapshots
    customChainPath="/mnt/fast-ssd/daedalus-chain"
    defaultChainPath={defaultChainPath}
  />
);

export const NoSnapshotsAvailable = () => (
  <ManagedMithrilDecisionView
    snapshots={[]}
    selectedDigest={null}
    isFetchingSnapshots={false}
    customChainPath="/mnt/fast-ssd/daedalus-chain"
    defaultChainPath={defaultChainPath}
  />
);
