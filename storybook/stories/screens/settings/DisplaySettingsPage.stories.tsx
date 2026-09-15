import React from 'react';
import DisplaySettingsPage from '../../../../source/renderer/app/containers/settings/categories/DisplaySettingsPage';
import { screenDecorator } from '../../_support/harness/ScreenStory';

export default {
  title: 'Screens / Settings / Display Settings',
  // Reads one field: the theme the radio list marks as selected.
  decorators: [screenDecorator({ profile: { currentTheme: 'dark-blue' } })],
};

export const Default = {
  render: () => <DisplaySettingsPage />,
};

export const CardanoSelected = {
  decorators: [screenDecorator({ profile: { currentTheme: 'cardano' } })],
  render: () => <DisplaySettingsPage />,
  name: 'Cardano theme selected',
};
