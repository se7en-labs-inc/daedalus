Implementation: Iteration 1
Timestamp: 2026-09-15T10:05:00Z

Changes made:
- `source/renderer/app/utils/assetName.ts`: added `CIP68_ASSET_NAME_LABELS`, the private `withoutCip68Label`, and `decodeAssetNameText`. The third rung of `resolveAssetName` now calls the new decoder instead of `hexToPrintableAsciiString` directly. The rung, the provenance it returns and `isMinterChosenAssetName` are untouched.
- `source/renderer/app/components/assets/AssetContent.tsx`: the asset-name parameter row's annotation reads the same decoder, imported from `utils/assetName` rather than `utils/strings`. The row's value is still the whole hex, label included, and still what is copied.
- `source/renderer/app/utils/assetName.spec.ts`, `components/assets/Asset.spec.tsx`, `components/assets/AssetContent.spec.tsx`: 21 cases added across the three.

`source/renderer/app/utils/strings.ts` is unchanged, as the plan requires.

Files touched:
- `source/renderer/app/utils/assetName.ts`
- `source/renderer/app/utils/assetName.spec.ts`
- `source/renderer/app/components/assets/AssetContent.tsx`
- `source/renderer/app/components/assets/AssetContent.spec.tsx`
- `source/renderer/app/components/assets/Asset.spec.tsx`
- `.agent/plans/asset-metadata-cache/task-plans/task-041.md`
- `.agent/plans/asset-metadata-cache/task-plans/task-041-plan-review.md`
- `.agent/plans/asset-metadata-cache/task-plans/task-041-impl-review.md`
- `.agent/plans/asset-metadata-cache/asset-metadata-cache-tasks.json`

Verification run:

- Each of the four labels is driven with the same four bytes after it, so every entry in the table is exercised rather than one standing for the rest: `000643b0`, `000de140`, `0014df10` and `001bc280`, each followed by `5553444d`, each decoding to `USDM`.
- `0014df105553444d` and `0014df10464c4454` decode to `USDM` and `FLDT`, which are the two the manual QA report named.
- An upper-case label, `0014DF105553444D`, decodes. The match lower-cases before comparing, so a name in either case is handled the way `HEX_BYTES` already handles one.
- `0014df10` alone returns null. `hexToPrintableAsciiString` rejects the empty remainder at its own guard, so a bare label is no name rather than an empty one.
- `0014df1000`, `0014df10ff` and `0014df1055534444e29885` return null: a label followed by a byte outside the printable range is not a name, including the case where some printable bytes precede the offending one.
- `3030306465313430` decodes whole, to the text `000de140`. This is the case the defect report asked to protect: a name whose decoded text reads like a label, whose bytes are not one. `30303134646631305553444d`, which reads `0014df10USDM`, likewise decodes whole and keeps all twelve characters.
- `0014df105553444` and `0014df10zz` return null, so the hex-shape check `task-001` added still applies after the strip rather than only before it.
- `436f696e74657374` still decodes to `Cointest` and the 32-byte random name still returns null, so nothing unlabelled moved.
- `resolveAssetName` on `0014df105553444d` returns `USDM` with provenance `MinterChosen`, and a registry ticker and a chain name each still win over it.
- Component: a CIP-68 asset renders `USDM` under `assetNameMinterChosen`, carries `styles.minterChosenName` and a non-empty `title`, and renders nothing under `assetName`. The negative half is the one that matters, because an assertion that only looked for the text would pass against a fix that promoted the name to a published one.
- Component: the rendered fingerprint for a CIP-68 asset is the one the fixture carries, which is computed from the policy id and the whole asset name. Nothing in this change reaches `utils/assetFingerprint.ts`, and this case fails if that ever stops being true.
- Component: an asset name that is only a label renders no name element of either kind.
- Pop-over: the parameter row for a CIP-68 asset shows the full hex as its value and the recovered name as its annotation; a label with no text after it shows the hex and no annotation.

Checks, all four through Nix with every file staged:
- `nix build '.#checks.x86_64-linux.compile' --no-link` — exit 0.
- `nix build '.#checks.x86_64-linux.lint' --no-link` — exit 0.
- `nix build '.#checks.x86_64-linux.i18n' --no-link` — exit 0.
- `nix build '.#checks.x86_64-linux.jest' --no-link -L` — exit 0. 100 suites passed, 1,792 tests with 1,789 passed and 3 skipped. The branch stood at 1,771 before this change, so the 21 cases added are the whole of the difference and no suite outside them moved.

`nix fmt` was run before the checks and changed one file.

No new `@ts-ignore` and no new `@ts-expect-error`. `git diff HEAD -- package.json yarn.lock` produces nothing.

Deviations from the approved plan:
- None.

Outcome: Implementation complete and ready for review

