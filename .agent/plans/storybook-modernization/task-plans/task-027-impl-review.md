# task-027 implementation review

## Implementation: Iteration 1

2026-09-15.

Converted the seven remaining files. Order was smallest first, re-running the census after each so a
file that did not go to zero would be visible immediately rather than at the end:
`navigation/SidebarWalletsMenu.stories.tsx`, `assets/Asset.stories.tsx`,
`assets/AssetSettingsDialog.stories.tsx`, `common/Widgets.stories.tsx`,
`common/ItemsDropdown.stories.tsx`, `dapps/TransactionRequest.stories.tsx`,
`notifications/Notifications.stories.tsx`.

The label set was read from `index.json` of a real build before the first edit: 258 stories across 49
panels, which is the figure the epic carries.

Outcome: all six roots at zero call sites; corpus 337 to 273.

## Review: Iteration 1

Summary: correct except for one mechanism that was adopted without being measured.

`common/ItemsDropdown.stories.tsx` selects between stake pool objects. Storybook rejects
non-primitive `options` by name and points at `argTypes.mapping`, which was taken as the answer and
written into a shared helper for five later tranches to use. It was not measured first.

Measuring it: a synthetic CSF module composed through `@storybook/react`, with `mapping` set and a
render that reports its first argument, receives the label string. `context.argTypes.<name>.mapping`
is present on the same context and `context.args` is the unmapped value. The path that applies the
mapping, `prepareContext`, is shared with the preview, so whether the preview's own render loop
differs cannot be settled from here.

That is enough to decide without settling it. A story that reads `stakePoolsOptions[stakePool]` in
its body produces the same value under either answer and can be read off the page, so the helper
offers the labels and the story does the lookup.

Decision: `requires_changes`.

## Implementation: Iteration 2

2026-09-15.

`mappedOptionsFrom` became `labelOptionsFrom`, which returns the labels as `options` and a select
control and nothing else. Both stake pool sites resolve the label in the story body. The reference at
`knob-conversion-patterns.md` gained the sub-case, the reason the documented mechanism is not used,
and the rule that a knob label which is not an identifier becomes a camelCase arg name.

The `date` sub-case in the same reference was corrected while there. It asserted that the
construction around a date arg is redundant because the control returns a `Date`. Nothing in this
tree returns anything: there is no controls addon. The construction reads a `Date` and a timestamp
alike and stays.

Outcome: census 273, args audit zero, label set identical pair for pair, `compile`, `lint` and
`storybook` green as Nix derivations.

## Review: Iteration 2

Summary: the tranche is complete and every claim in it is backed by a reading taken after the last
edit.

Checked by eye rather than by instrument, because no instrument here covers it: that each converted
expression still means what it did. Four are worth naming. `clickToClose` was left undeclared by the
knob version whenever the notification was set to stay visible, and the arg version passes
`undefined` in that branch rather than the arg. The trigger button exists only when the notification
is on a timer, which is when the knob registered it. `AssetSettingsDialog`'s quantity moved from
module scope, where it was read once at import, into each story. And `TransactionRequest`'s selected
wallet became an id resolved against the same list the select handler already searched.

One thing found and not fixed: `common/ItemsDropdown.stories.tsx:88` opens its decorator with a
branch on a story name that has never existed under that panel. It predates this work, it is not a
knob, and changing it changes what four stories render. Recorded in `task-027.md`.

Decision: `approved`.
