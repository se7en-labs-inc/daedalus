import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AnalyticsProvider } from '../../../../source/renderer/app/components/analytics/AnalyticsProvider';
import { ROUTES } from '../../../../source/renderer/app/routes-config';
import StoryDecorator from '../StoryDecorator';
import StoryProvider from '../StoryProvider';
import type { StoreOverrides } from './storeDefaults';
import { routerAt, storyAnalyticsTracker } from './fixtures/router';

type ScreenOptions = {
  /*
   * Where the screen thinks it is. Seeds the MemoryRouter and both store fields
   * that carry a route, so the three ways a screen can ask cannot disagree. See
   * fixtures/router.ts.
   */
  path?: string;
};

/*
 * The frame a screen story renders inside.
 *
 * A screen story mounts the application's own container rather than a component
 * with hand-built props, so it needs what the application gives a container: the
 * react-polymorph theme and locale frame that `StoryDecorator` supplies, the
 * mobx `Provider` carrying a store map and the real actions, which
 * `StoryProvider` supplies, a router, and an analytics tracker.
 *
 * A screen names the stores it reads and the fields it reads on them. Anything
 * it does not name keeps the harness default, so an override is two or three
 * lines and stays readable as a description of what that screen depends on.
 *
 *   export default {
 *     title: 'Screens / Settings / Display Settings',
 *     decorators: [screenDecorator({ profile: { currentTheme: 'cardano' } })],
 *   };
 *
 * A screen that cares where it is says so:
 *
 *   decorators: [screenDecorator({}, { path: ROUTES.SETTINGS.GENERAL })],
 */
export function screenDecorator(
  storeOverrides: StoreOverrides = {},
  { path = ROUTES.ROOT }: ScreenOptions = {}
) {
  /*
   * The route fields are merged under whatever the story said rather than over
   * it, so a story that deliberately puts the router somewhere else still can.
   * Nothing in the corpus does, and the point of the default is that nothing
   * has to.
   */
  const overridesWithRoute: StoreOverrides = {
    ...storeOverrides,
    router: { ...routerAt(path), ...(storeOverrides.router || {}) },
    app: { currentRoute: path, ...(storeOverrides.app || {}) },
  };

  return function ScreenFrame(story: () => React.ReactNode) {
    return (
      <StoryDecorator>
        <MemoryRouter initialEntries={[path]}>
          <AnalyticsProvider tracker={storyAnalyticsTracker}>
            <StoryProvider storeOverrides={overridesWithRoute}>
              {story()}
            </StoryProvider>
          </AnalyticsProvider>
        </MemoryRouter>
      </StoryDecorator>
    );
  };
}
