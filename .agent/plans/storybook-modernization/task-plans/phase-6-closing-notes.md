# Phase 6 closing notes

Status: in progress. Opened at `task-039`; this file is written as the phase runs rather than at the
end, because its first finding is the premise the phase rests on and is worth recording the moment it
arrived.

## Why the container layer exists: the first thing it caught

The premise of phases 6 and 7 is that mounting a screen through its real container finds a class of
defect that a component-level story cannot. The first tranche produced a concrete instance on its
first run.

`source/renderer/app/components/widgets/forms/ProfileSettingsForm.tsx:130` renders
`{error && <p className={styles.error}>{error}</p>}`, and `:55` types that prop as
`LocalizableError`. A `LocalizableError` is an object, so React throws
`Objects are not valid as a React child` and the general settings page blanks instead of showing the
message. It is the only bare `>{error}<` in the component tree; 21 call sites render the same prop
through `intl.formatMessage(error)`.

**The component-level story for that form never set `error`, because its props were chosen to make the
screen look right.** That is the whole argument for screen coverage in one sentence.

A props literal is written by someone looking at the screen and deciding what it should show. It
therefore encodes the states its author thought of, and reliably omits the ones they did not — which
are exactly the states worth testing. A container fixture is written by naming what the screen *reads*
and letting the screen decide what to do with it, so a state the author never pictured is one store
field away rather than absent by construction.

The type checker was on the wrong side of this one too: the prop is typed as the thing that breaks it,
so passing a correctly typed value is what crashes. Recorded at
`.agent/findings/08-general-settings-crashes-on-error.md` and deliberately not fixed, because this
phase writes stories.

## Mounting, not building, is the check

`yarn storybook:build` passing says a story compiled and indexed. It does not say the story rendered:
locked decision 7 recorded that gap when the browser-driven render check was dropped, and phase 3
found thirteen live stories that built, indexed and rendered nothing.

`task-039` closed most of that gap with tooling already in the repository. Jest runs jsdom, transforms
scss and svg, and the repository already had container specs; what stopped it reaching the screen
corpus was `jest.config.js`'s `roots`, which listed `tests` and `source` and not `storybook`. Adding
that one directory turns every screen tranche into a test. `composeStories` runs the real story with
its real decorators, so what is asserted is what the workbench shows rather than a reconstruction.

What it still does not check is whether a screen shows the *right* thing. The bar is that the screen
mounts without throwing and puts something on the page. Worth keeping in view as the tranches land,
because "it rendered" will start to feel like "it works".

## Four things stand between a container and a render, and none is about stores

All four were paid once, at the harness, rather than once per tranche. This is the list to reach for
when a new screen will not mount.

1. **Images imported as modules.** Webpack resolves `.png` through `asset/resource` to a URL string;
   jest has no equivalent rule, so the file arrives as bytes and dies with
   `SyntaxError: Invalid or unexpected token` pointing at a PNG header, naming neither the import nor
   the screen. `DisplaySettings.tsx` loads nine theme previews before it renders anything. Mapped to a
   string stub at `tests/jest/setup/fileStub.js`, along with markdown, which the terms-of-use screens
   import the same way.
2. **A webpack-only module loader.** `i18n/translations.ts` bulk-loads locales through
   `require.context`. Specs read the one locale file they need.
3. **react-polymorph's skins.** Without its `ThemeProvider` a `FormField` renders an undefined element
   type rather than a control. `StoryDecorator` supplies it in the workbench; anything mounting a
   container outside that decorator has to supply it too.
4. **The locale frame.** In the workbench it comes from `preview.tsx`, and `composeStories` does not
   apply project annotations — it runs a story's own decorators. Supplying it in the story instead
   would nest a second `IntlProvider` inside the workbench's and take the locale toolbar away from
   every screen, so the seam stays in the spec.

## A screen that renders nothing is a screen with a story

Two containers in the first tranche return `null` by design: the asset settings dialog when it is
shut, and the splash network page outside a Flight build. Both got a story for that state.

The alternative is an absence, and an absence in a sidebar reads as a defect. A story that says "this
screen renders nothing here, and here is why" costs one entry and answers the question before it is
asked. The render check lists them explicitly rather than branching inside an assertion, so each case
carries its own expectation.

## The baseline discipline, restated for this phase

The 258-pair component label set has been the invariant since phase 3. In phases 6 and 7 it stays
exactly that: **nothing may leave it.** Screen stories are tracked as additions on top, all under
`Screens /`, and every tranche's label diff is read in both directions against it.

This is why `task-040`'s note to delete the About component story was corrected rather than followed:
the note would have removed a registration, and a later reader following it would not find out until
the diff.
