# task-036 plan review

## Planner: Iteration 1

2026-09-15.

Wrote `task-036.md` from the task entry, whose implementation notes direct the work to the
`fix-faux-esm-require` automigration rather than a hand edit.

Critique of iteration 1:

- The plan opened by running that automigration. It does not exist at 8.6.18, and neither do the
  other three `task-037` names: all four ship with the 9 and 10 CLI. The plan cannot follow the note
  in this order, so the file is hand-written here and the automigration runs against the result at
  `task-037`, which is the confirmation the note was after. Recorded as a correction.
- The plan assumed the double-webpack indirection could go, on the grounds that the addon list has
  changed twice since it was written. Measured: three webpack copies are installed and the builder
  still resolves its own. The indirection stays, and its comment now records the measurement so the
  next reader does not have to repeat it.
- The plan proposed taking the two plugins from the builder's exports to avoid resolving webpack at
  all. `@storybook/builder-webpack5` exports `WebpackDefinePlugin` and `WebpackIgnorePlugin`; the
  config needs `ProvidePlugin` and `NormalModuleReplacementPlugin`. Not available.
- The plan followed the entry in writing `import.meta.resolve`. It has no `paths` option, which the
  webpack resolution needs, and it is a second top-level construct the 8.6 loader does not support.
  `createRequire(import.meta.url)` covers both uses and works under either loader.
- The plan verified the decorator settings by reading them back out of the config. That proves the
  text survived an edit and nothing else. Replaced with a read of the emitted helper in
  `dist/storybook`, which distinguishes legacy from TC39 by name.
- Added `docs` to the checks, since a file moves in this task and that check resolves paths named in
  prose.

Scope guard: the main config and one stale path in a finding. No version change, no `checks.nix`
change, no script rename, and the `webpackFinal` body carried verbatim.

Outcome: `approved`.
