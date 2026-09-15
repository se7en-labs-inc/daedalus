import React from 'react';
import NotificationsContainer from '../../../../source/renderer/app/containers/notifications/NotificationsContainer';
import { screenDecorator } from '../../_support/harness/ScreenStory';
import { activeNotifications } from '../../_support/harness/fixtures/news';

/*
 * The toast bar. It renders one element per configured notification whatever the
 * store says, and `activeNotifications` decides which of them are visible, so
 * the quiet state is a tree of hidden elements rather than an empty one.
 */
export default {
  title: 'Screens / Notifications / Notifications',
  decorators: [screenDecorator()],
};

export const Default = {
  render: () => <NotificationsContainer />,
  name: 'Nothing to say',
};

export const Active = {
  decorators: [screenDecorator({ uiNotifications: { activeNotifications } })],
  render: () => <NotificationsContainer />,
  name: 'Two notifications showing',
};
