import React from 'react';
import { action } from '@storybook/addon-actions';
import moment from 'moment';
import { defineMessages } from 'react-intl';
import type { Locale } from '../../../../../source/common/types/locales.types';
// Screens
import WalletSettings from '../../../../../source/renderer/app/components/wallet/settings/WalletSettings';
import ChangeSpendingPasswordDialog from '../../../../../source/renderer/app/components/wallet/settings/ChangeSpendingPasswordDialog';
import PublicKeyQRCodeDialog from '../../../../../source/renderer/app/components/wallet/settings/ICOPublicKeyQRCodeDialog';
import WalletPublicKeyDialog from '../../../../../source/renderer/app/components/wallet/settings/WalletPublicKeyDialog';
import WalletSettingsRemoveConfirmationDialog from '../../../../../source/renderer/app/components/wallet/settings/WalletSettingsRemoveConfirmationDialog';
import WalletRecoveryPhraseStep1Dialog from '../../../../../source/renderer/app/components/wallet/settings/WalletRecoveryPhraseStep1Dialog';
import WalletRecoveryPhraseStep2Dialog from '../../../../../source/renderer/app/components/wallet/settings/WalletRecoveryPhraseStep2Dialog';
import WalletRecoveryPhraseStep3Dialog from '../../../../../source/renderer/app/components/wallet/settings/WalletRecoveryPhraseStep3Dialog';
import WalletRecoveryPhraseStep4Dialog from '../../../../../source/renderer/app/components/wallet/settings/WalletRecoveryPhraseStep4Dialog';
import {
  RECOVERY_PHRASE_VERIFICATION_STATUSES,
  RECOVERY_PHRASE_VERIFICATION_TIMES,
  RECOVERY_PHRASE_VERIFICATION_TYPES,
} from '../../../../../source/renderer/app/config/walletRecoveryPhraseVerificationConfig';
import ICOPublicKeyDialog from '../../../../../source/renderer/app/components/wallet/settings/ICOPublicKeyDialog';
import {
  ICO_PUBLIC_KEY_DERIVATION_PATH,
  WALLET_PUBLIC_KEY_DERIVATION_PATH,
} from '../../../../../source/renderer/app/config/walletsConfig';
import type { ReactIntlMessage } from '../../../../../source/renderer/app/types/i18nTypes';
import {
  inCategory,
  labelOptionsFrom,
  optionsFrom,
} from '../../../_support/argTypes';

/* eslint-disable react/display-name  */
const basicSettingsId = 'Basic Settings';
const changePasswordId = 'Change Password';
const undelegateWalletId = 'Undelegate Wallet';
const deleteWalletId = 'Delete Wallet';
const walletPublicKeyId = 'Wallet Public Key';
const icoPublicKeyId = 'ICO Public Key';
const recoveryPhraseId = 'Recovery Phrase';
const recoveryPhraseVerificationDateOptions = {
  'Never Checked - Ok': {
    type: RECOVERY_PHRASE_VERIFICATION_TYPES.NEVER_VERIFIED,
    status: RECOVERY_PHRASE_VERIFICATION_STATUSES.OK,
  },
  'Never Checked - Warning': {
    type: RECOVERY_PHRASE_VERIFICATION_TYPES.NEVER_VERIFIED,
    status: RECOVERY_PHRASE_VERIFICATION_STATUSES.WARNING,
  },
  'Never Checked - Notification': {
    type: RECOVERY_PHRASE_VERIFICATION_TYPES.NEVER_VERIFIED,
    status: RECOVERY_PHRASE_VERIFICATION_STATUSES.NOTIFICATION,
  },
  'Already Checked - Ok': {
    type: RECOVERY_PHRASE_VERIFICATION_TYPES.ALREADY_VERIFIED,
    status: RECOVERY_PHRASE_VERIFICATION_STATUSES.OK,
  },
  'Already Checked - Warning': {
    type: RECOVERY_PHRASE_VERIFICATION_TYPES.ALREADY_VERIFIED,
    status: RECOVERY_PHRASE_VERIFICATION_STATUSES.WARNING,
  },
  'Already Checked - Notification': {
    type: RECOVERY_PHRASE_VERIFICATION_TYPES.ALREADY_VERIFIED,
    status: RECOVERY_PHRASE_VERIFICATION_STATUSES.NOTIFICATION,
  },
};
const recoveryDialogOptions = {
  None: 0,
  'Step 1 - Explanation': 1,
  'Step 2 - Verification': 2,
  'Step 3 - Verification successful': 3,
  'Step 4 - Verification failure': 4,
};
// Args, grouped as the knobs were grouped. Two controls were labelled
// `Wallet Name` in different groups, which addon-knobs keys separately, so the
// second is named for the dialog it fills.
const basicSettingsArgs = {
  walletName: 'Wallet Name',
  hasWalletFunds: false,
  isBackupNoticeAccepted: false,
};

