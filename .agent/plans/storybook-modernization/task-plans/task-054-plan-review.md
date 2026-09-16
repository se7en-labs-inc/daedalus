# task-054 plan review

## Planner: Iteration 1

2026-09-15.

Wrote `task-054.md` after reading the six container render bodies.

Critique of iteration 1:

- The plan mounted each staking page bare, copying the wallet tranche. The router wraps all of them in
  a shell that provides a scroll context, and a control in the pool list dereferences it without a
  guard, so three of the six could not render. Mounted the way the router mounts them instead.
- The plan gave the staking shell three states from the entry. There is a fourth, and it is the
  exception that makes the first conditional rather than a flag: an open delegation dialog keeps the
  section rendering while the node is behind.
- The plan covered the delegation wizard from the delegation centre because it is named first. The
  pool list already carries the data the wizard shows.
- The plan copied the first-run tooltip state from the store, which cannot be shown without a layout
  engine. Handled in `task-053` with its reason.

Scope guard: no changes under `source/`, no screens outside the roster.

Outcome: `approved`.
