# Task task-054: Screen tranche 7, 6 screens

## Task ID and Title

- ID: `task-054`
- Title: `Screen tranche 7: staking, 6 screens`

## Why Chosen Now

`task-054.dependencies` is `[task-053]`, complete.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- The six screens named in `task-054.targetPaths`.
- The delegation wizard, once, from whichever parent is cheaper.

## Non-Goals

- No change to `source/`.
- No screens outside the roster.

## Dependencies

- `task-053`, complete.

## Live Repo Findings Verified For Planning

Verified at `246192d27`, by reading all six container render bodies.

- `Routes.tsx:166` wraps every staking page in the `Staking` shell, and `StakePoolsSearch.tsx:196`
  reads `scrollElementRef.current` from a context only that shell provides. A staking page mounted on
  its own is not a simpler version of the real screen; it is a screen the router cannot produce.
- The staking shell refuses outright until the node is synced, unless a delegation dialog is already
  open (`Staking.tsx:96-104`).
- `RedeemItnRewardsContainer` returns null without `redeemStep`, and has two further refusals that are
  separate screens rather than states: a node still syncing, and an installation with no wallets.
- `DelegationCenterPage` has a distinct screen for having no wallets, and treats an empty pool list as
  still loading.
- `lodash-es` is ESM and is imported by `StakePoolsList.tsx:2`.

## Files Expected To Change

- Six new story files, five under `storybook/stories/screens/staking/` and one under
  `screens/settings/`
- `storybook/stories/_support/harness/fixtures/staking.ts`
- `storybook/stories/screens/screens.spec.tsx`
- `storybook/stories/screens/harness.spec.ts`
- `jest.config.js`

## Implementation Approach

1. Mount every staking page inside the shell, as the router does.
2. Write a story per refusal, since each is a different screen rather than a state.
3. Cover the delegation wizard from the pool list, which already has the data it needs.

## The One Judgement In This Task

The staking pages were written first as bare containers, the way the wallet screens are. Three of them
then failed, and the reason is that they are never mounted bare: the router wraps them in a shell that
provides a scroll context, and a search control inside the pool list dereferences it without a guard.

The available repairs were to guard the dereference, which is a change to shipped source that this
phase does not make; to supply the context from the story, which is the harness pretending to be a
shell it is not; or to mount the page the way the router mounts it.

The third is both the fix and the more faithful story. It costs one wrapper per story and it means the
screenshot shows what a user sees, navigation and all, rather than a fragment that only exists in a
workbench.

`DelegationCenterPage` and `StakingRewardsPage` did not need it and are wrapped anyway, because a
corpus where two staking screens carry their shell and two do not is a corpus where the difference
means nothing.

## Acceptance Criteria

- All six screens have a story file and appear under the staking group.
- The delegation wizard is covered once, and from a named parent.
- `compile`, `lint`, `jest`, `storybook` and `docs` pass as Nix derivations.
- The 258-pair component baseline is intact and the diff against `task-052` is additive only.

## Verification Plan

- The render spec composes all 116 screen stories.
- Per-file coverage for the six containers and the components below them.
- Five Nix checks, `nix fmt`, the label diff and the args audit.

## Corrections To The Task Graph

1. `task-054.implementationNotes` says the countdown branch of the staking shell "is unreachable in a
   shipped build and is covered only if it is cheap". Not covered, and the reason is stated in the
   story file rather than left as a gap: the store computes it from Shelley still being pending.
2. The same note says to cover the delegation wizard "from whichever parent is cheaper, and say
   which". Covered from `StakePoolsListPage`, because that screen already carries the pool list the
   wizard shows and the delegation centre would have needed it added.
3. `task-054.implementationNotes` gives the staking shell's states as not-synced, countdown and
   normal. There is a fourth, and it is the one that makes the first conditional: the shell renders
   normally while unsynced if a delegation or undelegation dialog is already open, so a user part-way
   through delegating does not lose the dialog when the node falls behind.
4. `StakePoolsSettingsPage` is listed under `targetPaths` at `screens/settings/`, unlike the other
   five. Kept there: it is a settings screen that happens to configure staking, and it renders inside
   the settings shell rather than the staking one.

## Required Docs, Research, and Tracking Updates

- Set `task-054.status` to `completed`.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-054-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-054-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

Six story files carrying 18 stories. All six containers execute: `RedeemItnRewardsContainer` at 96% of
statements, `StakePoolsSettingsPage` at 92.3, `Staking` at 84.61, `DelegationCenterPage` at 74.28,
`StakePoolsListPage` at 64.51, `StakingRewardsPage` at 60.86. `StakingUnavailable`,
`DelegationCenterNoWallets` and `StakingWithNavigation` are all at 100% of statements and branches.

The label set is 374 pairs, up 18, with the 258-pair component baseline intact.

## Final Outcome

Complete.

## Self-Review

Wrapping the pages in their shell is the whole content of this tranche, and it came from a failure
rather than from the plan. The plan copied the wallet tranche's shape, where a page is mounted bare
and the shell is a separate screen, and that shape is wrong here because the router never produces it.

The 44 screens now covered include every one that fails to render on its own for a structural reason,
and each is mounted the way the application mounts it. That is a better corpus than the one the plan
described, and the reason is that three stories failed rather than that anybody reasoned it out.
