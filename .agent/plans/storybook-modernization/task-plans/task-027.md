# Task task-027: Convert knobs in the shared widgets tranche

## Task ID and Title

- ID: `task-027`
- Title: `Convert knobs in the shared widgets tranche`

## Why Chosen Now

`task-027.dependencies` is `[task-026]`, complete. It is the first tranche of phase 4 and the one
that decides whether the reference written at `task-026` survives contact with real call sites.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- Every `@storybook/addon-knobs` call site under `storybook/stories/common`, `assets`, `dapps`,
  `notifications`, `navigation` and `news`, and the `withKnobs` decorator entries that go with them.
- The two module-scope knobs in `storybook/stories/_support/profileSettings.ts`, which only this
  tranche's files reach.
- The five `withState` sites in the three files that carry both, converted in the same pass per file
  because both rewrites land on the same story bodies.
- A shared `_support/argTypes.ts` for the options-object inversion, which every later tranche uses.

## Non-Goals

- No `withState` outside those three files. `task-033` sweeps the rest.
- No manifest change. `task-034` removes `@storybook/addon-knobs`.
- No change to any story's export name, `name`, or panel title. The label set is invariant through
  phase 4.
- No repair of the pre-existing decorator and typing oddities found while reading these files. They
  are recorded below rather than fixed, because each is a change to what a story renders and none is
  a knob.

## Dependencies

- `task-026`, complete.

## Research Consulted

- `.agent/plans/storybook-modernization/task-plans/knob-conversion-patterns.md`
- `.agent/plans/storybook-modernization/task-plans/phase-3-closing-notes.md`
- `.agent/plans/storybook-modernization/storybook-modernization-tasks.json`, `task-027`, `task-033`,
  `task-034`, `task-037`
- `.agent/plans/storybook-modernization/storybook-modernization-prd.md`, locked decisions 7 and 9

## Docs, Workflows, and Skills Consulted

- Docs: `AGENTS.md`, `CLAUDE.md`
- Workflows: `.agent/workflows/storybook.md`, read rather than followed; it teaches `storiesOf`,
  `withKnobs` and `@dump247/storybook-state`, all of which this task removes. `task-060` owns it.

## Live Repo Findings Verified For Planning

Verified at `42413116b` plus the uncommitted tranche work described below.

- The corpus is 337 knob call sites across 67 files: 323 renames, 10 hoists, 4 relocations. Measured
  with `node .agent/plans/storybook-modernization/task-plans/knob-census.js --by-placement`.
- This tranche holds 64 of them across 7 files, plus 4 already converted in the working tree. By
  file: `common/ItemsDropdown.stories.tsx` 17, `notifications/Notifications.stories.tsx` 15,
  `assets/Asset.stories.tsx` 12, `common/Widgets.stories.tsx` 11, `assets/AssetSettingsDialog.stories.tsx` 6,
  `dapps/TransactionRequest.stories.tsx` 3. `navigation/SidebarWalletsMenu.stories.tsx` has none and
  carries only the `withKnobs` decorator entry.
- One of the four remaining module-scope relocations is in this tranche, at
  `storybook/stories/assets/AssetSettingsDialog.stories.tsx:15`, a `number('quantity', 1)` inside a
  module-scope `asset` object three stories share.
- Neither remaining `callback` hoist is in this tranche. The census reports 0 for these six roots.
- `storybook/stories/_support/profileSettings.ts` exported two module-scope `select` knobs. Nothing
  imported either one: `grep -rn "currentTimeFormatSelect\|currentDateFormatSelect"` over `.ts` and
  `.tsx` outside `node_modules` returns no hits.
- `storybook/stories/common/ItemsDropdown.stories.tsx:172` passes stake pool objects as `select`
  options. `@storybook/core` rejects that at runtime: `preview-api/index.js:2916` reads
  `Invalid argType: '<name>.options' should only contain primitives. Use a 'mapping' for complex
  values.` Non-primitive options must go through `mapping`, not through `options`.
- `@storybook/addon-knobs` is `8.0.1` from `storybookjs/addon-knobs`, peered against
  `@storybook/manager-api ^8.0.0`. It is the corpus's only source of interactive controls today.
- There is no controls addon in the manifest and none in `storybook/main.ts`'s `addons` array, and
  `@storybook/core` 8.6.18 does not carry one: `grep -c "addon-controls" node_modules/@storybook/core/dist/manager/runtime.js`
  is 0, and the bundle contains no `Controls` panel registration. See the correction below.

## Files Expected To Change

