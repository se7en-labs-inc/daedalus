# Task task-034: Remove addon-knobs and storybook-state from the manifest

## Task ID and Title

- ID: `task-034`
- Title: `Remove addon-knobs and storybook-state from the manifest`

## Why Chosen Now

`task-065` took the knob count to zero, so the package is unreferenced. It is the last task in phase
4, and removing it is what unblocks the version bump, because neither package loads at Storybook 9 or
above.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- `@storybook/addon-knobs` out of `package.json`, out of `storybook/main.ts`'s addons array, and out
  of `yarn.lock`.
- The phase 4 closing notes.

## Non-Goals

- No story change. If a story needed one, the phase is not finished and this task is premature.
- No change to `.agent/workflows/storybook.md` or `.agent/skills/storybook-creation/SKILL.md`, which
  still teach knobs. `task-060` owns both.
- `@storybook/addon-controls` stays. `task-037` drops it at the bump.

## Dependencies

- `task-033`, `task-064`, `task-065`, all complete.

## Research Consulted

- `.agent/plans/storybook-modernization/task-plans/task-063.md`, which removed
  `@dump247/storybook-state` in phase 2
- `.agent/plans/storybook-modernization/task-plans/task-064.md`, the manifest gate
- `.agent/plans/storybook-modernization/storybook-modernization-tasks.json`, `task-034`, `task-037`

## Docs, Workflows, and Skills Consulted

- Docs: `AGENTS.md`, `CLAUDE.md`

## Live Repo Findings Verified For Planning

Verified at `d51e1f3db`.

- The census reports zero knob call sites across `storybook/` and `source/`.
- `grep` for `addon-knobs` over `.ts`, `.tsx`, `.json` and `.md` outside `node_modules` and `.agent/`
  returns one hit: `package.json:86`.
- `@dump247/storybook-state` appears in neither `package.json` nor `yarn.lock` nor any import.
  `task-063` removed it in phase 2, which is what this task's own description says.
- The remaining `addon-knobs` references are all in `.agent/` prose: `workflows/storybook.md:79` and
  `:168`, and four places in `skills/storybook-creation/SKILL.md`. `task-060` owns both files and
  `task-026`'s entry already recorded that it does.
- `nix/internal/common.nix:316` writes `"--frozen-lockfile" true` into the builder's `.yarnrc`, so the
  `node_modules` derivation is the gate for a manifest and lockfile pair.

## Files Expected To Change

- `package.json`
- `yarn.lock`
- `storybook/main.ts`
- `.agent/plans/storybook-modernization/task-plans/phase-4-closing-notes.md`, new
- `.agent/plans/storybook-modernization/task-plans/knob-conversion-patterns.md`, the surface count

## Implementation Approach

1. Confirm the census is at zero and that the only live reference is the manifest line.
2. Remove the declaration and the addons entry, and regenerate the lockfile.
3. Gate the pair through `nix build '.#internal.x86_64-linux.node_modules' --no-link`.
4. Run `compile`, `lint`, `storybook`, and also `jest` and `docs`: `jest` because a package leaving
   `node_modules` changes what resolves, and `docs` because that check compares versions restated in
   prose against `package.json` and the prose still names this package.
5. Confirm from the built output that the manager no longer carries a knobs bundle.
6. Write the phase 4 closing notes.

## Acceptance Criteria

- Neither package appears in `package.json`, `yarn.lock` or any import.
- The built manager carries no knobs addon bundle.
- `compile`, `lint`, `storybook`, `jest` and `docs` pass as Nix derivations.
- The label set is unchanged, pair for pair.

## Verification Plan

- `grep` for both package names across the tree.
- `nix build '.#internal.x86_64-linux.node_modules' --no-link`.
- `ls dist/storybook/sb-addons/` after a build, which reads what the manager loaded.
- `nix build '.#checks.x86_64-linux.{compile,lint,storybook,jest,docs}' --no-link`.
- `index.json` label set diffed in both directions.

## Risks and Open Questions

- The `docs` check reads prose against the manifest, and two `.agent/` documents still teach this
  package. If it fails, the failure is real and the fix is `task-060`'s, not a reason to keep the
  dependency. It passed.

## Required Docs, Research, and Tracking Updates

- Set `task-034.status` to `completed`.
- Phase 4 closing notes written.
- `knob-conversion-patterns.md`'s surface figure corrected to the phase's real starting count and
  closed at zero.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-034-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-034-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

`@storybook/addon-knobs` is out of `package.json`, out of `storybook/main.ts` and out of `yarn.lock`,
which shed 231 lines of resolutions with it. It is off disk: `node_modules/@storybook/addon-knobs`
does not exist. `@dump247/storybook-state` was already absent.

`dist/storybook/sb-addons/` now lists `actions-2`, `controls-1`, `links-3` and the core presets. The
`knobs-2` bundle it carried before this commit is gone, which is the check that reads what the manager
loaded rather than what the config asked for.

`nix build '.#internal.x86_64-linux.node_modules'` passes, so the manifest and the lockfile agree
under `--frozen-lockfile`.

`compile`, `lint`, `storybook`, `jest` and `docs` pass as Nix derivations. The label set is unchanged
at 258 stories across 49 panels, identical pair for pair.

## Final Outcome

Complete. Phase 4 is closed.

## Self-Review

The only judgement in this task was which checks to run. Three would have been the habit; `jest`
because a package leaving `node_modules` changes what resolves, and `docs` because that check reads
versions restated in prose against the manifest and two `.agent/` documents still name this package.
Both passed, and running them is what makes the green meaningful rather than assumed: the phase has
already been caught once by a check nobody was running.

The prose that still teaches knobs is left alone deliberately. It is wrong now, `task-060` owns it,
and rewriting it here would put the same rule in two places, which is the failure `task-026` set out
to avoid.
