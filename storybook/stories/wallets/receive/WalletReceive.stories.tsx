import React from 'react';
import { action } from 'storybook/actions';
// Assets and helpers
import WalletsWrapper, { walletsLayoutArgs } from '../_utils/WalletsWrapper';
import { localeOf } from '../../_support/globals';
import { generateAddress } from '../../_support/utils';
// Screens
import WalletReceiveSequential from '../../../../source/renderer/app/components/wallet/receive/WalletReceiveSequential';
import WalletReceiveRandom from '../../../../source/renderer/app/components/wallet/receive/WalletReceiveRandom';
import WalletReceiveDialog from '../../../../source/renderer/app/components/wallet/receive/WalletReceiveDialog';
import VerticalFlexContainer from '../../../../source/renderer/app/components/layout/VerticalFlexContainer';
import { HwDeviceStatuses } from '../../../../source/renderer/app/domains/Wallet';
import { optionsFrom } from '../../_support/argTypes';

const onToggleSubMenus = {
  listen: action('onToggleSubMenus:listen'),
  remove: action('onToggleSubMenus:remove'),
};

export default {
  title: 'Wallets / Receive',
  args: walletsLayoutArgs,
  decorators: [WalletsWrapper],
};

export const ReceiveSequential = {
  args: {
    showDialog: false,
    addressesUsed: 2,
    addresses: 10,
    showUsed: false,
    isTrezor: false,
  },

  render: (
    { showDialog, addressesUsed, addresses, showUsed, isTrezor },
    context
  ) => {
    const locale = localeOf(context);
    return (
      <VerticalFlexContainer>
        <WalletReceiveSequential
          walletAddresses={[
            ...Array.from(Array(addressesUsed)).map(() =>
              generateAddress(true)
            ),
            ...Array.from(Array(addresses)).map(() => generateAddress()),
          ]}
          onShareAddress={action('onShareAddress')}
          onCopyAddress={action('onCopyAddress')}
          // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
          isAddressValid={() => parseInt(Math.random() * 10, 10) > 3}
          currentLocale={locale}
          showUsed={showUsed}
          onToggleUsedAddresses={action('onToggleUsedAddresses')}
          onToggleSubMenus={onToggleSubMenus}
          isShowingSubMenus
        />
        {showDialog && (
          <WalletReceiveDialog
            address={generateAddress()}
            onCopyAddress={action('onCopyAddress')}
            onDownloadPDF={action('onDownloadPDF')}
            onSaveQRCodeImage={action('onSaveQRCodeImage')}
            onClose={action('onClose')}
            hwDeviceStatus={HwDeviceStatuses.CONNECTING}
            isHardwareWallet={false}
            walletName="Wallet 1"
            isAddressDerived={false}
            isAddressChecked={false}
            onChangeVerificationStatus={action('onChangeVerificationStatus')}
            onSupportRequestClick={action('onSupportRequestClick')}
            isTrezor={isTrezor}
          />
        )}
      </VerticalFlexContainer>
    );
  },

  name: 'Receive - sequential',
};

export const ReceiveSequentialWithAddressVerification = {
  args: {
    addressesUsed: 2,
    addresses: 10,
    showUsed: false,
    addressVerificationState: HwDeviceStatuses.VERIFYING_ADDRESS,
    isAddressDerived: false,
    isAddressChecked: false,
    isTrezor: false,
  },

  argTypes: {
    addressVerificationState: optionsFrom({
      Verify: HwDeviceStatuses.VERIFYING_ADDRESS,
      Verified: HwDeviceStatuses.VERIFYING_ADDRESS_SUCCEEDED,
      Errored: HwDeviceStatuses.VERIFYING_ADDRESS_FAILED,
    }),
  },

  render: (
    {
      addressesUsed,
      addresses,
      showUsed,
      addressVerificationState,
      isAddressDerived,
      isAddressChecked,
      isTrezor,
    },
    context
  ) => {
    const locale = localeOf(context);
    return (
      <VerticalFlexContainer>
        <WalletReceiveSequential
          walletAddresses={[
            ...Array.from(Array(addressesUsed)).map(() =>
              generateAddress(true)
            ),
            ...Array.from(Array(addresses)).map(() => generateAddress()),
          ]}
          onShareAddress={action('onShareAddress')}
          onCopyAddress={action('onCopyAddress')}
          // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
          isAddressValid={() => parseInt(Math.random() * 10, 10) > 3}
          currentLocale={locale}
          onToggleSubMenus={onToggleSubMenus}
          isShowingSubMenus
          onToggleUsedAddresses={action('onToggleUsedAddresses')}
          showUsed={showUsed}
        />
        <WalletReceiveDialog
          address={generateAddress()}
          onCopyAddress={action('onCopyAddress')}
          onDownloadPDF={action('onDownloadPDF')}
          onSaveQRCodeImage={action('onSaveQRCodeImage')}
          onClose={action('onClose')}
          hwDeviceStatus={addressVerificationState}
          isHardwareWallet
          walletName="Ledger Nano S"
          isAddressDerived={isAddressDerived}
          isAddressChecked={isAddressChecked}
          onChangeVerificationStatus={action('onChangeVerificationStatus')}
          onSupportRequestClick={action('onSupportRequestClick')}
          isTrezor={isTrezor}
        />
      </VerticalFlexContainer>
    );
  },

  name: 'Receive - sequential with address verification',
};

export const ReceiveRandom = {
  args: {
    isSidebarExpanded: false,
    walletHasPassword: false,
    isSubmitting: false,
    addresses: 5,
    addressesUsed: 5,
    showUsed: false,
  },

  render: ({
    isSidebarExpanded,
    walletHasPassword,
    isSubmitting,
    addresses,
    addressesUsed,
    showUsed,
  }) => {
    const walletAddress = generateAddress();
    return (
      <VerticalFlexContainer>
        <WalletReceiveRandom
          walletAddress={walletAddress.id}
          isWalletAddressUsed={walletAddress.used}
          walletAddresses={[
            ...Array.from(Array(addresses)).map(() => generateAddress()),
            ...Array.from(Array(addressesUsed)).map(() =>
              generateAddress(true)
            ),
          ]}
          onGenerateAddress={action('onGenerateAddress')}
          onCopyAddress={action('onCopyAddress')}
          onShareAddress={action('onShareAddress')}
          isSidebarExpanded={isSidebarExpanded}
          walletHasPassword={walletHasPassword}
          isSubmitting={isSubmitting}
          showUsed={showUsed}
          onToggleUsedAddresses={action('onToggleUsedAddresses')}
        />
      </VerticalFlexContainer>
    );
  },

  name: 'Receive - random',
};
