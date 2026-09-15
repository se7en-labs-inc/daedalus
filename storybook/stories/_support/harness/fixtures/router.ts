import { ROUTES } from '../../../../../source/renderer/app/routes-config';
import type { AnalyticsTracker } from '../../../../../source/renderer/app/analytics/types';

/*
 * One path, three consumers.
 *
 * A screen can learn where it is in three different ways, and they have to
 * agree. `MainLayout.tsx:100` and `Settings.tsx:21` read `stores.router.location`;
 * five governance screens are wrapped in `withRouter` and read the match from
 * react-router's own context; and `AppStore.currentRoute` is computed from the
 * router store and is what the top bar reads.
 *
 * In the application all three come from one history object. In a story they
 * would come from three fixtures unless something arranged otherwise, and three
 * fixtures drift: a screen could be told it is on the settings page by one and
 * the wallet page by another, and render half of each.
 *
 * So the path is a single per-story input and everything below is derived from
 * it. `screenDecorator` takes it, seeds the MemoryRouter with it, and merges the
 * two store fields from it.
 */
export const routerAt = (pathname: string = ROUTES.ROOT) => ({
  location: {
    pathname,
    search: '',
    hash: '',
    state: null,
    key: 'story',
  },
  // The navigation methods, as no-ops. A story that clicks a link should not
  // move the workbench to a screen the story did not set up.
  push: () => {},
  replace: () => {},
  go: () => {},
  goBack: () => {},
  goForward: () => {},
  history: null,
});

/*
 * A tracker that answers and records nothing.
 *
 * `withAnalytics` reads a context whose default is null (AnalyticsContext.ts:4),
 * so a wrapped screen outside a provider hands its child `analyticsTracker` as
 * null and throws at the first call. The screens call it from effects and event
 * handlers, so the failure is not always at mount.
 *
 * Nothing in a workbench should reach a real tracker: these methods post events
 * to an analytics backend.
 */
export const storyAnalyticsTracker: AnalyticsTracker = {
  enableTracking: () => Promise.resolve(),
  disableTracking: () => {},
  sendPageNavigationEvent: () => {},
  sendEvent: () => {},
};
