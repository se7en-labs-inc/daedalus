Implementation: Iteration 1
Timestamp: 2026-09-17T16:55:00Z

Changes made:
- `AssetInput.tsx`: one piece of state, `hasRefusedSeparator`; `isInRawUnits`
  lifted out of `render` into a method so the handler and the render read the
  same predicate; `handleRawUnitsInput` on the `NumericInput`'s `onInput`; the
  notice rendered directly below the field with `role="alert"`;
  `componentDidUpdate` withdrawing the state when the row's denomination
  resolves.
- `messages.ts`: `assetInputSeparatorRefusedNotice`.
- `AssetInput.scss`: `.separatorRefusedNotice`, on the same `error-message`
  mixin as the sibling notice.
- `AssetInput.spec.tsx`: the keystroke helper rewritten, the property helper
  added, and the cases regrouped. 25 tests became 36.
- The four translation artifacts, regenerated.

Files touched:
- the four source files above
- `source/renderer/app/i18n/locales/{en-US,ja-JP,defaultMessages}.json` and
  `translations/messages.json`
- `.agent/plans/asset-metadata-cache/task-plans/task-047.md`,
  `task-047-plan-review.md`, `task-047-impl-review.md`
- `.agent/plans/asset-metadata-cache/asset-metadata-cache-tasks.json`
- `.agent/plans/asset-metadata-cache/asset-metadata-cache-prd.md`

**What the sequence does, before and after.** Driven against the component tree,
one event per character, each carrying what the input holds plus one:

| Keystroke | Input shows | Form holds | Row says |
|---|---|---|---|
| `1` | `1` | `1` | nothing |
| `.` | `1` | `1` | the separator was refused |
| `5` | `15` | `15` | the separator was refused |

Before this change the third row was `15`, `15`, nothing. The amount is
unchanged by the fix and that is deliberate: a field that counts whole units
cannot hold one and a half of anything, so the only thing the fix can alter is
whether the user is told.

**Why `onInput` and not a key handler.** `react-polymorph`'s refusal never
reaches our `onChange`: `NumericInput.js:87-91` compares the accepted value
against the previous one, finds them equal, and does not call the handler. The
raw `input` event is the only place the pre-revert string is visible, and it is
the same string the library's regex tested, so the notice and the refusal cannot
disagree. It also covers pasting, dragging text in and autofill, which a key
handler does not.

**The en-US placeholder was stripped by hand.** `yarn i18n:manage` adds a new
key to every locale file with the `!!!` marker intact. Left alone, an en-US user
reads the marker in the notice. The three sibling `assetInput` entries are
stripped in `en-US.json` and prefixed in `ja-JP.json`, and this one now matches
them. Re-running `i18n:manage` afterward changes nothing, which is what the
`i18n` check requires: it snapshots the artifacts, regenerates, and diffs.

**Reinstating the defect, twice.**

| Reinstated | Result |
|---|---|
| `onInput` removed, which is the shipped build | 17 of 36 fail |
| The notice cleared from the accepted-value handler, as the sibling notice is | 13 of 36 fail |

The second fails the typed cases and passes every pasted case, because a
refused paste changes no value and so never reaches the handler that would
dismiss the notice. A spec that drove only pastes would have called that
implementation correct, which is the same shape as the model error that let
the original defect through.

Verification:
- `nix build '.#checks.x86_64-linux.compile'` — 0
- `nix build '.#checks.x86_64-linux.lint'` — 0
- `nix build '.#checks.x86_64-linux.stylelint'` — 0
- `nix build '.#checks.x86_64-linux.i18n'` — 0
- `nix build '.#checks.x86_64-linux.jest'` — 0
- `AssetInput.spec.tsx` alone: 36 passed.

No new `@ts-ignore` and no new `@ts-expect-error`. `package.json` and
`yarn.lock` unchanged. `nix fmt` over the four changed source files reports 0
changed.

