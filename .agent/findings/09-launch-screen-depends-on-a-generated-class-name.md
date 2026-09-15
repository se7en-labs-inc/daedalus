# Finding: the launch screen reaches into the document by a generated class name

**Status:** open, not scheduled
**Raised from:** writing the loading screen stories, phase 6 of the Storybook
modernization
**Scope:** `LogosDisplay`, one line
**Severity:** low likelihood, total effect. The throw is in `componentDidMount`,
there is no error boundary anywhere in the renderer, so the window goes blank at
launch rather than the animation being wrong.

---

## The measurement

`source/renderer/app/components/loading/syncing-connecting/LogosDisplay.tsx:24-30`:

```tsx
componentDidMount() {
  // Manual adjustment due to `logo-animation-data.json` canvas size
  const svg: Record<string, any> = document.querySelector(
    '.LogosDisplay_daedalusLogo svg'
  );
  svg.setAttribute('viewBox', '534 250 212 220');
}
```

Two things have to hold for that to work, and neither is stated anywhere near it.

The class name is generated. `styles.daedalusLogo` resolves to
`LogosDisplay_daedalusLogo` only because css-loader is configured with
`localIdentName: '[name]_[local]'`, in two places:
`source/renderer/webpack.config.js:70` and `storybook/main.ts:134`. The component
does not use `styles.daedalusLogo` in the selector; it repeats the generated
result as a literal. Change the pattern in either config, or add a third build
that does not set it, and the selector stops matching.

The `svg` child has to exist by the time the parent mounts. It is produced by
`lottie-web` through `react-lottie`, in that child's own `componentDidMount`.

When either fails, the result is not a missing viewBox. `querySelector` returns
`null` and the next line dereferences it:

```
TypeError: Cannot read properties of null (reading 'setAttribute')
  at LogosDisplay.componentDidMount (LogosDisplay.tsx:29:9)
```

Measured by mounting `SyncingConnectingPage` through the store harness under
jsdom, where `lottie-web` produces no `svg` at all: `document.querySelectorAll('svg').length`
is 0 and the render throws. Seven screen stories across two containers cannot be
mounted in a spec because of it.

## It is the only one

`document.querySelector` appears at 9 production call sites in
`source/renderer/app/components/` outside specs. Eight of them check the result
before using it:

| Call site | Guard |
|---|---|
| `VirtualTransactionList.tsx:73-74` | `instanceof HTMLElement` |
| `VirtualAddressesList.tsx:54` | `instanceof HTMLElement` |
| `NewsFeed.tsx:71` | `if (!(… instanceof HTMLElement)) return;` |
| `StakePoolsRanking.tsx:351` | `if (selectionInput)` |
| `BackToTopButton.tsx:42` | `if (!this.scrollableDomElement) return false;` |
| `BackToTopButton.tsx:62` | `if (!this.scrollableDomElement) return false;` |
| `SettingsLayout.tsx:18` | assigned to a nullable field, never dereferenced there |
| `StakePoolsList.tsx:25` | optional chaining, then `if (popOver)` |
| `LogosDisplay.tsx:26` | **none** |

Three of the nine, including this one, hard-code a generated class name. The
other two guard.

So this is a single omission rather than a pattern, and the smaller half of the
fix is to match the eight:

```tsx
const svg = document.querySelector('.LogosDisplay_daedalusLogo svg');
if (svg) svg.setAttribute('viewBox', '534 250 212 220');
```

The larger half is that a component should not be searching the whole document
for its own child. A ref on the wrapper, or `this.wrapper.querySelector('svg')`,
removes the dependency on the class-name pattern and on there being exactly one
of these on screen at a time.

## What it does and does not affect today

Nothing, in a shipped build. Both webpack configurations set the pattern the
literal expects, and `lottie-web` produces the element in a browser, so the
selector matches and the viewBox is applied.

What it costs today is evidence. The syncing screen is the screen every user sees
at every launch, and it is one of the two screens in the application that cannot
be mounted in a test at all. Seven stories in the screen corpus are indexed and
built but not render-checked for this reason, and they are the seven covering the
loading path.

What it would cost tomorrow is the launch screen. There is no `componentDidCatch`
or `getDerivedStateFromError` anywhere in `source/renderer/app`, so an uncaught
throw during mount takes the whole React tree down and the user gets an empty
window with no message.

## Why it was not found before

No test mounts this component. The component-level stories in
`storybook/stories/loading/` render the views below it with props, not
`LogosDisplay` itself, and the story that would have shown it renders through
webpack where the selector matches.

It surfaced the first time the loading screens were mounted through their real
containers in a spec, which is the environment where the generated class name is
not generated the same way.

## What was not done, and why

The fix, which is in shipped source. This phase writes stories, and changing a
component under `source/` is a different change with a different review.

The stories are committed and do not assert a render. They are listed in
`storybook/stories/screens/screens.spec.tsx` as the screens that throw at this
line, with the message asserted, so the day the guard lands the assertion fails
and the stories move into the mounted set.

## Which area would own it

Whoever next touches the loading screens. Two lines for the guard; the ref is a
small refactor of one component.
