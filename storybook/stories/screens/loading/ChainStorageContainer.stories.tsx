import React from 'react';
import ChainStorageContainer from '../../../../source/renderer/app/containers/loading/ChainStorageContainer';
import { screenDecorator } from '../../_support/harness/ScreenStory';
import { backendPhase } from '../../_support/harness/storeDefaults';

/*
 * Where the chain goes, asked once on a machine that has none. The container
 * passes four backend commands straight through as handlers, so the screen is
 * only reachable with a backend fixture that carries them.
 */
export default {
  title: 'Screens / Loading / Chain Storage',
  decorators: [screenDecorator({ backend: backendPhase.chainStorageSetup() })],
};

export const Default = {
  render: () => <ChainStorageContainer />,
};
