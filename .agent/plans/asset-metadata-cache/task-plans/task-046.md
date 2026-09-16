## Task ID and Title

`task-046`: Apply the registry's decimal places on attestation alone, and call
the column `attested`.

## Why Chosen Now

`task-010` gave the cache one verdict column and `task-019` made that column the
switch that decides whether an amount is drawn in issuer units. The verdict is
`bound && satisfied && attested`, and `bound` needs the registry's OPTIONAL
`policy` field. About half the entries that publish a decimal place count omit
it, so half of them are refused for a reason that is not about whether the
issuer signed anything.

The measurement is below. The rule as built refuses 51 signed values in a
120-entry sample in order to catch 2 bookkeeping errors, and it is already
inconsistent with itself: an entry with no `policy` field supplies the name, the
ticker and the description that the token list renders without comment, and only
its decimals are withheld.

## Interaction Mode

`agent_execution`.

The rule change, the rename and the copy are all mechanical and all checkable
here. Both live cases the new rule turns on are fetched from the production
registry and pinned as fixtures, so the behaviour is driven by real bytes rather
than by a constructed entry.

## Scope

1. The gate on applying a registry decimals value moves from `verified` to
   `attested`.
2. `verified` is renamed to `attested` everywhere that verdict travels: the
   `asset_metadata` column, the write and row types, the IPC entry, the `Asset`
   field, the resolution input and the disagreement helper.
3. `ASSET_METADATA_DB_VERSION` goes to 2.
4. The four user-visible strings written around the old meaning are rewritten,
   and the three whose ids carry the old word are re-keyed.
5. Specs: the rule's cases are replaced, and the two live entries are added as
   fixtures.

## Non-Goals

- **No settings toggle.** Deferred to the tokens settings page that will carry
  the image controls.
- **No policy-binding marker.** The binding verdict stops being user-visible in
  this pass and gains no positive indicator. That design is unsettled.
- **No change to the asset image or logo path.** An open investigation into
  logos above roughly 20 KB not rendering is unresolved, and nothing here goes
  near it.
- **No change to `verifyRegistryProperty`'s return shape.** It keeps reporting
  all four facts. What changes is which one the resolver reads.
- **No change to how names, tickers, descriptions or URLs are stored.** They
  were already written regardless of any verdict.

## Dependencies

`task-010`, `task-019`, `task-020`, `task-022`.

## Research Consulted

- `asset-metadata-cache-prd.md:1143-1261`, goal two, for the resolution order
  and the whole-corpus verification table it rests on.
- `asset-metadata-cache-prd.md:1262-1286`, goal three, for where the advisory
  lives and why it lives in one place only.
- The live registry at `tokens.cardano.org`, sampled for this task. The
  measurement is in the findings below.

## Docs, Workflows, and Skills Consulted

- `CLAUDE.md` for the conventions that bite: `type` over `interface`, no new
  `@ts-ignore`, the i18n id shape and the `!!!` prefix, and the rule that a
  check is verified through `nix build` and not through a `yarn` script.
- `.agent/skills/i18n-messaging/SKILL.md` for the message id shape, the
  `description` requirement, and the behaviour of `yarn i18n:manage`.

## Live Repo Findings Verified For Planning

1. **The gate is one property read.** `assetMetadataResolver.ts:144-153`,
   `verifiedDecimals`, calls `verifyRegistryProperty` and returns `.verified`.
   That value is written to the row at `:165` and is the only producer of the
   column.

2. **`verified` is the three-step conjunction.**
   `assetVerification.ts:463-484`: `bound` is `verifyPolicyBinding(...).bound`,
   `satisfied` is that binding evaluated against the attesting key set, and
   `attested` is `isPropertyAttested`. `verified` is `bound && satisfied &&
   attested`.

3. **`bound: false, reason: 'absent'` is the ordinary state, not an error.**
   `assetVerification.ts:282-285` returns it for an entry with no `policy`
   field, and the comment there already says so.

4. **The measurement, taken against the live registry for this task.** 120
   mappings sampled at random from 7,977:

   | | count | share of the 120 |
   |---|--:|--:|
   | publish a `decimals` value | 106 | 88.3% |
   | of those, attested at the declared sequence number | 104 | 86.7% |
   | of those, also carrying `policy`, so applied today | 53 | 44.2% |
   | attested but unbound, refused today | 51 | 42.5% |
   | not attested | 2 | 1.7% |

   The sample agrees with the whole-corpus table at
   `asset-metadata-cache-prd.md:1164-1171`, which was taken at registry commit
   `363982b9` on 2026-09-14 over all 7,977 files: 6,979 of them publish a
   decimals value (87.5%, against 88.3% here) and 3,632 of those verify (52.0%
   of the publishers, against 50.0% here). So the corpus figure already implied
   this and nobody read it that way: the fourth row of that table is the share
   whose amounts change, and the rows above and below it are not all unverifiable
   for the same reason.

