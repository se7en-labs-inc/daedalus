# task-041 implementation review

## Implementation: Iteration 1

2026-09-15.

Moved the provisional factory into `requestDefaults.ts`, recorded the measured request-to-store map,
spread it into the nine stores that own one, and filled `networkStatus`.

Outcome: 22 assertions pass, including the twelve screen renders from the first tranche. Four Nix
checks green. Label set unchanged at 270 with the component baseline intact.

## Review: Iteration 1

Summary: correct, and the useful property is what did not happen.

The first tranche's twelve renders still pass unchanged. That is the check that says the new defaults
were added rather than substituted: `networkStatus` moving from an empty object to forty-one fields
could have displaced something those screens relied on, and it did not.

The map is data rather than a hand-written list, derived by matching `<name>Request` in the containers
against its declaration in the stores. Six of the 36 names are not store fields and are excluded with
that stated, rather than being defaulted onto a store that does not declare them, which would make the
fixture disagree with the application in a way nothing would catch.

Decision: `approved`.
