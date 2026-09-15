# Task task-043: Add the backend store and the Mithril fields

## Task ID and Title

- ID: `task-043`
- Title: `Add the backend store and the Mithril fields`

## Why Chosen Now

`task-043.dependencies` is `[task-042]`, complete. Tranche 3 is five loading and diagnostics screens
and all five read `backend`, which the harness carries as an empty object.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- `BackendStore`'s observables, its two computed getters and the commands the loading screens send.
- A named state per `LoadingPhase`.
- Whatever else tranche 3 needs that is one field deep.

## Non-Goals

- No story files. `task-044` opens the roster.
- No change to `source/`.

## Dependencies

- `task-042`, complete.

## Live Repo Findings Verified For Planning

Verified at `e944c61fe`.

- Five containers read `backend`: `LoadingPage`, `SyncingConnectingPage`, `MithrilSyncContainer`,
  `ChainStorageContainer` and `DaedalusDiagnosticsDialog`. Four of them read `loadingPhase`.
- `loadingPhase` is a computed getter (`BackendStore.ts:222-255`), not an observable. It is derived
  from `walletUnrecoverable`, `hasChain`, `mithrilPhase`, `chainPathConfirmed` and `walletPort`, and
  the screens read both it and the observables behind it.
- `BackendStore` declares 26 observables, 2 computed getters and 10 commands the containers call.
  `ChainStorageContainer` passes four of those commands straight through as handlers.
- `SyncingConnectingPage` reads six stores, two of which the harness carries as empty objects:
  `newsFeed.newsFeedData.unread` and `appUpdate.displayAppUpdateNewsItem`.
- `storybook/stories/loading/_support/mithrilFixtures.ts` already carries the snapshot dimensions and
  chain paths the component-level Mithril stories are built from.

## Files Expected To Change

- `storybook/stories/_support/harness/fixtures/backend.ts`, new
- `storybook/stories/_support/harness/storeDefaults.ts`
- `storybook/stories/_support/harness/storeDefaults.spec.tsx`

## Implementation Approach

1. Write the observables as declared, the commands as no-ops, and the two computed getters as values.
2. Express each `LoadingPhase` as a named preset carrying both the phase and the observables that
   cause it.
3. Default the store to the settled state, matching the `networkStatus` decision at `task-041`.
4. Assert the preset set against the `LoadingPhase` union.

## The One Judgement In This Task

Every other computed getter in the harness is a plain value a story can override, because nothing else
reads the observables it was derived from. `loadingPhase` is different: `LoadingPage` branches on the
phase and `MithrilSyncContainer` reads `mithrilPhase` and `lastError` directly, so a fixture that set
the phase alone would put the two into a combination the store cannot produce, and the story would
show a screen state the application has no way to reach.

So the phases are presets, not fields. A story picks `backendPhase.mithrilSyncing()` whole rather than
setting `loadingPhase: 'mithril-syncing'`, and gets the observables with it.

The cost is that the presets encode the getter's rule a second time. That is accepted rather than
avoided: the alternative is constructing a `BackendStore`, which opens six ipc channels and a two
second poll in `setup()`. The duplication is one place, named, and the spec asserts the preset set
covers the `LoadingPhase` union so a phase added to the type without a preset fails rather than
becoming a state no story can reach.

## Acceptance Criteria

- The backend store is reachable from a story override rather than copied per story.
- Every `loadingPhase` branch `LoadingPage` reads is representable from the harness.
- `compile`, `lint`, `jest` and `storybook` pass as Nix derivations.
- The label set is unchanged from `task-042`.

## Verification Plan

- Three assertions: the preset set covers the `LoadingPhase` union; each preset carries the
  observables behind its phase rather than the phase alone; every preset carries the nine commands
  the loading screens call.
- Four Nix checks and the label diff, which must show no change at all, because this task adds no
  story.

## Corrections To The Task Graph

1. `task-043.targetPath`, the singular field, names `storybook/stories/_support/StoryProvider.tsx`.
   The store map moved out of that file into the harness at `task-039`, and nothing here touches it.
   `targetPaths`, the plural field, names the two files that are correct. The singular field is stale
   and was not followed.
2. `task-043.description` says five screens key off `loadingPhase`. Five containers read the
   `backend` store; four of them read `loadingPhase`. `ChainStorageContainer` reads the two chain
   paths and four commands and never looks at the phase.
3. `task-043` is scoped as the backend store, and tranche 3 cannot render without two fields from
   stores that `task-045` owns. `SyncingConnectingPage` reads `newsFeed.newsFeedData.unread` and
   `appUpdate.displayAppUpdateNewsItem`, and it is the default branch of `LoadingPage`, so those two
   fields are part of "every `loadingPhase` branch is representable" whichever task the rest of those
   stores belongs to. Added here, one field deep and marked as such.
4. `task-043.implementationNotes` says the Mithril fields are "already exercised by the loading/mithril
   story fixtures; reuse them rather than writing new ones". The chain paths and snapshot dimensions
   are reusable and are reused. The progress payload is not: those stories are built from
   `MithrilProgressItem`, the step list a view renders, while the store carries `MithrilProgress`, the
   byte and file counters the watchdog emits. One fixture of the store's shape is written here, from
   the same dimensions.

## Required Docs, Research, and Tracking Updates

- Set `task-043.status` to `completed`.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-043-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-043-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

`fixtures/backend.ts` carries the 26 observables, the 10 commands, both computed getters and seven
named phase presets, one per member of the `LoadingPhase` union. The store defaults to `ready`.

`newsFeed` and `appUpdate` carry the one field each that the loading screens read.

Three assertions cover the presets. `compile`, `lint`, `jest` and `storybook` pass as Nix derivations,
`nix fmt` is clean, and the label set is unchanged at 285 pairs.

## Final Outcome

Complete.

## Self-Review

The presets are the whole content of this task. Written as fields, every Mithril story in tranche 3
would have been free to describe a machine mid-download with no download in progress, and nothing
would have caught it, because the screen renders either way and renders something plausible.

The duplicated rule is the part to keep in view. It is recorded rather than hidden, and the union
assertion covers the failure that matters most, which is a phase existing in the application with no
way to reach it from a story. It does not cover the getter's logic changing underneath the presets. A
`BackendStore.spec.ts` already exists and is the place that would belong if it ever does.
