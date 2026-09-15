# Task task-037: Bump the manifest to 10.6.x and run the automigrations individually

## Task ID and Title

- ID: `task-037`
- Title: `Bump the manifest to 10.6.x and run the automigrations individually`

## Interaction Mode

- Mode: `agent_execution`, suspended. **This task is blocked on a decision that belongs to the project
  owner:** whether to take the documented 9.1.x fallback.

## Build Status

`blocked`

## Summary

The 10.6.0 bump was carried out in full and then reverted. It does not work on this repository, for
two reasons that are independent of each other and of anything this epic has done. Both are measured
below. The branch is back at `dd5603c42`, which is green.

The 9.1.x fallback clears both. Taking it is not this task's call.

## What Was Done Before It Was Reverted

Everything the task entry asks for, in the order it asks for it.

1. `package.json` hand-edited, not `storybook upgrade`, per locked decision 12. `storybook`,
   `@storybook/react`, `@storybook/react-webpack5` and `@storybook/addon-links` to `10.6.0`.
   `@storybook/addon-actions`, `@storybook/addon-controls`, `@storybook/components`,
   `@storybook/core-events`, `@storybook/manager-api`, `@storybook/preview-api` and
   `@storybook/theming` removed: none of the seven publishes a 10.6.x, and only `addon-links` of the
   originals survives as a separate package.
2. `storybook/main.mts`'s addons array reduced to `['@storybook/addon-links']`.
3. The four automigrations run individually. See below; the results are not what the entry expects.
4. Imports rewritten: 9 to `storybook/preview-api` by the codemod, 63 to `storybook/actions` by hand
   using the codemod's own mapping table.
5. `nix build '.#internal.x86_64-linux.node_modules'` passed, so the manifest and lockfile agreed
   under `--frozen-lockfile`.
6. `yarn storybook:build` passed locally at 10.6.0.

**The corpus itself is fine at 10.6.0.** `index.json` from the 10.6.0 build is **258 stories across 49
panels, identical pair for pair** to the 8.6.18 baseline, with the index format moving from `v4` to
`v5` underneath. The legacy decorator helper appears in 66 built bundles and the TC39 helper in none,
so the SWC settings survive. `perSystem/checks.nix` needed no edit. `lint` passed.

So the conversion work of phases 3, 4 and 5 is compatible with 10.6.0. What is not compatible is this
repository's TypeScript and this repository's Nix build.

## Blocker 1: TypeScript 4.9.5 cannot parse Storybook 10.6's declarations

`nix build '.#checks.x86_64-linux.compile'` fails:

```
node_modules/storybook/dist/chunk-zQu03vfn.d.ts:6599:217 - error TS1434: Unexpected keyword or identifier.
node_modules/storybook/dist/chunk-zQu03vfn.d.ts:6599:225 - error TS1128: Declaration or statement expected.
node_modules/storybook/dist/chunk-zQu03vfn.d.ts:6599:226 - error TS1128: Declaration or statement expected.
```

The cause is `const` type parameters, `<const T>`, which are TypeScript 5.0 syntax.
`grep -c "<const " node_modules/storybook/dist/chunk-zQu03vfn.d.ts` is **49**.

`skipLibCheck: true` does not help and cannot: it skips type *checking* of declaration files, not
*parsing* of them. A syntax error in a `.d.ts` is reported either way.

`@storybook/react@10.6.0` declares `peerDependencies.typescript` as `">= 4.9.x"`. That range is wrong
for its own shipped declarations. This repository is on `typescript@4.9.5`, which satisfies the
declared range and cannot read the files.

The fix would be a TypeScript 5 upgrade. That is a separate project: `strict` is off, `noImplicitAny`
is off, and there are roughly 1,131 `@ts-ignore` directives in `source/` whose behaviour under a new
compiler is unknown. It is not in this epic's scope and should not be smuggled into it.

## Blocker 2: Storybook 10 needs a native module the Nix build does not deliver

`nix build '.#checks.x86_64-linux.storybook'` fails:

```
Cannot find module './resolver.linux-x64-gnu.node'
Require stack: /build/source/node_modules/oxc-resolver/index.js
requestPath: '@oxc-resolver/binding-linux-x64-gnu'
```

`storybook@10.6.0` depends on `oxc-resolver@11.21.2`, a Rust resolver distributed as a napi native
addon with one optional package per platform. `storybook@9.1.20` has no such dependency.

This is not a lockfile gap. All nineteen platform bindings are in `yarn.lock`, and the
`node_modules` derivation installs `@oxc-resolver/binding-linux-x64-gnu`. What it does not install is
the binary inside it. In the Nix store the package directory holds `README.md` and `package.json` and
nothing else; the same directory in a local `yarn install` holds a 2,366,672-byte
`resolver.linux-x64-gnu.node`.

