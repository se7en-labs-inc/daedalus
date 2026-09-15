# Task task-050: Write one wallet-scale proof story before committing to tranche 6

## Task ID and Title

- ID: `task-050`
- Title: `Write one wallet-scale proof story before committing to tranche 6`

## Why Chosen Now

`task-050.dependencies` is `[task-049]`, complete. The entry marks this a kill criterion for the phase:
the harness was designed around a screen it had not met, and this is where it meets it.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- One screen, `WalletSummaryPage`, in all four of its states.
- Whatever the harness is missing for it.
- The measured cost, and `task-052` re-estimated against it.

## Non-Goals

- No other wallet screen. That is `task-052`, and whether it proceeds as planned is this task's output.
- No change to `source/`.

## Dependencies

- `task-049`, complete.

## Live Repo Findings Verified For Planning

Verified at `8206dd3fe`.

- `WalletSummaryPage` reads nine stores: `app`, `wallets`, `addresses`, `transactions`, `profile`,
  `assets`, `currency`, `staking` and `uiDialogs`.
- It throws outright without an active wallet (`:119`), rather than rendering a degraded screen.
- It is the third and last `withAnalytics` screen, so it needs the provider added at `task-047`.
- The harness was missing three things: `addresses`, which existed only as its one request;
  `transactions`, the same; and `staking.getRewardForWallet`, a method the real store answers by
  crossing into two other stores.
- `storybook/stories/_support/utils.ts` already carries `generateMultipleTransactions` and the
  component-level wallet stories are built from it.
- `WALLETS[4]`, the restoring wallet in the provider's own list, carries no `assets`, so the screen
  would throw on it where it reads `wallet.assets.total`.

## Files Expected To Change

- `storybook/stories/screens/wallets/WalletSummaryPage.stories.tsx`, new
- `storybook/stories/_support/harness/storeDefaults.ts`
- `storybook/stories/screens/screens.spec.tsx`
- `storybook/stories/screens/harness.spec.ts`

## Implementation Approach

1. Fill the two stores that existed only as their requests, and the one missing method.
2. Write the four states, each naming only what distinguishes it.
3. Measure what it cost and compare it with the five tranches behind it.

## The One Judgement In This Task

The restoring state could have used the wallet the provider already calls "Restoring". It carries no
`assets`, and the screen reads `wallet.assets.total` without a guard, so it would have thrown, and the
obvious next move is to patch the provider's wallet list.

That list is the fixture 258 component stories are built on. Changing it to suit one screen story puts
the component corpus downstream of the screen corpus for the rest of the epic. The story spreads the
first wallet and sets one flag instead, which is four characters longer and changes nothing outside
this file.

The same question will be asked again in `task-052` by eight more wallet screens. The answer is the
same: `task-051` builds wallet domain fixtures for the screen corpus, and the provider's list stays
what the component corpus depends on.

## Acceptance Criteria

- One wallet screen renders all four of its states from the harness.
- The measured cost is recorded and `task-052` is re-estimated against it.
- `compile`, `lint`, `jest` and `storybook` pass as Nix derivations.
- The 258-pair component baseline is intact.

## Verification Plan

- Per-file coverage from the render spec, which is the only thing that distinguishes four states from
  one state rendered four times.
- Four Nix checks, the label diff and the args audit.

## The measurement, and what it says about tranche 6

| | value |
|---|---|
| Screens | 1 |
| Stores the screen reads | 9 |
| Stores the harness was missing | 2, plus one method on a third |
| Harness lines added | 53 |
| Story file | 94 lines, 4 stories |
| Stores named per story | at most 2 |
| Override lines per story | 4 to 9 |
| States rendered on the first attempt | 4 of 4 |

The picture does not change. The screen reads nine stores and names two, because the other seven are
carrying defaults built over five tranches. Ninety-four lines for four states is within the range
tranches 3 and 5 already set, at 59 and 61 lines per screen, and this screen has more states than
either.

What the number understates is that most of the cost landed in the harness rather than in the story,
and it landed once. `addresses` and `transactions` are read by seven and six of the nine screens in
tranche 6 respectively, so the 53 lines added here are not repeated by the eight screens that follow.

One thing did change the picture, in the other direction. Before `task-048`, `StoryProvider` replaced
its own fixtures rather than merging them, so any story naming `wallets` lost the active wallet the
provider supplies, and this screen throws without one. Three of the four stories here name `wallets`
or would have. That defect was found in the chrome tranche by a screen that merely looked wrong; here
it would have been a hard throw at `:119` in a story whose fixture appeared correct.

**`task-052` re-estimate: 36 hours stands.** Nothing measured here argues for raising it, and the
harness work this task absorbed belongs to `task-051`, which is estimated separately at 12. The
remaining tranches are not re-planned.

## Corrections To The Task Graph

1. `task-050.implementationNotes` says to measure the real cost "against the tranche 1 to 5 rate from
   `task-049`". `task-049` did not produce a rate in hours, and said why. The comparison here is
   against what `task-049` did measure: lines per screen, stores named per story, and harness gaps
   closed before the tranche could start.
2. `task-050.targetPaths` names `storybook/stories/_support/StoryProvider.tsx`. Not touched, and
   deliberately: see the judgement above.
3. `task-050.description` says the only existing container fixture is a nineteen-line literal covering
   the simplest container in the application. That was true when the plan was written. Twenty-nine
   screens and a 1,226-line harness sit between that sentence and this task.
4. Five containers export a type that still requires the props their wrapper supplies, because `static
   defaultProps` does not survive a higher-order component: the two function containers under
   `inject`, and the three under `withAnalytics`. `task-048` named the type in one story; with a
   second arriving here and two more due in tranches 6 and 7, the naming moved into the harness as
   `asScreen` so the explanation lives in one place. The application suppresses the same error with a
   `@ts-ignore` at `MainLayout.tsx:108`; no suppression is added here.

## Required Docs, Research, and Tracking Updates

- Set `task-050.status` to `completed`.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-050-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-050-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

Four stories, all four states rendering. `WalletSummary.tsx` and `WalletNoTransactions.tsx` both at
100% of statements and branches from the render spec; `WalletSummaryPage.tsx` at 83.05 and 90.9.

The harness gained the `addresses` and `transactions` stores and `staking.getRewardForWallet`.

## Final Outcome

Complete. The kill criterion is not met; tranche 6 proceeds as planned.

## Self-Review

The screen this harness was designed around took two store names per story and rendered all four
states on the first attempt. That is the answer the phase needed, and the reason it is that answer is
five tranches of defaults rather than anything about this screen.

The part worth stating plainly is the counterfactual. This task would have failed against the harness
as it stood two commits ago, with a hard throw rather than a wrong screen, and the defect that would
have caused it was found by the weakest assertion in the spec on a screen nobody considered difficult.
The proof gate was passed by work that happened before the gate.
