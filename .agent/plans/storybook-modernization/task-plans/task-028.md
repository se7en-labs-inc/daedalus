# Task task-028: Convert knobs in the nodes and loading tranche

## Task ID and Title

- ID: `task-028`
- Title: `Convert knobs in the nodes and loading tranche`

## Why Chosen Now

`task-028.dependencies` is `[task-026]`, complete, and `task-027` closed the tranche before it. This
is where the knob factory lives, so it is where the census's blind spot has to be closed before any
later tranche is measured against a number that includes it.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- Every knob under `storybook/stories/nodes` and `storybook/stories/loading`, whether called on
  `@storybook/addon-knobs` directly or through `loading/_support/loadingKnobs.ts`.
- `loading/_support/loadingKnobs.ts` itself, which has no purpose once its callers declare args.
- The three `_support` modules under `nodes/` that hold knobs for stories registered elsewhere, and
  the story files that bind their exports.

## Non-Goals

- No change to any story export, `name` or panel title.
- No manifest change.
- No change to the fixtures under `loading/_support/mithrilFixtures.ts` or `mithrilHarness.tsx`,
  which hold no knobs.

## Dependencies

- `task-026`, complete. `task-027` for the shared `_support/argTypes.ts`.

## Research Consulted

- `.agent/plans/storybook-modernization/task-plans/knob-conversion-patterns.md`
- `.agent/plans/storybook-modernization/task-plans/task-027.md`, the tranche precedent
- `.agent/plans/storybook-modernization/storybook-modernization-tasks.json`, `task-028`

## Docs, Workflows, and Skills Consulted

- Docs: `AGENTS.md`, `CLAUDE.md`

## Live Repo Findings Verified For Planning

Verified at `7bccd288d`.

- `loading/_support/loadingKnobs.ts` exports five one-line wrappers around `boolean`, `number`,
  `radios`, `select` and `text`, each attaching the shared `Loading` group id. Seven story files
  import them, and between them call them 44 times.
- The census counted those five definitions and none of the 44 call sites, because it skipped any
  file with no `@storybook/addon-knobs` in its text and matched only the addon's own export names.
  Corrected in this task before any conversion; see below.
- `nodes/syncing/_support/SyncingConnecting.tsx` holds 23 of the census's call sites and no story.
  Its three exported components are bound directly as stories by `nodes/syncing/Syncing.stories.tsx`.
- `nodes/errors/_support/NoDiskSpaceError.tsx` calls `text` three times under one label,
  `diskSpaceRequired (GB)`, for three different props. See the defect below.
- `nodes/environment/TopBarEnvironment.stories.tsx` calls `boolean('isAlonzoActivated', false)` in
  three module-scope builders, one per story, all under one label.
- `loading/mithril/MithrilPartialSyncDialogue.stories.tsx` reaches its knobs through two module-scope
  factories, `behindByEpochsKnob` and `startFailsKnob`, called from five stories between them.

## Files Expected To Change

Under `storybook/stories/nodes`: `syncing/_support/SyncingConnecting.tsx`, `syncing/Syncing.stories.tsx`,
`errors/_support/NoDiskSpaceError.tsx`, `errors/_support/SystemTimeError.tsx`, `errors/Errors.stories.tsx`,
`environment/TopBarEnvironment.stories.tsx`, `about/About.stories.tsx`, `updates/Updates.stories.tsx`.

Under `storybook/stories/loading`: `_support/loadingKnobs.ts` (deleted), `chain-storage/ChainStorageLocationPicker.stories.tsx`,
`mithril/MithrilBootstrap.stories.tsx`, `mithril/MithrilDecisionView.stories.tsx`,
`mithril/MithrilErrorView.stories.tsx`, `mithril/MithrilPartialSyncDialogue.stories.tsx`,
`mithril/MithrilPartialSyncOverlay.stories.tsx`, `mithril/MithrilProgressView.stories.tsx`.

Also `storybook/stories/_support/argTypes.ts` and
`.agent/plans/storybook-modernization/task-plans/knob-census.js`.

## Implementation Approach

1. Correct the census first, so the tranche is measured against a number that includes the factory's
   call sites. The count rises rather than falls, and the reason is that the scan could not see a
   knob reached through a wrapper.
2. Add a helper that builds the `Loading` table category for every arg in an args object, since the
   group id was on all 44 of them and writing it out per arg is 44 identical lines.
3. Convert the `_support` modules under `nodes/` by giving each exported component a props parameter
   and moving the defaults to the story that binds it, per the module-scope rule.
4. Convert the story files, binding to zero call sites per file as measured by the census.
5. Delete `loading/_support/loadingKnobs.ts` with its last caller.
6. Re-run the census, the args audit and the label diff, then the three Nix checks.

## Acceptance Criteria

- No knob import remains under either root, directly or through the factory.
- The census reports both roots at zero call sites.
- `story-args-audit.js` stays at zero findings.
- The label set read from `index.json` is identical to the pre-edit reading, pair for pair.
- `compile`, `lint` and `storybook` pass as Nix derivations.

