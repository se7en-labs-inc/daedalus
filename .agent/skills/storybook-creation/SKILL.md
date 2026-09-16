---
name: storybook-creation
description: Create or update Storybook stories for Daedalus. Use this when asked to write stories, visual tests, storybook entries, or component demos, for a component or for a whole screen.
---

# Storybook Creation Skill

Two kinds of story live in this repository.

A **component story** renders one component against props you supply. It is for exercising a
component's own states: every variant of a button, a form with and without an error, a list at zero,
one and many.

A **screen story** mounts the application's real container through a store harness. It is for
exercising a screen as a user meets it: the container reads what it reads, the components below it
get what the container gives them, and nothing is hand-built except the store fields the screen
depends on.

Write a component story when the subject is a component. Write a screen story when the subject is a
screen. Every one of the application's 49 reachable screens already has one; if you are adding a
screen, it needs one too.

## The stack

| Piece | What it is |
|---|---|
| Storybook | 9.1.20, `@storybook/react-webpack5` |
| Story API | Component Story Format 3: a default export of meta, named exports of stories |
| Controls | Core, through `args` and `argTypes`. There is no addon to install |
| Actions | Core, through `storybook/actions` |
| Toolbar | Five globals declared in `storybook/preview.tsx` |
| Addons | `@storybook/addon-links`, the only one still published separately |
| Styling | SCSS modules, colocated with the component |
| i18n | `react-intl` 2.9.0, en-US and ja-JP |
| Components | `react-polymorph`, reached through `StoryDecorator` |
| Lint | `eslint-plugin-storybook` 9.1.20 |

`storiesOf()`, `@storybook/addon-knobs` and `@dump247/storybook-state` are gone from this repository.
`storybook/no-stories-of` makes the first one a lint error; the other two are not installed.

## Where things go

```
storybook/
  main.ts                  configuration, story globs, webpack overrides
  preview.tsx              decorators, toolbar globals, sidebar order
  stories/
    _support/              shared story infrastructure
      StoryDecorator.tsx     theme, locale and the react-polymorph skins
      StoryProvider.tsx      the mobx Provider, the real actions, wallet fixtures
      StoryLayout.tsx        sidebar and top bar frame for component stories
      argTypes.ts            helpers that build argTypes from an options table
      environment.ts         the `global.environment` fixture
      harness/               everything a screen story needs
        ScreenStory.tsx        screenDecorator, the frame a screen renders in
        storeDefaults.ts       the 24-key store map and its defaults
        requestDefaults.ts     the shape of a mobx Request
        fixtures/              domain data: wallets, transactions, assets,
                               staking, governance, voting, news, backend, router
    <domain>/              component stories, grouped by area
    screens/               screen stories, one file per screen
```

A component story for a component under `source/renderer/app/components/wallet/` goes under
`storybook/stories/wallets/`. A screen story goes under `storybook/stories/screens/<area>/`, named
after its container.

## Writing a component story

```tsx
import React from 'react';
import { action } from 'storybook/actions';
import StoryDecorator from '../_support/StoryDecorator';
import SystemTimeError from '../../../source/renderer/app/components/loading/system-time-error/SystemTimeError';
import { inCategory, optionsFrom, rangeFrom } from '../_support/argTypes';

const localeOptions = { English: 'en-US', Japanese: 'ja-JP' };

const args = {
  localTimeDifference: 90 * 1000 * 1000,
  currentLocale: 'en-US',
  isCheckingSystemTime: false,
};

export default {
  title: 'Nodes / Errors / System Time',
  decorators: [(story) => <StoryDecorator>{story()}</StoryDecorator>],
};

export const Default = {
  args,
  argTypes: inCategory('System time', args, {
    currentLocale: optionsFrom(localeOptions),
    localTimeDifference: rangeFrom({ min: 0, max: 300 * 1000 * 1000, step: 1000 }),
  }),
  render: ({ localTimeDifference, currentLocale, isCheckingSystemTime }) => (
    <SystemTimeError
      localTimeDifference={localTimeDifference}
      currentLocale={currentLocale}
      isCheckingSystemTime={isCheckingSystemTime}
      onExternalLinkClick={action('onExternalLinkClick')}
      onCheckTheTimeAgain={action('onCheckTheTimeAgain')}
      onContinueWithoutClockSyncCheck={action('onContinueWithoutClockSyncCheck')}
    />
  ),
};
```

