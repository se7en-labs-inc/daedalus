# Task task-052: Screen tranche 6, 9 screens

## Task ID and Title

- ID: `task-052`
- Title: `Screen tranche 6: wallets, 9 screens`

## Why Chosen Now

`task-052.dependencies` is `[task-051]`, complete. This is the largest tranche in the plan and the
one `task-050` was set as a gate in front of.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- The nine screens named in `task-052.targetPaths`.
- Whatever the harness and the test environment are missing for them.

## Non-Goals

- No change to `source/`.
- The wallet dialog containers, which the roster treats as exercised through the screen that opens
  them rather than as coverage targets.

## Dependencies

- `task-051`, complete.

## Live Repo Findings Verified For Planning

Verified at `75a512601`, by reading all nine container render bodies.

- Five of the nine branch on the wallet's own kind rather than on the route: the shell picks a
  navigation set, the receive screen picks between two entirely separate screens on `isRandom`, the
  settings screen drops the password section for a hardware wallet.
- Three throw rather than degrade without an active wallet: `WalletSummaryPage.tsx:119`,
  `WalletUtxoPage.tsx:32`, `WalletTokensPage` and `WalletSendPage` likewise.
- Six store members were missing: `walletSettings.getWalletsRecoveryPhraseVerificationData` and
  `getLocalWalletDataById`, `wallets.environment` and `isValidAddress`, `addresses.active` and
  `error`, and `transactions.validateAmount`, `validateAssetAmount` and `populatedFilterOptions`.
  Four of them are methods, so they throw rather than read `undefined`.
- `WalletReceiveDialog.tsx:3` imports `HardwareWalletsStore`. A component importing a store means
  importing that component pulls the entire store graph behind it, which here is `@trezor/connect`
  and its `@noble` dependencies.
- Those packages publish ESM only, and `@noble/hashes` calls `TextEncoder` at import time. Neither
  jest's transform list nor jsdom provided for that, so the receive screen could not be imported.

## Files Expected To Change

- Eight new story files under `storybook/stories/screens/wallets/`
- `storybook/stories/_support/harness/storeDefaults.ts`
- `storybook/stories/_support/harness/fixtures/transactions.ts`
- `storybook/stories/_support/StoryProvider.tsx`
- `storybook/stories/screens/screens.spec.tsx`
- `storybook/stories/screens/harness.spec.ts`
- `jest.config.js`, `jest.setup.js`

## Implementation Approach

1. Close the six store gaps, four of which are methods.
2. Make the hardware wallet dependency loadable in a spec rather than routing around it.
3. Write the eight story files, branching on the wallet rather than on the route where the screen
   does.

## The One Judgement In This Task

The receive screen could not be imported under jest, because a component in its tree imports a store,
that store imports `@trezor/connect`, and that publishes ESM which calls `TextEncoder` at module load.
The cheap answer is to map the package to a stub, which would have taken one line and left the screen
mounting something that is not the screen.

Both the real causes are properties of the test environment rather than of the code: jest's transform
list excluded the package, and jsdom omits two platform globals that exist in every browser and in
Node. So both are fixed where they belong, and the screen mounts the components it really has.

What this does not fix, and what is worth saying rather than absorbing: a component importing a store
is backwards. `WalletReceiveDialog` needs three constants and a type from `HardwareWalletsStore` and
takes the whole module, which is why a display component drags a USB protocol library into anything
that renders it. The import stays as it is, because this phase does not change `source/`.

## Acceptance Criteria

- All nine screens have a story file and appear under the wallets group.
- Every nested container renders rather than throwing on an undefined store.
- `compile`, `lint`, `jest`, `storybook` and `cucumber-unit` pass as Nix derivations.
- The 258-pair component baseline is intact and the diff against `task-051` is additive only.
- No new `@ts-ignore` directives.

## Verification Plan

- The render spec composes all 98 screen stories.
- Per-file coverage for the nine containers and the components below them, which is what separates a
  container that rendered its branch from one that declined to.
- The harness import assertion, extended to the harness itself, so the thing that made this tranche
  hard cannot be reintroduced deliberately.
- Five Nix checks, `nix fmt`, the label diff and the args audit.

## Corrections To The Task Graph

1. `task-052.targetPaths` puts the nine files under `storybook/stories/screens/wallet/`, singular.
   They are under `screens/wallets/`, plural, which is where `task-050` put the first of them and
   which matches the `Screens / Wallets` title the sidebar shows.
2. `task-052.implementationNotes` gives `WalletTokensPage` as reading `activeWallet.assets.total` at
   `:41`. It does, and it also joins those against the assets store and reads a shortfall as loading
   in progress, so supplying the wallet without the store produces a screen that spins rather than one
   that shows fewer rows.
3. The same note says `WalletSettingsPage` mounts eight nested containers "rendered only behind
   `isDialogOpen`". Correct, and the cost is not only in rendering: all eight are constructed as
   elements on every render whether or not any dialog is open.
4. `task-052.implementationNotes` says `WalletSummaryPage` throws "without a fully shaped Wallet domain
   object". It throws without an active wallet at all. A half-shaped one does not throw; it renders,
   with every computed getter reading `undefined`, which is the worse failure and the one `task-051`
   addressed.
5. The entry lists no test-environment work. Two of jest's settings had to change before three of
   these screens could be imported, and neither is a property of the code under test.

## Required Docs, Research, and Tracking Updates

- Set `task-052.status` to `completed`.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-052-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-052-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

Eight new story files carrying 24 stories, and the summary screen from `task-050` alongside them. All
nine containers execute: `WalletTransactionsPage` at 95.83% of statements, `WalletUtxoPage` at 95.23,
`WalletTokensPage` at 88.46, `WalletSummaryPage` at 83.05, and the display components below them from
100% down to 61.7.

The harness gained six store members. The test environment gained a transform rule and two platform
globals.

## Final Outcome

Complete.

## Self-Review

Twenty-four stories for nine screens, and the fixture work was `task-051` rather than this. That is
the shape `task-050` predicted and the reason the estimate was left alone.

The cost that was not predicted was the test environment. Three screens could not be imported at all,
for reasons that had nothing to do with them: a dependency published as ESM, and two globals jsdom
omits. Neither is visible from a render body, so no amount of reading the containers would have found
them, and both were paid once.

The receive screen is the least covered in the corpus at 40.65% of statements, and honestly so. Its
handlers generate addresses, export PDFs and verify on a device, and a story that renders it reaches
none of that. The number is reported rather than smoothed over.
