import React from 'react';
import { action } from '@storybook/addon-actions';
// Assets and helpers
import WalletsWrapper, { walletsLayoutArgs } from '../_utils/WalletsWrapper';
import WalletFileImportDialog from '../../../../source/renderer/app/components/wallet/file-import/WalletFileImportDialog';

export default {
  title: 'Wallets / Add Wallet',
  args: walletsLayoutArgs,
  decorators: [WalletsWrapper],
};

export const Import = () => (
  <WalletFileImportDialog
    isSubmitting={false}
    onSubmit={action('onSubmit')}
    onClose={action('onClose')}
    error={null}
  />
);
