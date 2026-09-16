import React from 'react';
// Assets and helpers
import StoryDecorator from '../../_support/StoryDecorator';
import { rangeFrom } from '../../_support/argTypes';
// Stories
import {
  DefaultSyncingConnectingStory,
  LoadingWalletDataSyncingConnectingStory,
  ConnectivityIssuesSyncingConnectingStory,
  blockSyncProgressArgs,
  connectivityIssuesArgs,
  defaultSyncingConnectingArgs,
  percentRange,
} from './_support/SyncingConnecting';

export default {
  title: 'Nodes / Connecting and Loading',
  args: blockSyncProgressArgs,

  argTypes: {
    verifyingBlockchainState: rangeFrom(percentRange),
    replayingLedger: rangeFrom(percentRange),
    syncingBlockchain: rangeFrom(percentRange),
  },

  decorators: [(story) => <StoryDecorator>{story()}</StoryDecorator>],
};

export const Connecting = {
  args: defaultSyncingConnectingArgs,
  render: (args) => <DefaultSyncingConnectingStory {...args} />,
};

export const TroubleConnecting = {
  args: connectivityIssuesArgs,
  render: (args) => <ConnectivityIssuesSyncingConnectingStory {...args} />,
};

export const LoadingWalletData = {
  render: (args) => <LoadingWalletDataSyncingConnectingStory {...args} />,
};
