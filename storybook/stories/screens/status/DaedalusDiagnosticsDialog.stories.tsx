import React from 'react';
import DaedalusDiagnosticsDialog from '../../../../source/renderer/app/containers/status/DaedalusDiagnosticsDialog';
import { screenDecorator } from '../../_support/harness/ScreenStory';
import { requestDefault } from '../../_support/harness/storeDefaults';

/*
 * The support screen, and the one that reads the most fields per pixel: it
 * prints the node and wallet process state, the sync tips, the machine profile
 * and the clock check side by side. It renders through a modal portal, so it is
 * attached to the document rather than to the panel.
 */
export default {
  title: 'Screens / Status / Daedalus Diagnostics',
  decorators: [
    screenDecorator({
      networkStatus: {
        localTip: { epoch: 512, slot: 21600, absoluteSlot: 221184000 },
        networkTip: { epoch: 512, slot: 21600, absoluteSlot: 221184000 },
        diskSpaceAvailable: '412 GB',
        getNetworkClockRequest: requestDefault({ result: 0 }),
      },
    }),
  ],
};

export const Default = {
  render: () => <DaedalusDiagnosticsDialog />,
};

/*
 * The clock check running, which is the one control on this screen that changes
 * what it shows while the user watches.
 */
export const CheckingTheClock = {
  decorators: [
    screenDecorator({
      networkStatus: {
        localTip: { epoch: 512, slot: 21600, absoluteSlot: 221184000 },
        networkTip: { epoch: 512, slot: 21600, absoluteSlot: 221184000 },
        diskSpaceAvailable: '412 GB',
        getNetworkClockRequest: requestDefault({
          result: 0,
          isExecuting: true,
          isExecutingWithArgs: () => true,
        }),
      },
    }),
  ],
  render: () => <DaedalusDiagnosticsDialog />,
  name: 'Force-checking the clock',
};
