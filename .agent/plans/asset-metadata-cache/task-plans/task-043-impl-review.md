Implementation: Iteration 1
Timestamp: 2026-09-15T18:50:00Z

Changes made:
- `source/renderer/app/components/wallet/tokens/wallet-tokens/WalletTokens.scss`:
  `opacity: 0.08` removed from `.decimalPlacesNotice` and its `background-color`
  changed to `color-mix(in srgb, var(--theme-choice-tabs-text-color-active) 8%,
  transparent)`, with the reason the alpha does not belong on the element
  written at the site.

Files touched:
- the one stylesheet above
- `.agent/plans/asset-metadata-cache/task-plans/task-043.md`
- `.agent/plans/asset-metadata-cache/task-plans/task-043-plan-review.md`
- `.agent/plans/asset-metadata-cache/task-plans/task-043-impl-review.md`
- `.agent/plans/asset-metadata-cache/asset-metadata-cache-tasks.json`

No source file other than the stylesheet changed. No test file changed, and the
reason is below rather than in a footnote.

Verification run:

**The measurement.** Eight percent of each theme's
`--theme-choice-tabs-text-color-active` composited over that theme's
`--theme-topbar-layout-body-background-color`, then the WCAG 2.1 contrast ratio
of the notice text (`--theme-transactions-list-group-date-color`) and the
dismiss button (`--theme-label-button-color`) against the result. The last
column is what the same text reached before this change, when `opacity: 0.08`
composited it onto the page background along with its container.

| Theme | Panel | Text | Button | Text before |
|---|---|---|---|---|
| cardano | `#e3e4e4` | 4.93 | 4.93 | 1.11 |
| dark-blue | `#1d2b37` | 3.89 | 12.96 | 1.10 |
| dark-cardano | `#252637` | 14.88 | 14.88 | 1.23 |
| flight-candidate | `#252637` | 14.88 | 14.88 | 1.23 |
| incentivized-testnet | `#252637` | 14.88 | 14.88 | 1.23 |
| light-blue | `#e0e4e7` | 4.91 | 4.91 | 1.11 |
| shelley-testnet | `#252637` | 14.88 | 14.88 | 1.23 |
| white | `#e9e9e9` | 11.34 | 11.34 | 1.15 |
| yellow | `#e8e3de` | 10.80 | 10.80 | 1.16 |

A ratio of 1.00 is a colour against itself. Every theme was between 1.10 and
1.23 before, which is the number behind the report of an empty box: the text was
there, drawn at one twelfth of its own contrast with the page. The lowest number
after the change is the dark-blue theme's notice text at 3.89, against 4.78 for
the same colour on the untinted page background, so the tint costs it 0.89 and
it stays above the 3.0 large-text floor. That colour is `#7a8691`, the theme's
own muted text colour, and it is the same variable `.syncingText` uses on this
page at half opacity.

**What an assertion could have caught, and what it could not.**

Nothing in this repository could have caught it. The three mechanisms available
each stop short in a different place, and it is worth naming which:

- **Jest.** jsdom implements no cascade, no layout and no compositing.
  `jest-css-modules-transform` gives a component a map from local class names to
  generated ones and never a declared value, so `styles.decimalPlacesNotice` is a
  string and `getComputedStyle` on the rendered node returns initial values.
  `WalletTokens.spec.tsx` asserts the notice is in the document, which was true
  of the broken build; it asserts the dismiss button calls back, which also
  worked. Both states pass all five cases identically. An assertion on the
  element's opacity would have read the same value in both builds, which is the
  trap: it would have looked like coverage and been counted at acceptance.

- **Stylelint.** Its rule set has nothing that expresses this. The defect is not
  an invalid declaration, a duplicate, a shorthand conflict or an unknown
  property. `opacity: 0.08` on a container is valid CSS, and it is the right
  thing to write on a decorative element with no children. What makes it wrong
  here is that this element has two children carrying the only content, and no
  linter sees that relationship.

- **A contrast check.** It could be built: compile the stylesheet at test time,
  read `background-color`, `opacity` and `color` off the three rules, composite
  against each theme's map and assert a floor. It is the one thing that would
  genuinely have failed on the broken build, and it is refused here on
  proportion. It means a second implementation of sRGB compositing and of the
  WCAG formula living in the suite, reading declarations out of parsed CSS by
  position, for one rule in one component; and it would still see nothing about
  stacking order, overflow, `z-index` or any of the other ways an element that
  is in the document is not on the screen. The computation is recorded above with
  its inputs instead, which is the standing the corpus measurements elsewhere in
  this plan have.

