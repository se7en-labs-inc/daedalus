import React from 'react';
import { action } from 'storybook/actions';
import SystemTimeError from '../../../../../source/renderer/app/components/loading/system-time-error/SystemTimeError';

export const systemTimeErrorArgs = {
  localTimeDifference: 0,
  isCheckingSystemTime: false,
};

export function SystemTimeErrorStory({
  locale,
  localTimeDifference,
  isCheckingSystemTime,
}: {
  locale: string;
  localTimeDifference: number;
  isCheckingSystemTime: boolean;
}) {
  return (
    <SystemTimeError
      localTimeDifference={localTimeDifference}
      currentLocale={locale}
      onExternalLinkClick={action('onExternalLinkClick')}
      onCheckTheTimeAgain={action('onExternalLinkClick')}
      onContinueWithoutClockSyncCheck={action('onExternalLinkClick')}
      isCheckingSystemTime={isCheckingSystemTime}
    />
  );
}
