import React from 'react';
import SystemTimeErrorPage from '../../../../source/renderer/app/containers/loading/SystemTimeErrorPage';
import { screenDecorator } from '../../_support/harness/ScreenStory';
import { requestDefault } from '../../_support/harness/storeDefaults';

/*
 * `localTimeDifference` is in microseconds, and the screen is what a user sees
 * when the machine clock has drifted far enough that the node refuses to trust
 * it. Ninety seconds out is well past the threshold and reads as a plausible
 * number rather than a round one.
 */
const NINETY_SECONDS_IN_MICROSECONDS = 90 * 1000 * 1000;

export default {
  title: 'Screens / Loading / System Time Error',
  decorators: [
    screenDecorator({
      networkStatus: { localTimeDifference: NINETY_SECONDS_IN_MICROSECONDS },
    }),
  ],
};

export const Default = {
  render: () => <SystemTimeErrorPage />,
};

/*
 * The button spins only while the clock request is in flight *with the forced
 * flag*, which the screen asks with isExecutingWithArgs rather than isExecuting:
 * a routine poll must not make it look like the user's own retry. Overriding the
 * predicate rather than the flag is what keeps the two apart here too.
 */
export const CheckingAgain = {
  decorators: [
    screenDecorator({
      networkStatus: {
        localTimeDifference: NINETY_SECONDS_IN_MICROSECONDS,
        getNetworkClockRequest: requestDefault({
          isExecuting: true,
          isExecutingWithArgs: () => true,
        }),
      },
    }),
  ],
  render: () => <SystemTimeErrorPage />,
  name: 'Checking the time again',
};
