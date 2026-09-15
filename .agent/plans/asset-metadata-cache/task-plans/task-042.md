# Task task-042: Retry a network-caused backoff when the machine comes back online

## Task ID and Title

- ID: `task-042`
- Title: `Retry a network-caused backoff when the machine comes back online`

## Why Chosen Now

Manual QA on this branch found the ordinary offline case is not recovered from. A user opens
Daedalus with no connectivity, every subject fails and is recorded with a five-minute retry-after,
they connect, and their wallet shows no names for five minutes with nothing explaining why. The
condition that caused the failure has demonstrably changed and nothing in the design notices.

The backoff itself is right and stays. `task-007` put it there so a failing subject is not retried on
every render, and that is the reason a render-driven cache can exist at all. What is missing is the
one event that makes a stored wait untrue.

## Interaction Mode

- Mode: `agent_execution`

Every acceptance criterion is settled by a spec: the two clients against stubbed transports, the
resolver against a real database file, the two channel halves against their own harnesses, and the
store against a dispatched DOM event. Nothing needs a running node or an operator.

## Scope

- Classify a failed subject as transient or deterministic at the point of failure, in both clients
  that produce a backoff row.
- Hold the transiently-failed subjects in the resolver, and retry exactly those when the machine
  comes back online.
- Carry the online observation from the renderer, which is where it is an event, to the main process,
  which is where the failures are known.

## Non-Goals

- **No removal or weakening of the backoff.** The ladder, its base and its ceiling are untouched.
- **No reset for a deterministic failure.** A 4xx is a refusal of our own request and is not retried
  within a call by design; connectivity changing says nothing about it, so its wait stands.
- **No reset for `unregistered`.** The registry answered and does not know the subject. Nothing about
  that is a network condition, and re-asking on every reconnection is the behaviour that backoff row
  exists to prevent, worst for the NFT-holding wallets the registry never covers.
- **No reset for a throttle.** A Koios `429` and the per-process request ceiling are the far end and
  this process saying "too often". Neither is fixed by a link coming up.
- **No reset for a pending chain row.** It is waiting for the user's own immutable database to reach
  a block, not for the network.
- **No timer and no polling.** Nothing samples a connectivity API on an interval.
- No new IPC channel, no new database column, no schema version bump, no new runtime dependency.
- No user-visible surface. Offline stays a state rather than an error, as everywhere else in this
  design.

## Dependencies

- `task-007` (the registry client and its backoff), `task-033` (the Koios client and its backoff),
  `task-010` (the resolver and the due rule), `task-013` (the request type), `task-014` (the main
  handler), `task-015` (the renderer client), `task-016` (the store), and `task-029`, whose forced
  read is the mechanism this reuses.

## Research Consulted

- The defect report from manual QA, which sets the constraint that a transient failure class resets
  while a deterministic one does not.
- `.agent/plans/asset-metadata-cache/task-plans/task-007.md`, the status rules and the chosen
  backoff bounds.
- `.agent/plans/asset-metadata-cache/task-plans/task-029.md`, which bypasses the refresh window
  rather than clearing `updated_at` and the backoff row, and records why.
- `.agent/plans/asset-metadata-cache/asset-metadata-cache-prd.md`, the offline rule at `:728-730`.

## Docs, Workflows, and Skills Consulted

- Docs: `.agent/plans/asset-metadata-cache/task-plans/readme.md`, including its caution that
  `.agent/workflows/ipc.md` is wrong about the mechanism and that the channels are read from
  `source/common/ipc` directly; `CLAUDE.md` for the MobX and spec conventions.
- Workflows: `.agent/workflows/test.md` for the Jest invocation, read against the trust map.
- Skills: none apply. No message is added, so nothing in `i18n-messaging` is engaged.

## Live Repo Findings Verified For Planning

Verified at `b9d24f438` on branch `feat/asset-metadata-cache`, 2026-09-15.

**The backoff and the rule it feeds.** `assetRegistryClient.ts:51-52` is five minutes doubling to
twenty-four hours; `koiosClient.ts:85-86` is the same pair. `assetRegistryClient.ts:384-395` and
`koiosClient.ts:407-427` turn a failure count into `retryAfter = now + backoff`.
`assetMetadataResolver.ts:624-648` is `_due`, the only reader: a subject whose
`asset_resolution.retryAfter` is in the future is filtered out of every demand.

