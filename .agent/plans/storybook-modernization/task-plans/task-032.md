# Task task-032: Convert knobs in the governance and voting tranche

## Task ID and Title

- ID: `task-032`
- Title: `Convert knobs in the governance and voting tranche`

## Why Chosen Now

`task-032.dependencies` is `[task-026]`, complete. It is the last tranche of story files, and after it
the only knobs left in the corpus are the two shared wrappers the `task-029` open question covers.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- Every knob under `storybook/stories/governance` and `storybook/stories/voting`.
- The four `withState` sites in `governance/DRepDirectory.stories.tsx` and
  `governance/Delegation.stories.tsx`.
- The two `withKnobs` decorator entries left behind elsewhere:
  `storybook/stories/staking/_support/decorator.tsx`, which passes its story through `withKnobs` by
  hand, and `storybook/stories/voting/VotingInfo.stories.tsx`.

## Non-Goals

- `_support/StoryLayout.tsx` and `_support/DiscreetModeToggleKnob.ts`. The `task-029` open question
  covers both, and they are the only knobs in the corpus after this task.
- No change to any story export, `name` or panel title.

## Dependencies

- `task-026`, complete.

## Research Consulted

- `.agent/plans/storybook-modernization/task-plans/knob-conversion-patterns.md`
- `.agent/plans/storybook-modernization/task-plans/task-030.md`, on label collisions
- `.agent/plans/storybook-modernization/storybook-modernization-tasks.json`, `task-032`

## Docs, Workflows, and Skills Consulted

- Docs: `AGENTS.md`, `CLAUDE.md`

## Live Repo Findings Verified For Planning

Verified at `11f91d6c9`.

- 39 call sites: `governance/Delegation.stories.tsx` 24, `voting/Voting.stories.tsx` 9,
  `governance/DRepDirectory.stories.tsx` 3, `governance/DRepDetail.stories.tsx` 2,
  `governance/_utils/fixtures.ts` 1.
- `governance/_utils/fixtures.ts:41` exports `useCurrentVoteKnob`, a function named as a hook that is
  a `select` call. Three stories in `Delegation.stories.tsx` reach their vote-option control through
  it, so the census counted one site where three stories declare a control.
- `governance/Delegation.stories.tsx` reads its knobs in seven module-scope helpers shared by 28
  stories, so nearly every story in the panel registered the same controls.
- Both of the corpus's last two hoists are in that file, inside the confirmation dialog's `onSubmit`.
  A knob registers when its call runs, so neither has ever appeared in the panel: nothing had
  submitted. Two comments in the file say as much about other knobs that were moved out of callbacks
  for the same reason.
- `Delegation.stories.tsx` declares `Submission error` twice with different defaults, once per story,
  and `Vote option`, `Transaction fee`, `Is Trezor` and `Hardware wallet status` each twice in
  different stories. A comment at `renderHardwareDialog` records that two of them colliding by name
  had already caused a visible bug.

## Files Expected To Change

`governance/Delegation.stories.tsx`, `governance/DRepDirectory.stories.tsx`,
`governance/DRepDetail.stories.tsx`, `governance/_utils/fixtures.ts`, `voting/Voting.stories.tsx`,
`voting/VotingInfo.stories.tsx`, `staking/_support/decorator.tsx`.

## Implementation Approach

1. Turn `useCurrentVoteKnob` into the args and argTypes its callers declare.
2. Convert `voting/`, `DRepDetail` and `DRepDirectory`, which are ordinary story-body conversions plus
   four `withState` sites.
3. For `Delegation.stories.tsx`, declare one args table on the meta and give each helper an `args`
   parameter, because the helpers are shared by nearly every story in the panel and the controls were
   effectively panel-wide. The dialog renderer passed as a prop becomes a factory closing over args.
4. Strip the last two `withKnobs` decorator entries.
5. Re-run the census, the args audit and the label diff, then the three Nix checks.

## Acceptance Criteria

- No knob import remains under either root, and none anywhere outside the two shared wrappers.
- `story-args-audit.js` stays at zero findings.
- The label set is identical, pair for pair.
- `compile`, `lint` and `storybook` pass as Nix derivations.

