import React from 'react';
import StakePoolsSettingsPage from '../../../../source/renderer/app/containers/settings/categories/StakePoolsSettingsPage';
import { ROUTES } from '../../../../source/renderer/app/routes-config';
import { screenDecorator } from '../../_support/harness/ScreenStory';

/*
 * Where the pool metadata comes from. The field is disabled until the node is
 * synced, because pointing it somewhere new mid-sync would leave the list half
 * from one server and half from another.
 */
export default {
  title: 'Screens / Settings / Stake Pools',
  decorators: [screenDecorator({}, { path: ROUTES.SETTINGS.STAKE_POOLS })],
};

export const Default = {
  render: () => <StakePoolsSettingsPage />,
  name: 'Synced',
};

export const WhileSyncing = {
  decorators: [
    screenDecorator(
      { networkStatus: { isSynced: false, syncPercentage: 42 } },
      { path: ROUTES.SETTINGS.STAKE_POOLS }
    ),
  ],
  render: () => <StakePoolsSettingsPage />,
  name: 'Still syncing',
};

export const ServerError = {
  decorators: [
    screenDecorator(
      {
        staking: {
          smashServerUrlError: { id: 'test', defaultMessage: '', values: {} },
        },
      },
      { path: ROUTES.SETTINGS.STAKE_POOLS }
    ),
  ],
  render: () => <StakePoolsSettingsPage />,
  name: 'Server rejected',
};
