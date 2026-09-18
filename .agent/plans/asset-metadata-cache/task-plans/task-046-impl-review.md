Implementation: Iteration 1
Timestamp: 2026-09-16T15:40:00Z

Changes made:

**The rule.** `assetMetadataResolver.ts`: `verifiedDecimals` is now
`attestedDecimals` and reads `.attested` off `verifyRegistryProperty`. Its doc
comment carries the measurement and the reason the binding stopped being the
gate, because the next reader will otherwise re-derive the argument or reverse
it.

**The name.** `verified` is `attested` in the `asset_metadata` column and its
CHECK, in `AssetMetadataWrite` and `AssetMetadataRow`, in the upsert and the
select, in `AssetMetadataEntry` on the IPC wire, in `Asset.recommendedDecimals*`,
in `getAssetTokenFromToken`'s merged row, in `AssetToken`, in
`resolveAssetDecimals`'s input, and in `DecimalSettingDisagreement`'s two members.
`AssetDecimalsProvenance.VerifiedRegistry` is `AttestedRegistry`.

**The version.** `ASSET_METADATA_DB_VERSION` is 2.

**The copy.** Three ids moved to `*Unattested` and all four strings say what the
refusal now means. `assets.settings.dialog.unattestedDecimals`,
`assets.warning.availableUnattested` and `assets.warning.notUsingUnattested` say
the issuer's signature does not cover the figure.
`wallet.tokens.decimalPlacesNotice` keeps its id and says "published and signed"
rather than "published and proved".

**The fixtures.** `source/main/assets/registryEntry.fixture.ts` holds USDM and
MELD as the registry serves them, with their real signatures.

Files touched:
- `source/main/assets/assetMetadataResolver.ts`, `assetMetadataDb.ts`,
  `assetVerification.ts`, `registryEntry.fixture.ts` (new)
- `source/main/ipc/assetMetadataChannel.ts`
- `source/common/types/asset-metadata.types.ts`,
  `source/common/config/electron-store.config.ts`
- `source/renderer/app/utils/assetDecimals.ts`, `utils/assets.ts`,
  `stores/AssetsStore.ts`, `domains/Asset.ts`, `api/assets/types.ts`
- `source/renderer/app/components/assets/AssetSettingsDialog.tsx` and `.scss`
- `source/renderer/app/components/wallet/tokens/wallet-token/helpers.ts`,
  `WalletToken.tsx`, `wallet-tokens/WalletTokens.tsx`
- the three locale files and `translations/messages.json`
- ten spec files: `assetVerification.spec.ts`,
  `assetMetadataResolver.realfs.spec.ts`, `assetMetadataDb.realfs.spec.ts`,
  `assetImageStore.realfs.spec.ts`, `assetMetadataChannel.realfs.spec.ts`,
  `assetDecimals.spec.ts`, `AssetsStore.spec.ts`,
  `AssetSettingsDialog.spec.tsx`, `helpers.spec.ts` and `WalletTokens.spec.tsx`
- the PRD, the tasks JSON, and the three review-log files for this task

Verification run:

| Check | Result |
|---|---|
| `nix build '.#checks.x86_64-linux.compile'` | pass |
| `nix build '.#checks.x86_64-linux.lint'` | pass |
| `nix build '.#checks.x86_64-linux.stylelint'` | pass |
| `nix build '.#checks.x86_64-linux.i18n'` | pass |
| `nix build '.#checks.x86_64-linux.jest'` | pass, 100 suites, 1,851 passed, 3 skipped |
| `nix build '.#checks.x86_64-linux.docs'` | pass |
| `nix build '.#checks.x86_64-linux.storybook'` | pass |
| `nix fmt` | 0 files changed on the final pass |

**The fixture measurement, reproduced locally before it was written down.** Both
entries were fetched from `tokens.cardano.org` on 2026-09-16 and each property's
attestation payload was rebuilt at every sequence number from 0 to 6 and tested
against every signature the entry carries.