**Both clients already compute the classification, under another name.**
`assetRegistryClient.ts:258-261` and `koiosClient.ts:293-294` are the same function: a transport
failure other than `too-large`, or a status of 500 or more. It is used today to decide the one
in-call retry. That is the same question as "may this change on its own", asked about the first
result instead of the final one. So no new taxonomy is invented; the existing predicate is named for
what it means and applied once more, to the outcome.

**Nothing else that writes a backoff row is a network condition.** `koiosClient.ts:406-414` writes
the throttle row for a `429` and for the per-process ceiling. `assetMetadataResolver.ts:564-583`
writes `pending` for a block the immutable database does not hold yet and `failed` for a pointer the
local check refused. None of the three is fixed by a link coming up.

**Clearing the backoff row would not be enough on its own.** `stores/AssetsStore.ts:296-304` adds
every rendered subject to `_requestedSubjects` and never removes one, so a subject is asked for
exactly once for the life of the renderer. `_resolveRenderedSubjects` only fires for subjects it has
not already asked about. So a reset that cleared `retry_after` and waited for the next demand would
wait for a window reload. The reset has to issue the read itself, and the rows it resolves reach the
screen on the update channel, which `AssetsStore.ts:133` already subscribes to.

**The forced read is exactly the mechanism needed, and it already exists.**
`assetMetadataResolver.ts:346-375`: `request(subjects, { force: true })` skips `_due` entirely and
claims each subject, so the backoff is bypassed rather than cleared, and `_claimed` at `:392-400`
stops a second call scheduling a subject already in flight.

**The main process has no event for this and cannot get one without polling.** `Net` in
`node_modules/electron/electron.d.ts:10007-10080` is a plain interface, not an `EventEmitter`. It
offers `isOnline()` at `:10049` and the `online` property at `:10073`, both synchronous queries, and
declares no event. Electron 41.3.0 is the version in `package.json`. Sampling either on an interval
is the polling this design does not do. The renderer is a Chromium window and raises `online` and
`offline` from the same network change notifier as an event, so the observation exists on one side
of the process boundary and the failures are known on the other.

**Its own documentation says what the signal is worth.** The Electron declaration records that
`false` is a strong indicator and `true` is inconclusive. That is the right strength for this: the
reset does not assert that the registry will answer, it withdraws a wait that was predicated on a
condition that no longer holds.

**The request already carries a field of exactly this shape.** `common/ipc/api.ts:567-578` carries
`refresh` and `sourceUrl`, the second with a comment recording that a setting travels with the read
rather than on a channel of its own that would have to be kept in step. `task-029` records "no fourth
IPC channel" as a non-goal for the same reason.

**A store may hold a window listener.** `stores/lib/Store.ts:29-39` gives every store `setup()` and a
`teardown()` that stores override and call through, as `NetworkStatusStore.ts:169-176` does.

## Files Expected To Change

- `source/main/assets/assetRegistryClient.ts` — classify, and report the transient subjects.
- `source/main/assets/assetRegistryClient.spec.ts`
- `source/main/assets/koiosClient.ts` — the same.
- `source/main/assets/koiosClient.spec.ts`
- `source/main/assets/assetMetadataResolver.ts` — hold the set, and the retry.
- `source/main/assets/assetMetadataResolver.realfs.spec.ts`
- `source/common/ipc/api.ts` — one optional field on the metadata request.
- `source/main/ipc/assetMetadataChannel.ts` — pass it to the resolver.
- `source/main/ipc/assetMetadataChannel.realfs.spec.ts`
- `source/renderer/app/ipc/assetMetadataChannel.ts` — send it.
- `source/renderer/app/ipc/assetMetadataChannel.spec.ts`
- `source/renderer/app/stores/AssetsStore.ts` — listen for the event, and stop listening.
- `source/renderer/app/stores/AssetsStore.spec.ts`
- `.agent/plans/asset-metadata-cache/asset-metadata-cache-tasks.json`
- `.agent/plans/asset-metadata-cache/task-plans/task-042*.md`

