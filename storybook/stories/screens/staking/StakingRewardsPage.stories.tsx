import React from 'react';
import StakingRewardsPage from '../../../../source/renderer/app/containers/staking/StakingRewardsPage';
import Staking from '../../../../source/renderer/app/containers/staking/Staking';
import { ROUTES } from '../../../../source/renderer/app/routes-config';
import { screenDecorator } from '../../_support/harness/ScreenStory';
import { rewards } from '../../_support/harness/fixtures/staking';

/*
 * One row per wallet with a reward balance. The rows are derived from the same
 * wallet list the rest of the harness uses, because the real getter builds them
 * by crossing into the wallets and transactions stores and a fixture with its
 * own names would show wallets that exist nowhere else in the workbench.
 */
export default {
  title: 'Screens / Staking / Rewards',
  decorators: [
    screenDecorator(
      { staking: { rewards: rewards() } },
      { path: ROUTES.STAKING.REWARDS }
    ),
  ],
};

export const Default = {
  render: () => (
    <Staking>
      <StakingRewardsPage />
    </Staking>
  ),
  name: 'With rewards',
};

export const NoRewards = {
  decorators: [
    screenDecorator(
      { staking: { rewards: [] } },
      { path: ROUTES.STAKING.REWARDS }
    ),
  ],
  render: () => (
    <Staking>
      <StakingRewardsPage />
    </Staking>
  ),
  name: 'No rewards yet',
};
