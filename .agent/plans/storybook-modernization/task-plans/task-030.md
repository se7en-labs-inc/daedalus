# Task task-030: Convert knobs in the wallets tranche

## Task ID and Title

- ID: `task-030`
- Title: `Convert knobs in the wallets tranche`

## Why Chosen Now

`task-030.dependencies` is `[task-026]`, complete, and it is the largest knob population left. Eight
of the corpus's ten remaining hoists are in it, so it is where the phase's one genuine stop-and-ask
risk lives.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- Every knob under `storybook/stories/wallets` and in
  `source/renderer/app/components/wallet/tokens/wallet-token-picker/WalletTokenPicker.stories.tsx`.
- The two `withState` sites in `wallets/tokens/`, converted in the same pass as their files' knobs.
- The knob inside the `wallets/transactions/TransactionsList.stories.tsx` decorator, which reads from
  the context rather than from a story body.

## Non-Goals

- No `@ts-ignore` removed unless its only subject was the knob call, per locked decision 8.
- No change to `_support/StoryLayout.tsx` or `_support/DiscreetModeToggleKnob.ts`, which the
  `task-029` open question covers.
- No change to any story export, `name` or panel title.

## Dependencies

- `task-026`, complete.

## Research Consulted

- `.agent/plans/storybook-modernization/task-plans/knob-conversion-patterns.md`, the hoist rule
- `.agent/plans/storybook-modernization/task-plans/task-027.md`, `task-028.md`, `task-029.md`
- `.agent/plans/storybook-modernization/task-plans/phase-3-closing-notes.md`, on the decorator that
  calls `story({ ... })`
- `.agent/plans/storybook-modernization/storybook-modernization-tasks.json`, `task-030`

## Docs, Workflows, and Skills Consulted

- Docs: `AGENTS.md`, `CLAUDE.md`

## Live Repo Findings Verified For Planning

Verified at `396dd649c`.

- 156 knob call sites across 21 files under `storybook/stories/wallets`. The largest are
  `settings/_support/WalletSettingsScreen.tsx` 27, `transactions/Transaction.stories.tsx` 21,
  `transactions/Utxo.stories.tsx` 19, `receive/WalletReceive.stories.tsx` 18,
  `summary/WalletSummary.stories.tsx` 15 and `send/WalletSend.stories.tsx` 14.
- `source/renderer/app/components/wallet/tokens/wallet-token-picker/WalletTokenPicker.stories.tsx`
  holds no knob and carries only a `withKnobs` decorator entry.
- Eight of the census's ten hoists are here, and none is a knob in a loop. Four in
  `settings/_support/WalletSettingsScreen.tsx` sit in single-call closures, two inside
  `isDialogOpen={(dialog) => ...}` and two inside `countdownFn={() => ...}`. Four in
  `transactions/Transaction.stories.tsx` sit inside a `.map()` guarded by `index === 0`, so the map
  reads them once. Every one converts to a value read outside the closure and referenced inside it,
  with no change to what renders.
- The one remaining module-scope relocation is `wallets/_utils/CreateWalletScreens.tsx:35`, a
  `boolean` in a class getter at module scope.
- `transactions/TransactionsList.stories.tsx` puts a `select` in its decorator, and its two stories
  read the props the wrapper injects by calling `getStory({ ... })`, which Storybook merges onto the
  context. Those reads are the second render argument, not the first, so they are outside the args
  audit's scope and stay as they are.

## Files Expected To Change

All 21 files the census lists under `storybook/stories/wallets`, plus
`source/renderer/app/components/wallet/tokens/wallet-token-picker/WalletTokenPicker.stories.tsx`.

## Implementation Approach

1. Convert smallest file first, re-running the census per file, so a file that does not reach zero is
   visible at once.
2. Follow `knob-conversion-patterns.md`. Group ids become table categories; labels that are not
   identifiers become camelCase arg names.
3. For each hoist, read the value outside the closure and reference it inside. Check by eye that the
   closure still returns what it returned.
4. Convert the two `withState` sites to `useArgs` in the same pass as their files' knobs.
5. For the decorator knob, declare the arg on the meta and read `context.args` in the decorator.
6. Re-run the census, the args audit and the label diff, then the three Nix checks.

## Acceptance Criteria

- No knob import remains under either target path.
- The census reports the tranche at zero call sites and the corpus down by exactly 156.
- `story-args-audit.js` stays at zero findings.
- The label set is identical, pair for pair.
- `compile`, `lint` and `storybook` pass as Nix derivations.

## Verification Plan

