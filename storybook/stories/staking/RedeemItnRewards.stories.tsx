import React from 'react';
import {
  Step1ConfigurationDialogStory,
  Step2ConfirmationDialogStory,
  Step3SuccessDialogStory,
  Step3FailureDialogStory,
  NoWalletsDialogDialogStory,
  RedemptionUnavailableDialogDialogStory,
  redemptionUnavailableArgTypes,
  redemptionUnavailableArgs,
  step1ArgTypes,
  step1Args,
  step2ArgTypes,
  step2Args,
  step3SuccessArgTypes,
  step3SuccessArgs,
} from './_support/RedeemItnWallets';
import { stakingDecorator } from './_support/decorator';

export default {
  title: 'Decentralization / Redeem ITN Rewards',
  decorators: [stakingDecorator],
};

export const Step1 = {
  args: step1Args,
  argTypes: step1ArgTypes,
  render: (args) => <Step1ConfigurationDialogStory {...args} />,

  parameters: {
    id: 'redeem-itn-wallets-story',
  },
};

export const Step2 = {
  args: step2Args,
  argTypes: step2ArgTypes,
  render: (args) => <Step2ConfirmationDialogStory {...args} />,

  parameters: {
    id: 'redeem-itn-wallets-story',
  },
};

export const Step3Success = {
  args: step3SuccessArgs,
  argTypes: step3SuccessArgTypes,
  render: (args) => <Step3SuccessDialogStory {...args} />,
  name: 'Step 3 - Success',

  parameters: {
    id: 'redeem-itn-wallets-story',
  },
};

export const Step3Failure = {
  render: Step3FailureDialogStory,
  name: 'Step 3 - Failure',

  parameters: {
    id: 'redeem-itn-wallets-story',
  },
};

export const NoWallets = {
  render: NoWalletsDialogDialogStory,

  parameters: {
    id: 'redeem-itn-wallets-story',
  },
};

export const RedemptionUnavailable = {
  args: redemptionUnavailableArgs,
  argTypes: redemptionUnavailableArgTypes,
  render: (args) => <RedemptionUnavailableDialogDialogStory {...args} />,

  parameters: {
    id: 'redeem-itn-wallets-story',
  },
};
