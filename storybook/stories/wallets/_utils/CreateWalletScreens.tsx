import React, { Component } from 'react';
import { action } from 'storybook/actions';
import { CREATE_WALLET_STEPS } from '../../../../source/renderer/app/config/walletsConfig';
// Screens
import InstructionsDialog from '../../../../source/renderer/app/components/wallet/wallet-create/InstructionsDialog';
import TemplateDialog from '../../../../source/renderer/app/components/wallet/wallet-create/TemplateDialog';
import MnemonicsDialog from '../../../../source/renderer/app/components/wallet/wallet-create/MnemonicsDialog';
import ValidateDialog from '../../../../source/renderer/app/components/wallet/wallet-create/ValidateDialog';
import HashDialog from '../../../../source/renderer/app/components/wallet/wallet-create/HashDialog';
import ConfigDialog from '../../../../source/renderer/app/components/wallet/wallet-create/ConfigDialog';

type Props = {
  isVideoWatched: boolean;
};
type State = {
  currentStep: number;
};

// The knob this replaced sat in a getter on this class, which is module scope:
// there is no story body to hoist it to, so it arrives as a prop and the story
// that renders this declares the arg.
export const createWalletScreensArgs = {
  isVideoWatched: false,
};

export default class CreateWalletScreens extends Component<Props, State> {
  state = {
    currentStep: 0,
  };

  get dialogs() {
    return {
      instructions: InstructionsDialog,
      template: TemplateDialog,
      mnemonics: MnemonicsDialog,
      validate: ValidateDialog,
      hashImage: HashDialog,
      config: ConfigDialog,
    };
  }

  get dialogProps() {
    return {
      instructions: {
        isVideoWatched: this.props.isVideoWatched,
      },
      template: {},
      mnemonics: {},
      validate: {},
      hashImage: {},
      config: {},
    };
  }

  onContinue = () => {
    const { currentStep } = this.state;
    let nextStep = currentStep + 1;
    if (nextStep > CREATE_WALLET_STEPS.length - 1) nextStep = 0;
    this.setState({
      currentStep: nextStep,
    });
  };

  render() {
    const { currentStep } = this.state;
    const stepId = CREATE_WALLET_STEPS[currentStep];
    const dialogProps = this.dialogProps[stepId];
    const Dialog = this.dialogs[stepId];
    return (
      <Dialog
        onContinue={this.onContinue}
        onClose={action('onClose')}
        {...dialogProps}
      />
    );
  }
}
