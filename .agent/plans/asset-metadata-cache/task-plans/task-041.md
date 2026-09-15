# Task task-041: Recover the name inside a labelled asset name

## Task ID and Title

- ID: `task-041`
- Title: `Recover the name inside a labelled asset name`

## Why Chosen Now

Manual QA on this branch found that every CIP-68 asset renders with no name at all, only a
fingerprint, while non-CIP-68 assets in the same list render their decoded names correctly. The
cause is in `task-001`'s printable-ASCII predicate, which is the bottom rung of the name resolution
order, so the defect is invisible until a wallet holds a CIP-68 token and then applies to every one
of them.

This is a class of token rather than an edge case. CIP-68 is how a minter publishes metadata that can
change after minting, and the label prefix is mandatory for every asset minted under it.

**Why the defect existed is worth stating plainly, because it is not incidental.** Nothing in this
repository knew that an asset name has a shape. `grep -rniE "cip.?0?67"` over the whole tree returns
nothing outside this task's own files, and every pre-existing mention of CIP-68 treats it as a source
of a metadata record: `koiosClient.ts:20-30` requests `cip68_metadata`, `koiosClient.ts:200-239`
reads a datum out of it, and `assetMetadataResolver.ts:184-212` turns that into a row. The PRD
engages with CIP-68 the same way, as somewhere a name can come from, never as a structure the asset
name itself carries. So a printable-ASCII check written over raw asset name bytes looked complete,
and shipped rejecting every CIP-68 name there is.

## Interaction Mode

- Mode: `agent_execution`

Every acceptance criterion is checkable from the repository: three Jest specs and the four Nix
checks. Nothing needs a running node, a network fetch or an operator.

## Scope

- Recognise a CIP-0067 asset name label by its structure, validating the bracket nibbles and the
  CRC-8 checksum, and strip it before the printable test so the remainder of the name is decoded when
  it is text.
- Apply the same rule to the decoded annotation on the asset-name parameter row in the pill's
  pop-over, which is the second surface that renders a decoded asset name.
- Cover the structure rather than the four known values: each of CIP-0068's four labels, a
  structurally valid label that is not one of them, a prefix with correct brackets and a wrong
  checksum, a prefix whose brackets are not zero, and a name that is only a label.

Revertible on its own. Reverting the commit restores the previous rendering exactly: a labelled asset
shows its fingerprint and no name.

## Non-Goals

- **No change to the marking.** A name recovered this way is still minter-chosen, so it keeps the
  provenance `task-001` established and renders in the same dashed outline, italics and muted colour
  under `data-testid="assetNameMinterChosen"`. Stripping a label recovers text; it does not make an
  issuer have published it.
- **No allowlist of the four CIP-0068 labels.** CIP-0068 requires a further asset class to be
  submitted as a new CIP and registered in CIP-0067, so the set is open by design and a list of four
  stops being right the day a fifth is registered.
- No change to the fingerprint. `utils/assetFingerprint.ts` takes the policy id and the whole asset
  name as hex and never sees a decoded string; nothing in this task reaches it.
- No change to `hexToString`, to `assetNameASCII` on `api/assets/types.ts`, or to the search
  predicate in `utils/assets.ts`. Search matches over the full decoded bytes and already finds `USDM`
  inside a CIP-68 name as a substring.
- No use of a label number beyond deciding that a label is present. Nothing here renders the asset
  class, and the three CIP-0068 classes that share a policy are not distinguished to the user.
- No change to the chain rung. A CIP-68 datum resolved through the chain channel still wins, and
  still renders as a published name.

## Dependencies

- `task-001`, which wrote `utils/strings.ts:hexToPrintableAsciiString`, `utils/assetName.ts` and the
  decoded annotation in `components/assets/AssetContent.tsx`.
- `task-035`, which added the `ChainName` rung and the `source` field to the same resolver.

## Research Consulted

- **CIP-0067, Asset Name Label Registry, Specification.** The label is four bytes, laid out as
  `[ 0000 | 16 bits label_num | 8 bits checksum | 0000 ]`: two four-bit brackets, a sixteen-bit
  registered number in the decimal range 0 to 65535, and a CRC-8 checksum with polynomial `0x07`
  computed over `label_num` including its padded zeros. The document publishes a 256-value lookup
  table for that checksum. Its own registry currently assigns only 0 to 15, as private use.
