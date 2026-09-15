import React from 'react';
import moment from 'moment';
import { action } from '@storybook/addon-actions';
import {
  LEGACY_WALLET_RECOVERY_PHRASE_WORD_COUNT,
  WALLET_RECOVERY_PHRASE_WORD_COUNT,
} from '../../../../source/renderer/app/config/cryptoConfig';
import { RECOVERY_PHRASE_VERIFICATION_TIMES as times } from '../../../../source/renderer/app/config/walletRecoveryPhraseVerificationConfig';
// Helpers
import StoryDecorator from '../../_support/StoryDecorator';
// Screens
import WalletRecoveryPhraseVerificationWidget from '../../../../source/renderer/app/components/wallet/settings/WalletRecoveryPhraseVerificationWidget';
import { localeOf } from '../../_support/globals';
import { inCategory, inlineRadioOptionsFrom } from '../../_support/argTypes';

// The two date selects offered moment objects. An argType's options have to be
// primitives, because an option travels in the URL, so the arg holds the label
// and the story resolves it. The labels are fixed; the moments they name are
// still computed per render, which is what keeps them relative to now.
const verificationTimeLabels = [
  '1 month ago',
  '2 months',
  '5 months ago',
  '6+ months ago',
  '1 year ago',
];

const creationTimeLabels = [
  '1 month ago',
  '2 months',
  '3-5 months',
  '5 months ago',
  '1 week left for 6 months',
  '6+ months ago',
  '1 year ago',
];

const wordCountOptions = {
  [WALLET_RECOVERY_PHRASE_WORD_COUNT]: `${WALLET_RECOVERY_PHRASE_WORD_COUNT}`,
  [LEGACY_WALLET_RECOVERY_PHRASE_WORD_COUNT]: `${LEGACY_WALLET_RECOVERY_PHRASE_WORD_COUNT}`,
};

const widgetArgs = {
  wordCount: `${WALLET_RECOVERY_PHRASE_WORD_COUNT}`,
  wasAlreadyVerified: false,
  walletCreationDate: '1 month ago',
  lastVerificationDate: '1 month ago',
};

export default {
  title: 'Wallets / Settings',

  decorators: [(story) => <StoryDecorator>{story()}</StoryDecorator>],
};

export const RecoveryPraseVerificationWidget = {
  args: { ...widgetArgs, containerStyle: { padding: 20 }, isLegacy: true },

  argTypes: {
    ...inCategory('Recovery Phrase Verification', widgetArgs, {
      wordCount: inlineRadioOptionsFrom(wordCountOptions),
      walletCreationDate: {
        options: creationTimeLabels,
        control: { type: 'select' },
      },
      lastVerificationDate: {
        options: verificationTimeLabels,
        control: { type: 'select' },
      },
    }),
    containerStyle: { control: 'object' },
  },

  render: (
    {
      wordCount,
      wasAlreadyVerified,
      walletCreationDate,
      lastVerificationDate,
      containerStyle,
      isLegacy,
    },
    context
  ) => {
    const locale = localeOf(context);
    const veriticationTimeOptions = {
      '1 month ago': moment().subtract(30, 'days'),
      '2 months': moment().subtract(30 * 2, 'days'),
      '5 months ago': moment().subtract(30 * 5, 'days'),
      '6+ months ago': moment().subtract(times.warning + 1, 'days'),
      '1 year ago': moment().subtract(times.notification + 1, 'days'),
    };
    const creationTimeOptions = {
      '1 month ago': moment().subtract(30, 'days'),
      '2 months': moment().subtract(60, 'days'),
      '3-5 months': moment().subtract(times.okFewMonths + 1, 'days'),
      '5 months ago': moment().subtract(times.okFewWeeks + 1, 'days'),
      '1 week left for 6 months': moment().subtract(
        times.okFewDays + 1,
        'days'
      ),
      '6+ months ago': moment().subtract(times.warning + 1, 'days'),
      '1 year ago': moment().subtract(times.notification + 1, 'days'),
    };
    const creationDate = !wasAlreadyVerified
      ? creationTimeOptions[walletCreationDate]
      : creationTimeOptions['1 month ago'];
    const recoveryPhraseVerificationDate = wasAlreadyVerified
      ? veriticationTimeOptions[lastVerificationDate]
      : null;
    return (
      <div style={containerStyle} className="WalletSettings_component">
        <WalletRecoveryPhraseVerificationWidget
          // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
          creationDate={new Date(creationDate)}
          locale={locale}
          onVerify={action('onVerify')}
          // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
          recoveryPhraseVerificationDate={recoveryPhraseVerificationDate}
          wordCount={parseInt(wordCount, 10)}
          isLegacy={isLegacy}
        />
      </div>
    );
  },

  name: 'Recovery Prase Verification - Widget',
};
