# task-051 implementation review

## Implementation: Iteration 1

2026-09-15.

Wrote the three fixture modules, filled the two remaining store shapes, added the dialog helper, and
gave the provider a real `Wallet`.

Outcome: five Nix checks green, label set unchanged, the 74 existing screen stories passing.

## Review: Iteration 1

Summary: correct, and the existing stories passing is the assertion that matters most.

Substituting a domain instance for a literal at `stores.wallets.active` reaches every screen story in
the corpus, including the twenty-nine that have nothing to do with wallets. None moved. That is what
says the change was additive rather than a swap of one shape for a different one.

The getter assertions are pointed at the right thing. A literal carrying the same observables passes
every field-level check and fails all ten of these, which is exactly the failure that was in the
harness until this task.

The determinism assertions are cheap and worth keeping. They fail the moment someone reaches for the
faker-based generators out of habit, which is a likely thing to happen in the tranche that follows.

Decision: `approved`.
