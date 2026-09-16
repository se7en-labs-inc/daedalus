import React from 'react';
import Staking from '../../../../source/renderer/app/containers/staking/Staking';
import { ROUTES } from '../../../../source/renderer/app/routes-config';
import { screenDecorator } from '../../_support/harness/ScreenStory';

/*
 * The staking shell. Its first branch is a refusal: until the node is synced it
 * replaces the whole section with an explanation, because a delegation made
 * against a stale chain would be wrong rather than slow.
 *
 * The countdown branch is not covered. It renders when
 * `isStakingDelegationCountdown` is true, which the store computes from Shelley
 * still being pending, and a shipped build has had Shelley active for years. A
 * story for it would document a screen no user can reach.
 */
const Placeholder = () => (
  <div style={{ padding: '20px' }}>
    The staking page that would render here.
  </div>
);

export default {
  title: 'Screens / Staking / Staking Shell',
  decorators: [screenDecorator({}, { path: ROUTES.STAKING.DELEGATION_CENTER })],
};

export const Default = {
  render: () => (
    <Staking>
      <Placeholder />
    </Staking>
  ),
  name: 'Synced',
};

export const NotSynced = {
  decorators: [
    screenDecorator(
      { networkStatus: { isSynced: false, syncPercentage: 42 } },
      { path: ROUTES.STAKING.DELEGATION_CENTER }
    ),
  ],
  render: () => (
    <Staking>
      <Placeholder />
    </Staking>
  ),
  name: 'Staking unavailable while syncing',
};
