# task-043 plan review

## Planner: Iteration 1

2026-09-15.

Wrote `task-043.md` after reading `BackendStore` and all five containers that read it.

Critique of iteration 1:

- The plan treated `loadingPhase` as a field, the way every other computed getter in the harness is
  treated. It is read alongside the observables it derives from, by two different containers in the
  same render tree, so a field would let a story describe a state the store cannot reach. Presets
  instead, each carrying cause and effect together.
- The plan defaulted the store to its declared initial values, which is `hasChain: null` and therefore
  `loadingPhase: 'starting'`. Every screen that reads `backend` would have opened on the half-second
  state. Settled instead, matching the `networkStatus` decision and for the same reason.
- The plan stopped at the backend store because that is what the entry is titled. Tranche 3's
  `SyncingConnectingPage` is the default branch of `LoadingPage` and reads two fields from stores the
  next task owns, so the entry's own acceptance criterion is unreachable without them.
- The plan intended to reuse the existing Mithril progress fixtures wholesale. They are the view's
  step list, not the store's byte counters. Reused where the shapes agree, written where they do not,
  with that said rather than silently substituted.

Scope guard: no story files, no changes under `source/`.

Outcome: `approved`.