Every prop the component requires is supplied. The ones a viewer should be able to change are `args`
and appear in the controls panel; the callbacks are not, because an action logged in the actions panel
is the useful thing to do with one, and a control over a function is not.

### When a component's props are not primitives

The example above takes numbers, a string and a boolean, so its `args` are the props. Many components
take domain objects, and a control over a `Wallet` is meaningless.

Build those from `_support/utils.ts`, which exports `generateWallet`, `generateRewardForWallet`,
`generateTransaction`, `generateMultipleTransactions`, `generateAssetToken` and `generateAddress`. Keep
them out of `args` and put only the primitives a viewer should drive there:

```tsx
import { generateWallet, generateRewardForWallet } from '../_support/utils';

const wallet = generateWallet('Main wallet', '66998000000');

const args = { isLoadingTransactions: false, numberOfTransactions: 42 };

export const Default = {
  args,
  argTypes: inCategory('Summary', args, {}),
  render: ({ isLoadingTransactions, numberOfTransactions }) => (
    <WalletSummaryHeader
      wallet={wallet}
      reward={generateRewardForWallet(wallet)}
      numberOfRecentTransactions={5}
      numberOfPendingTransactions={0}
      numberOfTransactions={numberOfTransactions}
      isLoadingTransactions={isLoadingTransactions}
    />
  ),
};
```

Most of those helpers give a different value each time they are called, and the six split into three
groups by mechanism. `generateTransaction` and `generateMultipleTransactions` draw from faker.
`generateWallet` takes its `id` from a seeded generator that advances on every call and its date from
the clock; `generateAddress` takes only its `id` from the same generator. `generateRewardForWallet` and
`generateAssetToken` are pure functions of their arguments and do repeat.

Which group a helper is in is not a guarantee it will stay in, so the rule is about which corpus you
are writing for rather than about the helper. A component story can use any of them: arbitrary content
is what finds a layout bug. A screen story should use none of them, and reach for
`_support/harness/fixtures/` instead, because a screen story is read by comparing it with the last one
and that needs the same screen to render twice.

Four things that are rules rather than taste:

**A render that reads its first argument must declare `args`.** Storybook hands a render with no
`args` an empty object, so the component renders with everything undefined and usually looks blank
rather than broken. Nothing in `yarn compile`, `yarn lint` or `yarn storybook:build` catches it.
`.agent/plans/storybook-modernization/task-plans/story-args-audit.js` scans for it and exits non-zero
on a finding; it is a script, not a check in the merge gate.

**`argTypes` are built from an options table, not written out.** `_support/argTypes.ts` exports
`optionsFrom`, `radioOptionsFrom`, `inlineRadioOptionsFrom`, `labelOptionsFrom` and `rangeFrom`. Each
takes the table the story already has and returns the control definition, so a label and its value
cannot drift apart. `inCategory(name, args, overrides)` groups a whole args object under one heading
in the controls panel.

**A control's label is its arg name.** Two controls with the same name in the same story are one
control, silently: the second registration returns the first's value and discards its default. Give
them distinct names.

**Interactive state goes through `useArgs`, not `useState`.** A story whose component drives state
through a callback updates its own args from that callback, so the viewer sees the value in the
controls panel and can drive it from there. `useState` is reserved for state that would be actively
misleading as a control: state the component owns and the story only watches, or an intermediate
a viewer could set to a value the story cannot reach or undo. There are currently no instances of the
exception in the corpus, so if you reach for it, say why in a comment.

## Writing a screen story

```tsx
import React from 'react';
import WalletUtxoPage from '../../../../source/renderer/app/containers/wallet/WalletUtxoPage';
import { screenDecorator } from '../../_support/harness/ScreenStory';
import { requestDefault } from '../../_support/harness/storeDefaults';

const distribution = { '10': 0, '100': 3, '1000': 11 };

export default {
  title: 'Screens / Wallets / Wallet UTxO',
  decorators: [
    screenDecorator(
      {
        walletSettings: {
          walletUtxos: { distribution },
          getWalletUtxosRequest: requestDefault({ wasExecuted: true }),
        },
      },
      { path: '/wallets/story-wallet-0/utxo' }
    ),
  ],
};

export const Default = {
  render: () => <WalletUtxoPage />,
};
```

`screenDecorator(storeOverrides, options)` is the whole surface.