- **CIP-0068, Datum Metadata Standard, Specification.** Registers four labels: 100 reference NFT,
  222 NFT, 333 FT and 444 RFT, and states that further asset classes MUST be submitted as a new CIP
  and registered in CIP-0067 once accepted.
- The defect report from manual QA: `USDM` is `0014df105553444d`, `FLDT` has the same shape, and
  both render with no name at all in a real wallet while non-CIP-68 assets in the same list render
  theirs.
- `.agent/plans/asset-metadata-cache/task-plans/task-001.md` and `task-001-impl-review.md`, the
  predicate, the marking, and why the predicate validates the hex shape as well as the byte range.

## Docs, Workflows, and Skills Consulted

- Docs: `.agent/plans/asset-metadata-cache/task-plans/readme.md` for the cycle and the section list;
  `CLAUDE.md` for the spec and TypeScript conventions.
- Workflows: `.agent/workflows/test.md` for the Jest invocation, read against the `CLAUDE.md` trust
  map, which records that the hooks it describes do not exist.
- Skills: none apply. No message is added or changed, so `i18n-messaging` has nothing to say here.

## Live Repo Findings Verified For Planning

Verified at `b9d24f438` on branch `feat/asset-metadata-cache`, 2026-09-15, with Node v22.23.1.

**The defect, exactly.** `source/renderer/app/utils/strings.ts:39-51` accepts a decoded asset name
only when every decoded byte is `0x20` to `0x7E`. For `0014df105553444d` the bytes are
`00 14 df 10 55 53 44 4d`: the first four are the label and the last four are `USDM`. The whole-name
test is false, so `hexToPrintableAsciiString` returns `null`, `utils/assetName.ts` falls through its
third rung, `resolveAssetName` returns `null`, and `Asset.tsx:222` renders no name element at all.
The fingerprint at `Asset.tsx:218-224` is the whole of what the row shows.

**The CIP-0067 structure reproduces all four published checksums.** CRC-8 with polynomial `0x07`,
initial value 0, no reflection and no final xor, computed over the two bytes of `label_num`, measured
against the four labels CIP-0068 publishes:

| label hex | brackets | label_num | checksum in the label | CRC-8 computed |
|---|---|---|---|---|
| `000643b0` | 0, 0 | 100 | 59 | 59 |
| `000de140` | 0, 0 | 222 | 20 | 20 |
| `0014df10` | 0, 0 | 333 | 241 | 241 |
| `001bc280` | 0, 0 | 444 | 40 | 40 |

Four out of four. That is the check on the implementation of the checksum: a wrong polynomial or a
wrong byte order would miss all four.

**The structure discriminates far better than a list of four does.** A coincidental four-byte prefix
has to carry a zero leading nibble, a zero trailing nibble, and a checksum matching a CRC-8 over its
own middle bytes: one sequence in 65,536 rather than one in four.

**No printable name can carry a label, so the strip cannot fire on a name that would have decoded
anyway.** A valid label's first byte has a zero high nibble, so it is at most `0x0f`, and the
printable floor is `0x20`. Verified for the four published labels, each of which contains `0x00`, and
true by construction for every other valid label.

**The "resembles a label" case is a question about the decoded text, not the bytes.** A name whose
text reads `000de140` is the hex `3030306465313430`, whose first byte is `0x30`. Its leading bracket
is not zero, so it is not a label and keeps all eight of its characters. The two representations
cannot collide, which is why the check is on bytes.

**A name that is only a label.** `0014df10` with nothing after it leaves an empty remainder.
`hexToPrintableAsciiString('')` returns `null` at `strings.ts:42`, because the guard rejects an empty
string before the regular expression sees it. So a bare label resolves to no name without a second
check, which is correct: a label carries no name.

**The second surface.** `components/assets/AssetContent.tsx:124-125` decodes the same bytes with the
same predicate for the asset-name parameter row's annotation, and shows nothing for a labelled asset
for the same reason. The row's value is still the raw hex and still what is copied.