5. **Neither of the two refusals is an attack.** One carries no signatures at
   all. The other is MELD,
   `6ac8ef33b510ec004fe11585f7c5a9f0c07f0c23428ab4f29c1d7d104d454c44`: every one
   of its six properties declares `sequenceNumber` 1, and every one of its
   signatures verifies against the payload built at sequence number 0. Someone
   edited the entry and bumped the counter without re-signing. Verified locally
   on 2026-09-16 by rebuilding the attestation payload at each sequence number
   from 0 to 6 and testing every signature against each.

6. **USDM is the other side of the same fact.**
   `c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d`
   has no `policy` field at all, and all six of its properties are attested at
   their declared sequence numbers, `decimals` at 0 with the value 6. Daedalus
   renders its name, its ticker and its description from that entry today and
   withholds only the 6.

7. **A version bump recreates the file rather than failing.**
   `assetMetadataDb.ts:245-268`, `openHandle`, throws when `PRAGMA user_version`
   is neither 0 nor the constant. The constructor at `:273-292` catches that,
   logs `recreating the database`, deletes the file and its `-wal` and `-shm`
   siblings, and opens once more. A second failure leaves `_db` null and every
   read answers empty, which is a cold cache.

8. **The bump is required here, not merely tidy.** The schema is applied with
   `CREATE TABLE IF NOT EXISTS` (`assetMetadataDb.ts:37`), which will not add a
   renamed column to a table that already exists. Without the bump, an existing
   cache keeps a `verified` column, every `SELECT ... attested` raises `no such
   column`, and `_read` swallows it (`:477-500`) and answers empty. Every row
   would look like a miss forever.

9. **The four strings.** `assets.settings.dialog.unverifiedDecimals`
   (`AssetSettingsDialog.tsx:87-94`), `assets.warning.availableUnverified`
   (`:74-81`), `assets.warning.notUsingUnverified` (`:94-101`) and
   `wallet.tokens.decimalPlacesNotice` (`WalletTokens.tsx:30-36`). The first
   three all say the figure "could not be checked against the token's minting
   policy, so Daedalus does not apply it". The fourth says an issuer "has
   published **and proved**" the count.

10. **The Japanese values for all four are untranslated placeholders.**
    `ja-JP.json:86`, `:88`, `:90` and `:1559` each hold the English string
    behind a `!!!` prefix. No translator output is dropped by re-keying them.

11. **`yarn i18n:manage` adds and never rewrites.** Confirmed by `task-045`,
    which changed two ids and had to hand-edit all three locale files. A changed
    `defaultMessage` under an unchanged id leaves every check green and the old
    wording on screen.

12. **The rename reaches two names the brief does not list.**
    `DecimalSettingDisagreement.WithVerified` and `.WithUnverified`
    (`components/wallet/tokens/wallet-token/helpers.ts:11-15`) are the verdict
    crossing into the copy decision, and the consumer at
    `AssetSettingsDialog.tsx:212` already calls the local variable
    `isUnattested`. They move with everything else.

## Files Expected To Change

Main process:

- `source/main/assets/assetMetadataResolver.ts`
- `source/main/assets/assetMetadataDb.ts`
- `source/main/assets/assetVerification.ts` (doc comment only)
- `source/main/ipc/assetMetadataChannel.ts`
- `source/common/types/asset-metadata.types.ts`

Renderer:

- `source/renderer/app/utils/assetDecimals.ts`
- `source/renderer/app/stores/AssetsStore.ts`
- `source/renderer/app/domains/Asset.ts`
- `source/renderer/app/utils/assets.ts`
- `source/renderer/app/api/assets/types.ts`
- `source/renderer/app/components/wallet/tokens/wallet-token/helpers.ts`
- `source/renderer/app/components/wallet/tokens/wallet-token/WalletToken.tsx`
- `source/renderer/app/components/assets/AssetSettingsDialog.tsx`
- `source/renderer/app/components/assets/AssetSettingsDialog.scss`
- `source/renderer/app/components/wallet/tokens/wallet-tokens/WalletTokens.tsx`
- `source/common/config/electron-store.config.ts` (comment only)

Locales:

