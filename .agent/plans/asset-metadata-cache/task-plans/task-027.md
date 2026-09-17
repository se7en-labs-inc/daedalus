## Task ID and Title

`task-027` — Manual QA across the three platforms.

## Why Chosen Now

Everything phases 1 to 5 built is in place and every automated check is green.
What no automated check reaches is the process boundary, the on-disk path, and
what a person sees on the first launch after an update. CI runs the suites on
Linux and on aarch64-darwin and the static checks on `x86_64-linux` alone, so no
job executes on Windows at all.

## Interaction Mode

`manual_execution`.

This environment is a WSL2 machine with no display, no macOS, no Windows, no
mainnet wallet and no funded selfnode. Nothing below can be run here, and the
deliverable of this task is therefore the procedure, the evidence each step must
produce, and a checklist an operator signs. **No step below has been executed.**

## Scope

Nine scenarios, on Linux, macOS and Windows, plus one selfnode scenario that
needs no second platform. The evidence each one produces, stated so that a person
who did not write this plan can tell a pass from a fail.

## Non-Goals

- No screenshots as the primary evidence. A screenshot proves a render; several
  of these scenarios are about what does **not** happen, and the evidence for
  those is a file on disk or a log line.
- No new automation. The e2e suite cannot execute: `spectron@14` resolves
  `electron-chromedriver@12` against Electron 41.3.0, and Cucumber is not in the
  check set.
- No change to any source file. If a scenario fails, it opens a defect; it does
  not get fixed inside this task.

## Dependencies

`task-018`, `task-023`, `task-024`, `task-025`.

## Research Consulted

- `asset-metadata-cache-prd.md:1482-1497`, the Manual QA list, which scenarios 1
  to 6 and 9 reproduce.
- `asset-metadata-cache-prd.md:1514-1517`, platform verification: the database
  path differs per platform and no CI job runs on Windows.

## Docs, Workflows, and Skills Consulted

- `README.md:165-184`, the mock token metadata server and how a developer run is
  pointed at it.

## Live Repo Findings Verified For Planning

1. **The database path is built from one export and one constant.**
   `assetMetadataDirectoryPath()` is
   `path.join(stateDirectoryPath, 'asset-metadata-cache')`
   (`source/main/assets/assetMetadataDb.ts:192-196`), and `stateDirectoryPath` is
   `launcherConfig.stateDir` (`source/main/config.ts:115-125`).
2. **The launcher sets `stateDir` per platform** at
   `nix/internal/launcher-config.nix:193-199`:
   `${XDG_DATA_HOME}/Daedalus/<network>` on Linux,
   `${HOME}/Library/Application Support/<spacedName>` on macOS, and
   `%APPDATA%\<spacedName>` on Windows. So the three paths to confirm are:

   | Platform | Expected |
   |---|---|
   | Linux | `~/.local/share/Daedalus/<network>/asset-metadata-cache/assets.sqlite` |
   | macOS | `~/Library/Application Support/<spacedName>/asset-metadata-cache/assets.sqlite` |
   | Windows | `%APPDATA%\<spacedName>\asset-metadata-cache\assets.sqlite` |

   With `assets.sqlite-wal` and `assets.sqlite-shm` beside it while the
   application is running, because the database opens in WAL mode.
3. **The log the evidence is read from is at `<stateDir>/Logs/pub/Daedalus.json`
   on Linux and macOS and `Logs\pub\Daedalus.json` on Windows**
   (`nix/internal/launcher-config.nix:210-213` and `:244`), and the file
   transport logs at `debug` (`source/main/utils/setupLogging.ts:30`), so every
   line these modules emit reaches it.
4. **The selfnode endpoint is chosen in code, not in configuration.**
   `nix/internal/launcher-config.nix:448-450` adds `metadataUrl` only when the
   network is not selfnode, so on selfnode `launcherConfig.metadataUrl` is
   absent. `assetRegistryClient.ts:97-107` therefore falls through to
   `${MOCK_TOKEN_METADATA_SERVER_URL}:${MOCK_TOKEN_METADATA_SERVER_PORT}` when
   `environment.isSelfnode`, and only then to the mainnet literal. If that branch
   were removed or reordered, a selfnode run would query the mainnet registry,
   and **the failure is silent**: mainnet answers a selfnode query with a
   perfectly well-formed response. Nothing else in this plan catches it.
