# Task task-038: Verify the bump and close the conversion

## Task ID and Title

- ID: `task-038`
- Title: `Verify the bump and close the conversion`

## Why Chosen Now

`task-038.dependencies` is `[task-037]`, complete. This is the point at which the corpus is declared
ready for the container work of phases 6 and 7.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- Full verification of the converted corpus at the version `task-037` landed.
- Recording the installed version and the addon list.

## Non-Goals

- No render check. Locked decision 7 put that out of reach: Playwright cannot run in the offline
  sandbox, so a story can build, index and render nothing with every check green. Nothing downstream
  depends on this landing for that reason, which `task-038`'s own note records.

## Dependencies

- `task-037`, complete.

## Live Repo Findings Verified For Planning

Verified at `25d9c7c42`.

- The repository is on Storybook **9.1.20**, not 10.6.x. `task-037` records the five gates and every
  version measured against them.

## Verification Performed

**All required checks pass as Nix derivations.** `compile`, `lint`, `storybook`, `jest` and `docs`.
`nix build '.#internal.x86_64-linux.node_modules'` passes, so the manifest and lockfile agree under
`--frozen-lockfile`. `perSystem/checks.nix` is unmodified.

**The corpus is unchanged.** `index.json` from a real build gives **258 stories across 49 panels**,
identical pair for pair in both directions against the `task-001` baseline that has held since phase
3. The index format moved from `v4` to `v5` with the version; the comparison is over `title | name`
pairs and survives it.

**The sidebar tree.** 14 top-level groups: Analytics 1 panel, Assets 2, Common 3, Decentralization 2,
Discreet Mode 2, Governance 4, Loading 7, Navigation 2, News 2, Nodes 8, Settings 2, Voting 2,
Wallets 11, dApps 1. Summing to the 49 panels above.

**The toolbar globals.** Five declared in `storybook/preview.tsx`: `themeName`, `localeName`,
`osName` from `task-016`, and `numberFormat` and `discreetMode` promoted at `task-065`. The option
lists in `_support/config.ts` carry **nine themes, two locales and three OS profiles**.

**The frozen clock.** `timemachine.config` is still called in `preview.tsx` and the frozen date string
is present in the built preview bundle.

**Date formatting is stable across two builds.** Two consecutive builds produce byte-identical story
indexes over title, name and import path for all 258 entries.

**The args contract holds.** `story-args-audit.js` reports zero findings: 117 renders read the first
argument and all 117 declare args.

**The decorator settings are in effect**, not merely present. The legacy decorate helper appears in 66
built bundles and the TC39 decorator helper in none, which is the check that distinguishes the two.

**The addon list.** `dist/storybook/sb-addons/` contains `links-1` and the core server presets.
Controls and actions are part of core from 9 onwards and have no separate bundle. Installed:
`storybook`, `@storybook/react`, `@storybook/react-webpack5` and `@storybook/addon-links`, all at
`9.1.20`.

**No knobs anywhere.** The census reports zero call sites, and neither `@storybook/addon-knobs` nor
`@dump247/storybook-state` appears in `package.json`, `yarn.lock` or any import.

## What Is Not Verified Here, And Why

That every panel renders and every control works. Both halves need a browser.

What can be claimed, and is: every story indexes under the label it had before the conversion; every
arg is declared on the story that reads it; the control panel that would display those args is
installed and loads; and the build that produces all of it is reproducible across runs.

What cannot: that a rendered story shows what it should, and that moving a control repaints it. The
portable-stories harness runs no preview, so nothing listens for `updateStoryArgs` and no setter
repaints. This is the same gap locked decision 7 recorded and `task-016`, `task-064` and every tranche
in phase 4 restated. It is the reason `task-038.acceptance`'s "every panel renders and every control
works" is reported as unverifiable here rather than as met.

## Corrections To The Task Graph

1. `task-038.implementationNotes` says to walk **15** sidebar groups. There are **14**, which is the
   figure `task-023` measured and recorded in phase 3. The count of 15 predates the phase 1 deletions.
2. `task-038.acceptance` says "The repository is on 10.6.x, or on 9.1.x with the reason recorded". It
   is on 9.1.20 and the reason is recorded in `task-037`, so this is the branch the entry anticipated.

## Acceptance Criteria

- All required checks pass.
- The label set, the sidebar tree, the toolbar globals and the frozen clock are all confirmed.
- The installed version and addon list are recorded.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-038-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-038-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

The conversion is closed. The repository is on Storybook 9.1.20 with a fully CSF corpus, args-backed
controls, five toolbar globals, no knobs and no local story-state wrapper. Phases 6 and 7 can build on
it.

## Final Outcome

Complete. Phase 5 closes here.

## Self-Review

The temptation in a verification task is to restate the acceptance criteria as though reading them
back were the same as testing them. Two of this one's criteria cannot be tested here at all, and the
entry says which and why rather than quietly reporting them met.

The determinism check earned its place. "Date formatting is stable across two builds" could have been
asserted from the presence of `timemachine.config` in the source; running the build twice and diffing
the index is what makes it a measurement. It is the same distinction as reading a decorator setting
out of a config versus finding its helper in the emitted bundle.
