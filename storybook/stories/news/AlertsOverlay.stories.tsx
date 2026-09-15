import React from 'react';
import { defineMessages, IntlProvider } from 'react-intl';
import { action } from '@storybook/addon-actions';
import StoryDecorator from '../_support/StoryDecorator';
import enMessages from '../../../source/renderer/app/i18n/locales/en-US.json';
import jpMessages from '../../../source/renderer/app/i18n/locales/ja-JP.json';
import News from '../../../source/renderer/app/domains/News';
import {
  DATE_ENGLISH_OPTIONS,
  DATE_JAPANESE_OPTIONS,
} from '../../../source/renderer/app/config/profileConfig';
import AlertsOverlay from '../../../source/renderer/app/components/news/AlertsOverlay';
import RTSFlagsRecommendationOverlay from '../../../source/renderer/app/components/knownIssues/RTSFlagsRecommendationOverlay/RTSFlagsRecommendationOverlay';
import { localeOf } from '../_support/globals';
import { optionsFrom } from '../_support/argTypes';
import { dateOptions } from '../_support/profileSettings';

const { intl: enIntl } = new IntlProvider({
  locale: 'en-US',
  messages: enMessages,
}).getChildContext();
const { intl: jpIntl } = new IntlProvider({
  locale: 'ja-JP',
  messages: jpMessages,
}).getChildContext();
const intl = {
  'en-US': enIntl,
  'ja-JP': jpIntl,
};
const dateOptionsIntl = {
  'en-US': DATE_ENGLISH_OPTIONS,
  'ja-JP': DATE_JAPANESE_OPTIONS,
};
const messages = defineMessages({
  readMore: {
    id: 'global.labels.readMore',
    defaultMessage: '!!!Read More',
    description: 'Read More button label.',
  },
  failureAlert: {
    id: 'global.errors.failureAlert',
    defaultMessage: '!!!Failure Alert',
    description: 'Failure Alert title.',
  },
  content: {
    id: 'static.dummy.markdown',
    defaultMessage: '!!!Content',
    description: 'Content.',
  },
});

const getAlerts = (locale: string) => [
  new News.News({
    action: {
      label: intl[locale].formatMessage(messages.readMore),
      url: 'https://www.daedalus.io',
    },
    content: intl[locale].formatMessage(messages.content),
    date: Date.now(),
    id: 123,
    target: {
      daedalusVersion: 'v0.13',
      platform: 'macOS',
      // @ts-ignore ts-migrate(2322) FIXME: Type '{ daedalusVersion: string; platform: string;... Remove this comment to see the full error message
      platformVersion: '10.14.6',
    },
    title: intl[locale].formatMessage(messages.failureAlert),
    type: 'alert',
    read: false,
  }),
  new News.News({
    action: {
      label: intl[locale].formatMessage(messages.readMore),
      url: 'https://www.daedalus.io',
    },
    content: intl[locale].formatMessage(messages.content),
    date: Date.now(),
    id: 1234,
    target: {
      daedalusVersion: 'v0.13',
      platform: 'macOS',
      // @ts-ignore ts-migrate(2322) FIXME: Type '{ daedalusVersion: string; platform: string;... Remove this comment to see the full error message
      platformVersion: '10.14.6',
    },
    title: intl[locale].formatMessage(messages.failureAlert),
    type: 'alert',
    read: false,
  }),
];

export default {
  title: 'News / Overlays',

  decorators: [(story) => <StoryDecorator>{story()}</StoryDecorator>],
};

export const Alerts = {
  // The options this control offers used to be the current locale's date
  // formats. An arg is declared once, outside the body, so it cannot depend on
  // a global: it offers both locales' formats instead. Left undefined, the
  // default still follows the locale, which is what the knob did.
  args: { currentDateFormat: undefined },
  argTypes: { currentDateFormat: optionsFrom(dateOptions) },

  render: ({ currentDateFormat }, context) => {
    const locale = localeOf(context);
    const alerts = getAlerts(locale);
    return (
      <AlertsOverlay
        allAlertsCount={alerts.length}
        alerts={alerts}
        onCloseOpenAlert={() => null}
        onMarkNewsAsRead={action('onMarkNewsAsRead')}
        onOpenExternalLink={action('onOpenExternalLink')}
        onProceedNewsAction={action('onProceedNewsAction')}
        currentDateFormat={
          currentDateFormat ?? dateOptionsIntl[locale][0].value
        }
      />
    );
  },
};

export const RtsRecommendation = {
  render: () => (
    <RTSFlagsRecommendationOverlay
      onConfirm={action('onConfirm')}
      onClose={action('onClose')}
    />
  ),

  name: 'RTS Recommendation',
};
