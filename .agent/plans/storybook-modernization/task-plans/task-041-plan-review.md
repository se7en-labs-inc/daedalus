# task-041 plan review

## Planner: Iteration 1

2026-09-15.

Wrote `task-041.md` after sweeping the containers for request reads rather than after reading the
entry's estimate.

Critique of iteration 1:

- The plan followed the entry's "roughly a dozen screens" and its two named readers, and would have
  added fields as failures appeared. The sweep returns 36 distinct request names, 30 of them store
  fields across 9 stores. Adding those by failure is six tranches each paying part of the same cost,
  which is exactly what the entry's note says this task exists to avoid.
- The plan copied `NetworkStatusStore`'s observable initialisers. Those describe a store that has just
  been constructed: disconnected, unsynced, never connected. Twenty of the 48 screens read this store,
  so that default shows twenty screens a loading shell. Settled state instead, recorded as the one
  deliberate departure from the real store's values.
- The plan asserted the request contract in prose. Moved into the spec, including that two calls
  produce distinct objects, because a shared request between stories is the kind of thing that only
  shows up as one story mysteriously affecting another.

Scope guard: no story files, no changes under `source/`.

Outcome: `approved`.
