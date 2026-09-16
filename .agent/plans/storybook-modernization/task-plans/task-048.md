# Task task-048: Screen tranche 5, 4 screens

## Task ID and Title

- ID: `task-048`
- Title: `Screen tranche 5: chrome, 4 screens`

## Why Chosen Now

`task-048.dependencies` is `[task-047]`, complete. Every screen from here on renders inside
`MainLayout`, so this tranche unblocks the rest of the corpus, and it is where the route mechanism
from `task-047` meets a real consumer.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- The four screens named in `task-048.targetPaths`.
- Whatever the harness is missing that they need.

## Non-Goals

- No change to `source/`.
- No screens outside the roster.

## Dependencies

- `task-047`, complete.

## Live Repo Findings Verified For Planning

Verified at `f3da3ef28`.

- `MainLayout` reads five stores and mounts three dialog containers alongside its child. The sidebar
  it builds takes `pathname` straight from `stores.router.location` (`:100`).
- `TopBarContainer` reads seven stores and nearly everything it shows is conditional. With no wallet
  open, on mainnet, with nothing unread, every piece of text is behind a condition and the bar is a
  row of icons.
- `Governance` is the screen that exercises both route mechanisms: it is wrapped in `withRouter` and
  pushes through `history` (`:43-45`), and it picks its active tab from `app.currentRoute` (`:67-70`).
- The harness was missing `sidebar` entirely, `staking.stakingInfoWasOpen` and `wallets.isWalletRoute`.
- **`StoryProvider` replaced its own fixtures rather than merging them.** Its three fixture blocks sat
  at the same level as the story's overrides in one object spread, so a story naming `wallets` to set
  one flag lost the active wallet the provider supplies. Measured: the top bar story asked to be on a
  wallet route and rendered with no wallet.

## Files Expected To Change

- Four new story files at the paths in `task-048.targetPaths`
- `storybook/stories/_support/StoryProvider.tsx`
- `storybook/stories/_support/harness/storeDefaults.ts`
- `storybook/stories/_support/harness/storeDefaults.spec.tsx`
- `storybook/stories/screens/screens.spec.tsx`

## Implementation Approach

1. Fill `sidebar` from its declarations, using the application's own category list.
2. Fix the override layering in `StoryProvider` so a story's override merges onto the provider's
   fixture instead of replacing it.
3. Write the four story files, using the path as the input wherever the screen's appearance depends on
   where it is.

## The One Judgement In This Task

The provider's layering bug could have been worked around in the one story that hit it, by naming the
active wallet alongside the flag. Three lines, no change to shared code, and the story would have been
correct.

It would also have left the next twenty screens to find the same thing one at a time, each as a
screen that renders a plausible but wrong state rather than as a failure. The bug's whole character is
that it produces something that looks right: a top bar with no wallet is a real state, so nothing about
the output says the fixture was silently discarded.

So the layering is fixed where it is, with an assertion that a story override merges onto the
provider's fixture and both merge onto the harness defaults. The three layers now all merge one key
deep, which is what `withStoreOverrides` already documented and what the provider was quietly not
doing.

## Acceptance Criteria

- All four story files exist at the paths in `targetPaths`.
- `MainLayout` renders with its sidebar, top bar and a child screen.
- A screen wrapped in `withRouter` and a screen reading `stores.router.location` both agree with the
  path their story declared.
- `compile`, `lint`, `jest`, `storybook` and `docs` pass as Nix derivations.
- The 258-pair component baseline is intact and the diff against `task-047` is additive only.

## Verification Plan

- The render spec composes all 70 screen stories.
- Per-file coverage for the four containers and the layout components below them.
- One assertion on the provider's layering, which fails if the fixtures are replaced again.
- Five Nix checks, `nix fmt`, the label diff and the args audit.

## Corrections To The Task Graph

1. `task-048.implementationNotes` says `MainLayout` reads six stores. It reads five: `sidebar`,
   `profile`, `app`, `wallets` and `networkStatus`. The nested containers read more, which is the
   claim that matters and is stated correctly two lines later.
2. The same note says `TopBarContainer` "additionally needs the discreet-mode feature context".
   `StoryProvider` has supplied that since before this phase, so it needed nothing additional. What it
   did need was `wallets.isWalletRoute` and `staking.stakingInfoWasOpen`, neither of which the entry
   mentions.
3. `task-048.implementationNotes` says `StoryLayout.tsx` "already assembles Sidebar and SidebarLayout
   for component stories; reconcile it with the container story rather than maintaining two shells".
   Not done, and deliberately. `StoryLayout` is the frame 258 component stories render inside and it
   builds a sidebar from story props; `MainLayout` is the application's own shell and builds one from
   stores. They are two different things that look alike, and merging them would put the component
   corpus's frame on the critical path of the screen corpus for no gain. Recorded rather than silently
   skipped; `task-049` is the place to revisit it.
4. `task-048.acceptance` requires each story to render "the screen's own content rather than an empty
   shell". Two top bar stories are precisely an empty shell, by design, and they use the fourth
   outcome added at `task-046`.
5. `TopBarContainer` is the only container in the corpus whose exported type still requires `stores`
   and `actions` after `inject` has supplied them: every other one is a class with `static
   defaultProps`, and this one is a function whose defaults live in its parameter list. The
   application hits the same thing and suppresses it with a `@ts-ignore` at `MainLayout.tsx:108`. The
   story names the type `inject` produces instead, so nothing is excused from checking beyond those
   two props.

## Required Docs, Research, and Tracking Updates

- Set `task-048.status` to `completed`.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-048-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-048-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

Four story files carrying thirteen stories. `MainLayout` renders its sidebar, top bar, three dialog
containers and a child at two different routes. `Governance` renders at all three of its tabs.

The harness gained the `sidebar` store, `staking.stakingInfoWasOpen` and `wallets.isWalletRoute`, and
`StoryProvider` now layers its fixtures rather than losing them.

The render spec covers 70 screen stories. Coverage shows `Governance` at 100% of statements and
`Settings` at 91.66, which are the two route consumers.

## Final Outcome

Complete.

## Self-Review

The tranche did what `task-047` could not, which was to try the route mechanism on screens that read
it two different ways. It works, and the evidence is that `Governance` picks a tab.

The provider layering bug is the more valuable find. It had been there since before this epic and
would have been invisible for as long again: it produces a screen, in a real state, that is not the
state the story asked for. It was caught because a story asserted content and got none, which is the
weakest assertion in the spec and still the one that found it.

The `StoryLayout` reconciliation is deferred with a reason rather than done. It is the one item in
this tranche's notes not carried out, and `task-049` is next.
