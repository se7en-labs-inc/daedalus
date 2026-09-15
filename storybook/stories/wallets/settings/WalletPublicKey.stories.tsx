import React from 'react';
import { action } from '@storybook/addon-actions';
// Helpers
import WalletsWrapper, { walletsLayoutArgs } from '../_utils/WalletsWrapper';
// Components
import WalletPublicKeyDialog from '../../../../source/renderer/app/components/wallet/settings/WalletPublicKeyDialog';

export default {
  title: 'Wallets / Settings',
  args: walletsLayoutArgs,
  decorators: [WalletsWrapper],
};

export const PublicKeySpendingPassword = {
  args: { hasReceivedWalletPublicKey: undefined },
  argTypes: { hasReceivedWalletPublicKey: { control: 'boolean' } },

  render: ({ hasReceivedWalletPublicKey }) => (
    <WalletPublicKeyDialog
      onRevealPublicKey={action('onRevealPublicKey')}
      onClose={action('onCancel')}
      hasReceivedWalletPublicKey={hasReceivedWalletPublicKey}
      error={null}
      walletName={'Test Wallet'}
    />
  ),

  name: 'Public Key - Spending Password',
};
