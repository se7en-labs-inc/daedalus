import React from 'react';
import { action } from 'storybook/actions';
import { stakingDecorator } from './_support/decorator';
import DelegationCenterNoWallets from '../../../source/renderer/app/components/staking/delegation-center/DelegationCenterNoWallets';
import {
  StakePoolsStory,
  stakePoolsArgTypes,
  stakePoolsArgs,
} from './_support/StakePools';
import { StakingRewardsStory } from './_support/Rewards';
import {
  StakingDelegationCenterStory,
  delegationCenterArgTypes,
  delegationCenterArgs,
} from './_support/DelegationCenter';
import {
  StakingDelegationSteps,
  delegationStepsArgTypes,
  delegationStepsArgs,
} from './_support/DelegationSteps';
import {
  StakingUndelegateConfirmationStory,
  undelegateConfirmationArgs,
  StakingUndelegateConfirmationResultStory,
} from './_support/Undelegate';
import {
  StakePoolsTableStory,
  stakePoolsTableArgTypes,
  stakePoolsTableArgs,
} from './_support/StakePoolsTable';
import { currentThemeOf, localeOf } from '../_support/globals';
import { rangeFrom } from '../_support/argTypes';

export default {
  title: 'Decentralization / Staking',
  decorators: [stakingDecorator],
};

export const DelegationCenter = {
  args: delegationCenterArgs,
  argTypes: delegationCenterArgTypes,

  render: (args, context) => (
    <StakingDelegationCenterStory
      {...args}
      locale={localeOf(context)}
      currentTheme={currentThemeOf(context)}
      isLoading={false}
      isEpochsInfoAvailable
    />
  ),

  parameters: {
    id: 'delegation-center',
  },
};

export const DelegationCenterLoading = {
  args: delegationCenterArgs,
  argTypes: delegationCenterArgTypes,

  render: (args, context) => (
    <StakingDelegationCenterStory
      {...args}
      locale={localeOf(context)}
      currentTheme={currentThemeOf(context)}
      isLoading
      isEpochsInfoAvailable
    />
  ),

  name: 'Delegation Center - Loading',

  parameters: {
    id: 'delegation-center-loading',
  },
};

export const DelegationCenterNotAnShelleyEra = {
  args: delegationCenterArgs,
  argTypes: delegationCenterArgTypes,

  render: (args, context) => (
    <StakingDelegationCenterStory
      {...args}
      locale={localeOf(context)}
      currentTheme={currentThemeOf(context)}
      isLoading={false}
      isEpochsInfoAvailable={false}
    />
  ),

  name: 'Delegation Center - Not an Shelley era',

  parameters: {
    id: 'delegation-center-loading',
  },
};

export const _DelegationCenterNoWallets = {
  args: { minDelegationFunds: 10 },

  render: ({ minDelegationFunds }) => (
    <DelegationCenterNoWallets
      onGoToCreateWalletClick={action('onGoToCreateWalletClick')}
      minDelegationFunds={minDelegationFunds}
    />
  ),

  name: 'Delegation Center - No Wallets',
};

export const PoolsIndex = {
  args: stakePoolsArgs,
  argTypes: stakePoolsArgTypes,

  render: (args, context) => (
    <StakePoolsStory
      {...args}
      locale={localeOf(context)}
      currentTheme={currentThemeOf(context)}
      isLoading={false}
    />
  ),

  parameters: {
    id: 'stake-pools',
  },
};

export const PoolsIndexLoading = {
  args: stakePoolsArgs,
  argTypes: stakePoolsArgTypes,

  render: (args, context) => (
    <StakePoolsStory
      {...args}
      locale={localeOf(context)}
      currentTheme={currentThemeOf(context)}
      isLoading
    />
  ),

  name: 'Pools Index - Loading',

  parameters: {
    id: 'stake-pools-loading',
  },
};

export const StakePoolsList = {
  args: stakePoolsTableArgs,
  argTypes: stakePoolsTableArgTypes,

  render: (args, context) => (
    <StakePoolsTableStory {...args} currentTheme={currentThemeOf(context)} />
  ),

  parameters: {
    id: 'stake-pools-table',
  },
};

export const Rewards = {
  render: () => <StakingRewardsStory />,

  parameters: {
    id: 'rewards',
  },
};

export const DelegationWizard = {
  args: { ...delegationStepsArgs, oversaturationPercentage: 0 },

  argTypes: {
    ...delegationStepsArgTypes,
    oversaturationPercentage: rangeFrom({ min: 0, max: 1000, step: 1 }),
  },

  render: (args, context) => {
    return (
      <StakingDelegationSteps
        {...args}
        locale={localeOf(context)}
        currentTheme={currentThemeOf(context)}
      />
    );
  },

  parameters: {
    id: 'wizard',
  },
};

export const DelegationWizardDelegationNotAvailable = {
  args: delegationStepsArgs,
  argTypes: delegationStepsArgTypes,

  render: (args, context) => (
    <StakingDelegationSteps
      {...args}
      locale={localeOf(context)}
      currentTheme={currentThemeOf(context)}
      oversaturationPercentage={0}
      isDisabled
    />
  ),
  name: 'Delegation Wizard - Delegation Not Available',

  parameters: {
    id: 'wizard',
  },
};

export const UndelegateConfirmation = {
  args: { ...undelegateConfirmationArgs, isHardwareWallet: false },
  render: (args) => <StakingUndelegateConfirmationStory {...args} />,

  parameters: {
    id: 'undelegate-confirmation',
  },
};

export const UndelegateConfirmationUnknownnStakePool = {
  args: undelegateConfirmationArgs,

  render: (args) => (
    <StakingUndelegateConfirmationStory {...args} unknownStakePool />
  ),

  name: 'Undelegate Confirmation - unknownn stake pool',

  parameters: {
    id: 'undelegate-confirmation-unknown-pool',
  },
};

export const UndelegateConfirmationResult = {
  render: (_args, context) => (
    <StakingUndelegateConfirmationResultStory locale={localeOf(context)} />
  ),

  parameters: {
    id: 'undelegate-confirmation-result',
  },
};
