# Task task-039: Build the store fixture harness core

## Task ID and Title

- ID: `task-039`
- Title: `Build the store fixture harness core`

## Why Chosen Now

`task-039.dependencies` is `[task-038]`, complete. Its own note says the harness is the schedule: if it
lands cleanly the remaining screens are fixture data, and if it does not, every screen pays the cost
again.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- A plain-object stand-in for all 24 `StoresMap` keys, with real defaults for the dominant stores.
- The override entry point a screen story uses.
- Mounting it through the real `<Provider stores actions>` in `StoryProvider`.
- A proof that a real screen container renders through it.

## Non-Goals

- No request sweep across the 48 containers, and no full `networkStatus` defaults. `task-041` owns
  both. A minimal request shape lands here only because the two-store proof reads one.
- No screen story files. `task-040` opens that roster.

## Dependencies

- `task-038`, complete.

## Research Consulted

- `.agent/plans/storybook-modernization/research/05-reachable-screens.md`
- `.agent/plans/storybook-modernization/storybook-modernization-tasks.json`, `task-039` to `task-042`

## Live Repo Findings Verified For Planning

Verified at `10b45e94e`.

- `stores/index.ts:58-83` declares 24 keys. `stores/lib/Store.ts:31-35` starts every reaction from
  `initialize()`, and `setUpStores` takes a live `Api`, so no real store may be constructed.
- `Store.ts:25-27` gives each store a `stores` back-reference, so a computed that crosses into a
  missing key throws. The map has to be complete rather than partial.
- `StoryProvider.tsx` already mounts the real `Provider` with the real `ActionsMap` and supplies three
  ad-hoc stores: `assets`, `wallets` and `hardwareWallets`.
- `types/injectedPropsType.ts` types `stores` as `any | StoresMap` and `tsconfig.json` has `strict`
  and `noImplicitAny` off, so an incomplete fixture compiles and fails at render. The type checker
  will not supply the defaults.
- Observable defaults read directly from the store sources: `AppStore` 5, `ProfileStore` 31 of which
  16 are `Request` instances, `NetworkStatusStore` 35, `WalletsStore` 60 of which 23 are requests.
  Computed getters read the same way: `ProfileStore` 20, `AppStore` 3.

## The Verification Problem, And What Was Done About It

`task-039.acceptance` asks that a screen container render through the Provider with a two-key
override. Nothing in this repository could check that.

`yarn storybook:build` passing is not evidence: locked decision 7 records that a story can build,
index and render nothing with every check green, and phase 3 found thirteen live instances of exactly
that. The portable-stories harness runs no preview. A browser is out of reach.

Jest can do it, and was not being used for it. It runs jsdom, transforms `.scss` through
`jest-css-modules-transform` and `.svg` through `svg-jest`, and the repository already has container
specs at `containers/governance/DRepDetailPage.spec.tsx` and
`containers/voting/VotingGovernancePage.spec.tsx`. What stopped it reaching the harness was
`jest.config.js`'s `roots`, which listed `tests` and `source` and not `storybook`.

So this task adds `<rootDir>/storybook` to `roots` and proves the harness by mounting real containers
through the real `Provider`. That converts every screen tranche in phases 6 and 7 from "the bundle
built" to "the container rendered", which is the difference the whole phase turns on. It uses tooling
already in the repository, and it partially recovers what locked decision 7 gave up when the render
check was dropped for needing a browser: not that a screen looks right, but that it mounts at all.

**The change was approved on evidence rather than on argument.** The same change was declined during
phase 4, on the reasonable grounds that the exposure there was bounded and the cost was changing what
CI runs for every future spec. What settled it was the first tranche that used it: `task-040` mounted
eight screens and found a defect in shipped source that had been reachable since the form was written
and that no component-level story could have surfaced. The justification is in the record at
`.agent/findings/08-general-settings-crashes-on-error.md`, not in this paragraph.

Two further configuration gaps surfaced while doing it, both of which any screen render would have
hit:

- **Binary assets imported as modules.** Webpack turns a `.png` import into a URL string through its
  `asset/resource` rule. Jest has no equivalent, so the file reaches the transform chain as bytes and
  dies with `SyntaxError: Invalid or unexpected token` pointing at the first byte of a PNG header,
  which names neither the import nor the screen. `DisplaySettings.tsx` imports **nine** theme preview
  images before it renders anything, so this is the first thing any screen render hits and the last
  thing its error message helps with. Added a `moduleNameMapper` entry pointing at
  `tests/jest/setup/fileStub.js`, which returns a string, because a string is what the components
  expect from these imports.

  Markdown is mapped to the same stub for the same reason: the terms-of-use screens import their copy
  as a module, and a string is the right answer there too.

