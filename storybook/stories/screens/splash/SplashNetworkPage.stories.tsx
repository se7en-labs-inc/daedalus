import React from 'react';
import SplashNetworkPage from '../../../../source/renderer/app/containers/splash/SplashNetworkPage';
import { screenDecorator } from '../../_support/harness/ScreenStory';

/*
 * The container returns null unless `global.isFlight`, so outside a Flight build
 * this screen does not exist. The story sets the flag for the duration of its
 * own render rather than leaving the panel showing an empty frame, and the
 * second story keeps the other half of that branch visible.
 */
const withFlight = (isFlight: boolean) => (story: () => React.ReactNode) => {
  global.isFlight = isFlight;
  return <>{story()}</>;
};

export default {
  title: 'Screens / Splash / Network Info',
  decorators: [screenDecorator()],
};

export const Default = {
  decorators: [withFlight(true)],
  render: () => <SplashNetworkPage />,
  name: 'Flight build',
};

export const NotAFlightBuild = {
  decorators: [withFlight(false)],
  render: () => <SplashNetworkPage />,
  name: 'Not a Flight build (renders nothing)',
};
