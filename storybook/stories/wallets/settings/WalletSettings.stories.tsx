import React from 'react';
// Helpers
import WalletsWrapper from '../_utils/WalletsWrapper';
// Screens
import WalletSettingsScreen, {
  walletSettingsScreenArgs,
  walletSettingsScreenArgTypes,
} from './_support/WalletSettingsScreen';
import { localeOf } from '../../_support/globals';

export default {
  title: 'Wallets / Settings',
  decorators: [WalletsWrapper],
};

export const WalletSettings = {
  args: walletSettingsScreenArgs,
  argTypes: walletSettingsScreenArgTypes,

  render: (args, context) => (
    <WalletSettingsScreen {...args} locale={localeOf(context)} />
  ),
};