Deviations from the approved plan:
- None.

Outcome: Implementation complete and ready for review

Review of Iteration 1
Timestamp: 2026-09-17T17:10:00Z

Acceptance criteria, each against the evidence:

1. *Signalling at the separator and at every keystroke after it.* Met, and
   asserted as a property over the sequence rather than at its end: the helper
   records the amount the form holds and whether the row is signalling at each
   keystroke, and the assertion is that no keystroke from the separator onwards
   is unsignalled. A failure prints the amounts, which are the amounts that
   would have been submitted silently.

2. *The override-to-zero case.* Met, as its own group, with the notice naming
   the ticker. It is the dangerous one: 1.5 of a six-decimal token is 1500000
   units, so the digits `15` are a hundred-thousandth of the amount intended,
   and the label over that field says "to 0 decimal places" rather than naming
   units at all.

3. *A refused paste.* Met, and the expected amount differs from the typed case
   by design. The paste is refused whole and the amount does not move; the row
   says so anyway, because a paste that disappears without explanation is the
   same silence approached from the other side.

4. *Nothing raised without a separator.* Met, in both denominations, and this is
   the criterion that gives the rest their meaning. A notice raised by any amount
   in a raw-units field would satisfy criteria 1 to 3 and report nothing.

5. *A field with decimal places is unaffected.* Met, typed and pasted, and the
   guard it exercises is the first line of the handler.

6. *Survives a retype, withdrawn on resolution.* Met. The first half is the
   assertion that keeps the sibling notice's dismissal from being reintroduced;
   the second keeps the row from asserting that a field counts whole units after
   it has stopped doing so.

7-8. *Checks, suppressions, dependencies.* Met.

Three judgements worth naming.

**The spec was the defect, and the component fix was the smaller half.** The old
spec drove `1`, `1.`, `1.5` into a field that reverts refused characters, so the
third string re-supplied a character the input no longer held. It asserted `1`,
a user got `15`, and both were correct about their own world. Correcting the
helper to append to what the input currently holds turned the same three
characters into a failing case before a line of the component had changed. No
assertion written on top of the old helper meant anything, which is why the
model was fixed first rather than alongside.

**Treating `.` and `,` as one class is a judgement against a false positive.**
In the profile whose group separator is a full stop, typing `1.234` for one
thousand two hundred thirty four raises the notice for an amount that came out
right. The sentence is still true, since grouping is refused in a raw-units
field as well, and the alternative misses the user who types the other
convention's decimal point and is wrong by a factor of ten. The space group
separator is excluded because a space cannot mean a fraction.

**The notice is monotone, and that is a cost paid on purpose.** A row where a
separator was once attempted keeps saying so until its denomination resolves,
including after the amount has been cleared and retyped correctly. Dismissing it
on the next keystroke is the natural implementation, is what the sibling notice
does, and hides the notice on the one keystroke that changes the amount. Of the
two errors, a notice that outstays its welcome is the cheaper.

What this does not do, so it is not mistaken for finished: the amount the field
ends up holding is still the units-only reading, and a user who reads the notice
and types `15` anyway sends `15`. Submission is not blocked, because a raw-units
field cannot express the amount they meant and a second control over one failure
adds nothing to a sentence printed beside the amount. `task-027`'s Scenario 4
has not been run, and its expected result — that the field holds `1` after
typing `1.5` — restates the model this task corrected, so it needs amending
before an operator can use it. That file is owned elsewhere and is recorded
rather than edited.

Summary: the refusal is now visible at the keystroke that refuses it and stays
visible while the digits behind it are typed, in both paths that reach the
integers-only input, for typing and for pasting. The finding worth keeping is
that a component whose refusal reverts the input cannot be driven by cumulative
strings at all, because the string the next keystroke appends to is the
component's output rather than the test's input, and a spec built that way
asserts the refusal it supplied instead of the sequence a user produces.

Decision: approved