No database file is opened, no schema statement changes, and `ASSET_METADATA_DB_VERSION` stays at 1.

## Implementation Approach

### The trigger, and the two that were not chosen

**Chosen: the renderer's `online` event, forwarded to the main process on the request channel.**

Chromium raises `online` on the window from the operating system's network change notifier. It is an
event, it costs nothing until it fires, and the renderer already has a channel to the main process
carrying a field of this shape. What it reports is that the machine believes it has a route, not
that `tokens.cardano.org` will answer, and that is the right strength: the message is "the condition
you were waiting on may have changed", and the main process decides what, if anything, that changes.

*When the transition is noisy.* A Wi-Fi roam or a VPN connect can raise several of these in a few
seconds, and the signal can be true while the link is not yet usable. Three things bound what that
costs, and they are one mechanism rather than three:

1. Only subjects in the transient set are retried, and the set is emptied when the retry is issued.
   A second event arriving before that pass finishes finds nothing to do.
2. `_claimed` already refuses to schedule a subject that is in flight.
3. A transition is honoured at most once every thirty seconds, so a link that flaps continuously
   starts at most two passes a minute rather than one per flap.

The worst case is a pass that fails again and refills the set, which is one batch sequence against a
host that is not answering, and no connection is established at all when the machine really is
offline.

**Not chosen: a network-state transition observed in the main process.** Electron's `net` is a plain
interface with `isOnline()` and an `online` property and no event, verified in the type declarations
of the pinned version. Detecting a transition there means sampling on an interval, which is the
polling this design removed. Rejected on the constraint as stated.

**Not chosen: an explicit user action.** One already exists, per subject, in the settings dialog.
It is the wrong shape for this: a user cannot know which subjects are in backoff or that a backoff is
why a name is missing, and asking them to open a dialog per token to recover from an outage is the
defect restated as a feature.

### Should this share a mechanism with `task-029`?

**Yes for the mechanism, no for the trigger, and the part they share is the part `task-029` got
right.** `task-029` bypasses the refresh window and the backoff rather than clearing `updated_at` and
the backoff row, because clearing before a fetch that then fails leaves a row that looks
never-updated and re-schedules on every render. This task reuses that exact path:
`request(subjects, { force: true })`. Nothing is cleared speculatively, the fetch writes whatever
outcome it gets, and a retry that fails again lands on the next rung of the ladder rather than on a
row with no memory.

They differ in what selects the subjects and in what starts it. `task-029` is one subject, chosen by
the user, on a user action. This is the set the main process knows failed for a reason that has
changed, chosen by the main process, on an observation. Selecting subjects is not something the
renderer can do here, which is why the renderer sends an observation and not a list.

### The classification

A failure is **transient** when the exchange did not complete or the far end reported its own
failure: a timeout, a network error, or a status of 500 or more. It is **deterministic** otherwise:
any 4xx, a response over the read cap, and a 200 whose body is not the shape the endpoint documents.

The last of those is worth stating, because a captive portal is the obvious counter-example. Both
endpoints are reached over HTTPS, so an intercepting portal cannot answer for them without a
certificate the transport rejects; that arrives as a network error and is already transient. A
well-formed 200 carrying something unreadable is the registry or the index itself misbehaving, which
a link coming up does not fix.

Both clients already carry this predicate as `isRetryable`, used to decide the one in-call retry. It
is renamed to say what it means and applied a second time, to the final result.

### The pieces

1. **`assetRegistryClient.ts`.** `BatchOutcome` gains `transient`, and `AssetRegistryQueryResult`
   gains `transientFailures`. A split merges its halves' lists as it merges everything else, so a
   half that succeeded contributes nothing and a half that timed out contributes its own subjects.

2. **`koiosClient.ts`.** `Answer` gains `transient`, `fail` takes it, and `KoiosQueryResult` gains
   `transientFailures`. `throttle` contributes nothing.

