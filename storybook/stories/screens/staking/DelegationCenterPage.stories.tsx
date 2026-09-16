import React from 'react';
import DelegationCenterPageContainer from '../../../../source/renderer/app/containers/staking/DelegationCenterPage';
import Staking from '../../../../source/renderer/app/containers/staking/Staking';
import { ROUTES } from '../../../../source/renderer/app/routes-config';
import { asScreen, screenDecorator } from '../../_support/harness/ScreenStory';
import { walletList } from '../../_support/harness/fixtures/wallets';

/*
 * One row per wallet, showing where each is delegated and what it earns. It has
 * a distinct screen for having no wallets at all, which is what a new
 * installation sees, and it treats an empty pool list as still loading rather
 * than as an answer.
 *
 * The delegation wizard is reached from here and from the stake pool list. It is
 * covered from the list instead, because that screen already has the pool data
 * the wizard needs.
 */
const DelegationCenterPage = asScreen(DelegationCenterPageContainer);
export default {
  title: 'Screens / Staking / Delegation Center',
  decorators: [
    screenDecorator(
      { wallets: { allWallets: walletList() } },
      { path: ROUTES.STAKING.DELEGATION_CENTER }
    ),
  ],
};

export const Default = {
  render: () => (
    <Staking>
      <DelegationCenterPage />
    </Staking>
  ),
  name: 'With wallets',
};

export const NoWallets = {
  // Not an empty list: a different screen, offering to create one.
  decorators: [
    screenDecorator(
      { wallets: { allWallets: [] } },
      { path: ROUTES.STAKING.DELEGATION_CENTER }
    ),
  ],
  render: () => (
    <Staking>
      <DelegationCenterPage />
    </Staking>
  ),
  name: 'No wallets yet',
};

export const LoadingPools = {
  decorators: [
    screenDecorator(
      {
        wallets: { allWallets: walletList() },
        staking: { stakePools: [], recentStakePools: [] },
      },
      { path: ROUTES.STAKING.DELEGATION_CENTER }
    ),
  ],
  render: () => (
    <Staking>
      <DelegationCenterPage />
    </Staking>
  ),
  name: 'Waiting for the pool list',
};
