# task-032 implementation review

## Implementation: Iteration 1

2026-09-15.

Converted `fixtures.ts` first, since three stories depend on it, then `voting/`, `DRepDetail` and
`DRepDirectory`, then `Delegation.stories.tsx`, then the two stray decorator entries.

Outcome: corpus 47 to 8, and the 8 are the two shared wrappers.

## Review: Iteration 1

Summary: correct after one declaration order fix.

`Delegation.stories.tsx` failed `compile` with seven errors from one cause. The args table was
inserted above the helper that reads it, which put its argTypes above the five options tables they
read, and a `const` referenced in another `const`'s initializer before its declaration is a temporal
dead zone error. Moved below the last options table. The type alias stays usable from above it,
because TypeScript resolves types across the file.

Worth recording what the check caught that reading would not. The file is 780 lines, the declaration
that broke was 300 lines above the one it needed, and nothing about either line looks wrong on its
own.

Two knobs in the same file were inside `onSubmit`. They had never reached the panel, because
addon-knobs registers a control when its call runs. Two comments in the file describe that exact
failure for other knobs and say the fix is to read them while the story renders; nobody had noticed
these two. As args they are declared before the first render.

Outcome: census 8, args audit zero with the first-argument count 93 to 120 and the unresolved count 5
to 4, label set identical pair for pair, all three checks green.

Decision: `approved`.