- `storybook/stories/_support/argTypes.ts`, new
- `storybook/stories/_support/profileSettings.ts`
- `storybook/stories/assets/Asset.stories.tsx`
- `storybook/stories/assets/AssetSettingsDialog.stories.tsx`
- `storybook/stories/common/ItemsDropdown.stories.tsx`
- `storybook/stories/common/Widgets.stories.tsx`
- `storybook/stories/dapps/TransactionRequest.stories.tsx`
- `storybook/stories/navigation/Sidebar.stories.tsx`
- `storybook/stories/navigation/SidebarWalletsMenu.stories.tsx`
- `storybook/stories/news/AlertsOverlay.stories.tsx`
- `storybook/stories/news/AppUpdateOverlay.stories.tsx`
- `storybook/stories/news/IncidentOverlay.stories.tsx`
- `storybook/stories/news/NewsFeed.stories.tsx`
- `storybook/stories/notifications/Notifications.stories.tsx`
- `.agent/plans/storybook-modernization/task-plans/knob-conversion-patterns.md`
- `.agent/plans/storybook-modernization/task-plans/knob-census.js`

## Implementation Approach

1. Capture the label set from `index.json` of a real build before any edit.
2. Convert file by file, following `knob-conversion-patterns.md`. A knob's label becomes the arg
   name; its default becomes the arg value; its options and range configuration become an argType.
3. Where a knob label is not a usable identifier, the arg takes a camelCase name. Where the knob's
   options are not primitives, the argType carries `mapping` and the options are its keys.
4. Replace `withState` with `useArgs` at all five sites. None takes the `useState` exception: every
   piece of state here is a selection or a visibility flag that the story's own handlers can both
   set and clear.
5. Drop the `withKnobs` decorator entry from each file as its last knob goes, and the import with it.
6. Remove each `@ts-ignore` whose subject was the knob call and nothing else, leaving the ones that
   cover the surrounding expression.
7. Re-run the census, the args audit and the label diff, then the three Nix checks.

## Acceptance Criteria

- No `@storybook/addon-knobs` import remains under the six tranche roots or in
  `storybook/stories/_support/profileSettings.ts`.
- The census reports this tranche at zero call sites, and the corpus total drops by exactly the
  number this tranche held.
- `story-args-audit.js` stays at zero findings.
- The label set read from `index.json` is identical to the pre-edit reading, pair for pair.
- `compile`, `lint` and `storybook` pass as Nix derivations.

## Verification Plan

- `node .agent/plans/storybook-modernization/task-plans/knob-census.js --by-file <six roots>` before
  and after, expecting 64 and 0.
- `node .agent/plans/storybook-modernization/task-plans/knob-census.js --by-placement` over the whole
  corpus, expecting 337 before and 273 after.
- `node .agent/plans/storybook-modernization/task-plans/story-args-audit.js`, expecting exit 0 and
  no findings, with the change in the "cannot resolve" count accounted for by the `withState`
  bindings that became ordinary renders.
- `index.json` label set diffed in both directions against the pre-edit reading.
- `nix build '.#checks.x86_64-linux.compile' --no-link`, then `lint`, then `storybook`.

## Risks and Open Questions

- The date control returns a timestamp once a viewer edits it, so dropping the `new Date(...)`
  around the arg would break the one `date` site the moment the control is used. Recorded as a
  correction to `knob-conversion-patterns.md` below.
- An arg cannot depend on a Storybook global, so a knob whose options were derived from the current
  locale cannot be reproduced exactly. The two sites take the union of both locales' options and keep
  the locale-dependent value as the fallback when the arg is unset.
- Nix builds from the git tree and does not see untracked files, so a new module has to be staged
  before any check can resolve it. `storybook/stories/_support/argTypes.ts` is new in this task.

## Required Docs, Research, and Tracking Updates

- Set `task-027.status` to `completed`.
- Record the corrections listed below in this entry.

## Corrections To The Task Graph And The Reference

1. `knob-conversion-patterns.md` says of the one `date` site that "with an arg that is already a
   `Date` the inner construction is redundant". The claim rests on what a date control returns, and
   that cannot be established in this tree, because no controls addon is installed to return
   anything. `new Date(x)` reads a `Date` and a timestamp alike, so keeping it is correct under
   either answer and costs nothing. The reference is corrected to say that rather than to assert a
   return type.
2. `knob-conversion-patterns.md` gives `select(n, opts, d)` one shape: `options: Object.values(opts)`
   with inverted labels. That shape is only valid when the option values are primitives.
   `common/ItemsDropdown.stories.tsx` selects between stake pool objects, and `@storybook/core`
   refuses non-primitive `options` by name. Storybook's `mapping` is the documented answer and this
   tranche does not use it: composing a story through `@storybook/react` with `mapping` set and
   reading the render's first argument returns the label, not the mapped value, with
   `context.argTypes.<name>.mapping` present on the same context. Whether the preview's own render
   loop differs cannot be settled without a browser. The arg holds the label and the story body does
   the lookup, which gives the same result under either answer and can be read off the page.