5. **The port comes from the environment, defaulting to 0.**
   `source/main/config.ts:170-172` is
   `MOCK_TOKEN_METADATA_SERVER_PORT = process.env.MOCK_TOKEN_METADATA_SERVER_PORT || 0`,
   and `README.md:170-177` is the procedure for starting the server and passing
   the port.
6. **The mock registry knows one subject and it is editable.**
   `utils/cardano/native-tokens/registry.json` carries
   `789ef8ae89617f34c07f7f6a12e4d65146f958c0bc15a97b4ff169f1` as NiceCoin, ticker
   NCN. It has no `policy` field, so its decimals cannot verify and must not be
   applied. Its `logo` value decodes to the ASCII text "Almost a logo", which is
   not a raster image, so the image store refuses it on media type and no logo
   appears: that is the correct behaviour, not a defect.
7. **The cache directory is its own directory** precisely so that deleting it is
   the whole reset procedure, which is what scenario 6 exercises.

## Files Expected To Change

- `.agent/plans/asset-metadata-cache/asset-metadata-cache-tasks.json`
- the three review-log files for this task.

No source file changes. `source/main/assets/assetMetadataDb.ts` is the task
graph's target path because it is the module whose behaviour is under test, not
because it changes.

## Implementation Approach

The procedure below is the deliverable. An operator runs it, fills in the
checklist, and attaches the artifacts each step names.

### Corrections, 2026-09-17

A manual QA pass on 2026-09-17 ran this procedure against a live build. Four
steps were stale or unrunnable as written, and an operator following them would
have recorded correct behavior as a failure. The original wording is left in
place below; where it disagrees with this section, this section is what an
operator follows. Every claim here was re-verified against the tree at
`5bd24fee1`, and the strings against
`source/renderer/app/i18n/locales/en-US.json`.

**1. The rule that decides whether a published decimals value is applied.**
`task-046` moved the gate from the three-step `verified` verdict to attestation
alone. `attestedDecimals` returns `verifyRegistryProperty(...).attested`
(`source/main/assets/assetMetadataResolver.ts:162-170`), that single value is
written as the `attested` column (`:183`,
`source/main/assets/assetMetadataDb.ts:46`), and the figure is applied if and
only if it is true (`source/renderer/app/utils/assetDecimals.ts:52-76`, the
`registryDecimalsAttested === true` branch at `:68`). The registry's OPTIONAL
`policy` field is read nowhere on that path, so an entry that omits it applies
its decimals like any other.

There are four states rather than three:

| The registry entry | Token list and send form | Settings dialog |
|---|---|---|
| carries `policy`, `decimals` attested | issuer units | recommended value, no advisory |
| no `policy`, `decimals` attested | issuer units | recommended value, no advisory |
| `decimals` published, not attested | whole ledger units | the advisory; choosing the figure applies it |
| nothing published | whole ledger units | no advisory and no recommended value |

The first two rows behave identically. What no longer distinguishes them is anything an operator can see and anything
the cache stores: there is one verdict column, and it is the attestation
verdict.
What still distinguishes them is the registry entry itself.
`verifyRegistryProperty` continues to compute `bound`, `satisfied` and
`verified` (`source/main/assets/assetVerification.ts:446-451` and `:469-484`),
and an entry with no `policy` field is still reported as `bound: false, reason:
'absent'` (`:282-285`), but the resolver reads only `attested` and no surface
carries a positive binding marker. So the two are told apart by reading the
entry, not by using the application.

**2. Scenario 3 and the Preparation fixture list.** Scenario 3 expects a token
with published decimals and no `policy` field to show whole ledger units and its
settings dialog to say the figure could not be checked against the token's
minting policy. Both expectations are now wrong: that token applies its
decimals, and no such sentence exists. Run scenario 3 against the four states in
the table above.

