import React from 'react';
import { action } from '@storybook/addon-actions';
import { WALLET_RECOVERY_PHRASE_WORD_COUNT } from '../../../../source/renderer/app/config/cryptoConfig';
// Helpers
import WalletsWrapper from '../_utils/WalletsWrapper';
import {
  WALLET_KINDS,
  WALLET_DAEDALUS_KINDS,
  WALLET_YOROI_KINDS,
  WALLET_HARDWARE_KINDS,
} from '../../../../source/renderer/app/config/walletRestoreConfig';
// Screens
import WalletTypeDialog from '../../../../source/renderer/app/components/wallet/wallet-restore/WalletTypeDialog';
import MnemonicsDialog from '../../../../source/renderer/app/components/wallet/wallet-restore/MnemonicsDialog';
import ConfigurationDialog from '../../../../source/renderer/app/components/wallet/wallet-restore/ConfigurationDialog';
import SuccessDialog from '../../../../source/renderer/app/components/wallet/wallet-restore/SuccessDialog';
import { localeOf } from '../../_support/globals';
import { optionsFrom } from '../../_support/argTypes';

// The second select's label was built from the first select's value, so choosing
// a wallet kind replaced one control with another. An arg name is fixed, so the
// one arg offers every kind's options at once. The three props it feeds are the
// three the component chooses between on `walletKind`, so any pair of values
// renders what it rendered.
const specificKindOptions = {
  '-': null,
  ...WALLET_DAEDALUS_KINDS,
  ...WALLET_YOROI_KINDS,
  ...WALLET_HARDWARE_KINDS,
};

const daedalusDefault = Object.values(WALLET_DAEDALUS_KINDS)[0];

export default {
  title: 'Wallets / Add Wallet',
  decorators: [WalletsWrapper],
};

export const RestoreStep1 = {
  args: { walletKind: null, walletKindSpecific: null },

  argTypes: {
    walletKind: optionsFrom({ '-': null, ...WALLET_KINDS }),
    walletKindSpecific: optionsFrom(specificKindOptions),
  },

  render: ({ walletKind, walletKindSpecific }) => (
    <WalletTypeDialog
      onContinue={action('onContinue')}
      onClose={action('onClose')}
      onSetWalletKind={action('onSetWalletKind')}
      walletKind={walletKind}
      walletKindDaedalus={walletKindSpecific}
      walletKindYoroi={walletKindSpecific}
      walletKindHardware={walletKindSpecific}
    />
  ),

  name: 'Restore - Step 1',
};

export const RestoreStep2 = {
  args: {
    walletKind: WALLET_KINDS.DAEDALUS,
    walletKindSpecific: daedalusDefault,
  },

  argTypes: {
    walletKind: optionsFrom(WALLET_KINDS),
    walletKindSpecific: optionsFrom(specificKindOptions),
  },

  render: ({ walletKind, walletKindSpecific }) => (
    <MnemonicsDialog
      onContinue={action('onContinue')}
      onClose={action('onClose')}
      // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
      onSetWalletKind={action('onSetWalletKind')}
      onBack={action('onSetWalletKind')}
      onSetWalletMnemonics={action('onSetWalletMnemonics')}
      walletKind={walletKind}
      walletKindDaedalus={walletKindSpecific}
      walletKindYoroi={walletKindSpecific}
      walletKindHardware={walletKindSpecific}
      mnemonics={[]}
      expectedWordCount={WALLET_RECOVERY_PHRASE_WORD_COUNT}
      maxWordCount={WALLET_RECOVERY_PHRASE_WORD_COUNT}
      onValidateMnemonics={action('onValidateMnemonics')}
    />
  ),

  name: 'Restore - Step 2',
};

export const RestoreStep3 = {
  render: (_args, context) => {
    const locale = localeOf(context);
    return (
      <ConfigurationDialog
        isSubmitting={false}
        onContinue={action('onContinue')}
        onClose={action('onClose')}
        onBack={action('onSetWalletKind')}
        onChange={action('onSetWalletKind')}
        repeatPassword=""
        spendingPassword=""
        walletName=""
        currentLocale={locale}
      />
    );
  },

  name: 'Restore - Step 3',
};

export const RestoreStep4 = {
  args: {
    walletKind: WALLET_KINDS.DAEDALUS,
    walletKindSpecific: daedalusDefault,
  },

  argTypes: {
    walletKind: optionsFrom(WALLET_KINDS),
    walletKindSpecific: optionsFrom(specificKindOptions),
  },

  render: ({ walletKindSpecific }) => (
    <SuccessDialog
      onClose={action('onClose')}
      walletKindDaedalus={walletKindSpecific}
      walletKindYoroi={walletKindSpecific}
    />
  ),

  name: 'Restore - Step 4',
};
