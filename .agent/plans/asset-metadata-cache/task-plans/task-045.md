# Task task-045: Call the decoded asset name its on-chain name

## Task ID and Title

- ID: `task-045`
- Title: `Call the decoded asset name its on-chain name`

## Why Chosen Now

`task-001` coined "minter-chosen" for the bottom rung of the name resolution order and
`task-041` kept it for a name recovered from behind a CIP-0067 label. The word implies a
contrast that does not exist. Whoever mints a token chooses its asset name bytes, and the
same party publishes the registry entry, so the minter and the issuer are one party. Calling
the bottom rung minter-chosen therefore reads as though the rungs above it came from a
different and more trustworthy author. They did not.

The distinction the marking actually carries is attestation, not authorship. An asset name is
raw on-chain bytes that anyone can set to anything at mint time, and nothing checks them
against anything. A registry entry has been through a curated repository's review and may
carry a signature bound to the minting policy. A CIP-25 or CIP-68 record is in the
transaction that minted the asset, which had to satisfy that policy.

"On-chain name" says what the string is and contrasts with off-chain registry metadata rather
than with a different author. On the parameter list it sits directly under the row already
labelled `Asset name` and against the registry-published `Name` row above it, so the three
read as one vocabulary.

Doing it now rather than later costs one commit. Left alone it compounds: the per-field
verification marker sketched in `.agent/findings/token-provenance-discarded.md` renders on the
same parameter list, and every row it adds has to agree with this word.

Two further decisions from the owner arrived while the rename was in these files, and both
are carried here rather than deferred, because both touch the same two elements.

## Interaction Mode

- Mode: `agent_execution`

Nothing here needs a running node, a network fetch or an operator. Everything is settled by
the Nix checks, by the spec suite, and by reading the three locale files after `i18n:manage`.
The one thing this environment cannot settle is the rendered pixel width of the longest
parameter row; see Risks for exactly what was checked in its place and what was not.

## Scope

Three changes to the same two elements, in one commit because they cannot be separated
without leaving a half-renamed tree.

1. **The rename.** The provenance enum member, the predicate, the SCSS class, both test ids,
   both message keys and both message ids become on-chain rather than minter-chosen, in the
   source, in the three locale files and across the plan documents.
2. **The tooltip goes.** `Asset.tsx` carried the explanation as a `title` attribute on the
   styled name in the list row. It is removed and the same text becomes an `aria-label` on
   the same element.
3. **The parameter row's annotation goes inline.** `Asset name` showed the hex and then
   `(minter-chosen name: HOSKY)` on a second line. It now reads
   `484f534b59 (HOSKY)`, with the marking on the brackets and not on the hex.

Revertible on its own. Nothing outside these two components and the locale files is touched.

## Non-Goals

- **No change to the resolution order, the predicate, the CIP-0067 decoder or the fingerprint.**
  Which name wins, and what counts as text, are exactly as `task-041` left them.
- **No change to the visual treatment.** The dashed outline, italics and muted colour are the
  marking and are unchanged in substance; only the class name moved, and the treatment now
  also applies to the parameter row's brackets.
- **No change to the list row beyond the tooltip.** The pill still renders the same string in
  the same chip.
- **No rename of `assetMetadataChannel.ts:89`.** It says "minter-chosen key", about a key in a
  metadata record rather than about a name, and the sentence is true as written: it is about
  a key the minter published colliding with one of the resolver's own.
- No new message, no new dependency, no new surface.

## Dependencies

- `task-001`, which introduced `AssetNameProvenance`, the predicate, the style, the test id
  and both messages.
- `task-041`, which kept the same vocabulary for a name recovered from behind a CIP-0067
  label and added the assertions that go with it.

## Research Consulted

- The owner's decision on the term, recorded under Why Chosen Now.
- The owner's decision to drop the tooltip, recorded under Implementation Approach step 3.
- `.agent/findings/token-provenance-discarded.md`, which designs the per-field verification
  marker this term has to coexist with. Updated by this task; see Required Docs.
- `.agent/skills/i18n-messaging/SKILL.md`, for the message schema, the `!!!` convention and
  what `i18n:extract` and `i18n:check` each do.
