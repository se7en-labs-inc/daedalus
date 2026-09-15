import React from 'react';
import type { MithrilBootstrapStatus } from '../../../../source/common/types/watchdog.types';
import MithrilProgressView from '../../../../source/renderer/app/components/loading/mithril/MithrilProgressView';
import StoryDecorator from '../../_support/StoryDecorator';
import LoadingOverlayStoryFrame from '../_support/LoadingOverlayStoryFrame';
import {
  inCategory,
  radioOptionsFrom,
  rangeFrom,
} from '../../_support/argTypes';
import {
  ancillaryBytesTotal,
  bootstrapActions,
  createBootstrapStartedAt,
  getBootstrapProgressItems,
  snapshotFilesTotal,
  snapshotSize,
} from '../_support/mithrilFixtures';

const statusOptions: Record<string, MithrilBootstrapStatus> = {
  Preparing: 'preparing',
  Downloading: 'downloading',
  Verifying: 'verifying',
  Converting: 'converting',
  Unpacking: 'unpacking',
  Finalizing: 'finalizing',
  'Starting Node': 'starting-node',
};

const percentRange = { min: 0, max: 100, step: 1 };

const interactiveArgs = {
  status: 'downloading',
  snapshotDownloadPercent: 47,
  ancillaryPercent: 62,
  elapsedMinutes: 18,
};

export default {
  title: 'Loading / Mithril / Progress',

  decorators: [
    (story) => (
      <StoryDecorator>
        <LoadingOverlayStoryFrame>{story()}</LoadingOverlayStoryFrame>
      </StoryDecorator>
    ),
  ],
};

export const InteractiveWorkingState = {
  args: interactiveArgs,

  argTypes: inCategory('Loading', interactiveArgs, {
    status: radioOptionsFrom(statusOptions),
    snapshotDownloadPercent: rangeFrom(percentRange),
    ancillaryPercent: rangeFrom(percentRange),
    elapsedMinutes: rangeFrom({ min: 0, max: 180, step: 1 }),
  }),

  render: ({
    status,
    snapshotDownloadPercent,
    ancillaryPercent,
    elapsedMinutes,
  }) => (
    <MithrilProgressView
      status={status}
      progressItems={getBootstrapProgressItems(status)}
      filesDownloaded={Math.round(
        snapshotFilesTotal * (snapshotDownloadPercent / 100)
      )}
      filesTotal={snapshotFilesTotal}
      snapshotSizeBytes={snapshotSize}
      ancillaryBytesDownloaded={Math.round(
        ancillaryBytesTotal * (ancillaryPercent / 100)
      )}
      ancillaryBytesTotal={ancillaryBytesTotal}
      ancillaryProgress={ancillaryPercent}
      bootstrapStartedAt={createBootstrapStartedAt(elapsedMinutes)}
      onAction={() => bootstrapActions.onCancel()}
    />
  ),
};

export const _Preparing = () => (
  <MithrilProgressView
    status="preparing"
    progressItems={getBootstrapProgressItems('preparing')}
    snapshotSizeBytes={snapshotSize}
    bootstrapStartedAt={createBootstrapStartedAt(4)}
    onAction={() => bootstrapActions.onCancel()}
  />
);

export const StartingNodeHandoff = () => (
  <MithrilProgressView
    status="starting-node"
    progressItems={getBootstrapProgressItems('starting-node')}
    filesDownloaded={snapshotFilesTotal}
    filesTotal={snapshotFilesTotal}
    snapshotSizeBytes={snapshotSize}
    ancillaryBytesDownloaded={ancillaryBytesTotal}
    ancillaryBytesTotal={ancillaryBytesTotal}
    ancillaryProgress={100}
    bootstrapStartedAt={createBootstrapStartedAt(24)}
    onAction={() => bootstrapActions.onCancel()}
  />
);