The advisory belongs to the third state alone. It is
`assets.settings.dialog.unattestedDecimals` (`en-US.json:85`), shown when the
entry published a figure that is not attested
(`source/renderer/app/components/assets/AssetSettingsDialog.tsx:202-204`,
rendered at `:300-309`), and for a six-decimal token it reads: "This token’s
issuer publishes 6 decimal places. The issuer’s signature does not cover
that figure, so Daedalus does not apply it on its own. Choosing it here applies
it." The same rule drives the two pop-over strings,
`assets.warning.availableUnattested` (`:88`) and
`assets.warning.notUsingUnattested` (`:90`). All three carry typographic
apostrophes, not ASCII ones.

The fixture list asks for "one whose issuer published decimal places with no
`policy` field" expecting no application, which is now the wrong fixture for the
wrong reason. A not-attested token is the rare case worth naming, because an
operator will not find one by chance: of 120 registry mappings sampled for
`task-046` on 2026-09-16, 106 publish a decimals value and 104 of those are
attested, leaving 2. Real mainnet subjects, each re-verified against
`tokens.cardano.org/metadata/query` on 2026-09-17:

| State | Token | Subject | Published | Why this one |
|---|---|---|---|---|
| `policy` present, attested | TOOL | `2335a83c53865b1ab167d19c0fb1542da90c2bfbf67b06f59dd03099544f4f4c` | 6 decimals at sequence 0 | the `policy` field hashes to the subject's own policy id |
| attested, no `policy` | USDM | `c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d` | 6 decimals at sequence 0 | pinned as a fixture at `source/main/assets/registryEntry.fixture.ts:23` |
| published, not attested | MELD | `6ac8ef33b510ec004fe11585f7c5a9f0c07f0c23428ab4f29c1d7d104d454c44` | 6 decimals at sequence 1 | every property declares sequence 1 and every signature verifies at 0, so the attestation does not cover the declared value (`registryEntry.fixture.ts:102` and `:170`) |
| nothing published | any | a token the registry does not list | none | |

MELD is a stale edit and not an attack: someone bumped the sequence counter
without re-signing. The other of the two carries no signatures at all, so MELD
is the only case in that sample where a published value has signatures that do
not cover it.

A wallet holding these three specific tokens may not be practical to arrange.
The qualifying property is checkable without the application:

```
curl -s -X POST https://tokens.cardano.org/metadata/query \
  -H 'Content-Type: application/json' \
  -d '{"subjects":["<subject>"],"properties":["decimals"]}'
```

`policy` comes back as a top-level field of each subject whether or not it is
asked for, and `decimals` carries the declared `sequenceNumber` and the
signatures. Attestation is the signatures verifying over the declared value at
that sequence number, which is what the application computes.

**Scenario 4 inherits this.** It says to add "the token whose decimal places are
unresolved", which under the old rule was scenario 3's unverified token. That
token now formats, so scenario 4 must use the not-attested token or the unknown
one. Its label is unchanged:
`wallet.send.form.assetInput.rawUnitsLabel` (`en-US.json:1385`).

**3. Scenario 5's migration notice.** The notice no longer says "verified
decimal places". `wallet.tokens.decimalPlacesNotice` (`en-US.json:1559`) reads:
"For tokens whose decimal places an issuer has published and signed, amounts are
now entered in those units rather than in the whole units the ledger holds: one
and a half of a six-decimal token is now 1.5 and not 1500000. Balances for those
tokens are shown the same way. A decimal place setting you have chosen yourself
still overrides both." The rest of the scenario stands: the notice is shown only
to a profile that had already accepted the terms of use, and a profile being
created now has the flag written rather than left unset
(`source/renderer/app/stores/ProfileStore.ts:491-508`).

**4. Scenario 6 is not executable on Windows, and its evidence is wrong on every
platform.**

