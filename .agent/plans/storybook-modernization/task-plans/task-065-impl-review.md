# task-065 implementation review

## Implementation: Iteration 1

2026-09-15.

Declared the two globals, published them on a context from `StoryWrapper`, renamed the discreet-mode
knob component to `DiscreetModeSync` and pointed it at the context, gave `StoryLayout` the number
format from the same context and `hasRewardsWallets` as a prop, spread the shared arg table into the
fifteen wallets metas, and deleted the two dead controls with the markup only they reached.

Outcome: census zero.

## Review: Iteration 1

Summary: correct after two lint errors of my own.

The new module failed `lint` twice, both in the provider: `react/function-component-definition`
wanted a function declaration rather than an arrow, and `react/jsx-no-constructed-context-values`
caught the value object being rebuilt every render, which would have re-rendered both consumers on
every story render. The second is a real defect and not a style rule: the whole point of the context
is that a consumer re-renders when a global changes, and an unmemoized value would have made that
signal meaningless. Fixed with `useMemo`.

`compile` was green on the first run, which is worth noting against the pattern: a class component
reading `static contextType` with a declared `context` field typechecks quietly, and the mistake was
in the provider rather than the consumer.

Checked by eye, because no instrument here covers it: that `DiscreetValue.story.tsx`'s two stories
still differ from each other. They render their own `DiscreetModeFeatureProvider` nested inside
`StoryProvider`'s, so the story's arg drives the inner feature and the new global drives the outer
one, and the pair still shows the value both ways.

Outcome: census zero, args audit zero with the first-argument count 120 to 117 accounted for by the
three `TopBarEnvironment` stories that stopped destructuring a prop nothing read, label set identical
pair for pair, all three checks green.

Decision: `approved`.
