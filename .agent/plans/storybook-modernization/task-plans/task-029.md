# Task task-029: Convert knobs in the settings and profile tranche

## Task ID and Title

- ID: `task-029`
- Title: `Convert knobs in the settings and profile tranche`

## Why Chosen Now

`task-029.dependencies` is `[task-026]`, complete. `task-027` and `task-028` closed the tranches
before it.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- Every knob under `storybook/stories/settings`, under
  `source/renderer/app/features/discreet-mode`, and in
  `source/renderer/app/components/profile/analytics/Analytics.stories.tsx`.
- The five `withState` sites in `settings/general/General.stories.tsx` and
  `settings/language/Language.stories.tsx`, and the shared helper in `settings/utils/helpers.tsx`
  that takes a store.

## Non-Goals

- `storybook/stories/_support/DiscreetModeToggleKnob.ts` and `storybook/stories/_support/StoryLayout.tsx`.
  Neither is under this task's `targetPaths` and neither can be converted inside a tranche. See the
  correction below.
- No manifest change, no change to any story export, `name` or panel title.

## Dependencies

- `task-026`, complete. `task-016`, whose toolbar write-back lives in this tranche.

## Research Consulted

- `.agent/plans/storybook-modernization/task-plans/knob-conversion-patterns.md`
- `.agent/plans/storybook-modernization/task-plans/task-027.md`, `task-028.md`
- `.agent/plans/storybook-modernization/storybook-modernization-tasks.json`, `task-029`, `task-033`

## Docs, Workflows, and Skills Consulted

- Docs: `AGENTS.md`, `CLAUDE.md`

## Live Repo Findings Verified For Planning

Verified at `b706a815b`.

- Eight knob call sites across the three roots: six in `settings/general/General.stories.tsx`, two in
  `source/renderer/app/features/discreet-mode/ui/DiscreetValue.story.tsx`. Three further files carry
  only the `withKnobs` decorator entry.
- Five `withState` sites: three in `settings/general/General.stories.tsx` at lines 44, 53 and 129, two
  in `settings/language/Language.stories.tsx` at lines 13 and 28.
- `settings/utils/helpers.tsx:23` exports `onLocaleValueChange`, which takes a
  `Store<LocaleStoryStore>` and calls `store.set` twice for one change. Both `withState` files use it.
- The toolbar write-back from `task-016` is `General.stories.tsx:88`, the `Themes` story. It uses
  `useGlobals` and holds no knob and no state, so nothing in this task touches it.
- `storybook/stories/_support/DiscreetModeToggleKnob.ts` holds one knob and is rendered by
  `storybook/stories/_support/StoryProvider.tsx:282`, so its control appears on every story that
  wrapper reaches. `storybook/stories/_support/StoryLayout.tsx` holds seven, reached by six wrappers
  across five panels.

## Files Expected To Change

- `storybook/stories/settings/general/General.stories.tsx`
- `storybook/stories/settings/language/Language.stories.tsx`
- `storybook/stories/settings/utils/helpers.tsx`
- `storybook/stories/settings/utils/SettingsWrapper.tsx`
- `source/renderer/app/features/discreet-mode/ui/DiscreetValue.story.tsx`
- `source/renderer/app/features/discreet-mode/ui/discreet-toggle/DiscreetModeToggle.story.tsx`
- `source/renderer/app/components/profile/analytics/Analytics.stories.tsx`

## Implementation Approach

1. Change `onLocaleValueChange` to take the updater rather than a store, and to compute one patch
   rather than set twice, since two `updateArgs` calls for one change would render twice.
2. Convert the five `withState` sites to `useArgs`.
3. Convert the eight knob call sites, camel-casing the one label that is not an identifier.
4. Drop the `withKnobs` decorator entries and imports from the three files that carry only those.
5. Re-run the census, the args audit and the label diff, then the three Nix checks.

## Acceptance Criteria