Review of Iteration 1
Timestamp: 2026-09-15T10:12:00Z

Acceptance criteria, each against the evidence:

1. *A CIP-68 asset renders the text behind its label, on the token list, the send form and the transaction list.* Met. All six surfaces route the name through `Asset.tsx`'s `renderPillContent`, which `task-001` established and verified by grep; the fix is inside the resolver that method calls, so there is no per-surface path to miss. The three named surfaces already have a case each driving their own prop shapes, and those cases still pass.

2. *It renders as minter-chosen, not as published.* Met, and asserted in both directions: the fixture lands under `assetNameMinterChosen` with the class and the tooltip, and does not land under `assetName`.

3. *Each of the four labels is stripped, asserted per label.* Met. Four cases, not one parameterised case over a list that could be read from the implementation.

4. *A label followed by a non-printable byte renders no name.* Met over three shapes, including one where printable bytes precede the offending byte.

5. *A name that is only a label renders no name.* Met at the decoder and at the component.

6. *A non-CIP-68 name whose text resembles a label is decoded whole.* Met, and this is the case the plan's first draft got wrong. The match is on bytes and every one of the four labels contains `0x00`, so the two representations cannot collide.

7. *The fingerprint is unchanged.* Met, and pinned by an assertion rather than by an argument.

8-9. *Four Nix checks green, no new suppressions, no dependency change.* All met.

Two things worth saying beyond the criteria.

The decision not to retry the un-stripped name when the stripped one fails is the right one and is worth stating, because the opposite is the obvious defensive move. A name that begins with a real label begins with `0x00`, so the un-stripped form can never pass a printable test. A fallback would be a branch no input reaches, and the one input that would reach it is a name whose first four bytes are a label by coincidence rather than by intent, which is not distinguishable and not worth guessing at.

The `AssetContent` change is the half of this that a reader might take for tidying. It is not. Before it the pop-over and the pill disagreed about whether a CIP-68 asset had a name, and a user who opened the pop-over to find out what the fingerprint belonged to was told less than the row already showed them.

Summary: One decoder, two callers, four exact labels matched on bytes. The part of this that was most at risk was `task-001`'s marking, because recovering a readable name from a token that publishes nothing is exactly the shape of thing that gets promoted to looking published by accident. It is asserted in the negative, and the fingerprint the defect report asked about is asserted too.

Decision: approved

Implementation: Iteration 2
Timestamp: 2026-09-15T11:40:00Z

Correction to Iteration 1, which was approved against a plan that was itself wrong. Iteration 1 is not edited; this entry says what was wrong with it and what replaced it. The plan-review log's Iteration 3 records the planning defect: the prefix is a CIP-0067 construct with a validatable structure, not a CIP-68 allowlist of four hex strings.

What was wrong in the built code:
- `CIP68_ASSET_NAME_LABELS` was an exported array of four hex strings, and `withoutCip68Label` matched a lower-cased prefix against it. Correct for the four labels registered today and silently wrong for the fifth, which CIP-0068 requires to be registered through a new CIP rather than forbidding.
- The doc comment said a label is "not recomputed from its CIP-67 checksum, because a label this codebase can say nothing about is not a reason to drop four bytes off a name." That is the discrimination argument inverted. A structural check accepts strictly more real labels and strictly fewer coincidences than the list does.

Changes made in this iteration:
- `source/renderer/app/utils/assetName.ts`: the exported array and the prefix match are gone. `crc8` computes CRC-8 with polynomial `0x07` as the bitwise loop; `hasCip67Label` checks that the leading nibble of the first byte and the trailing nibble of the fourth are zero, reads the sixteen-bit label number and the eight-bit checksum out of the middle, and accepts only when the checksum equals the CRC-8 over the label number's two bytes. `withoutCip67Label` strips on that verdict. `decodeAssetNameText` is unchanged in signature and in what it returns for every input that was already correct.
- The doc comment now quotes CIP-0067's layout line verbatim and attributes it and the checksum to that document's Specification, and attributes the four registered numbers to CIP-0068's. The label number is read only to compute the checksum and is then discarded; nothing renders an asset class.
- `source/renderer/app/utils/assetName.spec.ts`: the four-label cases kept and renamed to say which registered number each is, plus a valid-but-unregistered label case, a wrong-checksum case, a non-zero-brackets case, and a name shorter than a label.
- `components/assets/Asset.spec.tsx` and `AssetContent.spec.tsx`: fixture comments corrected to name CIP-0067 as the source of the label. No assertion changed.
- `.agent/plans/asset-metadata-cache/asset-metadata-cache-tasks.json`: the `task-041` entry re-cut around the structure, with both specifications cited in its implementation notes and the reason the defect existed in its notes field.

