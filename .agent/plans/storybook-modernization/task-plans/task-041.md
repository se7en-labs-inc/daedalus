# Task task-041: Add request-shaped defaults and the networkStatus store

## Task ID and Title

- ID: `task-041`
- Title: `Add request-shaped defaults and the networkStatus store`

## Why Chosen Now

`task-041.dependencies` is `[task-040]`, complete. Its own note is the reason it exists separately:
cheap to fix once in the harness and expensive to fix twelve times.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- A request shape with every field a container reads, in its own module.
- That shape applied to every request any of the 48 screen containers reads, on the store that
  declares it.
- The `networkStatus` store's defaults.

## Non-Goals

- No screen story files. `task-042` opens the next roster.
- No change to `source/`.

## Dependencies

- `task-040`, complete.

## Live Repo Findings Verified For Planning

Verified at `9d6514656`.

- **36 distinct request names** are read across `source/renderer/app/containers`. Matching each
  against its declaration in `source/renderer/app/stores` places **30 of them on 9 stores**:
  `wallets` 12, `profile` 7 counting the three the settings screens already needed,
  `walletSettings` 4, `hardwareWallets` 4, `staking` 3, `transactions` 3, `voting` 3,
  `networkStatus` 2, `addresses` 1.
- The fields those containers read off a request, by frequency: `error`, `isExecuting`,
  `isExecutingFirstTime`, `result`, `wasExecuted`. `sendMoneyRequest.error` and
  `getNetworkClockRequest.isExecuting` are the most common at four reads each.
- Containers read straight through without guarding, so an omitted field throws one property access
  deep and the stack names the component rather than the field.
- `NetworkStatusStore` declares 35 observables and 6 computed getters. Its observables initialise to a
  disconnected, unsynced state, which is real for the first seconds of a session and wrong as a
  default for a workbench.

## Files Expected To Change

- `storybook/stories/_support/harness/requestDefaults.ts`, new
- `storybook/stories/_support/harness/storeDefaults.ts`
- `storybook/stories/_support/harness/storeDefaults.spec.tsx`

## Implementation Approach

1. Move the provisional request factory out of `storeDefaults.ts` into its own module and give it the
   five fields the containers read, plus `reset` and `execute`.
2. Record the request-to-store map as data, measured rather than listed by hand, and spread it into
   each store's defaults.
3. Fill `networkStatus` from its declarations, settling the connection state rather than copying the
   store's cold-start values.
4. Assert the contract in the spec rather than asserting it in prose.

## The One Judgement In This Task

`NetworkStatusStore`'s observables initialise to `isNodeResponding: false`, `isNodeInSync: false`,
`syncProgress: null`, `hasBeenConnected: false`. That is truthful about a real store a few hundred
milliseconds after construction, and it is the wrong default here: a harness that starts there shows
every screen that reads `networkStatus` its loading shell and nothing else, and 20 of the 48 screens
read it.

So the defaults are the settled state — connected, synced, Shelley and Alonzo active — and a screen
that wants the loading state says so in its override. The alternative makes the common case require an
override and the rare case free, which is backwards.

This is the first place the harness deliberately departs from what the real store initialises to, and
it is recorded here rather than left as an unexplained difference for someone diffing the two.

## Acceptance Criteria

- A request-shaped default exists carrying all five fields the containers read.
- Every request any screen container reads has a default on the store that declares it.
- `networkStatus` carries its observables and computed getters.
- No screen story sets a request field the default does not already carry.
- `compile`, `lint`, `jest` and `storybook` pass as Nix derivations.
- The label set is unchanged from `task-040`.

## Verification Plan

- Three assertions in `storeDefaults.spec.tsx`: the shape carries every field the containers read;
  every name in the request-to-store map resolves to a defaulted request on its store; and two calls
  produce distinct objects, so one story cannot see another's edits.
- The existing twelve screen renders still pass, which is what says the new defaults did not displace
  anything the first tranche depended on.
- Four Nix checks and the label diff.

## Required Docs, Research, and Tracking Updates

- Set `task-041.status` to `completed`.

## Corrections To The Task Graph

1. `task-041.description` says "roughly a dozen screens read a request object". Measured, 36 distinct
   request names are read across the containers, 30 of which are store fields. The figure is a count
   of screens rather than of requests, and either way the sweep is wider than a dozen.
2. `task-041.implementationNotes` names `InitialSettingsPage.tsx:39` and `WalletSummaryPage.tsx:137`
   as "the two confirmed readers" and says to sweep for the rest. Done as a sweep from the start, so
   the list is measured rather than grown by failure.
3. `task-039.implementationNotes` assigned `networkStatus` to that task and this entry assigns it
   here. Resolved at `task-039`: it was left present and empty there and is filled here.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-041-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-041-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

`requestDefaults.ts` carries the five-field request shape, the measured request-to-store map for all
30 store-owned requests the containers read, and a helper that gives a store its own fresh copies.

`networkStatus` carries its 35 observables and 6 computed getters, settled rather than cold.

Three assertions cover the contract, and the twelve screen renders from `task-040` still pass.

`compile`, `lint`, `jest` and `storybook` pass as Nix derivations. The label set is unchanged at 270
stories, and the 258-pair component baseline is intact.

## Final Outcome

Complete.

## Self-Review

The entry frames this as about a dozen screens; it is 30 requests across 9 stores. Sweeping from the
start rather than adding fields as failures appear is the difference between one task and a defect
arriving in each of the next six tranches, which is what the entry's own note predicted.

The `networkStatus` decision is the part worth revisiting if a later tranche disagrees. Every other
default in the harness is the value the real store initialises to, and this one is not, because the
value the real store initialises to is a state that lasts half a second and would cost every screen
that reads it an override. It is written down as a departure rather than left to be discovered by
someone comparing the fixture to the store.
