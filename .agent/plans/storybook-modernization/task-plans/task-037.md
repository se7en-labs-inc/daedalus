# Task task-037: Bump the manifest to 10.6.x and run the automigrations individually

## Task ID and Title

- ID: `task-037`
- Title: `Bump the manifest to 10.6.x and run the automigrations individually`

## Interaction Mode

- Mode: `agent_execution`.

## Build Status

`completed`

## Summary

**Landed on `9.1.20`.** It is the highest version of Storybook that this repository can type-check,
build and keep green, measured against five gates rather than chosen by version number.

Two earlier attempts were made and reverted: `10.6.0` and `10.3.6`. The reasons are recorded below so
that the next person to consider a bump does not repeat them.

Landing 9.1.20 also required reverting `task-035` and `task-036`. That is the most consequential
finding in this task and it is stated in full further down.

## The Gates, And Every Version Measured Against Them

Five gates. The first four were set by the project owner; the fifth emerged from measurement and is
the one that decided the outcome.

1. No TypeScript 5.0 syntax in the shipped declarations, since a TypeScript upgrade is out of scope.
2. No native module the Nix build cannot deliver.
3. React 16.14.0 within the peer range.
4. No increase in reported vulnerabilities relative to the alternatives.
5. **Importable from CommonJS TypeScript under TypeScript 4.9.5.** This is not a property of the
   package alone; it is a property of the package and this repository's `tsconfig.json` together.

| version | 1. TS5 syntax | 2. native module | 3. React 16 | 4. advisories | 5. CJS-importable |
|---|---|---|---|---|---|
| 8.6.18 (current) | none | none | yes | 258 distinct | yes |
| 9.1.20 | none | none | yes | 259 distinct | **yes, via `typesVersions`** |
| 10.0.0 – 10.3.6 | none | none | yes | 259 distinct | **no** |
| 10.4.0 – 10.4.6 | none | **`oxc-resolver`** | yes | not measured | no |
| 10.5.0 – 10.6.0 | **`<const>` params** | **`oxc-resolver`** | yes | not measured | no |

Each boundary was measured from the published tarballs, not from the peer ranges, because
`@storybook/react@10.6.0` advertises `typescript: ">= 4.9.x"` and ships declarations that TypeScript
4.9.5 cannot parse. **A peer range is a claim, not a measurement.**

- `oxc-resolver` first appears in `storybook@10.4.0` and is absent from every earlier version.
- `const` type parameters first appear at `10.5.0`: zero occurrences at `10.4.0`, 111 at `10.5.0`,
  42 at `10.5.9`, 50 at `10.6.0`.
- React 16.8 remains in the peer range across the whole 9 and 10 line.

## Gate 5, Which Decided It

Storybook 9 and 10 are ESM-typed packages: `storybook`'s own `package.json` declares
`"type": "module"`, so its declaration files are ESM declarations. This repository's sources are
CommonJS, because the root manifest declares no module type.

Under `moduleResolution: "node16"`, TypeScript models Node's runtime rules and refuses the import:
**102 × `TS1479`**, "The current file is a CommonJS module whose imports will produce 'require' calls;
however, the referenced file is an ECMAScript module". This happens at **9.1.20 and at 10.3.6 alike**.

It is worth being precise about why, because the `exports` map looks like it should save 9.1.20 and
does not. 9.1.20 publishes a `require` condition for each subpath, pointing at a real `.cjs` file, but
it publishes **one** `types` entry shared by both conditions, and that entry is an ESM declaration.
TypeScript takes its verdict from the types entry. A package can only be imported from CommonJS under
`node16` if it ships a separate `.d.cts`, and Storybook does not.

Under classic `moduleResolution: "node"`, which ignores `exports` entirely:

- **9.1.20 resolves**, through its `typesVersions` map, which contains explicit entries for `actions`,
  `preview-api`, `manager-api`, `theming`, `test` and forty more. Classic resolution reads that map
  and no ESM/CommonJS check applies, because classic resolution predates the distinction. Measured:
  the 102 errors go to zero.
- **10.x does not resolve at all.** The 10 line ships no `main`, no `types` and **no `typesVersions`**,
  so classic resolution has nothing to find.

So 10.x cannot be type-checked by TypeScript 4.9.5 under either mode: `node16` refuses it and classic
cannot find it. The setting that would work is `moduleResolution: "bundler"`, which is correct for a
webpack-bundled tree and requires TypeScript 5.0. That is the gate, and it is not about any Storybook
version's quality; it is about which TypeScript this repository is on.

