# task-036 implementation review

## Implementation: Iteration 1

2026-09-15.

Converted to `export default` and static imports, with `await import(...)` for webpack resolved from
the builder.

Outcome: `yarn storybook:build` failed. `Top-level await is currently not supported with the "cjs"
output format`, from esbuild inside `loadMainConfig`. Storybook's loader transpiles the main config to
CommonJS before running it.

## Review: Iteration 1

Summary: the construct was wrong, and the failure named the reason precisely.

`import.meta.url` in the same file did not fail, because esbuild shims it when targeting CommonJS. So
the loader accepts one half of `import.meta` and rejects the other, and no amount of reading the
Storybook documentation would have said which: the answer is in what esbuild does with the output
format Storybook asks for.

Decision: `requires_changes`.

## Implementation: Iteration 2

2026-09-15.

Replaced the dynamic import with a synchronous `createRequire(import.meta.url)`, which also supplies
the nine polyfill resolutions. webpack is CommonJS, so requiring it is correct rather than a
workaround.

Outcome: `yarn storybook:build` passed. `compile` then failed:
`TS1470: The 'import.meta' meta-property is not allowed in files which will build into CommonJS
output`.

## Review: Iteration 2

Summary: a real conflict rather than a mistake, and `task-035` is what surfaced it.

Under `module: node16` with no `"type": "module"` in the manifest, TypeScript classifies every `.ts`
file as CommonJS, and `import.meta` is illegal in one. The build and the type checker hold opposite
views of the same file, and both are right about their own half.

Renaming to `.mts` resolves it at the narrowest scope available. A `storybook/package.json` with
`"type": "module"` would have declared the whole directory ESM, which pulls `preview.tsx` and every
story file with it and makes every relative import among them need an extension for `tsc`. `main.mts`
has no relative imports, so the narrowest declaration is also complete.

Verified that Storybook 8.6.18 discovers the renamed file, and that nothing outside it refers to the
old path: `perSystem/checks.nix` runs `yarn storybook:build`, which finds the config by convention
from `-c storybook`. One stale path in a live finding was updated so it stays resolvable.

Decision: `approved`.

## Implementation: Iteration 3

2026-09-15.

Renamed to `storybook/main.mts` with `git mv`.

Outcome: `compile`, `lint`, `storybook` and `docs` green. The legacy decorate helper is in 65 built
bundles and the TC39 helper in none, so the decorator settings are in effect and not merely present.
Label set identical pair for pair, args audit at zero.

## Review: Iteration 3

Summary: complete.

The sequence is the lesson: the build rejected one construct, the type checker rejected its
replacement's premise, and each was invisible to the other tool. Running one of the two would have
shipped a file the other refuses.

Decision: `approved`.
