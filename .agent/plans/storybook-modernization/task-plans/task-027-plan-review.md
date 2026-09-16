# task-027 plan review

## Planner: Iteration 1

2026-09-15.

Wrote `task-027.md` against the tree rather than against the task entry, and against the state the
tree was already in: 23 of this tranche's call sites had been converted and left uncommitted, across
`navigation/Sidebar.stories.tsx`, the four `news/` files and `_support/profileSettings.ts`, with a new
`_support/argTypes.ts` untracked beside them.

That work was assessed before anything was planned around it. It converts what it touches correctly,
it removes the two module-scope knobs from `profileSettings.ts` that nothing imported, and the corpus
measures at exactly the 337 sites the epic was last reported at, so the numbers in hand describe the
tree including it. It is kept.

Three things in it were changed. The `AlertsOverlay` decorator had stopped using its `context`
parameter when `withKnobs` came out of it and still declared it. `argTypes.ts` was untracked, which
Nix does not see, so nothing that imported it could have passed a check. And its options-object
helper covers primitives only, which the largest file in the tranche needs more than.

Critique of iteration 1:

- The plan asserted the tranche's call-site counts from the task entry. Replaced with a census
  reading per file, which is what found that `navigation/SidebarWalletsMenu.stories.tsx` has no knob
  at all and carries only the decorator entry.
- The plan repeated `task-027.implementationNotes` on nested knobs. The census puts both remaining
  `callback` hoists outside these six roots, so there is no hoist here. Recorded as a correction
  rather than carried.
- The plan had no statement of what the acceptance criterion about the running workbench would be
  measured with. Checking produced the finding that no controls addon exists in the manifest, in
  `storybook/main.ts`, or inside `@storybook/core` 8.6.18, so that criterion cannot be met at this
  commit by anything this task does. Recorded as correction 5, with `task-034` named as its home.

Scope guard: no story export, `name` or panel title changes; no `withState` outside the three files
that carry both; no manifest change.

Outcome: `approved`.
