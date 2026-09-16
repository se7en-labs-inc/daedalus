import React from 'react';
import ToggleRTSFlagsDialogContainer from '../../../../source/renderer/app/containers/knownIssues/ToggleRTSFlagsDialogContainer';
import { screenDecorator } from '../../_support/harness/ScreenStory';

/*
 * The dialog that offers to restart the node with the RTS flags on or off. It
 * reads one field, and that field decides which of the two things it is: with
 * the mode off the dialog offers to turn it on, and with it on the dialog offers
 * to turn it off. Both are here because the wording differs and neither is
 * reachable from the other.
 */
export default {
  title: 'Screens / Known Issues / Toggle RTS Flags Dialog',
  decorators: [
    screenDecorator({ networkStatus: { isRTSFlagsModeEnabled: false } }),
  ],
};

export const Default = {
  render: () => <ToggleRTSFlagsDialogContainer />,
  name: 'Offering to turn the flags on',
};

export const Enabled = {
  decorators: [
    screenDecorator({ networkStatus: { isRTSFlagsModeEnabled: true } }),
  ],
  render: () => <ToggleRTSFlagsDialogContainer />,
  name: 'Offering to turn the flags off',
};
