import React from 'react';
import MainLayout from '../../../../source/renderer/app/containers/MainLayout';
import { ROUTES } from '../../../../source/renderer/app/routes-config';
import { screenDecorator } from '../../_support/harness/ScreenStory';

/*
 * The shell every screen after this one renders inside: sidebar on the left, top
 * bar across, three dialog containers mounted alongside the child and a slot for
 * the child itself.
 *
 * It is also the first screen whose appearance depends on where it is. The
 * sidebar marks a category active by comparing the current path against its
 * category routes, so a story that does not say where it is gets a shell with
 * nothing selected.
 */
const Placeholder = () => (
  <div style={{ padding: '20px' }}>The screen that would render here.</div>
);

export default {
  title: 'Screens / Chrome / Main Layout',
  decorators: [screenDecorator({}, { path: ROUTES.WALLETS.ROOT })],
};

export const Default = {
  render: () => (
    <MainLayout>
      <Placeholder />
    </MainLayout>
  ),
  name: 'On the wallets route',
};

export const OnSettings = {
  decorators: [screenDecorator({}, { path: ROUTES.SETTINGS.GENERAL })],
  render: () => (
    <MainLayout>
      <Placeholder />
    </MainLayout>
  ),
  name: 'On the settings route',
};

export const SubMenusCollapsed = {
  // The sidebar's narrow state, which is a store field rather than a route.
  decorators: [
    screenDecorator(
      { sidebar: { isShowingSubMenus: false } },
      { path: ROUTES.WALLETS.ROOT }
    ),
  ],
  render: () => (
    <MainLayout>
      <Placeholder />
    </MainLayout>
  ),
  name: 'Sub-menus collapsed',
};
