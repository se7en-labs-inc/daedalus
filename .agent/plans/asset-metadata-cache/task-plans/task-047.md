## Task ID and Title

`task-047` — Say that the decimal separator was refused, in the row that refused
it.

## Why Chosen Now

Found in manual QA on 2026-09-17, and it is a release blocker. `task-003`
closed the paste path and left the typed path open, and `task-027`'s Scenario
4 names a failure here as the highest severity in this plan and as stopping
the release. It is the one defect in this plan whose harm is a wrong amount
reaching a signed transaction rather than a wrong amount being refused.

## Interaction Mode

`agent_execution`.

The defect, the fix and the proof that the fix is load-bearing are all settled
by a component tree in jsdom, because the sequence that produces it is three
keystrokes into one field. What an operator adds is `task-027`'s Scenario 4
against a real wallet, which is what found it.

## Scope

The moment a decimal separator is refused in an amount field denominated in raw
units, and whether anything says so.

## Non-Goals

- No change to `allowOnlyIntegers` or to which rows it is set on. That part of
  `task-003` is correct and the digits the field accepts do not change.
- No change to the submit path, to `formattedAmountToNaturalUnits`, or to the
  asset field's validators. The amount submitted stays a pure function of the
  display string.
- No change to either unit label. Both are accurate; neither is a signal,
  which is the finding rather than a defect in them.
- No blocking of submission, and no clearing of the field.
- No change to `react-polymorph`.

## Dependencies

`task-003`.

## Research Consulted

- `asset-metadata-cache-prd.md:1294-1406`, the cold cache and the send path,
  for the two safety rules the raw-units field exists to satisfy.
- `task-003.md`, for what was asked and what its test cases asserted.
- `task-027.md`, Scenario 4, for the operator procedure and its expected result.

## Docs, Workflows, and Skills Consulted

- `CLAUDE.md` for the spec-naming, decorator and MobX conventions, and for the
  rule that a check is verified through `nix build` and not through a `yarn`
  script.
- `.agent/skills/i18n-messaging/SKILL.md` for the message id, the `!!!` prefix
  and the `description` requirement.

## Live Repo Findings Verified For Planning

Each was driven rather than read, against the component tree at `5bd24fee1`.

1. **The defect reproduces, and it needed the keystroke model corrected first.**
   Driving `1`, then `.`, then `5` as three events, each carrying what the input
   currently holds plus one character, leaves `field.value` at `15` for
   `decimals` undefined and for `decimals === 0` alike. The existing spec drove
   `1`, `1.`, `1.5` and reported `1`.

2. **The reverted character is why.** `NumericInput.js:206-211` returns
   `{ caretPosition: changedCaretPosition - 1, fallbackInputValue, value }` on a
   regex failure, where `value` is the previous props value. `onChange` at
   `:87-91` then compares `value !== result.value`, finds them equal, and does
   not call the handler, so `assetField.onChange` is never reached and React
   restores the input to `1`. Measured: the DOM input reads `1` after the
   refused `.` and `15` after the `5`.

3. **Suppressing the keystroke changes nothing.** Preventing the default action
   of a printable key on a text input means no character is inserted and no
   `input` event fires, so the sequence becomes indistinguishable from typing
   `15`, which finding 1 already drives and which yields `15`. There is no state
   anywhere recording that a separator was attempted, which is the whole of the
   defect.

4. **The event props reach the element.** `NumericInput.render` spreads
   everything but `onChange` and `value`; `Input.render` spreads everything but
   its own ten; `InputSkin` passes the rest through
   `filter-invalid-dom-props`, whose allow-list carries `onInput`, `onKeyDown`
   and `onPaste`. Driven: all three fire on the `<input>` under `AssetInput`,
   and `onInput` reports the pre-revert value.

5. **The two paths to the integers-only input do not carry the same label.**
   Unresolved decimal places render `assetInputRawUnitsLabel`, which names whole
   ledger units. A user override of zero renders
   `assetInputDecimalUnitsLabel` with `decimals` 0, which reads "to 0 decimal
   places" and never says "units". The dangerous case is therefore the one with
   the weaker label.

6. **A refused paste is silent in the other direction.** Pasting `1.5` fails the
   same regex, so the amount does not move at all and the pasted text
   disappears with nothing said.

