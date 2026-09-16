Planner: Iteration 1
Timestamp: 2026-09-15T19:20:00Z

Plan Summary:
- Added `task-045` to `asset-metadata-cache-tasks.json` in `phase-1`, depending on
  `task-001` and `task-041`, and drafted
  `.agent/plans/asset-metadata-cache/task-plans/task-045.md` with the twenty-one
  sections the plan-workspace readme requires.
- Classified the task `agent_execution`. Every criterion is checkable from the
  repository: the Nix checks, the colocated spec suites, and reading the three
  locale files.
- The first draft scoped the work as a rename only: the enum member, the
  predicate, the SCSS class, both test ids, both message keys, both message ids,
  and the annotation's text, plus the prose in the PRD, the tasks JSON and the
  fourteen task-plan and review documents that use the term.

Docs, Workflows, Research, and Skills Consulted:
- `.agent/plans/asset-metadata-cache/task-plans/readme.md` for the cycle, the
  section list, and the append-only rule on the two review files.
- `.agent/plans/asset-metadata-cache/task-plans/task-001.md` and
  `task-001-impl-review.md`, which introduced the vocabulary, the two messages,
  the `title` and the test ids, and recorded that both `ja-JP` entries shipped as
  `!!!` placeholders.
- `task-041.md` and `task-041-impl-review.md`, which kept the vocabulary for a
  name recovered from behind a CIP-0067 label.
- `.agent/skills/i18n-messaging/SKILL.md` for the message schema, the `!!!`
  convention, and what `i18n:extract` and `i18n:check` each do.
- `.agent/findings/token-provenance-discarded.md`, which designs the per-field
  verification marker this term has to coexist with.
- `CLAUDE.md` for the TypeScript conventions and the Nix-only check rule.

Repo-Verified Findings Used To Shape The Plan:
- `git grep -ril "minter.chosen\|minterChosen" dc5150955` returns 29 tracked
  files: twelve under `source/`, nine code and three locale,
  `translations/messages.json`, the PRD, the tasks JSON and fourteen task-plan
  documents.
- `ja-JP.json:68` and `:70` are both `!!!`-prefixed English. The risk the task was
  framed around, losing translator output, is not present for either id.
- `package.json:53-55` and `translations/translation-runner.ts`: `i18n:manage` is
  `formatjs extract` followed by `react-intl-translations-manager`. Adding a key
  is the operation it performs.
- `git ls-files` returns `translations/messages.json`; `.gitignore:141` excludes
  every `*.scss.d.ts`.
- Locale files are sorted by id, and both new ids sort into the slots the old ones
  occupied, so the locale diff is two lines changed in place rather than a
  reordering.

Planned Approach:
- Fix the vocabulary in one table so nothing drifts, rewrite the module comment in
  `assetName.ts` to tell `ChainName` and `OnChainName` apart in words, hand-edit
  all three locale files, then regenerate and read back.

Scope Guard / Self-Review:
- No behaviour change. Same rungs, same order, same predicate, same fingerprint.
- `assetMetadataChannel.ts:89` excluded, with the reason stated: it says
  "minter-chosen key", a different noun.

Outcome: Canonical task plan drafted and ready for critique

Critique of Iteration 1
Timestamp: 2026-09-15T19:35:00Z

- **The plan proposed `OnChainName` beside an existing `ChainName` and said
  nothing about it.** `task-035` added `ChainName = 'chainName'` for a CIP-25 or
  CIP-68 record. The new member is two characters from it and means a strictly
  weaker claim: both values are on the chain, and only one had to satisfy the
  minting policy to get there. A reader who skims the enum and not the comment
  picks the wrong rung. The draft treated the rename as mechanical and missed
  that it creates the one genuine hazard in the task.
- **The acceptance criteria could all pass with the application still rendering
  the old wording.** Every check in the list was a `nix build`, and the failure
  mode this task exists around is precisely the one those checks do not see: a
  locale file left carrying the old English under an unchanged id. A criterion
  has to read the artifact.
- **"No rename of `styles.assetAsciiName`" was written as a non-goal without
  checking what it is.** It is a leftover from the `ASCII: ` era `task-001`
  removed, and its entire treatment is `opacity: 0.5`, which is one channel where
  the list row has three. Declaring it out of scope was a guess dressed as a
  decision.
- The `estimatedHours` of 2.0 was carried from nothing. `task-041`, a comparable
  single-commit change with three spec files, is 2.0; this touches nine source
  files, three locale files and sixteen documents.

Outcome: requires_changes

Planner: Iteration 2
Timestamp: 2026-09-15T19:50:00Z

