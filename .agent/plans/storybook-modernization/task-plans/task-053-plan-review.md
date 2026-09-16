# task-053 plan review

## Planner: Iteration 1

2026-09-15.

Wrote `task-053.md` after reading `StakingStore` and the six containers that read it.

Critique of iteration 1:

- The plan sliced the pool sample to a handful of entries for speed. The list virtualises, so a short
  list exercises none of what the screen does and every screenshot would be of a screen no user has.
- The plan built `recentStakePools` as its own array. The real getter is a subset of the same data, and
  two independent lists let a story show a recent pool that is absent from the full one.
- The plan wrote reward rows with invented wallet names. The real getter derives them from the wallets
  store, so a fixture with its own names shows wallets that exist nowhere else in the workbench.
- The plan copied `stakePoolsListViewTooltipVisible: true` from the store. It anchors a tooltip to a
  ref filled in after mount and measured against the document, which jsdom has no layout for.

Scope guard: no story files, no changes under `source/`.

Outcome: `approved`.
