import React from 'react';
import WalletTokensPage from '../../../../source/renderer/app/containers/wallet/WalletTokensPage';
import { asScreen, screenDecorator } from '../../_support/harness/ScreenStory';
import { walletWithAssets } from '../../_support/harness/fixtures/wallets';
import {
  walletTokens,
  withAssets,
} from '../../_support/harness/fixtures/assets';

/*
 * The token list. It pairs the wallet's own tokens against the assets store by
 * uniqueId and treats a shortfall as loading still in progress, so the wallet
 * and the store have to be supplied together: a token with no matching asset
 * shows a spinner that never resolves rather than a missing row.
 */
const ON_THIS_WALLET = '/wallets/story-wallet-assets/tokens';

const TokensPage = asScreen(WalletTokensPage);

export default {
  title: 'Screens / Wallets / Wallet Tokens',
  decorators: [
    screenDecorator(
      {
        wallets: { active: walletWithAssets(walletTokens()) },
        assets: withAssets(),
      },
      { path: ON_THIS_WALLET }
    ),
  ],
};

export const Default = {
  render: () => <TokensPage />,
  name: 'With tokens',
};

export const NoTokens = {
  // A wallet holding only ada, which is most of them.
  decorators: [
    screenDecorator(
      { wallets: { active: walletWithAssets([]) } },
      { path: ON_THIS_WALLET }
    ),
  ],
  render: () => <TokensPage />,
  name: 'No tokens',
};

export const LoadingAssets = {
  /*
   * The wallet reports tokens the assets store has not resolved yet. This is
   * the state the join produces on a cold start, and the same state a broken
   * join produces permanently.
   */
  decorators: [
    screenDecorator(
      { wallets: { active: walletWithAssets(walletTokens()) } },
      { path: ON_THIS_WALLET }
    ),
  ],
  render: () => <TokensPage />,
  name: 'Resolving the token names',
};
