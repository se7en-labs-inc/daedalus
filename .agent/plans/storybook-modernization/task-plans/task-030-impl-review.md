# task-030 implementation review

## Implementation: Iteration 1

2026-09-15.

156 call sites across 21 files, smallest first, census after each. The compile check was run once
part-way through rather than only at the end, because a mistake in the fourth file is cheaper to find
before the twentieth.

Outcome: tranche at zero; corpus 229 to 73.

## Review: Iteration 1

Summary: correct. The work the tranche actually cost was not where the task entry expected it.

Four label collisions decided four conversions, and each had to be read rather than assumed, because
addon-knobs keys a control by its group and its label together and silently returns the value already
registered under that key:

- `wallets/transactions/Transaction.stories.tsx` has two knobs labelled `amount`, one per group, so
  they are two controls and the args cannot share a name. The asset's is named for the asset.
- `wallets/settings/_support/WalletSettingsScreen.tsx` has two labelled `Wallet Name`, one grouped and
  one not, so again two controls; the second is named for the dialog it fills. It also registers
  `WalletSettingsRemoveConfirmationDialog: Wallet Name` twice in one group with the defaults
  `Wallet To Delete` and `Wallet To Unpair`, which is one control: the unpair dialog has always shown
  `Wallet To Delete`. One arg feeds both, which is what renders.
- The same file passes a group id where `number`'s options argument belongs, twice, under a
  `ts-migrate(2559)` suppression. Neither countdown control was ever in a group. Left ungrouped.

Two conversions widen what a control offers without changing what a story renders, and both are worth
naming. `wallets/addWallet/Restore.stories.tsx` built its second select's label from the first
select's value, so choosing a wallet kind replaced one control with another; an arg name is fixed, so
the one arg offers all three kinds' options. `wallets/settings/_support/WalletSettingsScreen.tsx` and
`wallets/summary/WalletSummary.stories.tsx` both selected between records rather than primitives, so
the arg holds the label and the screen resolves it.

One default was wrong and is now right without changing the render. `select('Active dialog', options,
'None', ...)` passed the label where the value belongs, under a suppression, so the arg was the string
`None` while the comparisons it feeds test for 1 to 4. No dialog opened. The arg is
`recoveryDialogOptions.None`, which is 0, and no dialog opens.

Outcome: census 73, args audit zero with the first-argument count 54 to 78 and the unresolved count
unchanged at 5, label set identical pair for pair, all three checks green.

Decision: `approved`.