**The predicate has exactly two callers.** `grep -rn "hexToPrintableAsciiString" source` returns
`utils/assetName.ts` and `components/assets/AssetContent.tsx`, plus the specs. Nothing else reads it,
so the shape of the fix is not constrained by a third consumer.

**Nothing in the fingerprint path decodes a name.** `source/renderer/app/utils/assetFingerprint.ts`
takes `policyId` and `assetName` as hex and hashes the concatenated bytes; `AssetsStore._fingerprintOf`
at `stores/AssetsStore.ts:410-423` calls it with the raw identity. No decoded string reaches it, and
this task adds no caller.

**The chain rung already answers for some CIP-68 assets.** `chainPointerToRow` at
`assetMetadataResolver.ts:184-212` writes `source: 'chain'` from a CIP-68 datum, and
`utils/assetName.ts` renders that as `ChainName`, which is treated as published. So this task changes
the bottom rung only, for the assets the chain channel has not answered for: a profile with no
pointer source, a subject not yet resolved, or a wallet that is offline.

## Files Expected To Change

- `source/renderer/app/utils/assetName.ts` — the CRC-8, the structural check and an asset-name
  decoder that consults it.
- `source/renderer/app/utils/assetName.spec.ts` — the structure and its boundaries.
- `source/renderer/app/components/assets/AssetContent.tsx` — the annotation reads the same decoder.
- `source/renderer/app/components/assets/AssetContent.spec.tsx` — a labelled name on the parameter
  row.
- `source/renderer/app/components/assets/Asset.spec.tsx` — a labelled asset renders its name, marked.
- `.agent/plans/asset-metadata-cache/asset-metadata-cache-tasks.json` — the new task and its status.
- `.agent/plans/asset-metadata-cache/task-plans/task-041*.md` — this plan and its two review logs.

`source/renderer/app/utils/strings.ts` is **not** changed. `hexToPrintableAsciiString` is a question
about bytes and hex, with no asset in it; a CIP-0067 label is a Cardano ledger convention about asset
names. Putting the structure there would give a general string utility a ledger convention to know
about, and `AssetContent.tsx` would still have to choose which of the two functions to call.

`source/renderer/app/components/assets/Asset.tsx` is not changed either: it already calls
`resolveAssetName`, and the fix is inside that function.

## Implementation Approach

1. **The checksum, in `utils/assetName.ts`.** CRC-8 with polynomial `0x07`, written as the bitwise
   loop rather than as the 256-value table CIP-0067 publishes. The table is the same function
   unrolled, and a 256-entry literal is 256 opportunities for a transcription error that no reader
   would catch, whereas eight lines of shift and xor are checkable against the specification by
   reading them. The four published labels are the test that the two agree.

2. **The structural check, in the same module.** Given the first four bytes of an asset name: the
   leading nibble of the first byte and the trailing nibble of the fourth must both be zero;
   `label_num` is the remaining sixteen bits; the checksum is the eight bits before the trailing
   bracket; and the label is a label when that checksum equals the CRC-8 over `label_num`'s two
   bytes. The label number itself is read and then discarded: it is needed to compute the checksum
   and for nothing else.

   A name shorter than four bytes, or whose first four bytes are not hex, carries no label. The
   prefix is matched with a regular expression before `Buffer.from` sees it, for the reason
   `task-001` recorded: `Buffer.from` stops at the first non-hex pair and truncates rather than
   throwing.

3. **The decoder.**

   ```ts
   export const decodeAssetNameText = (assetName?: string | null): string | null
   ```

   It strips a valid label when the name carries one, then applies `hexToPrintableAsciiString` to
   what is left. When there is no valid label it applies the predicate to the whole name, which is
   exactly today's behaviour.

   The stripped remainder is not retried un-stripped when it fails the predicate. A labelled name
   begins with a byte of at most `0x0f`, so the un-stripped form cannot pass either, and a fallback
   would be a branch no input can reach.

4. **The third rung calls it.** `resolveAssetName` replaces its `hexToPrintableAsciiString` call with
   `decodeAssetNameText`. The branch it feeds is unchanged, so a recovered name returns
   `AssetNameProvenance.MinterChosen` and `isMinterChosenAssetName` still reports true. Nothing about
   the marking, the test id or the tooltip moves.

