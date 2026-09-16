import React from 'react';
import Governance from '../../../../source/renderer/app/containers/voting/Governance';
import { ROUTES } from '../../../../source/renderer/app/routes-config';
import { screenDecorator } from '../../_support/harness/ScreenStory';

/*
 * The screen that proves the route path reaches both places.
 *
 * `Governance` is wrapped in `withRouter` and pushes through `history`
 * (Governance.tsx:43-45), and it decides which tab is active from
 * `app.currentRoute` (`:67-70`), which is computed from the router store. Those
 * are two different mechanisms reading the same fact, and the tab it highlights
 * is visible evidence that they agree.
 */
const Placeholder = () => (
  <div style={{ padding: '20px' }}>
    The governance page that would render here.
  </div>
);

export default {
  title: 'Screens / Chrome / Governance',
  decorators: [screenDecorator({}, { path: ROUTES.GOVERNANCE.DASHBOARD })],
};

export const Default = {
  render: () => (
    <Governance>
      <Placeholder />
    </Governance>
  ),
  name: 'On the governance center',
};

export const OnDirectory = {
  decorators: [screenDecorator({}, { path: ROUTES.GOVERNANCE.DREPS })],
  render: () => (
    <Governance>
      <Placeholder />
    </Governance>
  ),
  name: 'On the directory',
};

export const OnFavorites = {
  decorators: [screenDecorator({}, { path: ROUTES.GOVERNANCE.FAVORITES })],
  render: () => (
    <Governance>
      <Placeholder />
    </Governance>
  ),
  name: 'On favorites',
};
