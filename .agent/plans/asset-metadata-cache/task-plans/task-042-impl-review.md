Implementation: Iteration 1
Timestamp: 2026-09-15T13:40:00Z

Changes made:

- `source/main/assets/assetRegistryClient.ts`: `isRetryable` renamed `isTransientFailure` and documented as being asked of two different results, the first to decide the one in-call retry and the final one to decide whether the batch's subjects are waiting on the network. `BatchOutcome` gains `transient`, merged through the 413 split like everything else, and `AssetRegistryQueryResult` gains `transientFailures`.
- `source/main/assets/koiosClient.ts`: the same rename and the same reasoning. `Answer` gains `transient`, `fail` takes it, `resolveBatch` returns the outcome and the class together rather than the outcome alone, and `KoiosQueryResult` gains `transientFailures`. Both throttles contribute nothing.
- `source/main/assets/assetMetadataResolver.ts`: `_transientFailures`, a set rewritten by every pass for the subjects that pass handled, and `retryTransientFailures()`, which empties it and issues one forced read. `ASSET_CONNECTIVITY_RETRY_MIN_INTERVAL_MS` is thirty seconds. `_resolveFromChain` carries its own transient list out so the chain channel is classified too.
- `source/common/ipc/api.ts`: `connectivityRestored?: boolean` on the metadata request, documented as an observation rather than an instruction.
- `source/main/ipc/assetMetadataChannel.ts`: the flag calls the resolver, after the pointer source is set and before the read.
- `source/renderer/app/ipc/assetMetadataChannel.ts`: the flag on the wire.
- `source/renderer/app/stores/AssetsStore.ts`: a `window` listener for `online` registered in `setup`, removed in a new `teardown`, sending one message with no subjects.
- The six colocated specs, and one existing case in `AssetsStore.spec.ts` given a `teardown` (see below).

Files touched:
- `source/main/assets/assetRegistryClient.ts`, `.spec.ts`
- `source/main/assets/koiosClient.ts`, `.spec.ts`
- `source/main/assets/assetMetadataResolver.ts`, `.realfs.spec.ts`
- `source/common/ipc/api.ts`
- `source/main/ipc/assetMetadataChannel.ts`, `.realfs.spec.ts`
- `source/renderer/app/ipc/assetMetadataChannel.ts`, `.spec.ts`
- `source/renderer/app/stores/AssetsStore.ts`, `.spec.ts`
- `.agent/plans/asset-metadata-cache/asset-metadata-cache-tasks.json`
- the three review-log files for this task

Two things found during implementation that the plan did not anticipate:

**A store that is set up in a spec keeps its window listener for the rest of the file.** The new case passed alone and failed in the suite, because `AssetsStore.spec.ts` already had two cases that call `setup()` and none that call `teardown()`. Three stores were listening, so one dispatched event produced three messages. The listener is the first thing `AssetsStore.setup` registers that outlives the case, and the fix is the honest one: the two existing cases now tear down, with a comment saying why. Nothing about production changes, where the store lives for the life of the window.

**`queryAssetRegistry`'s empty-subject early return is a shape a spec asserts whole.** It returned `{ entries: [], resolutions: [] }` and one case compares the whole object, so adding a field to the result type without adding it there fails at the assertion rather than at the type. Both were updated; the assertion is worth keeping in that form, because it is the one place that says the empty case allocates nothing.

Verification run:

*The registry client, per status class, asserting the list rather than the state, because every one of these writes `state: 'failed'` and the state cannot tell them apart:*
- 500 and 503 report their subjects; a timeout and a network error report theirs.
- 400, 401, 403, 404, 413 on a batch of one, and 429 report none.
- An over-sized response reports none; a 200 carrying malformed JSON reports none.
- A 200 that answers reports none, and a 200 that omits a subject reports none while recording it `unregistered`.
- An empty subject list reports none and allocates nothing.
- A 413 split where one half answers and the other times out reports only the half that timed out, which is what proves the list belongs to subjects and not to the batch they were asked in.

*The Koios client, the same classes:*
- 500 and 503, a timeout and a network error report their subjects; 400 and 404, an over-sized response and an unreadable 200 report none.
- A 429 and the per-process ceiling each write their ten-minute throttle row and report none, asserted on the `retryAfter` as well as on the list so the row is still being written.
- A batch whose second call times out reports its subjects, which is the two-call shape of this client rather than the one-call shape of the registry's.

*The resolver, against a real database file:*
- A subject whose batch failed at the socket is retried by a transition, and an ordinary read for the same subject in the same test is refused first. The complement is the case that matters: without it a resolver that ignored the window for everything would pass.
- A subject the endpoint refused with a 404 is not retried, driven from the same harness so the difference is the classification and nothing else.
- A subject the registry omitted, recorded `unregistered`, is not retried.
- A transition with nothing waiting on the network issues nothing.
- A retry that succeeds emits its rows to `onResolved` and writes the ticker, so the rows reach the renderer without the renderer asking again.
- A subject that resolved on the retry is not retried by a later transition.
- A second transition one millisecond after an honoured one issues nothing and leaves the subject in the set, and a third after the interval retries it. Both halves are needed: the refusal must not consume what it refused to act on.
- A retry that fails again moves the subject from failure count 1 to 2 and lengthens its wait, so repeated transitions do not defeat the ladder.
- After a pass, advancing a fake clock by twenty-four hours issues nothing, so nothing here schedules work on a timer.

