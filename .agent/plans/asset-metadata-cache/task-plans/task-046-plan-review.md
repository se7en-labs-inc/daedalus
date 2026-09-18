Planner: Iteration 1
Timestamp: 2026-09-16T14:05:00Z

Plan Summary:
- Created `.agent/plans/asset-metadata-cache/task-plans/task-046.md` with the
  twenty-one sections the plan-workspace readme requires.
- Classified the task `agent_execution`. The rule, the rename and the copy are
  all decidable here, and both live cases the rule turns on can be fetched from
  the production registry and pinned.
- The first draft scoped the change as "read `.attested` instead of `.verified`
  and reword three strings", and left the column, the types and the IPC field
  named `verified`.

Docs, Workflows, Research, and Skills Consulted:
- `asset-metadata-cache-prd.md:1143-1261` and `:1262-1286` for goal two and goal
  three.
- `.agent/plans/asset-metadata-cache/task-plans/task-010.md` for why the column
  was given one meaning, and `task-019.md` and `task-022.md` for what reads it.
- `.agent/skills/i18n-messaging/SKILL.md` for the id shape and for the fact that
  `i18n:manage` adds and never rewrites.
- `CLAUDE.md` for the Nix-only check rule and the conventions that bite.

Repo-Verified Findings Used To Shape The Plan:
- `assetMetadataResolver.ts:144-153` is the only producer of the column.
- `assetVerification.ts:463-484` computes `verified` as `bound && satisfied &&
  attested`, and `:282-285` returns `bound: false, reason: 'absent'` for an
  entry with no `policy` field, which the comment there already calls ordinary.
- `assetMetadataDb.ts:245-268` throws on a version mismatch and `:273-292`
  catches it, deletes the file and reopens.

Planned Approach:
- Move the gate, rename the verdict, bump the version, rewrite the four
  strings, pin the two live entries as fixtures.

Scope Guard / Self-Review:
- No settings toggle, no binding marker, nothing near the image path.

Outcome: Canonical task plan drafted and ready for critique


Critique of Iteration 1
Timestamp: 2026-09-16T14:30:00Z

- **Leaving the column named `verified` would have been the third instance of
  the defect this plan keeps producing.** The first draft treated the rename as
  cosmetic and optional. It is neither. A column named `verified` holding the
  answer to "did a signature verify over this value" is a name that overstates
  its measurement, and this plan has already shipped two of those and had to
  correct both: `task-041` recovered a name from an asset name label after a
  printable-ASCII check rejected every labelled name, and `task-045` renamed a
  provenance that claimed a contrast between authors that does not exist. The
  cost of the rename now is one mechanical pass. The cost later is the same pass
  plus whatever was built on the wrong word in between.

- **The draft did not say what happens to an existing cache, and the answer is
  worse than "stale verdicts".** The plan's own bump rationale was carried over
  from the brief as a freshness argument. Checking the schema application shows
  a harder failure: `CREATE TABLE IF NOT EXISTS` at `assetMetadataDb.ts:37` will
  not add a renamed column to an existing table, so without the bump every read
  raises `no such column: attested`, `_read` catches it at `:477-500` and answers
  empty, and the cache is permanently blind rather than merely out of date. The
  bump is load-bearing and the plan now says so under its own finding.

- **`verifyRegistryProperty`'s `verified` field was going to be deleted on
  momentum.** It should not be. It is the only place in the codebase where the
  three steps are separable, the conjunction is a true statement about a
  property, and `assetVerification.spec.ts` exercises all four fields across
  eleven cases. What was wrong there was a sentence, not a field: the comment
  claims `verified` is "the only field to test for a verdict", which is what the
  resolver believed and is now false. The plan corrects the comment and keeps
  the field, and the Non-Goals say so explicitly, so the next reader does not
  re-litigate it.

- **The measurement belongs in the PRD, not only in this task.** The brief
  supplied a 120-entry sample. Checked against the whole-corpus table the PRD
  has held since 2026-09-14, the sample agrees with it to within two points on
  both ratios, which means the corpus measurement already contained the
  argument for this change and was read only for the row it was taken to answer.
  That is worth writing where the rule is stated rather than in a task file, and
  the plan's tracking section now requires the PRD edit.

- **Two names the brief does not list are on the verdict's path.**
  `DecimalSettingDisagreement.WithVerified` and `.WithUnverified` decide which
  of two sentences a user sees, and the consumer already calls the result
  `isUnattested`. Renaming everything except the enum would leave the old word
  in the one place a reader looks to find out what the two sentences mean. They
  are in scope and the plan says so rather than discovering it mid-edit.

Outcome: Revisions required before implementation


Planner: Iteration 2
Timestamp: 2026-09-16T14:55:00Z

Plan Summary:
- Scope grew from three bullets to five: the rename is a first-class item rather
  than a consequence, and the spec and fixture work is named.
- Finding 8 added: the bump is required for correctness and not for freshness,
  with the mechanism.
- Non-Goals gained `verifyRegistryProperty`'s return shape, so the field is kept
  deliberately rather than by omission.
- Finding 4 gained the comparison against the whole-corpus table, and the
  tracking section gained the PRD edit.
- Finding 12 added for the two enum members.
- Verification Plan gained the sentence that matters most: the existing specs
  are re-read rather than sed-replaced, because one of them asserts the old rule
  and not merely the old name.

Docs, Workflows, Research, and Skills Consulted:
- As above, plus `assetMetadataResolver.realfs.spec.ts:319-361`, the block named
  for the column, which holds the case that flips.

Repo-Verified Findings Used To Shape The Plan:
- `assetMetadataResolver.realfs.spec.ts:357-361`, `is unverified when the entry
  carries no policy`, asserts the rule being reversed. A mechanical rename would
  have left it asserting `attested: false` for an entry that is attested, and it
  would have gone green, because the fixture's policy is set to null and the
  assertion would still hold under the old code path it was written against.
- `:684-698`, `rewrites the row and runs verification again when the sequence
  number rises`, is the MELD shape already present under a constructed fixture.
  It stays true under the new rule and is the reason the new rule is not "apply
  whatever arrives".

Planned Approach:
- Unchanged in substance; wider in scope and better evidenced.

Scope Guard / Self-Review:
- Still no toggle, no binding marker, nothing near the image path.

Outcome: Plan approved for implementation
