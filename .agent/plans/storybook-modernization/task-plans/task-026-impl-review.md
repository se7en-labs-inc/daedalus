Implementation: Iteration 1
Timestamp: 2026-09-15T18:44:20Z

Changes made:
- `knob-census.js`: counts every `addon-knobs` call site and classifies it by type and by placement.
  It resolves the imported local names first, so a local `select` or a lodash `object` is not
  miscounted, and it exits non-zero while any site remains so it can run as a check at the end.
- `knob-conversion-patterns.md`: the reference. Five placements worked as before-and-after pairs, a
  rule for each of the nine knob types in use, the `useArgs` default and the `useState` exception,
  and a section on what can and cannot be verified without a browser.

The surface, measured rather than quoted: 360 call sites across 73 files, 47 importing `withKnobs`.
By placement, 191 in JSX, 87 as a call argument or object property, 66 as a binding, 10 inside a
callback and 6 at module scope. By type, `boolean` 163, `number` 92, `text` 50, `select` 47,
`radios` 3, `button` 2, `date` 1, `optionsKnob` 1, `object` 1.

Reconciled to the baseline, because the entry says 366 and this says 360. The count was 396 at
`bfc6ec3d2`, 377 after the four flag-disabled story sets went at `7addc86c0`, 375 after the
`/staking/epochs` screen at `e6ba8759b`, and 360 after the orphaned support modules at `5311ce0d0`.
It has been 360 since, so phase 3 moved none of them. Every step is a named deletion and the entry's
366 predates the last two.

Three probes, and the second and third exist because of what the first said:

- The first composed a synthetic CSF module and reported that args reach the render function, that a
  story's `args` override the meta's, that `useArgs()` reads them, that `useState` returns its
  initial value, and that neither setter caused anything to change.
- Read straight, the last of those is a claim that `updateArgs` and `useState` do not work at
  8.6.18, which would be alarming and is wrong. The second probe forced a re-render after each
  setter to separate a failed update from a missing repaint, and found neither: the harness resets
  hook state on unmount, so it cannot distinguish them at all.
- The third installed a mock channel. `updateArgs` emits `updateStoryArgs` on it. So the story's
  half of the contract works and what is missing is the preview's half, the listener that re-renders
  with the new value, which `composeStories` does not run.

That is the honest boundary, and it is what every tranche in this phase can claim: the control is
declared, the story reads it, and writing it reaches Storybook. Not that the workbench repaints.
Stated in the reference so five tranches inherit it rather than each rediscovering it.

Deviations from the approved plan:
- None.

Outcome: The reference and the instrument exist, the surface is reconciled, and the limit the
tranches inherit is measured rather than assumed; ready for code review

Code Review: Iteration 1
Timestamp: 2026-09-15T18:50:40Z

Summary:
- Approved.

Blocking findings:
- None.

Non-blocking observations:
- The probe sequence is the point of this task. A single run said "the setters do nothing", which as
  a statement about Storybook is false and as a statement about the harness is true. Three runs
  separated them. This is the seventh time in this epic that an instrument has reported on itself
  rather than on the thing under test, and the only reason it was caught is that the result was
  surprising enough to be worth a second look. A less surprising wrong answer would have gone
  through.
- Classifying by placement is what makes the phase estimable, and the shape is favourable: 344 of
  the 360 are renames, and the 16 that are not sit in eight files.
- Not editing the skill was right. The entry lists it as a target path and `task-060` says to record
  the rule there; doing both would create two sources for one rule and guarantee they drift. Saying
  so in the non-goals is better than silently skipping it.
- Reconciling 360 against 366 cost four commands and closes a question that would otherwise have sat
  open for the whole phase.

Approval bar:
- Met. `task-026` is complete and the six tranches have their reference.

Decision: approved