*The channels and the store:*
- A request carrying the flag reaches `retryTransientFailures`; one without it does not; and a request carrying the flag with no subjects answers with empty lists rather than rejecting.
- The renderer puts `connectivityRestored: false` on an ordinary read and `true` with no subjects when one is asked for.
- Dispatching `online` on the window sends exactly one message, with no subjects and the flag set. After `teardown` the same event sends nothing.
- The existing case asserting the store schedules nothing to repeat still passes, which is what says no timer was introduced on the renderer side either.

Checks, through Nix with every file staged:
- `nix build '.#checks.x86_64-linux.compile' --no-link` — exit 0.
- `nix build '.#checks.x86_64-linux.lint' --no-link` — exit 0.
- `nix build '.#checks.x86_64-linux.i18n' --no-link` — exit 0.
- `nix build '.#checks.x86_64-linux.jest' --no-link -L` — exit 0. 100 suites passed, 1,839 tests with 1,836 passed and 3 skipped. The branch stood at 1,796 after `task-041`, so the 43 cases this task adds are the whole of the difference and no suite outside them moved.
- `nix build '.#checks.x86_64-linux.cucumber-unit' --no-link` and `'.#checks.x86_64-linux.stylelint' --no-link` — both exit 0. Neither was required, and the store change is the reason the first was run anyway.

`nix fmt` was run before the checks and changed one file.

No new `@ts-ignore` and no new `@ts-expect-error` anywhere under `source`. `git diff HEAD -- package.json yarn.lock` produces nothing. `ASSET_METADATA_DB_VERSION` is still 1 and no schema statement changed.

Deviations from the approved plan:
- None in scope or in approach.

Outcome: Implementation complete and ready for review

Review of Iteration 1
Timestamp: 2026-09-15T13:52:00Z

Acceptance criteria, each against the evidence:

1-2. *Both clients classify, per status class, with a throttle contributing nothing.* Met. The assertions are on the list and not on the resolution state, which is the only way these cases can distinguish anything: a timeout, a 404 and an unreadable body all write `failed`.

3-4. *A transition retries a network-caused backoff and not a refusal.* Met, and driven as a pair from one harness. Either case alone is worthless: the first passes against a resolver that ignores the window for everything, the second against one that never retries anything.

5. *An `unregistered` subject is not retried.* Met. This is the one that would have been easiest to get wrong by treating the reset as "clear the waits", and it is the one whose cost is highest, because an NFT-holding wallet is mostly unregistered subjects and would have re-asked for all of them on every reconnection.

6. *A subject that resolves stops being retried.* Met. The set describes the present rather than a history, and `_recordTransientFailures` removes a subject that resolved even where a channel also failed transiently for it.

7. *A transition inside the minimum interval issues nothing and does not consume the set.* Met, in both halves. The second half is the one that makes the interval safe: a refused transition that emptied the set would turn a rate limit into a way of losing the retry altogether.

8. *Rows reach the renderer without it asking again.* Met at the resolver, through `onResolved`, which is what the push channel is wired to.

9-10. *The flag crosses both halves of the boundary, and the store sends it on the event and stops at teardown.* Met.

11. *Nothing schedules unsolicited work on a timer.* Met on both sides: the resolver case advances a fake clock by a day after a failed pass and sees no call, and the store's existing no-timer case still passes.

12-13. *Checks green, no new suppressions, no dependency change, schema untouched.* All met, and two checks beyond the four were run because the store is on the Cucumber unit suite's path.

Three things worth saying beyond the criteria.

The classification is the part of this that could have been a new vocabulary and is not. Both clients already computed exactly this predicate to decide their one in-call retry, and naming it and asking it of the final result is a smaller change than the `failure_class` column the first plan draft reached for. It also means the two clients cannot drift: if one of them changes what it considers worth retrying, it changes what it considers worth resetting, and those should not be separable.

The choice to bypass rather than clear is inherited from `task-029` and is load-bearing here for a second reason `task-029` did not have. A reset that cleared `retry_after` before the fetch would, on a transition that fires while the link is still not usable, leave every one of those subjects with no wait at all and a failed fetch behind it. Bypassing means the failed retry writes the next rung, so a flapping link makes the schedule longer rather than erasing it. The ladder case asserts exactly that.

The renderer sends an observation and not a list, and that is the division the whole design rests on. The renderer knows the machine has a route; it cannot know which subjects are waiting, or that a wait is why a name is missing, because a subject in backoff and a subject the registry has never heard of look identical from there. Sending the rendered subjects instead would have been the obvious shape and would have quietly excluded every subject that had scrolled out of view.

Summary: A backoff caused by the network is retried when the machine says the network is back; a backoff caused by a refusal, an unreadable answer, a throttle, an absent record or a block the local chain has not reached is not. The backoff itself is untouched, nothing is cleared before a fetch, no timer was added, and the one thing this deliberately cannot do, survive a restart, is named in the plan with the price of doing it.

Decision: approved
