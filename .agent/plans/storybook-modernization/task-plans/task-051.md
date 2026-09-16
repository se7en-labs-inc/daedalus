# Task task-051: Build the wallet domain fixture data

## Task ID and Title

- ID: `task-051`
- Title: `Build the wallet domain fixture data`

## Why Chosen Now

`task-051.dependencies` is `[task-050]`, complete. Tranche 6 is nine wallet screens and the entry
calls this the largest fixture volume in the plan.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- Wallet, transaction, asset and address fixtures the wallet screens can branch on.
- The remaining store shapes tranche 6 reads.
- A dialog state expressible as one override.

## Non-Goals

- No story files. `task-052` opens the roster.
- No change to `source/`.

## Dependencies

- `task-050`, complete.

## Live Repo Findings Verified For Planning

Verified at `08e22a553`.

- `Wallet` declares 19 observables and **11 computed getters** (`domains/Wallet.ts:222-287`). The
  wallet screens branch on most of them: the receive screen on `isRandom` against `isSequential`, the
  shell on `isRestoring`, the summary on `hasAssets`, the sidebar on `isDelegating`.
- `isRestoring` is not the sync status alone: it is `RESTORING` **and** `restorationProgress < 100`
  (`:233-238`), so the progress number is part of the state rather than decoration on it.
- Tokens and assets live apart and are joined at render time by `uniqueId`.
  `WalletSummaryPage.tsx:129` reads a shortfall in that join as loading still in progress, so a token
  with no matching asset produces a permanent spinner rather than a gap.
- `uiDialogs.isOpen` takes the dialog component itself, and `WalletSettings` mounts ten dialogs side
  by side (`WalletSettings.tsx:368-402`).
- `storybook/stories/_support/utils.ts` already generates wallets, transactions and assets, entirely
  from faker.
- Nothing outside the screen corpus reads `stores.wallets.active`. The component corpus reaches the
  provider's wallet list through `storiesProps`, which `StoryLayout.tsx:98-99` reads.

## Files Expected To Change

- `storybook/stories/_support/harness/fixtures/wallets.ts`, new
- `storybook/stories/_support/harness/fixtures/transactions.ts`, new
- `storybook/stories/_support/harness/fixtures/assets.ts`, new
- `storybook/stories/_support/harness/storeDefaults.ts`
- `storybook/stories/_support/harness/storeDefaults.spec.tsx`
- `storybook/stories/_support/StoryProvider.tsx`
- `storybook/stories/screens/wallets/WalletSummaryPage.stories.tsx`

## Implementation Approach

1. Build real `Wallet`, `WalletTransaction`, `Asset` and `WalletAddress` instances, deterministically.
2. Export the paired shapes as single overrides, so a story cannot supply half a join.
3. Give the provider a domain wallet in place of its literal, leaving its wallet list alone.
4. Assert the getters, the join and the dialog predicate.

## The One Judgement In This Task

`StoryProvider` supplied `stores.wallets.active` as a literal from its own `WALLETS` list. It carries
the observables and none of the eleven getters, so every branch testing one takes its false arm and
renders a state the application cannot be in. Nine screens in the next tranche branch on those.

The options were to leave it and have each wallet story name a domain wallet, which is nine
repetitions of the same line and exactly the duplication the `task-049` check exists to find; to
rebuild the whole `WALLETS` list as domain instances, which is the fixture 258 component stories are
laid out from; or to replace the single field.

Measured: nothing outside the screen corpus reads `stores.wallets.active`, and the component corpus
reads the list through `storiesProps`, which is untouched. So the field changes and the list does not.
The 74 existing screen stories pass unchanged, which is what says the substitution was additive.

This is the third time this phase that the cheap repair would have put the component corpus downstream
of the screen corpus. It is worth naming as a pattern rather than as three separate decisions: the two
corpora share a provider and must not share a fixture, because only one of them has a render check.

## Acceptance Criteria

- A wallet, a transaction list, an asset list and an address list are available from the harness.
- A dialog state is expressible as a single override.
- `compile`, `lint`, `jest`, `storybook` and `docs` pass as Nix derivations.
- The label set is unchanged from `task-050`.

## Verification Plan

- Assertions on the computed getters, not on the fields: a literal with the same observables answers
  `undefined` to all ten and would fail.
- An assertion that every wallet token resolves to an asset, because the failure mode of a broken join
  is a permanent loading state rather than a crash.
- An assertion that two calls produce the same ids, which rules out the generated fixtures.
- Five Nix checks and the label diff, which must show no change, because this task adds no story.

## Corrections To The Task Graph

1. `task-051.targetPath`, the singular field, names `storybook/stories/_support/StoryProvider.tsx`.
   That file is touched, by one field, but the fixtures live in the three files `targetPaths` names.
   The singular field has been stale since `task-039` moved the store map into the harness.
2. `task-051.implementationNotes` says to reuse the fixtures exported by the wallet story files rather
   than writing a second set. They are reused in shape and not in substance: every one of them draws
   its ids, amounts, addresses and dates from faker. That is right for a component story exercising
   layout against arbitrary content, and wrong for a screen story, where two runs must produce the
   same screen for a comparison to mean anything. The shapes are the same and the randomness is gone.
3. The same note says `StoryProvider.tsx:20-129` "covers only the Wallet domain shape". It covers less
   than that: the entries are object literals, not `Wallet` instances, so they carry none of the
   eleven getters the domain defines.
4. `task-051.description` lists `currency` among the nine store keys arriving with this tranche. It
   arrived at `task-042` with the wallets settings screen. `hardwareWallets` and `uiDialogs` were
   already present from `task-039`.
5. `task-052.targetPaths` puts the wallet stories under `storybook/stories/screens/wallet/`, singular,
   while `WalletSummaryPage.stories.tsx` already exists under `screens/wallets/`, plural, from
   `task-050`. The plural directory is kept: it matches the `Screens / Wallets` title the sidebar
   already shows and the `assets` directory beside it, and moving a committed file to satisfy a path
   in the plan is churn with no reader-visible gain.

## Required Docs, Research, and Tracking Updates

- Set `task-051.status` to `completed`.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-051-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-051-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

Three fixture modules: wallets in seven named states, deterministic transaction lists with their
counts, and tokens paired with the assets that resolve them. `walletSettings` and `walletMigration`
filled from their declarations, and `dialogOpen` for the ten-dialog screens.

`StoryProvider` supplies a real `Wallet`. The 74 existing screen stories pass unchanged.

`compile`, `lint`, `jest`, `storybook` and `docs` pass as Nix derivations, and the label set is
unchanged.

## Final Outcome

Complete.

## Self-Review

The fixtures are asserted through their getters rather than their fields, which is the only way to
tell a domain instance from an object that looks like one. That distinction is the whole task: the
literal that was there rendered every wallet screen, and rendered them in states the application
cannot reach.

Determinism is the second thing, and it is a departure from the component corpus rather than a
correction to it. A component story wants arbitrary content, because arbitrary content is what finds a
layout bug. A screen story wants the same screen twice, because a screen story is read by comparing it
with the last one. Both are right for what they are for, and the harness now has its own.