**`storeOverrides`** is a partial map of the 24 keys in `StoresMap`, merged one key deep over the
harness defaults. Name only the stores your screen reads and only the fields it reads on them;
everything else keeps its default. Three layers merge, in order: the harness defaults, then
`StoryProvider`'s own fixtures, then your overrides.

**`options.path`** is where the screen thinks it is. It seeds a `MemoryRouter`,
`stores.router.location` and `app.currentRoute` from one value, because a screen can ask in three
ways and a screen told two different answers still renders.

**Domain data comes from `harness/fixtures/`.** `activeWallet()`, `restoringWallet()`,
`walletTokens()` with `withAssets()`, `withTransactions()`, `loadedDirectory()`, `backendPhase.ready()`
and the rest. Use them rather than writing objects: they are real domain instances with their computed
getters, they are deterministic, so a screenshot means the same thing twice, and the paired ones are
paired for a reason. Wallet tokens and the assets that resolve them are exported together because the
screens join the two and read a shortfall as loading still in progress, so half a join is a permanent
spinner rather than a missing row.

**Mount the screen the way the router mounts it.** Staking pages render inside `Staking`, governance
pages inside `Governance`, settings pages inside `Settings`. A page mounted bare is not a simpler
version of the real screen; in several cases it is one the router cannot produce, and it will throw on
a context the shell provides.

**A screen that renders nothing still gets a story.** A shut dialog, a build without the feature flag,
an overlay already dismissed: these are states users are in, and an absence in the sidebar reads as a
defect rather than as a decision.

## The toolbar

Five globals are declared in `storybook/preview.tsx` and apply to every story: theme, locale, OS
profile, number format and discreet mode. They are toolbar entries rather than per-story args because
a reader wants to change them across the whole workbench rather than one story at a time.

Do not add a sixth without a reason. Toolbar space is finite and a global that only two stories
respond to is better as an arg on those two.

## The sidebar

`storybook/main.ts` indexes stories by glob, so sidebar order comes from `storySort.order` in
`storybook/preview.tsx`. Adding a new top-level group means adding it there, or it sorts to the end.

Titles use ` / ` as the separator, and the segments are the sidebar hierarchy.
`storybook/hierarchy-separator` enforces it.

## What the checks prove

`yarn storybook:build` bundles the corpus and produces the story index. It proves a story compiles and
is registered. **It does not prove a story renders**: it never evaluates a preview module, so a story
that throws on mount, or renders an empty shell, builds green.

`storybook/stories/screens/screens.spec.tsx` is what proves the screen stories render. It composes
every one of them with `composeStories` and mounts it under jsdom, sorting each into one of four
outcomes: content on the page, nothing by design, a frame with no text, or a throw at a named line
with its message asserted. `storybook/stories/screens/harness.spec.ts` asserts the structural
properties: one story file per reachable screen, no story or fixture importing a store or an API
module, every story going through `screenDecorator`.

**There is no equivalent for the component stories, and no browser-driven or image-diff check
anywhere.** A component story that renders blank will pass every check in this repository. That is a
known gap.

## Lint

`eslint-plugin-storybook` is enabled through `plugin:storybook/recommended` in `.eslintrc`, plus two
rules that config does not place correctly here:

| Rule | Why |
|---|---|
| `storybook/no-stories-of` | `storiesOf()` is an error. It is in none of the plugin's shipped configs, because they assume the migration away from it is behind you |
| `storybook/no-uninstalled-addons` | Repointed at `storybook/main.ts`; the shipped config looks for `.storybook/main.*`, which this project does not have |
| `storybook/default-exports`, `storybook/story-exports` | A CSF file needs a meta default export and at least one named story |
| `storybook/hierarchy-separator` | ` / ` in titles |
| `storybook/no-redundant-story-name` | Drop `name` when it matches the export |
| `storybook/no-renderer-packages` | Import from `@storybook/react-webpack5`, not `@storybook/react` |

`react/function-component-definition` is off for story files: an exported arrow returning JSX is CSF's
documented form.

## Running it

```bash
yarn storybook          # the workbench, on :6006
yarn storybook:build    # static build into dist/storybook

nix build '.#checks.x86_64-linux.storybook'   # what actually gates a merge
nix build '.#checks.x86_64-linux.jest'        # includes the screen render spec
nix build '.#checks.x86_64-linux.lint'
```

Verify through Nix. The `yarn` scripts run against whatever `node_modules` the host has, and the two
have disagreed before.
