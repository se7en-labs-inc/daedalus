import React from 'react';
import StoryDecorator from '../StoryDecorator';
import StoryProvider from '../StoryProvider';
import type { StoreOverrides } from './storeDefaults';

/*
 * The frame a screen story renders inside.
 *
 * A screen story mounts the application's own container rather than a component
 * with hand-built props, so it needs what the application gives a container: the
 * react-polymorph theme and locale frame that `StoryDecorator` supplies, and the
 * mobx `Provider` carrying a store map and the real actions, which
 * `StoryProvider` supplies.
 *
 * A screen names the stores it reads and the fields it reads on them. Anything
 * it does not name keeps the harness default, so an override is two or three
 * lines and stays readable as a description of what that screen depends on.
 *
 *   export default {
 *     title: 'Screens / Settings / Display Settings',
 *     decorators: [screenDecorator({ profile: { currentTheme: 'cardano' } })],
 *   };
 */
export function screenDecorator(storeOverrides: StoreOverrides = {}) {
  return function ScreenFrame(story: () => React.ReactNode) {
    return (
      <StoryDecorator>
        <StoryProvider storeOverrides={storeOverrides}>{story()}</StoryProvider>
      </StoryDecorator>
    );
  };
}
