# task-060 plan review

## Planner: Iteration 1

2026-09-16.

Wrote `task-060.md` after reading both documents in full against the repository.

Critique of iteration 1:

- The plan corrected the two documents in place: change 6.4 to 9.1.20, delete the knobs table, replace
  the `storiesOf` examples. That leaves two documents with the same overlapping shape and neither
  covering screen stories, the harness, or what the checks prove.
- The plan kept both documents listing commands and layout. Split by reader instead: conventions in
  the skill, symptoms and causes in the workflow, one cross-reference each way.
- The plan wrote "there is no automated render check". Half wrong now: the screen stories have one and
  the component stories do not, and a reader who knows only that something is missing cannot tell
  which half they are in.
- The plan cited the task numbers for the `useArgs` rule. A reader of a skill file cannot resolve
  those, and the rule stands without them.

Scope guard: no changes to `source/` or the story corpus.

Outcome: `approved`.
