# task-045 plan review

## Planner: Iteration 1

2026-09-15.

Wrote `task-045.md` after constructing a `NewsCollection` from the existing fixtures and counting what
came out.

Critique of iteration 1:

- The plan wrote `newsFeedData` as a plain object carrying `all`, `unread`, `incident` and `alerts`.
  That is a second copy of the grouping rules in `NewsCollection`, and it would have passed while the
  real collection discarded the same items.
- The plan reused the existing news fixtures as the entry instructs, without checking whether they
  produce anything. They do not, and had they been carried into the harness every screen story built
  on them would have shown an empty feed and looked correct doing it.
- The plan treated the placeholder version string in the story environment as cosmetic. It is an input
  to a semver test in the feed filter, and it drops news items on its own, independently of the
  platform field.
- The plan asserted the fixtures' contents. Contents are what goes in; the filter decides what comes
  out, and only the second is evidence.

Scope guard: no story files, no changes under `source/`.

Outcome: `approved`.