3. `knob-conversion-patterns.md` reads a knob's label straight across into an arg name. Several
   labels in this tranche are not identifiers: `Is configurable`, `unit / decimals`, `Has wallets?`,
   `Duration (seconds)`. The reference gains the rule that such a label becomes a camelCase arg name.
4. `task-027.implementationNotes` says a nested knob in this tranche has no mechanical conversion.
   The census puts both remaining `callback` hoists outside these six roots, so no hoist arises here.
   The note describes work that belongs to a later tranche.
5. `task-027.acceptance` asks that every converted control still changes the component in the running
   workbench. It cannot be satisfied at this commit and not because of anything this task does:
   there is no controls addon in the manifest, none in `storybook/main.ts`, and none inside
   `@storybook/core` 8.6.18. Args reach the render function and the story reads them, which is what
   this tranche can claim; the panel that would let a viewer drive them does not exist yet.
   `task-034` is where the addon list is settled and is the place to add `@storybook/addon-controls`.

## Defects Found In The Repository, Not In The Plan

- `storybook/stories/common/ItemsDropdown.stories.tsx:88` opens its decorator with
  `if (context.name === 'CountdownWidget') return story();`. No story under `Common / ItemsDropdown`
  has ever been called `CountdownWidget`; the branch is a copy of the one in
  `common/Widgets.stories.tsx`, where the story does exist. Under `ItemsDropdown` it is unreachable,
  so every story there is wrapped whether or not that was intended. This is a fourth instance of the
  shape recorded in the phase 3 closing notes, and like the other three it predates this work and is
  not touched by it.
- `storybook/stories/assets/Asset.stories.tsx` carried five `@ts-ignore ts-migrate(2554)` directives
  whose only subject was a knob called with one argument. They become dead the moment the call goes,
  and dead `@ts-ignore` is invisible to `tsc`, which is how the two recorded at phase 3 survived.
  They are removed here with their subjects.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-027-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-027-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

64 knob call sites removed across 7 files, on top of the 23 already converted in the working tree
when this task was picked up. The corpus goes from 337 sites in 67 files to 273 in 60: 260 renames,
10 hoists, 3 relocations. No `@storybook/addon-knobs` import remains under the six tranche roots.

Five `withState` sites became `useArgs`, at `common/ItemsDropdown.stories.tsx` (`Generic`, `Wallets`,
`Assets`), `dapps/TransactionRequest.stories.tsx` (`Request`) and
`notifications/Notifications.stories.tsx` (`General`, folded in from `WithActionsStory` for
`WithActions`). None takes the `useState` exception. Every piece of state here is a selection or a
visibility flag that the story's own handlers both set and clear, so a viewer driving it from a
control reaches nothing the story cannot reach and nothing it cannot undo.

The two `button` knobs have no arg and did not get one. Each became an ordinary button in the story
body, rendered only when the notification is on a timer, which is when the knob existed. The prose
that told a reader to use the knob button is replaced by the button itself.

`selectedWallet` in `dapps/TransactionRequest.stories.tsx` held a wallet object in story state. It is
`selectedWalletId` now and the wallet is the lookup the select handler already performed, so the arg
is a primitive and survives the URL.

The label set is unchanged: 258 stories across 49 panels, read from `index.json` of a real build
before and after, identical pair for pair in both directions.

`story-args-audit.js` stays at zero findings. Two of its counts moved, both accounted for: renders
reading the first argument went 9 to 17, which is the eight stories that took object form with a
destructured first argument, and renders it cannot resolve went 13 to 8, which is the five
`withState` bindings that became ordinary renders.

`compile`, `lint` and `storybook` pass as Nix derivations.

## Final Outcome

Complete.

## Self-Review

Two things in this task were nearly taken on trust and were not.

The first was `mapping`. The reference's `select` row does not cover object-valued options, the
documented answer is `argTypes.mapping`, and it would have gone in unmeasured. Composing the story
showed the render receiving the label while the mapping sat on the same context's `argTypes`, so the
lookup moved into the story body, where it can be read. The instrument cannot see the preview's
render loop, which is exactly why the form that does not depend on it is the right one.

The second was an exit status. `nix build ... | tail` reports `tail`'s exit code, and the first
reading of the compile check was that. Re-run with the status captured before the pipe, all three are
green, but the first reading proved nothing, which is the shape the closing notes name.

Two things worth carrying forward. Nix builds from the git tree and does not see untracked files, so
`storybook/stories/_support/argTypes.ts` had to be staged before any check could resolve it; a new
module in a later tranche has the same requirement. And the workbench half of this task's acceptance
cannot be demonstrated at all until a controls addon exists, which is recorded above as correction 5.
