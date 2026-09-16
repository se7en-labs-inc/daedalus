import React from 'react';
import TopBarContainerComponent from '../../../../source/renderer/app/containers/TopBarContainer';
import { ROUTES } from '../../../../source/renderer/app/routes-config';
import environment from '../../_support/environment';
import { screenDecorator } from '../../_support/harness/ScreenStory';
import { populatedNewsFeed } from '../../_support/harness/fixtures/news';

/*
 * The bar reads seven stores and almost all of it is conditional. The wallet
 * title appears only on a wallet route with an active wallet, the sub-menu
 * toggle only when there are wallets to toggle between, the network label only
 * off mainnet, and the news dot only with something unread.
 *
 * With none of those true it is a row of icons and no words, which is the state
 * a fresh installation opens in and the first two stories here.
 */
const ON_A_WALLET = '/wallets/0/summary';

/*
 * The only container in the corpus that still declares `stores` and `actions` as
 * required props after `inject` has supplied them. Every other one is a class
 * with `static defaultProps`, which satisfies the checker; this one is a function
 * whose defaults are in its parameter list, which does not. The application hits
 * the same thing and suppresses it at MainLayout.tsx:108.
 *
 * Named for what `inject` produces rather than suppressed, so nothing here is
 * excused from checking beyond the two props the provider is already supplying.
 */
const TopBarContainer =
  TopBarContainerComponent as unknown as React.ComponentType;

export default {
  title: 'Screens / Chrome / Top Bar',
  decorators: [screenDecorator({}, { path: ROUTES.ROOT })],
};

export const Default = {
  render: () => <TopBarContainer />,
  name: 'No wallet open',
};

export const WithUnreadNews = {
  decorators: [
    screenDecorator({ newsFeed: { newsFeedData: populatedNewsFeed() } }),
  ],
  render: () => <TopBarContainer />,
  name: 'With unread news',
};

/*
 * The wallet title is gated on the route matching a wallet page as well as on a
 * wallet being active, so this story has to be somewhere specific rather than
 * merely have a wallet selected.
 */
export const WithActiveWallet = {
  decorators: [
    screenDecorator(
      { wallets: { isWalletRoute: true, hasAnyWallets: true } },
      { path: ON_A_WALLET }
    ),
  ],
  render: () => <TopBarContainer />,
  name: 'On a wallet',
};

export const OnATestNetwork = {
  // The network label, which exists to stop someone mistaking a testnet build
  // for the real one.
  decorators: [
    screenDecorator({
      app: {
        environment: { ...environment, isMainnet: false, network: 'preprod' },
      },
    }),
  ],
  render: () => <TopBarContainer />,
  name: 'On a test network',
};