On Windows the deletion is refused while Daedalus runs, from Explorer and from
PowerShell alike, as the 2026-09-17 pass found. SQLite's Windows VFS opens the
database without `FILE_SHARE_DELETE`, so the handle blocks the unlink, and a
directory holding an open file cannot be removed either. The scenario was
written for POSIX semantics, where an open file can be unlinked. Record the
Windows column as platform-limited rather than as a failure. **There is no
Windows equivalent of the live case**: the operating system prevents the state
the scenario is about, so the property cannot be produced there at all. This
machine has no Windows and the refusal was not reproduced here.

Stopping Daedalus first and then deleting the directory is a different property,
startup recreation, and it must not be substituted for this one. Whether to
cover that property as a scenario of its own is a decision for the project
owner, listed at the end of this section.

The evidence this scenario asks for is also wrong on Linux and macOS, where the
deletion does succeed. Both named log lines are emitted from the
`AssetMetadataDatabase` constructor alone
(`source/main/assets/assetMetadataDb.ts:275-295`), which runs when a handle is
opened. Three handles are opened, all at process start
(`source/main/assets/assetMetadataResolver.ts:354`,
`source/main/assets/assetImageStore.ts:176`,
`source/main/ipc/assetMetadataChannel.ts:155`), and nothing reopens per request.
So neither line appears, and the directory is not recreated until the next
start, when `openHandle` creates it again
(`source/main/assets/assetMetadataDb.ts:247-248`).

Measured here on 2026-09-17, against Node 24.21.0 and the same `node:sqlite`
API the module uses: with a database open in WAL mode, deleting the directory
and all three files leaves reads and writes working through the open
descriptors, leaves a `wal_checkpoint(TRUNCATE)` succeeding, and leaves the
directory absent afterward. No statement fails, so no log line of any kind is
produced.

The corrected expectation on Linux and macOS: every row still renders, with its
fingerprint, its quantity and its ticker, because the renderer holds resolved
entries in memory for the session (`_metadata`,
`source/renderer/app/stores/AssetsStore.ts:97`, read by `details` at
`:154-158`). No crash, no error dialog, no log line, and the directory stays
absent. The deletion is invisible to the interface until the next start, which
recreates the directory with an empty cache.

**So the scenario cannot reach the code it was written to check, on any
platform.** The two log lines it asks for belong to a database that fails to
open, which is a startup condition. The only evidence a run of it produces is a
directory listing showing the cache absent while the application is still
serving a complete token list from memory.

**5. Scenario 2's recovery does not happen on its own, and the timing was
unstated.** Removing the two `hosts` lines while Daedalus runs recovers nothing
for as long as the operator stays on the token list, however long they wait.
Three facts together:

- The renderer asks for each subject once per session. `_resolveRenderedSubjects`
  filters against `_requestedSubjects` and adds every subject it asks for
  (`source/renderer/app/stores/AssetsStore.ts:306-314`), and that set is never
  cleared (`:112`).
- Nothing in the main process polls. There is no `setInterval` anywhere in the
  asset path, and the three `setTimeout` calls in it are a per-request wall-clock
  budget (`source/main/assets/httpTransport.ts:81`) and two in-call retry sleeps
  (`source/main/assets/assetRegistryClient.ts:238`,
  `source/main/assets/koiosClient.ts:290`). A backoff expiring is therefore not
  an event; it only stops refusing a request that something else makes.
- The recovery listener does not fire. It is
  `window.addEventListener('online', this._onConnectivityRestored)`
  (`AssetsStore.ts:139`), and editing `hosts` leaves the interface up and
  `navigator.onLine` true throughout, so no transition occurs.

What does recover, with its real timing:

| Action | When it resolves |
|---|---|
| "Check the token registry again" in the token's settings dialog (`assets.settings.dialog.refreshMetadata`, `en-US.json:83`) | immediately, for that one token |
| Restarting Daedalus more than five minutes after the failed attempt | on the next launch, for every held token |
| A real interface transition, such as disabling and re-enabling the adapter | immediately, for the subjects whose failure was recorded as caused by the network |