So the failure is in how this repository's Nix pipeline handles prebuilt native artifacts, not in the
lockfile and not in Storybook. `nix build '.#internal.x86_64-linux.node_modules'` passes, which is
what makes this worth stating carefully: the gate for a manifest change is green and the artifact it
produces is missing a file.

Investigating that is a Nix packaging task with an uncertain size, and it stands between this epic
and a working 10.6 whatever is done about blocker 1.

## What The Automigrations Actually Did

The entry says to run `renderer-to-framework`, `consolidated-imports`, `wrap-getAbsolutePath` and
`fix-faux-esm-require` individually. All four were run. Three findings worth carrying.

**The CLI that runs them is not installed, and the dispatcher fetches it.** At 10, `storybook`'s
dispatcher runs only `dev`, `build`, `index`, `ai`, `tools` and `skills` locally; everything else is
delegated to `@storybook/cli`, and when that package is absent the dispatcher calls
`packageManager.runPackageCommand(..., { useRemotePkg: true })`, which downloads and executes it. The
first attempt exited 0 with no output at all, which is the failure mode to watch for: it looked like
a clean no-op. `@storybook/cli@10.6.0` was installed as a temporary devDependency so the
automigrations ran from disk, and removed afterwards. Running them without doing that is a remote
package execution, which is a larger step than locked decision 12 was trying to avoid.

**The CLI cannot find `main.mts`.** `storybook automigrate` reports
`Error: Could not determine main config path` against `storybook/main.mts` and works against
`storybook/main.ts`. The build finds either. So the config discovery in the CLI and the config
discovery in the builder do not accept the same extensions, and `task-036`'s rename, which `task-035`
forces, puts the config outside what the migration tooling can see. The automigrations were run with
the file temporarily renamed.

**`consolidated-imports` reports "No migrations were applicable to your project" when it cannot see
the problem.** Run after the old packages were removed from `package.json`, it reported exactly that,
while 72 imports still pointed at packages that no longer existed. Run with
`@storybook/addon-actions` and `@storybook/preview-api` restored to the manifest, it found the
migration and rewrote the 9 `@storybook/preview-api` imports. It never rewrote the 63
`@storybook/addon-actions` imports in any configuration tried, with the addon in the addons array or
removed from it, although its own mapping table contains `"addon-actions": "storybook/actions"`. Those
63 were done by hand against that table.

The order the entry implies, manifest first and automigrations after, is the order that makes the
codemod blind.

`renderer-to-framework` found a migration and skipped it under `--dry-run`; the framework field is
already `@storybook/react-webpack5`, so there was nothing for it to do. `wrap-getAbsolutePath` and
`fix-faux-esm-require` both reported nothing applicable, the second of which confirms `task-036`'s
hand-written config is what that automigration would have produced.

## What 9.1.20 Looks Like Against The Same Two Blockers

Measured from the published tarballs rather than from the peer ranges, since 10.6's peer range is
what got this wrong.

| | 10.6.0 | 9.1.20 |
|---|---|---|
| `<const ` in shipped `.d.ts` | 49 in one chunk | **0** |
| `oxc-resolver` dependency | `11.21.2` | **absent** |
| `main` / `types` fields | neither | both |
| peer `react` | `^16.8.0 \|\| ^17 \|\| ^18 \|\| ^19` | `^16.8.0 \|\| ^17 \|\| ^18 \|\| ^19.0.0-beta` |
| peer `typescript` | `>= 4.9.x` | `>= 4.9.x` |

9.1.20 clears both blockers. React 16.14.0 remains in range.

Note that 9.1.20 ships `main` and `types`, so `task-035`'s move to `node16` is not strictly required
by it. That move should be kept regardless: it is correct, it is already landed and green, and it
found and fixed a real silent gap in faker's type resolution on the way.

## The Decision

Three options, and none of them is this task's to take.

1. **Take 9.1.x.** Clears both blockers, keeps TypeScript 4.9.5, keeps the Nix pipeline as it is. The
   rest of the phase changes only in which version number it writes, as `task-035`'s note says.
   `task-037.acceptance` and `task-038.acceptance` both already admit this outcome.
2. **Stay on 10.6 and upgrade TypeScript to 5.x first, then solve the native module in Nix.** Two
   projects of unknown size, one of which touches every file in `source/`.
3. **Stay on 8.6.18 and stop the phase here.** The corpus is converted, the workbench works, and
   phases 6 to 8 do not depend on the version.

What this task can report is that option 1 is the only one that reaches a working 10.x-line Storybook
without work outside this epic's scope.

## Files Changed By This Task

None. The 10.6.0 bump was reverted in full and the tree is at `dd5603c42` with `compile`, `lint` and
`storybook` green.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-037-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-037-impl-review.md`

## Planning Status

`approved`

## Current Outcome

Blocked, pending the owner's decision on the 9.1.x fallback.
