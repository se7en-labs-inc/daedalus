# Task task-040: Screen tranche 1: profile and app only, 8 screens

## Task ID and Title

- ID: `task-040`
- Title: `Screen tranche 1: profile and app only, 8 screens`

## Why Chosen Now

`task-040.dependencies` is `[task-039]`, complete. Its own note says this tranche establishes the file
layout and naming for the whole screen corpus, because 41 screens follow it.

## Interaction Mode

- Mode: `agent_execution`.

## Scope

- The 8 screens named in the entry's roster, each with a story file at the named path.
- The shared screen decorator the remaining 41 screens will use.
- The layout, naming and sidebar placement convention for the screen corpus.
- A render check covering every story in the tranche.

## Non-Goals

- No fix to anything found in `source/`. This phase writes stories.
- No request sweep and no `networkStatus` fill; `task-041` owns both.

## Dependencies

- `task-039`, complete.

## Live Repo Findings Verified For Planning

Verified at `3eb842c74`.

- Each container's store reads, taken from its `render`: `DisplaySettingsPage` reads
  `profile.currentTheme`; `GeneralSettingsPage` reads four profile formats plus
  `setProfileLocaleRequest.error`; `TermsOfUseSettingsPage` reads `profile.termsOfUse` and
  `app.openExternalLink`; `SupportSettingsPage` reads `profile.currentLocale`,
  `profile.analyticsAcceptanceStatus`, `app.environment`, `app.openExternalLink` and
  `app.isDownloadNotificationVisible`; `SecuritySettingsPage` reads no store; `AboutDialog` reads
  `app.environment` and `app.openExternalLink`; `SplashNetworkPage` reads `app.openExternalLink`;
  `AssetSettingsDialogContainer` reads `uiDialogs.isOpen` and `assets.editedAsset`.
- `SplashNetworkPage.tsx:20-28` returns `null` unless `global.isFlight`. The screen does not exist
  outside a Flight build.
- `AboutDialog.tsx:26-33` renders into a `ReactModal`, which portals to the document rather than into
  the container it is mounted in.
- `AssetSettingsDialogContainer.tsx:33` returns `null` unless its dialog is open and an asset is being
  edited.

## Files Expected To Change

The 8 story files at the paths in `targetPaths`, plus
`storybook/stories/_support/harness/ScreenStory.tsx` (new),
`storybook/stories/screens/screens.spec.tsx` (new),
`storybook/stories/_support/harness/storeDefaults.ts`,
`storybook/stories/_support/environment.ts`, `storybook/preview.tsx` and `jest.config.js`.

## The Convention This Tranche Sets

**Layout.** `storybook/stories/screens/<area>/<ContainerName>.stories.tsx`, matching the entry's
`targetPaths` exactly. Areas mirror the container directories under
`source/renderer/app/containers`.

**Title.** `Screens / <Area> / <Screen>`, with `Screens` added to `preview.tsx`'s sort order after the
component panels. Component panels above, screens below, so the two layers read as two sections rather
than interleaving. The 49 component panels keep their titles and their order untouched.

**The decorator.** `screenDecorator(storeOverrides)` from `_support/harness/ScreenStory.tsx` supplies
what the application gives a container: the theme and locale frame from `StoryDecorator`, and the mobx
`Provider` from `StoryProvider`. A screen names the stores it reads and the fields it reads on them,
and nothing else, so the override reads as a description of that screen's dependencies. Per-story
decorators override the meta's for a variant.

**The render check.** `screens.spec.tsx` composes every story in the tranche and mounts it. This is
the part the phase turns on, and `task-039` is what made it possible.

## What Mounting Found That The Build Could Not

All 8 screens build. Four of the twelve stories did not render, and each failure was a fact about the
screen rather than about the harness.

1. **`AboutDialog` renders through a portal.** The assertion was reading the container the renderer
   returns, and the dialog attaches to the document. Asserting on `baseElement` covers both. Reading
   `container` would have reported an empty screen while the dialog was on display, which is the
   false negative that matters most here.
2. **`SplashNetworkPage` returns null unless `global.isFlight`.** The screen only exists in a Flight
   build. It now has two stories, one per side of that branch, and the second documents that the
   screen is absent rather than broken.
3. **`AssetSettingsDialogContainer` returns null unless its dialog is open.** Same shape, and the
   closed state is what most routes see, so it is a story too.
