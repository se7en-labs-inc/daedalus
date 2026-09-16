# task-039 implementation review

## Implementation: Iteration 1

2026-09-15.

Wrote the defaults, the override, the `StoryProvider` wiring and the spec; added `storybook` to jest's
`roots`.

Outcome: the spec failed to run. `.png` imports reached the transform chain as bytes and failed to
parse, from `DisplaySettings.tsx` importing nine theme preview images.

## Review: Iteration 1

Summary: a real gap, not a spec problem. Webpack resolves those imports to a URL string through
`asset/resource` and jest had no equivalent rule, so no screen that shows an image could ever have
been rendered in a test. Added a stub through `moduleNameMapper`, beside the two jest setup files
already there.

Decision: `requires_changes`.

## Implementation: Iteration 2

2026-09-15.

Added the file stub. The suite then failed on `translations.ts`, which bulk-loads locales through
`require.context`, a webpack construct with no jest equivalent. The spec reads the one locale file it
needs instead.

Outcome: five of six assertions passed. The two-key render failed with
`Element type is invalid ... Check the render method of FormField`.

## Review: Iteration 2

Summary: the third gap, and the one most worth having found here.

react-polymorph resolves its form controls through skins supplied by its own `ThemeProvider`. Without
that provider a `FormField` renders `undefined` as an element type. `StoryDecorator` supplies it in
the workbench, so the component corpus never saw this; a container rendered outside that decorator
does. Every screen with a form would have hit it.

Decision: `requires_changes`.

## Implementation: Iteration 3

2026-09-15.

Wrapped the spec in the same frame `StoryDecorator` builds: react-polymorph's `ThemeProvider` with the
Daedalus theme, simple skins and the theme overrides.

Outcome: six of six pass. `compile`, `lint`, `jest`, `storybook` and `cucumber-unit` green. Label set
unchanged, args audit at zero.

## Review: Iteration 3

Summary: complete.

Three iterations, three failures, and none of them was about stores. Images, a webpack-only module
loader, and a missing theme context are what stand between a container and a render in this
repository, and all three are now solved once rather than per tranche. That is what the entry meant by
the harness being the schedule.

Decision: `approved`.
