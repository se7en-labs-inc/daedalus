# task-047 plan review

## Planner: Iteration 1

2026-09-15.

Wrote `task-047.md` after reading all three mechanisms a screen uses to find out where it is.

Critique of iteration 1:

- The plan wrote the router location as an ordinary store override and left react-router to the
  stories that needed it. Two independent statements of the same fact, with no check that could tell
  they had diverged, on screens where divergence renders rather than fails.
- The plan covered the two consumers the entry names and missed `AppStore.currentRoute`, which is
  computed from the router store and read by the top bar. Every screen would have had an empty
  `currentRoute` and looked fine.
- The plan gave the tracker the two methods the three named screens call. `AnalyticsTracker` declares
  four, and a stub that implements a subset is a trap for the next screen rather than a fixture.
- The plan followed `targetPaths` into `StoryProvider.tsx`, which would have put a router around all
  258 component stories to serve five screens.

Scope guard: no story files, no changes under `source/`.

Outcome: `approved`.
