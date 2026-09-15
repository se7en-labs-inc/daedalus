import React from 'react';
import WalletSummaryHeader from '../../../../source/renderer/app/components/wallet/summary/WalletSummaryHeader';
import StoryDecorator from '../../_support/StoryDecorator';
import StoryProvider from '../../_support/StoryProvider';
import { generateRewardForWallet, generateWallet } from '../../_support/utils';
import { inCategory } from '../../_support/argTypes';

function WalletSummaryHeaderDecorator(story: () => React.ReactNode) {
  return (
    <StoryDecorator>
      <StoryProvider>{story()}</StoryProvider>
    </StoryDecorator>
  );
}

export default {
  title: 'Wallets / Summary',
  decorators: [WalletSummaryHeaderDecorator],
};

const summaryArgs = {
  walletTotal: '4564321263',
  rewardsTotal: '4141123',
  unspentRewards: '0',
  numberOfRecentTransactions: 0,
  numberOfPendingTransactions: 0,
  isLoadingTransactions: false,
};

export const _WalletSummaryHeader = {
  args: summaryArgs,
  argTypes: inCategory('Rewards', summaryArgs),

  render: ({
    walletTotal,
    rewardsTotal,
    unspentRewards,
    numberOfRecentTransactions,
    numberOfPendingTransactions,
    isLoadingTransactions,
  }) => {
    const wallet = generateWallet(
      'Wallet name',
      walletTotal,
      undefined,
      rewardsTotal
    );
    const reward = generateRewardForWallet(wallet, unspentRewards);
    return (
      <WalletSummaryHeader
        wallet={wallet}
        reward={reward}
        numberOfRecentTransactions={numberOfRecentTransactions}
        numberOfPendingTransactions={numberOfPendingTransactions}
        isLoadingTransactions={isLoadingTransactions}
      />
    );
  },
};
