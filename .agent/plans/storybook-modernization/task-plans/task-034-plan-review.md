# task-034 plan review

## Planner: Iteration 1

2026-09-15.

Wrote `task-034.md` after confirming the census is at zero, which is the precondition the whole task
rests on.

Critique of iteration 1:

- The plan listed `@dump247/storybook-state` as something to remove, following the task title. It was
  removed in phase 2 by `task-063` and the task's own description says so. Verified absent rather than
  re-removed.
- The plan ran the usual three checks. Added `jest`, because a package leaving `node_modules` changes
  what resolves, and `docs`, because that check compares versions restated in prose against
  `package.json` and two `.agent/` documents still teach this package by name. If `docs` had failed it
  would have been a real failure with a fix belonging to `task-060`.
- The plan did not say how the removal would be confirmed beyond the manifest. Added
  `ls dist/storybook/sb-addons/`, which reads what the manager loaded; `task-064` established that as
  the measurement that distinguishes a configured addon from a present one.
- Added the phase 4 closing notes to scope. Phase 3's were written with its last task and the
  precedent is worth keeping.

Scope guard: one declaration, one addons entry, the lockfile, and the notes. No story change, and no
edit to the two documents `task-060` owns.

Outcome: `approved`.
