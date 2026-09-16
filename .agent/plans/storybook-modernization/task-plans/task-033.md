# Task task-033: Sweep the remaining withState sites and record the exceptions

## Task ID and Title

- ID: `task-033`
- Title: `Sweep the remaining withState sites and record the exceptions`

## Why Chosen Now

`task-033.dependencies` is `[task-027 … task-032]`, all complete. Every `withState` site was converted
alongside its file's knobs, so this task checks the population, removes the shim, and writes down
which sites took the `useState` exception.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- A check over the whole repository that no `withState` call site remains.
- Deleting `storybook/stories/_support/WithLocalState.tsx`, whose only remaining reference is its own
  definition.
- The exception list.

## Non-Goals

- No change to `.agent/skills/storybook-creation/SKILL.md`. See the correction below.

## Dependencies

- `task-027` through `task-032`, all complete.

## Research Consulted

- `.agent/plans/storybook-modernization/task-plans/knob-conversion-patterns.md`, the `useArgs` default
  and the `useState` exception rule
- `.agent/plans/storybook-modernization/task-plans/task-063.md`, which added the shim
- `.agent/plans/storybook-modernization/storybook-modernization-prd.md`, locked decision 9

## Docs, Workflows, and Skills Consulted

- Docs: `AGENTS.md`, `CLAUDE.md`
- Skills: `.agent/skills/storybook-creation/SKILL.md`, read rather than edited

## Live Repo Findings Verified For Planning

Verified at `036e7527f`.

- `grep -rn "withState\|WithLocalState" storybook/ source/` over `.ts` and `.tsx` returns seven hits,
  all seven inside `storybook/stories/_support/WithLocalState.tsx` itself: five in its header comment,
  its own `export function withState`, and the name of the component it returns.
- `@dump247/storybook-state` appears in neither `package.json` nor `yarn.lock`. `task-063` removed it
  in phase 2, which is what the task entry says.
- No file imports `useState` from `@storybook/preview-api`.
- 17 `withState` call sites existed across 10 files. All 17 were converted: 3 in
  `common/ItemsDropdown.stories.tsx`, 2 in `notifications/Notifications.stories.tsx`, 1 in
  `dapps/TransactionRequest.stories.tsx`, 3 in `settings/general/General.stories.tsx`, 2 in
  `settings/language/Language.stories.tsx`, 2 in `wallets/tokens/`, 3 in
  `governance/DRepDirectory.stories.tsx`, 1 in `governance/Delegation.stories.tsx`.

## Files Expected To Change

- `storybook/stories/_support/WithLocalState.tsx`, deleted.

## Implementation Approach

1. Grep the repository and confirm the only hits are the shim's own definition.
2. Delete the shim.
3. Record the exception list.
4. Run the three Nix checks plus `jest`, since the shim was a module other modules imported.

## Acceptance Criteria

- `grep` for `withState` across the repository returns nothing.
- The `useState` exceptions are listed with a one-line reason each.
- `compile`, `lint`, `storybook` and `jest` pass as Nix derivations.

## Verification Plan

- `grep -rn "withState\|WithLocalState" storybook/ source/`, expecting no hits.
- `nix build '.#checks.x86_64-linux.{compile,lint,storybook,jest}' --no-link`.
- `index.json` label set diffed in both directions, because deleting a module a story file imported is
  the kind of change that can drop a file from the glob.

## The useState exception list

Empty. No site took it.

The rule at `knob-conversion-patterns.md` makes `useArgs` the default and reserves `useState` for
state that would be actively misleading as a control: something the component owns and the story only
observes, or an intermediate a viewer could set to a value the story cannot reach or undo. All 17
sites held either a selection or a visibility flag, and in every one the story's own handlers both set
it and clear it, so a viewer driving it from a control reaches nothing the story cannot reach and
nothing it cannot undo.

The two that came closest are worth naming, because the reasoning is what makes the list empty rather
than the count.

`notifications/Notifications.stories.tsx` holds `isVisible`, which a trigger button sets and a timer
clears. A control for it looked like the exception: a viewer could set it true with no timer running.
It is not, because the notification's own close button and its click-to-close both clear it, so the
state is reachable and undoable by hand.

`governance/DRepDirectory.stories.tsx` holds `favoriteDRepIds`, an array the directory mutates through
a toggle. A control offering free text over an id list could hold an id no entry has. That is a value
the story ignores rather than one it cannot recover from: the next toggle rewrites the array, and an
unmatched id changes nothing on screen.

## Required Docs, Research, and Tracking Updates

- Set `task-033.status` to `completed`.

## Corrections To The Task Graph

1. `task-033.targetPaths` includes `.agent/skills/storybook-creation/SKILL.md`, and its
   `implementationNotes` say the exception list is recorded in one place. `task-026` already recorded
   the rule in `knob-conversion-patterns.md` and its own entry names `task-060` as the owner of the
   skill document, so writing the rule there as well would create the second source the note is
   trying to avoid. The list lives here and the rule lives in the reference; `task-060` states both
   in the skill when it rewrites it.
2. `task-033.description` says "Eight of the ten were converted alongside their knobs in the tranche
   tasks; this sweeps the rest". All ten were. Nothing was left to sweep, which is the outcome the
   tranche-by-tranche ordering was meant to produce.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-033-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-033-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

`storybook/stories/_support/WithLocalState.tsx` is deleted. No `withState` call site remains anywhere
in the repository, and the exception list is empty.

## Final Outcome

Complete.

## Self-Review

An empty exception list is a result and not an absence, so it is written out with the reasoning rather
than left as a count. The rule exists to stop the choice becoming per-file taste, and a list that says
"none" without saying why would not do that: the next person converting a stateful story needs to see
what was weighed and rejected, or they will read the empty list as permission to skip the question.