3. **`assetMetadataResolver.ts`.** A `Set<string>` of subjects whose last outcome was a transient
   failure. Every pass rewrites membership for the subjects it handled: a subject that resolved, was
   unregistered, or failed deterministically is removed; a subject that failed transiently in either
   channel is added. So the set describes the present, not a history.

   `retryTransientFailures()` takes the set, empties it, and issues `request(subjects,
   { force: true })`. It does nothing when the set is empty or when the last honoured call was less
   than `ASSET_CONNECTIVITY_RETRY_MIN_INTERVAL_MS` ago, and in the second case it does not empty the
   set, so the next honoured transition still has it.

   Thirty seconds is chosen, not measured: long enough to absorb the burst one physical event
   produces, short enough that a genuine reconnection after a false start is picked up while the user
   is still looking at the screen.

4. **The channel.** `connectivityRestored?: boolean` on the request, read with `=== true`. The
   handler calls the resolver after setting the pointer source, so a retry uses the current setting.

5. **The store.** `setup()` registers a `window` listener for `online`; `teardown()` removes it. The
   handler sends one message with an empty subject list. It is an observation, not a read: the
   subjects to act on are the ones the main process knows about, and the renderer's own list of what
   is on screen is not that set.

### What the set does not survive

A process restart. That is deliberate and is the honest reading of the trigger: a fresh process has
observed no transition, and the wait it inherits was written by that subject's own failure at most
one backoff step earlier. Persisting the classification would mean a column on `asset_resolution`, a
schema shape change and therefore a version bump, which deletes the cache file. The case it would buy
is a user who quits during an outage and restarts within the remaining window, and pays for it with
every user's cache. Recorded under Risks rather than taken.

## Acceptance Criteria

1. A subject whose registry batch timed out, failed at the socket, or got a 5xx is reported as a
   transient failure; a subject that got a 4xx, an over-sized response or an unreadable body is not.
   Asserted per status class.
2. The same for the Koios client, with a throttle contributing nothing.
3. Coming back online issues a fetch for a subject inside a transient retry-after window, where an
   ordinary read does not.
4. Coming back online issues no fetch for a subject whose last failure was a 4xx, asserted in the
   same spec as criterion 3 so the two are distinguishable.
5. Coming back online issues no fetch for an `unregistered` subject.
6. A subject that resolves stops being retried by a later transition.
7. A second transition inside the minimum interval issues nothing, and the subjects it would have
   retried are still retried by the next honoured one.
8. The rows a retry resolves reach the renderer without the renderer asking again.
9. The flag reaches the wire from the renderer and reaches the resolver in the main process.
10. The store sends the message on the `online` event and stops listening at teardown.
11. Nothing schedules unsolicited work on a timer: no `setInterval` is added, and no `setTimeout`
    outside the request budget and the existing in-call retry.
12. `compile`, `lint`, `i18n` and `jest` green from `nix build`.
13. No new `@ts-ignore` and no new `@ts-expect-error`; `package.json` and `yarn.lock` unchanged;
    `ASSET_METADATA_DB_VERSION` unchanged.

## Verification Plan

**`assetRegistryClient.spec.ts`.** Per status class, asserting `transientFailures` and not only the
resolution state, because every one of these produces `state: 'failed'` and the states alone cannot
tell them apart: a timeout, a network error, 500 and 503 report their subjects; 400, 401, 403, 404,
413 on a batch of one, 429, an over-sized response and a 200 carrying malformed JSON report none. A
split where one half times out and the other answers reports only the half that timed out, which is
what proves the list belongs to subjects rather than to the original batch.

**`koiosClient.spec.ts`.** The same classes, plus the two throttles: a `429` and the per-process
ceiling each report no transient failure while still writing their row.

**`assetMetadataResolver.realfs.spec.ts`**, against a real database file:

- A failing transport, then `retryTransientFailures()`, issues a second call for the same subject,
  and an ordinary `request` for it does not. The complement is the case that matters: without it, a
  resolver that ignored the window for everything would pass.
- A 404 for the subject, then a transition: no call. Driven beside the timeout case, from the same
  harness, so the difference is the classification and nothing else.
- A subject the registry omitted, recorded `unregistered`, then a transition: no call.
- A subject that failed transiently and then resolved on the retry: a second transition issues
  nothing.
- Two transitions inside thirty seconds issue one pass; the second is ignored and the set is intact,
  so a third transition after the interval issues the pass.
