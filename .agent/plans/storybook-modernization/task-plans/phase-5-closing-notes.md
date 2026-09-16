# Phase 5 closing notes

Status: complete. The window closed at `task-038`, on Storybook **9.1.20** rather than the 10.6.x the
phase was written for.

## What the window did

The corpus arrived at 9.1.20 unchanged: 258 sidebar registrations across 49 panels in 14 groups,
identical pair for pair to the baseline that has held since phase 3, with the story index format
moving from `v4` to `v5` underneath. Five toolbar globals, zero knobs, args audit at zero, legacy
decorator emit intact in 66 bundles. `compile`, `lint`, `storybook`, `jest` and `docs` green, and
`perSystem/checks.nix` untouched.

Two of the phase's four commits were reverted by the third. That is not waste; it is what measuring
the target rather than assuming it costs, and both left something behind.

## The version was chosen by five gates, not by number

The project owner's instruction was to take the highest version the repository can actually support
and keep CI green on. Four gates were given and a fifth emerged from measurement.

1. No TypeScript 5.0 syntax in the shipped declarations. `const` type parameters arrive at `10.5.0`.
2. No native module the Nix build cannot deliver. `oxc-resolver` arrives at `10.4.0`.
3. React 16.14.0 in the peer range. True across the whole 9 and 10 line.
4. No increase in reported vulnerabilities. Within one distinct advisory across all candidates.
5. **Importable from CommonJS TypeScript under TypeScript 4.9.5.** False for the entire 10 line.

Gate 5 is the one that decided it and the only one that is not a property of the package alone. It is
a property of the package and this repository's `tsconfig.json` together, which is why it could not be
read off the registry and did not appear until the type checker ran.

**A peer range is a claim, not a measurement.** `@storybook/react@10.6.0` advertises
`typescript: ">= 4.9.x"` and ships declarations TypeScript 4.9.5 cannot parse. Every boundary in the
table above was measured from the published tarballs for that reason.

## Two counts that lied, both toward the answer that was wanted

**The advisory path count.** `yarn audit` said 10.3.6 carried 1464 advisory paths against 8.6.18's
1438, with 90 critical against 68, which reads as a serious regression. Diffing the advisory sets
showed the 22 extra criticals were all `@babel/traverse` reached through `jest` and `stylelint`, and
that the vulnerable `7.17.10` is present in **all three** candidate trees. What differs is hoisting:
when the clean copy wins the top-level slot, the vulnerable one is nested and reachable by many more
distinct paths. Counted by distinct advisory, all three carry twelve critical and 125 high, and each
candidate adds exactly one advisory over staying put.

A path count measures how many ways a package can be reached. It is not a count of vulnerable code,
and comparing two trees by it compares their hoisting.

**Worth stating on its own, because the next person to run `yarn audit` on this tree will hit it.**
Yarn 1 hoists flat, so which copy of a duplicated package wins the top-level slot decides how many
distinct dependency paths reach every other copy. Change anything that shifts that competition — a
version bump, a new dependency, a resolution — and the path count moves without a single line of
vulnerable code being added or removed.

The worked example: `@babel/traverse@7.17.10` is vulnerable and is installed in all three candidate
trees. At 8.6.18 it wins the top-level slot, and `yarn audit` reports comparatively few paths through
it. At 10.3.6 the clean `7.29.8` wins instead and `7.17.10` is nested under `@babel/core`,
`@babel/helpers`, `@babel/helper-module-transforms` and `jest-snapshot`, where `jest` and `stylelint`
reach it by twenty-two more distinct routes. Read as a path count that is a serious regression. Read
as distinct advisories it is no change at all, and the tree with *more* reported paths is the one
where the clean copy is hoisted.

**Compare trees by distinct advisory id, never by path count.** And do not attribute advisories by
filtering paths for the package you are changing: doing that here hid the twenty-two entirely, because
none of those paths contains a Storybook package.

**The `exports` map.** `storybook@9.1.20` publishes a `require` condition for every subpath, pointing
at a real `.cjs` file, which reads as "CommonJS consumers are supported". It is not enough: both
conditions share **one** `types` entry, that entry is an ESM declaration, and TypeScript takes its
verdict from the types. 102 × `TS1479` either way. Reading the map predicted the opposite of what the
compiler did.

## The tenth instance, and a fourth catching question

The phase 3 notes list six occasions on which an instrument reported on something other than what it
appeared to measure; phase 4 added three, with a third catching question. This phase adds a tenth, and
it is the one that needed a new question.

`task-035` moved `moduleResolution` from `node` to `node16`. `yarn compile` reported **zero errors
before and zero errors after**. Against a ten-hour estimate on a task the graph calls a kill
criterion, zero is the tell.

Counting the type-checked program rather than the errors:

```
tsc --noEmit --listFiles | wc -l
  node    3170
  node16  3120
```

