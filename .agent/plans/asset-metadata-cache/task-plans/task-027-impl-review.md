Implementation: Iteration 1
Timestamp: 2026-09-15T19:25:00Z

**No scenario in this task has been executed.** The deliverable is the procedure,
the expected evidence and the operator checklist, which is what the task-plan
readme requires of a `manual_execution` task.

Changes made:
- `.agent/plans/asset-metadata-cache/task-plans/task-027.md`: nine scenarios, the
  per-platform path table, and the checklist.
- `.agent/plans/asset-metadata-cache/asset-metadata-cache-tasks.json`:
  `task-027.status` to `blocked`, with the reason, and its implementation notes
  extended.

Files touched:
- the three review-log files for this task
- `.agent/plans/asset-metadata-cache/asset-metadata-cache-tasks.json`

No source file changed.

What was verified here, because a procedure written from the PRD rather than from
the repository is how an operator ends up looking in the wrong directory:

- The three database paths were derived from
  `nix/internal/launcher-config.nix:193-199` and
  `source/main/assets/assetMetadataDb.ts:192-196` rather than copied from the
  PRD's table, and they agree with it.
- The log path and level were checked:
  `nix/internal/launcher-config.nix:210-213` and `:244` give
  `<stateDir>/Logs/pub`, and `source/main/utils/setupLogging.ts:25,30` name the
  file and set the file transport to `debug`, so every line these modules emit
  reaches it. Without that, half the evidence in the procedure would not exist.
- The exact log strings an operator greps for were taken from the source:
  `Asset metadata: query failed`,
  `Asset metadata cache: unavailable, answering as empty`,
  `Asset metadata cache: recreating the database` and
  `Asset registry: request refused`.
- The selfnode branch was read at `assetRegistryClient.ts:97-107` and the
  configuration that makes it necessary at
  `nix/internal/launcher-config.nix:448-450`.
- The mock registry's single subject was read from
  `utils/cardano/native-tokens/registry.json`: no `policy` field, and a `logo`
  value that base64-decodes to the ASCII text "Almost a logo". Both produce
  behaviour an operator would otherwise report as a defect, and both are called
  out in the scenario.
- `MOCK_TOKEN_METADATA_SERVER_PORT` defaults to 0 (`source/main/config.ts:170-172`)
  and the procedure for setting it is `README.md:165-184`.

Checks: none run, because nothing outside `.agent/` changed. `git diff` over
`source`, `storybook`, `tests`, `package.json` and `yarn.lock` is empty.

Deviations from the approved plan:
- None.

Outcome: Procedure complete; execution pending an operator

Review of Iteration 1
Timestamp: 2026-09-15T19:30:00Z

Acceptance criteria, against the evidence:

1-4. **None of them are met, and none of them can be met here.** They are the
   operator's to meet. What this iteration is reviewed against instead is the
   `manual_execution` requirement from the task-plan readme: the plan must
   produce the exact procedure and expected evidence for an operator to finish
   it. It does, for nine scenarios, each with a pass condition and a named
   artifact.

The judgement worth naming is the eighth scenario. It is not on the PRD's Manual
QA list, and it is the only one that catches a failure which looks like a
success: with the selfnode branch removed, a selfnode run queries the public
registry and gets a well-formed answer for a subject that does not exist there,
so nothing appears wrong. It needs a discriminator rather than an observation,
and the discriminator is a ticker in the mock that no real issuer publishes,
checked a second time with the mock stopped.

The second judgement is the evidence. Four of the nine scenarios assert that
something does not happen: no spinner, no error dialog, no notice on the second
run, no ticker with the mock stopped. A screenshot is weak evidence for an
absence, so those steps ask for a log line, a directory listing or a second
screenshot of the same view under the opposite condition.

The status is `blocked` rather than `pending` or `completed`. `pending` reads as
not started, which understates a procedure that is ready to run; `completed`
would be false. Anything downstream that reads the graph now sees why it cannot
proceed and what would unblock it.

Decision: approved as a procedure. The task itself remains open until a signed
checklist comes back.

Implementation: Iteration 2
Timestamp: 2026-09-17T18:34:00Z

A manual QA pass on 2026-09-17 ran the procedure against a live build and four
steps did not survive contact with it. **No scenario has been executed here
either.** This iteration corrects the procedure.

What iteration 1 got wrong, and why:

- **Scenario 3 and the fixture list encode a rule that `task-046` replaced.**
  Iteration 1 was written when applying a registry decimals value required
  `bound && satisfied && attested`, so it treated an entry with no `policy`
  field as unverifiable and told the operator to expect whole ledger units and
  an advisory about the minting policy. The gate is now `attested` alone
  (`source/main/assets/assetMetadataResolver.ts:162-170,183`,
  `source/renderer/app/utils/assetDecimals.ts:68`), so that token applies its
  decimals and the advisory does not appear. Finding 6 of the plan says the mock
  registry's decimals "cannot verify and must not be applied" because the entry
  has no `policy` field, and that reasoning no longer holds. The mock entry is
  refused for two other reasons: it carries no signatures on any property, and
  it publishes no `decimals` property at all. Its decimal count sits in the
  legacy `unit.value.decimals` object
  (`utils/cardano/native-tokens/registry.json`), and only the `decimals`
  property is read (`assetMetadataResolver.ts:107-113`, queried at
  `assetRegistryClient.ts:19-25`). So the mock token is the "nothing published"
  state rather than the not-attested one, which is why a real subject is needed
  as the not-attested fixture.
- **Scenario 5 quoted a string that was rewritten in the same task.** The notice
  says "published and signed" (`en-US.json:1559`).
