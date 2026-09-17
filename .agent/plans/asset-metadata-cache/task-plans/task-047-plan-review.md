Planner: Iteration 1
Timestamp: 2026-09-17T15:05:00Z

Plan Summary:
- Created `.agent/plans/asset-metadata-cache/task-plans/task-047.md` with the
  twenty-one sections the plan-workspace readme requires.
- Classified the task `agent_execution`. The sequence that produces the defect
  is three keystrokes into one field, so a component tree settles the diagnosis,
  the fix and the proof that the fix is load-bearing.
- The first draft proposed suppressing the separator keystroke in a key handler,
  so that the character never reached the input at all.

Docs, Workflows, Research, and Skills Consulted:
- `task-003.md` and its implementation review, for what was asked of the raw-
  units field and what its four test cases assert.
- `task-027.md`, Scenario 4, for the operator procedure, the expected result and
  the severity attached to a failure.
- `asset-metadata-cache-prd.md:1294-1406` for the two send-path safety rules.
- `CLAUDE.md` for the spec conventions and for the rule that a check is verified
  through `nix build`.
- `.agent/skills/i18n-messaging/SKILL.md` for the message id and `!!!` prefix.

Repo-Verified Findings Used To Shape The Plan:
- `AssetInput.tsx:170` sets `allowOnlyIntegers` when the row's snapshotted
  decimal places are absent or zero.
- `NumericInput.js:197` selects `^([0-9]+)?$` from that prop and `:206-211`
  returns the previous value on a failure.
- The defect report names a typed sequence and a pasted one and says the pasted
  one behaves correctly.

Planned Approach:
- Stop the separator reaching the field.

Scope Guard / Self-Review:
- One handler in one component. No change to the submit path, the validators or
  the labels.

Outcome: Canonical task plan drafted and ready for critique

Critique of Iteration 1
Timestamp: 2026-09-17T15:30:00Z

- **The approach is the defect restated as a fix.** With the keystroke
  suppressed the field still holds `1`, the caret is still at the end, and the
  next `5` still produces `15`. Nothing in the tree records that a separator was
  ever attempted, so nothing can say so. The brief says this in as many words
  and the plan proposed it anyway, which means the plan was written against the
  symptom sentence — "the separator is accepted" — rather than against the
  sequence.

- **Nothing in the plan establishes what the browser actually does.** The plan
  asserted that `1`, `.`, `5` yields `15` on the authority of the defect report.
  That is the one claim the whole task rests on and it is the one claim the
  existing spec contradicts, since it drives the same three characters and
  asserts `1`. One of the two is wrong about the mechanism and the plan has to
  say which, with a driven result, before it proposes anything.

- **The pasted path is asserted to be correct and is not examined.** A paste of
  `1.5` is refused whole, so the amount does not move; the plan reads that as
  "correct". The text vanishes and nothing is said, which is the same silence
  from the other side. If the fix is about visibility then the paste needs it
  too, and if it is not then the plan should say why the two differ.

- **No plan for where the signal is detected.** "React when a separator is
  attempted" is the requirement; the plan names no event. `onChange` is not
  called on a refusal, which is the constraint that decides this, and the plan
  does not mention it.

- **The dangerous case named in the brief is absent.** A token publishing six
  decimal places under a user override of zero reaches `allowOnlyIntegers`
  through a user setting rather than through unresolved metadata. The plan
  treats `isInRawUnits` as one case because the component does, which is how the
  weaker of the two labels goes unnoticed.

- **The verification plan asserts that a notice appears.** That passes against a
  notice raised by the separator and dismissed by the digit behind it, which is
  the silent path returning one render later. The sibling denomination notice
  does exactly that, from the field's `onChange` hook, so it is the
  implementation a reader of this codebase would reach for.

Outcome: Requires changes

Planner: Iteration 2
Timestamp: 2026-09-17T16:20:00Z

Plan Summary:
- The approach is no longer a refusal. The row records that a separator was
  refused and says so, and the digits the field accepts do not change.
- Eight findings in `Live Repo Findings Verified For Planning`, each driven
  rather than read, replacing the appeal to the defect report.
- The keystroke model is now the first item of the verification plan rather than
  an assumption underneath it, because the existing spec's model is what let the
  defect ship and no assertion written on top of it means anything.
- Detection is placed on the raw DOM `input` event, with the reasoning for one
  event rather than a key handler and a paste handler.
- Typing and pasting are separate cases with different expected amounts.
- The override-to-zero case is a separate group, with the label asymmetry
  recorded as finding 5.
- The property is restated as the absence of silence over a whole sequence, and
  the fix is pinned by reinstating the defect twice: once as no signal, once as
  a notice dismissed by the next accepted value.
- Four risks named, including the one that is not mitigated.

Docs, Workflows, Research, and Skills Consulted:
- As iteration 1, plus `assetDenominations.ts:1-26` for the established rule on
  an ambiguous amount, `WalletSendForm.tsx:966-971` for how the sibling notice
  is dismissed, and `common/types/number.types.ts:6-19` for the separators every
  profile uses.

Repo-Verified Findings Used To Shape The Plan:
- Driven: `1`, `.`, `5` against the component tree leaves `field.value` at `15`
  for `decimals` undefined and for `decimals === 0`; the DOM input reads `1`
  after the refused `.`.
- Driven: `onInput`, `onKeyDown` and `onPaste` all reach the `<input>` through
  `NumericInput`, `Input`, `InputSkin` and `filter-invalid-dom-props`, and
  `onInput` reports the value before the revert.
- Read and reasoned, not driven: suppressing a printable keystroke inserts no
  character and fires no `input` event, which makes the sequence identical to
  typing `15`, and typing `15` is driven.

Planned Approach:
- Make the refusal visible at the keystroke that refuses it, and keep it visible
  while the digits behind it are typed.

Scope Guard / Self-Review:
- One piece of component state, one handler, one notice, one message. No change
  to `allowOnlyIntegers`, to the submit path, to the validators, to the labels
  or to `react-polymorph`. Submission is not blocked and the field is not
  cleared, and both are argued rather than omitted.

Outcome: Canonical task plan revised after critique and approved for build
execution