| Entry | `policy` field | Property | Declared | Verifies at |
|---|---|---|--:|--:|
| USDM | absent | name, description, ticker, decimals | 0 | 0 |
| USDM | absent | url | 1 | 1 |
| USDM | absent | logo | 2 | 2 |
| MELD | absent | all six | 1 | 0 |

So USDM is attested at every declared sequence number and bound to nothing, and
MELD is attested at no declared sequence number and attested at 0 for all six.
The second row of MELD is the whole finding: the signatures are genuine and the
counter is ahead of them.

**Two things were checked rather than assumed.**

The version bump recreates rather than fails. `openHandle` throws on a mismatch,
the constructor catches, deletes the file with its `-wal` and `-shm` siblings and
opens once more (`assetMetadataDb.ts:245-292`). A new case builds a real
version-1 file (the previous table, with a `verified` column, a row in it, and
`PRAGMA user_version = 1`), opens it with the current code, and asserts the row
is gone, a write succeeds, and the stamp is 2.

The new assertions fail when they should. `registryEntryToRow(USDM).attested`
was flipped to `false` and the suite was re-run: one suite failed, one test
failed. It was then restored and the suite is green again. This is worth the two
minutes it cost, because the defect this task corrects is a spec that asserted
the wrong rule and passed for it.

Outcome: Implemented, all checks green


Review of Iteration 1
Timestamp: 2026-09-16T16:05:00Z

Summary:

**The rename went further than the brief listed, and the extra reach is named
rather than absorbed.** The brief named the column, the row and write types, the
IPC entry, `Asset.recommendedDecimalsVerified` and the UI props.
`DecimalSettingDisagreement.WithVerified` and `.WithUnverified` are also on the
verdict's path: they are what the settings dialog switches on to choose between
two sentences, and leaving them would have put the old word in the one place a
reader goes to find out what the two sentences mean. They are now `WithAttested`
and `WithUnattested`. Nothing else outside the brief's list moved.

**One spec asserted the old rule rather than the old name, and a mechanical
rename would have kept it green.** `assetMetadataResolver.realfs.spec.ts` held
`is unverified when the entry carries no policy`, driving an entry with `policy:
null` and asserting `false`. Renaming the field alone leaves a case that asserts
an attested entry is not attested, and it would have failed loudly, but only
because the fixture happens to be attested. The case is now `attests an entry
that publishes no policy at all` and asserts the value is applied. Every other
spec in the sweep was a name change, and each was read rather than replaced.

**`verifyRegistryProperty` keeps `verified` and the comment that misdescribed it
does not.** The field is the conjunction of all three steps and remains a true
statement about a property; what was wrong was the sentence claiming it is the
only field to test for a verdict, which is what the resolver believed. The
comment now says which field is the gate and why, and points at the module that
records the reasoning. `assetVerification.spec.ts` still exercises all four
fields.

**The Japanese values were placeholders before and after.** All four strings held
the English text behind a `!!!` prefix at `ja-JP.json:86`, `:88`, `:90` and
`:1559`. Re-keying three of them dropped no translator output. Stated because the
i18n check cannot tell a placeholder from a translation and would have passed
either way.

**What is still not covered, and it is the same gap `task-027` names.** No
scenario here was run against a rendered window. The settings dialog's advisory
now fires for roughly 2 tokens in 120 rather than 53, which is a change nobody
will see in a suite, and the token list's notice sentence changed under an
unchanged id, which the i18n check cannot distinguish from no change at all.
Both belong in the manual QA pass that has never been executed.

**One thing was deliberately left inconsistent.** Every string here says
"issuer"; the deferred settings toggle is specified as "use publisher's decimal
values". Half-fixing it would put two vocabularies in one dialog. It is recorded
in the plan's Risks and in the PRD's status log so the task that adds the toggle
inherits it.

Decision: approved
