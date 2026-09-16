# Converting a knob to an arg

The reference the phase 4 tranche tasks work from. Written once so the same
question is not answered five times with five answers.

## The difference that decides everything

A knob is a function call evaluated inside the render body on every render. It
declares itself by running. An arg is a static declaration outside the body that
arrives as the render function's first parameter.

So a conversion moves a value out of the body and into a declaration, and the
cost depends entirely on where in the body the call sits. There are five
placements, and `knob-census.js` reports which one each of the remaining call
sites is in.

## The surface

360 call sites across 73 files, measured at `de6f7259c`, and really 404: the census
that produced that figure could not see a knob reached through a factory, and
`loading/_support/loadingKnobs.ts` wrapped five of them for 44 call sites across
seven files. Corrected at `task-028`.

Zero as of `task-065`. The table below describes the surface this phase started
from and is kept because the patterns outlive the count.

| placement | count | what it costs |
|---|---|---|
| `jsx` | 191 | an arg and a prop read |
| `argument` | 87 | an arg and a reference |
| `binding` | 66 | an arg and a destructure |
| `callback` | 10 | a hoist through a function boundary |
| `module` | 6 | the call site moves before it converts |

By type: `boolean` 163, `number` 92, `text` 50, `select` 47, `radios` 3,
`button` 2, `date` 1, `optionsKnob` 1, `object` 1.

The count has been 360 since `950f60eb9` and every step down from the 396 in the
`task-001` baseline is a named deletion: 19 with the four flag-disabled story
sets at `7addc86c0`, 2 with the `/staking/epochs` screen at `e6ba8759b`, 15 with
the orphaned support modules at `5311ce0d0`.

## What each knob type becomes

A knob's first argument is its label and its last optional argument is a group
id. Both have homes.

| knob | args | argTypes |
|---|---|---|
| `boolean(n, d)` | `{ n: d }` | inferred; `control: 'boolean'` if stated |
| `number(n, d)` | `{ n: d }` | `control: 'number'`, or `{ type: 'range', min, max, step }` when the knob passed a range config |
| `text(n, d)` | `{ n: d }` | inferred; `control: 'text'` if stated |
| `select(n, opts, d)` | `{ n: d }` | `options: Object.values(opts)`, `control: { type: 'select', labels: <opts inverted> }` |
| `radios(n, opts, d)` | `{ n: d }` | same, `control: { type: 'radio', ... }` |
| `object(n, d)` | `{ n: d }` | `control: 'object'` |

Three need more than a table row.

**`optionsKnob(n, opts, d, { display })`** carries its control in the config
rather than in the function name. `radio` and `inline-radio` map to those control
types, `select` and `multi-select` likewise, and `check` and `inline-check` map
to `check` and `inline-check`. The one site in this corpus uses `inline-radio`.

**`date(n, d)`** returns a number of milliseconds, and the arg that replaces it
holds a `Date`. The one site reads
`new Date(date('startDateTime')).toISOString()`, and the construction around the
value stays. It is tempting to drop it as redundant once the arg is a `Date`, and
it is not: what a date control hands back after a viewer edits it cannot be
verified in this tree, because there is no controls addon installed to hand
anything back. `new Date(x)` reads a `Date` and a timestamp alike, so it is
correct under either answer and costs nothing.

**`button(n, handler)`** has no arg equivalent, and not for want of looking. Args
are values; a button is an action. Both sites are in
`notifications/Notifications.stories.tsx`, where the button triggers a
notification the story then hides on a timer. Each is either dropped, if the
story's other controls already reach the state, or kept as an ordinary control in
the story body.

**A `select` whose options are not primitives** cannot use the row above.
Storybook rejects a non-primitive `options` array by name: `Invalid argType:
'<name>.options' should only contain primitives. Use a 'mapping' for complex
values.` The arg holds the label, `options` is the list of labels, and the story
body looks the value up: `stakePoolsOptions[stakePool]`. Storybook's own
`mapping` would do that lookup and is deliberately not used, because composing a
story through `@storybook/react` with `mapping` set hands the render the label
rather than the mapped value. Whether the preview differs cannot be settled
without a browser, and a lookup written in the story body gives the same result
under either answer. `labelOptionsFrom` in `_support/argTypes.ts` builds the
options half.

A knob's label becomes the arg's name, so **a label that is not an identifier
becomes a camelCase name**: `Is configurable` becomes `isConfigurable`,
`unit / decimals` becomes `unitDecimals`, `Duration (seconds)` becomes
`durationSeconds`. Arg keys may contain spaces, but they are what the URL carries
and what a render destructures, and neither reads well with punctuation in it.

A group id, the trailing `groupId` argument or the shared `LOADING_KNOB_GROUP`,
becomes `argTypes: { n: { table: { category: 'Loading' } } }`.

