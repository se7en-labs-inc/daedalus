# Task task-036: Convert storybook/main.ts to strict ESM

## Task ID and Title

- ID: `task-036`
- Title: `Convert storybook/main.ts to strict ESM`

## Why Chosen Now

`task-036.dependencies` is `[task-034]`, complete, and `task-037` depends on this and `task-035`
both. Storybook 10 requires an ESM main config, and landing it at 8.6 means the bump does not have to
carry both a version change and a module-system change in one commit.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- The main config: no ambient `require`, no `__dirname`, no `require.resolve`, an `export default`
  rather than `module.exports`, and whatever the file's own extension has to become for TypeScript to
  accept that.

## Non-Goals

- No Storybook version change. That is `task-037`.
- No change to the `webpackFinal` body beyond the two resolutions it performs: the SWC rule, its
  decorator settings and the `config.resolve` merge are carried verbatim.
- No change to `perSystem/checks.nix` or to the `storybook` and `storybook:build` script names.

## Dependencies

- `task-034`, complete. `task-035`, complete, and its resolution change is what forces the file
  extension question below.

## Research Consulted

- `.agent/plans/storybook-modernization/task-plans/task-013.md`, which found the double-webpack bug
- `.agent/plans/storybook-modernization/storybook-modernization-tasks.json`, `task-036`, `task-037`

## Docs, Workflows, and Skills Consulted

- Docs: `AGENTS.md`, `CLAUDE.md`

## Live Repo Findings Verified For Planning

Verified at `96f74379e`.

- The config opened with two `require` calls and used `require.resolve` eleven times: twice for the
  Trezor transport replacements and nine times in the `resolve.fallback` map.
- `task-036.implementationNotes` says to run the `fix-faux-esm-require` automigration against the
  file rather than hand-editing blind. **That automigration does not exist at 8.6.18.**
  `grep -rl "fix-faux-esm-require" node_modules/storybook/` returns nothing, and neither do the other
  three automigrations `task-037` names. They arrive with the 9 and 10 CLI. The note describes a tool
  that is not installed yet, so the file is hand-written here and the automigration is run against the
  result at `task-037`, which is the check the note was reaching for.
- **The double-webpack condition still holds.** Three copies are installed:
  `node_modules/webpack` at 5.106.2, and one each under `@storybook/builder-webpack5` and
  `@storybook/preset-react-webpack`. `require.resolve('webpack', { paths: [...] })` from the builder
  still lands on the nested copy, so the indirection cannot be replaced with a plain import.
- **The builder does not re-export what the config needs.** `@storybook/builder-webpack5` exports
  `WebpackDefinePlugin` and `WebpackIgnorePlugin`; the config uses `ProvidePlugin` and
  `NormalModuleReplacementPlugin`, neither of which is exported. So the resolution has to happen in
  the config.
- The local addon `require.resolve` entry the task entry mentions is already gone, removed with
  `DaedalusMenu` at `task-016`.

## Two Things The Build Taught, In Order

**Top-level `await` is not available here.** The first draft used
`await import(resolve('webpack', …))`, which is the idiomatic ESM way to load a CommonJS module by
resolved path. `yarn storybook:build` failed with
`Top-level await is currently not supported with the "cjs" output format`, from esbuild inside
`loadMainConfig`. Storybook's config loader transpiles the main config to CommonJS before running it,
so the file is ESM by syntax and CommonJS by execution. `createRequire` used synchronously has no such
problem, and webpack is CommonJS, so requiring it is the right call regardless of what is available.

Worth noting what did *not* fail: `import.meta.url` survived, because esbuild shims it when it
targets CommonJS. So the loader tolerates one half of `import.meta` and not the other, and only the
build says which.

**TypeScript will not accept `import.meta` in that file.** With `compile` run afterwards,
`storybook/main.ts:18` reported
`TS1470: The 'import.meta' meta-property is not allowed in files which will build into CommonJS
output`. That is `task-035`'s change arriving: under `module: node16` a `.ts` file in a package with
no `"type": "module"` is a CommonJS module, and `import.meta` is illegal in one.

The file is `storybook/main.mts` now. Under `node16` a `.mts` extension declares one file ESM without
making the whole directory ESM, which is what `"type": "module"` in a `storybook/package.json` would
have done: every story and `preview.tsx` would have become ESM too, and every relative import among
them would have needed a file extension for `tsc`. `main.mts` has no relative imports, so the
narrowest declaration is also the complete one.

Storybook 8.6.18 discovers `main.mts` without configuration, and nothing outside the file names it by
path: `perSystem/checks.nix` runs `yarn storybook:build`, which takes `-c storybook` and finds the
config by convention.

## Files Expected To Change

- `storybook/main.ts` → `storybook/main.mts`
- `.agent/findings/undeclared-transitive-dependencies.md`, one stale path

## Implementation Approach

1. `export default` for `module.exports`, a static import for the plugin package.
2. `createRequire(import.meta.url)` for the two things that still need CommonJS resolution: webpack
   from the builder's location, and the nine browser polyfill paths.
