Planner: Iteration 1
Timestamp: 2026-09-15T12:10:00Z

Plan Summary:
- Created `.agent/plans/asset-metadata-cache/task-plans/task-042.md` with the twenty-one sections the plan-workspace readme requires.
- Classified the task `agent_execution`. Every criterion is settled by a spec: the clients against stubbed transports, the resolver against a real database file, the two channel halves against their harnesses, and the store against a dispatched DOM event.
- The first draft did three things it should not have: it sampled `net.isOnline()` from the main process on an interval, it cleared `retry_after` for every row in state `failed` and waited for the next demand, and it proposed a `failure_class` column on `asset_resolution` to tell a transient failure from a deterministic one.

Docs, Workflows, Research, and Skills Consulted:
- `.agent/plans/asset-metadata-cache/task-plans/task-007.md`, the status rules, the 4xx rule and the chosen backoff bounds.
- `.agent/plans/asset-metadata-cache/task-plans/task-029.md`, which bypasses the refresh window rather than clearing the columns it is read from, and records why.
- `.agent/plans/asset-metadata-cache/task-plans/readme.md`, including its caution that the IPC workflow document is wrong about the mechanism.
- `CLAUDE.md` for the MobX and spec conventions.

Repo-Verified Findings Used To Shape The Plan:
- `assetRegistryClient.ts:51-52` and `koiosClient.ts:85-86` are the two backoff ladders; `assetMetadataResolver.ts:624-648` is their only reader.
- `assetRegistryClient.ts:258-261` and `koiosClient.ts:293-294` are the same predicate under the name `isRetryable`, used today for the one in-call retry.
- `assetMetadataResolver.ts:346-375` already bypasses `_due` under a `force` flag, and `_claimed` at `:392-400` refuses a subject in flight.
- `common/ipc/api.ts:567-578` already carries two fields of this shape, one with a comment recording why a setting travels with the read.

Planned Approach:
- Detect the machine coming back online, clear the waits that were predicated on the network, and let the next demand pick the subjects up.

Scope Guard / Self-Review:
- No change to the ladder, no new channel, no user-visible surface.

Outcome: Canonical task plan drafted and ready for critique

Critique of Iteration 1
Timestamp: 2026-09-15T12:35:00Z

- **The main process cannot observe this without polling, and the plan assumed it could.** `Net` in the pinned Electron's type declarations, `node_modules/electron/electron.d.ts:10007-10080`, is a plain interface and not an `EventEmitter`. It offers `isOnline()` and an `online` property, both synchronous queries, and declares no event. Sampling either on an interval is exactly the polling this design removed, and the defect report names "without polling" as the axis to weigh the candidates on. The observation exists as an event in the renderer, which is a Chromium window, so it is detected there and sent. Checked in the declarations of the version actually pinned rather than recalled, because this is the whole basis for rejecting the tidier option.

- **Clearing the backoff and waiting for the next demand would have done nothing at all.** `stores/AssetsStore.ts:296-304` adds every rendered subject to `_requestedSubjects` and never removes one, so a subject is asked for exactly once for the life of the renderer. There is no next demand until a window reload. The first draft would have passed a resolver spec, passed manual inspection of the database, and changed nothing a user sees, which is the worst shape a fix can have. The reset has to issue the read itself, and the rows it resolves reach the screen on the update channel the store already subscribes to at `AssetsStore.ts:133`.

- **Resetting every row in state `failed` breaks the constraint the defect report set.** `state` does not record why. A 4xx, a response over the read cap and an unreadable body all land in `failed` beside a timeout, and the report is explicit that a deterministic failure must not reset. `unregistered` is worse: it is not a failure at all, the registry answered, and re-asking on every reconnection is precisely what that row exists to prevent, worst for the NFT-holding wallets the registry never covers.

- **The classification does not need to be invented.** Both clients already compute it, as `isRetryable`, to decide their one in-call retry: a transport failure other than `too-large`, or a status of 500 or more. That is the same question as "may this change on its own", asked of the first result instead of the final one. Renaming it and asking it once more is the whole of the change, which is a much smaller thing than the new taxonomy the first draft was reaching for.

- **The `failure_class` column was the expensive answer to a cheap question.** `asset_resolution`'s shape is fixed by a `CREATE TABLE` and a `CHECK`, and `assetMetadataDb.ts:14-19` records the migration policy: a file stamped with any other version is deleted rather than migrated. So a column means a version bump means every user's cache is discarded. What it buys is the case where a user quits during an outage and restarts inside the remaining window. That window is short, because the renderer asks once per subject per window lifetime, so a subject accumulates one failure per session and inherits at most the first rung of the ladder. An in-memory set is the proportionate answer and the residual is named rather than absorbed.

- **The plan had no answer to what a noisy transition costs, and the defect report asks for one.** Three things bound it and they are worth stating as one mechanism rather than three controls: only the transient set is retried and it is emptied when the pass is issued, `_claimed` refuses a subject already in flight, and a transition is honoured at most once every thirty seconds. The interval is chosen and not measured, and it is written down as chosen.

- **The question the defect report asked about `task-029` was left implicit.** Answered explicitly: they share the mechanism and not the trigger, and the part they share is the part `task-029` got right. Clearing `updated_at` and the backoff row before a fetch that then fails leaves a row that looks never-updated and re-schedules on every render; bypassing leaves the row alone and lets the fetch write whatever outcome it gets. This task reuses `request(subjects, { force: true })` unchanged. They differ in what selects the subjects, which is why the renderer sends an observation and not a list: it cannot know which subjects are waiting, or that a backoff is why a name is missing.

- **The captive portal deserved checking rather than hand-waving.** It is the obvious counter-example to classing an unreadable 200 as deterministic. Both endpoints are HTTPS, so an intercepting portal cannot answer for them without a certificate the transport rejects, which arrives as a network error and is already transient. A well-formed 200 carrying something unreadable is the far end misbehaving, which a link coming up does not fix. Recorded in the plan so the classification is not re-litigated from memory.

What changed in response: the trigger section rewritten around the renderer event with both rejected alternatives and the evidence for rejecting them; the `_requestedSubjects` finding added and the approach changed from clearing to issuing; the classification narrowed to the existing predicate and the four states that must not reset named as Non-Goals; the column dropped and the in-memory choice recorded with its residual under Risks; the noisy-transition bound added; the `task-029` question answered in its own subsection; the captive-portal check recorded; acceptance criteria 4, 5, 6 and 7 added so the negative half of each rule is driven beside its positive half.

Scope guard: two clients classify, one resolver holds a set and issues one forced read, one optional field on an existing request, one window listener. No schema statement changes, `ASSET_METADATA_DB_VERSION` stays at 1, no new channel, no new dependency, no timer, and nothing is surfaced to the user.

Outcome: Canonical task plan revised after critique and approved for build execution
