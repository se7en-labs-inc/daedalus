# Task task-042: Screen tranche 2, 8 screens

## Task ID and Title

- ID: `task-042`
- Title: `Screen tranche 2: add networkStatus, 8 screens`

## Why Chosen Now

`task-042.dependencies` is `[task-041]`, complete. The harness now carries the store map, the request
shape and a settled `networkStatus`, which is what this roster needs before it can be written.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- The eight screens named in `task-042.targetPaths`, each with a story file at the named path.
- Whatever the harness is missing that those eight need.
- The screen render spec extended to cover them.

## Non-Goals

- No change to `source/`.
- No screens outside the roster. `task-044` opens the next one.

## Dependencies

- `task-041`, complete.

## Live Repo Findings Verified For Planning

Verified at `db516a810`, by reading all eight container render bodies.

- Four fields these containers read are absent from the harness. `networkStatus.isRTSFlagsModeEnabled`
  is read by both known-issues containers. `networkStatus.environment` is read by
  `RTSFlagsRecommendationOverlayContainer.tsx:27-28`. `networkStatus.ignoreSystemTimeChecks` is read
  by `SystemTimeErrorPage.tsx:18` and passed straight through as a click handler.
  `getNetworkClockRequest.isExecutingWithArgs` is called at `SystemTimeErrorPage.tsx:32`.
- `networkStatus.environment` is not a field of `NetworkStatusStore`. It is declared on the `Store`
  base class at `source/renderer/app/stores/lib/Store.ts:10` as `global.environment`, so every store
  carries it.
- `isExecutingWithArgs` is a method, not a field (`stores/lib/Request.ts:99`). A screen calling it on
  a plain object throws, where a missing field would only read `undefined`. That distinction is why it
  had to be added to the request shape rather than left to a per-story override.
- `WalletsSettingsPage` reads `currency`, `profile` and `app`. `currency` was one of the harness keys
  left as an empty object, and the screen reads four fields on it, two of which are computed getters.
- `RTSFlagsRecommendationOverlayContainer.shouldRender()` suppresses the overlay on four conditions.
  With the harness fixture as it stands the overlay is invisible, because the fixture says the machine
  meets the hardware recommendation.

## Files Expected To Change

- Eight new story files at the paths in `task-042.targetPaths`
- `storybook/stories/_support/harness/storeDefaults.ts`
- `storybook/stories/_support/harness/requestDefaults.ts`
- `storybook/stories/_support/harness/storeDefaults.spec.tsx`
- `storybook/stories/screens/screens.spec.tsx`

## Implementation Approach

1. Close the four harness gaps found by reading the containers, before writing any story.
2. Fill the `currency` store from its declarations, the way `networkStatus` was filled at `task-041`.
3. Write the eight story files, each naming only what its screen reads.
4. Extend the render spec to compose and mount all of them.

## The One Judgement In This Task

The RTS recommendation overlay is suppressed unless the machine is below the hardware recommendation,
and the harness environment fixture says it is above. So the story that shows the overlay is the one
that has to describe an underpowered machine, and it does that by spreading the shared fixture and
overriding two fields rather than by lowering the fixture for everyone.

Lowering it would have been one line. It would also have changed what every other screen in the
corpus sees, because the same fixture is what `_support/environment.ts` installs on the global, and
the diagnostics screens read exactly this field. A story that needs an unusual machine says so
locally.

## Acceptance Criteria

- All eight story files exist at the paths in `targetPaths`.
- Each mounts its real container through the harness Provider, not a props object.
- Each override names only the keys its screen reads.
- `AnalyticsConsentPage` renders through the Provider with no props fixture.
- `compile`, `lint`, `jest` and `storybook` pass as Nix derivations.
- The 258-pair component baseline is intact and the diff against `task-041` is additive only.

## Verification Plan

- The render spec composes all 27 screen stories and asserts each puts content on the page, except the
  three that document a null render.
- Per-file coverage from that run, read as the answer to "did the screen actually render", rather than
  the spec's own pass, which a container returning null would also produce.
- Four Nix checks, `nix fmt`, the label diff and the args audit.

## Corrections To The Task Graph

1. `task-042.acceptance` requires the stories to "appear in the sidebar under the profile and errors
   group". There is no errors group, and the roster is not confined to two. The eight land under
   `Screens / Profile`, `Screens / Settings`, `Screens / Loading` and `Screens / Known Issues`, which
   are the directories `targetPaths` itself names. The acceptance criterion is corrected rather than
   worked around, following the `task-040` precedent.
2. `task-042.implementationNotes` gives `WalletsSettingsPage` as reading `profile, wallets`. It reads
   `currency`, `profile` and `app`, and does not touch `wallets` at all. The entry named the store the
   screen is about rather than the stores it reads.
3. Four of the eight store lists in `implementationNotes` are short by one or two stores.
   `InitialSettingsPage` also reads `app`; `TermsOfUsePage` also reads `app` and `networkStatus`;
   `SystemTimeErrorPage` also reads `profile`; `RTSFlagsRecommendationOverlayContainer` also reads
   `profile`. Each was found by reading the render body rather than by a failed render.
4. The request shape from `task-041` carries five fields and two methods, and was short one method.
   `isExecutingWithArgs` is corrected there, in `requestDefaults.ts`, rather than patched per story:
   every request in the map gets it, because the gap is in the shape and not in one screen.

## Required Docs, Research, and Tracking Updates

- Set `task-042.status` to `completed`.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-042-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-042-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

Eight story files, fifteen stories, all eight containers mounted through the Provider.

The harness gained `isRTSFlagsModeEnabled`, `environment` and `ignoreSystemTimeChecks` on
`networkStatus`, a filled `currency` store, and `isExecutingWithArgs` on every request.

The render spec composes 27 screen stories. Per-file coverage from that run shows all eight screens
executing: `NoDiskSpaceError` and `InitialSettings` at 100% of statements, `WalletsSettings` at 91.66,
`SystemTimeError` at 88, `TermsOfUseForm` at 86.36, `AnalyticsConsentForm` at 82.35,
`RTSFlagsRecommendationOverlay` at 100 and `ToggleRTSFlagsDialog` at 89.47.

`compile`, `lint`, `jest` and `storybook` pass as Nix derivations. The label set is 285 pairs across
65 titles, up 15 from `task-041`, with every addition a new screen story and the 258-pair component
baseline untouched. The knob census reports zero and the args audit reports zero renders with no args
declared.

## Final Outcome

Complete.

## Self-Review

Reading all eight render bodies before writing anything found four harness gaps, one of which would
have thrown rather than read `undefined`. Written the other way round, that is four failing renders
discovered one at a time, and the method one discovered as a stack trace naming a component rather
than a field.

The entry's store lists are short on half the roster. That is worth saying plainly because the same
lists are what the remaining tranches are scoped from, and the cost of trusting them is paid at render
time. The next tranche is planned from the render bodies, not from the entry.

The thing this tranche does not prove is the one that matters: every screen here reads between one and
five fields, and the harness was built for that. `WalletSummaryPage` reads about twenty-five across
nine stores. Nothing measured so far says whether the override-and-merge shape holds at that size.
