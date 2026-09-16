import React from 'react';
import NoDiskSpaceErrorPage from '../../../../source/renderer/app/containers/loading/NoDiskSpaceErrorPage';
import { screenDecorator } from '../../_support/harness/ScreenStory';

/*
 * The three sizes arrive already formatted: NetworkStatusStore stores them as
 * the display strings prettysize produced, not as byte counts, so the screen
 * prints them unchanged and the story supplies them in the same form.
 */
export default {
  title: 'Screens / Loading / No Disk Space Error',
  decorators: [
    screenDecorator({
      networkStatus: {
        diskSpaceRequired: '2 GB',
        diskSpaceMissing: '1.2 GB',
        diskSpaceRecommended: '5 GB',
      },
    }),
  ],
};

export const Default = {
  render: () => <NoDiskSpaceErrorPage />,
};