const changePasswordArgs = {
  showChangePasswordDialog: false,
  isSpendingPasswordSet: false,
  changePasswordWalletName: 'Wallet Name',
  changePasswordIsSubmitting: false,
};

const deleteWalletArgs = {
  showDeleteWalletDialog: false,
  removeConfirmationWalletName: 'Wallet To Delete',
  deleteWalletConfirmationValue: 'Wallet name',
  deleteWalletIsSubmitting: false,
  unpairWalletConfirmationValue: 'Wallet name',
  unpairWalletIsSubmitting: false,
};

const recoveryPhraseArgs = {
  recoveryPhraseVerification: 'Already Checked - Ok',
  activeDialog: recoveryDialogOptions.None,
};

const publicKeyArgs = {
  publicKeyQrCodeWalletName: 'Wallet',
};

const undelegateArgs = {
  delegationStatus: 'delegating',
};

// The two countdown knobs passed their group id where the number options
// belong, so neither was ever in a group. Left ungrouped, as they rendered.
const ungroupedArgs = {
  isLegacy: false,
  deleteWalletCountdown: 9,
  unpairWalletCountdown: 9,
  wordCount: 12,
  shouldDisplayRecoveryPhrase: true,
};

export const walletSettingsScreenArgs = {
  ...basicSettingsArgs,
  ...changePasswordArgs,
  ...deleteWalletArgs,
  ...recoveryPhraseArgs,
  ...publicKeyArgs,
  ...undelegateArgs,
  ...ungroupedArgs,
};

export const walletSettingsScreenArgTypes = {
  ...inCategory('Basic Settings', basicSettingsArgs),
  ...inCategory('Change Password', changePasswordArgs),
  ...inCategory('Delete Wallet', deleteWalletArgs),
  ...inCategory('Recovery Phrase', recoveryPhraseArgs, {
    // The options were verification records. An argType's options have to be
    // primitives, so the arg holds the label and the screen looks the record up.
    recoveryPhraseVerification: labelOptionsFrom(
      recoveryPhraseVerificationDateOptions
    ),
    activeDialog: optionsFrom(recoveryDialogOptions),
  }),
  ...inCategory('Wallet Public Key', publicKeyArgs),
  ...inCategory('Undelegate Wallet', undelegateArgs, {
    delegationStatus: optionsFrom({
      Delegating: 'delegating',
      'Not delegating': 'not_delegating',
    }),
  }),
};

const getWalletDates = (type: string, status: string) => {
  let date = new Date();
  if (status === 'warning')
    date = moment()
      .subtract(RECOVERY_PHRASE_VERIFICATION_TIMES.warning + 10, 'days')
      .toDate();
  else if (status === 'notification')
    date = moment()
      .subtract(RECOVERY_PHRASE_VERIFICATION_TIMES.notification + 10, 'days')
      .toDate();
  const recoveryPhraseVerificationDate = date;
  const creationDate = date;
  return {
    recoveryPhraseVerificationDate,
    creationDate,
  };
};

type Props = { locale: Locale } & typeof walletSettingsScreenArgs;

