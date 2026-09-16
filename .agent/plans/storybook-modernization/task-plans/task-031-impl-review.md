# task-031 implementation review

## Implementation: Iteration 1

2026-09-15.

Converted the six `_support` modules, then wired their exported args into the two story files.

Outcome: tranche at zero; corpus 73 to 47.

## Review: Iteration 1

Summary: correct after three suppressions were moved.

`_support/RedeemItnWallets.tsx` failed `compile` twice. Each dialog carried a
`ts-migrate(2769)` above `wallet={redeemWallet}`, where the knob's return type did not match. The
lookup that replaced it is untyped, so `wallet` became assignable and the overload error moved to the
next property the component does not declare: `redeemedRewards` in two dialogs and `isWalletValid` in
the first. The suppression moved to each, and the one left behind was dead.

Found the same way both times: the Nix compile check named the line. Nothing else would have, and a
dead `@ts-ignore` is invisible, which is the shape the phase 3 closing notes record twice.

Outcome: census 47, args audit zero with the first-argument count 78 to 93 and the unresolved count
unchanged at 5, label set identical pair for pair, all three checks green.

Decision: `approved`.