- **Scenario 6 assumed POSIX unlink semantics.** It cannot run on Windows, and
  its evidence was wrong on Linux and macOS too, which iteration 1 did not
  catch because it took the two log strings from the source without checking
  where they are emitted from. Both come from the database constructor
  (`source/main/assets/assetMetadataDb.ts:275-295`), which runs at process
  start and not per request, so neither can appear in response to a deletion
  during a run.
- **Scenario 2 implied prompt recovery and named no mechanism.** Editing `hosts`
  fires no `online` event, the renderer asks for each subject once per session,
  and nothing polls, so the scenario as written recovers nothing at all. The
  operator who waited and saw nothing was seeing correct behavior.

Form used: the readme makes `task-NNN.md` stable once planning closes and says a
correction is a new entry rather than an edit to the original. So nothing was
reworded or removed. A dated `### Corrections, 2026-09-17` subsection was added
at the head of `## Implementation Approach`, before the preparation step, and
each affected scenario, the fixture list and the checklist gained a one-line
pointer to it. The diff over this file's plan is insertions only.

Two things beyond the four reported, both found while checking them:

- Scenario 4's fixture is stale by implication. It says to use "the token whose
  decimal places are unresolved", which under the old rule was scenario 3's
  unverified token. That token now formats, so the send-path safety rule would
  be exercised against a token that is allowed to accept a decimal. The
  corrections section points it at the not-attested or the unknown token.
- The checklist grid and acceptance criterion 1 still count scenario 8, which
  the plan body records as withdrawn on 2026-09-15. The withdrawal was written
  into the scenario and not into the two places that schedule it.

What this iteration did not touch, because another agent owns it:

- `asset-metadata-cache-tasks.json`. `task-027.implementationNotes` describes
  the verified/unverified/unknown split and the fixture that expects no
  application, and needs the same correction as scenario 3. The status stays
  `blocked`.
- The PRD's Manual QA list at `asset-metadata-cache-prd.md:1482-1497`, which
  scenarios 1 to 6 and 9 reproduce, and goal three's advisory description at
  `:1262-1286`.

Checks: none run, because nothing outside `.agent/` changed. `git diff` over
`source`, `storybook`, `tests`, `package.json` and `yarn.lock` is empty.

Deviations from the approved plan:
- None. The plan's own non-goal of changing no source file is unaffected.

Outcome: Procedure corrected; execution still pending an operator

Review of Iteration 2
Timestamp: 2026-09-17T18:40:00Z

Every citation in the correction brief was re-derived from the tree at
`5bd24fee1` rather than taken on trust, and two of them did not hold.

**The brief's account of scenario 2's recovery was wrong in the same direction
as the scenario it was correcting.** It gave the recovery as the backoff
expiring, within five minutes, or immediately on a manual registry sync. The
backoff expiring is not an event: `ASSET_REGISTRY_BACKOFF_BASE_MS`
(`assetRegistryClient.ts:51`) is a gate consulted by `_due`
(`assetMetadataResolver.ts:745-758`) when something asks, and nothing asks. The
renderer asks once per subject per session (`AssetsStore.ts:306-314`, the set at
`:112`) and no timer exists in the resolver. There is also no manual registry
sync; there is a per-token control in the settings dialog, "Check the token
registry again" (`en-US.json:83`), which forces a read for that one subject. So
the corrected expectation is stronger than the brief's: waiting changes nothing,
and the operator must act on one token or restart.

**Scenario 6's evidence was wrong on every platform, not only on Windows.** The
brief treated this as a Windows portability problem. The deletion does succeed
on Linux and macOS, but neither named log line can appear, and the directory is
not recreated until the next start, and the rows keep their tickers because the
renderer holds them in memory (`AssetsStore.ts:97`, `:154-158`). A pass on Linux
against the original evidence list would have been recorded as a failure too.

The deletion was reproduced here on 2026-09-17, against Node 24.21.0 and the
same `node:sqlite` API the module uses, because the first draft of this
correction asserted that a statement against the removed file would fail and log
`Asset metadata cache: write failed`. It does not. With the database open in WAL
mode, removing the directory and all three files leaves reads, writes and a
`wal_checkpoint(TRUNCATE)` all succeeding through the open descriptors, and
leaves the directory absent. So the scenario reaches neither of the two log
lines it was written around, on any platform, and the only artifact a run of it
produces is a directory listing taken while the application is still serving a
complete token list from memory. The startup path is the one that reaches those
lines, and it is now written out as a decision rather than folded into this
scenario.

The fixture work is the part most likely to be skipped, and it is the part that
costs an operator the most time, so MELD is named with the reason it refuses,
and USDM and TOOL are named for the two states that now behave alike. All three
were re-verified against `tokens.cardano.org/metadata/query` on 2026-09-17 by
reproducing the attestation payload and the policy digest outside the
application, and the two that are pinned as repo fixtures agree with
`source/main/assets/registryEntry.fixture.ts`.

What this correction does not establish: no scenario has been run, on any
platform, and the Windows refusal is reported from the operator's pass rather
than reproduced here, because this machine has no Windows. The corrected
scenario 6 asserts what the code does on a deletion; whether a real Windows
build refuses the deletion in every shell an operator might reach for is the
operator's observation and is recorded as such.

Decision: approved as a corrected procedure. The task stays `blocked` until a
signed checklist comes back, and two decisions listed in the corrections section
are the project owner's: whether to add a startup-recreation scenario for the
property Windows cannot cover live, and whether to reissue the checklist grid
and acceptance criterion 1.
