# Task task-044: Screen tranche 3, 5 screens

## Task ID and Title

- ID: `task-044`
- Title: `Screen tranche 3: add backend, 5 screens`

## Why Chosen Now

`task-044.dependencies` is `[task-043]`, complete. This is the tranche the Provider decision was made
for: the first screen that mounts other containers rather than components.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- The five screens named in `task-044.targetPaths`.
- A story per branch on the screen that has branches.
- Whatever the harness and the test environment are missing that those five need.

## Non-Goals

- No change to `source/`, including the defect this tranche found.
- No screens outside the roster.

## Dependencies

- `task-043`, complete.

## Live Repo Findings Verified For Planning

Verified at `5d76d453d`, by reading all five container render bodies.

- `LoadingPage` reads two stores, not four: `backend.loadingPhase` and two fields on `networkStatus`.
  Everything else its fixture must satisfy is read by the containers below it.
- It selects one of three trees, and layers an overlay on the third. The deepest is three containers
  and the shallowest is one.
- `networkStatus.openStateDirectory` is a store method (`NetworkStatusStore.ts:553`) read by
  `DaedalusDiagnosticsDialog` and absent from the harness. Same class of gap as `isExecutingWithArgs`
  at `task-042`: a method, so it throws rather than reading `undefined`.
- `lottie-web` writes to a canvas 2d context at import time (`lottie.js:1308-1313`). jsdom returns
  `null` for `getContext`, so the syncing screen could not be imported in a spec, let alone rendered.
- `LogosDisplay.componentDidMount` dereferences an unguarded `document.querySelector` on a class name
  css-loader generates. In jsdom the element does not exist and the screen throws during mount.
  Written up as `.agent/findings/09-launch-screen-depends-on-a-generated-class-name.md`.

## Files Expected To Change

- Five new story files at the paths in `task-044.targetPaths`
- `storybook/stories/screens/screens.spec.tsx`
- `storybook/stories/_support/harness/storeDefaults.ts`
- `tests/jest/setup/canvasStub.js`, new
- `jest.config.js`

## Implementation Approach

1. Close the two gaps the containers need: the store method, and the canvas the animation library
   probes at import.
2. Write a story per branch, each taking a whole backend state rather than setting a phase.
3. Extend the render spec, and give the screens that cannot mount an assertion rather than a skip.

## The One Judgement In This Task

Seven of this tranche's stories cannot be mounted in a spec, because a shipped component throws during
mount in any environment where its document lookup misses. Three responses were available: not write
those stories, write them and exclude them from the spec, or write them and assert the throw.

Not writing them removes the only screens in the corpus that cover the launch path, and they work in
the workbench, where webpack generates the class name the lookup expects. Excluding them leaves seven
stories at the same evidentiary standard as the whole pre-phase-6 corpus, which is that the bundle
built.

So they assert the throw, and they assert the message rather than the fact of it. That turns a silence
into an instrument: the day a guard is added to that line, these seven assertions fail, and whoever
adds it is told to move the stories into the mounted set. An exclusion list would have said nothing
then and nothing now.

## Acceptance Criteria

- All five story files exist at the paths in `targetPaths`.
- `LoadingPage` has a story per branch and each renders the branch it claims.
- The nested containers are reached rather than short-circuited.
- `compile`, `lint`, `jest`, `storybook` and `docs` pass as Nix derivations.
- The 258-pair component baseline is intact and the diff against `task-043` is additive only.

## Verification Plan

- The render spec composes all 44 screen stories across three outcomes: mounts with content, mounts
  with nothing, throws at a named line.
- Per-file coverage, which is what distinguishes a container that rendered its branch from one that
  declined to render.
- Five Nix checks, `nix fmt`, the label diff and the args audit.

## Corrections To The Task Graph

1. `task-044.implementationNotes` says `LoadingPage` renders five nested containers. Five is the
   number it imports. It renders one of three trees selected by `loadingPhase`, and the deepest of
   those is three containers deep. The claim that matters is unchanged and is the reason this tranche
   exists: the fixture has to satisfy every store the containers below it read, not the two the screen
   reads itself.
2. The same note gives `LoadingPage`'s stores as `backend, networkStatus, profile, app`. The screen
   reads `backend` and `networkStatus`. `profile` and `app` are read by its children, which is a
   materially different statement about where a missing field would fail.
3. The note counts five states and names "Mithril bootstrap or sync" as one. They are two values of
   `loadingPhase` producing two different views from the same container, so there are six stories.
4. `task-044.acceptance` says the stories appear "under the loading and diagnostics group". They
   appear under `Screens / Loading` and `Screens / Status`, which are the directories `targetPaths`
   names.
5. `task-044.acceptance` says the nested containers must render "rather than throwing on an undefined
   store". No container in this tranche throws on an undefined store; the harness covers them. One
   throws on a document lookup that has nothing to do with the store map, and the criterion as written
   would have been read as satisfied while seven stories did not mount.

## Required Docs, Research, and Tracking Updates

- Set `task-044.status` to `completed`.
- New finding: `.agent/findings/09-launch-screen-depends-on-a-generated-class-name.md`, indexed.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-044-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-044-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

Five story files carrying seventeen stories. `LoadingPage` has one per branch, six in all.

The harness gained `networkStatus.openStateDirectory`. The test environment gained a canvas 2d
context, without which the syncing screen cannot be imported at all.

The render spec covers 44 screen stories in three groups: 34 mount with content, 3 mount with nothing,
7 throw at `LogosDisplay.componentDidMount` with the message asserted. Per-file coverage shows every
screen executing, `LoadingPage` at 100% of statements and branches.

`compile`, `lint`, `jest`, `storybook` and `docs` pass as Nix derivations, `nix fmt` is clean, and the
label set is 302 pairs across 70 titles, up 17, with the 258-pair component baseline intact.

## Final Outcome

Complete.

## Self-Review

The tranche did what it was scoped to do, which was to find out whether mounting containers inside
containers works. It does. `LoadingPage` reaches three containers deep on its default branch and the
fixture satisfies all of them without any screen needing to know what its children read.

What the tranche actually found was elsewhere. The harness was not the fragile part; a component that
searches the whole document for its own child, by a name a build tool generates, with no guard, is.
That is the second shipped defect found by rendering rather than building, and both were found by the
same move.

The type assertion added to the spec is the one piece of debt. `composeStories` stops inferring past
about a dozen modules and collapses to `unknown`, so the result is asserted to the type the function
documents. It is named and explained rather than suppressed, but it is an assertion, and the next
tranche makes the module map larger rather than smaller.
