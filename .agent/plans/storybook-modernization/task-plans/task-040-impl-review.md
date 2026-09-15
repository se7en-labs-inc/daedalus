# task-040 implementation review

## Implementation: Iteration 1

2026-09-15.

Wrote the shared screen decorator, the eight story files, and a spec composing and mounting every
story in the tranche.

Outcome: all eight built. Four of twelve stories failed to render.

## Review: Iteration 1

Summary: two of the four were my assertions, two were the screens.

Mine: the spec asserted on the container the renderer returns, and `AboutDialog` is a modal that
portals to the document, so a screen that was on display was reported empty. And
`SplashNetworkPage` returns null outside a Flight build, which the story had not set.

The screens': `AssetSettingsDialogContainer` returns null with its dialog shut, which is correct and
now has its own story. And `GeneralSettingsPage` throws when its locale request carries an error,
because `ProfileSettingsForm` renders a `LocalizableError` as a React child.

The last one is a shipped defect and the only one in the component tree: 21 components format the same
prop through `intl.formatMessage`, one does not. Recorded as a finding and not fixed, because this
phase writes stories. The story that would demonstrate it is not committed either, and the story file
says why, since a story that throws reads as a broken workbench rather than a broken screen.

Decision: `requires_changes`.

## Implementation: Iteration 2

2026-09-15.

Asserted on `baseElement`, gave the splash screen a story per side of its build-flag branch, removed
the crashing story with its reason recorded in place, and recorded the defect.

Outcome: 19 assertions pass. `compile` and `lint` then failed on four things unrelated to the screens.

## Review: Iteration 2

Summary: all four are one-off costs rather than per-screen ones, which is the answer to the question
this tranche was meant to settle.

A relative markdown import is not covered by the ambient `*.md` wildcard. Worth naming because the
`.scss` imports that look like precedent are served by generated per-file declarations, not by the
wildcard, so the wildcard is not the pattern it appears to be. The story uses `require`, as the rest of
the corpus does for these files.

`flatMap` is outside the effective library surface, which is the same `target es2019` with `lib
["dom"]` mismatch recorded at `task-028`.

Two lint rules: a spec may not call `expect` inside a branch, and a decorator factory may not return
an arrow. Both are better as the rules want them, and the spec reads more clearly with its two cases
enumerated than with a conditional inside one assertion.

Decision: `approved`.

## Implementation: Iteration 3

2026-09-15.

Applied all four.

Outcome: `compile`, `lint`, `jest` and `storybook` green. 270 stories across 57 panels, with nothing
removed from the 258-pair component baseline and all 12 additions under `Screens /`. Args audit at
zero.

## Review: Iteration 3

Summary: complete, and the harness scaled.

Eight screens needed one shared decorator and no per-container wiring. The overrides are between zero
and two keys each, and the longest is three lines. That is the shape `task-050` is meant to confirm at
wallet scale, and this tranche is evidence for it rather than against.

Decision: `approved`.
