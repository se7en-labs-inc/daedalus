import React from 'react';
import AnalyticsConsentPage from '../../../../source/renderer/app/containers/profile/AnalyticsConsentPage';
import { screenDecorator } from '../../_support/harness/ScreenStory';
import { requestDefault } from '../../_support/harness/storeDefaults';

/*
 * The screen that proves the Provider path.
 *
 * Every other container in this tranche is wrapped in `inject`, which a story
 * could in principle sidestep by passing a `stores` prop. This one cannot be:
 * it calls useStores() and useActions() (AnalyticsConsentPage.tsx:10-11), and
 * both read MobXProviderContext directly (hooks/useStores.ts:5-7). If the
 * harness were supplying props rather than mounting a real Provider, this story
 * would throw and none of the others would.
 */
export default {
  title: 'Screens / Profile / Analytics Consent',
  decorators: [screenDecorator()],
};

export const Default = {
  render: () => <AnalyticsConsentPage />,
};

export const Submitting = {
  decorators: [
    screenDecorator({
      profile: {
        setAnalyticsAcceptanceRequest: requestDefault({ isExecuting: true }),
      },
    }),
  ],
  render: () => <AnalyticsConsentPage />,
  name: 'Recording the choice',
};