5. **The annotation calls it.** `AssetContent.tsx` imports `decodeAssetNameText` from
   `utils/assetName` instead of `hexToPrintableAsciiString` from `utils/strings`, so the pop-over
   agrees with the pill about what an asset's name says. The row's value stays the raw hex, label
   included, and stays what is copied.

6. **The citations go in the code, not only here.** The structure line is quoted verbatim in a doc
   comment and attributed to CIP-0067's Specification, and the four labels to CIP-0068's, so the next
   reader can check the claim against the documents rather than trust the code.

## Acceptance Criteria

1. An asset whose name is a valid CIP-0067 label followed by printable ASCII renders that text as its
   name, on the token list, the send form and the transaction list.
2. That name renders in the minter-chosen treatment, not as a published one: same test id, same
   class, same tooltip as any other decoded name.
3. Each of CIP-0068's four labels is stripped, asserted per label, which is also the check that the
   CRC-8 implementation agrees with the published one.
4. A structurally valid label that is not one of those four is stripped.
5. A four-byte prefix with zero brackets and a wrong checksum is not stripped.
6. A four-byte prefix whose brackets are not zero is not stripped.
7. A name that is only a label, with nothing after it, renders no name.
8. A label followed by a non-printable byte renders no name.
9. A name whose decoded text resembles a label is decoded whole and not stripped.
10. The fingerprint a surface renders for a labelled asset is unchanged by this task, asserted
    against the value computed from the full asset name.
11. `compile`, `lint`, `i18n` and `jest` green from `nix build`.
12. No new `@ts-ignore` and no new `@ts-expect-error`; `package.json` and `yarn.lock` unchanged.

## Verification Plan

**`utils/assetName.spec.ts`**, over `decodeAssetNameText` and `resolveAssetName`:

- `0014df105553444d` decodes to `USDM`, the measured case from manual QA, and `0014df10464c4454`
  decodes to `FLDT`.
- The same four ASCII bytes under each of `000643b0`, `000de140` and `001bc280`, so every label
  CIP-0068 publishes is driven. These four cases are the check on the CRC-8: a wrong polynomial or a
  wrong byte order fails all of them.
- Three structurally valid labels CIP-0068 does not define are stripped: 1, which is inside
  CIP-0067's private-use range, 555, which is unregistered today, and 65535, the largest a sixteen-bit
  label number can be. This is the case an allowlist of four would fail.
- `0014df20` and `000644b0`, each of which keeps zero brackets and a valid label number and breaks
  only the checksum, are not stripped. Without these the four positive cases would pass against an
  implementation that checked the brackets and ignored the checksum.
- `1014df10` and `0014df11`, which are label 333 with the leading and the trailing bracket set
  respectively, are not stripped.
- `0014df10` and `000643b0` alone return `null`.
- `0014df1000`, `0014df10ff` and `0014df1055534444e29885` return `null`: a label followed by a byte
  outside the printable range is not a name, including where printable bytes precede the offending
  one.
- `3030306465313430`, which decodes to the text `000de140`, returns that whole text, and
  `30303134646631305553444d`, which reads `0014df10USDM`, keeps all twelve characters.
- `0014df105553444` and `0014df10zz` return `null`, so the hex-shape check `task-001` added still
  applies to the remainder.
- `0014df` and `00` return `null`: a name shorter than a label carries none.
- An unlabelled printable name is unaffected: `436f696e74657374` still decodes to `Cointest`, and a
  32-byte random name still returns `null`.
- An upper-case label is read, so a name in either case behaves the way `HEX_BYTES` already handles
  one.
- `resolveAssetName` on a labelled name with no metadata returns the recovered name with provenance
  `MinterChosen`, and `isMinterChosenAssetName` returns true for it. A registry ticker and a chain
  name each still win over it.

**`components/assets/Asset.spec.tsx`**: a labelled asset with no metadata renders `USDM` under
`data-testid="assetNameMinterChosen"`, carrying `styles.minterChosenName` and the explanatory
`title`, and not under `assetName`. The negative complement is the case that matters: a criterion
asserting only that the text appears would pass against a fix that promoted it to a published name.