The webpack build succeeds at every version tried, including 10.6.0. **Only the type checker
objects**, and it objects to something that cannot happen, because these files are bundled and never
executed by Node.

## Gate 4, And A Count That Lied

Measured with `yarn audit --json` against a resolved lockfile for each candidate.

The first reading compared **advisory paths** and said 10.3.6 was materially worse: 1464 paths against
1438, with 90 critical against 68. Attributing paths to Storybook hid it entirely, showing no critical
difference at all, which is how it came to be looked at twice.

Diffing the advisory sets found the 22 extra criticals were all `@babel/traverse`, reached through
`jest` and `stylelint`. The vulnerable `@babel/traverse@7.17.10` is present in **all three** trees.
What differs is hoisting: at 8.6.18 it wins the top-level slot and produces few distinct paths; at
10.3.6 the clean `7.29.8` wins the slot and the vulnerable copy is nested under `@babel/core`,
`@babel/helpers` and `jest-snapshot`, where it is reachable by many more distinct paths.

**The path count measures how many ways a package can be reached, not how much vulnerable code is
present.** Counted by distinct advisory:

| version | critical | high | moderate | low | total |
|---|---|---|---|---|---|
| 8.6.18 | 12 | 125 | 95 | 26 | 258 |
| 9.1.20 | 12 | 125 | 96 | 26 | 259 |
| 10.3.6 | 12 | 125 | 95 | 27 | 259 |

Critical and high are identical across all three. Each candidate adds exactly one distinct advisory
over staying put, and each is Storybook's own: 9.1.20 adds a **moderate** in `@vitest/mocker`, a path
traversal patched at `>=4.1.11`; 10.3.6 adds a **low** in `esbuild`, an arbitrary file read in the
development server patched at `>=0.28.1`.

So on gate 4 alone 10.3.6 would have been marginally preferable to 9.1.20. It fails gate 5, which is
hard, so the comparison does not arise. **The trade the project owner asked to have surfaced is
therefore this one: 9.1.20 carries one more moderate-severity advisory than staying on 8.6.18.** It
is `storybook>@vitest/mocker`, it is not reachable from anything this repository ships, and it is
listed here rather than resolved.

`esbuild`'s patched version is outside the range Storybook 10.3.6 declares, so pinning it forward
would have broken the package's own stated compatibility. Not attempted.

## What Landing 9.1.20 Required, And What It Cost

`task-035` and `task-036` are both reverted by this commit. Neither was wrong; both were correct for
the version they were written for, and that version is not the one being taken.

**`task-035` moved `moduleResolution` to `node16`** because Storybook 10 removed the `typesVersions`
fields that classic resolution depends on. 9.1.20 still has them. Worse than redundant, `node16` is
what produces all 102 `TS1479` errors against 9.1.20, so keeping it would leave `compile` red. The
`module` setting reverts with it, since TypeScript requires the pair.

The `@faker-js/faker` `paths` entry that task introduced goes too. Under classic resolution faker's
own `typesVersions` supplies its declarations, as it always did, so the entry is redundant; verified
by removing it and re-running the misuse probe, which still errors. **The finding it came from is
preserved at `.agent/findings/07-a-lost-type-entry-is-silent.md`**, because the trap is real and will
recur at the TypeScript 5 upgrade, and a config line nobody can reconstruct a reason for is worse than
a written finding.

**`task-036` made the main config an ES module**, which required renaming it to `main.mts` so
TypeScript would accept `import.meta`. That rename only means anything under `node16` resolution:
with classic resolution TypeScript does not treat `.mts` as ESM, and `import.meta` fails with `TS1470`
instead. Splitting the settings does not help; `module: node16` with `moduleResolution: node` was
tried and produces the same `TS1470`.

Storybook 9.1.20 loads a CommonJS main config with an ambient `require` without complaint, verified by
building. So the file returns to `storybook/main.ts` in its original form, with only the addons array
changed.

The `fix-faux-esm-require` automigration reports nothing applicable at 9.1.20, which is the tool
agreeing.

## What Changed In The End

- `package.json`: `storybook`, `@storybook/react-webpack5` and `@storybook/addon-links` to `9.1.20`.
  `@storybook/addon-actions`, `@storybook/addon-controls`, `@storybook/components`,
  `@storybook/core-events`, `@storybook/manager-api`, `@storybook/preview-api`, `@storybook/theming`
  and `@storybook/react` removed: all are folded into core from 9, and `renderer-to-framework` removed
  the last of them itself.
