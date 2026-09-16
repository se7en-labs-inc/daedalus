# Task task-056: Screen tranche 8, 5 screens

## Task ID and Title

- ID: `task-056`
- Title: `Screen tranche 8: governance and voting, 5 screens`

## Why Chosen Now

`task-056.dependencies` is `[task-055]`, complete. This is the last roster; it closes the screen
corpus at all 49 reachable screens.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- The five screens named in `task-056.targetPaths`, two of which are one container at two routes.

## Non-Goals

- No change to `source/`.

## Dependencies

- `task-055`, complete.

## Live Repo Findings Verified For Planning

Verified at `bd121960b`, by reading all four container render bodies.

- `DRepDirectoryPage` is bound to both `/governance/dreps` and `/governance/favorites`
  (`Routes.tsx:243-254`) and picks its view from `location.pathname` (`:133-137`). The route is the
  only thing that separates the two screens.
- `DRepDetailPage` reads `match.params.drepId` (`:56`) and fetches the entry in `componentDidMount`,
  holding it in component state. Its story needs a router seeded with a real path and a resolved
  fetch, and the id in the path must be one the resolved entry matches.
- `VotingGovernancePage` refuses outright until the node is synced (`:76-84`) and reads seven stores.
- `/governance/delegate` has no navigation tab. It is pushed from the directory (`:80`) and from a
  DRep's detail page (`:90`), and the selection travels in `governance.delegationNavState` because
  hash history v4 drops `location.state` on every push.
- All four containers render inside the `Governance` shell, which `Routes.tsx` wraps them in.

## Files Expected To Change

- Five new story files under `storybook/stories/screens/governance/` and `screens/voting/`
- `storybook/stories/screens/screens.spec.tsx`
- `storybook/stories/screens/harness.spec.ts`

## Implementation Approach

1. Mount every screen inside the governance shell, as the router does and as tranche 7 established.
2. Give the two directory views separate files, since the route is what distinguishes them.
3. Take the detail page's subject from the population rather than naming an id.

## The One Judgement In This Task

One container serves the directory and the favorites view, and the natural instinct is one story file
with a story each. The roster asks for two files and the roster is right, for a reason worth stating:
the two are different screens with different empty states, and the thing that selects between them is
the route rather than any input a reader can see in the story.

Filed as two stories in one file, the sidebar would show both under one panel and a reader looking for
what the favorites tab shows would find it under the directory's name. Filed as two panels, the
sidebar matches the application's own navigation, which is what someone reviewing a screen is
comparing against.

The delegation target story is the other decision. `ArrivingWithADRepChosen` sets
`delegationNavState`, which is a store field carrying router state the router cannot carry. That is
the only way a user reaches that form with a DRep already selected, and a story that set the form's
value directly would document a state the application has no path to.

## Acceptance Criteria

- All five screens have a story file and appear under the governance and voting groups.
- The two directory views are separate panels and the route is what separates them.
- `compile`, `lint`, `jest`, `storybook` and `docs` pass as Nix derivations.
- The 258-pair component baseline is intact and the diff against `task-054` is additive only.

## Verification Plan

- The render spec composes all 129 screen stories.
- Per-file coverage for the four containers and the components below them.
- The story-file count assertion, which now reads 49 and is the phase's completion criterion.
- Five Nix checks, `nix fmt`, the label diff and the args audit.

## Corrections To The Task Graph

1. `task-056.implementationNotes` counts `DRepDirectoryPage`'s four refresh states as four stories.
   `Refreshing` is not covered: it is the state during a background reload of a directory already on
   screen, and it differs from `Loaded` by a spinner in the toolbar. The three that select different
   screens are covered, and this is stated rather than left as an unexplained gap.
2. The same note says `DRepDetailPage` carries three `detailRefreshState` values. Two are covered, the
   resolved entry and the resolved absence. The third is the fetch rejecting, which the container
   reaches through a `catch`, and a fixture whose promise rejects makes the spec report an unhandled
   rejection rather than a rendered screen.
3. `task-056.description` calls these five screens, of which one container serves two. Accurate, and
   the file count is five because the two views are separate panels.

## Required Docs, Research, and Tracking Updates

- Set `task-056.status` to `completed`.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-056-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-056-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

Five story files carrying 13 stories. All four containers execute: `DRepDetailPage` at 95.91% of
statements, `VotingGovernancePage` at 91.42, `DRepDirectoryPage` at 88.88, `GovernanceWalletsPage` at
58.62. `DRepDetail.tsx` and `VotingUnavailable.tsx` are at 100%, `DRepDirectory.tsx` at 96.99 and
`VotingPowerDelegation.tsx` at 91.11.

The screen corpus is 49 story files, 129 stories, 49 sidebar panels. The label set is 387 pairs with
the 258-pair component baseline intact.

## Final Outcome

Complete. Every reachable screen in the application has a story that mounts its real container.

## Self-Review

This tranche needed no harness work at all, which is the first time that has happened on a roster of
this size, and it is the result of `task-055` deriving its fixtures rather than stating them.

The two gaps are named rather than smoothed: the directory's refreshing state, which differs from
loaded by a toolbar spinner, and the detail page's rejected fetch, which cannot be expressed as a
fixture without the spec reporting an unhandled rejection. Both are stated in the entry with the
reason, which is the standard the rest of the corpus has been held to.
