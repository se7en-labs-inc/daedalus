# Task task-065: Retire the knobs in the two shared story wrappers

## Task ID and Title

- ID: `task-065`
- Title: `Retire the knobs in the two shared story wrappers`

## Why Chosen Now

`task-032` left the corpus at 8 knob call sites, all in two wrappers rather than in any story. They
could not be converted inside a tranche and the owner settled their disposition per control, so this
is a task of its own ahead of `task-034`, which needs the count at zero.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- The five controls across the last 8 call sites, each promoted to a toolbar global, declared as a
  per-meta arg, or dropped.
- The context the two promoted globals reach their consumers through, since neither consumer is a
  story or a decorator.

## Non-Goals

- No further toolbar promotions. Four globals is the ceiling the owner set.
- No change to shipped source. The dead Alonzo machinery the drops rest on is written up as a finding
  and left in place.
- No change to `DiscreetValue.story.tsx`'s own per-story toggle. See below.

## Dependencies

- `task-064`, so the panel that shows the surviving arg exists before it is declared.

## Research Consulted

- `.agent/plans/storybook-modernization/task-plans/task-016.md`, the globals precedent
- `.agent/plans/storybook-modernization/task-plans/task-029.md`, where the question was raised
- `.agent/findings/06-alonzo-celebration-is-unreachable.md`, written from this task's verification
- `.agent/plans/storybook-modernization/task-plans/task-002.md`, the annotation on the Byron stories

## Docs, Workflows, and Skills Consulted

- Docs: `AGENTS.md`, `CLAUDE.md`

## Live Repo Findings Verified For Planning

Verified at `8362fb903`. Each disposition rests on a reading of the shipped component, not on the
control's name.

- **`hasRewardsWallets` is live and is not a display mode.**
  `source/renderer/app/components/layout/TopBar.tsx:51` reads it as
  `((hasRewardsWallets && onTransferFunds) || onWalletAdd)`, inside `hasLegacyNotification`. It is the
  precondition for the top bar offering to move funds out of a legacy wallet.
- **Only the wallets wrapper can show that notification.** `StoryLayout` passes `activeWallet` only
  when `activeSidebarCategory === '/wallets'`, and `TopBar` needs a non-null `activeWallet` to build
  the notification. The other five wrappers pass `/hardware-wallets`, `/settings` or a staking
  category.
- **Any wallets story can reach it.** `_support/StoryProvider.tsx:20` defines six wallets, of which
  those at lines 75 and 91 are `isLegacy: true`, and the sidebar lets a viewer make any of them
  active. So the arg belongs on every meta under that wrapper, not on a chosen few.
- **`isAlonzoActivated` is not a prop `TopBar` declares.** Its `Props` type, `TopBar.tsx:15-25`, has
  no such key, and neither `render` nor any helper reads one. Both call sites passed it through an
  existing `ts-migrate(2769)` suppression, so nothing has ever read it.
- **`hasTadaIcon` cannot be true in the application.**
  `source/renderer/app/config/topBarConfig.ts:1` is `export const IS_TADA_ICON_AVAILABLE = false`, and
  `TopBarContainer.tsx:39` derives the only value that reaches the components as
  `IS_TADA_ICON_AVAILABLE && (isAlonzoPending || isAlonzoActivated)`. In the stories it has always
  been `true`: four call sites share the label, one carries the default `true`, and the first
  registration decides.
- **`hasTadaIcon` is not testnet mode.** The testnet label is `WalletTestEnvironmentLabel`, built at
  `TopBarContainer.tsx:57` and rendered at `:91`. Adjacent in the markup, unrelated in meaning.
- **The number-format control has never affected an opening render.**
  `StoryLayout.tsx:99` passed `NUMBER_OPTIONS[0]`, an option object, where the `select`'s default
  value belongs, under a `ts-migrate(2345)` suppression. `NUMBER_FORMATS[<object>]` is `undefined`, so
  the spread contributed nothing and every story opened on `DEFAULT_NUMBER_FORMAT`.
- **Neither consumer has a story context.** The discreet-mode switch is applied by a component
  `StoryProvider` renders, and the number format by `StoryLayout`. 21 files render `StoryProvider` and
  six wrappers render `StoryLayout`, none of which has an opinion about either value.

## Files Expected To Change

- `storybook/preview.tsx`, `storybook/stories/_support/config.ts`,
  `storybook/stories/_support/StoryWrapper.tsx`, `storybook/stories/_support/storyGlobals.tsx` (new)
- `storybook/stories/_support/DiscreetModeToggleKnob.ts` → `DiscreetModeSync.tsx`,
  `storybook/stories/_support/StoryProvider.tsx`
- `storybook/stories/_support/StoryLayout.tsx`
- `storybook/stories/wallets/_utils/WalletsWrapper.tsx` and the fifteen metas under it
- `storybook/stories/nodes/environment/TopBarEnvironment.stories.tsx`

