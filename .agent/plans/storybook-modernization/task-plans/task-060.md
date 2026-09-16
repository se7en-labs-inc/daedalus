# Task task-060: Rewrite the Storybook skill and workflow documents

## Task ID and Title

- ID: `task-060`
- Title: `Rewrite the Storybook skill and workflow documents`

## Why Chosen Now

`task-059` landed the enforcement half. This is the instruction half, and they only work together: the
lint rule catches a story written against the old API and these two documents are where a contributor
finds out what to write instead.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- `.agent/skills/storybook-creation/SKILL.md`
- `.agent/workflows/storybook.md`

## Non-Goals

- No change to `source/` or to the story corpus.
- No description of this plan, its phases, or the order the work was done in.

## Dependencies

- `task-059`, complete.

## Live Repo Findings Verified For Planning

Verified at `9532be608`.

- `SKILL.md:26` said, in bold, "Daedalus uses the `storiesOf()` API, NOT Component Story Format (CSF).
  Do NOT use `export default { title: ... }` or named exports." Left unchanged it would actively
  reintroduce the API phases 3 and 4 removed, and it is what an agent reads before writing a story.
- The same document described Storybook 6.4, `@storybook/addon-knobs`, `@dump247/storybook-state` and
  a `DaedalusMenu` addon. None of those is in the repository.
- `.agent/workflows/storybook.md` described a `storybook/.storybook/` directory. Configuration is at
  `storybook/main.ts` and `storybook/preview.tsx`.
- Neither document mentioned screen stories, the store harness, or the fact that `storybook:build`
  cannot prove a story renders.

## Files Expected To Change

- `.agent/skills/storybook-creation/SKILL.md`
- `.agent/workflows/storybook.md`

## Implementation Approach

1. Rewrite both against the workbench as it stands.
2. Split by purpose: the skill teaches writing a story, the workflow teaches running the tool and
   debugging a story that will not mount.
3. State what the checks prove and what they do not, plainly.

## The One Judgement In This Task

The two documents overlapped heavily before, both listing commands, both describing the layout, and
neither covering what a reader actually needed. The temptation was to keep that shape and correct the
facts.

They are split by reader instead. Someone about to write a story loads the skill and needs
conventions, the two story kinds and the rules that are rules rather than taste. Someone whose story
will not mount opens the workflow and needs symptoms and causes. Each document points at the other
once, and neither repeats it.

The debugging section is the part that would have been lost by correcting rather than rewriting. Every
entry in it is a failure this corpus actually hit, with the cause and the fix, and most of them are
invisible from a container's render body: two copies of webpack, an ESM-only package, a jsdom global,
a page mounted outside the shell the router puts it in.

## Acceptance Criteria

- Neither document references `storiesOf`, knobs or `@dump247/storybook-state` except to say they are
  gone.
- The directory layout matches the repository, including the screen story tree and where fixture data
  lives.
- A reader can write both a component story and a screen story from these two documents alone.
- The skill names the `eslint-plugin-storybook` rules that enforce it.
- Neither document claims an automated render check exists where it does not.

## Verification Plan

- A grep for the removed APIs across both files.
- The `docs` Nix check, which asserts that links resolve and that scripts named in instructions exist.
- An editor pass against the acceptance bar, specifically asking where a reader would get stuck.

## Corrections To The Task Graph

1. `task-060.implementationNotes` asks to "record the `useArgs` exception rule from `task-026` and
   `task-033`". Recorded as a rule, without the task numbers: a reader of the skill cannot resolve
   them, and the rule stands on its own. The exception list is empty in this corpus, which the skill
   says, so that a contributor reaching for `useState` knows they are the first.
2. The same notes ask the skill to cross-reference the rule set "so a lint failure has somewhere to
   point". Done as a table of the enabled rules and why each is on, including the two the plugin's
   recommended config does not place correctly here.
3. `task-060.acceptance` requires that neither document claims an automated render check exists. Both
   go further and say what does exist, which is a render check for the screen stories and none for the
   component stories, because a reader who knows only that something is missing cannot tell which half
   they are in.

## Required Docs, Research, and Tracking Updates

- Set `task-060.status` to `completed`.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-060-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-060-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

Both documents rewritten. The skill covers the stack, the layout, writing a component story, writing a
screen story, the toolbar, the sidebar, what the checks prove and the lint rules that enforce it. The
workflow covers commands, layout, the toolbar, seven named failure modes with their causes, what the
checks prove, and how to add a screen.

## Final Outcome

Complete.

## Self-Review

The old skill was 531 lines and the new one is shorter, which is the wrong measure to be pleased
about. The right one is that the old document's central instruction was false and the new document's
central instruction is the thing the lint rule enforces.

The part most likely to age badly is the debugging list in the workflow. It is a list of failures this
corpus hit, which means it is complete with respect to the past and says nothing about the next one.
It is worth appending to rather than trusting.