- `storybook/main.mts` back to `storybook/main.ts`, addons reduced to `['@storybook/addon-links']`.
- `tsconfig.json` back to `module: commonjs`, `moduleResolution: node`.
- 63 imports to `storybook/actions`, 9 to `storybook/preview-api`.

## What The Automigrations Did

Run individually per locked decision 12, never through `storybook upgrade`. Three findings that apply
whichever version is chosen.

**The CLI that runs them is not installed, and the dispatcher fetches it.** At 9 and 10 the
`storybook` binary runs only `dev`, `build`, `index` and a few others locally; everything else is
delegated to `@storybook/cli`, and when that is absent the dispatcher calls
`runPackageCommand(..., { useRemotePkg: true })`, which downloads and executes it. The first attempt
**exited 0 with no output at all**, which reads as a clean no-op. `@storybook/cli` was installed as a
temporary devDependency so the automigrations ran from disk, and removed afterwards.

**The CLI cannot find a `.mts` config.** `storybook automigrate` reports
`Error: Could not determine main config path` against `storybook/main.mts` and works against
`storybook/main.ts`, while the builder reads either. Moot now that the config is `.ts` again, and
worth knowing if it ever moves back.

**`consolidated-imports` reports "No migrations were applicable to your project" when it cannot see
the problem.** Run after the old packages were removed from the manifest, which is the order the task
entry implies, it reported exactly that while 72 imports still pointed at packages that no longer
existed. Run with them restored it found the migration and rewrote the 9 `preview-api` imports. It
never rewrote the 63 `addon-actions` imports in any configuration tried, although its own mapping
table contains `"addon-actions": "storybook/actions"`. Those were done by hand against that table.

`renderer-to-framework` did real work: it removed six now-folded packages from the manifest, including
`@storybook/react`, leaving the framework package to supply the renderer. `wrap-getAbsolutePath` and
`fix-faux-esm-require` both reported nothing applicable.

## Verification

- `compile`, `lint`, `storybook`, `jest` and `docs` pass as Nix derivations.
- `nix build '.#internal.x86_64-linux.node_modules'` passes, so the manifest and lockfile agree under
  `--frozen-lockfile`.
- `index.json` from a real build: **258 stories across 49 panels, identical pair for pair** to the
  8.6.18 baseline, with the index format moving from `v4` to `v5` underneath.
- `story-args-audit.js` at zero findings.
- Legacy decorator helper in 66 built bundles, TC39 helper in none.
- `dist/storybook/sb-addons/` lists `links-1` and the core presets; controls and actions are in core.
- `perSystem/checks.nix` unmodified.

## Corrections To The Task Graph

1. `task-037`'s title and description name 10.6.x. 10.6.x is unreachable on TypeScript 4.9.5, as is
   the whole 10 line. The task lands 9.1.20, which `task-035`'s own note names as the documented
   fallback.
2. `task-035`'s note says the fallback means "the rest of this phase changes only in which version
   number it writes". It means more than that: 9.1.x needs classic resolution, so `task-035` and
   `task-036` are both reverted rather than retained with a different number.
3. `task-037.implementationNotes` says the addon list shrinks to "roughly `@storybook/addon-links`".
   Exactly `@storybook/addon-links`.
4. The same note says `consolidated-imports` rewrites `@storybook/addon-actions` "across the 58 files
   that import `action()`". It is 63 files, and the codemod does not rewrite them.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-037-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-037-impl-review.md`

## Planning Status

`approved`

## Current Outcome

Complete. The repository is on Storybook 9.1.20 with all checks green.

## Self-Review

The instruction was to take the highest version we can support. Taking it literally would have landed
10.3.6, which passes four of the five gates and builds cleanly; the fifth gate only appears if you run
the type checker, and the fifth gate is the one that matters, because a red `compile` is not support.

Two counts lied in this task and both lied in the direction of the answer I wanted. The advisory path
count said 10.3.6 was much worse and it was not; the distinct-advisory count said the three candidates
are within one advisory of each other. Then the `exports` map said 9.1.20 was CommonJS-importable and
it is not, because the `types` condition overrides the `require` condition and TypeScript reads the
types. In both cases the artefact that settled it was a run rather than a document: the diff of
advisory sets, and 102 compiler errors.

The cost is two reverted commits, and the part worth keeping from them is a finding rather than a
configuration. That is the right shape. `task-035`'s value was never the setting; it was discovering
that this repository cannot detect a package whose types stop resolving, which is now written down
where the TypeScript 5 upgrade will find it.
