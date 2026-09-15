import React from 'react';
import { linkTo } from '@storybook/addon-links';
import { action } from '@storybook/addon-actions';
import SyncingConnecting from '../../../../../source/renderer/app/components/loading/syncing-connecting/SyncingConnecting';
import {
  BlockSyncType,
  CardanoNodeStates,
} from '../../../../../source/common/types/cardano-node.types';

// The three progress values were one knob helper called three times, so every
// story in this panel carried all three controls. They belong on the panel's
// meta for the same reason.
export const blockSyncProgressArgs = {
  verifyingBlockchainState: 100,
  replayingLedger: 99,
  syncingBlockchain: 0,
};

export const percentRange = { min: 0, max: 100, step: 1 };

const toBlockSyncProgress = ({
  verifyingBlockchainState,
  replayingLedger,
  syncingBlockchain,
}) => ({
  [BlockSyncType.validatingChunk]: verifyingBlockchainState,
  [BlockSyncType.replayedBlock]: replayingLedger,
  [BlockSyncType.pushingLedger]: syncingBlockchain,
});

export const defaultSyncingConnectingArgs = {
  isVerifyingBlockchain: false,
  cardanoNodeState: CardanoNodeStates.STARTING,
  hasBeenConnected: false,
  isConnected: false,
  isSynced: false,
  isConnecting: true,
  isSyncing: false,
  isSyncProgressStalling: false,
  isNodeStopping: false,
  isNodeStopped: false,
  isTlsCertInvalid: false,
  hasLoadedCurrentLocale: true,
  hasLoadedCurrentTheme: true,
  isCheckingSystemTime: false,
  isNodeResponding: false,
  isNodeSubscribed: false,
  isNodeSyncing: false,
  isNodeTimeCorrect: true,
  isNewAppVersionLoaded: false,
  disableDownloadLogs: true,
  isPartialSyncEnabled: false,
};

export const connectivityIssuesArgs = {
  disableDownloadLogs: false,
};

export function DefaultSyncingConnectingStory(args) {
  return (
    <SyncingConnecting
      hasNotification={false}
      hasUpdate={false}
      isVerifyingBlockchain={args.isVerifyingBlockchain}
      // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
      verificationProgress={0}
      // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
      hasUnreadAlerts={false}
      hasUnreadAnnouncements={false}
      hasUnreadNews={false}
      onToggleNewsFeedIconClick={action('onToggleNewsFeedIconClick')}
      cardanoNodeState={args.cardanoNodeState}
      hasBeenConnected={args.hasBeenConnected}
      isConnected={args.isConnected}
      isSynced={args.isSynced}
      isConnecting={args.isConnecting}
      isSyncing={args.isSyncing}
      isSyncProgressStalling={args.isSyncProgressStalling}
      isNodeStopping={args.isNodeStopping}
      isNodeStopped={args.isNodeStopped}
      isTlsCertInvalid={args.isTlsCertInvalid}
      hasLoadedCurrentLocale={args.hasLoadedCurrentLocale}
      hasLoadedCurrentTheme={args.hasLoadedCurrentTheme}
      isCheckingSystemTime={args.isCheckingSystemTime}
      isNodeResponding={args.isNodeResponding}
      isNodeSubscribed={args.isNodeSubscribed}
      isNodeSyncing={args.isNodeSyncing}
      isNodeTimeCorrect={args.isNodeTimeCorrect}
      isNewAppVersionLoaded={args.isNewAppVersionLoaded}
      onIssueClick={action('onIssueClick')}
      onOpenExternalLink={action('onOpenExternalLink')}
      onDownloadLogs={action('onDownloadLogs')}
      onGetAvailableVersions={action('onGetAvailableVersions')}
      onStatusIconClick={linkTo('Diagnostics', () => 'default')}
      disableDownloadLogs={args.disableDownloadLogs}
      showNewsFeedIcon
      blockSyncProgress={toBlockSyncProgress(args)}
      isPartialSyncEnabled={args.isPartialSyncEnabled}
      onMithrilSync={action('onMithrilSync')}
    />
  );
}
export function ConnectivityIssuesSyncingConnectingStory(args) {
  return (
    <SyncingConnecting
      hasNotification={false}
      hasUpdate={false}
      isVerifyingBlockchain={false}
      blockSyncProgress={toBlockSyncProgress(args)}
      // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
      hasUnreadAlerts={false}
      hasUnreadAnnouncements={false}
      hasUnreadNews={false}
      onToggleNewsFeedIconClick={action('onToggleNewsFeedIconClick')}
      forceConnectivityIssue
      isConnected={false}
      cardanoNodeState={CardanoNodeStates.RUNNING}
      hasBeenConnected
      isSynced={false}
      isConnecting
      isSyncing={false}
      isSyncProgressStalling={false}
      isNodeStopping={false}
      isNodeStopped={false}
      isTlsCertInvalid={false}
      hasLoadedCurrentLocale
      hasLoadedCurrentTheme
      isCheckingSystemTime={false}
      isNodeResponding
      isNodeSubscribed={false}
      isNodeSyncing={false}
      isNodeTimeCorrect
      isNewAppVersionLoaded
      onIssueClick={action('onIssueClick')}
      onOpenExternalLink={action('onOpenExternalLink')}
      onDownloadLogs={action('onDownloadLogs')}
      onGetAvailableVersions={action('onGetAvailableVersions')}
      onStatusIconClick={linkTo('Diagnostics', () => 'default')}
      disableDownloadLogs={args.disableDownloadLogs}
      showNewsFeedIcon
    />
  );
}
export function LoadingWalletDataSyncingConnectingStory(args) {
  return (
    <SyncingConnecting
      hasNotification={false}
      hasUpdate={false}
      isVerifyingBlockchain={false}
      blockSyncProgress={toBlockSyncProgress(args)}
      // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
      hasUnreadAlerts={false}
      hasUnreadAnnouncements={false}
      hasUnreadNews={false}
      onToggleNewsFeedIconClick={action('onToggleNewsFeedIconClick')}
      isConnected
      cardanoNodeState={CardanoNodeStates.RUNNING}
      hasBeenConnected
      isSynced={false}
      isConnecting={false}
      isSyncing
      isSyncProgressStalling={false}
      isNodeStopping={false}
      isNodeStopped={false}
      isTlsCertInvalid={false}
      hasLoadedCurrentLocale
      hasLoadedCurrentTheme
      isCheckingSystemTime={false}
      isNodeResponding
      isNodeSubscribed
      isNodeSyncing
      isNodeTimeCorrect
      isNewAppVersionLoaded
      onIssueClick={action('onIssueClick')}
      onOpenExternalLink={action('onOpenExternalLink')}
      onDownloadLogs={action('onDownloadLogs')}
      onGetAvailableVersions={action('onGetAvailableVersions')}
      onStatusIconClick={linkTo('Diagnostics', () => 'default')}
      disableDownloadLogs={false}
      showNewsFeedIcon
    />
  );
}
