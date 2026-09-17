# Finding: `IpcChannel` answers every concurrent request with one payload

**Status:** open for `IpcChannel`, which 70 files still construct. The two asset
metadata read channels were moved to `IpcConversation` on 2026-09-17, after the
predicted case arrived in a build.
**Raised from:** asset metadata cache plan review
**Scope:** every channel built on `IpcChannel`, which is most of them
**Severity:** low for a channel that is asked once at a time, which is most of
them. For a channel that can be asked twice before the first answer returns it
is a hard defect: requests are dropped, not merely mis-addressed, and the caller
is left holding a promise that never settles. No funds at risk and nothing
attacker-controlled: both ends are the same application and nothing outside it
influences message ordering.

---

## What it does

`IpcChannel.send` (`source/common/ipc/lib/IpcChannel.ts:115-134`) and
`IpcChannel.request` (`:144-163`) both register a one-shot listener and resolve
on the next message that arrives:

```ts
receiver.once(
  this._responseChannel,
  (event, isOk: boolean, response: Incoming) => {
    if (isOk) {
      resolve(response);
    } else {
      reject(response);
    }
  }
);
```

Nothing ties that response to the request that caused it, and a channel derives
three names from one base in the constructor (`:104-106`): `-broadcast`,
`-request` and `-response`. Every caller of one channel shares the single
`-response` name.

That produces two distinct failures, and the second is the serious one.

**Mis-routing.** With two requests in flight, the first response to arrive
settles the first listener registered, whichever request it was actually
answering. Each request can receive the other's payload.

**Listener drain.** `ipcRenderer` and `ipcMain` are `EventEmitter`s, and one
`emit` runs *every* one-shot listener registered for that name, hands each of
them the same payload, and unregisters all of them. So N concurrent requests are
not answered in some order: they are all answered once, with one payload, and
the N-1 responses behind it arrive to an empty listener list and are dropped.
N-1 callers are left with a promise that never settles.

`source/common/ipc/lib/IpcConversation.spec.ts` drives both primitives over a
real `EventEmitter` and pins this. Ten concurrent requests against `IpcChannel`,
answered one at a time in reverse order, all resolve with the tenth subject's
payload, and no listener is left on the response name for the nine answers that
follow. The same ten against `IpcConversation` each resolve with their own.

Neither subclass adds correlation. `source/main/ipc/lib/MainIpcChannel.ts` and
`source/renderer/app/ipc/lib/RendererIpcChannel.ts` only supply default sender
and receiver objects and delegate to `super`.

## The predicted case arrived

The previous version of this finding said the defect was unreachable because the
channels in use were single-shot, and that it would stop being unreachable "the
first time a channel serves a bulk read keyed on a list, or any caller that can
be invoked twice before the first call returns".

Both were then built on `IpcChannel`, in the asset metadata cache, after this
was written. The asset image channel is asked once per token row, so a wallet
holding ten registry-listed tokens issues ten concurrent requests on one
channel. The observed result was three logos out of ten, with the membership
varying between runs and uncorrelated with image size: rows mount across several
ticks, and each batch of listeners registered between two arriving responses
yields exactly one success. The seven that failed were permanent for the life of
the renderer, because `requestAssetImageUrl` memoises the promise rather than
the result, so a promise that never settles is remembered as firmly as a picture
would have been.

The bulk read has the same exposure. `AssetsStore` issues a metadata read from a
MobX reaction over the rendered subjects, a second from a `window` `online`
event, and a third when a user asks one asset to refresh
(`source/renderer/app/stores/AssetsStore.ts:306-358`, `:459-464`). Nothing
serializes them. A read that is dropped there is dropped decimal places, and it
does not self-heal: the subjects were already marked as requested, and the main
process only pushes rows it has just resolved, so a lost answer to a cache *hit*
is never sent again.

An application-level id was carried on those channels from the start to address
mis-routing. It could not address drain, because the message that would have
settled a request had already been consumed by another listener. Correlation
cannot be added on top of `IpcChannel` by the caller: it has to be in the
listener, which is what `IpcConversation` does.

