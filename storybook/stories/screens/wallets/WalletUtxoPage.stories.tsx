import React from 'react';
import WalletUtxoPage from '../../../../source/renderer/app/containers/wallet/WalletUtxoPage';
import { screenDecorator } from '../../_support/harness/ScreenStory';
import { requestDefault } from '../../_support/harness/storeDefaults';

/*
 * The UTxO distribution histogram. It reads its data from a polled request, so
 * the screen has two states that matter: the first poll still outstanding, and a
 * distribution to draw.
 *
 * The buckets are powers of ten in lovelace, which is the shape
 * `getUtxoChartData` expects rather than a choice made here.
 */
const ON_THIS_WALLET = '/wallets/story-wallet-0/utxo';

const distribution = {
  '10': 0,
  '100': 0,
  '1000': 3,
  '10000': 11,
  '100000': 27,
  '1000000': 42,
  '10000000': 18,
  '100000000': 6,
  '1000000000': 2,
  '10000000000': 1,
  '100000000000': 0,
  '1000000000000': 0,
  '10000000000000': 0,
  '100000000000000': 0,
  '1000000000000000': 0,
  '10000000000000000': 0,
  '45000000000000000': 0,
};

export default {
  title: 'Screens / Wallets / Wallet UTxO',
  decorators: [
    screenDecorator(
      {
        walletSettings: {
          walletUtxos: { distribution },
          getWalletUtxosRequest: requestDefault({ wasExecuted: true }),
        },
      },
      { path: ON_THIS_WALLET }
    ),
  ],
};

export const Default = {
  render: () => <WalletUtxoPage />,
  name: 'With a distribution',
};

export const Loading = {
  // The first poll has not come back. The screen distinguishes this from an
  // empty wallet, which is why the request state is part of the fixture.
  decorators: [
    screenDecorator(
      {
        walletSettings: {
          walletUtxos: null,
          getWalletUtxosRequest: requestDefault({
            wasExecuted: false,
            isExecutingFirstTime: true,
          }),
        },
      },
      { path: ON_THIS_WALLET }
    ),
  ],
  render: () => <WalletUtxoPage />,
  name: 'Waiting for the first poll',
};

export const WithPendingTransactions = {
  decorators: [
    screenDecorator(
      {
        walletSettings: {
          walletUtxos: { distribution },
          getWalletUtxosRequest: requestDefault({ wasExecuted: true }),
        },
        transactions: { pendingTransactionsCount: 3 },
      },
      { path: ON_THIS_WALLET }
    ),
  ],
  render: () => <WalletUtxoPage />,
  name: 'With transactions pending',
};
