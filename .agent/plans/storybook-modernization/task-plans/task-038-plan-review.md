# task-038 plan review

## Planner: Iteration 1

2026-09-15.

Wrote `task-038.md` against the version `task-037` actually landed rather than the one the entry
names.

Critique of iteration 1:

- The plan carried the entry's "walk all 15 sidebar groups". Counted from `index.json`: 14. That is
  the figure `task-023` measured in phase 3, after the phase 1 deletions emptied a group. Recorded as
  a correction rather than reported as 15.
- The plan asserted the frozen clock from the presence of `timemachine.config` in `preview.tsx`. That
  proves the call is written, not that the build carries it or that output is stable. Replaced with
  two measurements: the frozen date string in the built preview bundle, and two consecutive builds
  diffed over the full story index.
- The plan listed "every panel renders and every control works" as a criterion to satisfy. It cannot
  be satisfied here and locked decision 7 says so. Rewritten as an explicit statement of what is and
  is not verifiable, in its own section, rather than a criterion quietly marked done.

Scope guard: verification only. No source changes.

Outcome: `approved`.