The five minutes is the first rung of the registry backoff.
`ASSET_REGISTRY_BACKOFF_BASE_MS = 5 * 60 * 1000`
(`source/main/assets/assetRegistryClient.ts:51`) is written into
`asset_resolution.retry_after` on the first failure (`:416-423`, stored at
`assetMetadataResolver.ts:563`), and `_due` refuses any subject whose
`retry_after` is still in the future (`:745-758`). A restart inside that window
therefore shows nothing either. The settings dialog refresh and the connectivity
retry both bypass the wait rather than clearing it
(`AssetsStore.ts:459-464` and `:340-342`, `assetMetadataResolver.ts:398-420`,
`:434-442`), which is why they are immediate. The connectivity set is held in
memory only (`:347`), so that path exists only in the session where the failures
happened.

The expectation for scenario 2 as written, staying on the list and touching
nothing, is that nothing changes. To observe resolution in place,
without navigating away, use the settings dialog refresh on one token: the row
arrives on the update channel and reaches a dialog that is still open.

**Checklist rows this changes.** Scenario 6 has no Windows column to tick:

```
6  Cache directory deleted             [  ]     [  ]     n/a (platform-limited)
8  Selfnode reaches the mock           withdrawn 2026-09-15
```

Row 8 is listed in the original checklist and in acceptance criterion 1 although
scenario 8 was withdrawn. Do not run it and do not tick it.

**Decisions these corrections raise.** Neither is settled here.

1. Scenario 6 has no Windows coverage and, on the two platforms where it runs,
   reaches neither of the log lines it was written around. The startup path does
   reach them and runs on all three platforms: with Daedalus stopped, stamp the
   file with a version it does not expect,
   `sqlite3 <cache>/assets.sqlite "PRAGMA user_version = 99"`, then start it.
   `openHandle` throws on the mismatch
   (`source/main/assets/assetMetadataDb.ts:256-259`), the constructor logs
   `Asset metadata cache: recreating the database`, removes the three files and
   reopens, and the cache is empty and working. That asserts a different
   property from a live deletion, so it is an addition to the plan rather than a
   repair of this scenario.
2. The checklist grid in the Verification Plan below, and acceptance criterion 1,
   both still count scenario 8 and count scenario 6 on three platforms. Reissuing
   them means editing sections this plan treats as stable once planning closed.
3. Item 7 adds a scenario 10 with no row in that grid and no mention in
   acceptance criterion 4, which binds a defect to a scenario number. A
   correction note beside the grid is the most this section can do under the
   append-only rule. Whether the grid gains a row is the project owner's call,
   and until it does, the signed artifact and the procedure disagree about how
   many scenarios there are.

**6. Scenario 4's expected result described a model that has since been
corrected.** Added 2026-09-17, after the QA pass. Scenario 4 says the field
"holds `1` after typing `1.5`". It does not, and did not: `react-polymorph`
refuses the separator by reverting to the previous value, so the following `5`
appends and the field holds `15`. The pre-existing spec asserted `1` because its
helper re-supplied each cumulative string to a component that had already
reverted the character, and `task-047` corrects both the helper and the
behavior.

The current expectation, and what an operator records:

- Typing `1`, `.`, `5` leaves `15` in the field and raises a notice under it,
  `wallet.send.form.assetInput.separatorRefusedNotice`, naming the unit and
  saying every digit counts as one whole unit.
- Pasting `1.5` leaves the amount unchanged and raises the same notice. Before
  `task-047` the paste was silent, so an operator checking only that the amount
  did not move would have passed it.
- The notice stays up while the row remains in raw units, and is withdrawn only
  when the row's denomination resolves.
- Typing `15` with no separator raises nothing. That is the case that
  distinguishes a notice about the separator from a notice about the field.

A failure here still stops the release. The amount is wrong by a factor of ten
where decimals are unresolved. Where the user has overridden a token to zero it
is worse by a further factor of the published decimal count less one: for a
six-decimal token, 1.5 means 1,500,000 raw units and the field submits 15, a
factor of a hundred thousand. That matches the figure already recorded against
`task-003` in the tasks JSON.

