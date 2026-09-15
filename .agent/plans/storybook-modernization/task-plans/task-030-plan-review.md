# task-030 plan review

## Planner: Iteration 1

2026-09-15.

Wrote `task-030.md` from the census and from reading every hoist and relocation in the tranche before
planning around them, because a hoist is the one thing in this phase that can stop the work.

Critique of iteration 1:

- The plan repeated `task-030.implementationNotes`, which predicts this tranche will overrun "because
  its knobs are concentrated in mapped lists over wallet and token arrays". Reading the eight hoists
  shows none is a knob in a loop: four sit in single-call closures, two inside `isDialogOpen` and two
  inside `countdownFn`, and the four inside a `.map()` are guarded by `index === 0`, so the map reads
  them once. Every one converts to a value read outside the closure. Recorded as a correction.
- The plan treated `transactions/TransactionsList.stories.tsx` as an ordinary file. Its knob is in the
  decorator, not in a story, and its stories read what the wrapper injects by calling
  `getStory({ ... })`, which is the second render argument. Scoped explicitly: the arg goes on the meta
  and the decorator reads the context.
- Two line counts in the task entry are wrong and one path no longer exists. Recorded rather than
  carried.

Scope guard: no `@ts-ignore` removed unless the knob was its only subject; nothing under
`storybook/stories/_support/`; no story export, `name` or panel title changes.

Outcome: `approved`.
