import React from 'react';
import { action } from '@storybook/addon-actions';
import type {
  MithrilPartialSyncError,
  MithrilPartialSyncStatus,
  MithrilProgressItem,
} from '../../../../source/common/types/watchdog.types';
import MithrilSyncOverlay from '../../../../source/renderer/app/components/loading/mithril/MithrilSyncOverlay';
import StoryDecorator from '../../_support/StoryDecorator';
import LoadingOverlayStoryFrame from '../_support/LoadingOverlayStoryFrame';
import {
  inCategory,
  optionsFrom,
  radioOptionsFrom,
} from '../../_support/argTypes';

// The partial-sync service emits one cumulative progress item per stage, in
// this order, with label always equal to the id (the renderer's
// MithrilStepIndicator owns the user-facing copy, keyed by id). Stories must
// send this wire format so a missing id→copy mapping fails loudly as a raw id.
const PARTIAL_SYNC_STAGES = [
  'preparing',
  'downloading',
  'verifying',
  'converting',
  'installing',
  'finalizing',
] as const;

type PartialSyncStage = (typeof PARTIAL_SYNC_STAGES)[number];

const getStageItems = (
  reachedStage: PartialSyncStage,
  reachedState: MithrilProgressItem['state']
): Array<MithrilProgressItem> => {
  const reachedIndex = PARTIAL_SYNC_STAGES.indexOf(reachedStage);
  return PARTIAL_SYNC_STAGES.slice(0, reachedIndex + 1).map((stage, index) => ({
    id: stage,
    label: stage,
    state: index < reachedIndex ? ('completed' as const) : reachedState,
  }));
};

const isPartialSyncStage = (value: string): value is PartialSyncStage =>
  (PARTIAL_SYNC_STAGES as ReadonlyArray<string>).includes(value);

// Mirrors the backend's per-status item state: nothing before start(),
// stage-cumulative while working, carried forward unchanged into
// starting-node/completed, the reached stage marked error on failure, a lone
// cleanup item while cancelling, and reset to empty on cancelled.
const getProgressItemsForStory = (
  status: MithrilPartialSyncStatus,
  error?: MithrilPartialSyncError | null
): Array<MithrilProgressItem> => {
  if (status === 'stopping-node' || status === 'cancelled') {
    return [];
  }
  if (status === 'cancelling') {
    return [{ id: 'cleanup', label: 'cleanup', state: 'active' }];
  }
  if (status === 'starting-node' || status === 'completed') {
    return getStageItems('finalizing', 'active');
  }
  if (status === 'failed') {
    const stage =
      error?.stage && isPartialSyncStage(error.stage)
        ? error.stage
        : 'preparing';
    return getStageItems(stage, 'error');
  }
  if (isPartialSyncStage(status)) {
    return getStageItems(status, 'active');
  }
  return [];
};

const cancelledError: MithrilPartialSyncError = {
  stage: 'preparing',
  message:
    'Partial sync stopped before live chain data was replaced. Your existing database is still available for the selected recovery actions.',
  logPath:
    '/home/ada/.local/share/Daedalus/mainnet/Logs/mithril-partial-sync.log',
};

const restartAllowedError: MithrilPartialSyncError = {
  stage: 'verifying',
  message:
    'Verification failed before cutover completed, so Daedalus can safely retry Mithril Sync or restart Cardano node normally on the current database.',
  logPath:
    '/home/ada/.local/share/Daedalus/mainnet/Logs/mithril-partial-sync.log',
};

const wipeOnlyError: MithrilPartialSyncError = {
  stage: 'starting-node',
  message:
    'The staged database was installed but the first Cardano node start did not succeed, so Daedalus must keep recovery on the wipe-and-full-sync path.',
  logPath: '/home/ada/.local/share/Daedalus/mainnet/Logs/cardano-node.log',
};

// Per-stage failure fixtures. Codes resolve through partialSyncErrorCopy.ts:
// downloading/converting/installing map to bespoke title+hint copy by code;
// finalizing carries no code and `finalizing` is absent from COPY_BY_STAGE,
// so it exercises the generic FAILED fallthrough.
const downloadingError: MithrilPartialSyncError = {
  stage: 'downloading',
  code: 'PARTIAL_SYNC_DOWNLOAD_COMMAND_FAILED',
  message:
    'Downloading verified Mithril data failed before any chain data was replaced, so your current database is still intact.',
  logPath:
    '/home/ada/.local/share/Daedalus/mainnet/Logs/mithril-partial-sync.log',
};

const convertingError: MithrilPartialSyncError = {
  stage: 'converting',
  code: 'PARTIAL_SYNC_CONVERSION_FAILED',
  message:
    'Converting the downloaded snapshot failed before cutover completed, so your current database is still intact.',
  logPath:
    '/home/ada/.local/share/Daedalus/mainnet/Logs/mithril-partial-sync.log',
};

