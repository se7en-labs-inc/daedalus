import React from 'react';
import SecuritySettingsPage from '../../../../source/renderer/app/containers/settings/categories/SecuritySettingsPage';
import { screenDecorator } from '../../_support/harness/ScreenStory';

export default {
  title: 'Screens / Settings / Security',
  // The only screen in this tranche that reads no store at all. It takes its
  // state from the discreet-mode feature context, which StoryProvider mounts,
  // and the toolbar switch drives it.
  decorators: [screenDecorator()],
};

export const Default = {
  render: () => <SecuritySettingsPage />,
};
