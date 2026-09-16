import React from 'react';
import WalletTransactionsPage from '../../../../source/renderer/app/containers/wallet/WalletTransactionsPage';
import { asScreen, screenDecorator } from '../../_support/harness/ScreenStory';
import { withTransactions } from '../../_support/harness/fixtures/transactions';
import {
  withAddresses,
  withAssets,
} from '../../_support/harness/fixtures/assets';

/*
 * The full transaction list, as against the five the summary screen shows. Every
 * row asks the addresses store whether each address is one of the wallet's own,
 * so the address list and the transactions have to agree or every row is drawn
 * as external.
 */
const ON_THIS_WALLET = '/wallets/story-wallet-0/transactions';

const TransactionsPage = asScreen(WalletTransactionsPage);

export default {
  title: 'Screens / Wallets / Wallet Transactions',
  decorators: [
    screenDecorator(
      {
        transactions: withTransactions(8),
        addresses: withAddresses(),
        assets: withAssets(),
      },
      { path: ON_THIS_WALLET }
    ),
  ],
};

export const Default = {
  render: () => <TransactionsPage />,
  name: 'With transactions',
};

export const Empty = {
  // A wallet that has never been used, which gets its own screen rather than an
  // empty list.
  decorators: [screenDecorator({}, { path: ON_THIS_WALLET })],
  render: () => <TransactionsPage />,
  name: 'No transactions yet',
};
