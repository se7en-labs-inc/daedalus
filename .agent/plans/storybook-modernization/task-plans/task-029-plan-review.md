# task-029 plan review

## Planner: Iteration 1

2026-09-15.

Wrote `task-029.md` from the census and from reading the five `withState` sites and the helper they
share.

Critique of iteration 1:

- The plan carried `task-029.implementationNotes` on deleting `_support/DiscreetModeToggleKnob.ts`
  with the tranche's last knob. Checking where it is used shows `StoryProvider` renders it, so its
  control is on every story that wrapper reaches. Deleting it removes the toggle from all of them, and
  an arg cannot take its place without declaring one on every meta those wrappers touch. Removed from
  scope and raised as an open question, with `_support/StoryLayout.tsx`, which has seven knobs and the
  same reach and which no task owns.
- The plan had `onLocaleValueChange` keeping its shape with a store swapped for an updater. It writes
  twice for one locale change, which is two repaints where there was one. Changed to compute one patch.
- The plan did not say how the `task-016` toolbar write-back would be protected. Added a step that
  reads it back after the change, since it sits in the same file as three of the conversions.

Scope guard: nothing under `storybook/stories/_support/`; no manifest change; no story export, `name`
or panel title changes.

Outcome: `approved`.
