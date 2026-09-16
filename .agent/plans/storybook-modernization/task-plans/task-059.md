# Task task-059: Add eslint-plugin-storybook

## Task ID and Title

- ID: `task-059`
- Title: `Add eslint-plugin-storybook`

## Why Chosen Now

`task-059` opens phase 8. The corpus is clean, so a rule that fails on the old APIs can go in without a
backlog of pre-existing failures to negotiate.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- The plugin, its recommended rules, and the one rule that catches the API this epic removed.

## Non-Goals

- Promoting the existing warnings to errors. That is a different piece of work and most of it is the
  same question as the accepted `@ts-ignore` debt.
- No change to `source/`.

## Dependencies

- Phase 7, complete.

## Live Repo Findings Verified For Planning

Verified at `97e8139e3`.

- `eslint-plugin-storybook@9.1.20` declares `eslint >= 8` and `storybook ^9.1.20`. This project has
  eslint 8.13.0 and storybook 9.1.20, so both peers are satisfied exactly.
- The plugin ships eslintrc-format configs as well as flat ones, and this project's `.eslintrc` is
  eslintrc format.
- **`storybook/no-stories-of` is in no shipped config.** It was written for the Storybook 7 migration
  and the shipped configs assume that migration is behind you. It is the rule this epic most needs,
  and it has to be enabled by name.
- The plugin's recommended config scopes `storybook/no-uninstalled-addons` to `.storybook/main.*`.
  This project's configuration is at `storybook/main.ts`, so the rule would never have fired.
- The recommended config turns `react/function-component-definition` off for story files, which the
  existing override in `.eslintrc` already does, but for a different extension list.
- `yarn lint` is a required check at `perSystem/checks.nix:55`.

## Files Expected To Change

- `package.json`, `yarn.lock`
- `.eslintrc`
- Two story files carrying a redundant name annotation

## Implementation Approach

1. Install at the version matching the workbench, and confirm the lockfile installs under Nix before
   anything else.
2. Extend from the recommended config, then add the two rules it does not place correctly.
3. Fix what the new rules report rather than leaving it as warnings.

## The One Judgement In This Task

The plugin's `storybook/csf-component` rule reports a story file that names no `component` property. It
is not in the recommended config; enabling it produced 117 warnings, one for essentially every
component story in the corpus.

Those 117 would not have been acted on. The meta objects in this corpus are built around `title`, the
screen stories mount containers rather than the component a reader is looking at, and a warning nobody
will action is a warning that teaches readers to scroll past the category it is in.

So it is not enabled. The rules that are enabled all report zero, and the two findings they did
produce, both `no-redundant-story-name`, are fixed rather than accepted. The plugin lands at exactly
the warning count that preceded it.

## Acceptance Criteria

- `yarn lint` passes with the plugin enabled.
- A story written against `storiesOf` fails lint.
- The warning count has not been promoted to errors.

## Verification Plan

- `lint`, `compile`, `jest` and `storybook` as Nix derivations, since the lockfile changed and all four
  build from it.
- `nix build .#internal.x86_64-linux.node_modules`, which installs under `--frozen-lockfile` and is
  the gate a lockfile edit has to pass first.
- A probe story written against `storiesOf`, linted directly.
- The warning count measured on both sides of the change.

## The measurement

| | value |
|---|---|
| eslint errors before | 0 |
| eslint errors after | 0 |
| eslint warnings before | 5,421 |
| eslint warnings after | 5,421 |
| new rules reporting | 2, both fixed |
| `storiesOf` probe | 2 errors, exit 1 |

The probe also tripped `storybook/no-renderer-packages`, which reports a direct import of
`@storybook/react` in a story file. Nothing in the corpus does that; `screens.spec.tsx` imports
`composeStories` from it, and a spec file is outside the rule's glob.

## Corrections To The Task Graph

1. `task-059.implementationNotes` says "the 457 existing warnings under `storybook/` stay warnings".
   The figure for the whole repository is 5,421, and it is the one `yarn lint` prints and the one a
   reader will compare against. Both numbers are unchanged by this task.
2. The same note suggests checking whether the recommended config covers what the existing story-file
   override gives up. It does, for `**/*.stories.*`, and not for `**/*.story.*`, which it matches with
   a different extension list. The override stays, with that said in place.
3. `task-059.implementationNotes` describes `story-args-audit.js` and suggests it could run as a check
   wherever the others do. Not done here: it lives under `.agent/`, which is excluded from the
   formatter and type checking, and promoting a script from there into the merge gate is a change to
   `perSystem/checks.nix` with its own review. Recorded as a follow-on at `task-061` instead.

## Required Docs, Research, and Tracking Updates

- Set `task-059.status` to `completed`.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-059-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-059-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

`eslint-plugin-storybook@9.1.20` installed, the recommended config extended, `no-stories-of` enabled by
name and `no-uninstalled-addons` pointed at the configuration file this project actually has.

`lint`, `compile`, `jest` and `storybook` pass as Nix derivations, and the node_modules derivation
builds under `--frozen-lockfile`.

## Final Outcome

Complete.

## Self-Review

The rule that matters was in none of the plugin's configs, which is the opposite of the assumption the
task was written on. Extending from `recommended` alone would have installed a plugin, passed the
check, and left the epic's central regression unguarded.

Declining `csf-component` is the other half of the same judgement. A lint rule that fires 117 times on
a clean corpus is not enforcing a convention, it is describing one the corpus does not hold, and
adding it would have made the warning list worse at the exact moment this epic was trying to make it
mean something.
