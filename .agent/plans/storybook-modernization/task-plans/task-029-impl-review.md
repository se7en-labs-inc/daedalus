# task-029 implementation review

## Implementation: Iteration 1

2026-09-15.

Changed the shared helper first, then the five `withState` sites, then the eight knobs, then the three
files carrying only a `withKnobs` decorator entry. `SettingsWrapper` also passed the story through
`withKnobs` by hand, so it calls the story directly now.

Outcome: all three roots at zero; corpus 237 to 229.

## Review: Iteration 1

Summary: correct, with four compiler errors of my own.

`useArgs()` returns `Args`, which is an index signature and nothing more, so spreading its result into
a component tells `tsc` nothing about what it contains and every required prop looks missing. The
store this replaced was generic and carried its shape. Both call sites name the type now, which is
the shape the helper already exported and was not being used.

`SettingsWrapper`'s first parameter was typed `Record<string, any>` while being passed to `withKnobs`,
which accepted it. Calling it directly makes the type wrong rather than merely loose. Typed as a
function returning a node.

Worth naming, because it is the same shape twice: both errors existed only because something in the
old code was absorbing a type that was already wrong. `withKnobs` took a `Record` and called it; the
store carried a parameter the story never named. Removing the intermediary is what exposed them.

Checked by eye: the `Themes` story's `useGlobals` write-back is unchanged, three conversions in the
same file notwithstanding. Confirmed by reading it back.

Outcome: census 229, args audit zero with the first-argument count 50 to 54 and the unresolved count 8
to 5, which is the three `General` `withState` bindings that became ordinary renders. Label set
identical pair for pair. All three checks green.

Decision: `approved`.
