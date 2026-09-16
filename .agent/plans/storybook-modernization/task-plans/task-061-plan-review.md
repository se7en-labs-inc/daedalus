# task-061 plan review

## Planner: Iteration 1

2026-09-16.

Wrote `task-061.md` after enumerating the check set from the flake and counting the tasks from the
graph.

Critique of iteration 1:

- The plan carried the four follow-on figures from the entry. All four are stale, and a follow-on
  list is exactly the document where a stale figure survives longest, because it is read by someone
  deciding whether to pick the work up and nobody re-derives it.
- The plan ran the checks in one `nix build` invocation with every derivation named. Running four
  concurrently exhausted a file descriptor limit inside SWC earlier in this phase and failed two spec
  files spuriously, which looks identical to a real failure. Serially instead.
- The plan rewrote the PRD's status line and left the log alone. The log is append-only by the plan's
  own rule, and a completion entry is exactly what it is for.
- The plan said "all 65 tasks". There are 63.

Scope guard: no new stories, no changes under `source/`.

Outcome: `approved`.