export default function (props: Props) {
  const { locale } = props;
  const { type, status } =
    recoveryPhraseVerificationDateOptions[props.recoveryPhraseVerification];
  const { recoveryPhraseVerificationDate, creationDate } = getWalletDates(
    type,
    status
  );
  const recoveryDialog = props.activeDialog;
  const delegationStakePoolStatus = props.delegationStatus;
  const walletMessages: Record<string, ReactIntlMessage> = defineMessages({
    dialogTitle: {
      id: 'wallet.settings.walletPublicKey',
      defaultMessage: '!!!Wallet Public Key',
      description: 'Title for the "Wallet Public Key QR Code" dialog.',
    },
    copyPublicKeyLabel: {
      id: 'wallet.settings.copyPublicKey',
      defaultMessage: '!!!Copy public key',
      description: 'Copy public key label.',
    },
  });
  const icoMessages: Record<string, ReactIntlMessage> = defineMessages({
    dialogTitle: {
      id: 'wallet.settings.icoPublicKey',
      defaultMessage: '!!!ICO Public Key',
      description: 'Title for the "ICO Public Key QR Code" dialog.',
    },
    copyPublicKeyLabel: {
      id: 'wallet.settings.copyPublicKey',
      defaultMessage: '!!!Copy public key',
      description: 'Copy public key label.',
    },
  });
  return (
    <WalletSettings
      isLegacy={props.isLegacy}
      isDialogOpen={(dialog) => {
        if (dialog === ChangeSpendingPasswordDialog) {
          return props.showChangePasswordDialog;
        }

        if (dialog === WalletSettingsRemoveConfirmationDialog) {
          return props.showDeleteWalletDialog;
        }

        if (dialog === WalletRecoveryPhraseStep1Dialog) {
          return recoveryDialog === 1;
        }

        if (dialog === WalletRecoveryPhraseStep2Dialog) {
          return recoveryDialog === 2;
        }

        if (dialog === WalletRecoveryPhraseStep3Dialog) {
          return recoveryDialog === 3;
        }

        if (dialog === WalletRecoveryPhraseStep4Dialog) {
          return recoveryDialog === 4;
        }

        return false;
      }}
      // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
      activeField={null}
      isInvalid={false}
      isSubmitting={false}
      lastUpdatedField={null}
      nameValidator={() => true}
      onCancel={() => {}}
      onFieldValueChange={() => {}}
      onStartEditing={() => {}}
      onStopEditing={() => {}}
      openDialogAction={() => {}}
      walletId="walletId"
      walletName={props.walletName}
      delegationStakePoolStatus={delegationStakePoolStatus}
      lastDelegationStakePoolStatus={delegationStakePoolStatus}
      isRestoring={false}
      isSyncing={false}
      walletPublicKey={walletPublicKeyId}
      icoPublicKey={icoPublicKeyId}
      spendingPasswordUpdateDate={moment().subtract(1, 'month').toDate()}
      isSpendingPasswordSet={props.isSpendingPasswordSet}
      changeSpendingPasswordDialog={
        <ChangeSpendingPasswordDialog
          walletName={props.changePasswordWalletName}
          currentPasswordValue="current"
          newPasswordValue="new"
          repeatedPasswordValue="new"
          isSpendingPasswordSet={props.isSpendingPasswordSet}
          onSave={action('Change Password - onSave')}
          onCancel={action('Change Password - onCancel')}
          // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
          onPasswordSwitchToggle={action(
            'Change Password - onPasswordSwitchToggle'
          )}
          onDataChange={action('Change Password - onDataChange')}
          isSubmitting={props.changePasswordIsSubmitting}
          error={null}
          currentLocale={'en-US'}
        />
      }
      walletPublicKeyDialogContainer={
        <WalletPublicKeyDialog
          onRevealPublicKey={action('onRevealPublicKey')}
          onClose={action('onCancel')}
          error={null}
          walletName={'Test Wallet'}
          hasReceivedWalletPublicKey
        />
      }
      icoPublicKeyDialogContainer={
        <ICOPublicKeyDialog
          onRevealPublicKey={action('onRevealICOPublicKey')}
          onClose={action('onCancel')}
          hasReceivedICOPublicKey
          error={null}
          walletName={'ICO Test Wallet'}
        />
      }
      walletPublicKeyQRCodeDialogContainer={
        <PublicKeyQRCodeDialog
          walletName={props.publicKeyQrCodeWalletName}
          walletPublicKey={walletPublicKeyId}
          onCopyWalletPublicKey={action('Wallet Public Key QR Code - copy')}
          onClose={action('Wallet Public Key QR Code - onClose')}
          messages={walletMessages}
          derivationPath={WALLET_PUBLIC_KEY_DERIVATION_PATH}
        />
      }
      icoPublicKeyQRCodeDialogContainer={
        <PublicKeyQRCodeDialog
          walletName={props.publicKeyQrCodeWalletName}
          walletPublicKey={icoPublicKeyId}
          onCopyWalletPublicKey={action('ICO Public Key QR Code - copy')}
          onClose={action('ICO Public Key QR Code - onClose')}
          messages={icoMessages}
          derivationPath={ICO_PUBLIC_KEY_DERIVATION_PATH}
        />
      }
      // WalletSettings renders this only from renderUndelegateWalletBox, which
      // returns null while IS_WALLET_UNDELEGATION_ENABLED is false. The dialog
      // has its own story in UndelegateWallet.stories.tsx.
      undelegateWalletDialogContainer={null}
      deleteWalletDialogContainer={
        <WalletSettingsRemoveConfirmationDialog
          walletName={props.removeConfirmationWalletName}
          hasWalletFunds={props.hasWalletFunds}
          countdownFn={() => props.deleteWalletCountdown}
          isBackupNoticeAccepted={props.isBackupNoticeAccepted}
          onAcceptBackupNotice={action('Delete Wallet - onAcceptBackupNotice')}
          onContinue={action('Delete Wallet - onContinue')}
          onCancel={action('Delete Wallet - onCancel')}
          confirmationValue={props.deleteWalletConfirmationValue}
          onConfirmationValueChange={action(
            'Delete Wallet - onConfirmationValueChange'
          )}
          isSubmitting={props.deleteWalletIsSubmitting}
        />
      }
      unpairWalletDialogContainer={
        <WalletSettingsRemoveConfirmationDialog
          walletName={props.removeConfirmationWalletName}
          hasWalletFunds={props.hasWalletFunds}
          countdownFn={() => props.unpairWalletCountdown}
          isBackupNoticeAccepted={props.isBackupNoticeAccepted}
          onAcceptBackupNotice={action('Unpair Wallet - onAcceptBackupNotice')}
          onContinue={action('Unpair Wallet - onContinue')}
          onCancel={action('Unpair Wallet - onCancel')}
          confirmationValue={props.unpairWalletConfirmationValue}
          onConfirmationValueChange={action(
            'Unpair Wallet - onConfirmationValueChange'
          )}
          isSubmitting={props.unpairWalletIsSubmitting}
        />
      }
      onVerifyRecoveryPhrase={action('onVerifyRecoveryPhrase')}
      onCopyWalletPublicKey={() => null}
      onCopyICOPublicKey={() => null}
      updateDataForActiveDialogAction={() => null}
      onDelegateClick={() => null}
      getWalletPublicKey={() => null}
      creationDate={creationDate}
      recoveryPhraseVerificationDate={recoveryPhraseVerificationDate}
      recoveryPhraseVerificationStatus={
        status || RECOVERY_PHRASE_VERIFICATION_STATUSES.OK
      }
      recoveryPhraseVerificationStatusType={
        type || RECOVERY_PHRASE_VERIFICATION_TYPES.NEVER_VERIFIED
      }
      locale={locale}
      wordCount={props.wordCount}
      shouldDisplayRecoveryPhrase={props.shouldDisplayRecoveryPhrase}
      isHardwareWallet={false}
      isDelegating={false}
    />
  );
}