So the honest boundary is this: a jsdom test can decide whether an element
exists and what props reached it, and nothing about whether it was painted. For
a defect whose entire content is "it was painted, at one twelfth of its
contrast", the suite is the wrong instrument, and adding cases to it would only
have made the gap harder to see.

**What did cover it, and was not run.** `task-027`'s Scenario 5 is this notice,
and asks for a screenshot of it. `task-027`'s implementation review records that
no step in that procedure has been executed, because the machine has no display,
no second platform and no funded wallet. The procedure was written correctly and
found nothing because nobody ran it. That is where the gap is: not in the
assertions, but in an acceptance that counted ten passing cases for a surface
only a person can see.

**Checks**, all through Nix with every change staged:
- `nix build '.#checks.x86_64-linux.stylelint' --no-link` — built
  `1id2cnk9jg7zkyi9mnpvawf7syq3p7n0-daedalus-stylelint.drv`, exit 0. The one
  that matters here: the changed file is a stylesheet and the declaration order
  rule sees `background-color`, `border-radius`, `margin`, `padding`.
- `nix build '.#checks.x86_64-linux.compile' --no-link` — built
  `yq1cvs4zpf6x1a0qbj8p1851bbnx1vfp-daedalus-compile.drv`, exit 0.
- `nix build '.#checks.x86_64-linux.lint' --no-link` — built
  `d1myz8qap33n5j4nv6zh9l8wbj3yl1yl-daedalus-lint.drv`, exit 0.
- `nix build '.#checks.x86_64-linux.i18n' --no-link` — built
  `hrjk4hq8d5yla1fcj3fdgnanjsd1k61w-daedalus-i18n.drv`, exit 0.
- `nix build '.#checks.x86_64-linux.jest' --no-link` — built
  `q5wal47lpyl2lj8rbsn56s24cj1kgv0z-daedalus-jest.drv`, exit 0. Unchanged
  totals, which is the expected result and not a reassuring one.
- `nix build '.#checks.x86_64-linux.docs' --no-link` — exit 0, run because
  `.agent/` files changed.

`nix fmt` reported the stylesheet already formatted, 0 files changed.

No new `@ts-ignore` and no new `@ts-expect-error`.
`git diff HEAD -- package.json yarn.lock` produces nothing.

Deviations from the approved plan:
- None.

Outcome: Implementation complete and ready for review

Review of Iteration 1
Timestamp: 2026-09-15T18:58:00Z

Acceptance criteria, each against the evidence:

1. *The container renders at full opacity.* Met. `opacity` is gone from the
   rule, and nothing else in the file sets one on an ancestor of the notice.

2. *Legible in all nine themes, ratio stated per theme.* Met, in the table
   above, computed rather than judged.

3. *No copy, layout or behaviour change.* Met. The diff is one rule; the message
   definitions, the container props and the five component cases are untouched.

4-5. *Checks, suppressions, dependencies.* Met.

Two judgements worth naming.

**`color-mix` earns the novelty.** It is the first use of the function in this
repository, and a first use is a cost. The alternative that avoids it is a new
theme variable, which is nine literal values plus one in `utils/createTheme.ts`,
all expressing an eight percent mix of a colour each of those files already
defines, all of them free to drift from it one at a time. Deriving the value
where it is used is the smaller liability, and the runtime that has to
understand it is one Chromium version that ships in the installer.

**The `rgba(var(...), 0.08)` route was the obvious one and would have failed
silently.** The pattern exists in this repository and works, because the
variable it is used with is stored as a bare RGB triple. This variable is stored
as hex, so the same expression resolves to `rgba(#2d2d2d, 0.08)` and the browser
drops the declaration. It is worth recording because the failure mode is
identical to the defect being fixed — a stylesheet that compiles, a check set
that stays green, and nothing on the screen — and because the next person to
need a tint here will find the `WalletSearch` precedent first.

What this does not do, so it is not mistaken for finished: it does not make the
notice's appearance checkable by any automated job. That remains an operator
step, and the operator step this task adds to `task-027`'s Scenario 5 is to view
the notice under each of the nine themes rather than under one.

Summary: The notice paints a faint tinted panel and its text and dismiss label
paint at their own colours, in all nine themes, at contrast ratios between 3.89
and 14.88 where every theme was previously between 1.10 and 1.23. The fix is one
declaration; the finding is that no check in this repository distinguishes the
two states, and the procedure that does was never run.

Decision: approved
