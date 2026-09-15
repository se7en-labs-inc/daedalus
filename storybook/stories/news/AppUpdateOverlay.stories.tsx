import React from 'react';
import { action } from '@storybook/addon-actions';
import StoryDecorator from '../_support/StoryDecorator';
import AppUpdateOverlay from '../../../source/renderer/app/components/appUpdate/AppUpdateOverlay';
import { update, version, availableAppVersion } from './_utils/fakeDataUpdate';
import { rangeMap } from '../../../source/renderer/app/utils/numbers';
import { localeOf } from '../_support/globals';
import { radioOptionsFrom, rangeFrom } from '../_support/argTypes';

export default {
  title: 'News / Overlays',
  decorators: [(story) => <StoryDecorator>{story()}</StoryDecorator>],
};

const scenarioOptions = {
  Downloading: 'downloading',
  'Download complete': 'downloaded',
  'Process failed': 'failed',
};

const percentRange = { min: 0, max: 100, step: 1 };

export const Update = {
  args: {
    scenario: 'downloading',
    isUpdateDownloaded: true,
    isLinux: false,
    isFlight: false,
    isTestnet: false,
    isWaitingToQuitDaedalus: false,
    installationProgress: 30,
    downloadProgress: 30,
  },

  argTypes: {
    scenario: radioOptionsFrom(scenarioOptions),
    installationProgress: rangeFrom(percentRange),
    downloadProgress: rangeFrom(percentRange),
  },

  render: (args, context) => {
    const locale = localeOf(context);
    const { scenario, isLinux, isFlight, isTestnet, isWaitingToQuitDaedalus } =
      args;
    // The knobs this replaced declared `isLinux` and `isWaitingToQuitDaedalus`
    // twice with the same label, which addon-knobs treated as one control. One
    // arg serves both reads.
    let isUpdateDownloaded = args.isUpdateDownloaded;
    let isAutomaticUpdateFailed = false;
    let installationProgress = 0;

    if (scenario === 'downloading') {
      isUpdateDownloaded = false;
    } else if (scenario === 'failed') {
      isAutomaticUpdateFailed = true;
    } else if (scenario === 'downloaded') {
      if (isLinux && isWaitingToQuitDaedalus) {
        installationProgress = args.installationProgress;
      }
    }

    const downloadProgress =
      scenario === 'downloading' ? args.downloadProgress : 0;
    const timeLeftNumber = parseInt(
      // @ts-ignore ts-migrate(2345) FIXME: Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
      rangeMap(downloadProgress, 0, 100, 30, 1),
      10
    );
    const downloadTimeLeft = {
      'EN-US': `${timeLeftNumber} minutes`,
      'JP-JP': `${timeLeftNumber}分`,
    };
    return (
      <AppUpdateOverlay
        update={update[locale]}
        downloadTimeLeft={downloadTimeLeft[locale]}
        totalDownloaded="10Mb"
        totalDownloadSize="30Mb"
        availableAppVersion={availableAppVersion}
        currentAppVersion={version}
        downloadProgress={downloadProgress}
        isUpdateDownloaded={isUpdateDownloaded}
        isAutomaticUpdateFailed={isAutomaticUpdateFailed}
        onClose={action('onClose')}
        onInstallUpdate={action('onInstallUpdate')}
        onPostponeUpdate={action('onPostponeUpdate')}
        onExternalLinkClick={action('onExternalLinkClick')}
        isWaitingToQuitDaedalus={isWaitingToQuitDaedalus}
        isLinux={isLinux}
        isFlight={isFlight}
        isTestnet={isTestnet}
        installationProgress={installationProgress}
      />
    );
  },
};