**7. No scenario covers a metadata source that fails and then recovers.** Added
2026-09-17. **Run this as scenario 10.** The Verification Plan grid below lists
rows 1 to 9 and carries no row for it, and acceptance criterion 4 ties a defect
to its scenario number, so without one an operator can complete and sign every
row without ever running this step. Adding the row means editing a section this
plan treats as stable once planning closed; that is decision 3 at the end of
this section. Scenario 1 blocks the hosts and scenario 2 unblocks them, but
scenario 2's expectation was written as though resolution resumes, and finding
`10` establishes that it does not. The expected result has to be stated as the
absence of recovery, or an operator will score the current behavior as a pass
either way.

Run it as its own step, after scenario 2:

- With the two hosts still blocked and the application still running, confirm no
  token has resolved.
- Remove the `hosts` lines. Do not restart, and do not touch any token's
  settings. Leave the token list open for at least ten minutes.
- **Expected: nothing resolves.** No ticker, no logo, no decimal places. The
  renderer names each subject once per store instance and never again
  (`source/renderer/app/stores/AssetsStore.ts:112`, `:309`, `:312`), and editing
  `hosts` fires no `online` event because the interface never dropped.
- Then press "Check the token registry again" on one token. That token, and only
  that token, resolves.
- Then relaunch. Everything resolves.
- **Evidence:** the token list at each of those four points, and a note of the
  wall-clock gap between removing the `hosts` lines and the first screenshot.

Recording this as a pass on the strength of the relaunch would hide the defect
finding `10` describes, which is why the intermediate steps are listed
separately rather than as one before-and-after.

### Preparation, once per platform

- A release build, not a development run, except where a step says otherwise.
  `yarn package` produces the installer; the scenarios are about what a user
  gets.
- A wallet holding tokens covering the four states in items 1 and 2 above,
  plus one whose issuer published a logo. The list below is the old rule's fixture set
  and its second item expects a behavior that no longer occurs.
- A wallet holding at least four tokens: one whose issuer published decimal
  places bound to the minting policy, one whose issuer published decimal places
  with no `policy` field, one the registry has never heard of, and one whose
  issuer published a logo.
- On this development machine only, Electron needs
  `ELECTRON_DISABLE_SANDBOX=true`, exported in the shell profile rather than in
  `.envrc`, which is tracked.

### Scenario 1 — First run, empty cache, metadata sources unreachable

Do **not** disconnect the network. An earlier revision of this scenario said to,
and that was wrong: the node cannot sync without it, and every other scenario
needs a synced node. Full disconnection also breaks the chain reader and the
pointer channel at the same time, so a pass would prove less than it appears to.

Block the two metadata hosts instead, which isolates the path this scenario is
about and leaves the node, its relays and the chain database working.

| Platform | Edit |
|---|---|
| Windows | `C:\Windows\System32\drivers\etc\hosts`, as administrator |
| Linux, macOS | `/etc/hosts`, as root |

```
127.0.0.1 tokens.cardano.org
127.0.0.1 api.koios.rest
```

Confirm the cache does not exist before starting. On a profile that has never run
a build carrying this work there is nothing to delete, which is the expected
state rather than a missed step.

Start Daedalus and open the token list, the wallet summary, the send form and the
transaction list.

**Expected:** every held token has a row, immediately. Each row shows its
fingerprint and its quantity in whole ledger units. No spinner appears on any of
the four surfaces at any point. No error dialog. The list is complete rather than
shorter than the wallet's holdings. No token shows a ticker, because nothing can
resolve.

**Three failures this scenario exists to catch:** a spinner, which would mean
something still gates rendering on metadata; a list shorter than the holdings,
which would mean row identity still comes from the metadata lookup rather than
from the token itself; and any ticker at all, which would mean something resolved
that could not have.

**Evidence:** a screenshot of the token list showing a row per holding, and the
log filtered for `Asset metadata: query failed`, which should appear, because
being unreachable is a state rather than an error.

### Scenario 2 — The same wallet, online

**Corrected 2026-09-17, item 5 above: the expectation below is misleading about
timing. Nothing resolves while the list is left untouched.**

