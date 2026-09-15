import React from 'react';
import NewsFeedContainer from '../../../../source/renderer/app/containers/news/NewsFeedContainer';
import { screenDecorator } from '../../_support/harness/ScreenStory';
import {
  emptyNewsFeed,
  populatedNewsFeed,
} from '../../_support/harness/fixtures/news';

/*
 * The slide-out panel. Whether it is on screen is a field of the app store
 * rather than a prop, so every story here opens it, and what it shows comes from
 * a real NewsCollection: the panel groups and orders items through the
 * collection's own getters.
 */
export default {
  title: 'Screens / News / News Feed',
  decorators: [
    screenDecorator({
      app: { newsFeedIsOpen: true },
      newsFeed: { newsFeedData: populatedNewsFeed() },
    }),
  ],
};

export const Default = {
  render: () => <NewsFeedContainer />,
  name: 'Open with news',
};

export const Empty = {
  decorators: [
    screenDecorator({
      app: { newsFeedIsOpen: true },
      newsFeed: { newsFeedData: emptyNewsFeed() },
    }),
  ],
  render: () => <NewsFeedContainer />,
  name: 'Open with nothing to show',
};

export const Loading = {
  decorators: [
    screenDecorator({
      app: { newsFeedIsOpen: true },
      newsFeed: { newsFeedData: emptyNewsFeed(), isLoadingNews: true },
    }),
  ],
  render: () => <NewsFeedContainer />,
  name: 'Fetching',
};

/*
 * The app-update entry is not a news item the feed happens to contain. It is
 * drawn from the appUpdate store and pinned above the list, so it is a separate
 * state of the same panel.
 */
export const WithAppUpdate = {
  decorators: [
    screenDecorator({
      app: { newsFeedIsOpen: true },
      newsFeed: { newsFeedData: populatedNewsFeed() },
      appUpdate: { displayAppUpdateNewsItem: true, downloadProgress: 64 },
    }),
  ],
  render: () => <NewsFeedContainer />,
  name: 'Open with an update waiting',
};
