# task-040 plan review

## Planner: Iteration 1

2026-09-15.

Wrote `task-040.md` after reading each of the eight containers' `render` methods, rather than taking
the store lists from the entry's roster.

Critique of iteration 1:

- The plan took the entry's instruction to delete `nodes/_utils/props.ts` and replace the About
  component story with the screen story. That would remove a registration from the 258-pair baseline,
  which is the invariant the phase has held since phase 3, and the props file is read by other stories
  in the panel. The screen story is additional; the component story stays.
- The plan put the screen stories in the existing `Settings` group, following the entry's acceptance
  wording. Five of the eight are not settings screens. A `Screens` top-level group keeps the two
  layers legible and leaves all 49 component panels untouched.
- The plan verified the tranche with `yarn storybook:build`. That is the thing `task-039` established
  is not evidence. Every story in the tranche is composed and mounted instead.
- Reading the containers first is what put `SplashNetworkPage`'s `global.isFlight` guard and
  `AssetSettingsDialogContainer`'s open-dialog guard in the plan rather than discovering them as
  failures.

Scope guard: no changes under `source/`; no component story removed; no request sweep.

Outcome: `approved`.