## The repository already contains the fix

`IpcConversation` solves exactly this problem, in the same directory, and
predates the finding. `source/common/ipc/lib/IpcConversation.ts:65-96` mints a
`conversationId` per request, sends it alongside the message, and drops anything
that does not match before resolving:

```ts
const conversationId = uuidv4();
const handler = (event, messageId, isOk, response) => {
  // Only handle messages with matching conversation id!
  if (messageId !== conversationId) return;
  ...
  receiver.removeListener(this._channelName, handler);
};
receiver.on(this._channelName, handler);
sender.send(this._channelName, conversationId, message);
```

It uses `on` plus an explicit `removeListener` rather than `once`, which is what
lets it discard a non-matching message and keep waiting. `once` cannot do that:
it unregisters on the first message whether or not that message was wanted.

It also uses one wire name in both directions rather than deriving three, so
moving a channel across changes the wire shape and both ends have to move
together.

`IpcConversation` is now used by the electron-store conversation
(`source/main/ipc/electronStoreConversation.ts`,
`source/renderer/app/ipc/electronStoreConversation.ts`) and by the two asset
metadata read channels (`source/main/ipc/assetMetadataChannel.ts`,
`source/renderer/app/ipc/assetMetadataChannel.ts`).

## What was done, and what was not

**Done.** `ASSET_METADATA_CHANNEL` and `ASSET_IMAGE_CHANNEL` moved to
`IpcConversation` at both ends, and the application-level id was removed from
their request and response shapes along with the registry in the renderer that
read it. Two correlation mechanisms stacked on one channel are worse than either
alone, and the transport is the one that can be correct. A spec at the primitive
level now pins the property that N concurrent requests each receive their own
response, with the same assertion run against `IpcChannel` as a control.

**Not done: `IpcChannel` itself is unchanged.** Correcting it means changing the
wire shape for every channel built on it, because the responder has to echo an
id it currently never sees. Both ends must change together and any channel whose
responder is missed stops resolving entirely. 70 files construct one, in 110
places. A correct alternative already exists in the same directory, so the
cheaper and safer route is to move a channel across when it needs to be, rather
than rewrite a primitive under every caller of it at once. The class comment on
`IpcChannel` now says which primitive to reach for and why.

**Not done: the remaining channels were not audited.** The ones in use are
almost all single-shot and user-initiated, where the defect is unreachable. That
is the same claim this finding made before, and it was right about the channels
that existed and wrong about the one that was built next, so it should be read
as "not known to be reachable" rather than "safe".

**Not done: the asset metadata push channel was left on `IpcChannel`**
(`ASSET_METADATA_UPDATE_CHANNEL`). It is a broadcast from main to renderer that
answers no request, and the acknowledgement travelling back carries no payload
at all, so there is nothing a mis-delivered or dropped acknowledgement can get
wrong.

## What is worse under `IpcConversation`

A request whose response never arrives keeps its listener forever, whereas
`IpcChannel` would have had it swept away by the next unrelated response on the
channel. Both ends of both asset channels answer on every path, including their
own failures, so this is bounded there. A channel whose responder can silently
not answer would accumulate listeners instead, and `EventEmitter`'s default
warning threshold is raised to 100 in both processes
(`source/main/index.ts:97`, `source/main/preload.ts:19`), so the first sign of
it would be memory rather than a warning.

## Relevant files

- `source/common/ipc/lib/IpcChannel.ts` (`send` at `:115-134`, `request` at
  `:144-163`, name derivation at `:104-106`)
- `source/common/ipc/lib/IpcConversation.ts` (`request` at `:65-96`)
- `source/common/ipc/lib/IpcConversation.spec.ts` (both primitives, one harness)
- `source/main/ipc/lib/MainIpcChannel.ts`
- `source/renderer/app/ipc/lib/RendererIpcChannel.ts`
- `source/common/ipc/api.ts` (66 exported constants; 65 are built into a
  channel or a conversation, 62 of them still on `IpcChannel`, and
  `DEVICE_NOT_CONNECTED` is an error code rather than a channel)