- `task-020`, for the precedent of carrying an explanation as an `aria-label` rather than as
  pop-over content.

## Docs, Workflows, and Skills Consulted

- `.agent/plans/asset-metadata-cache/task-plans/readme.md` for the cycle and the section list.
- `CLAUDE.md` for the TypeScript conventions and for the rule that a check is verified through
  `nix build` and not through the `yarn` script of the same name.
- `.agent/skills/i18n-messaging/SKILL.md`. It is the one message-handling document the trust
  map marks as accurate.
- Not `.agent/workflows/ipc.md`. Nothing here crosses a channel.

## Live Repo Findings Verified For Planning

Verified at `dc5150955` on branch `feat/asset-metadata-cache`, 2026-09-15, with Node v22.23.1.

**Where the term lives.** `git grep -ril "minter.chosen\|minterChosen" dc5150955` returns 29
tracked files: twelve under `source/`, nine of them code and three of them locale files,
`translations/messages.json`, the PRD, the tasks JSON and fourteen task-plan documents.
`source/renderer/app/components/assets/Asset.scss.d.ts` carries it too and is not in that
count: `.gitignore:141` excludes every `*.scss.d.ts`, so it is generated by `yarn typedef:sass`
rather than committed.

**The two ids and where each is defined.** `assets.assetToken.minterChosenName` is defined
once, in `Asset.tsx:73-79`. `assets.assetToken.param.assetNameMinterChosen` is defined once,
in `AssetContent.tsx:30-35`.

**The Japanese for both ids is a placeholder, not a translation.** `ja-JP.json:68` and
`ja-JP.json:70` are:

```
"assets.assetToken.minterChosenName": "!!!This name is decoded from the asset name chosen by whoever minted this token. No issuer published it, and it does not identify the token. The fingerprint does.",
"assets.assetToken.param.assetNameMinterChosen": "!!!(minter-chosen name: {name})",
```

Both are `!!!`-prefixed English, which `.agent/skills/i18n-messaging/SKILL.md` records as the
expected state for a key no translation round has reached, and which `task-001.md:415-417`
says about these two at the time they were written. So no Japanese is at risk here at all.
The neighbours in the same block are real translator output — `param.assetName` is `アセット名`,
`param.name` is `名称`, `settings.cogPopOver` is a full Japanese sentence — and none of them
is touched.

**`i18n:manage` cannot do this on its own.** `package.json:53-55` defines it as
`i18n:extract && i18n:check`. Extraction writes `translations/messages.json` from the source;
`translations/translation-runner.ts` then runs `react-intl-translations-manager` over
`source/renderer/app/i18n/locales` with `singleMessagesFile: true`. Adding a key is the
operation it performs. A key whose English default changed under an unchanged id is not
rewritten, so the locale file keeps the old sentence and every check still passes.

**`translations/messages.json` is tracked**, unlike the `.scss.d.ts` files. `git ls-files`
returns it, and `task-001.md:225-226` lists it among the files the commit carries.

**The tooltip is a `title` attribute, not a `PopOver`.** `Asset.tsx:232-236` sets `title` on
the name element. `task-001.md:290-293` records why: three of the six surfaces pass
`hidePopOver`, and nesting a tippy instance inside the pill that is itself a tippy child was
avoidable risk. So the reason to remove it is not that its content was unreachable in jsdom —
a `title` is perfectly assertable, and `Asset.spec.tsx` asserted it. The reason is the one
that applies to any hover-only carrier: it needs a pointer, so it does not exist on touch, it
is transient, and the case the marking exists for is not defended by text nobody opens. An
`aria-label` carries the same string to a screen reader and is asserted the same way.

**What the parameter row looked like.** `.assetParam` is a column flex
(`AssetContent.scss:106-115`) with the hex in `.value` and the annotation beneath it in
`.assetAsciiName`, whose whole treatment was `opacity: 0.5`. So the marking that the list row
carried on three channels was one channel here, on a separate line, behind a label.

