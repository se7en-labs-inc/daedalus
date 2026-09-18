Planner: Iteration 1
Timestamp: 2026-09-15T09:05:00Z

Plan Summary:
- Created `.agent/plans/asset-metadata-cache/task-plans/task-041.md` with the twenty-one sections the plan-workspace readme requires.
- Classified the task `agent_execution`. Every criterion is settled by a Jest spec and the four Nix checks.
- The first draft put the label strip inside `hexToPrintableAsciiString` in `source/renderer/app/utils/strings.ts`, so that both existing callers picked it up with no change of their own.

Docs, Workflows, Research, and Skills Consulted:
- `.agent/plans/asset-metadata-cache/task-plans/task-001.md` and `task-001-impl-review.md`, for the predicate, the marking and the reason the predicate validates the hex shape.
- `.agent/plans/asset-metadata-cache/task-plans/readme.md` for the cycle and the section list.
- `CLAUDE.md` for the spec and TypeScript conventions.

Repo-Verified Findings Used To Shape The Plan:
- `source/renderer/app/utils/strings.ts:39-51` is the predicate; `utils/assetName.ts:67-73` is the rung that consults it; `components/assets/AssetContent.tsx:124-125` is the second surface that decodes the same bytes.
- `Buffer.from('0014df105553444d','hex')` is `00 14 df 10 55 53 44 4d`, so the last four bytes are `USDM` and the whole-name test is false.
- `grep -rn "hexToPrintableAsciiString" source` returns two callers and their specs, and nothing else.

Planned Approach:
- Recognise four label prefixes, strip one before the printable test, leave the marking alone.

Scope Guard / Self-Review:
- No change to the marking, the fingerprint, search, `hexToString` or the resolution order.

Outcome: Canonical task plan drafted and ready for critique

Critique of Iteration 1
Timestamp: 2026-09-15T09:20:00Z

- **The strip does not belong in `strings.ts`.** `hexToPrintableAsciiString` answers a question about a hex string and a byte range, with no asset anywhere in it. CIP-68 is a Cardano ledger convention about asset names. Putting the table there gives a general string utility something to know about tokens, and makes the predicate return a value that is not a decode of its input, which is a surprise for any caller that arrives later. The decoder goes in `utils/assetName.ts`, which is the module that already owns what an asset name means, and `AssetContent.tsx` imports it from there.

- **The plan named one surface and there are two.** The first draft changed the resolver and stopped. `AssetContent.tsx:124-125` decodes the same bytes for the parameter row's annotation, so a CIP-68 asset would have kept showing nothing there while the pill showed `USDM`. Two surfaces disagreeing about what an asset's name says is worse than both being silent. Added to Scope and to Files Expected To Change.

- **"Strip four bytes when the whole name is not printable" was the wrong rule and nearly got written.** It is shorter and it is wrong: it would decode the tail of any non-printable name, which is a different thing from recovering a CIP-68 name and would invent names for assets that have none. The rule is that the first four bytes are one of four exact labels.

- **The "resembles a label" case was described against the wrong representation.** The first draft worried about a hex name that begins with the characters `000de140` and is not CIP-68 — which is not a case, because that *is* the label. Re-derived: the case the defect report means is a name whose decoded *text* reads like a label, and that text is the hex `3030306465313430`. Measured, and both the finding and the spec case now say so. The same measurement settles a second question the plan had left implicit: all four labels contain `0x00`, so no name that passes the printable test can begin with one, and the strip can never fire on a name that would have decoded anyway.

- **Nothing asserted that the marking survived.** The acceptance criterion as first written was "a CIP-68 asset renders its name", which passes equally against a fix that promoted the recovered name to a published one. That is precisely the property `task-001` exists to hold, and the defect report names it. The component case now asserts the negative as well: the fixture must land under `assetNameOnChain` and must not land under `assetName`.

- **Nothing pinned the fingerprint.** The defect report asks to stop if the strip turns out to interact with the fingerprint computation. It does not: `utils/assetFingerprint.ts` hashes the policy id and the full asset name as bytes and never sees a decoded string. That is worth an assertion rather than a paragraph, so the component case asserts the rendered fingerprint is the one computed from the full name.

- **A bare label needed checking rather than assuming.** `hexToPrintableAsciiString('')` returns `null` at the guard on `strings.ts:42`, before the regular expression, so an empty remainder needs no second branch. Verified and recorded, because a decoder that returned the empty string here would render an empty name element.

What changed in response: the decoder moved to `utils/assetName.ts` and `strings.ts` came off the changed-files list with the reason; `AssetContent.tsx` and its spec added to Scope and to Files Expected To Change; the unconditional-strip rule replaced by the four-label match and named as a Non-Goal; the label collision finding re-measured and rewritten against the decoded text; acceptance criteria 2, 6 and 7 added; the empty-remainder behaviour verified and recorded under Live Repo Findings.

