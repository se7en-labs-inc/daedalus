import React from 'react';
import GovernanceWalletsPageContainer from '../../../../source/renderer/app/containers/governance/GovernanceWalletsPage';
import Governance from '../../../../source/renderer/app/containers/voting/Governance';
import { ROUTES } from '../../../../source/renderer/app/routes-config';
import { asScreen, screenDecorator } from '../../_support/harness/ScreenStory';
import { walletList } from '../../_support/harness/fixtures/wallets';
import { loadedDirectory } from '../../_support/harness/fixtures/governance';

/*
 * One row per wallet, showing how each has delegated its voting power. Its
 * empty state is the one an installation sits in before any wallet exists, and
 * it is a different screen rather than an empty table.
 */
const GovernanceWalletsPage = asScreen(GovernanceWalletsPageContainer);

const inGovernance = (story: () => React.ReactNode) => (
  <Governance>{story()}</Governance>
);

export default {
  title: 'Screens / Governance / Governance Wallets',
  decorators: [
    inGovernance,
    screenDecorator(
      {
        governance: loadedDirectory(),
        wallets: { allWallets: walletList(), all: walletList() },
      },
      { path: ROUTES.GOVERNANCE.DASHBOARD }
    ),
  ],
};

export const Default = {
  render: () => <GovernanceWalletsPage />,
  name: 'With wallets',
};

export const NoWallets = {
  decorators: [
    inGovernance,
    screenDecorator(
      {
        governance: loadedDirectory(),
        wallets: { allWallets: [], all: [] },
      },
      { path: ROUTES.GOVERNANCE.DASHBOARD }
    ),
  ],
  render: () => <GovernanceWalletsPage />,
  name: 'No wallets yet',
};
