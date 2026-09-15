# Task task-049: Harness review checkpoint

## Task ID and Title

- ID: `task-049`
- Title: `Harness review checkpoint`

## Why Chosen Now

`task-049.dependencies` is `[task-048]`, complete. Twenty-nine of the forty-nine screens are covered
and every mechanism the harness needs now exists. The remaining twenty are the wallet and staking
screens, which are the larger half by fixture volume, so this is the last cheap moment to change the
shape of the thing.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- A measured per-screen cost across the five tranches.
- A duplication check across every override in the corpus.
- A mechanical confirmation that no screen story reaches a store or an api.
- The override surface written down well enough for phase 8.

## Non-Goals

- No new screens.
- No change to `source/`.

## Dependencies

- `task-048`, complete.

## Live Repo Findings Verified For Planning

Verified at `a9f008a36`.

- 29 story files under `storybook/stories/screens/`, carrying 70 stories, with 69 `screenDecorator`
  calls between them.
- 1,226 lines of harness, of which 350 are its own spec.
- 65 distinct store or field names appear inside a `screenDecorator` call across the whole corpus.
  Nine appear in three or more files, and every one of those nine is either a store name, the
  decorator's own `path` option, or a request's `isExecuting`.
- No screen story imports anything under `app/stores` or `app/api/`.

## Files Expected To Change

- `storybook/stories/screens/harness.spec.ts`, new
- `.agent/plans/storybook-modernization/task-plans/phase-6-closing-notes.md`

## Implementation Approach

1. Measure the corpus rather than estimate it.
2. Turn the two properties that must stay true into assertions instead of prose.
3. Write the override surface into the closing notes, which is what phase 8 reads.

## The One Judgement In This Task

The entry asks for a per-screen rate measured against the twelve hours per tranche the plan assumed,
as the input to the phase 7 re-estimate. That number cannot be produced honestly here. The work ran as
one continuous session, and any hours figure would be invented and then compounded by being used as an
estimate.

So the checkpoint reports what was actually measured, and says plainly which question it does not
answer. The measurable thing that does predict effort is the number of harness gaps a tranche has to
close before any of its screens will mount: four in tranche 2, two in tranche 3, none in tranche 4,
three plus one defect in tranche 5. Story size per screen is the other, and it rises with the number
of states a screen has rather than with the number of fields it reads.

Both are stated, with the caveat that neither is time.

## Acceptance Criteria

- A recorded per-screen measurement across tranches 1 to 5.
- No override duplication that belongs in the defaults, or a list of what does.
- No screen story constructs a store, starts a reaction, or reaches a real Api.
- The override surface is documented well enough for phase 8 to write up.
- `compile`, `lint`, `jest`, `storybook` and `docs` pass as Nix derivations.
- The label set is unchanged from `task-048`.

## Verification Plan

- `harness.spec.ts` asserts the file count, and per file that it reaches no store or api module and
  goes through the shared frame.
- The duplication measurement, read across all 29 files rather than sampled.
- Five Nix checks and the label diff, which must show no change.

## Corrections To The Task Graph

1. `task-049.implementationNotes` asks for a per-screen rate in hours compared against the plan's
   twelve hours per tranche. Not produced, because it cannot be measured from this record without
   inventing it. What was measured is recorded instead, and the gap is stated rather than filled.
2. `task-049.description` says 29 of 49 screens are covered. Confirmed: 29 story files, one per
   screen.
3. Three spellings in prose and two story names used British forms where the repository uses American
   ones. Measured across `.agent/`, 313 uses of the `-ize` form against 15 of `-ise`; across
   `source/`, 13 against 0; and the governance tab this repository ships is labelled "Governance
   Center". Corrected in the files this task touches and in the code comments and story names a
   reader sees. The closed task entries that carry the other form are left as written.
4. `task-048.implementationNotes` asked for `StoryLayout` and `MainLayout` to be reconciled. Reviewed
   here and deliberately not done. `StoryLayout` builds a sidebar from story props for 258 component
   stories; `MainLayout` builds one from stores for the screen corpus. Merging them would put the
   component corpus's frame on the screen corpus's critical path, and the only thing they share is
   that both render a `Sidebar`.

## Required Docs, Research, and Tracking Updates

- Set `task-049.status` to `completed`.
- Complete `phase-6-closing-notes.md`.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-049-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-049-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

The corpus is 29 screens, 70 stories, and 1,226 lines under `storybook/stories/_support/harness/` of
which 350 are its own spec. No field is overridden in three or more
story files, so nothing belongs in the defaults that is not already there. No screen story reaches a
store or an api module, and that is now an assertion rather than a claim.

The phase 6 closing notes carry the override surface, the per-tranche measurements and the three
defects the phase found.

## Final Outcome

Complete.

## Self-Review

The duplication check returned nothing, which is the result worth having and the one that would have
been easy to assume. If three screens had been overriding the same two fields the same way, the
default was wrong and the next twenty screens would have paid for it.

The measurement the entry actually asked for is the one not delivered. Saying so is better than
producing a number that would then be multiplied by twenty. What is offered instead predicts the same
thing and can be checked: gaps closed per tranche, which fell to zero by tranche 4 and rose again in
tranche 5 only because the chrome reaches stores nothing before it had touched.

Phase 7 starts at `task-050`, which is the screen this entire harness was designed around and has not
yet met.
