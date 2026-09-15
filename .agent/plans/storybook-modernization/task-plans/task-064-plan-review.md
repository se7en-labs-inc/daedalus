# task-064 plan review

## Planner: Iteration 1

2026-09-15.

Wrote `task-064.md` for a task that did not exist in the graph. The gap it closes was found while
planning `task-027` and recorded there as correction 5; the owner directed that it become its own task
ahead of `task-034` rather than being folded into it, so that task's diff stays a removal and its
message stays true.

Critique of iteration 1:

- The plan claimed the task makes phase 4's workbench criterion met. It does not. It makes it
  meetable. Rewritten with an explicit split between what can be measured here and what stays behind
  the browser wall locked decision 7 named, because a criterion quietly upgraded from unverifiable to
  asserted is worse than one openly waived.
- The plan verified the addon's absence from `package.json` only. Extended to the lockfile, to
  `node_modules`, and to `@storybook/core`'s manager bundle, since "not declared" and "not available"
  are different claims and the second is the one that matters.
- The plan had no gate for the manifest edit. Added `nix build .#internal.x86_64-linux.node_modules`,
  which installs under `--frozen-lockfile` per `nix/internal/common.nix:316` and so refuses a manifest
  and lockfile that disagree.

Scope guard: two declarations and a lockfile. No removal, no story change, no argType change.

Outcome: `approved`.