## The five placements, worked

### 1. A binding at the top of a story body

```tsx
// before
render: () => {
  const isLoading = boolean('isLoading', false);
  return <Thing isLoading={isLoading} />;
},

// after
args: { isLoading: false },
render: ({ isLoading }) => <Thing isLoading={isLoading} />,
```

### 2. A knob inside JSX

```tsx
// before
render: () => <Thing count={number('Count', 5)} />,

// after
args: { count: 5 },
render: ({ count }) => <Thing count={count} />,
```

The story signature changes even though the body looks unchanged, which is the
whole of what this placement costs.

### 3. A knob as a call argument or an object property

```tsx
// before
render: () => (
  <Thing amount={new BigNumber(number('Amount', 66.998, { min: 0, max: 9999 }))} />
),

// after
args: { amount: 66.998 },
argTypes: { amount: { control: { type: 'range', min: 0, max: 9999, step: 1 } } },
render: ({ amount }) => <Thing amount={new BigNumber(amount)} />,
```

The surrounding expression stays. What has to be checked by eye is that it still
means the same thing with a value rather than a call.

### 4. A knob inside a callback or a mapped list

```tsx
// before
render: () => (
  <List
    items={wallets.map((w) => ({ ...w, isActive: boolean(`${w.id} active`, false) }))}
  />
),

// after
args: { activeWalletId: null },
argTypes: { activeWalletId: { options: [null, ...walletIds], control: 'select' } },
render: ({ activeWalletId }) => (
  <List items={wallets.map((w) => ({ ...w, isActive: w.id === activeWalletId }))} />
),
```

This is the placement with no mechanical conversion. A knob inside a loop
declares one control per iteration; an arg cannot, because args are declared once
outside the body. So the control changes shape, from N booleans to one selection,
and that is a change to what the story offers rather than a rename. Ten sites.

If a site cannot be hoisted without changing what the story renders, that is a
stop-and-ask, not a judgement call.

### 5. A knob at module scope

Six sites sit outside any story body: in `_support/profileSettings.ts`, in a
shared helper, or at file scope. There is no story signature to hoist to. Two
ways out, and the first is preferred:

- Give the helper a parameter and let each story pass its own arg down.
- Move the call into each story that uses the helper.

A module-scope knob is also a bug waiting to happen under CSF, because the value
is captured once at import rather than per render.

### A knob whose value feeds two components

One arg, read once in the story body, passed to both. Not two args with the same
label: two knobs with the same label were one control, and two args with the same
name are a conflict.

## Story state

`withState` is 17 call sites across 10 files. Both replacements are called inside
the story rather than wrapping it, so the story signature changes in every case.

### `useArgs` is the default

```tsx
// before
export const Thing = withState({ value: '' }, (store) => (
  <Input value={store.state.value} onChange={(v) => store.set({ value: v })} />
));

// after
export const Thing = {
  args: { value: '' },
  render: (args) => {
    const [{ value }, updateArgs] = useArgs();
    return <Input value={value} onChange={(v) => updateArgs({ value: v })} />;
  },
};
```

The value becomes a control, so a viewer can drive it and the URL carries it.
That is the reason it is the default, per locked decision 9.

### `useState` is the exception

`useState` from `@storybook/preview-api` holds story-local state that never
becomes a control. It is for scratch state that would be actively misleading if a
viewer could poke at it: a value the component owns and the story only observes,
or an intermediate a control would let a viewer set to something unreachable.

Every site that takes the exception is listed in `task-033` with a one-line
reason. The rule is written here and the list lives there, so neither becomes
per-file taste.

## What can be verified without a browser, and what cannot

Measured at `de6f7259c` by composing a synthetic CSF module through
`@storybook/react`:

- Args declared on the meta reach the render function's first parameter, and a
  story's own `args` override the meta's. Verified.
- `useArgs()` returns those args. Verified.
- Calling `updateArgs` emits `updateStoryArgs` on the addon channel. Verified,
  with a mock channel installed.
- `useState` returns its initial value. Verified.

Not verifiable here: that the preview then re-renders the story with the new
value. The portable-stories harness renders a story as a plain React component
and runs no preview, so nothing listens for `updateStoryArgs` and no setter
repaints. Unmounting and re-rendering resets the hook state rather than revealing
it, so the harness cannot distinguish a failed update from a missing re-render.

That is the same gap locked decision 7 records and the same one `task-016` hit
for the toolbar globals: the half that belongs to Storybook's own preview loop is
out of reach here. What a tranche can claim is that the control is declared, the
story reads it, and writing it reaches Storybook. Not that the workbench repaints.

State it that way in each tranche rather than reporting the acceptance criterion
met.
