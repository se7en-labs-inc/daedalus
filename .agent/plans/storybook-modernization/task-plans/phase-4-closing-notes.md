# Phase 4 closing notes

Status: complete. The window closed at `task-034`.

## What the window did

404 knob call sites at the start, zero at the end. 17 story-state call sites at the start, zero at
the end, none of which took the `useState` exception. 258 sidebar registrations across 49 panels
before the phase and the same 258 after, pair for pair, measured from `index.json` of a real build
after every one of the nine tasks. The args audit sat at zero findings throughout. `compile`, `lint`
and `storybook` green after every task; `jest` and `docs` green at the two tasks that could plausibly
have moved them.

The corpus went from a workbench with a knobs panel to one with a controls panel, five toolbar
globals, and args that survive a URL share.

## The count that was wrong from the start

The phase opened believing its surface was 360 call sites, and reported 337 by `task-027`. Both
figures were low by 44.

`loading/_support/loadingKnobs.ts` was five one-line functions wrapping `boolean`, `number`, `radios`,
`select` and `text` to attach a shared group id. The census matched only the addon's own export names
and skipped any file whose text did not contain `@storybook/addon-knobs`, so it counted the five
definitions and none of the 44 call sites across the seven story files that used them.

The tell was there to be read: five call sites in a file that exists to be called from elsewhere is
not a number anyone should have believed. What caught it was reading the file the number came from
rather than the number.

The corrected split for the phase is 390 renames, 10 hoists and 4 relocations.

## The recurring defect, continued

The phase 3 notes listed six occasions on which an instrument reported on something other than what
it appeared to measure. Three more, which makes nine.

7. **The census could not see a knob reached through a wrapper.** Above. A scan keyed on an import
   name cannot see an indirection, and a corpus with shared helpers in it will have indirections.
8. **`mapping` was present on the context and not applied to the args.** Storybook's documented
   answer for non-primitive `select` options is `argTypes.mapping`. Composing a story through
   `@storybook/react` with it set hands the render the label, while
   `context.argTypes.<name>.mapping` sits on the same context holding the map. Whether the preview's
   own render loop differs cannot be settled without a browser. The instrument could not show the
   mechanism working, so the mechanism was not used: the arg holds the label and the story resolves
   it, which gives the same value under either answer and can be read off the page.
9. **`nix build … | tail` reports `tail`'s exit code.** The first reading of the compile check in
   this phase was `0` from a pipeline whose left-hand side had not been consulted. Every check after
   it captured the status before the pipe.

The two questions from the phase 3 notes caught 7 and 8. Neither catches 9, so here is a third:
**is the thing reporting the status the thing that did the work?** A pipeline, a wrapper script and a
test runner that swallows a non-zero child all fail it.

## Five suppressed arguments in the wrong position

Each of these is a `@ts-ignore` sitting over a call whose arguments do not line up with its
signature, so the value the control produced was not the value written beside it. All five predate the
phase and all five were invisible for the same reason.

- `wallets/settings/_support/WalletSettingsScreen.tsx` passes a group id where `number`'s options
  argument belongs, twice, so neither wallet-deletion countdown was ever in the group its label
  claims.
- The same file passes an option's *label* where a `select`'s default *value* belongs, so the
  active-dialog control's default was a string the comparisons it feeds can never match.
- `_support/StoryLayout.tsx` passes an option *object* where a `select`'s default value belongs, so
  the number-format lookup returned nothing and every story opened on the default format however the
  control was set.
- `_support/StoryLayout.tsx` and `nodes/environment/TopBarEnvironment.stories.tsx` both pass
  `isAlonzoActivated` to a component that declares no such prop.

The pattern: a suppression written to silence one complaint goes on silencing the next one, and the
next one is in a different place. When a conversion changes a value's type, the error that was
suppressed moves to the next property that does not fit, and the suppression left behind is dead and
invisible. Three suppressions in `staking/_support/RedeemItnWallets.tsx` had to be moved for exactly
this reason, and two of them moved onto properties that had never been suppressed before.

**Carrying a suppression across a conversion is not the same as leaving it where it was written.**

## One label is one control