**The longest row this layout can produce.** An asset name is at most 32 bytes, so 64 hex
characters, and a decoded name is at most 32 characters. `.value` sets
`word-break: break-word` (`AssetContent.scss:124-130`), so the hex breaks mid-string rather
than overflowing; `dd` is `max-height: 48px; overflow-y: auto` (`AssetContent.scss:25-33`) at
`line-height: 16px`, so the row admits three lines and scrolls past them. See Risks for what
this does and does not establish.

## Files Expected To Change

Source and translations:

- `source/renderer/app/utils/assetName.ts` and `assetName.spec.ts` — the enum member, the
  predicate, the module comment and the assertions.
- `source/renderer/app/components/assets/Asset.tsx` — the import, the message key and id, the
  local variable, the test id, the style reference, and `title` replaced by `aria-label`.
- `source/renderer/app/components/assets/Asset.scss` — the class and its comment.
- `source/renderer/app/components/assets/Asset.spec.tsx` — test ids, style references, the
  `title` assertions and three `it` descriptions.
- `source/renderer/app/components/assets/AssetContent.tsx` — the annotation goes inline,
  gains the marking class and an `aria-label`, and the message becomes brackets only.
- `source/renderer/app/components/assets/AssetContent.scss` — `.assetAsciiName` replaced by
  `.onChainName` carrying the three-channel treatment.
- `source/renderer/app/components/assets/AssetContent.spec.tsx` — rewritten around the inline
  form, with the absences asserted.
- `source/renderer/app/components/wallet/send-form/AssetInput.spec.tsx` — one comment.
- `source/renderer/app/i18n/locales/en-US.json`, `ja-JP.json`, `defaultMessages.json` and
  `translations/messages.json`.

`Asset.scss.d.ts` and `AssetContent.scss.d.ts` change on disk and are not committed.

Sixteen plan documents: the PRD, the tasks JSON, and `task-001.md`, `task-001-plan-review.md`,
`task-001-impl-review.md`, `task-025.md`, `task-034.md`, `task-035.md`,
`task-035-plan-review.md`, `task-035-impl-review.md`, `task-038.md`, `task-039.md`,
`task-039-impl-review.md`, `task-041.md`, `task-041-plan-review.md`,
`task-041-impl-review.md`. Plus `.agent/findings/token-provenance-discarded.md`.

## Implementation Approach

1. **The vocabulary, fixed once so nothing drifts.**

   | Old | New |
   |---|---|
   | `AssetNameProvenance.MinterChosen` / `'minterChosen'` | `AssetNameProvenance.OnChainName` / `'onChainName'` |
   | `isMinterChosenAssetName` | `isOnChainAssetName` |
   | `.minterChosenName` (SCSS) | `.onChainName` |
   | `data-testid="assetNameMinterChosen"` | `data-testid="assetNameOnChain"` |
   | `data-testid="assetNameMinterChosenParam"` | `data-testid="assetNameOnChainParam"` |
   | `assets.assetToken.minterChosenName` | `assets.assetToken.onChainName` |
   | `assets.assetToken.param.assetNameMinterChosen` | `assets.assetToken.param.assetNameOnChain` |

2. **`assetName.ts`.** The module comment is rewritten so the four rungs are distinguished by
   what stands behind each, and so `ChainName` and `OnChainName` are told apart in words. The
   predicate's doc comment stops saying "chosen by the minter rather than published by an
   issuer" and says what the value is: the asset's own name bytes, which nothing attests.

3. **The tooltip is removed rather than renamed.** `Asset.tsx` drops the `title` attribute.
   The same message, under the new id, becomes the element's `aria-label`.

   The visual treatment is untouched and is now the whole of the signal: three channels, all
   visible without interaction, one of which survives a monochrome rendering. That is the
   security-relevant part, and it never depended on the tooltip. A hover-only carrier does not
   exist on touch, is transient, and is not read; the case the marking exists for is a token
   whose asset name bytes spell an existing ticker, and text nobody opens does not defend
   against it. If the styling does not make someone pause, a tooltip will not.

   **This is why a message id disappears from three locale files and is not an oversight.**
   `assets.assetToken.minterChosenName` is gone. The explanation it carried survives under
   `assets.assetToken.onChainName`, reached by a screen reader rather than by a pointer.

