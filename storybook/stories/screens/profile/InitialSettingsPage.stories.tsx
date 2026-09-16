import React from 'react';
import InitialSettingsPage from '../../../../source/renderer/app/containers/profile/InitialSettingsPage';
import { screenDecorator } from '../../_support/harness/ScreenStory';
import { requestDefault } from '../../_support/harness/storeDefaults';

/*
 * The first screen a new installation shows. It reads the four format fields the
 * selects are bound to, which the harness already carries at their system
 * defaults, and one request: the locale write is what puts the submit button in
 * its spinning state.
 */
export default {
  title: 'Screens / Profile / Initial Settings',
  decorators: [screenDecorator()],
};

export const Default = {
  render: () => <InitialSettingsPage />,
};

export const Submitting = {
  decorators: [
    screenDecorator({
      profile: {
        setProfileLocaleRequest: requestDefault({ isExecuting: true }),
      },
    }),
  ],
  render: () => <InitialSettingsPage />,
  name: 'Saving the chosen locale',
};