## Verification Plan

- Census per file over both roots, before and after.
- Census over the whole corpus, with the rise from the instrument fix stated separately from the fall
  from the conversion.
- `story-args-audit.js`, expecting zero findings and every count move accounted for.
- `index.json` label set diffed in both directions.
- `nix build '.#checks.x86_64-linux.{compile,lint,storybook}' --no-link`.

## Risks and Open Questions

- The three `SyncingConnecting` components and the two `nodes/errors` components are named by
  `task-028.implementationNotes` as fixtures the phase 6 container stories will reuse. They stay
  exported and gain a props parameter rather than being folded into their story files.
- Deleting the knob factory changes seven files at once. Each is converted and measured before the
  file is deleted, so the deletion is the last step and not the first.

## Required Docs, Research, and Tracking Updates

- Set `task-028.status` to `completed`.
- Record the census correction and its effect on the phase 4 headline numbers.

## Corrections To The Task Graph And The Instrument

1. The census under-reported the phase 4 surface by 39. It counted five knob factory definitions
   where seven story files hold 44 controls reached through them. The corpus was 337 call sites at
   the start of `task-027` and was really 381; it was 273 after `task-027` and is really 317. Every
   one of the 44 is a rename, so the split becomes 304 renames, 10 hoists, 3 relocations.
2. `task-028.description` says `loading/mithril/MithrilPartialSyncOverlay.stories.tsx` "alone carries
   15 registrations across 388 lines". The file is 430 lines and carries 8 knob call sites. The
   figure 15 counts story registrations, not knobs.
3. `task-028.implementationNotes` says `nodes/errors/` files register no stories of their own. True
   of the two `_support` modules; `nodes/errors/Errors.stories.tsx` registers both.

## Defects Found In The Repository, Not In The Plan

- `tsconfig.json` declares `"target": "es2019"` with `"lib": ["dom"]`, and the library surface that
  results sits below the declared target. `Object.entries`, ES2017, compiles; `Object.fromEntries`,
  ES2019, is rejected by the Nix compile check with a suggestion to raise `lib`. Anything written
  against the stated target can fail to typecheck for that reason alone.

- `nodes/errors/_support/NoDiskSpaceError.tsx` registers three `text` knobs under the single label
  `diskSpaceRequired (GB)` with defaults 4, 1 and 8, and feeds them to `diskSpaceRequired`,
  `diskSpaceMissing` and `diskSpaceRecommended`. addon-knobs returns the existing value for a repeated
  name and type, so all three props have always read 4 and the defaults 1 and 8 have never been
  reachable. The conversion keeps one control feeding all three, which is what renders today. Making
  the three independent would change what the story shows and is a decision for the owner.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-028-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-028-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

80 knob call sites removed across sixteen files, and `loading/_support/loadingKnobs.ts` deleted with
its last caller. The corpus goes from 317 to 237: 224 renames, 10 hoists, 3 relocations. Neither root
declares a knob, directly or through a factory.

Three module-scope conversions carry the tranche. `nodes/errors/_support/NoDiskSpaceError.tsx` and
`SystemTimeError.tsx` and the three components in `nodes/syncing/_support/SyncingConnecting.tsx` hold
knobs for stories registered elsewhere; each takes a props parameter now and exports the defaults its
story binds, so the fixtures stay reusable by the phase 6 container stories.
`nodes/environment/TopBarEnvironment.stories.tsx` reads one knob under one label in three
module-scope builders, which is one meta arg threaded through a second parameter.

The `Loading` group id was on all 44 of the factory's controls. `inCategory` in
`_support/argTypes.ts` builds one argType per arg from the args object, so the category is stated once
per file instead of once per control.

The label set is unchanged: 258 stories across 49 panels, identical pair for pair in both directions.

`story-args-audit.js` stays at zero findings. Renders reading the first argument went 17 to 50, which
is the stories that took object form in this tranche; renders it cannot resolve is unchanged at 8.

`compile`, `lint` and `storybook` pass as Nix derivations.

## Final Outcome

Complete.

## Self-Review

The instrument was wrong and the plan written against it was wrong with it. What made the difference
was reading the file the numbers came from rather than the numbers: `loadingKnobs.ts` is five
one-line functions, and five call sites in a file that exists to be called from elsewhere is not a
number anyone should have believed. The corrected figure is 39 higher than the epic has been carrying
since phase 4 opened.

That is the eighth and ninth instance of the shape the phase 3 closing notes name, and it arrived the
same way as the others: the count was plausible, so it was not questioned. The rule that catches it is
already written down. What this task adds is that a scan keyed on an import name cannot see an
indirection, and a corpus with shared helpers in it will have indirections.

Worth carrying forward: `tsconfig.json` sets `target: es2019` and `lib: ["dom"]`, and ES2019 built-ins
do not typecheck under it. `Object.fromEntries` is rejected where `Object.entries` is accepted. A
later tranche reaching for a recent built-in will hit the same wall, and the host `tsc` is not what
says so.
