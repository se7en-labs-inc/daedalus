# task-028 implementation review

## Implementation: Iteration 1

2026-09-15.

Converted `nodes/` first, then `loading/`, re-running the census per file.

`nodes/` needed three module-scope conversions before any story could move. The two error fixtures
and the three `SyncingConnecting` components hold knobs for stories registered in other files, so
each gained a props parameter and exported the defaults its story binds. `TopBarEnvironment` builds
its three top bars in module-scope functions that each read one knob under one label, which is one
meta arg threaded through a second parameter.

`loading/` is seven story files reaching a shared factory. Each file declares an args object, derives
its argTypes from it with a helper that puts the `Loading` category on every one, and the factory is
deleted with its last caller.

Outcome: both roots at zero; corpus 317 to 237; the factory gone.

## Review: Iteration 1

Summary: the conversion is right and two compiler errors in it were mine.

`Object.fromEntries` does not typecheck in this repository. `tsconfig.json` declares
`target: es2019` and `lib: ["dom"]`, and the effective library surface sits below the declared
target: `Object.entries`, from ES2017, compiles in the same file, and `Object.fromEntries`, from
ES2019, is rejected with a suggestion to raise `lib`. Rewritten as a reduce.

The interactive overlay story destructures one arg out and spreads the rest, and an untyped
destructuring parameter makes that spread opaque to `tsc`, so the required `status` prop looked
missing. Passed explicitly.

Both were caught by the Nix compile check and neither by anything else, which is the point of running
it rather than the host one.

Checked by eye, because no instrument here covers it: that the shared components still render what
they rendered. Two are worth naming. The partial sync overlay registered its file count and elapsed
time inside the component every story in that panel shares, so a knob took its default from whichever
story was rendering; the three stories whose numbers differ now carry their own args and the other
twelve take the meta's. And the error view's three text controls kept the first stage's values
however the stage moved, because a knob holds the value it was registered with; left unset they now
follow the stage, which is what the code around them computes.

Outcome: census 237, args audit zero with the rise from 17 to 50 first-argument renders accounted for
by the stories that took object form, label set identical pair for pair, all three checks green.

Decision: `approved`.
