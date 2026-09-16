import React from 'react';
import DRepDirectoryPageContainer from '../../../../source/renderer/app/containers/governance/DRepDirectoryPage';
import Governance from '../../../../source/renderer/app/containers/voting/Governance';
import { ROUTES } from '../../../../source/renderer/app/routes-config';
import { asScreen, screenDecorator } from '../../_support/harness/ScreenStory';
import { walletList } from '../../_support/harness/fixtures/wallets';
import {
  failedDirectory,
  loadedDirectory,
  loadingDirectory,
} from '../../_support/harness/fixtures/governance';

/*
 * The DRep directory. One container serves this and the favorites view, and the
 * only thing that separates them is the route: it reads `location.pathname` and
 * picks a view from it, so the two are separate story files rather than two
 * stories, and the path is what distinguishes them.
 *
 * The directory is drawn from a seeded population whose active, verified and
 * lapsing proportions are measured from mainnet, and the suggested cohort is
 * selected from it by the application's own rules rather than listed.
 */
const DRepDirectoryPage = asScreen(DRepDirectoryPageContainer);

const inGovernance = (story: () => React.ReactNode) => (
  <Governance>{story()}</Governance>
);

export default {
  title: 'Screens / Governance / DRep Directory',
  decorators: [
    inGovernance,
    screenDecorator(
      {
        governance: loadedDirectory(),
        wallets: { allWallets: walletList() },
      },
      { path: ROUTES.GOVERNANCE.DREPS }
    ),
  ],
};

export const Default = {
  render: () => <DRepDirectoryPage />,
  name: 'Loaded',
};

export const Loading = {
  decorators: [
    inGovernance,
    screenDecorator(
      {
        governance: loadingDirectory(),
        wallets: { allWallets: walletList() },
      },
      { path: ROUTES.GOVERNANCE.DREPS }
    ),
  ],
  render: () => <DRepDirectoryPage />,
};

export const Failed = {
  decorators: [
    inGovernance,
    screenDecorator(
      {
        governance: failedDirectory(),
        wallets: { allWallets: walletList() },
      },
      { path: ROUTES.GOVERNANCE.DREPS }
    ),
  ],
  render: () => <DRepDirectoryPage />,
  name: 'Directory unreachable',
};

export const NoWallets = {
  // Byron wallets carry no stake credential, and an installation with no wallet
  // at all cannot delegate, so the directory is browsable and the action is not
  // offered.
  decorators: [
    inGovernance,
    screenDecorator(
      { governance: loadedDirectory(), wallets: { allWallets: [] } },
      { path: ROUTES.GOVERNANCE.DREPS }
    ),
  ],
  render: () => <DRepDirectoryPage />,
  name: 'Nothing to delegate from',
};
