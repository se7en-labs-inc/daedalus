# Task task-064: Add the controls addon to the manifest

## Task ID and Title

- ID: `task-064`
- Title: `Add the controls addon to the manifest`

## Why Chosen Now

`task-033` closed the conversion of every story file, and phase 4's acceptance asks that every
converted control still changes the component in the running workbench. It could not, because there is
no controls panel and there never has been. Added ahead of `task-034` on the owner's instruction, so
that task stays a removal and its message stays true.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- `@storybook/addon-controls` at `8.6.18` in `devDependencies`, with the lockfile entry.
- The addon list entry in `storybook/main.ts`.

## Non-Goals

- No removal of `@storybook/addon-knobs`. `task-034` owns that.
- No story or argType change. Nothing in the corpus is edited to suit the panel.

## Dependencies

- `task-033`, complete.

## Research Consulted

- `.agent/plans/storybook-modernization/storybook-modernization-prd.md:255`, which states that
  args-backed state surfaces in the Controls panel
- `.agent/plans/storybook-modernization/storybook-modernization-tasks.json`, `task-034`, `task-037`
- `.agent/plans/storybook-modernization/task-plans/task-027.md`, correction 5, where the gap was found

## Docs, Workflows, and Skills Consulted

- Docs: `AGENTS.md`, `CLAUDE.md`

## Live Repo Findings Verified For Planning

Verified at `68974330c`.

- Neither `@storybook/addon-controls` nor `@storybook/addon-essentials` is in `package.json`, in
  `yarn.lock`, or on disk under `node_modules/@storybook/`.
- `storybook/main.ts` lists three addons: knobs, actions and links.
- The panel is not in core at this version. `grep -c "addon-controls"` over
  `node_modules/@storybook/core/dist/manager/runtime.js` is 0, and the bundle contains no `Controls`
  panel registration and no `addon-*/panel` identifier at all.
- `task-037`'s own note says 9 and 10 fold actions, controls, toolbars and viewport into core, which
  is the same fact from the other side: at 8 they are addons.
- `nix/internal/common.nix:316` writes `"--frozen-lockfile" true` into the builder's `.yarnrc`, so the
  `node_modules` derivation refuses a manifest and lockfile that disagree. That is the gate the other
  manifest edits in this epic used.

## Files Expected To Change

- `package.json`
- `yarn.lock`
- `storybook/main.ts`

## Implementation Approach

1. Declare the addon at `8.6.18`, matching every other first-party Storybook package in the manifest.
2. Add the addon list entry, with a comment saying the entry is temporary because controls moves into
   core at 9.
3. Regenerate the lockfile.
4. Gate the pair through `nix build '.#internal.x86_64-linux.node_modules' --no-link`.
5. Confirm the built manager carries the addon, then run the three checks and the label diff.

## Acceptance Criteria

- `@storybook/addon-controls` is declared at `8.6.18` and resolved in `yarn.lock`.
- The built manager carries a controls addon bundle.
- `nix build '.#internal.x86_64-linux.node_modules'` passes.
- `compile`, `lint` and `storybook` pass as Nix derivations.
- The label set is unchanged, pair for pair.

## Verification Plan

- `nix build '.#internal.x86_64-linux.node_modules' --no-link`, which is the `--frozen-lockfile`
  check.
- `ls dist/storybook/sb-addons/` after a build, which lists what the manager actually loaded rather
  than what the config asked for.
- `nix build '.#checks.x86_64-linux.{compile,lint,storybook}' --no-link`.
- `index.json` label set diffed in both directions.

## Risks and Open Questions

- The addon renders the panel in the manager, and the manager cannot be exercised here. What this task
  can establish is that the addon resolves, that the build loads it, and that it registers a panel.
  Whether a viewer moving a control repaints the story is the same half of the loop that locked
  decision 7 put out of reach.

## Required Docs, Research, and Tracking Updates

- Set `task-064.status` to `completed`.
- `task-037` drops this dependency at the version bump; its note already describes the fold into core.

## What This Makes Verifiable, And What It Does Not

Stated plainly, because the criterion this unblocks is easy to overclaim.

Now measurable here:

- The addon resolves and installs under `--frozen-lockfile`.
- The build loads it: `dist/storybook/sb-addons/` gains a `controls-1` bundle beside `actions-3`,
  `knobs-2` and `links-4`. Before this task that directory had no controls entry.
- The addon registers a panel. `node_modules/@storybook/addon-controls/dist/manager.js:199` calls
  `addons.add(ADDON_ID, { title: …, type: types.PANEL, … })`, and `Controls` is the title in that
  bundle.
- Args reach a story's render function and a story's own args override the meta's, which `task-026`
  measured through `@storybook/react` and every tranche since has re-measured through the args audit.

Still not measurable here, and unchanged by this task:

- That the panel renders a control for a given argType.
- That moving a control repaints the story. The portable-stories harness runs no preview, so nothing
  listens for `updateStoryArgs` and no setter repaints; unmounting and re-rendering resets hook state
  rather than revealing it. This is the gap locked decision 7 records and `task-016` hit for the
  toolbar globals.

So a tranche may claim that the control is declared, that the story reads it, that writing it reaches
Storybook, and now that the panel which would show it is present and loaded. Not that the workbench
repaints.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-064-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-064-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

`@storybook/addon-controls` is declared at `8.6.18`, resolved in `yarn.lock`, and listed first in
`storybook/main.ts`'s addons with a comment recording that the entry goes at the version bump.

`nix build '.#internal.x86_64-linux.node_modules'` passes, so the manifest and the lockfile agree
under `--frozen-lockfile`.

`dist/storybook/sb-addons/` now lists `actions-3`, `controls-1`, `knobs-2`, `links-4` and the core
presets. The controls entry is new.

`compile`, `lint` and `storybook` pass as Nix derivations, and the label set is unchanged at 258
stories across 49 panels, identical pair for pair.

## Final Outcome

Complete.

## Self-Review

The temptation in this task was to write down that the workbench criterion is now met, because the
panel exists and the args are declared. It is not met; it is now meetable. Those are different claims
and only one of them is supported by anything runnable here, so the entry says which half was measured
and which half is still behind the same browser wall locked decision 7 named.

The measurement worth keeping is `ls dist/storybook/sb-addons/`. It reads what the manager loaded
rather than what `main.ts` asked for, which is the difference between a configured addon and a present
one, and this epic has already been caught out once by a configured thing that was irrelevant.
