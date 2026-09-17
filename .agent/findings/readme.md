# Findings

> **Things discovered while doing something else, written down rather than acted on.**

A finding is a defect, fragility, or open question that was uncovered during work
whose scope did not include fixing it. Recording it here keeps two things from
happening: the discovery being lost when the branch that made it merges, and the
branch that made it quietly growing to cover it.

## How this differs from the neighbours

| Folder | Holds |
|---|---|
| `plans/{feature}/research/` | Investigation supporting a specific plan's decisions |
| `SOPs/` | A repeatable procedure for something already solved |
| `findings/` | Something wrong or unclear that nobody has picked up yet |

A finding graduates out of this folder when it becomes a plan, an SOP, or a
commit. It is deleted when it is fixed, not marked resolved in place.

## What a finding needs

- The measurement that establishes it, so the next reader does not repeat the work
- What it does and does not affect today
- Which arc or area would own it
- Explicitly, what was **not** done and why

Filenames use a zero-padded numeric prefix, matching the convention in
`plans/*/research/`.

Findings describing an exploit surface in shipped code do not belong here. This
repository is public, so a write-up of an unfixed weakness would be published
more durably than an issue and could not be withdrawn. Those are raised in the
private management repository instead, and are deliberately absent from this
index: a pointer saying where to look is still a signal that something is worth
looking for.

## Index

| Finding | Scope | Status |
|---------|-------|--------|
| [retired-drep-visibility.md](./retired-drep-visibility.md) | Governance, with an upstream fix: a retired DRep leaves the wallet loading forever | Open, not scheduled |
| [ipc-channel-response-correlation.md](./ipc-channel-response-correlation.md) | IPC: `IpcChannel` answers every concurrent request with one payload and drops the rest, and `IpcConversation` next to it already does this correctly | Open for the 68 files still on `IpcChannel`; the asset metadata channels are moved |
| [token-provenance-discarded.md](./token-provenance-discarded.md) | Native tokens: per-property verification, policy closure and script type are computed or one call away, and collapsed into one boolean | Open, not scheduled |
| [09-token-images-are-shown-without-consent.md](./09-token-images-are-shown-without-consent.md) | Native tokens: registry logos are fetched per subject and rendered with no setting, no prompt and no notice that the image came from the minter | Open, not scheduled |