7. **The sibling notice does the one thing this must not.** The denomination
   notice is dismissed from the asset field's `onChange` hook at
   `WalletSendForm.tsx:966-971`. Copying that here would withdraw the notice on
   the keystroke that changes the amount.

8. **Every profile spells its decimal separator `.` or `,`.**
   `common/types/number.types.ts:6-19` gives three formats; the group separator
   is `,`, `.` or a space, and the decimal separator is `.` or `,` in all three.

## Files Expected To Change

- `source/renderer/app/components/wallet/send-form/AssetInput.tsx`
- `source/renderer/app/components/wallet/send-form/AssetInput.spec.tsx`
- `source/renderer/app/components/wallet/send-form/AssetInput.scss`
- `source/renderer/app/components/wallet/send-form/messages.ts`
- `source/renderer/app/i18n/locales/en-US.json`,
  `ja-JP.json`, `defaultMessages.json`, `translations/messages.json`
- `.agent/plans/asset-metadata-cache/asset-metadata-cache-tasks.json`
- `.agent/plans/asset-metadata-cache/asset-metadata-cache-prd.md`
- the three review-log files for this task.

## Implementation Approach

**The row gains one piece of state: whether a separator has been refused in it
while it was denominated in raw units.** It is set from the raw DOM `input`
event, which carries the text the field was asked to hold before
`react-polymorph` reverts it. That string is the one the library's own regex
refuses, so the notice appears exactly when the field refuses and never
otherwise, and one event covers typing, pasting, dragging text in and autofill.
A key handler cannot see a paste and a paste handler cannot see a drop;
approximating one condition with two events leaves a third path uncovered.

**Both `.` and `,` count, whichever the active profile calls the decimal
separator.** By finding 8 those are the only two characters any profile uses for
it, and a user carrying the other convention types the other character with the
same intent and is wrong by the same factor of ten. The space group separator is
excluded because a space cannot mean a fraction. Where the character typed is
the profile's group separator the notice is still true: grouping is not accepted
in a raw-units field either.

**The notice is monotone while the row stays in raw units.** That is what makes
it a fix rather than a flicker, by finding 7: the separator itself changes
nothing, and the digit behind it is what changes the amount, so a notice
dismissed by the next keystroke would hide exactly when it is needed. It is
withdrawn only when the row's denomination resolves, because the field then no
longer counts whole units and the sentence would be untrue.

**The field is not cleared.** `assetDenominations.ts:23-25` sets the rule that
an ambiguous amount is cleared, and that rule is about a denomination that moved
underneath the user. Here the denomination has not moved; one keystroke has.
Clearing would destroy a correctly typed `1000` because a finger caught a full
stop, and an emptied field is not a louder signal than a sentence naming what
happened and what the field counts.

**Submission is not blocked.** A raw-units field cannot express one and a half
of anything, so no implementation produces the amount the user meant; the
question the defect poses is whether they are told. Blocking is a second
mechanism over one failure, and the amount the notice points at is the field's
own.

## Acceptance Criteria

1. Typing a separator into a raw-units field leaves the row signalling at that
   keystroke and at every keystroke after it in the sequence.
2. The same holds for a user override of zero decimal places on a token that
   publishes six, and the notice names that token.
3. A refused paste leaves the amount unchanged and the row signalling.
4. Typing an amount with no separator raises nothing, and neither does a refused
   character that cannot mean a fraction.
5. A field with decimal places still accepts `1.5` and raises nothing.
6. The notice survives the amount being cleared and retyped under the same
   denomination, is withdrawn when the denomination resolves, and stands
   alongside the denomination notice when a move between the two raw-units
   spellings raises both.
7. `compile`, `lint`, `stylelint`, `jest` and `i18n` green from `nix build`.
8. No new `@ts-ignore` and no new `@ts-expect-error`; `package.json` and
   `yarn.lock` unchanged.

## Verification Plan

- **The keystroke model is corrected before anything else is asserted**, because
  the model is what let this ship. The helper appends each character to what the
  input currently holds, which is what a browser produces for a caret at the end
  of an integers-only field, and finding 2 is why the caret is there. Fields with
  decimal places keep a whole-value helper, named for what it is, because
  `react-polymorph` reformats the value under the caret on each keystroke.