- No knob import remains under the three roots.
- The `Themes` story still writes the toolbar selection through `useGlobals`.
- `story-args-audit.js` stays at zero findings.
- The label set is identical, pair for pair.
- `compile`, `lint` and `storybook` pass as Nix derivations.

## Verification Plan

- Census per file over the three roots, expecting 8 before and 0 after.
- `story-args-audit.js`, with every count move accounted for.
- `index.json` label set diffed in both directions.
- `nix build '.#checks.x86_64-linux.{compile,lint,storybook}' --no-link`.
- Read `General.stories.tsx`'s `Themes` story after the change and confirm the `useGlobals` write-back
  is byte-identical.

## Risks and Open Questions

- `currencySelected` is an object held in story state. It becomes an object arg rather than being
  reduced to a code, because the component reads the whole record and the list it is selected from is
  keyed by code, so the id is already recoverable from the value.

## Required Docs, Research, and Tracking Updates

- Set `task-029.status` to `completed`.

## Corrections To The Task Graph

1. `task-029.implementationNotes` says `storybook/stories/_support/DiscreetModeToggleKnob.ts` "is a
   knob helper and goes with the last knob in this tranche". It cannot. `StoryProvider` renders it,
   so its control belongs to every story that wrapper reaches rather than to any tranche, and deleting
   it removes the discreet-mode toggle from all of them. The same holds for the seven knobs in
   `storybook/stories/_support/StoryLayout.tsx`, which no task owns at all. Both are cross-cutting and
   both need a decision rather than a tranche; see the open question below.

## Open Question For The Project Owner

Two shared wrappers register knobs that appear on every story they reach:
`_support/DiscreetModeToggleKnob.ts`, one control, rendered by `StoryProvider`; and
`_support/StoryLayout.tsx`, seven controls, reached through six wrappers. A knob there is a control on
roughly thirty panels at once, and an arg cannot be: args are declared per story or per meta, so
reproducing the reach means declaring them on every meta those wrappers touch.

The precedent for a value that applies across stories is `task-016`, which moved theme, locale and OS
out of an addon panel and into `globalTypes` as toolbar controls. Discreet mode and the top bar flags
have that shape. The alternative is to declare them per meta, which is roughly thirty edits and gives
each panel its own copy of the same control.

This changes the workbench's toolbar, so it is not a tranche decision. Named here rather than picked.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-029-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-029-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

Eight knob call sites removed and five `withState` sites converted to `useArgs`, none taking the
`useState` exception. The corpus goes from 237 to 229: 216 renames, 10 hoists, 3 relocations. No knob
import remains under any of the three roots.

`settings/utils/helpers.tsx` takes the arg updater rather than a store and computes one patch for a
locale change rather than setting twice, so one change is one repaint.

`settings/utils/SettingsWrapper.tsx` passed its story through `withKnobs` by hand rather than
declaring the decorator. It calls the story directly now.

The `task-016` toolbar write-back at `General.stories.tsx` is unchanged and still writes `themeName`
through `useGlobals`.

The label set is unchanged: 258 stories across 49 panels, identical pair for pair in both directions.

`story-args-audit.js` stays at zero findings. Renders reading the first argument went 50 to 54;
renders it cannot resolve went 8 to 5, which is the three `General` `withState` bindings.

`compile`, `lint` and `storybook` pass as Nix derivations.

## Final Outcome

Complete.

## Self-Review

The two shared wrappers are the part of this tranche that is not done, and the task entry said to
finish one of them. It was worth checking where it is used before deleting it: `StoryProvider` renders
it, so one knob there is a control on most of the corpus, and the entry's instruction would have
removed the discreet-mode toggle from every story that wrapper reaches. That is a toolbar-shaped value
and `task-016` already established where those live, but choosing that changes the workbench for
everyone, so it is named rather than picked.

The four compiler errors shared one cause. `withKnobs` accepted a story typed as a plain record and
called it anyway, and the local store carried the state's type where `useArgs` carries none. Both
intermediaries were absorbing a type that was already wrong, and taking them out is what showed it.
The Nix check found all four; nothing else did.
