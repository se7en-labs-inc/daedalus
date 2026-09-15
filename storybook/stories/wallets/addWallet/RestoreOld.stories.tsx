import React from 'react';
import { action } from '@storybook/addon-actions';
// Helpers
import WalletsWrapper, { walletsLayoutArgs } from '../_utils/WalletsWrapper';
// Screens
import WalletRestoreDialog from '../../../../source/renderer/app/components/wallet/WalletRestoreDialog';

export default {
  title: 'Wallets / Add Wallet',
  args: walletsLayoutArgs,
  decorators: [WalletsWrapper],
};

export const RestoreOld = {
  args: { isSubmitting: false },

  render: ({ isSubmitting }) => (
    <WalletRestoreDialog
      onSubmit={action('onSubmit')}
      onCancel={action('onCancel')}
      isSubmitting={isSubmitting}
      mnemonicValidator={action('mnemonicValidator')}
      suggestedMnemonics={[]}
      onChoiceChange={action('onChoiceChange')}
    />
  ),

  name: 'Restore - Old',
};
