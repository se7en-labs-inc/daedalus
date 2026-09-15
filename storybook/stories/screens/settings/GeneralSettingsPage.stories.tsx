import React from 'react';
import GeneralSettingsPage from '../../../../source/renderer/app/containers/settings/categories/GeneralSettingsPage';
import { screenDecorator } from '../../_support/harness/ScreenStory';

export default {
  title: 'Screens / Settings / General Settings',
  decorators: [screenDecorator()],
};

export const Default = {
  render: () => <GeneralSettingsPage />,
};

/*
 * There is no story for the failed-locale-write state. The screen cannot render
 * it: ProfileSettingsForm renders the error as a React child rather than
 * formatting it, so a LocalizableError throws during render and the page blanks.
 * Written up in .agent/findings/08-general-settings-crashes-on-error.md; the
 * story goes in with the fix.
 */
