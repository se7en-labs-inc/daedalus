---
description: Component and screen development with Storybook
---

# Storybook Workflow

Storybook is the workbench for developing a component or a screen in isolation, and the place a
reviewer looks at one without building the application.

For the conventions a story has to follow, read `.agent/skills/storybook-creation/SKILL.md`. This
document is about running the thing, finding your way around it, and what to do when a story will not
mount.

## Commands

```bash
yarn storybook          # dev server on http://localhost:6006
yarn storybook:build    # static build into dist/storybook
```

Both run outside the Nix dev shell. The merge gate does not:

```bash
nix build '.#checks.x86_64-linux.storybook'   # the build, as CI runs it
nix build '.#checks.x86_64-linux.jest'        # includes the screen render spec
nix build '.#checks.x86_64-linux.lint'        # includes eslint-plugin-storybook
```

Never report a check as passing on the strength of the `yarn` script. The two have disagreed before,
in both directions.

## Layout

Configuration lives at the top of `storybook/`, not in a `.storybook/` directory:

- `storybook/main.ts`: framework, story globs, webpack overrides.
- `storybook/preview.tsx`: global decorators, the five toolbar globals, sidebar order.

Stories live under `storybook/stories/`, split into three:

- `_support/`, shared infrastructure. `StoryDecorator` supplies theme, locale and the react-polymorph
  skins; `StoryProvider` supplies the mobx `Provider`, the real actions and the wallet fixtures;
  `StoryLayout` supplies a sidebar and top bar frame; `argTypes.ts` builds controls from options
  tables.
- `_support/harness/`, everything a screen story needs: `ScreenStory.tsx` exporting `screenDecorator`,
  a 24-key store map with defaults in `storeDefaults.ts`, the mobx `Request` shape in
  `requestDefaults.ts`, and domain data under `fixtures/`.
- `<domain>/` and `screens/`, the stories themselves. Component stories by area, screen stories one
  file per screen.

A second glob picks up `*.stories.tsx` and `*.story.tsx` colocated under
`source/renderer/app/`, for components whose stories are kept next to them.

## The two kinds of story

A **component story** renders one component against props you supply, exercising that component's own
states.

A **screen story** mounts the application's real container through the store harness, exercising a
screen as a user meets it. All 49 reachable screens have one.

The skill document covers writing both. The thing to know before you start is that they fail
differently: a component story that is wrong usually looks wrong, and a screen story that is wrong
usually renders a real state of the application that is not the one you asked for.

## The toolbar

Five globals apply across every story: theme, locale, OS profile, number format and discreet mode.
They are declared in `storybook/preview.tsx` and change the whole workbench rather than one story.

The theme switch is the one worth using deliberately. Several screens have colors that only differ
under one theme, and a review done entirely in the default misses them.

## When a story will not mount

The workbench and the spec fail in different ways, and most of what follows only bites in the spec.

**"Module parse failed" with no file named.** Two copies of webpack. `storybook/main.ts` takes webpack
from the builder's own resolution path for exactly this reason; if you add a plugin, construct it from
the same copy.

**A story builds but renders nothing.** `yarn storybook:build` never evaluates a preview module, so it
cannot tell. For a screen story, `storybook/stories/screens/screens.spec.tsx` will catch it. For a
component story, nothing will; check it in the browser.

**A screen story throws on a store field.** The harness carries all 24 store keys, but a field it has
never needed is absent. Add it to `storeDefaults.ts` rather than to your story, and note whether it is
a method: an absent field reads `undefined` and usually renders something wrong, while an absent
method throws and renders nothing.

**A screen story renders a real state that is not the one you asked for.** Almost always a fixture
supplied half a pair. Wallet tokens without their assets read as loading in progress; a transaction
list without `hasAny` reads as an empty wallet. The fixtures export paired shapes for this reason; use
them whole.

**A page throws on a context in the spec but works in the browser.** You mounted it bare, and the
router mounts it inside a shell. Staking pages go inside `Staking`, governance pages inside
`Governance`, settings pages inside `Settings`.

**A spec file fails at import with `SyntaxError: Unexpected token 'export'`.** An ESM-only package in
the graph. `jest.config.js` lists the ones the screens reach in `transformIgnorePatterns`; add the new
one there rather than mapping the module to a stub, which would leave the screen mounting something
that is not the screen.

**A spec file fails on a browser global.** jsdom omits several that every real environment has.
`jest.setup.js` installs WebCrypto, `TextEncoder` and `TextDecoder`; `tests/jest/setup/canvasStub.js`
answers canvas calls, which an animation library makes at import time.

## What the checks prove, and what they do not

`yarn storybook:build` proves a story compiles and is registered in the index. It does not prove a
story renders.

The screen stories are covered by two specs. `screens.spec.tsx` composes every one with
`composeStories` and mounts it under jsdom, sorting each into one of four outcomes: content on the
page, nothing by design, a frame with no text, or a throw at a named line with its message asserted.
`harness.spec.ts` asserts the structural properties: one story file per reachable screen, no story or
fixture importing a store or an API module, and every story going through the shared frame.

**The component stories have no render check, and there is no browser-driven or image-diff check
anywhere in this repository.** A component story that renders blank passes everything. That is a known
gap. `story-args-audit.js` under `.agent/plans/storybook-modernization/task-plans/` catches the most
common cause of it, a render reading its first argument with no `args` declared, and it is a script
rather than a check in the merge gate.

## Adding a screen

A screen added to the application needs a story, and `harness.spec.ts` will fail until it has one: it
asserts the file count against the number of reachable screens.

1. Read the container's render body and list what it reads.
2. Add anything missing to `storeDefaults.ts` or `fixtures/`.
3. Write the story with `screenDecorator`, naming only what the screen reads.
4. Register it in `screens.spec.tsx` and update the counts in both specs.
