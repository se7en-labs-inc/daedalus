import React from 'react';
import Settings from '../../../../source/renderer/app/containers/settings/Settings';
import { ROUTES } from '../../../../source/renderer/app/routes-config';
import { screenDecorator } from '../../_support/harness/ScreenStory';

/*
 * The settings shell, which is `MainLayout` with a second menu inside it. It
 * marks the active entry by comparing the router's pathname against each item's
 * route, so the path is the whole content of these stories: the same fixture at
 * two paths is two different screens.
 */
const Placeholder = () => (
  <div style={{ padding: '20px' }}>
    The settings page that would render here.
  </div>
);

export default {
  title: 'Screens / Chrome / Settings',
  decorators: [screenDecorator({}, { path: ROUTES.SETTINGS.GENERAL })],
};

export const Default = {
  render: () => (
    <Settings>
      <Placeholder />
    </Settings>
  ),
  name: 'On general settings',
};

export const OnSupport = {
  decorators: [screenDecorator({}, { path: ROUTES.SETTINGS.SUPPORT })],
  render: () => (
    <Settings>
      <Placeholder />
    </Settings>
  ),
  name: 'On support',
};

export const WhileSyncing = {
  // Several settings entries are disabled until the node is synced.
  decorators: [
    screenDecorator(
      { networkStatus: { isSynced: false } },
      { path: ROUTES.SETTINGS.GENERAL }
    ),
  ],
  render: () => (
    <Settings>
      <Placeholder />
    </Settings>
  ),
  name: 'Still syncing',
};
