import React from 'react';
import AboutDialog from '../../../../source/renderer/app/containers/static/AboutDialog';
import { screenDecorator } from '../../_support/harness/ScreenStory';

export default {
  title: 'Screens / Static / About',
  // Reads the version strings off the environment the harness supplies, which
  // is the same fixture the workbench installs on global.environment.
  decorators: [screenDecorator()],
};

export const Default = {
  render: () => <AboutDialog />,
};