const installingError: MithrilPartialSyncError = {
  stage: 'installing',
  code: 'PARTIAL_SYNC_STAGED_DB_INVALID',
  message:
    'The staged database failed its integrity check during installation, so Daedalus stopped before replacing your current data.',
  logPath:
    '/home/ada/.local/share/Daedalus/mainnet/Logs/mithril-partial-sync.log',
};

const finalizingError: MithrilPartialSyncError = {
  stage: 'finalizing',
  message:
    'Finalizing the restored database failed, so Daedalus kept your previous chain data in place.',
  logPath:
    '/home/ada/.local/share/Daedalus/mainnet/Logs/mithril-partial-sync.log',
};

const baseProps = {
  filesDownloaded: 7,
  filesTotal: 9,
  elapsedSeconds: 645,
  ancillaryBytesDownloaded: 850 * 1024 * 1024,
  ancillaryBytesTotal: 2200 * 1024 * 1024,
  error: null,
  canRetry: false,
  canRestartNormally: false,
  canWipeAndFullSync: false,
  onCancel: action('onCancel'),
  onRetry: action('onRetry'),
  onRestartNormally: action('onRestartNormally'),
  onWipeAndFullSync: action('onWipeAndFullSync'),
  onDismissCompleted: action('onDismissCompleted'),
  onQuit: action('onQuit'),
  onOpenExternalLink: action('onOpenExternalLink'),
};

interface StoryProps {
  status: MithrilPartialSyncStatus;
  error?: MithrilPartialSyncError | null;
  canRetry?: boolean;
  canRestartNormally?: boolean;
  canWipeAndFullSync?: boolean;
  filesDownloaded?: number;
  filesTotal?: number;
  elapsedSeconds?: number;
  ancillaryComplete?: boolean;
  onDismissCompleted?: () => void | Promise<void>;
}

function MithrilPartialSyncOverlayStory(props: StoryProps) {
  const { ancillaryBytesTotal } = baseProps;
  const error = props.error || null;

  return (
    <MithrilSyncOverlay
      {...baseProps}
      flowType="partial-sync"
      status={props.status}
      error={error as any}
      canRetry={props.canRetry || false}
      canRestartNormally={props.canRestartNormally || false}
      canWipeAndFullSync={props.canWipeAndFullSync || false}
      onDismissCompleted={
        props.onDismissCompleted || baseProps.onDismissCompleted
      }
      // The real store pins startedAt once per run and the progress view ticks
      // its own timer from it; wiring the knob through startedAt (instead of
      // the wire-only transferProgress.elapsedSeconds, which the overlay
      // ignores) reproduces the live ticking timer.
      startedAt={
        Date.now() - (props.elapsedSeconds ?? baseProps.elapsedSeconds) * 1000
      }
      filesDownloaded={props.filesDownloaded ?? baseProps.filesDownloaded}
      filesTotal={props.filesTotal ?? baseProps.filesTotal}
      ancillaryBytesDownloaded={
        props.ancillaryComplete
          ? ancillaryBytesTotal
          : baseProps.ancillaryBytesDownloaded
      }
      ancillaryBytesTotal={ancillaryBytesTotal}
      progressItems={getProgressItemsForStory(props.status, error)}
    />
  );
}

const interactiveStatusOptions: Record<string, MithrilPartialSyncStatus> = {
  'Stopping Node': 'stopping-node',
  Cancelling: 'cancelling',
  Preparing: 'preparing',
  Downloading: 'downloading',
  Verifying: 'verifying',
  Converting: 'converting',
  Installing: 'installing',
  Finalizing: 'finalizing',
  'Starting Node': 'starting-node',
  Completed: 'completed',
  Failed: 'failed',
  Cancelled: 'cancelled',
};

const interactiveErrorPresets: Record<string, MithrilPartialSyncError | null> =
  {
    none: null,
    cancelled: cancelledError,
    'restart-allowed': restartAllowedError,
    'wipe-only': wipeOnlyError,
    downloading: downloadingError,
    converting: convertingError,
    installing: installingError,
    finalizing: finalizingError,
  };

const interactiveErrorOptions = {
  None: 'none',
  Cancelled: 'cancelled',
  'Restart Allowed': 'restart-allowed',
  'Wipe Only': 'wipe-only',
  Downloading: 'downloading',
  Converting: 'converting',
  Installing: 'installing',
  Finalizing: 'finalizing',
};

// The file count and the elapsed time were controls on every story in this
// panel, because the component they share registered them. A knob took its
// default from the story that rendered it, so the three that differ carry their
// own values and the rest take the meta's.
const overlayArgs = {
  elapsedSeconds: baseProps.elapsedSeconds,
  filesDownloaded: baseProps.filesDownloaded,
  filesTotal: baseProps.filesTotal,
};

