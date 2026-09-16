Implementation: Iteration 1
Timestamp: 2026-09-15T21:10:00Z

Changes made:

- `source/renderer/app/utils/assetName.ts`: `AssetNameProvenance.MinterChosen`
  becomes `OnChainName = 'onChainName'` and `isMinterChosenAssetName` becomes
  `isOnChainAssetName`. The module comment is rewritten to order the four rungs
  by what stands behind each and to say in words that `ChainName` and
  `OnChainName` are not the same claim: both are on the chain, only one had to
  satisfy the minting policy to get there. The predicate's doc comment stops
  describing an author and describes the value.
- `source/renderer/app/components/assets/Asset.tsx`: the message key and id
  become `onChainName` and `assets.assetToken.onChainName`, the test id becomes
  `assetNameOnChain`, and the `title` attribute is replaced by `aria-label`
  carrying the same string. The message's `description` says accessible label
  rather than tooltip.
- `source/renderer/app/components/assets/Asset.scss`: `&.minterChosenName`
  becomes `&.onChainName`. The declarations are untouched, so the treatment is
  unchanged; the comment now says the three channels are all visible without
  interaction, which is what makes the tooltip's removal safe.
- `source/renderer/app/components/assets/AssetContent.tsx`: the annotation moves
  inside `.value`, immediately after the hex, as a `span` carrying
  `styles.onChainName`, `data-testid="assetNameOnChainParam"` and an
  `aria-label` with the full explanation. Its message becomes
  `assets.assetToken.param.assetNameOnChain` with the default `!!!({name})`. The
  explanation is declared here as well as in `Asset.tsx` under one id with
  identical text. The condition is on the whole fragment, leading space
  included, and the comment at the site says why.
- `source/renderer/app/components/assets/AssetContent.scss`: `.assetAsciiName`,
  whose entire treatment was `opacity: 0.5`, is replaced by `.onChainName` with
  a dashed outline in `currentcolor`, italics and the same muted opacity, so the
  parameter row carries the same three channels the list row does.
- `Asset.spec.tsx`, `assetName.spec.ts`, `AssetInput.spec.tsx`: renamed through,
  with the `title` assertions becoming `aria-label` assertions.
- `AssetContent.spec.tsx`: rewritten around the inline form. Nine cases.
- `en-US.json`, `ja-JP.json`: both old ids removed and both new ones added by
  hand. `defaultMessages.json` and `translations/messages.json` regenerated.
- `.agent/findings/token-provenance-discarded.md`: a section fixing the shared
  vocabulary for the per-field verification marker.
- The PRD, the tasks JSON and fourteen task-plan and review documents:
  vocabulary substituted.

Files touched:
- the thirteen source and translation files above
- `.agent/findings/token-provenance-discarded.md`
- `.agent/plans/asset-metadata-cache/asset-metadata-cache-prd.md`
- `.agent/plans/asset-metadata-cache/asset-metadata-cache-tasks.json`
- fourteen `.agent/plans/asset-metadata-cache/task-plans/*.md`, plus this task's
  three

`Asset.scss.d.ts` and `AssetContent.scss.d.ts` were regenerated with
`yarn typed-scss-modules` and are gitignored, so they are not in the commit.

Verification run:

**The rename is complete.** `grep -rn "minterChosen\|MinterChosen\|minter-chosen"`
over `source/` and `translations/` returns one line,
`source/main/ipc/assetMetadataChannel.ts:89`, which says "minter-chosen key" and
is about a key in a metadata record rather than about a name. The same grep over
`.agent/plans/asset-metadata-cache/` returns three lines, all inside this task's
own entry in the tasks JSON, which quotes the old term to say what it replaced.

**The locale files were read, not trusted.** After `yarn i18n:manage`:

| File | Old ids | New ids |
|---|---|---|
| `en-US.json` | absent | `onChainName`, `param.assetNameOnChain` |
| `ja-JP.json` | absent | `onChainName`, `param.assetNameOnChain` |
| `defaultMessages.json` | absent | both, under `AssetContent.tsx` |

`git diff` touches exactly two lines in each of `en-US.json` and `ja-JP.json`,
in the slots the old ids occupied, because both new ids sort to the same
positions. A second `yarn i18n:manage` left all six files under
`source/renderer/app/i18n/locales` and `translations/messages.json` byte for
byte identical, checked with `md5sum -c`.

**No Japanese was lost, and there was none to lose.** Both `ja-JP` values were
`!!!`-prefixed English before the change and are `!!!`-prefixed English after.
The four real Japanese strings adjacent to them in the same block —
`アセット名`, `なし`, `説明`, `名称` — are untouched. Nothing is owed to a
translation round beyond what was already owed for these two keys.

**The extraction moved `Asset.tsx` out of `defaultMessages.json` entirely**,
which is expected and worth recording because the diff looks alarming.
`formatjs extract` dedupes by id. Every message `Asset.tsx` declares is now also
declared in `AssetContent.tsx` or `WalletToken.messages.ts` with identical text,
so it contributes no unique descriptor and its group disappears. This is the
same shape `assets.warning.available` already has: declared in four files,
attributed to one. If the two copies of `assets.assetToken.onChainName` ever
disagree, extraction fails rather than silently picking one.