- A transition with an empty set issues nothing.
- The rows a retry writes are delivered to `onResolved`.
- After a retry that fails again, the subject's `failure_count` has risen and its `retry_after` is
  the next rung, so the ladder is not defeated by repeated transitions.

**`assetMetadataChannel.realfs.spec.ts`.** A request carrying the flag reaches the resolver; one
without it does not; and a request carrying the flag with an empty subject list still answers.

**`assetMetadataChannel.spec.ts`** (renderer). The flag is on the wire when asked for and absent
otherwise.

**`AssetsStore.spec.ts`.** Dispatching `online` on the window sends one message carrying the flag and
no subjects; `teardown` removes the listener, so a later event sends nothing; and the existing
"schedules nothing to repeat" case still passes, which is what says no timer was introduced.

**Commands.**

```
nix build '.#checks.x86_64-linux.compile' --no-link
nix build '.#checks.x86_64-linux.lint'    --no-link
nix build '.#checks.x86_64-linux.jest'    --no-link
nix build '.#checks.x86_64-linux.i18n'    --no-link
git diff HEAD -- package.json yarn.lock   # must be empty
```

## Risks and Open Questions

1. **The classification does not survive a restart, so a restart inside a backoff window keeps the
   stale wait.** Bounded: the renderer asks for each subject once per window lifetime, so a subject
   accumulates one failure per session rather than a ladder of them, and the wait it inherits is at
   most the first rung. The alternative is a column on `asset_resolution`, which changes the table's
   shape, and the module's stated migration is to delete a file stamped with any other version. That
   is a cache wipe for every user to cover a restart inside five minutes.
2. **`online` is inconclusive when true.** A false positive costs one pass that fails the way it
   would have failed anyway, and refills the set. Its real cost is bounded by the minimum interval,
   and no connection is established at all when the machine is genuinely offline.
3. **A host that is down for a long time keeps its subjects in the set.** Each honoured transition
   retries them and each failure moves them a rung up the ladder, so the automatic schedule keeps
   getting longer while the manual one stays available. That is the intended direction: a transition
   is evidence about the network, not about the host.
4. **Nothing tells the user any of this is happening.** Consistent with the rest of the design, where
   offline is a state and nothing is surfaced. Named because it is the reason the defect went unseen
   until manual QA: a wallet with no names looks the same whether it is waiting five minutes or has
   given up.
5. No open questions for the project owner. The trigger was the one decision and it is recorded above
   with the two rejected alternatives and the evidence for rejecting them.

## Required Docs, Research, and Tracking Updates

- Add `task-042` to `.agent/plans/asset-metadata-cache/asset-metadata-cache-tasks.json` in phase 2,
  with dependencies on the tasks whose code it changes, and set its `status` to `completed` when the
  implementation review reads `approved`.
- Append to `task-042-plan-review.md` and `task-042-impl-review.md` as the cycle requires.
- No PRD change. The PRD says an offline wallet answers from the cache and surfaces nothing, which is
  still true; it says nothing about what happens when the machine comes back, which is the gap this
  fills rather than contradicts.

## Review-Log Paths

- Planning review log: `.agent/plans/asset-metadata-cache/task-plans/task-042-plan-review.md`
- Implementation review log: `.agent/plans/asset-metadata-cache/task-plans/task-042-impl-review.md`

## Planning Status

`approved`

## Build Status

`completed`

## Current Outcome

- A backoff caused by the network is retried when the machine says the network is back. A backoff
  caused by a refusal, an unreadable answer, a throttle or an absent record is not.

## Final Outcome

- `task-042` complete. Reviewed and approved in `task-042-impl-review.md`.

## Self-Review

- The trigger is chosen against the constraint as stated, and the alternative that would have been
  tidiest to implement is rejected on evidence from the pinned Electron's own type declarations
  rather than on preference.
- The classification is not a new taxonomy. Both clients already computed it to decide their in-call
  retry, and the change is to name it and ask it once more.
- The question `task-029` raises is answered rather than deferred: the two share the bypass, which is
  the part of `task-029` that was right, and differ in what selects the subjects.
- The one thing this deliberately does not do, surviving a restart, is named with the price of doing
  it, which is every user's cache file.
