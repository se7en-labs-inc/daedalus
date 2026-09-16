import React from 'react';
import WalletAddPage from '../../../../source/renderer/app/containers/wallet/WalletAddPage';
import { screenDecorator } from '../../_support/harness/ScreenStory';
import { ROUTES } from '../../../../source/renderer/app/routes-config';

/*
 * The four-way choice a user with no wallets is given: create, restore, import
 * or connect. The screen itself is that choice; everything else it can show is a
 * dialog layered over it, selected by a chain of seven branches that reads two
 * store fields and three dialog predicates.
 *
 * The dialogs are not covered here. Each one mounts its own container tree, and
 * the roster treats them as exercised through the screen that opens them rather
 * than as coverage targets of their own.
 */
export default {
  title: 'Screens / Wallets / Add Wallet',
  decorators: [screenDecorator({}, { path: ROUTES.WALLETS.ADD })],
};

export const Default = {
  render: () => <WalletAddPage />,
  name: 'Nothing open',
};

export const MaxWalletsReached = {
  // The create and restore options go away once the wallet limit is hit, which
  // is the only state of this screen that removes rather than adds something.
  decorators: [
    screenDecorator(
      { wallets: { hasMaxWallets: true } },
      { path: ROUTES.WALLETS.ADD }
    ),
  ],
  render: () => <WalletAddPage />,
  name: 'Wallet limit reached',
};
