import React from 'react';
import DRepDetailPageContainer from '../../../../source/renderer/app/containers/governance/DRepDetailPage';
import Governance from '../../../../source/renderer/app/containers/voting/Governance';
import { asScreen, screenDecorator } from '../../_support/harness/ScreenStory';
import { walletList } from '../../_support/harness/fixtures/wallets';
import {
  drepPopulation,
  loadedDirectory,
} from '../../_support/harness/fixtures/governance';

/*
 * One DRep in full. The entry does not come from the store: the page reads a
 * drepId out of the route match and fetches it in `componentDidMount`, holding
 * the result in component state, so the story needs a router seeded with a real
 * path and a store whose fetch resolves.
 *
 * That is why the id below is taken from the population rather than written: it
 * has to be one `fetchDRep` can find, or the page renders its failure state
 * while claiming to render a DRep.
 */
const DRepDetailPage = asScreen(DRepDetailPageContainer);

const population = drepPopulation();
const subject = population[0];
const detailPath = `/governance/dreps/${subject.drepId}`;

const fetching = (entry) => ({
  ...loadedDirectory(),
  fetchDRep: () => Promise.resolve(entry),
});

const inGovernance = (story: () => React.ReactNode) => (
  <Governance>{story()}</Governance>
);

export default {
  title: 'Screens / Governance / DRep Detail',
  decorators: [
    inGovernance,
    screenDecorator(
      {
        governance: fetching(subject),
        wallets: { allWallets: walletList() },
      },
      { path: detailPath }
    ),
  ],
};

export const Default = {
  render: () => <DRepDetailPage />,
  name: 'A DRep',
};

export const NotFound = {
  // The fetch resolved with nothing, which is what a retired or unknown id
  // produces, and is a different screen from the fetch failing.
  decorators: [
    inGovernance,
    screenDecorator(
      {
        governance: fetching(null),
        wallets: { allWallets: walletList() },
      },
      { path: detailPath }
    ),
  ],
  render: () => <DRepDetailPage />,
  name: 'No such DRep',
};