3. Rename to `.mts` once `compile` says why.
4. Verify the decorator settings by what the build emitted, not by reading the config back.

## Acceptance Criteria

- No `require`, `__dirname` or `require.resolve` remains in the main config.
- `yarn storybook:build` passes at 8.6.18 with the ESM config.
- `compile`, `lint`, `storybook` and `docs` pass as Nix derivations.
- The four legacy-decorator settings are intact and demonstrably in effect.
- The label set is unchanged, pair for pair.

## Verification Plan

- `grep` the config for the three forbidden constructs.
- `nix build '.#checks.x86_64-linux.{compile,lint,storybook,docs}' --no-link`. `docs` because that
  check resolves paths named in prose and a file just moved.
- Decorator emit read from `dist/storybook`: the legacy helper present, the TC39 helper absent.
- `index.json` label set diffed in both directions, and the args audit.

## Risks and Open Questions

- The config is ESM by syntax and CommonJS by execution at 8.6, which is a state that exists only
  until `task-037`. If Storybook 10 loads it as real ESM, `createRequire(import.meta.url)` is the
  construct that works in both, which is why it was chosen over anything the loader shims.

## Required Docs, Research, and Tracking Updates

- Set `task-036.status` to `completed`.

## Corrections To The Task Graph

1. `task-036.implementationNotes` says to run the `fix-faux-esm-require` automigration against the
   file. It does not exist at 8.6.18, nor do the three other automigrations `task-037` names; all four
   ship with the 9 and 10 CLI. The file is hand-written here and the automigration is run against the
   result at `task-037`.
2. `task-036`'s title, description and acceptance all name `storybook/main.ts`. The file is
   `storybook/main.mts`, because `task-035`'s resolution change makes `import.meta` illegal in a
   `.ts` file in this package.
3. `task-036.description` says `require.resolve` becomes `import.meta.resolve`. It becomes
   `createRequire(import.meta.url).resolve`. `import.meta.resolve` would be a second top-level
   construct the 8.6 loader does not support, and the resolution needs a `paths` option that
   `import.meta.resolve` has no equivalent for.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-036-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-036-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

`storybook/main.mts` is ESM: a static import for the plugin package, `export default` for the config,
and one `createRequire(import.meta.url)` supplying the webpack resolution and the nine polyfill paths.
No `require`, `__dirname` or `require.resolve` remains.

The double-webpack indirection is intact and its comment records that three copies are still
installed, so the next reader does not take it for superstition.

The four legacy-decorator settings are intact, and in effect rather than merely present: the built
preview carries the legacy decorate helper in 65 bundles and the TC39 decorator helper in none.

The `config.resolve` spread merge is intact.

`compile`, `lint`, `storybook` and `docs` pass as Nix derivations. The label set is unchanged at 258
stories across 49 panels, identical pair for pair, and the args audit is at zero.

## Final Outcome

Complete.

## Self-Review

The decorator settings are the thing this task could most easily have broken while looking correct,
and reading them back out of the config would have proved only that the text survived the edit. The
emitted helper is the evidence: `legacyDecorator` and TC39 produce different helper names, so one
`grep` over the built preview distinguishes them. That check is worth keeping for `task-037`, which
touches the same rule.

Two failures in sequence taught the same thing from opposite directions. The build rejected top-level
`await` while shimming `import.meta.url`; the type checker rejected `import.meta` outright. The file
is ESM to one and CommonJS to the other, and neither tool's opinion could be inferred from the
other's. Running only the build would have shipped a file `tsc` rejects; running only `tsc` would have
shipped a file the loader cannot execute.

## Later Annotation: Reverted At task-037

Added at the version bump. The task is not reopened; this records what happened to its change.

`task-037` landed Storybook **9.1.20**, which loads a CommonJS main config with an ambient `require`
without complaint, verified by building. Its `fix-faux-esm-require` automigration reports nothing
applicable, which is the tool agreeing.

The ESM rewrite is therefore not needed, and the `.mts` rename that carried it cannot survive anyway.
That rename only means anything under `node16` resolution, which `task-035`'s annotation explains is
itself reverted: with classic resolution TypeScript does not treat `.mts` as ESM, and `import.meta`
fails with `TS1470` rather than being accepted. Splitting the settings was tried,
`module: node16` with `moduleResolution: node`, and produces the same `TS1470`.

So the file is `storybook/main.ts` again, in its original CommonJS form, with one change kept: the
addons array is reduced to `['@storybook/addon-links']`, because controls and actions are part of core
from 9 onwards.

Two measurements from this task are worth keeping and are not version-specific. Storybook's config
loader transpiles the main config to CommonJS with esbuild, which shims `import.meta.url` and rejects
top-level `await`, so the file is ESM to the type checker and CommonJS to the loader and neither
tool's opinion can be inferred from the other's. And the decorator settings are verified from the
emitted helper in `dist/storybook` rather than by reading the config back: the legacy helper appears
in 66 bundles and the TC39 helper in none, which is the check that distinguishes a setting being
present from a setting being in effect.