The regular expression that gates the prefix before `Buffer.from` sees it is kept and is doing the same work `task-001` recorded: `Buffer.from` stops at the first non-hex pair and truncates rather than throwing, so `zzzzzzzz` would otherwise reach the structural check as a zero-length buffer and read `undefined` out of it.

Verification run, the cases this iteration adds or changes:

- The CRC-8 reproduces all four published checksums: 59 for label 100, 20 for 222, 241 for 333, 40 for 444. Four out of four, asserted through the four positive decode cases rather than against a hardcoded expectation, so a wrong polynomial or a wrong byte order fails all of them.
- Three structurally valid labels CIP-0068 does not define are stripped: `00001070` (label 1, inside CIP-0067's private-use range), `0022bfb0` (555, unregistered today) and `0ffff240` (65535, the largest a sixteen-bit label number can be). This is the case the allowlist built in Iteration 1 would have failed.
- `0014df205553444d` and `000644b05553444d` are not stripped. Each keeps zero brackets and a valid label number, 333 and 100 respectively, and breaks only the checksum: 242 against 241, and 75 against 59. Without these two the four positive cases would pass against an implementation that checked the brackets and computed nothing.
- `1014df105553444d` and `0014df115553444d` are not stripped: label 333 with the leading and the trailing bracket set.
- `0014df` and `00` return null. A name shorter than a label carries none, and the prefix expression rejects them before any byte is read.
- Everything Iteration 1 verified still holds: the two measured names, a bare label, a label followed by a non-printable byte, a name whose text reads like a label, the hex-shape check after the strip, an unlabelled printable name, a 32-byte random name, and the provenance and marking at both the resolver and the component.

Checks, all four through Nix with every file staged:
- `nix build '.#checks.x86_64-linux.compile' --no-link` — exit 0.
- `nix build '.#checks.x86_64-linux.lint' --no-link` — exit 0.
- `nix build '.#checks.x86_64-linux.i18n' --no-link` — exit 0.
- `nix build '.#checks.x86_64-linux.jest' --no-link -L` — exit 0. 100 suites passed, 1,796 tests with 1,793 passed and 3 skipped. The branch stood at 1,771 before this task, so the 25 cases it adds are the whole of the difference and no suite outside them moved.

`nix fmt` was run before the checks and changed two files.

No new `@ts-ignore` and no new `@ts-expect-error`. `git diff HEAD -- package.json yarn.lock` produces nothing.

Deviations from the approved plan:
- None from the revised plan.

Outcome: Implementation complete and ready for review

Review of Iteration 2
Timestamp: 2026-09-15T11:48:00Z

Acceptance criteria, each against the evidence. Criteria 1, 2, 7, 8, 9 and 10 were met in Iteration 1 and their cases are unchanged and still pass; the review of that iteration stands for them. The four the revision adds:

3. *Each of CIP-0068's four labels is stripped, and that is the check on the CRC-8.* Met. This is the part of the revision that most deserved a second look, because a checksum implementation that is wrong in a way that happens to accept the four values it is tested against is a real hazard. It is not the case here: the four labels carry four different checksums, 59, 20, 241 and 40, and the implementation computes rather than looks up, so agreeing on all four is evidence about the function and not about a table.

4. *A structurally valid label that CIP-0068 does not define is stripped.* Met over three, chosen to span the range rather than to sit near the four: 1 at the bottom, 555 just past the registered numbers, and 65535 at the ceiling of what sixteen bits hold.

5. *A prefix with zero brackets and a wrong checksum is not stripped.* Met over two, and this is the case that makes criterion 3 mean anything. Each is one of the published labels with a single nibble moved, so the brackets and the label number still validate and only the checksum does not.

6. *A prefix whose brackets are not zero is not stripped.* Met over both brackets separately rather than one standing for the pair.

Two things worth saying about the correction itself.

The Iteration 1 code was not merely less general, it carried an argument that was wrong in the comment, and that is the more expensive kind of error: a reader would have taken "not recomputed from its CIP-67 checksum" as a considered decision rather than as a gap. The comment now quotes the layout and names both documents, so the next reader checks the claim instead of inheriting it.

The decision to compute the CRC-8 rather than transcribe CIP-0067's published table is the right one and the reason should not be lost. A 256-entry literal cannot be reviewed by reading it; eight lines of shift and xor can, and the four published labels are a test that runs on every check rather than a one-time comparison against the table.

Summary: The structure is validated, not a list matched. That is simultaneously more permissive where the standard is open, since CIP-0068 requires new asset classes to arrive as new CIPs, and much stricter against coincidence, since a prefix now has to satisfy two bracket nibbles and a checksum over its own middle bytes. The marking `task-001` established is untouched and still asserted in the negative, and the fingerprint is still pinned.

Decision: approved
