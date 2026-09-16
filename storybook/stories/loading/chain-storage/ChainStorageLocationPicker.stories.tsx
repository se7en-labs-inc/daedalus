import React from 'react';
import StoryDecorator from '../../_support/StoryDecorator';
import LoadingOverlayStoryFrame from '../_support/LoadingOverlayStoryFrame';
import { ManagedChainStorageLocationPicker } from '../_support/mithrilHarness';
import { inCategory, optionsFrom } from '../../_support/argTypes';
import {
  defaultChainStorageValidation,
  defaultChainPath,
  snapshotSize,
  validationPresetOptions,
} from '../_support/mithrilFixtures';

export default {
  title: 'Loading / Chain Storage',

  decorators: [
    (story) => (
      <StoryDecorator>
        <LoadingOverlayStoryFrame>{story()}</LoadingOverlayStoryFrame>
      </StoryDecorator>
    ),
  ],
};

const interactiveArgs = {
  validationPreset: 'valid-custom',
  useCustomChainPath: true,
  customChainPath: '/mnt/fast-ssd/daedalus-chain',
  estimatedRequiredSpaceGiB: 82,
  availableSpaceGiB: 256,
  isChainStorageLoading: false,
};

const gibibytes = (value: number) => Math.round(value * 1024 * 1024 * 1024);

export const InteractivePicker = {
  args: interactiveArgs,

  argTypes: inCategory('Loading', interactiveArgs, {
    validationPreset: optionsFrom(validationPresetOptions),
  }),

  render: ({
    validationPreset,
    useCustomChainPath,
    customChainPath,
    estimatedRequiredSpaceGiB,
    availableSpaceGiB,
    isChainStorageLoading,
  }) => (
    <ManagedChainStorageLocationPicker
      customChainPath={useCustomChainPath ? customChainPath : null}
      defaultChainPath={defaultChainPath}
      validationPreset={validationPreset}
      estimatedRequiredSpaceBytes={gibibytes(estimatedRequiredSpaceGiB)}
      availableSpaceBytes={gibibytes(availableSpaceGiB)}
      isChainStorageLoading={isChainStorageLoading}
    />
  ),
};

export const InvalidCurrentPath = () => (
  <ManagedChainStorageLocationPicker
    customChainPath="/mnt/slow-disk/daedalus-chain"
    defaultChainPath={defaultChainPath}
    validationPreset="insufficient-space"
    estimatedRequiredSpaceBytes={snapshotSize}
    availableSpaceBytes={32 * 1024 * 1024 * 1024}
  />
);

export const BusyState = () => (
  <ManagedChainStorageLocationPicker
    customChainPath="/mnt/fast-ssd/daedalus-chain"
    defaultChainPath={defaultChainPath}
    validationPreset="valid-custom"
    estimatedRequiredSpaceBytes={snapshotSize}
    availableSpaceBytes={256 * 1024 * 1024 * 1024}
    isChainStorageLoading
  />
);

export const RecoveryFallback = () => (
  <ManagedChainStorageLocationPicker
    customChainPath={null}
    defaultChainPath={defaultChainPath}
    validationPreset="valid-default"
    estimatedRequiredSpaceBytes={snapshotSize}
    availableSpaceBytes={256 * 1024 * 1024 * 1024}
    isRecoveryFallback
  />
);

export const DataFound = () => (
  <ManagedChainStorageLocationPicker
    customChainPath="/mnt/fast-ssd/daedalus-chain"
    defaultChainPath={defaultChainPath}
    validationPreset="existing-directory"
    estimatedRequiredSpaceBytes={snapshotSize}
    availableSpaceBytes={256 * 1024 * 1024 * 1024}
  />
);

export const RecoveryDataFound = {
  render: () => (
    <ManagedChainStorageLocationPicker
      customChainPath={null}
      defaultChainPath={defaultChainPath}
      validationPreset="valid-default"
      defaultChainStorageValidation={{
        ...defaultChainStorageValidation,
        chainSubdirectoryStatus: 'existing-directory',
      }}
      estimatedRequiredSpaceBytes={snapshotSize}
      availableSpaceBytes={256 * 1024 * 1024 * 1024}
      isRecoveryFallback
    />
  ),

  name: 'Recovery + Data Found',
};