- `translations/messages.json`
- `source/renderer/app/i18n/locales/defaultMessages.json`
- `source/renderer/app/i18n/locales/en-US.json`
- `source/renderer/app/i18n/locales/ja-JP.json`

Specs and fixtures:

- `source/main/assets/registryEntry.fixture.ts` (new)
- `source/main/assets/assetVerification.spec.ts`
- `source/main/assets/assetMetadataResolver.realfs.spec.ts`
- `source/main/assets/assetMetadataDb.realfs.spec.ts`
- `source/main/assets/assetImageStore.realfs.spec.ts`
- `source/main/ipc/assetMetadataChannel.realfs.spec.ts`
- `source/renderer/app/utils/assetDecimals.spec.ts`
- `source/renderer/app/stores/AssetsStore.spec.ts`
- `source/renderer/app/components/assets/AssetSettingsDialog.spec.tsx`
- `source/renderer/app/components/wallet/tokens/wallet-token/helpers.spec.ts`
- `source/renderer/app/components/wallet/tokens/wallet-tokens/WalletTokens.spec.tsx`

Plan:

- `.agent/plans/asset-metadata-cache/asset-metadata-cache-prd.md`
- `.agent/plans/asset-metadata-cache/asset-metadata-cache-tasks.json`
- the three review-log files for this task.

## Implementation Approach

**The rule.** `verifiedDecimals` becomes `attestedDecimals` and reads
`.attested`. Its doc comment is rewritten: the column is still the verdict for
the `decimals` property of the row and still has exactly one meaning, but that
meaning is now "the issuer's signature covers this value at this sequence
number" and not "and the policy field also tied the signing key to the minting
policy". The comment says why the binding stopped being the gate, because the
next reader will otherwise re-derive the argument or reverse it.

**The name.** `verified` becomes `attested` at every layer, rather than being
redefined where it stands. The word has to match what was measured: a column
named `verified` holding the answer to "is it signed" is the same defect class
this plan has produced twice already. `attested` also leaves room beside it, and
the shape it leaves room for is `bound`, which a later change may want to
surface. `attested` beside `bound` reads correctly; `verified` beside `bound`
does not.

`verifyRegistryProperty` keeps all four of its fields, including `verified`. The
conjunction remains a true and useful fact about a property, `assetVerification`
is the one module where the three steps are separable, and the comment claiming
`verified` is "the only field to test for a verdict" is corrected rather than
the field removed.

**The version.** `ASSET_METADATA_DB_VERSION` goes to 2. The recreate path is
already the migration and finding 7 confirms it. Every row can be fetched again,
so nothing is preserved and nothing needs to be.

**Resolution order** becomes: the user's setting, then the registry value when
`attested`, then none. `AssetDecimalsProvenance.VerifiedRegistry` becomes
`AttestedRegistry` with the value `attestedRegistry`. The user's own setting
still beats everything including zero, which the `typeof === 'number'` test
already gets right and which stays covered.

**The copy.** When Daedalus now refuses a published value it is because the
issuer's signature does not cover it, which is a far stronger and rarer
statement than the one the current sentences make. The three `*Unverified`
strings say that instead, and their ids move to `*Unattested` so the key does
not contradict the value. Re-keying means hand-editing `defaultMessages.json`,
`en-US.json` and `ja-JP.json`, because `i18n:manage` only ever adds.

`wallet.tokens.decimalPlacesNotice` keeps its id, which is about the notice and
not about a verdict, and loses "and proved" for "and signed".

The existing copy says "issuer" throughout and keeps saying it. The settings
toggle that lands later will be worded "use publisher's decimal values", and
reconciling the two vocabularies is that task's to do, not this one's. Noted in
Risks so it is not lost.

**The fixtures.** `registryEntry.fixture.ts` holds both live entries with their
real signatures, beside `chainPointer.fixture.ts` and for the same reason: a
constructed entry proves the code agrees with itself, and these prove it agrees
with the registry. USDM is the attested-and-unbound case that this change
exists for. MELD is the whole of the genuine refusal in a 120-entry sample, and
its shape is asserted specifically: the signature verifies at sequence number 0
and not at the declared 1, so the spec distinguishes a stale registry edit from
a wrong signature and would fail if `attested` were computed against a sequence
number the entry did not declare.

## Acceptance Criteria

1. A registry entry whose `decimals` property is attested has its value applied,
   whether or not the entry carries a `policy` field.
2. A registry entry whose `decimals` property is not attested has its value
   refused and its amount drawn in raw units.
3. A user's per-subject setting still wins over both, including a setting of
   zero against a nonzero attested value.
