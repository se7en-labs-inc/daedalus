import React from 'react';
import BigNumber from 'bignumber.js';
import { action } from 'storybook/actions';
// Screens
import Step1ConfigurationDialog from '../../../../source/renderer/app/components/staking/redeem-itn-rewards/Step1ConfigurationDialog';
import Step2ConfirmationDialog from '../../../../source/renderer/app/components/staking/redeem-itn-rewards/Step2ConfirmationDialog';
import Step3SuccessDialog from '../../../../source/renderer/app/components/staking/redeem-itn-rewards/Step3SuccessDialog';
import Step3FailureDialog from '../../../../source/renderer/app/components/staking/redeem-itn-rewards/Step3FailureDialog';
import NoWalletsDialog from '../../../../source/renderer/app/components/staking/redeem-itn-rewards/NoWalletsDialog';
import RedemptionUnavailableDialog from '../../../../source/renderer/app/components/staking/redeem-itn-rewards/RedemptionUnavailableDialog';
// Helpers
import { isValidMnemonic } from '../../../../source/common/config/crypto/decrypt';
import validWords from '../../../../source/common/config/crypto/valid-words.en';
import {
  generateHash,
  generatePolicyIdHash,
  generateWallet,
} from '../../_support/utils';
import { labelOptionsFrom, rangeFrom } from '../../_support/argTypes';

const assets = {
  available: [
    {
      id: generateHash(),
      policyId: generatePolicyIdHash(),
      uniqueId: generatePolicyIdHash(),
      assetName: '',
      quantity: new BigNumber(200),
    },
    {
      id: generateHash(),
      policyId: generatePolicyIdHash(),
      uniqueId: generatePolicyIdHash(),
      assetName: '',
      quantity: new BigNumber(200),
    },
  ],
  total: [
    {
      id: generateHash(),
      policyId: generatePolicyIdHash(),
      uniqueId: generatePolicyIdHash(),
      assetName: '',
      quantity: new BigNumber(200),
    },
    {
      id: generateHash(),
      policyId: generatePolicyIdHash(),
      uniqueId: generatePolicyIdHash(),
      assetName: '',
      quantity: new BigNumber(200),
    },
  ],
};
const WALLETS = [
  generateWallet('First Wallet', '1000000000', assets),
  generateWallet(
    'Second Wallet',
    '500000000',
    assets,
    0,
    undefined,
    true,
    'syncing'
  ),
  generateWallet('Third Wallet', '100000000', assets),
  generateWallet('Fourth Wallet', '50000000', assets),
  generateWallet('Fifth Wallet', '7000000', assets),
];
// 'Dummy2',
// '2000000000000',
// assets,
// 0,
// undefined,
// true,
// WalletSyncStateStatuses.SYNCING
// The redeem-wallet select offered wallet records, which an argType's options
// cannot hold, so the arg holds the name and each story looks the wallet up.
const redeemWalletOptions = WALLETS.reduce((obj, wallet) => {
  obj[wallet.name] = wallet;
  return obj;
}, {});

export const redeemWalletArgs = { redeemWallet: WALLETS[0].name };
export const redeemWalletArgTypes = {
  redeemWallet: labelOptionsFrom(redeemWalletOptions),
};

export const step1Args = {
  ...redeemWalletArgs,
  isWalletValid: undefined,
  isCalculatingReedemFees: undefined,
};
export const step1ArgTypes = {
  ...redeemWalletArgTypes,
  isWalletValid: { control: 'boolean' },
  isCalculatingReedemFees: { control: 'boolean' },
};

export const step2Args = {
  ...redeemWalletArgs,
  transactionFees: 100000,
  redeemedRewards: 100000,
  isSubmitting: false,
};
export const step2ArgTypes = redeemWalletArgTypes;

export const step3SuccessArgs = {
  ...redeemWalletArgs,
  transactionFees: 100000,
  redeemedRewards: 100000,
};
export const step3SuccessArgTypes = redeemWalletArgTypes;

export const redemptionUnavailableArgs = { syncPercentage: 37 };
export const redemptionUnavailableArgTypes = {
  syncPercentage: rangeFrom({ min: 0, max: 100, step: 1 }),
};

export function Step1ConfigurationDialogStory(props: typeof step1Args) {
  const redeemWallet = redeemWalletOptions[props.redeemWallet];
  return (
    <Step1ConfigurationDialog
      key="Step1ConfigurationDialog"
      wallets={WALLETS}
      wallet={redeemWallet}
      // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
      isWalletValid={props.isWalletValid}
      isCalculatingReedemFees={props.isCalculatingReedemFees}
      syncPercentage={99.55}
      mnemonicValidator={isValidMnemonic}
      onSelectWallet={action('onSelectWallet')}
      onClose={action('onClose')}
      onContinue={action('onContinue')}
      onBack={action('onBack')}
      openExternalLink={action('openExternalLink')}
      suggestedMnemonics={validWords}
    />
  );
}
export function Step2ConfirmationDialogStory(props: typeof step2Args) {
  const redeemWallet = redeemWalletOptions[props.redeemWallet];
  return (
    <Step2ConfirmationDialog
      key="Step2ConfirmationDialog"
      wallet={redeemWallet}
      transactionFees={new BigNumber(props.transactionFees)}
      // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
      redeemedRewards={new BigNumber(props.redeemedRewards)}
      onContinue={action('onContinue')}
      onClose={action('onClose')}
      onBack={action('onBack')}
      isSubmitting={props.isSubmitting}
    />
  );
}
export function Step3SuccessDialogStory(props: typeof step3SuccessArgs) {
  const redeemWallet = redeemWalletOptions[props.redeemWallet];
  return (
    <Step3SuccessDialog
      key="Step2ConfirmationDialog"
      wallet={redeemWallet}
      transactionFees={new BigNumber(props.transactionFees)}
      // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
      redeemedRewards={new BigNumber(props.redeemedRewards)}
      onContinue={action('onContinue')}
      onClose={action('onClose')}
    />
  );
}
export function Step3FailureDialogStory() {
  return (
    <Step3FailureDialog onClose={action('onClose')} onBack={action('onBack')} />
  );
}
export function NoWalletsDialogDialogStory() {
  return (
    <NoWalletsDialog
      onClose={action('onClose')}
      onAddWallet={action('onAddWallet')}
    />
  );
}
export function RedemptionUnavailableDialogDialogStory(
  props: typeof redemptionUnavailableArgs
) {
  return (
    <RedemptionUnavailableDialog
      onClose={action('onClose')}
      syncPercentage={props.syncPercentage}
    />
  );
}