const completedArgs = {
  elapsedSeconds: 845,
  filesDownloaded: 9,
  filesTotal: 9,
};

export default {
  title: 'Loading / Mithril / Partial Sync Overlay',
  args: overlayArgs,
  argTypes: inCategory('Loading', overlayArgs),

  decorators: [
    (story) => (
      <StoryDecorator>
        <LoadingOverlayStoryFrame>{story()}</LoadingOverlayStoryFrame>
      </StoryDecorator>
    ),
  ],
};

const interactiveArgs = {
  status: 'converting',
  errorPreset: 'none',
  canRetry: false,
  canRestartNormally: false,
  canWipeAndFullSync: false,
};

export const Interactive = {
  args: interactiveArgs,

  argTypes: inCategory('Loading', interactiveArgs, {
    status: radioOptionsFrom(interactiveStatusOptions),
    errorPreset: optionsFrom(interactiveErrorOptions),
  }),

  render: ({ errorPreset, status, ...args }) => (
    <MithrilPartialSyncOverlayStory
      {...args}
      status={status}
      error={interactiveErrorPresets[errorPreset]}
    />
  ),
};

export const ActiveProgress = {
  render: (args) => (
    <MithrilPartialSyncOverlayStory {...args} status="converting" />
  ),
};

export const _Cancelled = {
  render: (args) => (
    <MithrilPartialSyncOverlayStory
      {...args}
      status="cancelled"
      error={cancelledError}
      canRetry
      canRestartNormally
    />
  ),
};

export const _Cancelling = {
  render: (args) => (
    <MithrilPartialSyncOverlayStory {...args} status="cancelling" />
  ),
};

export const FailedWithRestartAllowed = {
  render: (args) => (
    <MithrilPartialSyncOverlayStory
      {...args}
      status="failed"
      error={restartAllowedError}
      canRetry
      canRestartNormally
    />
  ),
};

export const FailedWithWipeOnlyRecovery = {
  render: (args) => (
    <MithrilPartialSyncOverlayStory
      {...args}
      status="failed"
      error={wipeOnlyError}
      canWipeAndFullSync
    />
  ),

  name: 'Failed With Wipe-Only Recovery',
};

export const _Completed = {
  args: completedArgs,

  render: (args) => (
    <MithrilPartialSyncOverlayStory
      {...args}
      status="completed"
      ancillaryComplete
    />
  ),
};

export const DownloadingFileCount = {
  args: { filesDownloaded: 4, filesTotal: 9 },

  render: (args) => (
    <MithrilPartialSyncOverlayStory {...args} status="downloading" />
  ),
};

export const DownloadProgressBarPartial = {
  args: { filesDownloaded: 6, filesTotal: 9 },

  render: (args) => (
    <MithrilPartialSyncOverlayStory {...args} status="downloading" />
  ),

  name: 'Download Progress Bar (Partial)',
};

export const StoppingNode = {
  render: (args) => (
    <MithrilPartialSyncOverlayStory {...args} status="stopping-node" />
  ),
};

export const FailedDownloadingAllRecoveryActions = {
  render: (args) => (
    <MithrilPartialSyncOverlayStory
      {...args}
      status="failed"
      error={downloadingError}
      canRetry
      canRestartNormally
      canWipeAndFullSync
    />
  ),

  name: 'Failed - Downloading (All Recovery Actions)',
};

export const FailedConvertingAllRecoveryActions = {
  render: (args) => (
    <MithrilPartialSyncOverlayStory
      {...args}
      status="failed"
      error={convertingError}
      canRetry
      canRestartNormally
      canWipeAndFullSync
    />
  ),

  name: 'Failed - Converting (All Recovery Actions)',
};

export const FailedInstallingAllRecoveryActions = {
  render: (args) => (
    <MithrilPartialSyncOverlayStory
      {...args}
      status="failed"
      error={installingError}
      canRetry
      canRestartNormally
      canWipeAndFullSync
    />
  ),

  name: 'Failed - Installing (All Recovery Actions)',
};

export const FailedFinalizingAllRecoveryActions = {
  render: (args) => (
    <MithrilPartialSyncOverlayStory
      {...args}
      status="failed"
      error={finalizingError}
      canRetry
      canRestartNormally
      canWipeAndFullSync
    />
  ),

  name: 'Failed - Finalizing (All Recovery Actions)',
};

export const CompletedFinalizeFailedAutoPlays = {
  render: (args) => (
    <MithrilPartialSyncOverlayStory
      {...args}
      status="completed"
      ancillaryComplete
      onDismissCompleted={() => {
        action('onDismissCompleted')();
        return Promise.reject(new Error('finalize failed'));
      }}
    />
  ),

  name: 'Completed - Finalize Failed (auto-plays)',
};