Remove the two `hosts` lines without restarting Daedalus. Stay on the token list.

**Expected:** tickers and formatted amounts appear in place. The list does not
blank, remount or reorder wholesale, and no row disappears while it resolves.

**Evidence:** a screenshot before and after, taken without navigating away.

### Scenario 3 — Three tokens side by side

**Corrected 2026-09-17, items 1 and 2 above: the three categories below are the
old rule. Run the four states in the table.**

With the cache warm, look at the verified token, the unverified token and the
unknown token in the token list and then in the send form.

**Expected:**

- The verified token shows its amount with the issuer's decimal places applied.
- The unverified token shows its amount as whole ledger units. Opening its
  settings dialog shows the sentence naming the published figure and saying it
  could not be checked against the token's minting policy.
- The unknown token shows its fingerprint and whole ledger units, and its
  settings dialog shows no such sentence, because nothing was published.

**Evidence:** a screenshot of the three rows together and one of the settings
dialog for the unverified token.

### Scenario 4 — The send form refuses a decimal it cannot interpret

**Corrected 2026-09-17, item 2 above: use the not-attested token or the unknown
one. The attested-but-unbound token now formats.**

Open the send form, add the token whose decimal places are unresolved, and try to
enter `1.5`, first by typing and then by pasting. Repeat with a comma as the
separator and with a grouped value such as `1,500,000`.

**Expected:** the field holds `1` after typing `1.5`, and rejects the paste
outright. The label under the field says the amount is entered as a whole number
of the token's units and that its decimal places are unknown.

**Evidence:** a screenshot of the field and its label after each attempt. This is
one of the two send-path safety rules; a failure here is a defect of the highest
severity in this plan and stops the release.

### Scenario 5 — The migration notice

**Corrected 2026-09-17, item 3 above: the notice says “published and signed”,
not “verified decimal places”.**

Install the previous release, create or restore a wallet holding tokens, accept
the terms of use, and close. Install this build over it. Start Daedalus and open
the token list.

**Expected:** the notice appears once, above the list, and says that amounts for
tokens with verified decimal places are now entered in those units, with the
example. Dismiss it. Navigate away and back: it does not return. Restart
Daedalus: it does not return.

Then, on a profile created **after** installing this build, open the token list:
the notice never appears, because a profile created now has no habit to correct.

**Evidence:** a screenshot of the notice, a screenshot of the same screen after a
restart, and a note of which profile each was taken in.

### Scenario 6 — The cache directory deleted underneath a running application

**Corrected 2026-09-17, item 4 above: not executable on Windows, and the
expected evidence below is wrong on every platform.**

With Daedalus running and the token list open, delete the whole
`asset-metadata-cache` directory. Navigate away from the token list and back.

**Expected:** every row still renders, with fingerprints and quantities. No
crash, no error dialog. Tickers may be gone until they are fetched again, and
they come back.

**Evidence:** the log filtered for
`Asset metadata cache: unavailable, answering as empty` or
`Asset metadata cache: recreating the database`, plus a screenshot of the list
after the deletion, plus a directory listing showing the directory has been
recreated.

### Scenario 7 — The database path

On each platform, with Daedalus running, list the directory from finding 2.

**Expected:** `assets.sqlite` exists at the documented path, with
`assets.sqlite-wal` and `assets.sqlite-shm` beside it while the application is
running. Windows is the one no contributor exercises daily and is the one most
likely to disagree.

**Evidence:** the full path as printed by the platform's own directory listing,
pasted into the checklist. Not a screenshot of a file manager: the path is the
artifact.

### Scenario 8 — Selfnode — WITHDRAWN

Withdrawn on 2026-09-15: selfnode is scheduled for removal, so exercising the
selfnode path is effort spent on a target that is going away. The scenario is
recorded as withdrawn rather than deleted, because the failure it looked for is
real and silent while selfnode still ships: `launcher-config.nix:448-450` omits
`metadataUrl` on selfnode, so a wrong endpoint answers plausibly from mainnet.
If selfnode removal stalls, this scenario comes back.

