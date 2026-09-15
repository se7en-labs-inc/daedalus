# task-039 plan review

## Planner: Iteration 1

2026-09-15.

Wrote `task-039.md` from the task entry and from reading `stores/index.ts`, `stores/lib/Store.ts` and
the four dominant stores' declarations.

Critique of iteration 1:

- The plan's verification was `yarn storybook:build`. That is not evidence for the criterion the entry
  actually states, which is that a screen container renders. Locked decision 7 says as much and phase
  3 found thirteen stories that built, indexed and rendered nothing. Replaced with a jest spec that
  mounts the real container through the real Provider, which required adding `storybook` to
  `jest.config.js`'s `roots` and is the single highest-leverage change available to phases 6 and 7.
- The plan built the defaults from the usage counts in the task entry. Those counts are not
  reproducible: the direct `stores.<name>.<field>` form is far less common in the containers than
  destructuring, so a grep does not return 35 and 23. Built from what each store declares instead,
  which does not depend on the counts being right.
- The plan had `networkStatus` in scope, following this entry, while `task-041` claims it. Split
  explicitly rather than done twice.
- The plan replaced `StoryProvider`'s three existing fixtures with the defaults. That would have
  changed `wallets.active` from the selected wallet to `null` and broken the component-level corpus.
  Merged beneath them instead.

Scope guard: no screen story files, no request sweep, no `networkStatus` fill.

Outcome: `approved`.
