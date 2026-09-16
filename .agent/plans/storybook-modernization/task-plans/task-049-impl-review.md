# task-049 implementation review

## Implementation: Iteration 1

2026-09-15.

Measured the corpus, added `harness.spec.ts`, and completed the phase 6 closing notes.

Outcome: five Nix checks green, label set unchanged, two structural properties now asserted per file.

## Review: Iteration 1

Summary: correct, and the negative result is the useful one.

Sixty-five distinct names appear inside a `screenDecorator` call across 29 files, and not one field is
set the same way in three of them. The override surface is doing what it was designed to do: a story
names what its screen depends on and nothing else, and the defaults are carrying the rest without
anyone having to repeat themselves.

The import assertion is narrow and durable. It does not check that no reaction is running, which is
the property that actually matters; it checks that no story can reach the code that would start one.
That is a weaker claim and a far more stable one, and it fails on the import rather than on a timer
nobody notices.

The refused measurement is the right refusal. An hours figure derived from this record would have been
the plan's own estimate returned as evidence, which is the first of the four catching questions this
epic keeps writing down.

Decision: `approved`.
