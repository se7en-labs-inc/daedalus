import React from 'react';
import type { MithrilBootstrapStatus } from '../../../../source/common/types/watchdog.types';
import StoryDecorator from '../../_support/StoryDecorator';
import { ManagedMithrilBootstrap } from '../_support/mithrilHarness';
import {
  inCategory,
  optionsFrom,
  radioOptionsFrom,
  rangeFrom,
} from '../../_support/argTypes';
import {
  ancillaryBytesTotal,
  createBootstrapStartedAt,
  defaultChainPath,
  defaultChainStorageValidation,
  errorStageOptions,
  explicitSnapshot,
  getBootstrapProgressItems,
  getErrorPreset,
  latestSnapshot,
  snapshotFilesTotal,
  snapshotSize,
  snapshots,
  validationPresetOptions,
} from '../_support/mithrilFixtures';

const statusOptions: Record<string, MithrilBootstrapStatus> = {
  Decision: 'decision',
  Preparing: 'preparing',
  Downloading: 'downloading',
  Verifying: 'verifying',
  Converting: 'converting',
  Unpacking: 'unpacking',
  Finalizing: 'finalizing',
  'Starting Node': 'starting-node',
  Failed: 'failed',
  Cancelled: 'cancelled',
};

const snapshotSelectionOptions = {
  Latest: 'latest',
  'Explicit Snapshot': explicitSnapshot.digest,
};

const percentRange = { min: 0, max: 100, step: 1 };

// customChainPath was a two-option select rather than a text control: the empty
// option stood for no custom path at all.
const chainPathOptions = {
  Default: '',
  Custom: '/mnt/fast-ssd/daedalus-chain',
};

const interactiveArgs = {
  status: 'decision',
  chainStorageValidationPreset: 'valid-custom',
  errorStage: 'download',
  selectedSnapshot: 'latest',
  snapshotDownloadPercent: 47,
  ancillaryPercent: 62,
  elapsedMinutes: 18,
  storageLocationConfirmed: true,
  customChainPath: chainPathOptions.Custom,
  isFetchingSnapshots: false,
  availableSpaceGiB: 256,
  isChainStorageLoading: false,
};

export default {
  title: 'Loading / Mithril / Bootstrap',

  decorators: [(story) => <StoryDecorator>{story()}</StoryDecorator>],
};

export const InteractiveShell = {
  args: interactiveArgs,

  argTypes: inCategory('Loading', interactiveArgs, {
    status: radioOptionsFrom(statusOptions),
    chainStorageValidationPreset: optionsFrom(validationPresetOptions),
    errorStage: optionsFrom(errorStageOptions),
    selectedSnapshot: optionsFrom(snapshotSelectionOptions),
    customChainPath: optionsFrom(chainPathOptions),
    snapshotDownloadPercent: rangeFrom(percentRange),
    ancillaryPercent: rangeFrom(percentRange),
    elapsedMinutes: rangeFrom({ min: 0, max: 180, step: 1 }),
  }),

  render: ({
    status,
    chainStorageValidationPreset,
    errorStage,
    selectedSnapshot,
    snapshotDownloadPercent,
    ancillaryPercent,
    elapsedMinutes,
    storageLocationConfirmed,
    customChainPath,
    isFetchingSnapshots,
    availableSpaceGiB,
    isChainStorageLoading,
  }) => (
    <ManagedMithrilBootstrap
      status={status}
      snapshots={snapshots}
      selectedDigest={selectedSnapshot === 'latest' ? null : selectedSnapshot}
      initialStorageLocationConfirmed={storageLocationConfirmed}
      customChainPath={customChainPath || null}
      defaultChainPath={defaultChainPath}
      defaultChainStorageValidation={defaultChainStorageValidation}
      latestSnapshotSize={snapshotSize}
      isFetchingSnapshots={isFetchingSnapshots}
      validationPreset={chainStorageValidationPreset}
      availableSpaceBytes={Math.round(availableSpaceGiB * 1024 * 1024 * 1024)}
      isChainStorageLoading={isChainStorageLoading}
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
      progressItems={getBootstrapProgressItems(status)}
      bootstrapStartedAt={createBootstrapStartedAt(elapsedMinutes)}
      error={getErrorPreset(errorStage)}
    />
  ),
};

export const StorageToDecisionRouting = () => (
  <ManagedMithrilBootstrap
    status="decision"
    snapshots={snapshots}
    selectedDigest={latestSnapshot.digest}
    initialStorageLocationConfirmed={false}
    customChainPath="/mnt/fast-ssd/daedalus-chain"
    defaultChainPath={defaultChainPath}
    defaultChainStorageValidation={defaultChainStorageValidation}
    latestSnapshotSize={snapshotSize}
    isFetchingSnapshots={false}
    validationPreset="valid-custom"
    availableSpaceBytes={256 * 1024 * 1024 * 1024}
  />
);
