Planner: Iteration 1
Timestamp: 2026-09-15T18:05:00Z

Plan Summary:
- Created `.agent/plans/asset-metadata-cache/task-plans/task-043.md` with the
  twenty-one sections the plan-workspace readme requires.
- Classified the task `agent_execution`. The change is one declaration and the
  evidence for it is a computation over colour maps already in the repository;
  the operator step is an addition to a scenario `task-027` already owns.
- The first draft proposed `rgba(var(--theme-choice-tabs-text-color-active),
  0.08)`, copying the pattern at
  `components/sidebar/wallets/WalletSearch.scss:1-2`, and proposed a Jest case
  asserting the notice's computed opacity.

Docs, Workflows, Research, and Skills Consulted:
- `.agent/plans/asset-metadata-cache/task-plans/task-021.md` and its
  implementation review, for what the notice is for and where it sits among the
  three mitigations.
- `.agent/plans/asset-metadata-cache/task-plans/task-027.md`, Scenario 5, which
  already covers this notice.
- `CLAUDE.md` for the stylesheet conventions and the Nix-only check rule.

Repo-Verified Findings Used To Shape The Plan:
- `WalletTokens.scss:9` and `:12` at `35d1f1457` are the two declarations, and
  they are on the same rule.
- The nine themes store `--theme-choice-tabs-text-color-active` as a hex string.
- `.stylelintrc` carries `order/order` and `order/properties-alphabetical-order`
  and nothing else.

Planned Approach:
- Replace the element alpha with a colour alpha and leave everything else alone.

Scope Guard / Self-Review:
- One rule, one stylesheet, no copy, no behaviour.

Outcome: Canonical task plan drafted and ready for critique

Critique of Iteration 1
Timestamp: 2026-09-15T18:25:00Z

- **`rgba(var(...), 0.08)` would have shipped a second invisible notice.** The
  pattern it copies works because that variable is stored as a bare triple:
  `'--theme-sidebar-search-field-border-color': '45, 45, 45'` at `white.ts:865`.
  `--theme-choice-tabs-text-color-active` is stored as `#2d2d2d` at
  `white.ts:1043`. Sass 1.44.0 cannot evaluate `rgba()` over a `var()`, so it
  emits the call verbatim and the browser resolves it to `rgba(#2d2d2d, 0.08)`,
  which is not a colour and is dropped as an invalid declaration. The result is
  a notice with no background at all — a different wrong answer with the same
  symptom, and one no check in this repository would have caught either. The
  draft reached for the precedent without checking what the precedent's variable
  holds, which is the same shape of mistake as the defect.

- **The alternative of adding a theme variable was not weighed and should have
  been.** A `--theme-tokens-notice-background-color` per theme is the option with
  no new CSS feature in it. It is rejected, and the reason is written into the
  plan's findings rather than left implicit: it is nine literal values plus a
  tenth in `utils/createTheme.ts` that all have to be kept in step by hand, to
  express something that is a function of a colour already defined in each of
  them. A derived value that drifts is worse than a derived value that is
  computed.

- **The proposed Jest case would have asserted nothing.** jsdom applies no
  cascade, and `jest-css-modules-transform` gives the component a class-name map,
  not declared values, so `getComputedStyle(...).opacity` on the notice returns
  the initial value in both the broken and the fixed build. A case that passes
  identically either way is worse than no case, because it is counted at
  acceptance. Dropped, and the Verification Plan now states the boundary instead.

- **A contrast assertion was considered in its place and also dropped.** It could
  be made to work: compile the stylesheet at test time, read the three
  declarations, composite against each theme's background and assert a floor. It
  would genuinely have caught this. It is refused on proportion — a second
  implementation of sRGB compositing, maintained in the suite, to guard one rule
  in one component — and the computation is recorded as a measurement instead,
  with the inputs it used, in the same form as the plan's other measurements.

- **`in srgb` needs to be explicit and the draft omitted it.** `color-mix`
  defaults to no space and the specification requires one; written without it the
  declaration is invalid. Written `in oklab` it would be a perceptual mix rather
  than the alpha blend `opacity` was reaching for. Stated in the plan with the
  reason, so a later tidy does not "simplify" it.

- **The plan claimed the fix was untestable and stopped there, which is only
  half true.** It is untestable in jsdom. It was covered by `task-027`'s
  Scenario 5, which was written correctly and has never been executed. That is
  the finding worth recording, because it says where the gap actually is: not in
  the assertions, in the acceptance that counted ten passing cases as enough for
  a surface only a person can see.

What changed in response: the colour expression changed from `rgba()` to
`color-mix(in srgb, ...)` with the triple-versus-hex finding recorded as its
own item; the theme-variable alternative added and rejected in writing; the Jest
case dropped and the Verification Plan rewritten around what an assertion can
and cannot decide; the contrast computation demoted from a check to a recorded
measurement with its reason under Risks; the Scenario 5 operator step added; the
Self-Review rewritten to name the acceptance failure rather than the styling
one.

Scope guard: one rule in one stylesheet. No copy change, no theme file touched,
no new dependency, no new check, and nothing about when the notice appears.

Outcome: Canonical task plan revised after critique and approved for build execution