- **The property is asserted as the absence of silence, not the presence of a
  message.** One helper collects, per keystroke, the amount the form holds and
  whether the row is signalling, and asserts that no keystroke from the
  separator onwards is unsignalled. A failure reports the amount held at each
  one, which is the amount that would have been submitted silently.
- **Typing and pasting are driven separately**, because only one of them was
  broken: the typed sequence changes the amount and the paste does not, and a
  spec that drove one would have declared the other fixed.
- **A discriminating case in each denomination.** Typing `15` with no separator
  raises nothing, so the notice reports the separator rather than the presence of
  an amount in a raw-units field.
- **The two notices are driven together.** Absent and zero decimal places are
  one denomination to this field and two to the reconciliation, which treats the
  move as a change and clears the amount, so a row can carry both sentences at
  once and they have to hold together.
- **The fix is pinned by reinstating the defect, twice.** Removing the signal
  reproduces the shipped build. Dismissing the notice from the accepted-value
  handler reproduces the plausible wrong implementation, the one that copies the
  sibling notice. Both must fail the property.
- All five Nix checks.
- `task-027`'s Scenario 4 is the operator step, and its expected result needs
  correcting before it is run: it asks for the field to hold `1` after typing
  `1.5`, which is the same wrong model.

## Risks and Open Questions

- **A user who reads the notice and types `15` anyway submits `15`.** Named once
  and not mitigated further. The field cannot express the amount they meant, and
  a second control over the same failure buys nothing a sentence beside the
  amount does not.
- **The notice is monotone, so it outlives the amount that provoked it.** A row
  where a separator was once attempted keeps saying so until its denomination
  resolves, including after the amount is cleared and retyped. That is the cost
  of not dismissing it on the keystroke that matters, and it is the cheaper of
  the two errors.
- **A group separator typed in a profile that treats it as such raises the
  notice.** The sentence is accurate, because grouping is refused too, but it is
  raised for an amount that came out right. The alternative misses the user who
  types the other convention's decimal point, which comes out wrong by a factor
  of ten.
- **`task-027` Scenario 4's expected result is wrong and is owned elsewhere.**
  It is recorded here rather than edited.
- **Detection rests on the DOM `input` event.** Any future path that changed the
  field's value without one would be unsignalled. No such path exists for user
  editing in a browser, and `react-polymorph`'s own refusal is driven from the
  same event.

## Required Docs, Research, and Tracking Updates

- `asset-metadata-cache-tasks.json`: `task-047` added to `phase-1` after
  `task-003` with a dependency on it, and its `status` set to `completed`. The
  `phase-1` description no longer names a count of commits, which was wrong
  before this task was added. The `task-003` entry in `summary.riskAreas` is
  corrected: the mechanism it describes was superseded by `task-003` itself,
  the `1.5` becomes `15` outcome survived it, and the severity it called
  bounded understated the override-to-zero case.
- `asset-metadata-cache-prd.md`: a status log entry for a defect found in manual
  QA.

## Review-Log Paths

- `.agent/plans/asset-metadata-cache/task-plans/task-047-plan-review.md`
- `.agent/plans/asset-metadata-cache/task-plans/task-047-impl-review.md`

## Planning Status

approved

## Build Status

completed

## Current Outcome

A separator refused in a raw-units amount field is announced in the row, at the
keystroke that refuses it, and stays announced while the digits behind it are
typed.

## Final Outcome

Complete in the suite. `task-027`'s Scenario 4 remains unrun and its expected
result needs correcting first.

## Self-Review

`task-003`'s first test case was "typing a decimal separator into the asset
amount field has no effect", and the spec that satisfied it drove `1`, `1.`,
`1.5`. Those two agree with each other and neither agrees with a browser: the
field had already thrown the separator away, so the third string re-supplied a
character the input no longer held. The spec asserted the refusal it had built
in and never the sequence a user produces.

What generalizes is narrower than "model keystrokes faithfully". It is that a
component whose refusal *reverts* input cannot be driven by cumulative strings
at all, because the string the next keystroke appends to is the component's
output and not the test's input. Any spec over a controlled field that rejects
characters has the same shape.