## Verification Plan

- Census per file, before and after.
- Census over the corpus, expecting 47 before and 8 after, the 8 being the two shared wrappers.
- `story-args-audit.js`, with every count move accounted for.
- `index.json` label set diffed in both directions.
- `nix build '.#checks.x86_64-linux.{compile,lint,storybook}' --no-link`.

## Risks and Open Questions

- Declaring one args table on the `Delegation` meta gives every story in that panel every control,
  where a knob gave each story only the controls the helpers it called registered. Nothing renders
  differently, and the alternative is per-story bookkeeping across 28 stories for a distinction no
  story depends on.

## Required Docs, Research, and Tracking Updates

- Set `task-032.status` to `completed`.

## Corrections To The Task Graph

1. `task-032.implementationNotes` says "62 registrations across the four governance files". There are
   four governance files and the census counts 30 knob call sites in them, not 62; 62 is the story
   count. `governance/Delegation.stories.tsx` alone registers 28 stories.
2. The same note names `governance/Delegation.stories.tsx` as carrying `withState` alongside knobs,
   which is right, and `governance/DRepDirectory.stories.tsx` as carrying one, where it carries three.

## Defects Found In The Repository, Not In The Plan

- `governance/Delegation.stories.tsx` reads two knobs inside the confirmation dialog's `onSubmit`
  callback, so neither has ever appeared in the controls panel: a knob registers when its call
  executes and nothing had submitted. Two comments elsewhere in the same file record the same problem
  being fixed for other knobs by moving the reads out of the callback. As args both are declared
  before the story renders, which is what those comments were reaching for.
- `governance/Delegation.stories.tsx:293` calls `text('Valid DRep ID fixture', VALID_DREP_ID)` as a
  bare statement and discards the result. It exists to display a fixture value in the knobs panel.
  There is no arg equivalent for a control that is only read by a human, and no story depends on it,
  so it is dropped.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-032-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-032-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

39 knob call sites removed across five files, plus the two `withKnobs` decorator entries left in
`staking/_support/decorator.tsx` and `voting/VotingInfo.stories.tsx`. The corpus goes from 47 to 8,
and those 8 are the two shared wrappers `task-029` raised: seven in `_support/StoryLayout.tsx` and one
in `_support/DiscreetModeToggleKnob.ts`. No story file in the corpus declares a knob.

Four `withState` sites became `useArgs`, none taking the exception. That is every `withState` site in
the corpus: `grep` for it returns only the wrapper's own definition.

`governance/_utils/fixtures.ts` exported a `select` call behind a hook-shaped name. It exports the
args and argTypes its three callers declare.

`governance/Delegation.stories.tsx` reads one args table declared on the meta, threaded through the
seven helpers its 28 stories share. The confirmation dialog renderer is passed to a component as a
prop, so it became a factory that closes over the args rather than taking them as a parameter.

The label set is unchanged: 258 stories across 49 panels, identical pair for pair in both directions.

`story-args-audit.js` stays at zero findings. Renders reading the first argument went 93 to 120;
renders it cannot resolve went 5 to 4, which is the `_Loaded` binding in `DRepDirectory`.

`compile`, `lint` and `storybook` pass as Nix derivations.

## Final Outcome

Complete.

## Self-Review

The args table in `Delegation.stories.tsx` had to move after it was written. Its argTypes read five
options tables declared further down the file, and a `const` referenced in another `const`'s
initializer before its declaration is a runtime error, not a style problem. `compile` named it; the
file is 780 lines and reading it top to bottom would not have.

Two knobs in that file had never been controls at all. They sit inside `onSubmit`, and addon-knobs
registers a control when its call runs, so until someone submitted a transaction the panel had
nothing. The file already carries two comments explaining that exact failure for other knobs, which
someone had found and fixed twice without finding these. As args they exist before the first render,
which is the property the comments were describing.

The third thing worth recording is smaller and the same shape: a `text()` call whose result is
discarded, registered purely to show a fixture value in the panel. An arg cannot be write-only or
read-only, so it has no equivalent, and nothing reads it.
