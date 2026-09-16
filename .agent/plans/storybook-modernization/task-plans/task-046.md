# Task task-046: Screen tranche 4, 4 screens

## Task ID and Title

- ID: `task-046`
- Title: `Screen tranche 4: news, updates and notifications, 4 screens`

## Why Chosen Now

`task-046.dependencies` is `[task-045]`, complete. These are the four screens that sit above the
router, so they are the last tranche reachable before the router stub exists.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- The four screens named in `task-046.targetPaths`.
- A story per state each container selects, including the states that render nothing.

## Non-Goals

- No change to `source/`.
- No screens outside the roster.

## Dependencies

- `task-045`, complete.

## Live Repo Findings Verified For Planning

Verified at `6a5175eb9`, by reading all four container render bodies.

- `NewsFeedContainer` reads five stores. Whether the panel is open is `app.newsFeedIsOpen`, a store
  field rather than a prop, so every story that wants to see it has to say so.
- `NewsOverlayContainer` selects between two overlays and nothing, in that order, from the contents of
  the collection: an incident outranks unread alerts, and with neither it returns null.
- `AppUpdateContainer` returns null without `availableUpdate`. One state renders.
- `NotificationsContainer` renders one element per configured notification whatever the store says,
  and shows a label only for the active ones. With none active it is a tree of empty wrappers: not
  nothing, and not content.
- Three of the four are mounted in `App.tsx:94-97`; `AppUpdateContainer` is mounted in
  `Root.tsx:73`.

## Files Expected To Change

- Four new story files at the paths in `task-046.targetPaths`
- `storybook/stories/screens/screens.spec.tsx`

## Implementation Approach

1. Write a story per state each container selects, taking the news collections from the harness.
2. Extend the render spec, adding the outcome the notification bar needs.

## The One Judgement In This Task

The render spec had three outcomes: shows content, shows nothing, throws at a named line. The quiet
notification bar is none of them. It puts elements on the page, so "shows nothing" is false, and it
puts no text there, so "shows content" fails.

The easy move is to drop the story, or to weaken the content assertion for everyone until this one
passes. Weakening it would cost every other screen the assertion that made this phase worth doing.

So it gets its own outcome, asserted both ways: elements present, text absent. That is a stronger
statement than either existing group would have made about it, and it is the actual claim, which is
that the bar is always mounted and usually silent.

## Acceptance Criteria

- All four story files exist at the paths in `targetPaths`.
- Each mounts its real container through the harness Provider.
- Every state each container selects has a story, including the ones that render nothing.
- `compile`, `lint`, `jest`, `storybook` and `docs` pass as Nix derivations.
- The 258-pair component baseline is intact and the diff against `task-045` is additive only.

## Verification Plan

- The render spec composes all 57 screen stories across four outcomes.
- Per-file coverage for the four containers and the components below them.
- Five Nix checks, `nix fmt`, the label diff and the args audit.

## Corrections To The Task Graph

1. `task-046.implementationNotes` gives per-screen store lists that are short on three of the four.
   `NewsFeedContainer` is listed as `newsFeed, app` and reads five, which the same note says two lines
   later. `NewsOverlayContainer` is listed as `newsFeed` and also reads `profile` and `app`.
   `NotificationsContainer` is listed as `uiNotifications` and that one is right.
2. `task-046.acceptance` requires each story to render "the screen's own content rather than an empty
   shell". Three of these screens have a state whose content is nothing, by design, and one has a
   state whose content is an empty shell, also by design. Written as stated, the criterion excludes
   the states most sessions are actually in. Each of them gets a story and an assertion naming what it
   is.
3. `task-046.description` says all four are mounted above the router "by App.tsx and Root.tsx". Three
   are in `App.tsx:94-97`; the update overlay is in `Root.tsx:73`, on a branch that replaces the
   application rather than layering over it.

## Required Docs, Research, and Tracking Updates

- Set `task-046.status` to `completed`.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-046-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-046-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

Four story files carrying thirteen stories, covering every state the four containers select.

The render spec covers 57 screen stories across four outcomes: 44 show content, 5 render nothing, 1
renders a frame with no text, 7 throw at the logo lookup recorded in finding 09.

`compile`, `lint`, `jest`, `storybook` and `docs` pass as Nix derivations, `nix fmt` is clean, and the
label set is up 13 with the 258-pair component baseline intact.

## Final Outcome

Complete.

## Self-Review

The tranche itself was straightforward, which is worth saying: four containers, thirteen states,
nothing in the harness missing. That is the first tranche where that was true, and it is the effect of
`task-045` having been done properly rather than of these screens being simple.

The judgement that took the time was the notification bar, and it is a small instance of a general
problem this phase keeps running into: the assertion "something rendered" has to be sharp enough to
fail on an empty screen and honest enough not to fail on a screen that is correctly empty. Four
outcomes is more machinery than three, and each of the four names a real distinction rather than a
convenience.

What this tranche does not do is anything the next one needs. `task-047` is the router stub, and every
screen after it renders inside `MainLayout`.
