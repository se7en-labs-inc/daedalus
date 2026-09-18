# Finding: the metadata privacy controls warn about the smaller exposure and not the larger

**Status:** open, not scheduled
**Raised from:** manual QA of the asset metadata cache, 2026-09-17
**Scope:** the asset metadata settings page and the token registry request; the
settings surface the fix needs exists and already has scope attached to it
**Severity:** none as a defect. The controls do what they say. What is recorded here
is that they say it about one of two identical exposures, that the exposure with no
control is the larger one, and that the warning attached to the smaller one claims
more than the mechanism supports.

All line references measured against `5bd24fee1`.

---

## What the settings page offers today

`AssetMetadataSettings.tsx` lets a user choose the on-chain metadata index: Koios,
a custom address, or their own chain data, the last rendered but disabled
(`:197-222`, `isDisabled` at `:207`). Each option carries its own description
(`:253-294`).

The page-level description at `:20-25` is the warning
(`settings.assetMetadata.description`, `en-US.json:648`):

> Some tokens publish their name on the chain instead of to the Cardano token
> registry. Daedalus finds those records through an index and confirms each one
> against your own node before using it. **The index you choose learns which of
> these tokens this wallet holds, so it is worth choosing deliberately.** Names and
> decimal places from the Cardano token registry are fetched separately and this
> setting does not affect them.

## The registry is asked about more, and no string says so

The registry request body is built at `assetRegistryClient.ts:115-116`:

```js
JSON.stringify({ subjects, properties: ASSET_REGISTRY_PROPERTIES })
```

`subjects` is the list of policy id and asset name pairs; `ASSET_REGISTRY_PROPERTIES`
(`:19-25`) is the fixed list `name`, `ticker`, `decimals`, `url`, `description`.
Nothing else is in the request. `httpTransport.ts:97-110` adds only `content-type`,
`accept` and `content-length`, so no user agent, no cookie and no wallet
identifier travel with it.

That is the same class of information the page warns about for the pointer index,
and there is at least as much of it and in general more, for two reasons.

**The registry is asked about every subject; the index is asked only about the
leftovers.** `assetMetadataResolver.ts:544-549` computes `unanswered` as the
subjects the registry did not answer, and only those reach the pointer channel.
The pointer request itself (`koiosClient.ts:464-475`) carries that subset as
`_asset_list`. So the registry sees the whole set and the index sees a subset,
which for a wallet holding mostly registered fungible tokens is a small one. The
two coincide only for a wallet whose tokens the registry knows none of, which in
practice is a wallet holding only NFTs.

**The set is larger than holdings.** `_renderedSubjects` at `AssetsStore.ts:316-328`
collects what the active wallet holds *and* every asset named by the transactions
being rendered, which the comment at `:300-304` states can include assets the
wallet no longer holds. The exposure is therefore holdings plus the token history
on screen.

Warning about the optional lesser exposure while saying nothing about the mandatory
greater one is worse than either choice made consistently. A user who reads the
page carefully and picks a custom index has acted on the smaller number and been
told nothing about the larger. The Koios description at `:62-68` even states
"Daedalus sends it token identifiers and nothing else", which is true, and equally
true of the registry, where it is not stated.

## There is no way to turn external metadata off

Neither service can be disabled from the page.

The pointer source is a URL, and the only values the page offers are the Koios
preset, a custom address, and the disabled `direct` option
(`ASSET_METADATA_SOURCE_TYPES`, `assetsConfig.ts:39-46`). Choosing `custom` reveals
the input and submits nothing until something is typed
(`handleOnSelectSourceType`, `:160-173`), and an empty value cannot be saved:
`AssetsStore.ts:254` refuses it with `if (!sourceUrl || sourceUrl ===
this.assetMetadataSourceUrl) return;`. The stored value also defaults to Koios when
nothing has been chosen (`:235-241`).

The resolver does honor an absent pointer source, at
`assetMetadataResolver.ts:624`: `if (!this._pointerSourceUrl ||
!this._immutableDirectory) return empty;`. So the off state exists in the main
process and is unreachable from the interface, except on a network the launcher
configures no instance for, which today is selfnode (`assetsConfig.ts:8-18`).

The registry has no setting at all. Nothing in `source/` gates
`queryAssetRegistry` on a user preference.

`09-token-images-are-shown-without-consent.md` already records the shape this
wants, as "Token metadata: on or off", with off described as the cold-cache path
that is already tested because it is what the offline scenario renders. What this
finding adds is that the switch has to cover the registry and not only the pointer,
and that it is the registry that makes it worth having.

## The existing warning overstates the mechanism

"The index you choose **learns** which of these tokens this wallet holds" is
stronger than the mechanism supports, and the same goes for framing the exposure as
being about "this wallet".

What is verified: the request carries a list of token identifiers and the machine's
address, and nothing else that Daedalus adds. There is no account, no
authentication, no session and no wallet identifier. Both services are public and
unauthenticated. Whether the far end records the request, retains it, or associates
it with anything is not something the client can see or the wallet can assert.

"Could learn" is honest and carries the decision the setting exists for. "Learns"
asserts a behavior of a third party on that party's behalf, which the wallet has no
standing to assert, and a user has no way to check.

## What a fix would have to decide

**Whether one warning covers both, or each gets its own.** One honest sentence
covering both services is shorter and less likely to be skipped than two, but the
two differ in one way a user can act on: one is configurable and one is not, until
the off switch exists.

**What off means for a wallet that has already cached.** Off stops requests; it does
not decide whether the rows already on disk keep rendering. Both answers are
defensible, and they are visibly different to a user who switches it.

**Whether off is one switch or two.** The registry and the pointer index are
separate services with separate scope, and a single switch is simpler to explain
while a pair is more precise. Note that `09` frames metadata and images as two
switches on the same page, so a third would be the second decision on one screen.

## What this finding does not establish

What either service does with a request. Nothing here was measured at the far end,
and nothing can be from a client.

Whether the token registry publishes a retention or logging policy. That was not
checked, and it would change what an honest sentence can say.

Whether anybody reads the page. No measurement exists of how often the setting is
changed, and a warning nobody reads is a different problem from a warning that is
wrong.

## What was not done and why

Nothing was changed. The registry sentence is a string edit and would be safe on its
own, but it belongs with the off switch rather than ahead of it: telling a user about
an exposure in the same release that gives them no way to avoid it is the same
asymmetry pointed the other way.

A tokens settings section is already scoped to carry the image consent controls and
a "use publisher's decimal values" toggle, both of which
`plans/asset-metadata-cache/asset-metadata-cache-prd.md` holds for "the tokens
settings page that will carry the image controls". An off switch for external
metadata belongs with them.

## Relevant files

- `source/renderer/app/components/settings/categories/AssetMetadataSettings.tsx`
  (the page, the options, the warning)
- `source/renderer/app/config/assetsConfig.ts` (the three source types)
- `source/renderer/app/stores/AssetsStore.ts` (the setting, the default, the
  subjects that are asked about)
- `source/main/assets/assetRegistryClient.ts:115-116` (what the registry request
  carries)
- `source/main/assets/assetMetadataResolver.ts:544-549` (why the index sees less)
