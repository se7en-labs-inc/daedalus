# Task task-045: Add the newsFeed, appUpdate and uiNotifications stores

## Task ID and Title

- ID: `task-045`
- Title: `Add the newsFeed, appUpdate and uiNotifications stores`

## Why Chosen Now

`task-045.dependencies` is `[task-044]`, complete. Tranche 4 is the four screens mounted above the
router, and all four read one of these three stores.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- The three stores' observables, computed getters and handler methods.
- News payloads the containers' branches can actually be reached with.

## Non-Goals

- No story files. `task-046` opens the roster.
- No change to `source/`, including the type defect this task found.

## Dependencies

- `task-044`, complete.

## Live Repo Findings Verified For Planning

Verified at `72abfe1a0`.

- `newsFeedData` is not data. It is a `NewsCollection` (`domains/News.ts:79`), and the containers read
  `incident`, `alerts.unread` and `alerts.all`, which are computed getters that filter and order the
  underlying list.
- `NewsCollection`'s constructor filters every item against `global.environment` before anything can
  read it: the target version must satisfy a semver range against `environment.version`, and the
  running platform must appear in `target.platforms`.
- **The existing news fixtures produce nothing.** Measured by constructing the collection directly:
  three items in, zero out. Two independent causes, either of which is sufficient.
  - `fakeDataNewsFeed.ts` sets `target.platform`, singular. The filter reads `target.platforms`,
    plural, and tests membership. Written up as
    `.agent/findings/10-the-newsfeed-target-type-names-the-wrong-field.md`, because the declared type
    is what steers an author to the wrong spelling.
  - `_support/environment.ts` set `version: 'storybook'`. `semver.satisfies('storybook', …)` is false
    for every range, so any item carrying a version target was dropped whatever its platform said.
- `AppUpdateContainer` returns null without `availableUpdate`, so the overlay has exactly one state
  that renders.
- `NotificationsContainer` reads one field, `uiNotifications.activeNotifications`, and renders a
  notification per configured id whether or not it is active.

## Files Expected To Change

- `storybook/stories/_support/harness/fixtures/news.ts`, new
- `storybook/stories/_support/harness/storeDefaults.ts`
- `storybook/stories/_support/harness/storeDefaults.spec.tsx`
- `storybook/stories/_support/environment.ts`
- `storybook/stories/news/_utils/fakeDataNewsFeed.ts`
- `storybook/stories/news/_utils/fakeDataUpdate.ts`

## Implementation Approach

1. Fix the two reasons the existing fixtures produce nothing, in the files that own them.
2. Build `newsFeedData` as a real `NewsCollection` rather than a stand-in, from those same items.
3. Fill the three stores from their declarations.
4. Assert what comes out of the collection, not what goes in.

## The One Judgement In This Task

The obvious fixture for `newsFeedData` is a plain object with `all`, `unread`, `incident` and `alerts`
on it. It is simpler, it has no filter to get past, and it would have worked immediately.

It would also have been a second implementation of the ordering and grouping rules in `NewsCollection`,
maintained here, diverging silently the first time those rules changed. And it would have hidden the
thing this task actually found: that the collection discards items built the obvious way, which is why
the news stories have shown an empty feed for as long as they have existed.

So the fixture constructs the real collection and the spec counts what survives. The cost is that the
fixture has to satisfy a filter; the benefit is that it is the only thing that could have told us the
filter was eating everything.

## Acceptance Criteria

- The three stores are reachable from a story override rather than copied per story.
- Every branch the four tranche 4 containers select is reachable from some fixture.
- The news fixtures produce collections that are not empty.
- `compile`, `lint`, `jest`, `storybook` and `docs` pass as Nix derivations.
- The label set is unchanged from `task-044`.

## Verification Plan

- Three assertions in `storeDefaults.spec.tsx`, counting items out of the collection rather than in:
  the fixtures survive the filter, each container branch is reachable, and the update overlay has
  something to render.
- Five Nix checks and the label diff, which must show no change, because this task adds no story.

## Corrections To The Task Graph

1. `task-045.implementationNotes` says the news and app-update fixtures "already exist in the story
   sets converted in `task-027`; reuse them rather than inventing new ones". They exist and they are
   reused. They also produce nothing: every item they build is discarded by `NewsCollection` before a
   story sees it. Reusing them as they stood would have carried that into the harness and into every
   screen story built on it. Corrected in place.
2. The same note says these stories "carry usable payload shapes". The shapes are usable; the target
   field on them is not, and the field is the one that decides whether an item exists.
3. `task-039` and `task-043` both left `newsFeed` partially filled to unblock an earlier tranche.
   `task-043` added `newsFeedData` as a plain object one field deep; it is replaced here by the real
   collection rather than extended, so the harness has one shape for it rather than two.

## Required Docs, Research, and Tracking Updates

- Set `task-045.status` to `completed`.
- New finding: `.agent/findings/10-the-newsfeed-target-type-names-the-wrong-field.md`, indexed.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-045-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-045-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

`fixtures/news.ts` carries the three stores and four news collections: empty, populated, incident and
alert. The collections are real `NewsCollection` instances and the items in them survive the filter.

The story environment carries the application's own version rather than a placeholder, which is what
the semver test in the feed filter requires.

Three assertions count items out of the collection. `compile`, `lint`, `jest`, `storybook` and `docs`
pass as Nix derivations, `nix fmt` is clean, and the label set is unchanged.

## Final Outcome

Complete.

## Self-Review

This task was scoped as filling three stores and turned out to be about a corpus defect that predates
the epic. Every news story in the repository has rendered an empty feed since it was written, and the
reason splits cleanly in two: a fixture that spells a field the way the type declares it, and a type
that declares the wrong field.

The part worth carrying forward is how it was found. Nothing about writing the fixture would have
surfaced it; the collection accepts any input and returns a shorter list. It surfaced because the
spec counted what came out. That is the same move that found the previous two defects, applied to data
rather than to a render.

The environment version change has reach beyond this task. Every story that prints a version now
prints the real one rather than the word `storybook`, which is more truthful and is what the diagnostics
and about screens are for, but it is a change to a fixture 258 stories share and is recorded here
rather than only in the diff.
