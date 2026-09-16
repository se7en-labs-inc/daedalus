# Finding: the cache computes a token's provenance and then throws most of it away

**Status:** open, not scheduled
**Raised from:** asset metadata cache review
**Scope:** native tokens; the data exists, the surface that would use it does not
**Severity:** none as a defect. Nothing is wrong today. This records work already
done that is discarded, and what it would be worth if something read it.

---

## What the cache knows and does not keep

Resolving a token's metadata establishes several separate facts. The schema
keeps one boolean.

**Which properties verified, individually.** Verification runs per property:
each of `name`, `ticker`, `decimals`, `url` and `description` carries its own
signature and sequence number, and each is checked separately against the
minting policy. The result is collapsed into a single `verified` column that
means the verdict for `decimals` alone. A token whose ticker verifies and whose
decimals carry no signature is indistinguishable in the row from one where
nothing verified.

**Whether the policy can still mint.** `chainPointerVerification.ts` evaluates
policy closure to decide whether a CIP-25 record is frozen. A closed policy
means the token's supply and its on-chain metadata are both final. That is
computed, used for a freshness decision, and not stored.

**Where each field came from.** `source` records `registry` or `chain` per row,
but not per field, and a row can mix them: a registry ticker beside a CIP-25
name.

## What is one call away and not fetched

**The policy's script type.** A policy id is a script hash, and Koios types it
directly through `POST /script_info`, which batches. Measured 2026-09-15:

| policy | registry `policy` field | `script_info` type |
|---|---|---|
| `c48cbb3d…47ad` (USDM) | absent | `plutusV2` |
| `a0028f35…c235` (HOSKY) | absent | `timelock` |
| `718c383a…1cf1` (SUMMON) | present | `timelock` |

This distinguishes two cases that are identical in the registry today and are
not the same thing. A Plutus minting policy **cannot** publish a `policy` field,
because that field is the serialised native script and a contract has none. A
native-script issuer who has not published one simply has not. The first is
structural and permanent; the second is an omission the issuer could correct.

The consequence for coverage is worth stating: the share of registry subjects
whose decimals can ever be verified is bounded by the share minted under native
scripts. It is not a figure that improves as issuers tidy their entries, and the
direction of travel is against it, since contract-minted tokens are
disproportionately the ones whose decimals matter.

## Why none of this was built

Separately, each fact is a field nothing reads. The existing advisory — that
published decimals could not be checked against the token's minting policy — is
accurate for both the Plutus and the unpublished-native case. Splitting it into
two messages gives a user two ways to read the same fact, and neither is
actionable: a holder cannot do anything differently on learning which kind of
policy minted their token.

Fetching and storing the script type now would add a request per batch and a
column to populate a surface that does not exist. That is the shape this plan
declined elsewhere.

## The surface already exists

An earlier revision of this finding deferred on the grounds that a token details
screen would have to exist first. That was wrong. Expanding a token row renders a
parameter list built by `components/assets/Asset.tsx`, which defines six rows:
fingerprint, policy id, asset name, name, ticker and description. It is not an NFT
viewer and does not need to be. It is where a holder already goes to find out what
a token is.

So the work is rows in an existing list rather than a new screen, which is a much
smaller thing than this finding first claimed. The PRD's non-goal excluding "any
NFT display surface" does not cover it either: that excludes a viewer, not an
additional parameter.

## What would make it worth having

The facts compose there into something a holder can reason about rather than a
warning they cannot act on:

- minted under a native script or a contract
- whether the policy is closed, so whether supply and on-chain metadata are final
- which fields carry a valid issuer signature, named individually
- where each field came from

The difference between *a fixed-supply token under a closed native policy whose
name, ticker and decimals all carry valid issuer signatures* and *a token minted
by a contract that can mint more, none of whose metadata is cryptographically
checkable* is a real distinction about what a user is looking at. One boolean
cannot carry it.

## What a fix would have to decide

Whether `verified` becomes per property or gains a companion, and what the
existing column then means for rows already written.

Whether closure is stored or recomputed. It is cheap to recompute from a script
already in hand, and absent entirely for chain rows, where the registry never
supplied a script.

Whether the script type is fetched for every subject or only for those with no
`policy` field. Only the second is needed to tell the two cases apart, and it is
the smaller request.

Which rows earn their place. The parameter list is read by someone asking what a
token is, not by someone auditing it, and six rows is already a wall of text.
Policy type and whether the policy is closed are facts a holder can act on.
Per-property verification may be one row naming which fields carry a valid issuer
signature rather than four rows of yes and no.

What the `url` row waits for. The registry publishes a `url` for many subjects and
nothing renders it, which is the same shape of gap as the provenance facts. It is
held not by scope but by the absence of a warning before an issuer-controlled link
opens from inside a wallet. The row is trivial; the warning is the work.

## Relevant files

- `source/main/assets/assetVerification.ts` (per-property verification, collapsed on write)
- `source/main/assets/chainPointerVerification.ts:319` (closure, computed and discarded)
- `source/main/assets/assetMetadataDb.ts` (`verified`, `source`)
- `source/common/types/asset-metadata.types.ts` (`AssetMetadataEntry`)