4. **The parameter row goes inline.** The annotation moves inside `.value`, directly after the
   hex it decodes, and the message loses its label: `(on-chain name: {name})` becomes
   `({name})`, so the row reads `484f534b59 (HOSKY)`. A parenthetical immediately after a hex
   string reads as a decoding of it without saying so, under a row already labelled
   `Asset name` and beneath the registry-published `Name` row.

   The marking moves with it, onto the brackets and never onto the hex, which is the asset's
   identity and is not in doubt. `.assetAsciiName`, whose entire treatment was `opacity: 0.5`,
   is replaced by `.onChainName` carrying the outline, the italics and the muted colour. The
   full explanation rides along as an `aria-label` on the same element, which is where the
   styling landed.

   **The condition is on the whole fragment, leading space included.** The previous layout
   omitted an entire line when there was nothing to show, which fails safe by construction.
   An inline parenthetical does not: a condition on the content alone leaves `484f534b59 ()`,
   and a condition that omits the brackets but not the space leaves a trailing space. So the
   guard is structural, and the specs assert the absence rather than only the presence.

5. **The messages.** Both ids change, so this is a removal and an addition in every locale
   file rather than an edit the tooling can make. `assets.assetToken.onChainName` keeps its
   English verbatim, because the explanation never used the term and is already accurate.
   `assets.assetToken.param.assetNameOnChain` becomes `({name})`; it stays a message rather
   than becoming literal JSX so a locale can choose its own bracket glyphs, which
   Japanese does.

   The explanation is declared in both `Asset.tsx` and `AssetContent.tsx` under one id with
   identical text, which is the pattern `assets.warning.available` already follows across four
   files. `formatjs extract` dedupes them and would fail if the two copies ever disagreed.

   Order of operations: edit the source, hand-edit all three locale files, run
   `yarn i18n:manage`, read all four artifacts, then run it again and confirm nothing moved.

6. **The plan documents.** Substituted across the PRD, the tasks JSON and the fourteen task
   plans and reviews, per the scope the owner set. See Risks for why the review files are
   included despite being append-only, and for what was deliberately left alone in them.

## Acceptance Criteria

1. **No occurrence of the old vocabulary survives.**
   `grep -rn "minterChosen\|MinterChosen\|minter-chosen" source/ translations/` returns only
   `source/main/ipc/assetMetadataChannel.ts:89`, which is about a metadata key.
2. **Both new ids are present in all three locale files and neither old id is**, checked by
   reading the files after `i18n:manage` rather than by its exit code.
3. **No Japanese is lost.** `git diff` over `ja-JP.json` touches exactly two lines, and both
   values are `!!!` placeholders before and after.
4. **`yarn i18n:manage` is idempotent.** A second run leaves the tree unchanged.
5. **The list row carries the explanation without a pointer.** The styled name has a non-empty
   `aria-label` and no `title`; a published name has neither.
6. **The parameter row reads `484f534b59 (HOSKY)`**, with the marking class on the brackets
   and not on the value element that holds the hex.
7. **A name that does not decode renders the hex alone**: no brackets, no empty pair, no
   trailing space, for random bytes, for a label followed by a non-printable byte, for a name
   that is only a label, and for an empty name.
8. **`compile`, `lint`, `stylelint`, `jest` and `i18n` green from `nix build`.**
9. **No new `@ts-ignore` and no new `@ts-expect-error`; `package.json` and `yarn.lock`
   unchanged.**

## Verification Plan

```bash
# 1. The rename is complete.
grep -rn "minterChosen\|MinterChosen\|minter-chosen" source/ translations/
grep -rn "minterChosen\|MinterChosen\|minter-chosen" .agent/plans/asset-metadata-cache/

# 2. The locale files say what they should.
grep -n "onChainName\|assetNameOnChain" source/renderer/app/i18n/locales/*.json

# 3. i18n:manage is idempotent.
yarn i18n:manage && git status --porcelain

# 4. The checks that gate a merge.
nix build '.#checks.x86_64-linux.compile'   --no-link
nix build '.#checks.x86_64-linux.lint'      --no-link
nix build '.#checks.x86_64-linux.stylelint' --no-link
nix build '.#checks.x86_64-linux.jest'      --no-link
nix build '.#checks.x86_64-linux.i18n'      --no-link

# 5. Nothing was added to the dependency set.
git diff --stat package.json yarn.lock
```

