import React from 'react';
import { action } from 'storybook/actions';
import BigNumber from 'bignumber.js';
// Helpers
import StoryDecorator from '../../_support/StoryDecorator';
import {
  generateHash,
  generatePolicyIdHash,
  generateWallet,
} from '../../_support/utils';
import STAKE_POOLS from '../../../../source/renderer/app/config/stakingStakePools.dummy.json';
import { inCategory } from '../../_support/argTypes';
// Screens
import UndelegateWalletConfirmationDialog from '../../../../source/renderer/app/components/wallet/settings/UndelegateWalletConfirmationDialog';

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
const selectedWallet = generateWallet(
  'Wallet 1',
  '1000000000',
  assets,
  0,
  // @ts-ignore ts-migrate(2345) FIXME: Argument of type '{ relativeStake: number; cost: s... Remove this comment to see the full error message
  STAKE_POOLS[0]
);

export default {
  title: 'Wallets / Settings',
  decorators: [(story) => <StoryDecorator>{story()}</StoryDecorator>],
};

const submittingArgs = { isSubmitting: false };

export const UndelegateWallet = {
  args: {
    stakePoolName: 'Stake Pool Name',
    stakePoolTicker: 'Stake Pool Ticker',
    ...submittingArgs,
    isTrezor: false,
  },

  argTypes: inCategory('Undelegate Wallet', submittingArgs),

  render: ({ stakePoolName, stakePoolTicker, isSubmitting, isTrezor }) => (
    <UndelegateWalletConfirmationDialog
      selectedWallet={selectedWallet}
      stakePoolName={stakePoolName}
      stakePoolTicker={stakePoolTicker}
      onConfirm={action('Undelegate Wallet - onConfirm')}
      onCancel={action('Undelegate Wallet - onCancel')}
      onExternalLinkClick={action('Undelegate Wallet - onExternalLinkClick')}
      isSubmitting={isSubmitting}
      error={null}
      // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
      fees={new BigNumber(10)}
      hwDeviceStatus="ready"
      isTrezor={isTrezor}
    />
  ),
};
