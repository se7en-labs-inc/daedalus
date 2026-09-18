# Finding: token images are fetched and shown without the user choosing to

**Status:** open, not scheduled
**Raised from:** manual QA of the asset metadata cache
**Scope:** native token images; the settings surface this needs already exists
**Severity:** none as a defect. Everything behaves as designed. This records a
consent decision the design never made, and one it will have to make before any
NFT image work.

---

## What happens today

A registry logo is fetched one subject at a time, when a token row is drawn, and
rendered in the row header. There is no setting, no prompt and no indication that
the picture came from the token's minter rather than from Daedalus.

Two separate concerns sit behind that, and they need different answers.

**Content.** The image is issuer-controlled raster data rendered inside a wallet.
Nothing in the pipeline judges what it depicts. The existing controls — a 256 KiB
cap, media type from magic bytes, SVG refused — make the bytes safe to decode and
say nothing about what they show.

**Privacy.** The fetch is per subject and on demand, so it reveals not only which
tokens a user holds, which the batched metadata query already reveals, but which
rows they looked at and when. That is a behavioural signal the text path does not
produce.

## What bounds it today, and what stops bounding it

Only registry logos are fetched. A CIP-25 or CIP-68 image is a URI, usually
`ipfs://`, and the chain channel stores the URI and fetches nothing, because
retrieving it needs a gateway that was ruled out of scope.

So every image currently rendered comes from a curated repository with reviewed
pull requests. That is a meaningful bound: unreviewed imagery is the case the
design does not do.

It stops being a bound the moment NFT images are added, and a control introduced
then is a control introduced after the exposure. That is the argument for deciding
now rather than when it becomes urgent.

**This groundwork is laid for NFT images specifically, not for the registry case it
governs today.** The registry attack surface is narrow and the settings work is not
justified by it alone. It is justified by what arrives next, because NFT images
differ in every dimension that matters. They are URIs rather than inline bytes, so
fetching one means a gateway — a third party that sees every image a user opens,
chosen by us or by them. They carry no curation at all: nothing sits between a
minter and a user's screen. Their size is unbounded and their format is whatever
was uploaded. An unpinned image is neither a picture nor an error but a timeout.

So the questions NFT images raise start earlier than blur-or-show: which gateway,
whether the user picks it, what a slow or missing image renders as, and whether the
application should issue requests to an arbitrary host on a wallet's behalf at all.
None of those are answered here. What is answered here is that the control surface
exists and has a default before any of it arrives.

## The shape settled

Two settings, in the asset metadata settings page that already exists.

**Token metadata: on or off.** Off is the cold-cache path — fingerprints and raw
units, no request leaving the machine. It already works and is already tested,
because it is what the offline scenario renders.

**Token images: hide, blur, show.** Default **blur**.

- **Hide** means do not fetch. Not merely do not paint: the per-subject request is
  the privacy signal, so a setting that suppresses only the rendering leaves the
  signal intact and buys nothing but the picture.
- **Blur** means fetch, render blurred, reveal on click. Blur that never lifts is a
  worse hide; making first sight a choice is the point.
- **Show** renders directly.

Note that the three are not parallel. Hide is a network decision; blur and show are
display decisions over the same fetched bytes.

**A blanket notice ships regardless of the setting.** Everything on the token detail
except the fingerprint and the quantity came from whoever minted the token, and
Daedalus neither validates nor edits it. This is also the honest framing for the
verified marking, which proves the issuer authored the metadata and says nothing
about whether it is accurate or inoffensive.

## Revealing a blurred image

Clicking a blurred image opens a small prompt with three choices: **show this
image**, **show all images**, **cancel**.

The prompt is the click target rather than a confirmation after the fact. That
costs one extra click per token, once, and it is the right cost: the concern that
produced this setting is content nobody asked to see, and an accidental click
should not be the thing that shows it. Revealing first and offering to stop asking
afterwards would be the better shape if the blur were only about consent, because
the click is already the consent — but it is not only about consent.

**Show this image is permanent for that subject.** Someone who has decided about a
specific token should not be asked about it again. Session-scoped reveal means
re-deciding the same token tomorrow, which teaches people to click through without
reading.

**Show all images changes the setting**, and the prompt must say so by name rather
than silently flipping it. A setting changed from a popup has to be findable
afterwards by someone who chose it in a hurry and wants it back.

This applies only in blur mode. Hide mode has nothing to click, because nothing was
fetched.

## What a fix would still have to decide

**What an existing profile gets.** A default of blur applied to profiles that have
been showing images unblurred is a visible change to people who never asked for
one, and the opposite leaves them on a setting they never chose.

**Whether the metadata setting is genuinely reachable.** Off means a wallet that
shows no tickers, names or decimals at all. That is the correct option to offer and
it will be chosen rarely; it should not be built so prominently that it reads as
recommended.

## What was considered and rejected

**Reporting offensive images to a list maintained by us.** The endpoint is trivial
and the support application could host it. The problem is not technical: it means
deciding what is offensive, what a minter's recourse is, and whether a wallet
maintaining a public blocklist of other people's assets is a position to hold —
particularly for a wallet whose users chose it to avoid trusting third parties. A
blocklist also only helps after someone has been shown the thing.

If reporting is wanted later, routing it to the token registry rather than to us is
the defensible version: an offensive logo there is a failure of their curation, and
they already have the authority and the process.

## Relevant files

- `source/main/assets/assetImageStore.ts` (bounds, media type, SVG refusal)
- `source/renderer/app/components/wallet/tokens/wallet-token/WalletTokenHeader.tsx`
  (the render, and the `source === 'registry'` fetch gate)
- `source/renderer/app/containers/settings/categories/` (the settings page this joins)