Fifty declaration files had left the program silently. `@faker-js/faker` declares no `types` condition
in its `exports` map, so `node16` bypassed the `typesVersions` fallback that had been supplying its
declarations, and the package became `any` across five files — two of them the fixture generators most
of the corpus is built on. Confirmed by behaviour: a probe calling a member faker does not have errors
under `node` and is silent under `node16`.

`skipLibCheck: true` and `noImplicitAny: false` together make this class of failure unreportable. A
module that cannot be resolved at all still gives `TS2307`; a module that resolves to untyped
JavaScript gives nothing.

This fails all three existing catching questions in a new way. The instrument was the right
instrument, run on the right thing, and reporting truthfully. It simply had nothing to say about what
changed.

**What would this instrument report if the thing I am changing had broken?**

For an error count over a checker configured this permissively, the answer is zero — which means the
error count is not evidence. The four questions now are:

1. What would this instrument report if the work had not been done?
2. Is the thing being measured the thing that has authority?
3. Is the thing reporting the status the thing that did the work?
4. What would this instrument report if the thing I am changing had broken?

The faker case is written up at `.agent/findings/07-a-lost-type-entry-is-silent.md`, with the file-set
diff as the measurement to use for any future resolution change. That finding is what `task-035` was
worth; the setting it introduced was reverted, because it is correct for a version this repository
cannot take.

## Two reverted commits, and what survived them

`task-035` moved resolution to `node16` because Storybook 10 removed the `typesVersions` fields
classic resolution depends on. 9.1.20 still has them, and `node16` is what produces all 102 `TS1479`
errors against it. Reverted. The finding survives.

`task-036` made the main config an ES module, which required renaming it `main.mts` so TypeScript
would accept `import.meta`. That rename only means anything under `node16`: with classic resolution
TypeScript does not treat `.mts` as ESM and `import.meta` fails with `TS1470` instead. Splitting the
settings was tried and fails the same way. Storybook 9.1.20 loads a CommonJS main config with an
ambient `require` without complaint, and its own `fix-faux-esm-require` automigration reports nothing
applicable. Reverted, keeping only the reduced addons array.

Two measurements from `task-036` are not version-specific and are worth carrying. Storybook's config
loader transpiles the main config to CommonJS with esbuild, which **shims `import.meta.url` and
rejects top-level `await`**, so the file is ESM to the type checker and CommonJS to the loader and
neither tool's opinion can be inferred from the other's. And a decorator setting is verified from the
emitted helper in `dist/storybook`, not by reading the config back: `legacyDecorator` and TC39 produce
differently named helpers, so one grep distinguishes present from in effect.

## The migration tooling

Three things hold whichever version is chosen, and all three were found by running the tools rather
than reading about them.

**The CLI that runs automigrations is not installed, and the dispatcher fetches it.** From 9, the
`storybook` binary runs only `dev`, `build`, `index` and a few others locally; everything else is
delegated to `@storybook/cli`, and when that is absent the dispatcher downloads and executes it. The
first attempt **exited 0 with no output at all**, which reads as a clean no-op. Installing
`@storybook/cli` as a temporary devDependency is how to honour locked decision 12 rather than invert
it.

**The CLI cannot find a `.mts` config.** `Could not determine main config path`, while the builder
reads the same file without difficulty.

**`consolidated-imports` reports "No migrations were applicable to your project" when it cannot see
the problem.** Run after the old packages are removed from the manifest, which is the order the task
graph implies, it says exactly that while every import still points at packages that no longer exist.
Run with them restored it finds the migration. It still never rewrote the 63 `@storybook/addon-actions`
imports in any configuration tried, although its own mapping table contains the mapping. Those were
done by hand against that table.

## Corrections to the task graph

Ten across the four entries, on top of the thirty-three carried in. The load-bearing ones:

- `task-035`'s note says the 9.1.x fallback means "the rest of this phase changes only in which
  version number it writes". It means considerably more: 9.1.x needs classic resolution, so
  `task-035` and `task-036` are both reverted rather than retained with a different number.
- `task-036`'s notes direct the work to the `fix-faux-esm-require` automigration. It does not exist at
  8.6.18; all four named automigrations ship with the 9 and 10 CLI.
- `task-037` names 10.6.x throughout. The whole 10 line is unreachable on TypeScript 4.9.5.
- `task-038` says to walk 15 sidebar groups. There are 14, which is what `task-023` measured in phase
  3 after the phase 1 deletions emptied one.

## What is left behind deliberately

- `moduleResolution: "bundler"` is the setting that actually fits a webpack-bundled tree, and it needs
  TypeScript 5.0. That upgrade is out of this epic's scope and is where finding 07 is waiting.
- 10.x remains out of reach until that upgrade lands, and then needs the `oxc-resolver` native-artifact
  question answered in the Nix pipeline as well.
- `storybook>@vitest/mocker`, one moderate advisory, is the whole of what 9.1.20 adds to the
  vulnerability surface over 8.6.18. Recorded rather than resolved.
