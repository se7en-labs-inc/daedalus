import React from 'react';
import StakePoolsListPageContainer from '../../../../source/renderer/app/containers/staking/StakePoolsListPage';
import Staking from '../../../../source/renderer/app/containers/staking/Staking';
import { ROUTES } from '../../../../source/renderer/app/routes-config';
import { asScreen, screenDecorator } from '../../_support/harness/ScreenStory';
import { walletList } from '../../_support/harness/fixtures/wallets';
import DelegationSetupWizardDialog from '../../../../source/renderer/app/components/staking/delegation-setup-wizard/DelegationSetupWizardDialog';
import { dialogOpen } from '../../_support/harness/storeDefaults';

/*
 * Three hundred stake pools, which is the point: the list virtualises its rows
 * and a fixture of three would exercise none of that. The pools come from the
 * application's own sample rather than from anything written here.
 *
 * Its loading state is not a spinner over the list, it is a different thing
 * entirely, and it is reached from two independent conditions: the node not
 * being synced, and the pool fetch having failed.
 */
const StakePoolsListPage = asScreen(StakePoolsListPageContainer);

export default {
  title: 'Screens / Staking / Stake Pools',
  decorators: [
    screenDecorator(
      { wallets: { all: walletList() } },
      { path: ROUTES.STAKING.STAKE_POOLS }
    ),
  ],
};

export const Default = {
  render: () => (
    <Staking>
      <StakePoolsListPage />
    </Staking>
  ),
  name: 'The pool list',
};

export const NotSynced = {
  decorators: [
    screenDecorator(
      {
        wallets: { all: walletList() },
        networkStatus: { isSynced: false, syncPercentage: 42 },
      },
      { path: ROUTES.STAKING.STAKE_POOLS }
    ),
  ],
  render: () => (
    <Staking>
      <StakePoolsListPage />
    </Staking>
  ),
  name: 'Not synced',
};

export const FetchFailed = {
  decorators: [
    screenDecorator(
      {
        wallets: { all: walletList() },
        staking: { fetchingStakePoolsFailed: true },
      },
      { path: ROUTES.STAKING.STAKE_POOLS }
    ),
  ],
  render: () => (
    <Staking>
      <StakePoolsListPage />
    </Staking>
  ),
  name: 'Pool fetch failed',
};

/*
 * The delegation wizard, covered from here rather than from the delegation
 * centre. Both screens open the same dialog, and this one already carries the
 * pool data the wizard lists.
 */
export const DelegationWizard = {
  decorators: [
    screenDecorator(
      {
        wallets: { all: walletList() },
        uiDialogs: dialogOpen(DelegationSetupWizardDialog),
      },
      { path: ROUTES.STAKING.STAKE_POOLS }
    ),
  ],
  render: () => (
    <Staking>
      <StakePoolsListPage />
    </Staking>
  ),
  name: 'Delegation wizard open',
};
