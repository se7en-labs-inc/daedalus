# task-028 plan review

## Planner: Iteration 1

2026-09-15.

Wrote `task-028.md` from the census reading for both roots, which reported 36 call sites across five
files and eleven more files importing only `withKnobs`.

Critique of iteration 1:

- The reading was wrong and the plan was built on it. `loading/_support/loadingKnobs.ts` wraps five
  addon-knobs functions to attach a group id, and the census matched only the addon's own export
  names and skipped any file whose text did not contain `@storybook/addon-knobs`. Seven story files
  reach their controls through those wrappers, 44 times between them, and the census saw five.
- Fixing the instrument before planning the work, rather than after, because every number in the plan
  and in the phase 4 headline depends on it. The corpus was reported at 337 when `task-027` opened
  and was really 381.
- With the instrument corrected, the tranche is 80 call sites across sixteen files rather than 36
  across five, and the plan says so.

Scope guard: no story export, `name` or panel title changes; no manifest change; the fixture modules
the phase 6 container stories are named as reusing stay exported.

Outcome: `approved`.
