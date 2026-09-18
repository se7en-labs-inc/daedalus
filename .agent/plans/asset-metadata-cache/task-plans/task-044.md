## Task ID and Title

`task-044` — Ask for a logo when the cache knows the subject, not when it
already holds one.

## Why Chosen Now

`task-024` is the only reader the image column has. It has never read anything:
no logo renders for any token in any wallet, because the condition the row asks
under is a report of the work asking would have done. `task-011`'s fetch,
`task-012`'s bounds and `task-013`'s channel are all reachable and all
unreached, so until this is fixed the phase built four things and connected
none of them.

## Interaction Mode

`agent_execution`.

The diagnosis and the fix are both settled by specs run against a real database
file and a real component tree. What an operator adds is confirmation against a
wallet holding a token with a published logo, which is `task-027`'s Scenario 9.

## Scope

The condition under which the token row header issues its image request.

## Non-Goals

- No change to the main-process fetch, the image store, the caps, the media-type
  detection or the eviction bounds. All of them work; the diagnosis below is
  what establishes that rather than what assumes it.
- No change to the IPC shapes. `hasImage` stays on the entry.
- No new surface. The send form, the transaction list and the settings dialog
  still show no logo.
- No placeholder, no layout change, no stylesheet change.

## Dependencies

`task-024`.

## Research Consulted

- `asset-metadata-cache-prd.md:479-492`, which sets the policy this depends on:
  the bulk query never asks for `logo`, and a logo is requested one subject at a
  time, only when a component has decided to render one for an asset the user
  holds.
- `asset-metadata-cache-prd.md:366-375`, the `asset_image` schema, whose primary
  key references `asset_metadata (subject)`.

## Docs, Workflows, and Skills Consulted

- `.agent/system/architecture.md` for the renderer layering.
- Not `.agent/workflows/ipc.md`. `task-028` corrects it; the shapes here were
  read from `source/main/ipc` and `source/renderer/app/ipc`.

## Live Repo Findings Verified For Planning

The chain has five links and the defect report asks which one is broken. Each
was driven rather than read, against a real database file and a stubbed
transport, at `35d1f1457`.

1. **The on-demand fetch is never issued.** `WalletTokenHeader.tsx:61` returns
   from the effect unless `hasImage` is true, and `hasImage` is false for every
   subject on a cold image table.

2. **The image channel answers, and answers correctly.** Driven: with a metadata
   row present and a transport returning a base64 PNG under `logo.value`,
   `readImage` answers `status: 'present'` with `mediaType: 'image/png'` and the
   bytes. So `task-011`'s fetch, the magic-byte detection and the write are all
   working.

3. **`hasImage` is a report of that request having already happened.**
   `main/ipc/assetMetadataChannel.ts:114` sets it from
   `readImageSubjects` (`:188`), which selects from `asset_image`
   (`assetMetadataDb.ts:357-361`). The only writer of that table is
   `AssetImageStore._fetchOne` (`assetImageStore.ts:215`), reached only from
   `readImage`. Driven, in order: `hasImage` false on a cold image table for a
   subject whose registry entry carries a logo; `readImage` answers `present`;
   `hasImage` true. So the flag can only become true after a request, and the
   request only happened if the flag was true. Nothing else in either process
   writes that table.

4. **`hasImage` does reach the row.** `AssetsStore._assetFor:396`,
   `domains/Asset.ts`, `utils/assets.ts` and `api/assets/types.ts` all carry it,
   and `AssetsStore.spec.ts` asserts it through `getAssetTokenFromToken`. The
   plumbing `task-024` added is intact; the value it carries is false.

5. **The component renders what it is given.** `WalletTokenHeader.tsx:100-102`
   renders an `img` whenever `logoUrl` is set, and
   `WalletTokenHeader.scss:55-61` gives it a 22 by 22 box with `object-fit:
   contain`. Its four cases pass, because all four supply `hasImage` directly.

So the break is link 1, in the renderer, and the two links either side of it are
sound. The fetch and the image store are not implicated, which also means the
corpus gate and the eviction work are not resting on untested code — they are
resting on code that is tested and never called.

Two further findings decide what the condition should be instead.

6. **A request issued before the subject has a metadata row loses the logo for
   the session.** `PRAGMA foreign_keys = ON` (`assetMetadataDb.ts:250`) and
   `asset_image.subject` references `asset_metadata (subject)`, so `writeImage`
   is refused and `_fetchOne` returns null. Driven: `readImage` answers `absent`
   before the row exists and `present` after it, with the transport called both
   times. The renderer memo (`renderer/app/ipc/assetMetadataChannel.ts:142`)
   holds the promise, not the outcome, so the null is remembered for the life of
   the window.

7. **A chain row means the registry did not answer.**
   `assetMetadataResolver.ts:523-529`: only subjects the registry did not answer
   reach the chain channel. So a chain-sourced subject cannot have a registry
   logo, and `source` distinguishes the two cases a single boolean could not.

## Files Expected To Change

- `source/renderer/app/components/wallet/tokens/wallet-token/WalletTokenHeader.tsx`
- `source/renderer/app/components/wallet/tokens/wallet-token/WalletTokenHeader.spec.tsx`
- `source/main/ipc/assetMetadataChannel.realfs.spec.ts`
- `.agent/plans/asset-metadata-cache/asset-metadata-cache-tasks.json`
- the three review-log files for this task.

