import React from 'react';
import RTSFlagsRecommendationOverlayContainer from '../../../../source/renderer/app/containers/knownIssues/RTSFlagsRecommendationOverlayContainer';
import environment from '../../_support/environment';
import { screenDecorator } from '../../_support/harness/ScreenStory';

/*
 * The overlay suppresses itself on four conditions, so getting it on screen
 * means clearing all four rather than setting one flag: not a selfnode, hardware
 * below the recommendation, terms already accepted, RTS mode not already on, and
 * the recommendation not already dismissed.
 *
 * The harness fixture says the machine has enough memory, which is the right
 * default everywhere else, so the story that shows the overlay is the one that
 * has to say otherwise. `environment` is replaced wholesale rather than merged,
 * so it is spread: the overlay reads two fields on it and the screens around it
 * read the rest.
 */
const underpoweredMachine = {
  ...environment,
  isSelfnode: false,
  hasMetHardwareRequirements: false,
};

export default {
  title: 'Screens / Known Issues / RTS Flags Recommendation Overlay',
  decorators: [
    screenDecorator({
      networkStatus: {
        environment: underpoweredMachine,
        isRTSFlagsModeEnabled: false,
      },
      profile: {
        areTermsOfUseAccepted: true,
        isRTSModeRecommendationAcknowledged: false,
      },
    }),
  ],
};

export const Default = {
  render: () => <RTSFlagsRecommendationOverlayContainer />,
  name: 'Recommending the flags',
};

export const Acknowledged = {
  // Dismissed once and never shown again, which is what the overlay does for the
  // rest of the installation's life.
  decorators: [
    screenDecorator({
      networkStatus: {
        environment: underpoweredMachine,
        isRTSFlagsModeEnabled: false,
      },
      profile: { isRTSModeRecommendationAcknowledged: true },
    }),
  ],
  render: () => <RTSFlagsRecommendationOverlayContainer />,
  name: 'Already acknowledged (renders nothing)',
};
