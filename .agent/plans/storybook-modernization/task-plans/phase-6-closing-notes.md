# Phase 6 closing notes

Status: complete. Opened at `task-039`.

Twenty-nine of the application's forty-nine reachable screens now have a story that mounts the real
container. Seventy stories, 1,226 lines under `storybook/stories/_support/harness/`, of which 350 are
its own spec, and the 258-pair component label set untouched throughout.

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
screen look right.**

A props literal is written by someone looking at the screen and deciding what it should show. It
therefore encodes the states its author thought of, and reliably omits the ones they did not. Those
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
   apply project annotations: it runs a story's own decorators. Supplying it in the story instead
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

## What the phase found, and how

Three defects, none of which any check in this repository could previously have reported. All three
were found the same way: by rendering something and then asking what came out, rather than by reading
what went in.

| Found | By | Recorded |
|---|---|---|
| The general settings screen blanks instead of showing a failed locale write | Mounting the container with a failed request in the store | `.agent/findings/08-general-settings-crashes-on-error.md` |
| The launch screen dereferences an unguarded `document.querySelector` on a generated class name, in an application with no error boundary | Mounting the syncing screen where the generated name differs | `.agent/findings/09-launch-screen-depends-on-a-generated-class-name.md` |
| The newsfeed target type names a field nothing reads, so every news story in the corpus rendered an empty feed | Counting what came out of `NewsCollection`, not what went into it | `.agent/findings/10-the-newsfeed-target-type-names-the-wrong-field.md` |

A fourth was in the harness rather than in shipped source, and is fixed. `StoryProvider` spread its
own fixtures at the same level as a story's overrides, so a story naming `wallets` to set one flag
lost the active wallet the provider supplies. Its character is worth keeping: the screen still
rendered, in a state the application really has, and nothing about the output said a fixture had been
discarded. It was caught because a story asserted that something was on the page and got nothing.

## The override surface

This is what phase 8 needs to write up. It is four things.

**`screenDecorator(storeOverrides, options)`** is the whole public surface. Every screen story in the
corpus calls it and nothing else, which `harness.spec.ts` asserts per file.

**`storeOverrides`** is a partial map of the 24 keys in `StoresMap`, merged one key deep over the
harness defaults. A story names the stores its screen reads and the fields it reads on them; anything
it does not name keeps the default. Three layers merge, in order: the harness defaults, then
`StoryProvider`'s own fixtures, then the story's overrides. All three merge one key deep, and the
middle layer exists because 258 component stories depend on it.

**`options.path`** is where the screen thinks it is. It is the one value the harness derives rather
than states: it seeds a `MemoryRouter`, `stores.router.location` and `app.currentRoute`, because three
independent statements of the same fact can disagree and a screen with two answers still renders.

**Named fixtures**, for the states that are not one field. `backendPhase` carries one per member of
the `LoadingPhase` union, each with the observables that cause the phase as well as the phase, because
the loading screens read both. The news collections are real `NewsCollection` instances rather than
stand-ins, because the containers read computed getters off them. `requestDefault` carries the five
fields and two methods a container reads off a `Request`.

The defaults depart from the real stores in exactly two places, both deliberate and both recorded at
the point of departure: `networkStatus` is settled rather than cold, and `backend` is `ready` rather
than `starting`. Both real stores initialize to a state that lasts under a second, and defaulting to
it would have cost every screen that reads them an override to get out of it.

## What a tranche costs

The plan estimated twelve hours a tranche. That figure cannot be checked against this record: the work
ran as one session, and any hours number here would be invented and then compounded by being used to
estimate phase 7. What follows is what was measured.

| Tranche | Screens | Story lines | Lines per screen | Harness gaps closed first |
|---|---|---|---|---|
| 1, settings and static | 8 | 183 | 22 | the harness itself |
| 2, profile and errors | 8 | 316 | 39 | 4 |
| 3, loading and diagnostics | 5 | 295 | 59 | 2, plus a canvas the test environment lacked |
| 4, news and overlays | 4 | 185 | 46 | 0 |
| 5, chrome | 4 | 245 | 61 | 3, plus one harness defect |

Two things move the cost, and neither is the number of screens. The first is how many fields the
harness is missing when the tranche starts, which is knowable in advance by reading the render bodies
and was done that way from tranche 2 onwards. The second is how many states a screen has: the loading
page is one screen and six stories, because it selects between three trees and layers two overlays on
one of them.

Tranche 4 closed no gaps at all, which is the effect of the store task before it having been done as a
sweep rather than as a list.

## What the corpus does not duplicate

Sixty-five distinct store or field names appear inside a `screenDecorator` call across the 29 story
files. Nine appear in three or more files, and every one of those nine is a store name, the `path`
option, or a request's `isExecuting`. No field is set the same way in three different stories.

That is the check that says the defaults are right. Had three screens been overriding the same pair
identically, the default was wrong, and the next twenty screens would have paid for it.

## Four outcomes, because "it rendered" is not one thing

The render spec sorts every screen story into one of four groups, and each of the four names a real
distinction rather than a convenience:

- **mounts and puts content on the page**, 55 stories, and the assertion that found two of the three
  defects above;
- **mounts and renders nothing**, 5 stories, for the containers that return null by design: a shut
  dialog, a non-Flight build, a dismissed recommendation, no incident to announce, no update waiting;
- **mounts, renders a frame, shows no text**, 3 stories across two screens, for the notification bar
  with nothing active and the top bar with no wallet open on mainnet;
- **throws at a named line**, 7 stories, for the screens blocked by finding 09, asserting the message
  so the day a guard is added the assertion fails, and they move into the first group.

The fourth group is the one to keep. An exclusion list would have said nothing, now or later; an
assertion that a screen throws is an instrument that reports when the defect is fixed.

## What carries into phase 7

The harness has met no screen larger than seven stores or three override lines. `WalletSummaryPage`
reads about twenty-five fields across nine stores and is the screen this whole shape was designed around.
`task-050` is where that either holds or does not, and it is the first thing phase 7 does.

Two items of debt go with it. `composeStories` stops inferring past about a dozen story modules and
collapses to `unknown`, so `screens.spec.tsx` names the type it documents instead; the module map
grows in every remaining tranche. And `TopBarContainer` is the one container whose exported type still
requires the props `inject` supplies, which its story names rather than suppresses.
