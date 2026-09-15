# task-037 plan review

## Planner: Iteration 1

2026-09-15.

Wrote `task-037.md` against the registry rather than against the entry's assumptions, since the entry
was written before 10.6.0 existed.

Critique of iteration 1:

- The plan assumed React 16.14.0 might be the blocker, which is the obvious risk at a two-major bump.
  It is not: `@storybook/react@10.6.0` still peers `^16.8.0`. Checked before anything was edited,
  because if it had failed the whole task would have been a different shape.
- The plan listed seven packages to bump. Six of the seven publish no 10.6.x at all; only
  `@storybook/addon-links` survives as a separate package. Checked each against the registry rather
  than assuming the version line moves together.
- The plan ran the automigrations from `node_modules/.bin/storybook`. At 10 that dispatcher delegates
  everything except `dev` and `build` to `@storybook/cli` and fetches it remotely when absent. The
  first run exited 0 with no output, which reads as success. Installed the CLI locally instead, so the
  automigrations ran from disk and locked decision 12's intent was preserved rather than inverted.
- The plan did not anticipate that the CLI cannot find `main.mts`. It reports
  `Could not determine main config path`, while the builder finds the same file. Worked around by
  renaming for the duration.

Scope guard: no `perSystem/checks.nix` edit, no script rename, no TypeScript upgrade.

Outcome: `approved`.
