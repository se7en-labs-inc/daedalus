# Task task-035: Move tsconfig moduleResolution off node

## Task ID and Title

- ID: `task-035`
- Title: `Move tsconfig moduleResolution off node`

## Why Chosen Now

`task-035.dependencies` is `[task-034]`, complete. It lands in its own commit ahead of the bump so
that a resolution failure after the bump is attributable to the bump rather than to this.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- `tsconfig.json`'s `moduleResolution`, the `module` setting it constrains, and whatever import
  specifiers or type paths the change mechanically requires.

## Non-Goals

- No Storybook change. The version stays at 8.6.18 through this task.
- No TypeScript upgrade. `bundler` would need 5.0 and the repository is on 4.9.5.

## Dependencies

- `task-034`, complete.

## Research Consulted

- `.agent/plans/storybook-modernization/research/02-storybook-upgrade-path.md`
- `.agent/plans/storybook-modernization/storybook-modernization-tasks.json`, `task-035`, `task-037`

## Docs, Workflows, and Skills Consulted

- Docs: `AGENTS.md`, `CLAUDE.md`, whose trust map is corrected below

## Live Repo Findings Verified For Planning

Verified at `b75c4ed3c`.

- `tsconfig.json` has `"module": "commonjs"` and `"moduleResolution": "node"`, no `include`, and
  `"exclude": ["node_modules"]`, so it governs `source/`, `storybook/`, `tests/` and `utils/`.
- `typescript` is `4.9.5`, so `bundler` is unavailable and the choice is `node16` or `nodenext`.
- `package.json` declares no `"type"` field. Every `.ts` file in the repository is therefore a
  CommonJS module under `node16`, which is what keeps the change small: the extension requirements
  and the import-assertion rules that make `node16` painful apply to ESM files, and there are none.
- `nix build '.#checks.x86_64-linux.compile'` is green at this commit, and so is host `tsc`:
  **0 errors from both.** `CLAUDE.md`'s trust map says host `tsc` reports four errors in
  `source/renderer/app/utils/crypto.ts` and `utils/dataSerialization.ts` that the Nix check does not.
  Those four are gone, so host and Nix now agree and host `tsc` is usable for iteration in this task.
  Recorded as a correction below.

## What The Error Count Did Not Say

Setting `module` and `moduleResolution` to `node16`, and separately to `nodenext`, produced **zero
errors** under both. The task entry budgets ten hours and calls itself a kill criterion, so zero was
surprising enough to ask what the probe had measured.

`tsc --noEmit --listFiles | wc -l` answered it. The baseline program is 3170 files and the `node16`
program is 3120. Fifty-one files left the program and one joined it, with no error reported.

The reason is `skipLibCheck: true` together with `noImplicitAny: false`. A module that cannot be
resolved at all still reports TS2307, but a module that resolves to JavaScript with no types becomes
`any` in silence. So the error count cannot distinguish "resolution still works" from "resolution
stopped working and nothing was allowed to say so".

The fifty-one, diffed by package:

- **`@faker-js/faker`, 50 files.** Its `exports` map declares `node`, `es2015` and `default`
  conditions and **no `types` condition**. Under classic node resolution TypeScript falls back to its
  `typesVersions` field, `{">=4.0": {"*": ["dist/types/*"]}}`, and resolves the full type tree. Under
  `node16` the `exports` map is consulted first, matches, and yields a JavaScript file with no
  adjacent declaration, so the package became untyped.
- **`axios`, 1 file.** `index.d.ts` out, `index.d.cts` in. That is `node16` selecting the CommonJS
  types entry for a CommonJS consumer, which is the correct one and was not being used before.

Confirmed by behaviour rather than by inference. A probe importing `faker` and calling a member that
does not exist reports `TS2339: Property 'thisMemberDoesNotExist' does not exist on type 'Faker'`
under `moduleResolution: node`, and reports nothing at all under `node16`.

Five files import `@faker-js/faker`: `storybook/stories/_support/utils.ts`,
`storybook/stories/_support/StoryProvider.tsx`, `storybook/stories/governance/_utils/drepPopulation.ts`,
`source/renderer/app/components/wallet/WalletSendForm.spec.tsx` and
`source/renderer/app/config/generateStakePoolFakeData.ts`. The first two are the fixture generators
most of the corpus is built on, and the last is shipped source.

## Files Expected To Change

- `tsconfig.json`

## Implementation Approach

1. Set `module` and `moduleResolution` to `node16`, not `nodenext`: `node16` is pinned where
   `nodenext` tracks whatever the installed TypeScript considers current, and a resolution mode that
   moves under a dependency bump is the wrong thing to depend on here.
2. Restore faker's types through a `paths` entry pointing at the declaration its `typesVersions`
   field was supplying, which is the task entry's own definition of a mechanical fix: a package's
   types resolving through a different entry point.
3. Verify by file set, not by error count.

## Acceptance Criteria

- `compile` passes as a Nix derivation.
- The type-checked file set is equivalent to the baseline, with every difference named.
- The faker misuse probe errors again.
- The commit touches `tsconfig.json` and nothing else.