4. No symbol, column, type field, IPC field, prop or enum member on the verdict's
   path is still called `verified`, other than `PropertyVerificationResult`'s own
   conjunction.
5. `ASSET_METADATA_DB_VERSION` is 2, and a cache written at 1 is deleted and
   recreated rather than read.
6. The four strings describe the new rule, and the three re-keyed ids carry the
   same value in all three locale files.
7. `compile`, `lint`, `stylelint`, `i18n` and `jest` green from `nix build`.
8. No new `@ts-ignore` and no new `@ts-expect-error`; `package.json` and
   `yarn.lock` unchanged.

## Verification Plan

**The rule, at the layer that decides it.** `assetMetadataResolver`'s
verification block currently has a case asserting that an entry with no policy
is refused. That case is the rule being changed, and it is replaced by its
opposite, asserting `attested: true` for the same entry. The neighbouring case
that refuses a broken decimals signature is unchanged and is what stops the new
rule collapsing into "apply whatever arrives".

**The rule, against real bytes.** `registryEntryToRow` over the two fixtures:
USDM produces `decimals: 6, attested: true` from an entry with no `policy`
field, MELD produces `decimals: 6, attested: false`.

**The MELD shape.** In `assetVerification.spec.ts`, `isPropertyAttested` over
MELD's `decimals` property returns false as it arrives and true with
`sequenceNumber` forced to 0. That is the assertion that says what kind of
failure it is.

**The resolution order.** `assetDecimals.spec.ts` keeps its user-setting cases
unchanged, replaces `never applies an unverified registry value` with a case
applying an attested-but-unbound value, and keeps a case refusing a
not-attested one and a case refusing a value with no verdict at all.

**The existing specs that assert the old word** are renamed with it, and each is
re-read rather than sed-replaced, because one of them asserts the old rule and
not merely the old name.

**What none of this covers.** No spec here opens a cache written at version 1.
The recreate path is exercised by `assetMetadataDb.realfs.spec.ts`'s existing
version-mismatch case, which writes a deliberate mismatch rather than a real
prior schema, so what is confirmed is that a mismatch recreates and not that
this particular prior schema does. The difference does not matter, because the
recreate deletes the file without reading it.

**Checks.** `compile`, `lint`, `stylelint`, `i18n` and `jest` through
`nix build '.#checks.x86_64-linux.<name>' --no-link`.

## Risks and Open Questions

- **The rule is weaker than the one it replaces, and deliberately so.** An
  attested but unbound value proves that whoever holds the signing key the
  registry has on file for that subject signed this number. It does not prove
  that key can mint the token. The defense against a bad entry is the registry's
  own review of a pull request against a curated repository, plus the user's
  per-token override. The measurement says that buying the stronger claim costs
  49% of the signed values, and the 2 it catches in 120 are both bookkeeping
  rather than attack.

- **The binding verdict stops being visible and is not stored.** The column
  holds one fact and now holds the attestation. Anyone who wants the binding
  back has to add a second column, which is why the name leaves room for it.

- **"Issuer" and "publisher" disagree across surfaces.** Every string here says
  "issuer". The deferred settings toggle is specified as "use publisher's
  decimal values". Recording it rather than half-fixing it: one vocabulary for
  both belongs in the task that adds the toggle, where both wordings are on
  screen at once.

- **A cache is discarded on first run after this lands.** That is the intended
  effect of the version bump, and it costs one registry round trip per held
  subject.

## Required Docs, Research, and Tracking Updates

- `asset-metadata-cache-prd.md`, goal two: the resolution order, the rule, and
  the measurement behind it. The existing corpus table stays, with the reading
  of its fourth row corrected.
- `asset-metadata-cache-tasks.json`: `task-046` added to `phase-4`, with the
  measurement in its notes, and its `status` moved to `completed` when the
  implementation review is approved.

## Review-Log Paths

- `.agent/plans/asset-metadata-cache/task-plans/task-046-plan-review.md`
- `.agent/plans/asset-metadata-cache/task-plans/task-046-impl-review.md`

## Planning Status

approved

## Build Status

completed

## Current Outcome

A token whose issuer signed its decimal places is drawn in those places, and the
column that records it is called what it measures.

## Final Outcome

Complete.

## Self-Review

The number was already in the plan. The corpus table at
`asset-metadata-cache-prd.md:1164-1171` has held the shares since 2026-09-14,
and it was read as "10.7 percent of subjects get formatted amounts" rather than
as "half the entries that publish a number are refused for lacking an optional
field".