## Implementation Approach

**The condition becomes `source === 'registry'`.** The row asks when the cache
holds a registry row for its subject, whether or not a logo is already stored
for it. That is the fact `hasImage` was standing in for, and unlike `hasImage`
it can be true before any image request has been made.

It is also the earliest moment a logo may be stored against the subject, by
finding 6, so the same condition that starts the request is the one that keeps
it from being issued too early. A row drawn before its metadata arrives has
`source` null and asks nothing; the row that replaces it a moment later asks.
The effect stays keyed on the condition as well as the subject for exactly that
reason.

`'registry'` rather than "not null", by finding 7. A wallet holding several
hundred chain-named NFTs would otherwise issue a request per token, once per
process, for a picture the registry is known not to have.

**`hasImage` stays where it is and stops deciding anything.** It is a true
statement about the cache, the bulk read computes it from an index lookup it
already performs, and the design document specifies it on the entry. What
changes is that no component reads it. Removing it would mean editing four
renderer modules, the common type, the main handler and four specs, in a change
whose subject is one condition in one component.

## Acceptance Criteria

1. A token whose issuer published a logo renders it in the collapsed row header.
2. A row whose subject the cache holds a registry row for asks for its logo
   whether or not the cache already holds one.
3. A row the cache has no record of, and a row the registry did not answer for,
   ask for nothing and render no element.
4. A row re-rendered once its metadata arrives asks then, having asked nothing
   before.
5. At most one request per subject, still asserted on the wire.
6. `compile`, `lint`, `stylelint`, `jest` and `i18n` green from `nix build`.
7. No new `@ts-ignore` and no new `@ts-expect-error`; `package.json` and
   `yarn.lock` unchanged.

## Verification Plan

- The header spec drives criteria 2, 3 and 4 as six cases over the one
  condition: a registry row with a logo, a registry row whose logo is not stored
  yet, a row with no cached record at all, a chain row, a registry row the cache
  answers `absent` for, and the flip from no record to a registry row.
- **The fix is pinned by reinstating the defect.** With the condition put back
  to `hasImage`, the four cases that assert a request fail and the two that
  assert no request keep passing. A fix that cannot be shown to be load-bearing
  is indistinguishable from a rename.
- Criterion 5 is unchanged and stays where `task-024` put it, in
  `assetMetadataChannel.spec.ts`, asserted against the fake `ipcRenderer` rather
  than as a call count.
- The main-side spec gains one case for the ordering the renderer got backwards:
  `readImage` before the metadata row answers `absent`; `hasImage` is false on a
  cold image table; `readImage` answers `present`; `hasImage` is true. It asserts
  no new behaviour. It exists because the belief that broke this was about which
  of two handlers comes first, and that is the kind of thing a reader infers from
  a field name unless a case says otherwise.
- `source` reaching the merged row is already driven by
  `AssetsStore.spec.ts:583-590`, so the condition's input needs no new case.
- All five Nix checks, with `stylelint` included although no stylesheet changed.
- `task-027`'s Scenario 9 is the operator step and has never been run.

## Risks and Open Questions

- **A registry row with no logo costs one request per subject per process run.**
  The main store remembers a subject the registry answered without a logo
  (`assetImageStore.ts:130`), so it asks once for the life of the process, and
  the renderer memo means once for the life of the window. It is not persisted,
  by the same reasoning `task-042` recorded for its own in-memory set: a column
  changes the table shape, and the migration policy is to delete a file stamped
  with any other version. The cost is one small request per held registry token
  per launch, and it is the cost the design document's "one subject at a time"
  policy always implied.

- **The renderer memo cannot tell "no logo" from "the request failed".** The
  channel answers `absent` for both, deliberately, so that a missing picture is
  never a condition a row has to handle. The consequence is that a transport
  failure suppresses that row's logo until the window is reloaded. It was
  previously masked by the defect, since nothing asked at all. Naming it rather
  than solving it: distinguishing the two means a third status on the image
  response and a rule for what a row does with it, which is a larger change than
  this one and is not what was reported.

- **Nothing reads `hasImage` now.** It remains part of the channel's contract and
  is asserted at that boundary. Recorded here so that a later reader does not
  reintroduce the condition on finding an unread field.

## Required Docs, Research, and Tracking Updates

- `asset-metadata-cache-tasks.json`: `task-044` added to `phase-5` with a
  dependency on `task-024`, and its `status` moved to `completed` when the
  implementation review is approved.

## Review-Log Paths

- `.agent/plans/asset-metadata-cache/task-plans/task-044-plan-review.md`
- `.agent/plans/asset-metadata-cache/task-plans/task-044-impl-review.md`

## Planning Status

approved

## Build Status

completed

## Current Outcome

A token whose issuer published a logo shows it, once per subject per session.

## Final Outcome

Complete.

## Self-Review

`task-024`'s plan wrote the defect down in plain sight: "`hasImage` on the bulk
read so a row can tell whether asking is worth it". Read as an English sentence
that is reasonable. Read against the schema it is circular, and the plan's own
findings section quotes the line of the handler that makes it circular, two
items above the sentence that depends on it. Nothing in the review caught it
because every case in the suite supplied the value by hand, and a fixture is an
assertion that the value can exist.
