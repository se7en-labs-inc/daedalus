# task-051 plan review

## Planner: Iteration 1

2026-09-15.

Wrote `task-051.md` after reading the `Wallet` domain in full rather than after reading the entry's
description of it.

Critique of iteration 1:

- The plan reused `_support/utils.ts` wholesale, as the entry instructs. Every value it produces comes
  from faker, so two runs of one screen story show different wallets, different amounts and dates that
  can land in different relative buckets. Shapes reused, randomness removed.
- The plan left `StoryProvider`'s literal wallet in place and had each wallet story name a domain
  wallet. Nine repetitions of one line, and the `task-049` duplication check would have flagged them
  correctly.
- The plan built wallet fixtures and asset fixtures independently. The screens join them by `uniqueId`
  and read a shortfall as loading in progress, so a half-supplied join shows a spinner forever rather
  than failing. Exported as paired overrides.
- The plan expressed an open dialog as `isOpen: () => true`. The settings screens mount ten dialogs
  side by side and that predicate opens all ten.

Scope guard: no story files, no changes under `source/`.

Outcome: `approved`.
