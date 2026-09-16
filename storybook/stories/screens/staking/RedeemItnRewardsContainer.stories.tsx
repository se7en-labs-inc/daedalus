import React from 'react';
import RedeemItnRewardsContainer from '../../../../source/renderer/app/containers/staking/RedeemItnRewardsContainer';
import { ROUTES } from '../../../../source/renderer/app/routes-config';
import { screenDecorator } from '../../_support/harness/ScreenStory';
import { walletList } from '../../_support/harness/fixtures/wallets';
import { redeemingItnRewards } from '../../_support/harness/fixtures/staking';

/*
 * The Incentivised Testnet reward redemption flow, reached from the operating
 * system menu rather than from any route. `Root.tsx:68-70` mounts it only when
 * `redeemStep` is set, so the default is nothing at all and the store field is
 * the difference between a screen and no screen.
 *
 * Its two refusals are separate screens rather than states of the first step: a
 * node still syncing cannot verify a redemption, and an installation with no
 * wallet has nowhere to put one.
 */
export default {
  title: 'Screens / Staking / Redeem ITN Rewards',
  decorators: [
    screenDecorator(
      {
        staking: redeemingItnRewards(),
        wallets: { allWallets: walletList() },
      },
      { path: ROUTES.STAKING.REWARDS }
    ),
  ],
};

export const Default = {
  render: () => <RedeemItnRewardsContainer />,
  name: 'Entering the recovery phrase',
};

export const NotSynced = {
  decorators: [
    screenDecorator(
      {
        staking: redeemingItnRewards(),
        wallets: { allWallets: walletList() },
        networkStatus: { isSynced: false },
      },
      { path: ROUTES.STAKING.REWARDS }
    ),
  ],
  render: () => <RedeemItnRewardsContainer />,
  name: 'Redemption unavailable while syncing',
};

export const NoWallets = {
  decorators: [
    screenDecorator(
      {
        staking: redeemingItnRewards(),
        wallets: { allWallets: [] },
      },
      { path: ROUTES.STAKING.REWARDS }
    ),
  ],
  render: () => <RedeemItnRewardsContainer />,
  name: 'No wallet to redeem into',
};

export const NotStarted = {
  // The state every session is in until the menu item is chosen.
  decorators: [
    screenDecorator(
      { wallets: { allWallets: walletList() } },
      { path: ROUTES.STAKING.REWARDS }
    ),
  ],
  render: () => <RedeemItnRewardsContainer />,
  name: 'Not started (renders nothing)',
};
