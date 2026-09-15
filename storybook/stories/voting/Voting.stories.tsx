import React from 'react';
import { action } from '@storybook/addon-actions';
import BigNumber from 'bignumber.js';
import StoryDecorator from '../_support/StoryDecorator';
import StoryProvider from '../_support/StoryProvider';
import VotingRegistrationStepsChooseWallet from '../../../source/renderer/app/components/voting/voting-registration-wizard-steps/VotingRegistrationStepsChooseWallet';
import VotingRegistrationStepsRegister from '../../../source/renderer/app/components/voting/voting-registration-wizard-steps/VotingRegistrationStepsRegister';
import VotingRegistrationStepsConfirm from '../../../source/renderer/app/components/voting/voting-registration-wizard-steps/VotingRegistrationStepsConfirm';
import VotingRegistrationStepsEnterPinCode from '../../../source/renderer/app/components/voting/voting-registration-wizard-steps/VotingRegistrationStepsEnterPinCode';
import VotingRegistrationStepsQrCode from '../../../source/renderer/app/components/voting/voting-registration-wizard-steps/VotingRegistrationStepsQrCode';
import { mockFundInfo } from './_support/fundInfo';
import {
  LANGUAGE_OPTIONS,
  DATE_ENGLISH_OPTIONS,
  TIME_OPTIONS,
} from '../../../source/renderer/app/config/profileConfig';
import {
  VOTING_REGISTRATION_MIN_TRANSACTION_CONFIRMATIONS,
  VOTING_REGISTRATION_MIN_WALLET_FUNDS,
} from '../../../source/renderer/app/config/votingConfig';
import {
  generateHash,
  generatePolicyIdHash,
  generateWallet,
} from '../_support/utils';
import { HwDeviceStatuses } from '../../../source/renderer/app/domains/Wallet';
import { Locale } from '../../../source/common/types/locales.types';
import { rangeFrom } from '../_support/argTypes';

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
  generateWallet('Wallet 1', '100000000000000', assets, 0),
  generateWallet(
    'Wallet 2',
    '500000000',
    assets,
    0,
    undefined,
    true,
    'syncing'
  ),
];
const stepsList = ['Wallet', 'Sign', 'Confirm', 'PIN code', 'QR code'];

export default {
  title: 'Voting / Voting Registration Wizard',

  decorators: [
    (story) => (
      <StoryProvider>
        <StoryDecorator>{story()}</StoryDecorator>
      </StoryProvider>
    ),
  ],
};

export const VotingRegistrationStep1 = {
  args: { numberOfStakePools: 100 },

  render: ({ numberOfStakePools }) => (
    <VotingRegistrationStepsChooseWallet
      onClose={action('onClose')}
      stepsList={stepsList}
      activeStep={1}
      numberOfStakePools={numberOfStakePools}
      onSelectWallet={action('onSelectWallet')}
      wallets={WALLETS}
      minVotingRegistrationFunds={VOTING_REGISTRATION_MIN_WALLET_FUNDS}
      selectedWalletId={WALLETS[0].id}
      isWalletAcceptable={action('isWalletAcceptable')}
      getStakePoolById={action('getStakePoolById')}
    />
  ),

  name: 'Voting Registration - Step 1',
};

export const VotingRegistrationStep2 = {
  args: {
    transactionFee: 0.3,
    isSubmitting: undefined,
    isHardwareWallet: false,
    isTrezor: false,
  },

  argTypes: {
    transactionFee: { control: { type: 'number', min: 0, max: 1000000 } },
    isSubmitting: { control: 'boolean' },
  },

  render: ({ transactionFee, isSubmitting, isHardwareWallet, isTrezor }) => (
    <VotingRegistrationStepsRegister
      onClose={action('onClose')}
      onBack={action('onBack')}
      stepsList={stepsList}
      activeStep={2}
      transactionFee={new BigNumber(transactionFee)}
      isSubmitting={isSubmitting}
      onConfirm={action('onConfirm')}
      onExternalLinkClick={action('onExternalLinkClick')}
      hwDeviceStatus={HwDeviceStatuses.CONNECTING}
      isHardwareWallet={isHardwareWallet}
      isTrezor={isTrezor}
      selectedWallet={WALLETS[0]}
    />
  ),

  name: 'Voting Registration - Step 2',
};

export const VotingRegistrationStep3 = {
  args: {
    isTransactionPending: true,
    isTransactionConfirmed: false,
    transactionConfirmations: 0,
    transactionError: false,
  },

  argTypes: {
    transactionConfirmations: rangeFrom({
      max: VOTING_REGISTRATION_MIN_TRANSACTION_CONFIRMATIONS,
    }),
  },

  render: ({
    isTransactionPending,
    isTransactionConfirmed,
    transactionConfirmations,
    transactionError,
  }) => (
    <VotingRegistrationStepsConfirm
      onClose={action('onClose')}
      stepsList={stepsList}
      activeStep={3}
      isTransactionPending={isTransactionPending}
      isTransactionConfirmed={isTransactionConfirmed}
      transactionConfirmations={transactionConfirmations}
      onConfirm={action('onConfirm')}
      onRestart={action('onRestart')}
      transactionError={transactionError}
    />
  ),

  name: 'Voting Registration - Step 3',
};

export const VotingRegistrationStep4 = {
  render: () => (
    <VotingRegistrationStepsEnterPinCode
      onClose={action('onClose')}
      stepsList={stepsList}
      activeStep={4}
      onSetPinCode={action('onSetPinCode')}
    />
  ),

  name: 'Voting Registration - Step 4',
};

export const VotingRegistrationStep5 = {
  render: () => (
    <VotingRegistrationStepsQrCode
      onClose={action('onClose')}
      onDownloadPDF={action('onDownloadPDF')}
      stepsList={stepsList}
      activeStep={5}
      qrCode="djkhfkwdjhfkwdhfkwjdhfkwdhf9wdyf9wdh9u3h03hd0f3hd0h30hf30dhf03dhf03dhf03dhf03dhf0u3dhf0u3dhf0u3dfh30uhfd30uh"
    />
  ),

  name: 'Voting Registration - Step 5',
};