Step 3 is the one that catches the failure mode this task was framed around. A rename that
left the old English in a locale file would pass every check in step 4 and render the old
wording. Step 2 reads the artifact; step 3 proves the tooling agrees with it.

The spec suite is a second, independent check on the same thing, and this was observed rather
than predicted: `TestDecorator` builds its `IntlProvider` from `en-US.json`, so before the
locale files were edited three `AssetContent` assertions failed on `!!!({name})` — react-intl
falling back to the `defaultMessage` for an id the locale file did not yet carry. A source
rename that forgot the locale files cannot pass this suite.

## Risks and Open Questions

1. **`OnChainName` against `ChainName`.** Two enum members two characters apart meaning
   different strengths of claim: both are on the chain, only one had to satisfy the minting
   policy to get there. Mitigated in the module comment rather than in the identifiers,
   because the owner fixed the user-facing word and the enum should match it. Residual risk is
   a reader who skims the enum and not the comment picking the wrong rung; the cost is a name
   rendered in the wrong treatment, and the spec suite asserts every rung in both directions.
2. **The long row was checked as a rule, not as pixels.** What was verified: the longest case
   the layout admits is 64 hex characters and a 32-character name, a spec drives exactly that
   and both parts render inside the one `.value` element with nothing truncated, and
   `.value` carries `word-break: break-word`, so the hex breaks mid-string rather than
   overflowing its container. What was **not** verified: how many lines it occupies when
   actually laid out. `dd` admits three 16px lines before it scrolls, and the same content
   previously occupied two lines of hex plus one annotation line, so the change is neutral to
   within a line — but jsdom does no layout and Electron cannot be driven from here, so that
   is an inference from the box model and not an observation. An operator confirming this on
   a wallet holding a 32-byte printable asset name would settle it; it is the only claim in
   this task that a check does not close.
3. **The review documents are append-only, and this edits them.**
   `task-plans/readme.md` says a correction to an earlier iteration is a new entry and never
   an edit to the original. That rule is about correcting a judgement, and this is a
   vocabulary substitution the owner scoped explicitly to "the task plans and reviews that use
   it". Leaving them would mean the reviews cite identifiers that no longer exist. The
   substitution changes no finding, no outcome and no decision in any of them.

   What was deliberately **not** substituted in those documents: their descriptions of the
   `title` attribute and of the old annotation wording. Those record what `task-001` and
   `task-041` did, which is what a task plan is for, and rewriting them would leave a
   half-updated sentence claiming a current id on a mechanism that no longer exists. This
   file is where the change to both is recorded.
4. **"On-chain name" now appears nowhere a user can see.** The list row shows the name in its
   chip; the parameter row shows `484f534b59 (HOSKY)`. The term survives in the `aria-label`,
   in the identifiers, in the test ids and in these documents. That is the intended outcome
   and not a rename that was missed halfway: the row shows the fact, and the vocabulary stays
   where it is needed, which is wherever the next person has to name the same idea.
5. **A stale `.scss.d.ts` on a machine that does not rebuild.** Both declaration files are
   generated by `yarn typedef:sass` and gitignored, so a checkout that does not regenerate
   them sees `styles.onChainName` typed as absent. Host `tsc` would flag it; the Nix
   `compile` check regenerates. Named rather than mitigated, because committing a generated
   file would be the worse fix.

