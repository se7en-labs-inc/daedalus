// eslint-disable-file no-unused-vars
import React from 'react';
import { action } from '@storybook/addon-actions';
import StoryDecorator from '../_support/StoryDecorator';
import NewsFeed from '../../../source/renderer/app/components/news/NewsFeed';
import News from '../../../source/renderer/app/domains/News';
import { dateOptions } from '../_support/profileSettings';
import { DATE_ENGLISH_OPTIONS } from '../../../source/renderer/app/config/profileConfig';
import { getNewsItem } from './_utils/fakeDataNewsFeed';
import { localeOf } from '../_support/globals';
import { optionsFrom, rangeFrom } from '../_support/argTypes';

const updateDownloadProgressOptions = { min: 0, max: 100, step: 1 };

export default {
  title: 'News / NewsFeed',

  decorators: [(story) => <StoryDecorator>{story()}</StoryDecorator>],
};

export const Empty = {
  args: { isNewsFeedOpen: true },
  render: ({ isNewsFeedOpen }) => (
    <div>
      <NewsFeed
        // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
        onGoToRoute={action('onGoToRoute')}
        isLoadingNews={false}
        onMarkNewsAsRead={action('onMarkNewsAsRead')}
        onNewsItemActionClick={action('onNewsItemActionClick')}
        onClose={action('onClose')}
        news={new News.NewsCollection([])}
        isNewsFeedOpen={isNewsFeedOpen}
        onOpenExternalLink={action('onOpenExternalLink')}
        onOpenAlert={action('onOpenAlert')}
        onProceedNewsAction={action('onOpenExternalLink')}
        onOpenAppUpdate={action('onOpenAppUpdate')}
        currentDateFormat=" "
        isUpdatePostponed={false}
      />
    </div>
  ),
};

export const Fetching = {
  args: { isNewsFeedOpen: true },
  render: ({ isNewsFeedOpen }) => (
    <div>
      <NewsFeed
        // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
        onGoToRoute={action('onGoToRoute')}
        isLoadingNews
        onMarkNewsAsRead={action('onMarkNewsAsRead')}
        onNewsItemActionClick={action('onNewsItemActionClick')}
        onClose={action('onClose')}
        news={new News.NewsCollection([])}
        isNewsFeedOpen={isNewsFeedOpen}
        onOpenExternalLink={action('onOpenExternalLink')}
        onOpenAlert={action('onOpenAlert')}
        onProceedNewsAction={action('onOpenExternalLink')}
        onOpenAppUpdate={action('onOpenAppUpdate')}
        currentDateFormat=" "
        isUpdatePostponed={false}
      />
    </div>
  ),
};

export const Fetched = {
  args: {
    displayAppUpdateNewsItem: true,
    updateDownloadProgress: 30,
    isNewsFeedOpen: true,
    currentDateFormat: DATE_ENGLISH_OPTIONS[0].value,
  },

  argTypes: {
    updateDownloadProgress: rangeFrom(updateDownloadProgressOptions),
    currentDateFormat: optionsFrom(dateOptions),
  },

  render: (args, context) => {
    const locale = localeOf(context);
    const { displayAppUpdateNewsItem, isNewsFeedOpen, currentDateFormat } =
      args;
    const updateDownloadProgress = displayAppUpdateNewsItem
      ? args.updateDownloadProgress
      : 0;
    const news = new News.NewsCollection([
      getNewsItem(1, 'incident', locale),
      getNewsItem(2, 'incident', locale, true),
      getNewsItem(3, 'alert', locale),
      getNewsItem(4, 'alert', locale, true),
      getNewsItem(5, 'announcement', locale),
      getNewsItem(6, 'announcement', locale, true),
      getNewsItem(7, 'info', locale),
      getNewsItem(8, 'info', locale, true),
      getNewsItem(9, 'software-update', locale, true),
    ]);
    return (
      <div>
        <NewsFeed
          // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
          onGoToRoute={action('onGoToRoute')}
          isLoadingNews={false}
          onMarkNewsAsRead={action('onMarkNewsAsRead')}
          onNewsItemActionClick={action('onNewsItemActionClick')}
          onClose={action('onClose')}
          news={news}
          isNewsFeedOpen={isNewsFeedOpen}
          onOpenExternalLink={action('onOpenExternalLink')}
          onOpenAlert={action('onOpenAlert')}
          onProceedNewsAction={action('onOpenExternalLink')}
          displayAppUpdateNewsItem={displayAppUpdateNewsItem}
          updateDownloadProgress={updateDownloadProgress}
          onOpenAppUpdate={action('onOpenAppUpdate')}
          currentDateFormat={currentDateFormat}
          isUpdatePostponed={false}
        />
      </div>
    );
  },
};
