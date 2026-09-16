import React from 'react';
import WalletSendPage from '../../../../source/renderer/app/containers/wallet/WalletSendPage';
import { asScreen, screenDecorator } from '../../_support/harness/ScreenStory';
import {
  hardwareWallet,
  walletWithAssets,
} from '../../_support/harness/fixtures/wallets';
import {
  walletTokens,
  withAssets,
} from '../../_support/harness/fixtures/assets';

/*
 * The send form. It resolves the wallet's tokens against the assets store the
 * same way the token list does, so a wallet holding tokens needs both halves
 * supplied or the asset picker reports itself as still loading.
 */
const ON_THIS_WALLET = '/wallets/story-wallet-0/send';

const SendPage = asScreen(WalletSendPage);

export default {
  title: 'Screens / Wallets / Wallet Send',
  decorators: [screenDecorator({}, { path: ON_THIS_WALLET })],
};

export const Default = {
  render: () => <SendPage />,
  name: 'Ada only',
};

export const WithTokens = {
  decorators: [
    screenDecorator(
      {
        wallets: { active: walletWithAssets(walletTokens()) },
        assets: withAssets(),
      },
      { path: ON_THIS_WALLET }
    ),
  ],
  render: () => <SendPage />,
  name: 'With tokens to send',
};

export const HardwareWallet = {
  // The transaction is signed on the device, so the form ends in a different
  // confirmation path from a software wallet's.
  decorators: [
    screenDecorator(
      { wallets: { active: hardwareWallet() } },
      { path: ON_THIS_WALLET }
    ),
  ],
  render: () => <SendPage />,
  name: 'Hardware wallet',
};