`@storybook/addon-knobs` keys a control on its group id and its label together, and registering a
second knob under a key already in the store returns the value already there and discards the new
default, silently.

Three shipped stories have been showing a value their source does not state because of it, and two
controls in a fourth never appeared at all because their calls sit inside a submission callback that
nothing had run. Written up in `.agent/findings/05-one-knob-label-is-one-control.md` rather than
fixed, because fixing any of them changes what a story renders and the phase had an invariant against
that.

Two apparent collisions in the same sweep were not defects, and telling them apart is the reason that
is a finding rather than a bug list: because the key is group *plus* label, two knobs sharing a label
in *different* groups are two controls and behave as written.

## What the reach problem taught

Five of the last eight call sites were in two shared wrappers rather than in any story, so their
controls appeared on every story the wrapper reached. An arg cannot have that reach, because args are
declared per story or per meta.

The answer was not one thing. Checked against the component that consumes each flag, the five split
four ways: two are cross-cutting display settings and became toolbar globals, one is a domain
precondition and stayed an arg declared on every meta that can show it, and two were dead and were
deleted. Two of the five are named after something other than what they do, which is why each had to
be read rather than sorted by name.

The mechanism worth keeping: neither promoted global's consumer is a story or a decorator, so neither
has a story context to read a global from. Threading a prop would have touched 27 files with no
opinion about either value. Publishing both on a context once above every story touched four. **When
a value has to cross a boundary that nothing on the boundary cares about, move the boundary rather
than the value.**

## A criterion that could not be met, and then could

Every tranche task in this phase carried the acceptance criterion that a converted control still
changes the component in the running workbench. For eight of the nine tasks it was unmeetable, and not
because of anything the conversion did: there was no controls panel. `addon-controls` is a separate
package at Storybook 8 and folds into core only at 9, and nobody had ever added it. The knobs panel
emptied as each tranche landed and nothing replaced it.

`task-064` added it, which makes the criterion meetable rather than met. The split is worth restating,
because it is the same wall locked decision 7 named:

- Measurable here: the addon resolves, the build loads it, it registers a panel, args reach a render
  function, a story's args override the meta's, and writing an arg reaches Storybook's channel.
- Not measurable here: that the panel renders a control for a given argType, and that moving a control
  repaints the story. The portable-stories harness runs no preview, so nothing listens for
  `updateStoryArgs` and no setter repaints.

State it that way rather than reporting the criterion met.

## The one deliberate rendering change

The phase held an invariant that no story renders differently, and broke it once. Dropping
`hasTadaIcon` removes the Alonzo celebration sparkle from the stories that showed it.

They now look like the application. `IS_TADA_ICON_AVAILABLE` is `false` at
`source/renderer/app/config/topBarConfig.ts:1`, so the state the stories were showing is one no user
can reach on any network, and the stories had it fixed on `true` because four call sites shared a
label and the first registration won. Keeping the control would have preserved a picture of something
that cannot happen. The dead source behind it is written up in
`.agent/findings/06-alonzo-celebration-is-unreachable.md` and left in place.

## Corrections to the task graph

Fourteen across nine entries in this phase, on top of the nineteen carried in. The recurring kinds:
line counts and paths that `task-062` changed in phase 1, story counts stated as knob counts, and
predictions about where the work would be hard that the census contradicted. `task-030`'s entry
predicted the wallets tranche would overrun on knobs in mapped lists; the eight hoists there were all
single-call closures and the real cost was four label collisions, which no instrument reports.

The habit that produced the corrections is cheap: re-read the task entry's factual claims against the
tree before planning around them, and record the difference in the entry rather than only in the plan.

## What is left behind deliberately

- `.agent/workflows/storybook.md` and `.agent/skills/storybook-creation/SKILL.md` still teach
  `storiesOf`, `withKnobs` and `@dump247/storybook-state`. `task-060` owns both and rewrites them at
  the end of the epic. The `docs` check passes, so nothing mechanical is broken by the gap.
- `@storybook/addon-controls` is a dependency that exists only until the version bump. `task-037`
  drops it when controls folds into core.
- The `useState` exception list in `task-033` is empty, written out with its reasoning rather than as
  a count, so the next person converting a stateful story sees what was weighed and rejected.