What changed in response to the critique:
- Added a Live Repo Findings entry naming the `ChainName` collision, the two
  alternatives considered (`AssetNameBytes`, `OnChain`) and why the fix belongs in
  the module comment rather than in the identifier: the owner fixed the
  user-facing word and the enum should match it. Added it to Risks with a stated
  residual cost and the specs that catch it.
- Rewrote the acceptance criteria so criterion 2 reads the three locale files and
  criterion 3 asserts the `ja-JP` diff is exactly two lines, and added a paragraph
  to the Verification Plan saying which step catches the failure the task is
  framed around and why the `nix build` step does not.
- Struck the `assetAsciiName` non-goal pending a look at what it actually is.
- Left the hours at 2.0 for the rename alone, to be revisited if scope moves.

Scope Guard / Self-Review:
- Still a rename. The two things the critique surfaced are a naming hazard and a
  verification gap, not new work.

Outcome: Canonical task plan revised and ready for critique

Critique of Iteration 2
Timestamp: 2026-09-15T20:05:00Z

- The `ChainName` hazard is now named once, with its cost and the test that
  catches it, rather than being either hidden or stacked into several warnings.
- The verification plan now distinguishes what `nix build` proves from what it
  does not, which is the distinction this task turns on.
- Remaining gap, not blocking: the plan says the review documents will be
  substituted but does not say what happens to the sentences in them that describe
  the `title` attribute and the old annotation wording. Those are mechanism, not
  vocabulary. The plan should say whether they move.

Outcome: approved

Planner: Iteration 3
Timestamp: 2026-09-15T20:40:00Z

What changed in response to two owner decisions that arrived during
implementation, both reaching the same two elements this task was already in:

1. **The list row's tooltip is dropped, not renamed.** The explanation becomes an
   `aria-label` on the same element and the visual treatment is untouched. So
   `assets.assetToken.minterChosenName` disappears from three locale files rather
   than moving, and the plan has to say why or the next reader reads it as an
   oversight.
2. **The parameter row's annotation goes inline after the hex**, as
   `484f534b59 (HOSKY)`, with the marking on the brackets and never on the hex,
   the `aria-label` on whichever element the styling lands on, and the label
   dropped from the message because the row is already labelled `Asset name`.
3. **A guard on the inline form**, added after the second: the parenthetical must
   not render at all when the name does not decode, so the condition goes on the
   whole fragment including the leading space, and the specs assert the absence
   rather than only the presence.

What changed in the plan:
- Scope became three numbered changes rather than one, with the reason they are
  one commit: they touch the same two elements and splitting them leaves a
  half-renamed tree.
- Added a Live Repo Findings entry correcting the premise the tooltip decision
  arrived with. It is a `title` attribute, not a `PopOver`: `task-001.md:290-293`
  chose it over a nested `PopOver` deliberately, and `Asset.spec.tsx` asserted its
  content, so it was not unverifiable in jsdom. The decision stands on the reason
  that does apply to it, which is that a hover-only carrier needs a pointer.
- The `assetAsciiName` non-goal is gone, replaced by the measurement that settles
  it: its whole treatment was `opacity: 0.5`, one channel where the list row has
  three, so the inline form replaces it rather than renaming it.
- Added the longest-row finding and, in Risks, an explicit statement of what was
  established about it (the layout rule and the spec) and what was not (the
  rendered line count, which jsdom cannot produce).
- Added a Risks entry recording that "on-chain name" now appears nowhere a user
  can see, so the absence is not read later as a missed rename.
- Added to Risks what was deliberately not substituted in the historical review
  documents, closing the gap the previous critique left open.
- Required Docs now carries the three things the per-field marker inherits, and
  those are written into `.agent/findings/token-provenance-discarded.md` rather
  than only here, because that is where the marker is being designed.
- Hours raised to 3.0.

Scope Guard / Self-Review:
- Still no change to which name wins, to what counts as text, or to the
  fingerprint. The three changes are the label, its carrier and its placement.

Outcome: Canonical task plan revised and ready for critique

Critique of Iteration 3
Timestamp: 2026-09-15T20:55:00Z

- The correction to the tooltip decision's premise is the right shape: the
  decision is implemented as given, and the reasoning is restated against what the
  code actually is rather than passed along unchecked.
- The longest-row claim is the only one in the task that no check closes, and it
  is labelled as such in Risks and again in Final Outcome, with what was measured
  in its place. That is the correct treatment for a claim this environment cannot
  settle.
- The guard is asserted in the negative for all four ways a name can fail to
  decode, which is what the decision asked for.
- No further changes required.

Outcome: approved
