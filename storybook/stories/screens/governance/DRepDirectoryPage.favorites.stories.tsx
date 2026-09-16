import React from 'react';
import DRepDirectoryPageContainer from '../../../../source/renderer/app/containers/governance/DRepDirectoryPage';
import Governance from '../../../../source/renderer/app/containers/voting/Governance';
import { ROUTES } from '../../../../source/renderer/app/routes-config';
import { asScreen, screenDecorator } from '../../_support/harness/ScreenStory';
import { walletList } from '../../_support/harness/fixtures/wallets';
import {
  loadedDirectory,
  withFavorites,
} from '../../_support/harness/fixtures/governance';

/*
 * The same container as the directory, at a different route. It is a separate
 * screen rather than a filter: the route selects the view, the view has its own
 * empty state, and a reader looking for "what does the favorites tab show" would
 * not find it filed under the directory.
 */
const DRepDirectoryPage = asScreen(DRepDirectoryPageContainer);

const inGovernance = (story: () => React.ReactNode) => (
  <Governance>{story()}</Governance>
);

export default {
  title: 'Screens / Governance / DRep Favorites',
  decorators: [
    inGovernance,
    screenDecorator(
      {
        governance: withFavorites(),
        wallets: { allWallets: walletList() },
      },
      { path: ROUTES.GOVERNANCE.FAVORITES }
    ),
  ],
};

export const Default = {
  render: () => <DRepDirectoryPage />,
  name: 'With favorites',
};

export const Empty = {
  // Nothing starred yet, which is every installation until someone stars
  // something.
  decorators: [
    inGovernance,
    screenDecorator(
      {
        governance: loadedDirectory(),
        wallets: { allWallets: walletList() },
      },
      { path: ROUTES.GOVERNANCE.FAVORITES }
    ),
  ],
  render: () => <DRepDirectoryPage />,
  name: 'Nothing starred yet',
};
