# Finding: the Alonzo celebration icon cannot render, and the machinery behind it is still there

**Status:** open, not scheduled
**Raised from:** deciding what to do with a `hasTadaIcon` story control, phase 4 of
the Storybook modernization
**Scope:** top bar, one config flag and the branches it gates
**Severity:** none operationally. It is dead code with a live-looking prop threaded
through four components.

---

## The measurement

`source/renderer/app/config/topBarConfig.ts:1` reads:

```ts
export const IS_TADA_ICON_AVAILABLE = false;
```

`source/renderer/app/containers/TopBarContainer.tsx:38-39` derives the only value
that reaches the components from it:

```ts
const shouldShowTadaIcon =
  IS_TADA_ICON_AVAILABLE && (isAlonzoPending || isAlonzoActivated);
```

So `shouldShowTadaIcon` is `false` unconditionally, whatever the network and
whatever the chain says about Alonzo. Everything downstream of it is unreachable:

- `hasTadaIcon` on `NodeSyncStatusIcon`, `TopBarContainer.tsx:95`
- the `hasTadaIcon` class on the top bar rectangle, `TopBarContainer.tsx:100`
- `hasTadaIcon` on `DiscreetToggleTopBar`, `TopBarContainer.tsx:103`
- the entire `<TadaButton>`, `TopBarContainer.tsx:104-109`, which is inside
  `{shouldShowTadaIcon && …}`

`shouldShowTadaIconAnimation` at `TopBarContainer.tsx:37`,
`isAlonzoActivated && !stakingInfoWasOpen`, is also unreachable: its only consumer
is that button's `shouldAnimate`, inside the same guard.

The `.scss` rules for `hasTadaIcon` in `TopBar.scss:93`,
`NodeSyncStatusIcon.scss:6` and `DiscreetToggleTopBar.scss:5`, and the three
matching `.scss.d.ts` declarations, exist for a class nothing applies.

## What this was, and why it stopped

A one-off celebration: a sparkle on the sync icon when Alonzo activated, until the
user opened the staking info tab once. `isAlonzoActivated` is a timestamp
comparison, `NetworkStatusStore.ts:524`, and Alonzo activated on mainnet in 2021, so
the interesting half of that flag has been permanently true for years. Then the
feature flag was set to `false`, which made the question moot.

`stakingInfoWasOpen` has a second consumer that is *not* dead:
`StakingInfoCountdown.tsx:74` reads it alongside `isAlonzoActivated`. That component
is a separate question and this finding does not cover it.

## One thing that is easy to get wrong

`hasTadaIcon` is not the testnet-mode indicator, despite sitting beside it in the
top bar. The testnet label is `WalletTestEnvironmentLabel`, built at
`TopBarContainer.tsx:57` and rendered at `TopBarContainer.tsx:91`, and nothing in
this finding touches it. The two are adjacent in the markup and unrelated in
meaning.

## What it does and does not affect today

Nothing renders and nothing breaks. The cost is that `hasTadaIcon` is threaded as a
prop through three components and a style sheet each, so it reads as a live feature
to anyone working on the top bar, and any change to the surrounding layout has to
carry a branch that cannot be taken.

## The state after the conversion

Two Storybook controls drove this from the workbench, `isAlonzoActivated` and
`hasTadaIcon`, in `storybook/stories/_support/StoryLayout.tsx` and
`storybook/stories/nodes/environment/TopBarEnvironment.stories.tsx`. Both were
removed in phase 4 rather than converted to args, because the only state either
could produce is one the application cannot reach. The stories pass the literal the
application computes.

## What was not done, and why

The removal. Deleting `IS_TADA_ICON_AVAILABLE`, `shouldShowTadaIcon`,
`shouldShowTadaIconAnimation`, `TadaButton`, the `hasTadaIcon` prop on three
components and the styles behind it is a change to shipped source, and the epic that
found it converts stories. It is also worth doing as one deliberate change rather
than as a side effect, because the prop reaches three components and the decision to
retire the feature outright should be recorded where someone can see it.

## Which area would own it

Top bar or general dead-code retirement. The same shape as
`02-paper-wallet-creation-retirement.md`: a feature turned off by a flag, with its
implementation left in place.
