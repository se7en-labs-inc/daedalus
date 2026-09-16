# task-052 plan review

## Planner: Iteration 1

2026-09-15.

Wrote `task-052.md` after reading all nine container render bodies.

Critique of iteration 1:

- The plan wrote each screen's stories against the route, following the shape of the chrome tranche.
  Five of these nine branch on the wallet rather than the route, and a story that changes the path
  without changing the wallet renders the same screen twice under two names.
- The plan intended to cover the dialog branches of the add and settings screens. The roster says the
  dialog containers are exercised through the parent, and each opens a container tree of its own; the
  bare screens and the wallet-kind branches are what this tranche is for.
- The plan mapped `@trezor/connect` to a stub when the receive screen would not import. That leaves
  the screen mounting something other than itself. Both underlying causes are test-environment gaps
  and are fixed as such.
- The plan added the missing store members one at a time as renders failed. Four of the six are
  methods, which throw rather than read `undefined`, so each one costs a failed render and a stack
  naming a component rather than a field. Read from the containers first instead.

Scope guard: no changes under `source/`, no screens outside the roster.

Outcome: `approved`.