Scope guard: one decoder, two callers, four labels, no change to the predicate, the marking, the fingerprint, search or the resolution order. No new message, so no i18n artifact moves.

Outcome: Canonical task plan revised after critique and approved for build execution

Planner: Iteration 3
Timestamp: 2026-09-15T11:05:00Z

Correction to Iteration 2, which was approved and built before this was caught. Iteration 2 is not edited; this entry says what was wrong with it.

**What was wrong: the plan matched an allowlist of four hex strings, and the prefix is not a CIP-68 construct at all.** CIP-0067, the Asset Name Label Registry, defines the format; CIP-0068 is one consumer of it and registers four numbers. Iteration 2 called the labels "the four CIP-67 labels CIP-68 defines", which reads as though CIP-0067 contains those four, and then hardcoded them. It also recorded "No CIP-67 checksum validation" as a Non-Goal, with the reasoning that a label this codebase can say nothing about is not a reason to drop four bytes off a name. That reasoning is backwards.

Three things follow, and each is a defect in the approved plan rather than a refinement of it.

- **The label set is open by design.** CIP-0068's Specification states that further asset classes MUST be submitted as a new CIP and registered in CIP-0067 once accepted. A list of four is therefore right only until a fifth is registered, and wrong silently after that: an asset carrying a new label would render as a bare fingerprint, which is the defect this task exists to fix, reappearing for a class of token nobody would think to look at.

- **The structure is a far stronger filter than the list, not a weaker one.** The Non-Goal had the discrimination argument exactly inverted. CIP-0067 lays the label out as `[ 0000 | 16 bits label_num | 8 bits checksum | 0000 ]`, where the checksum is CRC-8 with polynomial `0x07` over `label_num` including its padded zeros. A coincidental four-byte prefix has to carry a zero leading nibble, a zero trailing nibble, and a checksum over its own middle bytes: one sequence in 65,536, against one in four for the allowlist. Validating the structure accepts strictly more real labels and strictly fewer accidents.

- **The checksum can be checked here rather than asserted.** CRC-8 with that polynomial, computed over the two bytes of the label number, reproduces all four of CIP-0068's published checksums: 59 for 100, 20 for 222, 241 for 333 and 40 for 444. Four out of four. That measurement is what makes the computed form safe to use in place of the 256-value lookup table CIP-0067 publishes, and it runs on every check rather than being taken once.

**A second finding, about why the defect existed at all.** `grep -rniE "cip.?0?67"` over the whole repository returns nothing outside this task's own files. Every pre-existing mention of CIP-68 is about a metadata record: `koiosClient.ts` requests `cip68_metadata` and reads a datum out of it, and the resolver turns that into a row. The PRD engages with CIP-68 the same way, as somewhere a name can come from, never as a shape the asset name itself has. That is how a printable-ASCII check over raw asset name bytes shipped looking complete while rejecting every CIP-68 name there is. It belongs in the plan as the reason rather than as an aside, and it is now the third paragraph of Why Chosen Now.

**What the specification says, cited so the next reader can check it rather than trust it.** CIP-0067, Specification, gives the four-byte layout quoted above, puts `label_num` in the decimal range 0 to 65535, specifies CRC-8 with polynomial `0x07` over the padded label number, and publishes a 256-value lookup table for it; its own registry currently assigns only 0 to 15, as private use. CIP-0068, Specification, registers 100 reference NFT, 222 NFT, 333 FT and 444 RFT. Both citations are now in the plan and in a doc comment on the code, with the structure line quoted verbatim.

**One implementation decision this forces, taken deliberately.** CIP-0067 publishes the checksum as a table and this computes it. A 256-entry literal is 256 chances for a transcription error that no reviewer would catch by reading; eight lines of shift and xor can be checked against the specification by eye. The four published labels are the evidence that the two forms agree, and a fifth case asserts that a prefix breaking only the checksum is rejected, so the four positive cases cannot pass an implementation that computes nothing.

What changed in response: the title and the whole plan re-cut around CIP-0067 rather than CIP-0068; the allowlist removed and named as a Non-Goal in its place; the checksum Non-Goal deleted; Research Consulted given both specifications by name and section with what each contributes; the CRC-8 verification table added under Live Repo Findings, with the discrimination arithmetic; acceptance criteria 4, 5 and 6 added for the valid-but-unregistered label, the wrong checksum and the non-zero brackets; the verification plan given those cases plus a name shorter than a label; Why Chosen Now given the paragraph on why the repository had no concept of a labelled asset name.

Scope guard unchanged: one decoder, two callers, no change to the predicate, the marking, the fingerprint, search or the resolution order. No new message, so no i18n artifact moves. The label number is computed only to check the checksum and is then discarded; nothing renders an asset class.

Outcome: Canonical task plan revised after critique and approved for build execution
