# Task task-055: Build the governance and voting fixture data

## Task ID and Title

- ID: `task-055`
- Title: `Build the governance and voting fixture data`

## Why Chosen Now

`task-055.dependencies` is `[task-054]`, complete. Two store keys arrive with the last tranche.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- The `governance` and `voting` store shapes.
- A DRep directory in each of the states its screens select between.

## Non-Goals

- No story files. `task-056` opens the roster.
- No change to `source/`.

## Dependencies

- `task-054`, complete.

## Live Repo Findings Verified For Planning

Verified at `bd121960b`.

- `GovernanceStore` declares 11 observables, 10 computed getters and 9 methods the containers call as
  handlers, several of which reach the wallet backend.
- `storybook/stories/governance/_utils/drepPopulation.ts` already generates a seeded population whose
  active, verified and lapsing proportions are measured from a thousand-DRep mainnet sample. Its only
  import from a store is a type, so reusing it pulls no store module into the harness graph.
- `suggestedDReps` is not stored. It is drawn from `cohortPool` by the application's own selection
  (`GovernanceStore.ts:237-252`), and `cohortPool` is itself derived from `allDReps` and the criteria.
- `GovernanceRefreshState` is an enum exported from the store module.
- `voting.catalystFund` being null removes the registration screen rather than changing it.

## Files Expected To Change

- `storybook/stories/_support/harness/fixtures/governance.ts`, new
- `storybook/stories/_support/harness/fixtures/voting.ts`, new
- `storybook/stories/_support/harness/storeDefaults.ts`

## Implementation Approach

1. Reuse the measured population rather than writing entries.
2. Derive the cohort and the pool from that population with the application's own functions, so they
   cannot disagree with the list they are drawn from.
3. Write the refresh-state values out with their source cited rather than importing the enum.

## The One Judgement In This Task

`suggestedDReps`, `cohortPool` and `allDReps` are three views of one list, and a fixture could state
each independently. It would be shorter and it would let a story show a suggested DRep that is absent
from the directory it claims to be drawn from, which is a screen the application cannot produce and
which nothing would flag.

So the loaded-directory fixture derives all three from one population, using `selectDRepCohortPool`
and `drawDRepCohort` from the application's own module. The fixture is longer and it cannot be
internally inconsistent.

The refresh states go the other way. They are an enum in the store module, and importing it would pull
that module into the harness graph, which is what `screens/harness.spec.ts` asserts against. The five
values are written out with the line they come from, the same trade already made for the loading
phases and the transaction filter defaults.

## Acceptance Criteria

- Both stores are reachable from a story override rather than copied per story.
- The directory is available loaded, loading, failed and with favorites.
- `compile`, `lint`, `jest` and `storybook` pass as Nix derivations.
- The label set is unchanged from `task-054`.

## Verification Plan

- Four Nix checks and the label diff, which must show no change, because this task adds no story.
- The fixtures are exercised by `task-056` immediately after.

## Corrections To The Task Graph

1. `task-055.description` says the governance stories "already hold the richest fixtures in the corpus
   at 62 registrations across four files", implying the data lives in the stories. The data lives in a
   generator those stories call, which is the reusable part, and the harness calls the same generator.
2. `task-055.implementationNotes` says "only the store wrapper is new". The wrapper is new and so is
   the derivation: three of the store's fields are views of one list and have to be produced together,
   which no existing fixture does because no component story needs all three at once.
3. `task-055.implementationNotes` says `DRepDetailPage` needs a resolved `fetchDRep` promise because
   the entry arrives through component state. Correct, and the consequence is sharper than the note:
   the id in the route has to be one the resolved entry matches, or the page renders its not-found
   state while the story claims to render a DRep.

## Required Docs, Research, and Tracking Updates

- Set `task-055.status` to `completed`.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-055-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-055-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

`fixtures/governance.ts` carries the store's fields, the nine backend-reaching methods as no-ops, and
four directory states derived from one seeded population. `fixtures/voting.ts` carries the
registration flow's state and the Catalyst fund.

## Final Outcome

Complete.

## Self-Review

Deriving the three views from one population is the only decision here, and it is the same decision as
pairing wallet tokens with their assets at `task-051`: where the application computes one thing from
another, the fixture computes it too, because the alternative is a screen state that cannot occur and
that nothing checks for.

The enum is the fourth constant this harness has copied out of a module it must not import. That is a
pattern now rather than three exceptions, and it is worth phase 8 writing down as one: the harness
takes shapes from `config/`, `domains/` and `components/`, and values from `stores/` only by
transcription with a citation.
