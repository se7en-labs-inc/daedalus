# Task task-053: Build the staking domain fixture data

## Task ID and Title

- ID: `task-053`
- Title: `Build the staking domain fixture data`

## Why Chosen Now

`task-053.dependencies` is `[task-052]`, complete. One store key arrives with tranche 7 and the pool
data already exists in the repository.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- The `staking` store's observables, its computed getters and the methods the screens pass down.
- Stake pools, recent pools and reward rows.

## Non-Goals

- No story files. `task-054` opens the roster.
- No change to `source/`.

## Dependencies

- `task-052`, complete.

## Live Repo Findings Verified For Planning

Verified at `246192d27`.

- `StakingStore` declares 24 observables, 10 computed getters and several methods the screens pass
  down as props, including `getStakePoolById` and `showCountdown`.
- `source/renderer/app/config/stakingStakePools.dummy.json` carries 300 pools and is what the
  component-level staking stories already use.
- `staking.redeemStep` is read by `Root.tsx:68-70` to decide whether the ITN redemption container is
  mounted at all, so `null` is the difference between a screen and no screen rather than between two
  screens.
- `stakePoolsListViewTooltipVisible` starts `true` in the store. It anchors a Tippy instance to a ref
  the page fills in after mount, and Tippy measures its target against the document when it shows.

## Files Expected To Change

- `storybook/stories/_support/harness/fixtures/staking.ts`, new
- `storybook/stories/_support/harness/storeDefaults.ts`

## Implementation Approach

1. Lift the pool sample rather than writing one, and keep its full 300 entries.
2. Derive the reward rows from the harness's own wallet list, as the real getter derives them from the
   wallets store.
3. Default the first-run tooltip to dismissed, with the reason.

## The One Judgement In This Task

The stake pool list virtualises its rows, so the fixture's size is part of what it tests. Three pools
would render a list that never scrolls, never recycles a row and never exercises the search or the
ranking, and every screenshot taken from it would be of a screen no user has.

So the fixture is the application's own 300-entry sample, unsliced. The cost is that a story mounting
it is the slowest in the corpus; the alternative is a list story that proves the list works at a size
the list never sees.

`recentStakePools` is the first three of the same array rather than a separate fixture, because the
real getter is a subset of the same data and two independent lists would let a story show a pool in
the recent group that is absent from the full one.

## Acceptance Criteria

- The staking store is reachable from a story override rather than copied per story.
- Stake pools, recent pools, rewards and the redemption step are all available.
- `compile`, `lint`, `jest` and `storybook` pass as Nix derivations.
- The label set is unchanged from `task-052`.

## Verification Plan

- Four Nix checks and the label diff, which must show no change, because this task adds no story.
- The fixtures are exercised for real by `task-054` immediately after.

## Corrections To The Task Graph

1. `task-053.implementationNotes` says to reuse the stake pool and delegation fixtures from the
   staking stories. The pools are reused, and they are not the stories' own: those stories import
   `config/stakingStakePools.dummy.json`, which is the application's sample. The harness imports the
   same file rather than importing it through a story support module.
2. `task-053.description` says stake pool fixtures already exist "in the staking stories". They exist
   in `source/renderer/app/config/`, which matters because the harness may import from `config/` and
   must not import from a story's support directory in the other corpus.
3. `stakePoolsListViewTooltipVisible` is defaulted to `false` against the store's `true`. This is the
   third deliberate departure from a real store's initial value, after `networkStatus` and `backend`,
   and the first with two reasons rather than one: it is the state all but the first session is in,
   and it is the only one that can be rendered without a layout engine.

## Required Docs, Research, and Tracking Updates

- Set `task-053.status` to `completed`.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-053-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-053-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

`fixtures/staking.ts` carries the store's observables, its computed getters as plain values, the pool
lookup and the countdown predicate, 300 pools from the application's own sample, and reward rows
derived from the harness wallet list.

## Final Outcome

Complete.

## Self-Review

The list size is the decision worth keeping. Everything else in this file is transcription.

The tooltip default is the one that deserves a second look later. It is defended on two grounds and
only one of them is about the application: the other is that jsdom has no layout, which is a statement
about the check rather than about the screen. If the render check ever moves to a real browser, that
half of the reason goes away and the default should be revisited.