## Implementation Approach

1. Declare `numberFormat` and `discreetMode` as `globalTypes` in `preview.tsx`, with option lists from
   `_support/config.ts`, following `task-016`.
2. Publish both on a context above every story from `StoryWrapper`, and consume it in the two
   components, rather than threading a prop through 21 and 6 files that do not care.
3. Pass `hasRewardsWallets` from `WalletsWrapper` off the story's args, defaulting to the knob's
   default, and spread the shared arg table into every meta under that wrapper.
4. Delete the two dead controls and the markup only they reached.
5. Re-run the census, the args audit and the label diff, then the three Nix checks.

## Acceptance Criteria

- No knob import remains anywhere in the repository and the census reports zero.
- The label set is unchanged, pair for pair.
- `story-args-audit.js` stays at zero findings.
- `compile`, `lint` and `storybook` pass as Nix derivations.

## Verification Plan

- Census over the whole corpus, expecting 8 before and 0 after.
- `story-args-audit.js`, with every count move accounted for.
- `index.json` label set diffed in both directions.
- `nix build '.#checks.x86_64-linux.{compile,lint,storybook}' --no-link`.

## The One Deliberate Rendering Change In Phase 4

Every tranche in this phase held the invariant that no story renders differently. This task breaks it
once, knowingly.

Dropping `hasTadaIcon` removes the Alonzo celebration sparkle from the stories that showed it: the
`hasTadaIcon` class on the sync icon and the top bar rectangle, the flag on the discreet-mode toggle,
and the `TadaButton` itself, in `StoryLayout` and in `TopBarEnvironment`'s three stories. Those
stories will look different.

They will look like the application. `IS_TADA_ICON_AVAILABLE` is `false`, so the state the stories
were showing is one no user can reach on any network. Keeping the control would have preserved a
picture of something that cannot happen, which is worse than changing the picture.

The sidebar is unaffected: no story is added, removed or renamed, and the label set is identical.

## Required Docs, Research, and Tracking Updates

- Set `task-065.status` to `completed`.
- `task-034` depends on this task as well as `task-064`.
- The dead source behind the drops is `.agent/findings/06-alonzo-celebration-is-unreachable.md`.

## Why DiscreetValue's Own Toggle Stays

`source/renderer/app/features/discreet-mode/ui/DiscreetValue.story.tsx` has two stories whose whole
purpose is to show the value with discreet mode off and on, and each declares its own
`toggleDiscreetMode` arg against a `DiscreetModeFeatureProvider` it renders itself. The new global
does not replace it: driving both stories from one toolbar switch would make them identical and lose
the comparison the pair exists for.

The two do not interfere. The story's provider is nested inside `StoryProvider`'s, so the story's arg
drives the inner feature and the global drives the outer one.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-065-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-065-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

The census reports zero knob call sites. Nothing in the repository imports `@storybook/addon-knobs`.

Two controls became toolbar globals, `numberFormat` and `discreetMode`, declared in `preview.tsx`
beside theme, locale and OS and reaching their consumers through a context `StoryWrapper` publishes.
Both now apply to the whole corpus rather than only where the wrapper that registered them was
rendered.

`hasRewardsWallets` is a per-meta arg, declared on all fifteen metas under `WalletsWrapper` by
spreading one shared table, and read by the wrapper off the story's args.

`isAlonzoActivated` and `hasTadaIcon` are deleted with the markup only they reached, in `StoryLayout`
and `TopBarEnvironment`.

The label set is unchanged: 258 stories across 49 panels, identical pair for pair in both directions.

`story-args-audit.js` stays at zero findings. Renders reading the first argument went 120 to 117,
which is the three `TopBarEnvironment` stories that stopped destructuring a prop nothing read.

`compile`, `lint` and `storybook` pass as Nix derivations.

## Final Outcome

Complete.

## Self-Review

Every one of the five dispositions was checked against the component that consumes the flag, and two
of the five turned out differently from what their names suggest. `isAlonzoActivated` is not a prop
`TopBar` declares at all, so both call sites were passing a value into a suppression; that is a
stronger reason to drop it than the Alonzo argument, and it means the drop changes nothing.
`hasTadaIcon` does reach four places, so dropping it does change what those stories show, and the
entry says so in its own section rather than burying it in a list.

The reach problem had a third answer neither of the two I was weighing. Threading a prop would have
touched 27 files that have no opinion about either value; a context published once above every story
touches four. The rule that produced it: when a value has to cross a boundary that nothing on the
boundary cares about, move the boundary rather than the value.

Two more suppressed wrong-position arguments surfaced here, which makes five in this phase. The
number-format control had its default passed as an option object rather than the option's value, so
the format it named was never applied on an opening render. Each of the five was invisible for the
same reason: a `@ts-ignore` sat over the line that would have said so.