### Scenario 9 — The logo

With a wallet holding a token whose issuer published a PNG logo, open the token
list and scroll it.

**Expected:** the logo appears in the row header at a fixed size. A row whose
issuer published no logo looks exactly as it did before this change, with no
placeholder and no broken-image mark. Scrolling the list does not make the logo
flicker or reload.

**Evidence:** a screenshot of a list containing both kinds of row.

## Acceptance Criteria

1. Every scenario passes on Linux, macOS and Windows, except scenario 8, which is
   run once on any platform.
2. The database appears at the documented path on each platform, recorded as the
   path itself rather than as a screenshot.
3. The checklist below is completed and signed, with the build identifier and the
   date, and the evidence each step names attached.
4. Any failure is opened as a defect with its scenario number, before the
   checklist is signed.

## Verification Plan

The checklist is the verification. It is filled in by the operator and is what
makes the claim checkable afterwards by someone who was not there.

```
Asset metadata cache — manual QA
Build:            ____________________   Date: ____________
Operator:         ____________________

                                    Linux    macOS    Windows
1  Cold cache, offline               [  ]     [  ]     [  ]
2  Resolving in place, online        [  ]     [  ]     [  ]
3  Verified / unverified / unknown   [  ]     [  ]     [  ]
4  Send form refuses a decimal       [  ]     [  ]     [  ]
5  Migration notice, once            [  ]     [  ]     [  ]
6  Cache directory deleted           [  ]     [  ]     [  ]
7  Database path                     [  ]     [  ]     [  ]
9  Logo in the row header            [  ]     [  ]     [  ]

8  Selfnode reaches the mock         [  ]  (once, platform: __________ )

Database path observed
  Linux    ______________________________________________
  macOS    ______________________________________________
  Windows  ______________________________________________

Defects opened (scenario number and issue reference)
  ____________________________________________________________

Signed: ____________________
```

**Corrected 2026-09-17:** row 6 has no Windows column, row 8 is withdrawn, and
item 7 of the corrections adds a scenario 10 that has no row here. Tick it
separately, or the signed grid will not record whether it ran.
The corrected rows are at the end of the corrections section above.

## Risks and Open Questions

- **This task cannot be completed by an agent and must not be recorded as
  passing.** Its status in the task graph is `blocked`, with the reason stated,
  until an operator returns a signed checklist.
- **Scenario 5 needs the previous release**, which means an operator who can
  install two builds in sequence on each platform. It is the longest step and the
  one most likely to be skipped; it is also the only check of a notice that can
  only ever be shown once per profile.
- **Scenario 8 needs a selfnode cluster and a funded wallet**, which is a
  developer setup rather than a QA one. It can be run by whoever is running
  selfnode for another reason, and it takes a few minutes once the cluster is up.
- Nothing here needs a decision from the project owner beyond assigning an
  operator.

## Required Docs, Research, and Tracking Updates

- `asset-metadata-cache-tasks.json`: `task-027.status` to `blocked` with the
  reason, and its `implementationNotes` extended with the selfnode scenario and
  the evidence each step produces.

## Review-Log Paths

- `.agent/plans/asset-metadata-cache/task-plans/task-027-plan-review.md`
- `.agent/plans/asset-metadata-cache/task-plans/task-027-impl-review.md`

## Planning Status

approved

## Build Status

blocked — the procedure is complete and no step has been executed. An operator
with Linux, macOS and Windows returns the signed checklist.

## Current Outcome

A procedure a person can follow, with a pass condition for each step that does
not depend on having written it.

## Final Outcome

Pending an operator.

## Self-Review

The temptation in a task like this is to run what can be run here, report those
steps as passing, and leave the rest implied. None of it can be run here: there
is no display, no second platform, and no wallet. Recording any of it as done
would put a claim into the record that nobody checked, which is worse than an
empty checklist. The scenario worth defending is the eighth: it is not on the
PRD's list, it catches a failure that produces a plausible-looking result, and
nothing else in this plan would notice.
