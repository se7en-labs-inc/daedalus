# Task task-047: Add the router stub, MemoryRouter and AnalyticsProvider

## Task ID and Title

- ID: `task-047`
- Title: `Add the router stub, MemoryRouter and AnalyticsProvider`

## Why Chosen Now

`task-047.dependencies` is `[task-046]`, complete. Every screen from tranche 5 onwards renders inside
`MainLayout`, which reads the router store, so nothing after this point is reachable without it.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- A route path as a per-story input, reaching every consumer that asks where the screen is.
- An analytics tracker that records nothing.

## Non-Goals

- No story files. `task-048` opens the roster.
- No change to `source/`.

## Dependencies

- `task-046`, complete.

## Live Repo Findings Verified For Planning

Verified at `0f2d6a916`.

- Three different mechanisms answer "where am I". `MainLayout.tsx:100` and `Settings.tsx:21` read
  `stores.router.location`. Five containers are wrapped in `withRouter` and read react-router's own
  context: `voting/Governance`, `voting/VotingGovernancePage`, `governance/DRepDirectoryPage`,
  `governance/DRepDetailPage` and `governance/GovernanceWalletsPage`. And `AppStore.currentRoute`
  (`AppStore.ts:70-73`) is computed from the router store, feeding `currentPage` and `isSetupPage`.
- `AnalyticsContext`'s default is `null` (`AnalyticsContext.ts:4`), so a `withAnalytics` screen
  outside a provider hands its child `analyticsTracker: null`. The screens call it from effects and
  handlers, so the failure is not reliably at mount.
- `AnalyticsTracker` has four methods (`analytics/types.ts:17-27`), not the two the screens happen to
  call.
- react-router is 5.2.0 and exports `MemoryRouter`.

## Files Expected To Change

- `storybook/stories/_support/harness/fixtures/router.ts`, new
- `storybook/stories/_support/harness/ScreenStory.tsx`
- `storybook/stories/_support/harness/storeDefaults.ts`
- `storybook/stories/_support/harness/storeDefaults.spec.tsx`

## Implementation Approach

1. Derive the router store's location, the MemoryRouter's initial entry and `app.currentRoute` from
   one argument.
2. Give the tracker all four methods rather than the two currently called.
3. Assert on what the decorator built rather than on what it renders.

## The One Judgement In This Task

The path could have been a store override like any other, with a story writing
`router: { location: { pathname: '/settings' } }` and, if it also needed react-router, a MemoryRouter
of its own. That is more explicit and it is what the harness does everywhere else.

It is also three statements of the same fact, and there is no check that could tell they had drifted.
A screen given `/settings` by the store and `/` by the router renders: `MainLayout` highlights one
sidebar entry while the route matcher picks a different child, and the result looks like a screen
rather than like a contradiction.

So this is the one place the harness derives rather than declares. `screenDecorator` takes a path and
writes all three, merging them under whatever the story said so a story that genuinely wants them
apart still can. Nothing in the corpus does.

## Acceptance Criteria

- A story can declare its path and have `withRouter`, `stores.router.location` and
  `app.currentRoute` agree with it.
- A `withAnalytics` screen renders without a real tracker.
- `compile`, `lint`, `jest` and `storybook` pass as Nix derivations.
- The label set is unchanged from `task-046`.

## Verification Plan

- Three assertions reading the store map the decorator built: the two route fields carry the declared
  path, they default to the root together, and a story's other overrides survive.
- The 57 existing screen stories still pass, which is what says adding a router and a provider to the
  shared frame did not disturb them.
- The real proof is `task-048`: `Settings` reads `stores.router.location` and `voting/Governance` is
  wrapped in `withRouter`, so tranche 5 mounts one of each.
- Four Nix checks and the label diff, which must show no change.

## Corrections To The Task Graph

1. `task-047.targetPaths` names `StoryProvider.tsx` and `StoryLayout.tsx`. Neither is touched. The
   screen frame moved into `harness/ScreenStory.tsx` at `task-040`, and putting the router in
   `StoryProvider` would have wrapped all 258 component stories in one for no reason. Same class of
   stale entry as `task-043.targetPath`.
2. `task-047.description` says five screens use `withRouter` while two read `stores.router.location`.
   Both counts are right, and there is a third consumer neither mentions: `AppStore.currentRoute` is
   computed from the router store, and the top bar and the setup-page test read it. A stub that
   satisfied the first two would have left `currentRoute` empty on every screen.
3. `task-047.implementationNotes` says "a no-op tracker is enough". It is, and it has to implement all
   four methods of `AnalyticsTracker` rather than the two the three named screens call, because
   nothing stops a fourth screen calling the others.

## Required Docs, Research, and Tracking Updates

- Set `task-047.status` to `completed`.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-047-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-047-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

`screenDecorator` takes an optional path. It seeds a `MemoryRouter`, the router store's location and
`app.currentRoute` from it, and wraps the screen in an `AnalyticsProvider` carrying a tracker that
records nothing.

Three assertions read the store map the decorator built. The 57 existing screen stories pass
unchanged. `compile`, `lint`, `jest` and `storybook` pass as Nix derivations, `nix fmt` is clean, and
the label set is unchanged.

## Final Outcome

Complete.

## Self-Review

The single-input decision is the whole task and it is the first time the harness has derived a value
rather than stated it. Everywhere else, a story says what a store field is and the harness does not
argue. Here a story says where it is, once, and three fields follow, because the failure mode of
stating it three times is a screen that renders convincingly while being in two places.

What is not proven yet is that any of it works on a real screen. The assertions read the map the
decorator built, which is the right level for a mechanism with no screen to try it on, and it is not
the same as a container mounting. `task-048` has one screen of each kind in its roster, and if the
mechanism is wrong that is where it shows.