- **A webpack-only module loader.** `source/renderer/app/i18n/translations.ts` bulk-loads every locale
  through `require.context`, which exists only inside webpack. A spec that imports it fails with
  `require.context is not a function`. Specs read the single locale file they need instead.
- **react-polymorph needs its `ThemeProvider`.** Without it a `FormField` renders an undefined element
  type rather than a control, because the skin it resolves through is not in context. `StoryDecorator`
  supplies it in the workbench; the spec supplies the same frame.

## Files Expected To Change

- `storybook/stories/_support/harness/storeDefaults.ts`, new
- `storybook/stories/_support/harness/storeDefaults.spec.tsx`, new
- `storybook/stories/_support/StoryProvider.tsx`
- `jest.config.js`
- `tests/jest/setup/fileStub.js`, new

## Implementation Approach

1. Write the 24-key map with real defaults for `app`, `profile` and `wallets`, taken from the store
   sources rather than invented.
2. Give it a one-level-deep override so a screen names two or three keys and a handful of fields.
3. Merge it into `StoryProvider` beneath the three fixtures already there, so nothing in the existing
   corpus changes shape.
4. Prove it by rendering.

## Acceptance Criteria

- All 24 `StoresMap` keys resolve to an object.
- No reaction starts and no `Api` is constructed when a story mounts.
- A screen container renders through the Provider with a two-key override and nothing else.
- `compile`, `lint`, `jest`, `storybook` and `cucumber-unit` pass as Nix derivations.
- The label set is unchanged.

## Verification Plan

- The spec asserts the key set against the 24 names from `stores/index.ts`.
- The spec asserts no fixture carries `_reactions`, `initialize` or `api`, which a real store would.
- The spec renders `DisplaySettingsPage` with a one-key override and `GeneralSettingsPage` with a
  two-key override, and asserts each produces content.
- Five Nix checks, the label diff and the args audit.

## Risks and Open Questions

- Adding `storybook` to jest's `roots` means story-adjacent specs run in CI. That is the point, and it
  also means a badly written spec there can fail the `jest` check for the whole repository. The
  convention stays as `CLAUDE.md` states it: specs colocated as `<Unit>.spec.ts`, `tests/` left to
  Cucumber.

## Required Docs, Research, and Tracking Updates

- Set `task-039.status` to `completed`.

## Corrections To The Task Graph

1. `task-039.implementationNotes` says to supply `networkStatus` among the four dominant stores, while
   `task-041.implementationNotes` says `networkStatus` is that task's to add. Split: this task gives
   it a present-but-empty object so a computed crossing into it fails at the field rather than at the
   store, and `task-041` fills it alongside the request sweep.
2. The same note reads "app is read by 35 of the 48 screen containers, profile by 23". Measured over
   `source/renderer/app/containers`, the direct `stores.<name>.<field>` form is far less common than
   destructuring, so neither figure is reproducible by grep. The harness is built from what each store
   declares rather than from how often it is read, which does not depend on the counts.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-039-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-039-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

`storybook/stories/_support/harness/storeDefaults.ts` supplies all 24 `StoresMap` keys.
`app`, `profile` and `wallets` carry their real observable and computed defaults; the rest are present
and empty, which fails at the field rather than at the store.

`withStoreOverrides` merges a named store one level deep, so a screen override is two or three lines
rather than a second fixture. `StoryProvider` takes a `storeOverrides` prop and merges the defaults
beneath the three fixtures it already supplied, so no existing story changes shape.

**The harness is proven by rendering, not by building.** Six assertions pass in `jest`: the key set
matches `stores/index.ts`, no fixture carries the marks of a real store, overrides merge one level
deep and do not leak between calls, and two real screen containers mount through the real `Provider`
and produce content — `DisplaySettingsPage` with a one-key override and `GeneralSettingsPage` with a
two-key override.

`compile`, `lint`, `jest`, `storybook` and `cucumber-unit` pass as Nix derivations. The label set is
unchanged at 258 stories across 49 panels and the args audit is at zero.

## Final Outcome

Complete.

## Self-Review

The acceptance criterion that mattered was unverifiable when the task started, and the useful work was
making it verifiable rather than working around it. Adding one directory to `jest.config.js`'s `roots`
turns every screen tranche in phases 6 and 7 from an assertion into a test. That is worth more than
the harness itself, which is a hundred lines of defaults.

Two of the three problems the proof hit would have been hit by every screen in the corpus, and neither
is about stores: images imported as modules, and react-polymorph's skins missing from context. Finding
them at the harness rather than at the fourth tranche is the whole argument for building a proof first.

What is not proven: that a rendered screen shows the right thing. The spec asserts that a container
mounts and produces content, not that the content is correct. That distinction is worth keeping in
view as the tranches land, because "it rendered" will start to feel like "it works".
