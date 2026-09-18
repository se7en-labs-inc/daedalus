# Finding: only one shape of connectivity loss has an automatic way back

**Status:** open, not scheduled
**Raised from:** manual QA of the asset metadata cache, 2026-09-17
**Scope:** asset metadata resolution; the retry mechanism works as written and the
event it waits for is rarer than the failures it is meant to answer
**Severity:** a subject whose first resolution fails stays unresolved for the rest
of the session unless the whole network interface drops and returns. No single
piece is wrong. What is recorded is that the pieces leave no automatic way back
from the failures that do not raise that event.

All line references measured against `5bd24fee1`.

---

## What was observed

The QA operator added `tokens.cardano.org` and `api.koios.rest` to the `hosts`
file, confirmed that no metadata resolved, then removed the lines. Nothing
recovered. No `online` event fired and `navigator.onLine` was true throughout.
Only name resolution changed, and `online` did not report it.

## What the code does

`AssetsStore.ts:139` registers `window.addEventListener('online',
this._onConnectivityRestored)`, removed again at `:148`. The handler at `:340-342`
sends a request with no subjects and `connectivityRestored: true`. The main process
reads that flag at `assetMetadataChannel.ts:189` and calls
`retryTransientFailures()`. That method, at `assetMetadataResolver.ts:398-415`,
issues one forced read for every subject whose last failure was classified as a
condition of the network. It runs at most once per 30 seconds
(`ASSET_CONNECTIVITY_RETRY_MIN_INTERVAL_MS`, `assetMetadataResolver.ts:73`).

The classification is broad. `assetRegistryClient.ts:282-285` treats every
transport failure except an over-sized response as transient, plus any status of
500 or more, so a timeout, a socket error, a refused connection and a far-end
outage all land in the retry set. The set is maintained at
`assetMetadataResolver.ts:587-603`.

So every failure the QA operator produced was recorded as worth retrying. What did
not happen is the event that triggers the retry.

## Why the event did not fire

`online` is Chromium's, raised from the same network change notifier the operating
system uses, which the comment at `AssetsStore.ts:135-138` states. Neither that
comment nor anything else in the repository says what the notifier watches. What
the QA run establishes is one thing it does not watch: name resolution changed and
nothing fired.

A blocked host, a captive portal, a proxy change, a VPN flap, a DNS outage, a
firewall rule and an outage at the far end share the shape of that case. None of
them takes the interface down. The DNS block is the only one of the seven that
was run, so the other six are an inference from the same shape rather than a
measurement.
The listener covers one shape of failure out of the set that the transient
classification deliberately admits.

The main process has no second event to listen for instead. Electron's `net`
offers `isOnline()` and an `online` property and emits nothing, so observing it
there would mean a timer, which is what the design removed
(`AssetsStore.spec.ts:509` asserts that nothing repeating is scheduled).

## The backoff is not the thing that recovers

A backoff expiring is not an event, and nothing here converts it into one.
`AssetsStore.ts` contains no timer: a `grep` over it for `setInterval` and
`setTimeout` returns nothing, and `AssetsStore.spec.ts:509` asserts that nothing
repeating is scheduled.

The wait is consulted in `_due` at `assetMetadataResolver.ts:745-769`, which drops
any subject whose `retryAfter` is still in the future. That filter runs only when
something asks about the subject, and in a running session nothing asks twice. The
renderer keeps every subject it has requested in `_requestedSubjects`, declared at
`AssetsStore.ts:112`, filtered against at `:309` and added to at `:312`. Those are
its only three occurrences in the file: nothing clears it, nothing deletes from it,
and it is never reassigned. So `_resolveRenderedSubjects` at `:306-314` names a
subject exactly once per store instance.

`ASSET_REGISTRY_BACKOFF_BASE_MS` is therefore a floor on a retry that nothing
requests. Its one live effect is to suppress the re-ask that a restart would
otherwise make, when the restart happens inside the window.

Five minutes
(`assetRegistryClient.ts:51`) is the base of a doubling ladder:
`assetRegistryBackoffMs` at `:118-122` scales by `2 ** (failureCount - 1)` up to a
24-hour ceiling at `:52`, and the pointer client carries the same ladder
(`koiosClient.ts:86-87`, `:165-166`). Five minutes is the interval after the first
failure only. A subject that has failed four times waits forty minutes.

## The three ways back, and what each one is

**The `online` event.** The listener at `AssetsStore.ts:139` calls
`_onConnectivityRestored` at `:340-342`, which sends
`_requestMetadata([], { connectivityRestored: true })`: no subjects and a flag. It
does not consult `_requestedSubjects`, and the subjects to retry come from the set
the main process recorded, so the once-per-session rule does not apply to it. This
path is correct, and it is the only automatic one.

**A per-token refresh.** The asset settings dialog carries a control labelled
"Check the token registry again" (`assets.settings.dialog.refreshMetadata`,
`en-US.json:83`), triggered from `AssetSettingsDialogContainer.tsx:24` and handled
by `_onAssetSettingsRefresh` at `AssetsStore.ts:459-464`. One subject, with
`refresh: true`, which the channel turns into `force` at
`assetMetadataChannel.ts:193`, so it skips the wait. There is no bulk or global
equivalent: `actions/assets-actions.ts:4-35` declares every asset action there is,
and none of them refreshes more than the one token a dialog is open on.

**Restarting the application.** A new store instance, which `setUpStores` builds at
`stores/index.ts:115`, starts with an empty `_requestedSubjects`, so every rendered
subject is named again. This is the path the backoff applies to.

## The design consequence

The `online` event is not one recovery mechanism among several. It is the only
automatic one, and it does not fire for the shape of failure the QA run produced.

Every other way that connectivity returns leaves each failed subject where it is
until the user restarts the application or opens that token's settings dialog and
presses refresh. The QA operator removed the `hosts` lines and watched nothing
recover, and nothing was going to.

## What this finding does not establish

Whether five minutes, the doubling, or the 24-hour ceiling are the right numbers.
Nothing has measured that, and `assetRegistryClient.ts:45-50` says so in the
comment above the constant: the interval was chosen from an argument, not from a
corpus. The question is also largely moot while nothing consumes the interval
automatically.

Whether re-asking on render would be affordable. The claim set and the backoff
columns exist to stop exactly that, so the cost is not obviously small, and the
question is a design one.

Anything about the image channel, which this QA pass did not exercise.

## What was not done and why

Nothing was changed. The candidate fixes are a timer, re-asking per render, and
clearing a subject from `_requestedSubjects` when its resolution fails. The design
explicitly removed the timer, and a test asserts its absence. Re-asking per render
reintroduces the scheduling the claim machinery prevents. Clearing the subject on
failure is the smallest of the three, and it still leaves the decision of how
often to the render loop.

## Relevant files

- `source/renderer/app/stores/AssetsStore.ts` (the listener, the request, the
  once-per-subject rule)
- `source/main/ipc/assetMetadataChannel.ts:189` (the flag)
- `source/main/assets/assetMetadataResolver.ts` (the retry, the transient set, `_due`)
- `source/main/assets/assetRegistryClient.ts` (classification and the backoff ladder)
- `source/main/assets/koiosClient.ts:86-87`, `:165-166` (the same ladder for the
  pointer client)
