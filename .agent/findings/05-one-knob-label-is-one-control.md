# Finding: three shipped stories show the wrong value because two controls shared a name

**Status:** open, not scheduled
**Raised from:** the knob-to-arg conversion, phase 4 of the Storybook modernization
**Scope:** Storybook stories, three files
**Severity:** low. Nothing users run is affected. Three story screens have been
showing a value other than the one written beside them, for as long as the files
have existed, and two controls have never appeared at all.

---

## The shared cause

`@storybook/addon-knobs` keys a control on its group id and its label together.
Registering a second knob under a key already in the store returns the value
already there and discards the new default, silently. There is no warning, the
call typechecks, and the story renders.

So two knobs written with the same label in the same group are one control, and
whichever call runs first decides the default both reads see. Nothing in the
repository compares a knob's label against the others in its file, and no check
can: both spellings are valid and the collision is only visible by reading the
values a story renders against the values its source states.

A second consequence of the same design: a knob registers when its call
*executes*. A knob inside a callback that nothing has invoked yet is not in the
store and does not appear in the panel.

## The three instances

**`storybook/stories/wallets/settings/_support/WalletSettingsScreen.tsx`** registers
`WalletSettingsRemoveConfirmationDialog: Wallet Name` twice in the `Delete Wallet`
group, with the defaults `Wallet To Delete` and `Wallet To Unpair`. One control.
The unpair dialog has always displayed `Wallet To Delete`.

**`storybook/stories/nodes/errors/_support/NoDiskSpaceError.tsx`** registers `text`
three times under the label `diskSpaceRequired (GB)`, with the defaults 4, 1 and 8,
and feeds them to `diskSpaceRequired`, `diskSpaceMissing` and
`diskSpaceRecommended`. One control. All three figures have always read 4, so the
screen has always claimed the same number for how much space is required, how much
is missing and how much is recommended.

**`storybook/stories/governance/Delegation.stories.tsx`** reads two knobs inside the
confirmation dialog's `onSubmit`, which runs only once a transaction has been
submitted. Neither has ever been in the panel. The same file carries two comments
describing that exact failure being found and fixed for other knobs, by moving the
reads out of the callback; whoever wrote them did not find these two.

## What was measured

The conversion read each of the three files against what its source states, which
is how all three surfaced. The collision behaviour is addon-knobs' own: a repeated
name and type returns the stored value rather than re-registering.

Two further collisions in the same sweep were *not* defects, and separating them is
the reason this is a finding rather than a bug list.
`wallets/transactions/Transaction.stories.tsx` has two knobs labelled `amount` in
different groups, and `WalletSettingsScreen.tsx` has two labelled `Wallet Name`, one
grouped and one not. Because the key is group plus label, each pair is two controls
and both behave as written.

## What it does and does not affect today

Nothing shipped. These are workbench screens.

What they affect is trust in the workbench: a reviewer looking at the unpair dialog
to check its copy reads a wallet name the story does not claim, and a reviewer
checking the disk-space message reads three identical figures where the source
describes three different ones.

## The state after the conversion

All three now use args, and **all three preserve the behaviour above rather than
correcting it**, because the conversion's invariant was that no story renders
differently. Each collision became one arg feeding the reads that shared a control.
The two callback knobs became ordinary args, which does change one thing: they now
exist before the first render, which is what their neighbours' comments were
reaching for.

So the defects are carried forward in a form where fixing each is a one-line change
to a declaration rather than an archaeology problem.

## What was not done, and why

The fixes. Giving the unpair dialog its own name arg, and the three disk-space
figures three args, each changes what those stories show. That is a decision about
what the workbench should demonstrate, not a conversion, and the conversion had a
stated invariant it would have broken.

## Which area would own it

Whoever next works on the wallet settings or node error screens. Each fix is
independent and small.
