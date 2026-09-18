# Temporary instrumentation that must be removed

**Status:** active, must be removed before this plan leaves draft
**Added:** 2026-09-16
**Commit subject:** `chore(assets): add temporary asset-subsystem diagnostic logging`

Added to chase a defect where a wallet holding ten registry-listed tokens with
logos renders three of them, and the three vary between runs. It adds
observability and nothing else. **It is not a feature and must not ship.**

The defect it was attached to find has since been diagnosed and fixed. The
instrument stayed on across the fix, so that a build could be compared against
the log taken before it, which means it is no longer confined to the commit that
added it.

## How to remove it

Not a single revert any more. The lines the fix reshaped live in the commit that
reshaped them, so removing the instrument means deleting the four files below
and the marked edits in the six, all of which carry a
`TEMPORARY DIAGNOSTIC INSTRUMENTATION` comment at every touched point:

```
git grep -n 'TEMPORARY DIAGNOSTIC INSTRUMENTATION'
```

Nothing else in the plan depends on it.

## What it added

Four new files, all of which exist only for this:

| File | What it is |
|---|---|
| `source/common/utils/assetLogging.ts` | The marker that tags an asset-subsystem line |
| `source/main/utils/assetLogging.ts` | Main-process `assetLogger` |
| `source/main/utils/setupAssetLogging.ts` | The `Assets.json` transport and its rotation |
| `source/renderer/app/utils/assetLogging.ts` | Renderer `assetLogger` |

Six edited files, each carrying a `TEMPORARY DIAGNOSTIC INSTRUMENTATION` comment
at every touched point:

| File | Edit |
|---|---|
| `source/main/index.ts` | One import and one `setupAssetLogging()` call after `setupLogging()` |
| `source/main/assets/assetImageStore.ts` | `logoValue` returns a reason beside its value; the store's entry points and every failure branch log |
| `source/main/assets/assetMetadataDb.ts` | `writeImage` says which of its two refusal paths refused |
| `source/main/ipc/assetMetadataChannel.ts` | `readImage` logs the request in and the response out, against the subject |
| `source/renderer/app/ipc/assetMetadataChannel.ts` | An in-flight counter, and a line per image request sent and per response received |
| `source/renderer/app/components/wallet/tokens/wallet-token/WalletTokenHeader.tsx` | The row logs whether it asked and what it got |

## What changed when the image channel moved to a conversation

The instrument was written against a client that carried its own correlation
registry, and the registry is gone: the channel correlates now, so there was no
longer a `deliver` to log from and no such thing as a response that matched no
waiter. The lines it produced were replaced rather than dropped. Each request
and each response is now recorded against its subject on both sides, and the
renderer keeps a count of outstanding image requests purely so that one file
answers "ten rows asked and ten were answered" without the reader pairing lines
up by hand. A count that climbs and never returns to zero is what the original
defect would look like if it came back.

The counter is diagnostic state and nothing reads it but the log. It goes with
the rest of this.

## The one thing to check when reverting

`logoValue` in `assetImageStore.ts` changed shape: it returned `string | null`
and now returns `{ value, outcome, reason }`. The caller's behaviour is
identical, and the function is module-private, so the revert is safe. It is
noted because it is the only structural change among otherwise additive edits.

The `useEffect` dependency list in `WalletTokenHeader.tsx` was deliberately left
as it was, with a comment saying so. Adding `source` to it would have been a
behaviour change.

## Where the evidence lands

`Assets.json`, beside `Daedalus.json` in the pub logs directory:

| Platform | Path |
|---|---|
| Windows | `%APPDATA%\Daedalus <Network>\Logs\pub\Assets.json` |
| Linux | `$XDG_DATA_HOME/Daedalus/<network>/Logs/pub/Assets.json` |
| macOS | `~/Library/Application Support/Daedalus <Network>/Logs/pub/Assets.json` |

It is not deleted at startup, because `setupLogging.ts:27` removes `Daedalus.*`
and this does not match. It rotates to `Assets-previous.json` at 8MB, which is
its own bound and unrelated to the main log's 5MB.

It is deliberately **not** in `ALLOWED_LOGS` (`source/main/config.ts:136`), so it
does not travel in a support bundle. It has to be collected by hand.