6. **An `aria-label` on a generic element is not reliably announced.** Both labels land on
   elements with no role: a `div` in the pill and a `span` on the parameter row. A name on an
   element whose role is `generic` may not be exposed to assistive technology at all, and
   where it is exposed on the pill it names an element that already carries text, so a screen
   reader could read the explanation in place of the name rather than beside it. This follows
   `task-020`, which put the decimal advisory on a bare `span` at
   `AssetSettingsDialog.tsx:280-290` and carries the same exposure. The robust form is
   visually hidden text inside the element, which is additive rather than substitutive and
   needs no role. It is not changed here because the carrier was specified. The cost of being
   wrong is that the explanation reaches nobody rather than reaching only a pointer user; the
   three visual channels are unaffected either way, and they are the signal the marking rests
   on.

## Required Docs, Research, and Tracking Updates

- Set `task-045`'s `status` in `asset-metadata-cache-tasks.json` to `completed` when the
  implementation review reads `approved`.
- Append to `task-045-plan-review.md` and `task-045-impl-review.md` as the cycle requires.
- **`.agent/findings/token-provenance-discarded.md` gains a section fixing the shared
  vocabulary**, because the term this task settles and the per-field verification marker that
  finding designs are one mechanism approached from opposite ends. This one marks a value with
  nothing standing behind it; that one marks values that do. They render on adjacent rows of
  the same list, so a marker that invents its own word for attestation contradicts this one in
  front of the user. The section fixes three things for whoever builds it: the axis is
  attestation and never authorship; "on-chain" is taken and means the unattested case, so it
  is not available as a general word for "in the ledger"; and the absence of a marking is the
  safe state, so a marker that decorated the attested values instead would invert what this
  one relies on.
- No PRD restructuring beyond the substitution.

## Review-Log Paths

- `.agent/plans/asset-metadata-cache/task-plans/task-045-plan-review.md`
- `.agent/plans/asset-metadata-cache/task-plans/task-045-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

- The bottom rung of the name resolution order is called an on-chain name everywhere: in the
  enum, in the predicate, in the style, in both test ids and in both message ids.
- The list row's tooltip is gone. The explanation is an `aria-label` on the same element, and
  the dashed outline, italics and muted colour are the whole of the visible signal.
- The parameter row reads `484f534b59 (HOSKY)`. The brackets carry the marking; the hex does
  not. A name that does not decode renders the hex alone, asserted for four separate ways of
  not decoding.
- Both message ids moved, so both were removed from all three locale files and re-added by
  hand. Both Japanese values were `!!!` placeholders and remain `!!!` placeholders, so no
  translator output was dropped and no translation round is owed anything.
- The module comment in `assetName.ts` now distinguishes `ChainName` from `OnChainName` in
  words, which is where that distinction lives after the rename brought the two identifiers
  within two characters of each other.

## Final Outcome

- Verified at the commit this task produced: `grep` over `source/`, `translations/` and
  `.agent/plans/asset-metadata-cache/` finds no surviving occurrence of the old vocabulary
  except `assetMetadataChannel.ts:89`, which is about a metadata key and not a name.
- `compile`, `lint`, `stylelint`, `jest` and `i18n` green from `nix build`. `yarn i18n:manage`
  idempotent on a second run. `package.json` and `yarn.lock` untouched.
- Carried forward to whoever builds the per-field verification marker: the vocabulary is
  attestation, not authorship. "On-chain name" means bytes nothing stands behind. A marker for
  the opposite case names what attests a value, and does not name who wrote it. The reasoning
  is in `.agent/findings/token-provenance-discarded.md` rather than only here.
- Carried forward for manual QA: the longest parameter row, a 32-byte printable asset name, is
  the one claim in this task that no check closes. Risk 2 says what was established in its
  place.

## Self-Review

- The plan measured the thing most likely to go wrong before proposing anything: both
  Japanese strings were read and found to be placeholders, so the risk the task was framed
  around turned out not to be present, and the plan says so rather than carrying a precaution
  it does not need.
- The one claim the environment cannot settle is named as such, with what was checked instead
  and what that does not establish, rather than being reported as confirmed.
- The guard on the inline form is asserted in the negative for every way a name can fail to
  decode, because a spec that only proves `(HOSKY)` renders says nothing about whether `()`
  renders, and that is the failure the guard exists for.
- The scope excludes `assetMetadataChannel.ts:89` and says why, rather than sweeping up a
  sentence that happens to share an adjective.
