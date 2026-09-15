Planner: Iteration 1
Timestamp: 2026-09-15T19:10:00Z

Plan Summary:
- Created `.agent/plans/asset-metadata-cache/task-plans/task-044.md` with the
  twenty-one sections the plan-workspace readme requires.
- Classified the task `agent_execution`. Every criterion is settled by a spec:
  the condition by a component tree, the ordering it got wrong by the main
  handlers against a real database file.
- The first draft diagnosed by reading and proposed removing the condition
  outright, so that every drawn row asked for its own logo.

Docs, Workflows, Research, and Skills Consulted:
- `.agent/plans/asset-metadata-cache/task-plans/task-024.md` and its
  implementation review, for what the condition was meant to be and what its
  four cases actually assert.
- `.agent/plans/asset-metadata-cache/task-plans/task-011.md` and `task-012.md`,
  for what writes the image table and what bounds it.
- `asset-metadata-cache-prd.md:366-375` and `:479-492`, the schema and the
  one-subject-at-a-time policy.
- `CLAUDE.md` for the MobX and spec conventions.

Repo-Verified Findings Used To Shape The Plan:
- `readImageSubjects` selects from `asset_image`, whose only writer is
  `AssetImageStore._fetchOne`, reached only from the image handler.
- `asset_image.subject` references `asset_metadata (subject)` and foreign keys
  are enabled.
- Only subjects the registry did not answer reach the chain channel.

Planned Approach:
- Stop gating the image request on a flag that reports the request having
  happened.

Scope Guard / Self-Review:
- One condition in one component. No IPC change, no store change, no stylesheet.

Outcome: Canonical task plan drafted and ready for critique

Critique of Iteration 1
Timestamp: 2026-09-15T19:40:00Z

- **A diagnosis assembled by reading is not a diagnosis, and this task was asked
  for one.** The defect report names five links and asks which broke. Reading
  establishes that `hasImage` comes from the image table and that the image table
  is written by the image handler; it does not establish that the handler works,
  which is the difference between "the renderer never asks" and "the fetch is
  broken and the renderer also never asks". The two have different owners and the
  second one would stop this task. Driven instead, against a real database file
  and a stubbed transport: `hasImage` false on a cold image table for a subject
  whose entry carries a logo, `readImage` answering `present` with `image/png`,
  `hasImage` true afterwards. That sequence is what licenses the claim that the
  fetch and the image store are sound, and it is now in the findings with the
  order it was run in.

- **Removing the condition entirely would have introduced a second defect, and a
  worse one.** `asset_image.subject` references `asset_metadata (subject)` and
  `PRAGMA foreign_keys = ON`. A row that asks as soon as it mounts asks before
  its metadata has arrived, and on a cold cache that is every row: the fetch
  succeeds over the wire, the write is refused, and the handler answers `absent`.
  The renderer memo holds the promise for the life of the window, so that
  `absent` is final — the logo would be lost until a reload, for exactly the
  first-launch case this is meant to fix, and the bytes would have been fetched
  and thrown away. Driven: `absent` before the row exists, `present` after it,
  transport called both times. The condition therefore has to move rather than
  go, and what it has to become is "the cache has a row", not "the cache has a
  picture".

- **"Not null" was the first correction and it is still one step too coarse.**
  `assetMetadataResolver.ts:523-529` sends only subjects the registry did not
  answer to the chain channel, so a chain row is a positive statement that the
  registry has nothing for that subject, logo included. An NFT-heavy wallet is
  precisely the wallet full of chain rows, and it is also the wallet with the
  most tokens, so "not null" would have it issue several hundred requests per
  launch for answers already known. `source === 'registry'` costs nothing to
  write and removes that class.

- **The plan was going to leave `hasImage` unexamined and it needs a decision on
  the record.** After this change nothing in the renderer reads it. Removing it
  is four renderer modules, the common type, the main handler and four specs, and
  it deletes a field the design document puts on the IPC contract and the main
  spec asserts. Keeping it is an unread field, which is the shape of problem
  `task-024` existed to resolve for the image table itself. Kept, with the
  reasoning written down in both the plan and the tasks file, because the
  alternative is a deletion three times the size of the fix inside a change whose
  subject is one condition — and because the next reader to find an unread field
  is exactly the reader who might restore the condition, so the note has to say
  why it is unread.

- **The fix has to be pinned or it is a rename.** Every one of `task-024`'s four
  header cases supplies `hasImage` by hand, which is why they all passed against
  a build in which no logo could ever render. Rewriting them around `source` and
  watching them pass proves nothing by itself. The verification plan now requires
  putting the old condition back and recording which cases fail: four that assert
  a request, with the two that assert no request still passing as controls.

- **One case belongs on the main side even though nothing there changes.** The
  belief that caused this was about which of two handlers runs first, and it was
  held while the code that contradicts it was quoted two items above it in the
  same plan. A case that drives the ordering end to end is the cheapest way to
  make it something a reader trips over rather than infers from a field name.

- **The residual the memo carries should be named now rather than found later.**
  The channel answers `absent` both for a subject with no logo and for a request
  that failed, by design, and the renderer memo remembers either for the life of
  the window. Until this fix nothing asked, so it never bit. It is named under
  Risks with what solving it would cost, and it is not solved here.

What changed in response: the findings section rewritten as five driven links
plus two that decide the replacement, each with what was run; the approach
changed from removing the condition to moving it, with the foreign-key finding as
the reason; the condition narrowed from "not null" to `'registry'` with the
resolver line as the reason; the `hasImage` decision written down in the plan,
the tasks file and the Risks section; the verification plan given the
reinstate-the-defect step with the expected pass and fail split; one main-side
case added for the ordering; the memo's inability to distinguish a failure from
an absence recorded under Risks.

Scope guard: one condition in one component, its spec, and one case in a main
spec. No IPC shape, no store, no domain, no stylesheet, no new dependency, and no
second surface.

Outcome: Canonical task plan revised after critique and approved for build execution