**`components/assets/AssetContent.spec.tsx`**: the asset-name parameter row for a labelled asset
shows the full hex as its value, label included, and the annotation carries the recovered name. A
label followed by non-printable bytes shows the hex and no annotation.

**Fingerprint invariance**: the `Asset.spec.tsx` case asserts the rendered fingerprint is the one the
fixture carries, which is computed from the full asset name. If a later change ever strips the label
before fingerprinting, this case fails.

**Commands.**

```
nix build '.#checks.x86_64-linux.compile' --no-link
nix build '.#checks.x86_64-linux.lint'    --no-link
nix build '.#checks.x86_64-linux.jest'    --no-link
nix build '.#checks.x86_64-linux.i18n'    --no-link
git diff HEAD -- package.json yarn.lock   # must be empty
```

## Risks and Open Questions

1. **A minter can put a valid label on an asset that is not CIP-68.** The label is four bytes in a
   free-form name, and the checksum is a transcription check rather than a signature, so anyone can
   compute one. The consequence is bounded and is the reason the marking does not move: whatever comes
   out of the strip renders as minter-chosen, beside the fingerprint, in the treatment that says the
   bytes are the minter's. An asset whose name is the FT label followed by `USDM` is displayed exactly
   as truthfully after this change as before it; the difference is that the user can now read what the
   minter wrote.
2. **A genuinely unlabelled asset whose name happens to satisfy the structure loses four bytes from
   its displayed name.** It has to hit one sequence in 65,536 and its first byte must be at most
   `0x0f`, so the name rendered nothing at all before this change. Rendering the remainder is strictly
   more than nothing, and the bytes that were dropped are still in the hex on the parameter row.
3. **The reference token, label 100, carries no name of its own.** Its name bytes are the label
   followed by the same bytes as the token it describes, so the strip recovers the same text. That is
   correct: a reference token is named after what it references.
4. **The checksum is computed rather than looked up.** CIP-0067 publishes a 256-value table and this
   computes the same values. The four published labels are the evidence that they agree, and they are
   asserted rather than asserted-once-and-trusted, because they run on every check.
5. No open questions for the project owner.

## Required Docs, Research, and Tracking Updates

- Add `task-041` to `.agent/plans/asset-metadata-cache/asset-metadata-cache-tasks.json` in phase 1,
  with dependencies on `task-001` and `task-035`, and set its `status` to `completed` when the
  implementation review reads `approved`.
- Append to `task-041-plan-review.md` and `task-041-impl-review.md` as the cycle requires.
- No PRD change. The PRD's resolution order is unchanged; this task fixes the bottom rung's decoder,
  not the order. That the PRD treats CIP-68 only as a source of a name and never as a shape the asset
  name carries is recorded under Why Chosen Now as the reason the defect existed, and is a finding
  about this task rather than a correction the PRD needs.

## Review-Log Paths

- Planning review log: `.agent/plans/asset-metadata-cache/task-plans/task-041-plan-review.md`
- Implementation review log: `.agent/plans/asset-metadata-cache/task-plans/task-041-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

- An asset name carrying a valid CIP-0067 label is decoded from the bytes after it, so `USDM` and
  `FLDT` render their names instead of a bare fingerprint.
- The label is recognised by its structure, so a label registered after this ships is recognised too.
- The name still renders as minter-chosen, because that is what it is.

## Final Outcome

- `task-041` complete. Reviewed and approved in `task-041-impl-review.md`.

## Self-Review

- The check is on the CIP-0067 structure rather than on the four values CIP-0068 happens to define
  today, which is both more permissive where the standard is open and far stricter against a
  coincidence: one sequence in 65,536 against one in four.
- The CRC-8 is not taken on trust. All four published checksums are reproduced, and a prefix that
  breaks only the checksum is asserted to be rejected, so the four positive cases cannot pass an
  implementation that ignores it.
- The marking is the part of `task-001` this task was most at risk of undoing, so the component case
  asserts the negative as well as the positive.
- Scope held: one decoder, two callers, no change to the predicate, the fingerprint, search or the
  resolution order.
