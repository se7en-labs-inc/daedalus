## Task ID and Title

`task-043` — Draw the decimal places notice as a tinted panel rather than at
eight percent.

## Why Chosen Now

`task-021` shipped the dismissible half of the overspend migration mitigation
and it has never been readable. The plan's own ordering says the label is the
durable half and the notice is the weak one; a notice nobody can read makes that
ordering academic, because only one of the two mitigations is working at all.

## Interaction Mode

`agent_execution`.

The fix and its evidence are both mechanical: one declaration, and a
composite-contrast computation over the nine theme colour maps in the
repository. What an operator adds is confirmation on a real display, and that
procedure is written out under Verification Plan for `task-027`'s Scenario 5 to
carry.

## Scope

One rule in one stylesheet: the notice's tint moves from the element into the
colour, so the container paints at full opacity and its two children are drawn
at theirs.

## Non-Goals

- No copy change. The three sentences `task-021` settled are unchanged.
- No layout, spacing or radius change. The box is the right size and in the
  right place; it is empty, not misplaced.
- No new theme variable. The tint is derived from a variable every theme already
  defines.
- No change to when the notice appears, to the flag behind it, or to its
  dismissal.

## Dependencies

`task-021`.

## Research Consulted

- `asset-metadata-cache-prd.md:1178-1199` for what the notice mitigates: habit
  on the send amount field, where typing `1500000` after the migration sends a
  million and a half tokens rather than one and a half.
- `asset-metadata-cache-tasks.json`, `riskAreas`, the entry that records
  `task-021` as the overspend direction of the decimals work.

## Docs, Workflows, and Skills Consulted

- `CLAUDE.md` for the stylesheet conventions and for the rule that a check is
  verified through Nix and not through the `yarn` script.

## Live Repo Findings Verified For Planning

1. **The defect is one declaration.** At `35d1f1457`,
   `WalletTokens.scss:9` sets `background-color:
   var(--theme-choice-tabs-text-color-active)` and `:12` sets `opacity: 0.08` on
   the same rule. `opacity` establishes a stacking context and composites the
   element with its whole subtree, so `.decimalPlacesNoticeText` and
   `.decimalPlacesNoticeDismiss` are drawn at eight percent with it.

2. **The intent was a tint and the variable cannot express one on its own.**
   `--theme-choice-tabs-text-color-active` holds a hex string in every theme:
   `#5e6066` (`cardano.ts:1051`, `light-blue.ts:1048`), `#e9f4fe`
   (`dark-blue.ts`), `#ffffff` (`dark-cardano.ts:1043`,
   `flight-candidate.ts:1041`, `incentivized-testnet.ts:1045`,
   `shelley-testnet.ts:1041`), `#2d2d2d` (`white.ts:1043`, `yellow.ts:1038`).

3. **The `rgba(var(...), a)` precedent does not transfer.**
   `components/sidebar/wallets/WalletSearch.scss:1-2` composes
   `rgba(var(--theme-sidebar-search-field-border-color), 0.1)`, and it works
   only because that variable is stored as a bare triple: `'45, 45, 45'` at
   `white.ts:865`, `'233, 244, 254'` at `dark-blue.ts:878`. Used against a hex
   variable the same expression reaches the browser as `rgba(#ffffff, 0.08)`,
   which is not a colour, and the declaration is dropped.

4. **`color-mix` is available in the shipped runtime.** Electron is 41.3.0
   (`package.json:224`) and reports Chromium 146.0.7680.188 on this machine;
   `color-mix()` has been in Chromium since 111.

5. **Sass passes it through unevaluated.** sass is pinned at 1.44.0
   (`package.json:170`), which predates any `color-mix` handling, so it emits the
   declaration verbatim. Confirmed by compiling the exact declaration with the
   repository's own binary.

6. **Nothing downstream rewrites colour values.** The only postcss packages in
   the tree are `postcss` and `postcss-modules` (`package.json:162-163`); there
   is no autoprefixer and no colour plugin.

7. **The stylelint configuration has two rules and both are about order.**
   `.stylelintrc` loads `stylelint-order` for `order/order` and
   `order/properties-alphabetical-order`. `background-color`, `border-radius`,
   `margin`, `padding` is alphabetical with `opacity` removed.

## Files Expected To Change

- `source/renderer/app/components/wallet/tokens/wallet-tokens/WalletTokens.scss`
- `.agent/plans/asset-metadata-cache/asset-metadata-cache-tasks.json`
- the three review-log files for this task.

## Implementation Approach

**The alpha moves into the colour.**

```scss
background-color: color-mix(
  in srgb,
  var(--theme-choice-tabs-text-color-active) 8%,
  transparent
);
```

`opacity` is removed. The container then paints an eight percent tint of the
theme's active tab text colour and composites nothing else, so the text and the
dismiss button are drawn at the colours their own rules give them.

