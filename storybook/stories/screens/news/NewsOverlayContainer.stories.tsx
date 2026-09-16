import React from 'react';
import NewsOverlayContainer from '../../../../source/renderer/app/containers/news/NewsOverlayContainer';
import { screenDecorator } from '../../_support/harness/ScreenStory';
import {
  alertNewsFeed,
  emptyNewsFeed,
  incidentNewsFeed,
} from '../../_support/harness/fixtures/news';

/*
 * One container, two overlays, and the choice is made by what is in the feed
 * rather than by anything the screen is told. An incident wins outright; failing
 * that, unread alerts; failing that, nothing renders at all, which is what every
 * ordinary session sees.
 */
export default {
  title: 'Screens / News / News Overlay',
  decorators: [
    screenDecorator({ newsFeed: { newsFeedData: incidentNewsFeed() } }),
  ],
};

export const Incident = {
  render: () => <NewsOverlayContainer />,
};

export const Alerts = {
  decorators: [
    screenDecorator({ newsFeed: { newsFeedData: alertNewsFeed() } }),
  ],
  render: () => <NewsOverlayContainer />,
  name: 'Unread alerts',
};

export const Nothing = {
  decorators: [
    screenDecorator({ newsFeed: { newsFeedData: emptyNewsFeed() } }),
  ],
  render: () => <NewsOverlayContainer />,
  name: 'Nothing to announce (renders nothing)',
};
