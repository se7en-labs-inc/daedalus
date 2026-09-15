# Task task-026: Settle the knob-to-arg patterns and the useArgs exception rule

## Task ID and Title

- ID: `task-026`
- Title: `Settle the knob-to-arg patterns and the useArgs exception rule`

## Why Chosen Now

`task-026.dependencies` is `[task-025]`, complete. Every other task in phase 4 depends on this one,
and the point of it is that the same question is not answered five times with five answers.

## Phase 4's shape

CSF stories and knob decorators coexist at 8.6.x, so a half-converted corpus builds and renders and
every tranche is its own landing. This task produces no production change; it produces the reference
the tranches work from and the instrument that measures them.

## Interaction Mode

- Mode: `agent_execution`. No production change.

## Scope

- A written pattern for every knob type in use and for both state replacements.
- The `useArgs` default and the `useState` exception rule, stated once.
- An instrument that counts and classifies the remaining call sites.

## Non-Goals

- No conversion. The tranches do that.
- No change to `.agent/skills/storybook-creation/SKILL.md`. `task-060` owns that file and its entry
  says to record this rule there, so writing it twice would create two sources for one rule.

## Dependencies

- `task-025`. Every phase 4 task depends on this.

## Research Consulted

- `.agent/plans/storybook-modernization/storybook-modernization-prd.md`, locked decision 9
- `.agent/plans/storybook-modernization/storybook-modernization-tasks.json`, `task-026`, `task-033`,
  `task-060`
- `.agent/plans/storybook-modernization/task-plans/task-018.md`, the measured render contract

## Docs, Workflows, and Skills Consulted

- Docs: `AGENTS.md`, `CLAUDE.md`
- Skills: `.agent/skills/storybook-creation/SKILL.md`, read rather than edited

## Live Repo Findings Verified For Planning

Verified at `de6f7259c`.

- 360 knob call sites across 73 files, 47 of which import `withKnobs`.
- Placement: 191 in JSX, 87 as a call argument or object property, 66 as a binding, 10 inside a
  callback, 6 at module scope.
- Type: `boolean` 163, `number` 92, `text` 50, `select` 47, `radios` 3, `button` 2, `date` 1,
  `optionsKnob` 1, `object` 1. The four largest account for 352 of the 360.
- The count has been 360 since `950f60eb9`, so phase 3 moved none of them. Every step down from the
  396 at the `task-001` baseline is a named deletion: 19 with the four flag-disabled story sets at
  `7addc86c0`, 2 with the `/staking/epochs` screen at `e6ba8759b`, 15 with the orphaned support
  modules at `5311ce0d0`. The entry's figure of 366 predates the last two.
- The ten callback sites are in four files and the six module-scope sites in four more, so the
  expensive work is concentrated rather than spread.
- `@storybook/preview-api` exports `useArgs`, `useState`, `useEffect`, `useCallback`, `useRef`,
  `useChannel` and `useGlobals` at 8.6.18.

## Files Expected To Change

- new: `.agent/plans/storybook-modernization/task-plans/knob-conversion-patterns.md`
- new: `.agent/plans/storybook-modernization/task-plans/knob-census.js`

## Implementation Approach

1. Write the census, classifying each call site by placement rather than only counting.
2. Reconcile the count against the baseline so the phase starts from a number every step of which is
   attributable.
3. Probe what args, `useArgs` and `useState` actually do at 8.6.18, rather than describing them from
   documentation.
4. Write the patterns from the probe results and the real call sites.

## Acceptance Criteria

- A written pattern exists for every knob type in use and for both state replacements.
- The exception rule is stated once, in a place the tranche tasks can cite.

## Verification Plan

- The census runs and reports a per-type and per-placement breakdown that sums to the total.
- Each of the nine types in use has a row or a paragraph.
- The probe results are recorded with what they did and did not establish.

## Risks and Open Questions

- The ten callback sites are the ones with no mechanical conversion, and some will change what the
  story offers rather than how it is written. A knob inside a loop declares one control per
  iteration and an arg cannot. Where a site cannot be hoisted without changing what the story
  renders, that is a stop-and-ask.
- The two `button` sites have no arg equivalent at all.

## Required Docs, Research, and Tracking Updates

- Set `task-026.status` to `completed`; record the surface, the probe results and the limit.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-026-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-026-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

- The reference and the instrument both exist.

## Final Outcome

- `knob-conversion-patterns.md`: the five placements worked as before-and-after pairs, a rule for
  each of the nine knob types, and the `useArgs` default with the `useState` exception.
- `knob-census.js`: 360 sites across 73 files, classified by type and by placement, exiting non-zero
  while any remain so it can run as a check at the end.
- The surface reconciles to the baseline with every step attributable to a named deletion.

## What the probes established, and what they did not

Composing a synthetic CSF module through `@storybook/react`:

- Args declared on a meta reach the render function's first parameter, and a story's own `args`
  override the meta's.
- `useArgs()` returns those args.
- Calling `updateArgs` emits `updateStoryArgs` on the addon channel, with a mock channel installed.
- `useState` returns its initial value.

Not establishable here: that the preview re-renders the story with the new value. The
portable-stories harness renders a story as a plain React component and runs no preview, so nothing
listens for `updateStoryArgs` and no setter repaints. Unmounting and re-rendering resets the hook
state rather than revealing it, so the harness cannot tell a failed update from a missing re-render.

That is the same gap locked decision 7 records. Each tranche states what it can claim, which is that
the control is declared, the story reads it, and writing it reaches Storybook, rather than reporting
"every converted control still changes the component in the running workbench" as met.

## Self-Review

- The first probe reported that `updateArgs` and the `useState` setter did nothing. Read as a result
  about Storybook that would have been wrong and alarming. The second and third separated the story's
  half from the preview's, and the story's half works. A harness reporting on itself rather than on
  the thing under test is the seventh instance of this phase's recurring shape, and the only reason
  it did not become a finding is that the result was surprising enough to check.
- Classifying by placement rather than counting is what makes the phase estimable. 360 sounds like
  360 problems; it is 344 renames, 10 hoists and 6 relocations.
