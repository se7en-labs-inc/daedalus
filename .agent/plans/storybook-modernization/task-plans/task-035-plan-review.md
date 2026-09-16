# task-035 plan review

## Planner: Iteration 1

2026-09-15.

Wrote `task-035.md` from the task entry, which frames the work as classifying whatever new compiler
errors the resolution change produces and taking the 9.1.x fallback if they are not mechanically
fixable.

Critique of iteration 1:

- The plan's verification was the entry's: run `yarn compile` before and after, classify the new
  errors. Both modes produced zero errors, and the plan was ready to record that and move on. Zero
  against a ten-hour estimate is the kind of result this epic has been caught by nine times, so the
  plan gained a second measurement before anything was concluded: the size and membership of the
  type-checked program, from `tsc --listFiles`.
- That measurement found the change the error count could not report: fifty declaration files gone
  and `@faker-js/faker` silently untyped, because `skipLibCheck` is on and `noImplicitAny` is off.
  The plan's acceptance criteria were rewritten around the file set, with the error count demoted to
  a necessary-but-insufficient check.
- The plan left the choice between `node16` and `nodenext` open, as the entry does. Settled on
  `node16` with a reason recorded in the config itself: `nodenext` tracks whatever the installed
  TypeScript considers current, and a resolution mode that can move under a dependency bump is not
  something to depend on in a file that governs the whole repository.
- The plan did not say that `module` must move with `moduleResolution`. TypeScript rejects the pair
  otherwise. Recorded as a correction, since the entry names only the one line.
- Added `jest` and `cucumber-unit` to the verification. This setting has no `include` and governs
  `source/`, `tests/` and `utils/` as much as `storybook/`, so checking only the Storybook three would
  have been checking a fraction of what changed.

Scope guard: `tsconfig.json` only. No Storybook version change, no TypeScript upgrade.

Outcome: `approved`.
