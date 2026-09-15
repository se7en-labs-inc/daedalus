import React from 'react';
import AppUpdateContainer from '../../../../source/renderer/app/containers/appUpdate/AppUpdateContainer';
import { screenDecorator } from '../../_support/harness/ScreenStory';
import { updateAvailable } from '../../_support/harness/fixtures/news';

/*
 * The update overlay has exactly one state that renders: the container returns
 * null unless `availableUpdate` is set, which is the store's default and the
 * state an installation spends all but a few days of its life in.
 */
export default {
  title: 'Screens / App Update / Update Overlay',
  decorators: [screenDecorator({ appUpdate: updateAvailable() })],
};

export const Default = {
  render: () => <AppUpdateContainer />,
  name: 'Downloading an update',
};

export const Downloaded = {
  decorators: [
    screenDecorator({
      appUpdate: {
        ...updateAvailable(),
        isUpdateDownloaded: true,
        downloadProgress: 100,
      },
    }),
  ],
  render: () => <AppUpdateContainer />,
  name: 'Ready to install',
};

export const AutomaticUpdateFailed = {
  // The manual path, which is the only one that tells a user to go and download
  // an installer themselves.
  decorators: [
    screenDecorator({
      appUpdate: { ...updateAvailable(), isAutomaticUpdateFailed: true },
    }),
  ],
  render: () => <AppUpdateContainer />,
  name: 'Automatic update failed',
};

export const NoUpdate = {
  decorators: [screenDecorator()],
  render: () => <AppUpdateContainer />,
  name: 'No update available (renders nothing)',
};
