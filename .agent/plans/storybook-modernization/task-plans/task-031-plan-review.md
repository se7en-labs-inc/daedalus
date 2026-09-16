# task-031 plan review

## Planner: Iteration 1

2026-09-15.

Wrote `task-031.md` from the census per file and from reading the six `_support` modules, which is
where all but three of the tranche's call sites are.

Critique of iteration 1:

- The plan treated the four `Pools` controls as four independent conversions. Three of them are one
  control inside one file, because the knobs share a label and no group; the other three are one per
  file. The range configuration is identical in all four, so it is declared once and imported.
- The plan did not account for the `@ts-ignore` directives in `_support/RedeemItnWallets.tsx`. Each
  suppresses an overload error anchored on the property whose type does not match, and replacing the
  knob changes which property that is. Added as a risk with the rule that the suppression moves with
  the error.
- Two line counts and one path in the task entry are wrong, and one of its cautions describes a
  hazard the census does not have. Recorded rather than carried.

Scope guard: nothing under `storybook/stories/_support/`; no story export, `name` or panel title
changes.

Outcome: `approved`.
