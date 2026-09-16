import React from 'react';
import WalletReceivePage from '../../../../source/renderer/app/containers/wallet/WalletReceivePage';
import { screenDecorator } from '../../_support/harness/ScreenStory';
import {
  hardwareWallet,
  randomWallet,
} from '../../_support/harness/fixtures/wallets';
import {
  addressList,
  withAddresses,
} from '../../_support/harness/fixtures/assets';

/*
 * Two entirely separate screens behind one container, chosen by how the wallet
 * derives addresses. A Byron wallet shows one address at a time with a button to
 * make another; a Shelley wallet shows the whole list at once. Neither is a
 * variant of the other, and `isRandom` is a computed getter on the wallet rather
 * than a field, so only a real domain wallet reaches the first branch at all.
 */
const ON_THIS_WALLET = '/wallets/story-wallet-0/receive';

export default {
  title: 'Screens / Wallets / Wallet Receive',
  decorators: [
    screenDecorator({ addresses: withAddresses() }, { path: ON_THIS_WALLET }),
  ],
};

export const Default = {
  render: () => <WalletReceivePage />,
  name: 'Sequential addresses',
};

export const Random = {
  decorators: [
    screenDecorator(
      {
        wallets: { active: randomWallet() },
        addresses: { ...withAddresses(), active: addressList()[0] },
      },
      { path: ON_THIS_WALLET }
    ),
  ],
  render: () => <WalletReceivePage />,
  name: 'Byron, one address at a time',
};

export const HardwareWallet = {
  // The address has to be confirmed on the device before it can be trusted, so
  // this screen carries a verification step the others do not.
  decorators: [
    screenDecorator(
      {
        wallets: { active: hardwareWallet() },
        addresses: withAddresses(),
      },
      { path: ON_THIS_WALLET }
    ),
  ],
  render: () => <WalletReceivePage />,
  name: 'Hardware wallet',
};
