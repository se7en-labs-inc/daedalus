# Task task-031: Convert knobs in the staking tranche

## Task ID and Title

- ID: `task-031`
- Title: `Convert knobs in the staking tranche`

## Why Chosen Now

`task-031.dependencies` is `[task-026]`, complete. The wallets tranche before it left 73 call sites in
the corpus, 26 of them here.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- Every knob under `storybook/stories/staking`, in the six `_support` modules that hold them and the
  two story files that render those modules.

## Non-Goals

- No change to `_support/StoryLayout.tsx` or `_support/DiscreetModeToggleKnob.ts`; the `task-029` open
  question covers both.
- No change to any story export, `name` or panel title.

## Dependencies

- `task-026`, complete.

## Research Consulted

- `.agent/plans/storybook-modernization/task-plans/knob-conversion-patterns.md`
- `.agent/plans/storybook-modernization/task-plans/task-030.md`, the `_support` module precedent
- `.agent/plans/storybook-modernization/storybook-modernization-tasks.json`, `task-031`

## Docs, Workflows, and Skills Consulted

- Docs: `AGENTS.md`, `CLAUDE.md`

## Live Repo Findings Verified For Planning

Verified at `1dff2c6ee`.

- 26 call sites across six files, five of them `_support` modules that register no stories:
  `_support/RedeemItnWallets.tsx` 11, `Staking.stories.tsx` 3, `_support/StakePools.tsx` 3,
  `_support/StakePoolsTable.tsx` 3, `_support/Undelegate.tsx` 3, `_support/DelegationSteps.tsx` 2,
  `_support/DelegationCenter.tsx` 1.
- `_support/StakePoolsTable.tsx` calls `number('Pools', 300, …)` three times with the same label and no
  group, so the three are one control. `_support/StakePools.tsx`, `_support/DelegationCenter.tsx` and
  `_support/DelegationSteps.tsx` each register a `Pools` control of their own, in their own files.
- `_support/RedeemItnWallets.tsx` registers `Redeem Wallet` three times, once per dialog story, with
  wallet records as options. Records cannot be an argType's options.
- Both of the corpus's two remaining hoists are in `_support/DelegationSteps.tsx`, classified as
  `module` by the census: they sit in a getter on a class at module scope.
- `task-031.implementationNotes` says `_support/DelegationCenter.tsx` is 401 lines with 19
  `@ts-ignore` directives. It is 400 lines, and it holds one knob.

## Files Expected To Change

`storybook/stories/staking/Staking.stories.tsx`, `RedeemItnRewards.stories.tsx`, and the six
`_support` modules named above.

## Implementation Approach

1. Convert each `_support` module by giving its exported component a props parameter and exporting the
   args and argTypes the story that renders it declares, per the `task-028` and `task-030` precedent.
2. Put the shared `Pools` range in one place, since four files declare the same control.
3. Wire the exported args into `Staking.stories.tsx` and `RedeemItnRewards.stories.tsx`.
4. Re-run the census, the args audit and the label diff, then the three Nix checks.

## Acceptance Criteria

- No knob import remains under `storybook/stories/staking`.
- `story-args-audit.js` stays at zero findings.
- The label set is identical, pair for pair.
- `compile`, `lint` and `storybook` pass as Nix derivations.

## Verification Plan

- Census per file, before and after, expecting 26 and 0.
- `story-args-audit.js`, with every count move accounted for.
- `index.json` label set diffed in both directions.
- `nix build '.#checks.x86_64-linux.{compile,lint,storybook}' --no-link`.

## Risks and Open Questions

- Three `@ts-ignore ts-migrate(2769)` directives in `_support/RedeemItnWallets.tsx` are anchored on
  the property whose type does not match. Replacing a knob with a lookup changes which property that
  is, so the suppression has to move with the error rather than stay where it was written.

## Required Docs, Research, and Tracking Updates

- Set `task-031.status` to `completed`.

## Corrections To The Task Graph

1. `task-031.implementationNotes` gives `staking/DelegationCenter.stories.tsx` as 401 lines. The file
   is `staking/_support/DelegationCenter.tsx` at 400 lines; `task-062` moved and renamed the
   sibling-registering files in phase 1.
2. The same note says these files "register no stories of their own", which is true of the six
   `_support` modules and not of `Staking.stories.tsx` or `RedeemItnRewards.stories.tsx`.
3. The note warning that three files call `moment().add()` and that a grep for `.add(` would mislead
   describes a hazard of a different instrument. The census parses the file and matches only names
   imported from the addon, so it never saw them.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-031-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-031-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

26 knob call sites removed across eight files. The corpus goes from 73 to 47: 45 renames, 2 hoists, 0
relocations. Both remaining hoists are outside this tranche, and the corpus has no module-scope
relocations left.

Six `_support` modules take their values as props now and export the args and argTypes the story that
renders them declares. The `Pools` range is declared once, in `_support/StakePoolsTable.tsx`, and the
three other files that offer the same control import it.

`_support/RedeemItnWallets.tsx` selected between wallet records. The arg holds the wallet's name and
each dialog resolves it, which is the form `task-027` settled for non-primitive options.

The label set is unchanged: 258 stories across 49 panels, identical pair for pair in both directions.

`story-args-audit.js` stays at zero findings. Renders reading the first argument went 78 to 93;
renders it cannot resolve is unchanged at 5.

`compile`, `lint` and `storybook` pass as Nix derivations.

## Final Outcome

Complete.

## Self-Review

Three type suppressions had to move, and that is the part of this tranche worth remembering. A
`ts-migrate(2769)` sits on the property whose type does not match, not on the element, and the
property it sits on stops being the offending one the moment a knob returning `any` becomes a typed
lookup. The error then reappears on the next property the component does not declare, three lines
down, and the suppression left behind is dead. Two of the three moved to a property that had never
been suppressed before.

That is worth stating plainly: carrying a suppression across a conversion is not the same as leaving
it where it was written. Locked decision 8 says to carry them, and carrying one means keeping it over
the error it was for.
