import React from 'react';
import WalletSummaryPageContainer from '../../../../source/renderer/app/containers/wallet/WalletSummaryPage';
import { asScreen, screenDecorator } from '../../_support/harness/ScreenStory';
import { requestDefault } from '../../_support/harness/storeDefaults';
import { WALLETS } from '../../_support/StoryProvider';
import { generateMultipleTransactions } from '../../_support/utils';

/*
 * The largest screen in the application by what it reads: nine stores, about
 * twenty-five fields, and a hard throw at `WalletSummaryPage.tsx:119` if the
 * active wallet is missing.
 *
 * It is here as the proof that the override shape scales. Each story below names
 * three stores at most, because the other six are carrying their defaults, and
 * the wallet itself comes from the provider rather than from any story.
 */
const ON_THIS_WALLET = '/wallets/0/summary';

// Wrapped in withAnalytics, so its exported type still asks for the props the
// wrapper supplies. See asScreen.
const WalletSummaryPage = asScreen(WalletSummaryPageContainer);

const withTransactions = {
  hasAny: true,
  recent: generateMultipleTransactions(5),
  totalAvailable: 42,
  pendingTransactionsCount: 1,
};

/*
 * Spread from the provider's own wallet rather than taken from the restoring one
 * in that list, which carries no `assets` and would throw where the screen reads
 * `wallet.assets.total`.
 */
const restoringWallet = { ...WALLETS[0], isRestoring: true };

export default {
  title: 'Screens / Wallets / Wallet Summary',
  decorators: [
    screenDecorator(
      { transactions: withTransactions },
      { path: ON_THIS_WALLET }
    ),
  ],
};

export const Default = {
  render: () => <WalletSummaryPage />,
  name: 'With transactions',
};

/*
 * The first page still in flight. The screen distinguishes this from a later
 * page by `isExecutingFirstTime` rather than `isExecuting`, so a wallet being
 * opened for the first time shows a loading list and a wallet being paged
 * through does not.
 */
export const LoadingFirstPage = {
  decorators: [
    screenDecorator(
      {
        transactions: {
          ...withTransactions,
          recentTransactionsRequest: requestDefault({
            isExecuting: true,
            isExecutingFirstTime: true,
          }),
        },
      },
      { path: ON_THIS_WALLET }
    ),
  ],
  render: () => <WalletSummaryPage />,
  name: 'Loading the first page',
};

export const Restoring = {
  // A wallet still catching up shows its transaction list disabled rather than
  // absent, so this is a different screen from the empty one below.
  decorators: [
    screenDecorator(
      {
        wallets: { active: restoringWallet },
        transactions: withTransactions,
      },
      { path: ON_THIS_WALLET }
    ),
  ],
  render: () => <WalletSummaryPage />,
  name: 'Wallet restoring',
};

export const NoTransactions = {
  // A new wallet, which gets its own component rather than an empty list.
  decorators: [screenDecorator({}, { path: ON_THIS_WALLET })],
  render: () => <WalletSummaryPage />,
  name: 'No transactions yet',
};