## Verification Plan

- `tsc --noEmit --listFiles`, sorted and diffed against the baseline in both directions.
- The faker misuse probe under the committed config.
- `nix build '.#checks.x86_64-linux.{compile,lint,storybook,jest,cucumber-unit}' --no-link`. The last
  two because this setting governs the whole program, not the Storybook subtree.
- `index.json` label set diffed in both directions.

## Risks and Open Questions

- The `paths` entry names a path inside `node_modules`, which couples the config to faker's internal
  layout. It is the layout faker's own `typesVersions` field already points at, so the coupling
  existed already and was simply being expressed by the package rather than by the consumer. A faker
  upgrade that moves `dist/types` breaks the entry loudly, with TS2307, rather than silently.
- The kill criterion was not reached and the 9.1.x fallback is not needed for this task's reasons.

## Required Docs, Research, and Tracking Updates

- Set `task-035.status` to `completed`.

## Corrections To The Task Graph And The Trust Map

1. `CLAUDE.md`'s documentation trust map states that host `tsc` reports four errors in
   `source/renderer/app/utils/crypto.ts` and `utils/dataSerialization.ts` which do not exist in the
   Nix check, caused by `import { Buffer } from 'safe-buffer'` shadowing Node's `Buffer`. Measured at
   `b75c4ed3c`, host `tsc` reports zero errors and the Nix check reports zero errors. The divergence
   is closed. This is a note for whoever maintains that file; nothing in this epic depended on it.
2. `task-035.description` says `tsconfig.json:29` must move. The line is 29 for `moduleResolution`,
   which is right, and the description does not mention that `module` has to move with it: TypeScript
   rejects `moduleResolution: node16` unless `module` is `node16` or `nodenext`.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-035-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-035-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

`tsconfig.json` is on `module: node16` and `moduleResolution: node16`, with a `paths` entry restoring
`@faker-js/faker`'s declarations.

The type-checked file set is 3170 files, the same count as the baseline, and the only difference in
either direction is `axios/index.d.ts` out and `axios/index.d.cts` in.

The faker misuse probe errors again under the committed config.

`compile`, `lint`, `storybook`, `jest` and `cucumber-unit` pass as Nix derivations. The label set is
unchanged at 258 stories across 49 panels, identical pair for pair, and the args audit is at zero.

The kill criterion was not reached. The 9.1.x fallback is not needed on this task's account.

## Final Outcome

Complete.

## Self-Review

This task would have passed with a silent regression if it had been verified the way its own
acceptance criterion is written. `yarn compile` was green before the change and green after it, with
fifty type declaration files quietly gone and a package the story fixtures are built on reduced to
`any`. The criterion says "yarn compile passes", and it did.

What caught it was asking what a zero meant against a ten-hour estimate, and then counting the
program rather than the errors. **A type checker configured with `skipLibCheck` and without
`noImplicitAny` cannot report a lost type entry.** For any future change to module resolution in this
repository, `--listFiles` diffed against the baseline is the measurement and the error count is not.

That is the tenth instance of the shape the closing notes track, and it fails all three catching
questions in a new way: the instrument was the right instrument, run on the right thing, reporting
truthfully. It simply had nothing to say about the thing that changed. A fourth question earns its
place: **what would this instrument report if the thing I am changing had broken?** For an error
count over a permissive checker, the answer is zero.

## Later Annotation: Reverted At task-037

Added at the version bump. The task is not reopened; this records what happened to its change.

`task-037` landed Storybook **9.1.20**, not 10.x. The whole 10 line is unreachable on TypeScript
4.9.5, for reasons recorded in that entry.

This task's premise was correct for the version it was written against: Storybook 10 removed the
`typesVersions` fields that classic node resolution depends on, so `node16` was required to read its
`exports` map. 9.1.20 still ships `typesVersions`, with explicit entries for `actions`, `preview-api`
and forty more, so classic resolution finds it.

Worse than redundant, `node16` is incompatible with it. `storybook@9.1.20` declares
`"type": "module"`, so its declaration files are ESM declarations, and under `node16` a CommonJS
source file importing them is an error: **102 × `TS1479`**. The `require` condition its `exports` map
publishes does not help, because both conditions share one `types` entry and TypeScript takes its
verdict from that.

So `module` and `moduleResolution` are both back to `commonjs` and `node`, and the `@faker-js/faker`
`paths` entry goes with them: under classic resolution faker's own `typesVersions` supplies its
declarations, verified by removing the entry and re-running the misuse probe, which still errors.

**The finding this task produced is preserved** at
`.agent/findings/07-a-lost-type-entry-is-silent.md`. That was always the valuable part. The setting
was correct for a version this repository cannot take; the discovery that `skipLibCheck` plus
`noImplicitAny: false` makes a lost type entry unreportable is true regardless of version, and it is
waiting for whoever takes the TypeScript 5 upgrade, where `moduleResolution: "bundler"` is the
setting that actually fits a webpack-bundled tree.