`in srgb` rather than the default `in oklab`, because the intent is the same
arithmetic the `opacity` declaration was reaching for: an eight percent alpha
blend in the space the page is already composited in. An oklab mix of a colour
with `transparent` gives a different result for the same percentage and there is
no reason to introduce one here.

The reason the element is not the right place for the alpha goes in the
stylesheet as a comment, because the declaration that replaces it is longer and
less obvious than the one it replaces, and the next author to want a faint panel
will reach for `opacity` again otherwise.

## Acceptance Criteria

1. The notice's container renders at full opacity; its text and its dismiss
   button are drawn at the colours their own rules give them.
2. Text and button are legible against the composited panel in all nine themes,
   with the contrast ratio stated per theme.
3. No copy, layout or behaviour change: the notice still appears once for a
   profile that holds tokens and has not acknowledged it, and dismissal still
   goes through the store.
4. `compile`, `lint`, `stylelint`, `jest` and `i18n` green from `nix build`.
5. No new `@ts-ignore` and no new `@ts-expect-error`; `package.json` and
   `yarn.lock` unchanged.

## Verification Plan

**What a test can decide, and what it cannot.**

No assertion available in this repository distinguishes the broken state from
the fixed one. Jest runs in jsdom, which has no layout, no compositing and no
cascade; `jest-css-modules-transform` hands a component a map of class names and
never a declared value. `WalletTokens.spec.tsx` asserts the notice is in the
document and that is true of both states. So the five cases `task-021` wrote
pass unchanged here, and they should: they are about when the notice exists, and
that is not what broke.

The mechanical evidence is therefore a computation rather than a case.
Composite eight percent of each theme's
`--theme-choice-tabs-text-color-active` over that theme's
`--theme-topbar-layout-body-background-color`, and compute the WCAG contrast
ratio of `--theme-transactions-list-group-date-color` (the notice text) and
`--theme-label-button-color` (the dismiss button) against the result. The
before-and-after numbers are in the implementation review. It is run once and
recorded; it is not wired into a check, and the reason is in Risks.

**What settles it is the scenario that already exists.** `task-027`'s Scenario 5
covers this notice and asks for a screenshot of it. That scenario has never been
executed — `task-027`'s implementation review records that no step has been run,
because the machine has no display, no second platform and no funded wallet.
The defect reached a real wallet through a procedure that was written correctly
and not run, not through a procedure that missed it. The operator step this task
adds to that scenario: view the notice under each of the nine themes from
Settings, and confirm the text and the dismiss label are readable in each.

**Checks.** `compile`, `lint`, `stylelint`, `jest` and `i18n` from `nix build`,
with `stylelint` the one that matters here because the changed file is a
stylesheet.

## Risks and Open Questions

- **`color-mix` is the first use of the function in this repository.** It is a
  CSS feature rather than a Sass one, so the toolchain neither validates it nor
  transforms it, and a typo inside it fails at paint time in silence exactly as
  the defect being fixed did. The counterweight is that it is one declaration in
  one rule, checked on a real display by the scenario above.

- **A contrast floor is not enforced anywhere and this task does not add one.**
  It would mean a second implementation of sRGB compositing living in the suite,
  asserting over a stylesheet parsed at test time, and it would still see
  nothing about stacking, overflow or anything else that can hide an element.
  The computation is recorded as a measurement with its inputs so it can be
  re-run, which is the same standing the corpus measurements in this plan have.

- **The lowest ratio is the dark-blue theme's notice text at 3.89.** That colour
  is `#7a8691`, which is the theme's own muted text colour and already renders
  at 4.78 against the untinted page background; the tint costs it 0.89. It is
  the same variable `.syncingText` uses on the same page at half opacity. Named
  rather than raised as a decision, because changing a theme's muted text colour
  is not this task's to make.

## Required Docs, Research, and Tracking Updates

- `asset-metadata-cache-tasks.json`: `task-043` added to `phase-4` with a
  dependency on `task-021`, and its `status` moved to `completed` when the
  implementation review is approved.

## Review-Log Paths

- `.agent/plans/asset-metadata-cache/task-plans/task-043-plan-review.md`
- `.agent/plans/asset-metadata-cache/task-plans/task-043-impl-review.md`

## Planning Status

approved

## Build Status

completed

## Current Outcome

The notice is a faintly tinted panel with legible text, in every theme.

## Final Outcome

Complete.

## Self-Review

The uncomfortable part of this task is not the fix, which is one declaration. It
is that `task-021` was accepted with ten passing cases and a screenshot step
nobody could run, and the two facts were not weighed against each other at the
time. A suite that cannot see a rendered pixel is not evidence that a pixel
renders, and the acceptance should have said so rather than counting the cases.