4. **`GeneralSettingsPage` crashes when its locale request carries an error.** This is a defect in
   shipped source, written up below.

## Defect Found In The Repository, Not In The Plan

`source/renderer/app/components/widgets/forms/ProfileSettingsForm.tsx:130` renders
`{error && <p className={styles.error}>{error}</p>}`, and `:55` types that prop as
`LocalizableError`. A `LocalizableError` is an object, so React throws
`Objects are not valid as a React child` and the settings page blanks instead of showing the message.

It is the only place in the component tree that does this. `grep -rn ">{error}<"` over
`source/renderer/app/components/` returns one hit; 21 components render the same construct through
`intl.formatMessage(error)`, including two that are otherwise identical.

Written up at `.agent/findings/08-general-settings-crashes-on-error.md`. **The story that
demonstrates it is deliberately not committed**: a story whose only content is an uncaught exception
fails the render check and tells a reader the workbench is broken rather than the screen. The story
goes in with the fix, and the story file records why it is missing.

This is the first thing a container-level story found that a component-level story could not, which
is the argument for the phase in one example: the component story never set `error`, because its props
were chosen to make the screen look right.

## Acceptance Criteria

- All 8 story files exist at the paths in `targetPaths` and appear in the sidebar.
- Each story mounts its real container through the harness `Provider`, not a props object.
- Each store override names only the keys that screen reads.
- Every story in the tranche is covered by the render check.
- `compile`, `lint`, `jest` and `storybook` pass as Nix derivations.
- No new `@ts-ignore` directives.

## Verification Plan

- `screens.spec.tsx` composes all 12 stories and asserts each either puts content on the page or
  renders nothing deliberately, with the second list enumerated rather than branched on.
- `index.json` diffed against the component baseline: additions only, all under `Screens /`.
- Four Nix checks and the args audit.

## Risks and Open Questions

- The label set grows from here. The 258-pair component baseline stays the invariant it has been since
  phase 3 — nothing may leave it — and screen stories are tracked as additions on top.

## Required Docs, Research, and Tracking Updates

- Set `task-040.status` to `completed` and its 8 subtasks likewise.

## Corrections To The Task Graph

1. `task-040.acceptance` says the stories should appear "under the settings group". They appear under
   a new top-level `Screens` group, because five of the eight are not settings screens and mixing
   container stories into the component panels would make both harder to read. The sort order puts
   `Screens` after the component panels.
2. `task-040.implementationNotes` says `AboutDialog` already has a container story at
   `nodes/about/About.stories.tsx:12-14` built on a props literal at `nodes/_utils/props.ts`, and that
   the literal should be deleted. The props file is still read by other stories in that panel, so it
   stays; the About panel keeps its component-level story and the screen story is additional. Deleting
   the component story would remove a sidebar registration from the 258-pair baseline, which is the
   one thing this phase may not do.

## Review-Log Paths

- `.agent/plans/storybook-modernization/task-plans/task-040-plan-review.md`
- `.agent/plans/storybook-modernization/task-plans/task-040-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

8 screens, 12 stories, all mounting their real containers through the harness `Provider`.

The component baseline is intact: **nothing left the 258 pairs**, and the 12 additions are all under
`Screens /`. The corpus is 270 stories across 57 panels.

Every story is covered by the render check, which passes: 10 put content on the page and 2 render
nothing deliberately, each named.

`compile`, `lint`, `jest` and `storybook` pass as Nix derivations. The args audit is at zero.

## Final Outcome

Complete.

## Self-Review

The tranche's value was not the eight files. It was that mounting them found four things, three of
which are properties of the screens that no component story could have shown, and one of which is a
shipped defect that has been reachable since the form was written.

The temptation was to make the four failures go away. Two of them were my assertion being wrong about
portals and about a build flag; those are fixed. The other two are the screens telling the truth, and
they became stories rather than exclusions, because "this screen renders nothing here" is worth a
sidebar entry when the alternative is a reader wondering whether it is broken.

Four more configuration gaps surfaced and all four were one-offs rather than per-screen costs: a
markdown module that the ambient wildcard does not cover for relative imports, `flatMap` outside the
effective library surface, and two lint rules about how a spec and a decorator are written. The
markdown one is worth remembering: the `.scss` imports that look like precedent are served by
generated per-file declarations, not by the wildcard, so the wildcard is not the pattern it appears to
be.
