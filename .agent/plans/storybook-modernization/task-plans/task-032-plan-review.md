# task-032 plan review

## Planner: Iteration 1

2026-09-15.

Wrote `task-032.md` from the census and from reading `governance/Delegation.stories.tsx`, which holds
24 of the tranche's 39 sites in seven shared helpers.

Critique of iteration 1:

- The plan counted `governance/_utils/fixtures.ts` as one call site, which is what the census reports
  and not what the work is. The export is a `select` behind a hook-shaped name and three stories reach
  their vote-option control through it, so converting it changes three stories. The same shape as the
  knob factory corrected in `task-028`, smaller.
- The plan proposed per-story args for `Delegation.stories.tsx`. Its helpers are called by nearly all
  28 stories in the panel, so per-story args means re-deriving, for each story, which helpers it
  reaches. One table on the meta gives every story every control, which widens the panel and changes
  no render. Chosen deliberately and recorded as a risk.
- The plan did not account for the two `withKnobs` decorator entries outside either root. Both have to
  go before the manifest can drop the addon, and neither belongs to a later task. Added to scope.
- Two figures in the task entry count stories where they say registrations. Recorded.

Scope guard: nothing under `storybook/stories/_support/`; no story export, `name` or panel title
changes.

Outcome: `approved`.
