import React from 'react';
import SupportSettingsPage from '../../../../source/renderer/app/containers/settings/categories/SupportSettingsPage';
import { screenDecorator } from '../../_support/harness/ScreenStory';

export default {
  title: 'Screens / Settings / Support',
  decorators: [screenDecorator()],
};

export const Default = {
  render: () => <SupportSettingsPage />,
};

export const DownloadingLogs = {
  // The download notification is app state rather than a request, so the
  // in-progress screen is one field on one store.
  decorators: [
    screenDecorator({ app: { isDownloadNotificationVisible: true } }),
  ],
  render: () => <SupportSettingsPage />,
  name: 'Downloading logs',
};
