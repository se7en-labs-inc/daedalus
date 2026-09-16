# Finding: this repository cannot detect a package whose types stop resolving

**Status:** open, not scheduled
**Raised from:** evaluating `moduleResolution` changes during the Storybook 9 upgrade
**Scope:** TypeScript configuration, repository-wide
**Severity:** low today, because nothing is currently mis-resolving. High whenever
module resolution changes, because the failure is silent and the check that
should catch it reports success.

---

## The measurement

While evaluating a move from `moduleResolution: "node"` to `"node16"`,
`yarn compile` reported **zero errors before and zero errors after**. It looked
like a free change.

Counting the type-checked program instead of the errors told a different story:

```
tsc --noEmit --listFiles | wc -l
  moduleResolution node    3170
  moduleResolution node16  3120
```

Fifty declaration files had left the program with nothing reported. Diffed by
package, fifty of the fifty-one were `@faker-js/faker` and one was `axios`
swapping `index.d.ts` for the `index.d.cts` that is correct for a CommonJS
consumer.

Confirmed by behaviour rather than inferred. A file importing `faker` and calling
a member that does not exist reports
`TS2339: Property 'thisMemberDoesNotExist' does not exist on type 'Faker'` under
`node`, and reports **nothing at all** under `node16`.

Five files import `@faker-js/faker`, including
`storybook/stories/_support/utils.ts` and `storybook/stories/_support/StoryProvider.tsx`,
which are the fixture generators most of the Storybook corpus is built on, and
`source/renderer/app/config/generateStakePoolFakeData.ts` in shipped source.

## Why it is silent

Two settings in `tsconfig.json` combine to make it so.

`"skipLibCheck": true` stops TypeScript checking the contents of declaration
files. `"noImplicitAny": false` stops it complaining when an import resolves to
JavaScript with no declarations at all: the import simply becomes `any`.

A module that cannot be resolved **at all** still reports `TS2307`. A module that
resolves to untyped JavaScript reports nothing. So the failure mode that matters
here, a package whose *types* stop being found while the package itself is still
found, is exactly the one the configuration cannot report.

## The specific cause in faker's case

`@faker-js/faker`'s `exports` map declares `node`, `es2015` and `default`
conditions and **no `types` condition**. Classic node resolution ignores `exports`
and falls back to the package's `typesVersions` field,
`{">=4.0": {"*": ["dist/types/*"]}}`, which resolves the full type tree. `node16`
consults `exports` first, matches, and gets JavaScript with no adjacent
declaration.

The package is not unusual. Any dependency with an `exports` map that omits
`types` behaves this way, and most consumers never notice because most consumers
have `noImplicitAny` on.

## What it does and does not affect today

Nothing. The repository is on `moduleResolution: "node"` and faker's types
resolve.

What it affects is any future change to module resolution, of which there will be
at least one: `moduleResolution: "bundler"` is the correct setting for a
webpack-bundled tree and needs TypeScript 5.0, so it is waiting on that upgrade.

## The measurement to use instead

For any change to `module`, `moduleResolution`, `paths`, `baseUrl` or
`typesVersions`, diff the type-checked file set rather than comparing error
counts:

```
tsc --noEmit --listFiles | sort > /tmp/before.txt
# make the change
tsc --noEmit --listFiles | sort > /tmp/after.txt
comm -23 /tmp/before.txt /tmp/after.txt   # dropped out
comm -13 /tmp/before.txt /tmp/after.txt   # newly included
```

Every difference should be explainable. A package moving from `index.d.ts` to
`index.d.cts` is resolution working. Fifty files leaving at once is not.

The general form of the question, which is worth asking of any check:
**what would this instrument report if the thing I am changing had broken?** For
an error count over a checker configured this permissively, the answer is zero,
which means the error count is not evidence.

## What was not done, and why

Turning on `noImplicitAny`, which would make this class of failure loud. That is a
large change against a codebase with roughly 1,131 `@ts-ignore` directives and
`strict` off, and it is its own project.

A `paths` entry pinning faker's declarations was written and then removed, because
the repository stayed on classic resolution and the entry was redundant there. It
is recorded here rather than left in the config as a line whose reason nobody
could reconstruct.

## Which area would own it

Whoever takes the TypeScript 5 upgrade. `moduleResolution: "bundler"` is the
change this finding is waiting for, and the file-set diff is how to verify it.
