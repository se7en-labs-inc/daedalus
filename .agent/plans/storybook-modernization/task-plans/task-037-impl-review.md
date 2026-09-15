# task-037 implementation review

## Implementation: Iteration 1

2026-09-15.

Bumped to 10.6.0, reduced the addons array, ran the four automigrations, rewrote 72 imports, gated the
manifest, and built.

Outcome: `yarn storybook:build` passed at 10.6.0 and the corpus came through intact: 258 stories
across 49 panels, identical pair for pair, with the index format moving v4 to v5. `lint` passed.
`compile` and the Nix `storybook` check both failed.

## Review: Iteration 1

Summary: the bump is correct and the repository cannot take it. Two blockers, neither caused by this
epic, both measured rather than inferred.

`compile` fails on a syntax error inside Storybook's own declarations. The instinct is to reach for
`skipLibCheck`, which is already on and cannot help, because it skips checking and not parsing. The
syntax is `const` type parameters, 49 of them in one chunk, and they are TypeScript 5.0. The package
advertises `typescript: ">= 4.9.x"`, so the peer range is wrong about its own contents and following
it is what led here.

The Nix `storybook` check fails on a missing native binary. Worth separating from a lockfile problem,
because it looks exactly like one: all nineteen platform bindings are in `yarn.lock`, the
`node_modules` gate is green, and the binding package is present in the Nix store. What is absent is
the 2.3 MB `.node` file inside it, which a local install has. So the gate passed and the artifact it
produced was incomplete, which is the ninth catching question again: the thing reporting the status
was not the thing that had to work.

Three things about the automigrations are worth keeping regardless of which version is chosen, and
are recorded in the task entry: the CLI is fetched remotely unless installed, it cannot see a `.mts`
config, and `consolidated-imports` says "No migrations were applicable" when the packages it keys on
have already been removed. That last one is the dangerous one, because the entry's own ordering
produces it.

Reverted in full rather than committed. A red bump on the branch would have been worse than no bump,
and every measurement worth keeping is in the entry.

Decision: `blocked`, pending the owner's decision on the 9.1.x fallback.
