# task-048 plan review

## Planner: Iteration 1

2026-09-15.

Wrote `task-048.md` after reading the four container render bodies and the stores they reach.

Critique of iteration 1:

- The plan built a short sidebar category list because only one entry needed to be active. The sidebar
  renders one button per entry and marks one by route, so a shortened list is a different application
  rather than a simpler fixture. The real list instead.
- The plan gave the top bar a story with a wallet open and expected a title. The title is gated on the
  route matching a wallet page as well as on a wallet being active, so the story had to be somewhere
  specific rather than merely have one selected.
- The plan worked around `StoryProvider` losing the active wallet by naming it in the story. That
  leaves the same trap for every screen after this one, and the trap produces a plausible screen rather
  than a failure. Fixed in the provider.
- The plan intended to reconcile `StoryLayout` with `MainLayout` as the entry suggests. They look alike
  and are not: one is the component corpus's frame built from story props, the other is the
  application's shell built from stores. Deferred with the reason stated.

Scope guard: no changes under `source/`, no screens outside the roster.

Outcome: `approved`.