**The spec suite is a second, independent check on the locale files.** This was
observed rather than predicted. `TestDecorator` builds its `IntlProvider` from
`en-US.json`, so on the first run — source renamed, locale files not yet edited
— three `AssetContent` assertions failed against `!!!({name})`, react-intl
falling back to the `defaultMessage` for an id the locale file did not carry. A
source rename that forgets the locale files cannot pass this suite.

**The guard on the inline form, asserted in the negative.** Four ways a name can
fail to decode, each asserting that the component's whole text ends at the hex,
which admits no brackets, no empty pair and no trailing space:

| Case | Asset name | Renders |
|---|---|---|
| 32 random bytes | `787c09…f8cf` | hex alone |
| label then a non-printable byte | `0014df10ff` | hex alone |
| label with nothing after it | `0014df10` | hex alone |
| empty | `` | `Blank`, no brackets |

And three that do decode: `484f534b59 (HOSKY)`, `0014df105553444d (USDM)` with
the label stripped before the printable test, and the longest row the layout
admits.

**Jest, host runner, five suites.** `yarn jest source/renderer/app/components/assets/
source/renderer/app/utils/assetName.spec.ts
source/renderer/app/components/wallet/send-form/AssetInput.spec.tsx
--coverage=false` — 100 passed, 100 total.

**The Nix checks**, which are what gate a merge:

| Check | Result |
|---|---|
| `compile` | exit 0 |
| `lint` | exit 0 |
| `stylelint` | exit 0 |
| `jest` | exit 0 |
| `i18n` | exit 0 |

`nix fmt` clean. `git diff --stat package.json yarn.lock` empty. `git diff` over
`source/` adds no `@ts-ignore` and no `@ts-expect-error`.

Outcome: Implementation complete, five Nix checks green

Review of Iteration 1
Timestamp: 2026-09-15T21:35:00Z

Summary:

The three changes are one commit and the reason holds: they touch the same two
elements, and any two of the three would leave a half-renamed tree.

1. *The rename is complete and consistent.* Met. The enum, the predicate, the
   two stylesheets, both test ids and both message ids all moved together, and
   the one survivor is a different noun with a stated reason.

2. *The `ChainName` hazard is handled where it can be.* Met, with a caveat worth
   naming. Two enum members two characters apart is a real cost and the fix is a
   comment, which is weaker than a name. What makes it acceptable is that the
   user-facing word was fixed by the owner and the enum should match it, and that
   `assetName.spec.ts` drives every rung in both directions — a chain name
   asserted not to be an on-chain name, an on-chain name asserted to be one — so
   a confusion between them fails a test rather than shipping.

3. *The tooltip's removal is safe.* Met. The three visual channels were already
   the load-bearing signal, they are unchanged, and `Asset.spec.tsx` asserts them
   on all three surfaces that render the pill. The explanation is not lost: it is
   an `aria-label` on the same element, asserted non-empty, and asserted absent
   on a published name. What is genuinely given up is the sighted pointer user
   who would have hovered and read it, and the argument for giving it up is that
   this user is rare, the text is transient, and the attack the marking exists
   for is not defended by prose nobody opens.

4. *The inline form fails safe.* Met, and this is the part that most needed the
   negative assertions. The previous layout could not render an empty annotation
   because the annotation was a whole element; the inline form can, twice over —
   empty brackets, or a trailing space with no brackets. Both are excluded by
   putting the condition on the fragment, and both are asserted by a check that
   the text ends at the hex rather than by looking for the absence of a specific
   wrong output.

5. *The locale work was verified by reading.* Met. Three artifacts read, a second
   run proved idempotent by checksum, and the ja-JP diff bounded at two lines.

One claim in this task is not closed by any check, and the plan says so in Risks
2 and again in Final Outcome: how many lines the longest parameter row occupies
when laid out. The spec proves 64 hex characters and a 32-character name both
render inside the one `.value` element with nothing truncated, and `.value`
carries `word-break: break-word` so the hex breaks rather than overflows its
container. It does not prove the row stays within the three 16px lines `dd`
shows before it scrolls. jsdom does no layout and Electron cannot be driven from
here. The inference is that the content is neutral to within a line, because the
same characters previously occupied two lines of hex plus a separate annotation
line, but that is box-model reasoning and is labelled as such rather than
reported as observed. `task-027` is where an operator settles it.

Three smaller judgements worth recording:

- The `aria-label` carrier was implemented as specified and is weaker than it
  looks. Both labels sit on elements with no role, a `div` in the pill and a
  `span` on the parameter row, and a name on a `generic` role may not be exposed
  at all; where it is exposed on the pill it names an element that already has
  text, so the explanation could be read in place of the name. `task-020` put
  the decimal advisory on a bare `span` at `AssetSettingsDialog.tsx:280-290` and
  has the same exposure, so this is consistent with the repository rather than
  new. Recorded as Risk 6 with the robust alternative and the cost of being
  wrong, and not changed here, because the carrier was the decision rather than
  the implementation.
- `assets.assetToken.param.assetNameOnChain` stayed a message rather than
  becoming literal JSX brackets. The content is now punctuation and a
  placeholder, which is a fair argument for inlining it, but Japanese uses `（）`
  and a locale should keep that choice.
- The historical task plans and reviews were substituted for vocabulary only.
  Their descriptions of the `title` attribute and of the old annotation wording
  stand, because those record what `task-001` and `task-041` did. Half-updating
  them would produce sentences naming a current id on a mechanism that no longer
  exists, which is worse than either extreme.

Decision: approved