- Census per file, before and after.
- `story-args-audit.js`, with every count move accounted for.
- `index.json` label set diffed in both directions.
- `nix build '.#checks.x86_64-linux.{compile,lint,storybook}' --no-link`.

## Risks and Open Questions

- `task-030.implementationNotes` predicts this tranche is the one most likely to overrun "because its
  knobs are concentrated in mapped lists over wallet and token arrays". Measured, they are not: the
  census puts eight hoists here and every one is a single-call closure. The four inside a `.map()` are
  guarded to the first element.

## Required Docs, Research, and Tracking Updates

- Set `task-030.status` to `completed`.

## Corrections To The Task Graph

1. `task-030.implementationNotes` names `wallets/settings/WalletSettingsScreen.stories.tsx` at 445
   lines. The file is `wallets/settings/_support/WalletSettingsScreen.tsx` at 369 lines; `task-062`
   moved and renamed the sibling-registering files in phase 1.
2. The same note says `wallets/send/WalletSend.stories.tsx` is 489 lines. It is 511.
3. The note predicting mapped lists over wallet and token arrays does not match the census. See above.

## Defects Found In The Repository, Not In The Plan

- `wallets/settings/_support/WalletSettingsScreen.tsx` registered
  `WalletSettingsRemoveConfirmationDialog: Wallet Name` twice in one group, with the defaults
  `Wallet To Delete` and `Wallet To Unpair`. addon-knobs returns the value already registered under a
  key, so both dialogs have always shown `Wallet To Delete`. One arg feeds both, which is what
  renders. Making them independent is a change to what the story shows and a decision for the owner.
- The same file calls `number('Delete Wallet Countdown', 9, deleteWalletId)` and the unpair
  equivalent, passing the group id where the number options belong. Neither control was ever in the
  `Delete Wallet` group. Both suppressed by `ts-migrate(2559)`.
- The same file calls `select('Active dialog', recoveryDialogOptions, 'None', recoveryPhraseId)`,
  passing the option's label where its value belongs, suppressed by `ts-migrate(2345)`. The value the
  control produced was the string `None`, and the comparisons it feeds test for 1 to 4, so it matched
  nothing. The arg is `recoveryDialogOptions.None`, which is 0, and matches nothing for the right
  reason.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-030-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-030-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

156 knob call sites removed across 21 files, plus the `withKnobs` decorator entry in
`source/renderer/app/components/wallet/tokens/wallet-token-picker/WalletTokenPicker.stories.tsx`. The
corpus goes from 229 to 73: 69 renames, 2 hoists, 2 relocations. Both remaining hoists and both
remaining relocations are outside this tranche.

Eight hoists converted and none needed a decision. Four sat in single-call closures and four in a
`.map()` guarded to its first element, so each became a value read outside the closure.

The one module-scope relocation, a knob in a class getter in
`wallets/_utils/CreateWalletScreens.tsx`, became a prop with its default exported for the story that
renders it.

The two `withState` sites in `wallets/tokens/` are `useArgs`, neither taking the exception.

`wallets/transactions/TransactionsList.stories.tsx` had its knob in the decorator. The arg is on the
meta and the decorator reads it from the context.

`wallets/_utils/WalletsWrapper.tsx` and `HardwareWalletsWrapper.tsx` both passed the story through
`withKnobs` by hand rather than declaring the decorator, as `SettingsWrapper` did in `task-029`. Both
call the story directly now.

The label set is unchanged: 258 stories across 49 panels, identical pair for pair in both directions.

`story-args-audit.js` stays at zero findings. Renders reading the first argument went 54 to 78;
renders it cannot resolve is unchanged at 5.

`compile`, `lint` and `storybook` pass as Nix derivations.

## Final Outcome

Complete.

## Self-Review

The task entry named the wrong risk. It predicted a tranche dominated by knobs in mapped lists, and
the census and then the code both said otherwise: eight single-call closures, no loops. What the
tranche actually cost was label collisions, which no instrument reports, because addon-knobs keys a
control by group and label together and returns the value already registered under that key without
complaint. Four of them decided four conversions, and one of the four had been showing the wrong
wallet name in the unpair dialog for as long as the file has existed.

Two suppressed type errors in the same file were arguments in the wrong position: a group id where
`number`'s options belong, and a label where a `select`'s default value belongs. The second meant the
active-dialog control's default was a string the comparisons it feeds can never match. Both were
invisible because `@ts-ignore` had been put over them.

Running the compile check part-way through rather than only at the end was worth the few minutes. The
useArgs typing problem from `task-029` would otherwise have shown up in twenty files at once.
