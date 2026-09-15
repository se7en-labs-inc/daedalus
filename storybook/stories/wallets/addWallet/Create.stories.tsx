import React from 'react';
import { action } from 'storybook/actions';
import CreateWalletScreens, {
  createWalletScreensArgs,
} from '../_utils/CreateWalletScreens';
import WalletCreateDialog from '../../../../source/renderer/app/components/wallet/WalletCreateDialog';
import { localeOf } from '../../_support/globals';
// Assets and helpers
import WalletsWrapper, { walletsLayoutArgs } from '../_utils/WalletsWrapper';

export default {
  title: 'Wallets / Add Wallet',
  args: walletsLayoutArgs,
  decorators: [WalletsWrapper],
};

export const CreateNewProcess = {
  args: createWalletScreensArgs,
  render: (args) => <CreateWalletScreens {...args} />,
  name: 'Create - New process',
};

export const CreateOldProcess = {
  render: (_args, context) => {
    return (
      <WalletCreateDialog
        onSubmit={action('onSubmit')}
        onCancel={action('onCancel')}
        currentLocale={localeOf(context)}
      />
    );
  },

  name: 'Create - Old process',
};
