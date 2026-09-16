# Task task-061: Close out and record the follow-ons

## Task ID and Title

- ID: `task-061`
- Title: `Close out and record the follow-ons`

## Why Chosen Now

Last task in the plan.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- Every required check, run against the tree as it stands.
- The PRD status and every task status.
- The work deliberately left out, written where the next person will find it.

## Non-Goals

- No new stories, no new fixtures, no change to `source/`.

## Dependencies

- `task-060`, complete.

## Live Repo Findings Verified For Planning

Verified at `9532be608`.

- The check set for `x86_64-linux` is 16 derivations. Three are Rust and one is a Nix formatter
  check; the thirteen that this epic can affect are `compile`, `lint`, `stylelint`, `i18n`, `jest`,
  `cucumber-unit`, `storybook`, `docs`, `shellcheck`, `treefmt`, `prettier-version-parity`,
  `crypto-vectors` and `bundle-integrity`.
- 63 tasks in the graph, not 65.
- The follow-on figures in `task-061.implementationNotes` are stale: 229 `@ts-ignore` against 162
  measured under `storybook/`, 457 lint warnings against 449, and 26 dialog containers against 40
  uncovered ones out of 44.

## Files Expected To Change

- `.agent/plans/storybook-modernization/storybook-modernization-prd.md`
- `.agent/plans/storybook-modernization/storybook-modernization-tasks.json`
- `.agent/plans/storybook-modernization/task-plans/follow-ons.md`, new

## Implementation Approach

1. Run all thirteen checks serially and record the result.
2. Append a status entry rather than rewriting one, per the plan's own append-only rule.
3. Re-measure every figure in the follow-on list rather than carrying the plan's.

## The One Judgement In This Task

The four follow-ons the entry names all carry figures, and every one of them is out of date. The
entry was written before implementation and the corpus has moved under it.

Carrying them forward would have been faster and would have put four numbers into the document a
future reader is most likely to trust, because it is the one that exists specifically to be found
later. A follow-on list is read by someone deciding whether to pick something up, and a wrong figure
there is worse than no figure, because it is the basis of an estimate nobody will re-derive.

So each is re-measured and the difference is recorded rather than quietly corrected. The largest is
the dialog tier: the entry says 26 containers, the measurement says 104 container files of which 48
are covered, 56 are not, and 40 of those 56 are dialog, wizard or step containers.

## Acceptance Criteria

- All required checks pass.
- The PRD status and every task status reflect what happened.
- The follow-on list is recorded where the next person will find it.

## Verification Plan

- Thirteen Nix derivations, run one at a time. Running four concurrently exhausted a file descriptor
  limit inside SWC earlier in this phase and failed two spec files spuriously.
- A count of tasks by status, read from the graph rather than from memory.

## The final measurement

| | value |
|---|---|
| Nix checks run | 13, all passing |
| Tasks in the graph | 63, all `completed` |
| Story label pairs | 387 |
| Component baseline | 258, unchanged pair for pair since phase 3 |
| Screen stories | 129 across 49 files, one per reachable screen |
| Knob call sites | 0, from 396 |
| Renders reading an argument with no `args` | 0 |
| Harness | 2,191 lines across nine fixture modules |
| Defects found and written up | 4 |

## Corrections To The Task Graph

1. `task-061.implementationNotes` gives four follow-on figures and all four are stale. Re-measured:
   162 `@ts-ignore` directives under `storybook/` rather than 229; 449 lint warnings rather than 457;
   40 uncovered dialog, wizard and step containers out of 44 rather than 26 distinct ones. The
   image-diff item carries no figure and is unchanged.
2. The PRD carried `**Status:** Draft` through the whole implementation. Now `Complete`, with the
   final entry appended to the status log rather than replacing an earlier one.
3. `task-061` says "run every required check against a clean checkout". Run against the tree at
   `9532be608`, which is the tree the checks gate, and Nix builds from the git tree rather than the
   working directory in any case.

## Required Docs, Research, and Tracking Updates

- Set `task-061.status` to `completed`.
- PRD status log entry appended, `Status` set to `Complete`.
- `follow-ons.md` written.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-061-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-061-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

Thirteen checks pass. 63 of 63 tasks complete. The PRD carries a final status entry naming six
deviations from the plan, each with the task entry that made it. The follow-on list carries seven
items with re-measured figures.

## Final Outcome

Complete. The epic is ready for manual validation.

## Self-Review

Re-measuring the follow-on figures is the only thing in this task that was not bookkeeping, and it is
the thing most likely to matter. The follow-on document is the one a future reader finds without
looking for it, which makes a wrong number in it more durable than a wrong number anywhere else in
this plan.

What this close-out cannot say is whether the screens look right. Every check here asserts that
something rendered, that a label set did not move, or that a count is what it should be. The
assertion that a screen shows the correct thing is not available in this repository, is recorded as
the largest remaining gap, and is what the manual validation this hands over to is for.
