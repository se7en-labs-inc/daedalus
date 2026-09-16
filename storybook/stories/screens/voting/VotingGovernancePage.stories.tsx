import React from 'react';
import VotingGovernancePageContainer from '../../../../source/renderer/app/containers/voting/VotingGovernancePage';
import Governance from '../../../../source/renderer/app/containers/voting/Governance';
import { ROUTES } from '../../../../source/renderer/app/routes-config';
import { asScreen, screenDecorator } from '../../_support/harness/ScreenStory';
import { walletList } from '../../_support/harness/fixtures/wallets';
import { loadedDirectory } from '../../_support/harness/fixtures/governance';

/*
 * Where voting power is actually delegated. It reads seven stores, and its first
 * branch is a refusal: until the node is synced it replaces the form entirely,
 * because a delegation computed against a stale chain would name the wrong stake.
 *
 * The screen has no navigation tab of its own. It is pushed from the directory
 * and from a DRep's detail page, which is why the directory carries the
 * selection across in a store field rather than in router state.
 */
const VotingGovernancePage = asScreen(VotingGovernancePageContainer);

const inGovernance = (story: () => React.ReactNode) => (
  <Governance>{story()}</Governance>
);

export default {
  title: 'Screens / Voting / Delegate Voting Power',
  decorators: [
    inGovernance,
    screenDecorator(
      {
        governance: loadedDirectory(),
        wallets: { allWallets: walletList(), all: walletList() },
      },
      { path: ROUTES.GOVERNANCE.DELEGATE }
    ),
  ],
};

export const Default = {
  render: () => <VotingGovernancePage />,
  name: 'Choosing a target',
};

export const NotSynced = {
  decorators: [
    inGovernance,
    screenDecorator(
      {
        governance: loadedDirectory(),
        wallets: { allWallets: walletList(), all: walletList() },
        networkStatus: { isSynced: false, syncPercentage: 42 },
      },
      { path: ROUTES.GOVERNANCE.DELEGATE }
    ),
  ],
  render: () => <VotingGovernancePage />,
  name: 'Delegation unavailable while syncing',
};

export const ArrivingFromTheDirectory = {
  /*
   * A DRep already chosen. The directory hands the selection over through a
   * store field rather than through router state, because hash history drops
   * location state on every push, so this is what the form sees on arrival.
   */
  decorators: [
    inGovernance,
    screenDecorator(
      {
        governance: {
          ...loadedDirectory(),
          delegationNavState: {
            voteType: 'drep',
            selectedDRepId: loadedDirectory().allDReps[0].drepId,
            selectedDRepVerifiedName: 'A chosen DRep',
            selectedDRepAnchorUrl: null,
          },
        },
        wallets: { allWallets: walletList(), all: walletList() },
      },
      { path: ROUTES.GOVERNANCE.DELEGATE }
    ),
  ],
  render: () => <VotingGovernancePage />,
  name: 'Arriving with a DRep chosen',
};
