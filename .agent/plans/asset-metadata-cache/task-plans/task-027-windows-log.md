# task-027 and task-038: Windows operator log

Status: Partial. Not a signed checklist.
Build under test: `5bd24fee1` for the first sitting, `a873ab271` for the second
Platform: Windows 10.0.26200, Daedalus 11.3.0, mainnet
Dates: 2026-09-16 and 2026-09-17
Operator: project owner

## What this document is, and is not

An exploratory pass was run by the project owner across both plans on the dates
above. It found five defects and produced findings `10`, `11` and `12` plus
`task-047`. It was not run against the checklists, so it captured the evidence a
defect needs and not the evidence a signed row needs.

This log exists so that work is not lost and not overstated. **No row below is
marked as passed on the strength of it.** Where a scenario's property was
observed but its required artifact was not captured, that is recorded as
observed-without-evidence, which is a different state from passed and from not
run.

The distinction matters because both plans' acceptance criteria turn on a signed
grid, and a grid ticked from this document would assert evidence that does not
exist.

## task-027, Windows column

| # | Scenario | State | What was observed | What a signed row still needs |
|---|---|---|---|---|
| 1 | Empty cache, sources unreachable | observed, evidence incomplete | With both hosts blocked: every holding had a row, fingerprints and decoded names, raw 0-decimal quantities, no tickers | The four surfaces individually (token list, wallet summary, send form, transaction list), the absence of a spinner on each, and the log filtered for `Asset metadata: query failed` |
| 2 | The same wallet, online | superseded | Hosts lines removed, nothing resolved | Rewritten by correction item 5; the expectation is now that nothing resolves. Run as scenario 10 below |
| 3 | The token states side by side | not run | The sitting diverged into finding `11` | The four states from correction item 1, on one screen, plus the settings dialog for the not-attested state |
| 4 | Send form refuses a decimal | **failed, then fixed** | Typing `1`, `.`, `5` produced `15`. Pasting `1.5` was refused silently | Re-run against `e2abbdd75` or later. Expectation is correction item 6, including the discriminating case: typing `15` with no separator must raise nothing |
| 5 | Migration notice | not run | — | The previous release installed first, then this build over it, then a second profile created after |
| 6 | Cache directory deleted while running | not applicable | Windows refused the delete from Explorer and PowerShell; the database is held open | Nothing. Correction item 4 records that there is no live Windows equivalent |
| 7 | Database path | observed, evidence incomplete | The files are present | The path as text from a directory listing. The artifact is the path, not its existence |
| 9 | Logo in the row header | observed on an earlier build | Scrolling rapidly at a reduced window height kept every loaded logo stable, no flicker and no reload | Re-run on `a873ab271` or later, where all ten logos load rather than three. The earlier observation covered three |
| 10 | A source that fails and recovers | observed, evidence incomplete | Hosts lines removed and nothing resolved, which is the corrected expectation | The four numbered points of correction item 7: the ten-minute hold, the per-token refresh resolving exactly one token, the relaunch resolving everything, and the wall-clock gap |

Scenario 8 is withdrawn.

## task-038, Windows column

| # | Scenario | State | What was observed |
|---|---|---|---|
| 1-5 | The settings surface and custom addresses | observed, evidence incomplete | The three options are present and the third is disabled. The pass produced finding `12`: neither service can be switched off, and the warning names only the pointer index |
| 6-9 | NFT naming, a lying index, offline with a warm cache, a late mint | not run | Scenarios 9 and 10 need a mock backend that does not exist yet |

Scenario 10 is withdrawn.

## Why the remaining platforms are not blocked on a display

Recorded here because the tasks' blocked reason said otherwise until 2026-09-17.

This machine has a display through WSLg (`DISPLAY=:0`, `/mnt/wslg` present) and a
19 GB preprod chain at `~/.local/share/Daedalus/preprod/chain`, synced to chunk
06091. What it does not have is a mainnet chain, a wallet, or any way to build
the four token states task-027 needs: those depend on `tokens.cardano.org`
entries, and the preprod registry carries effectively none, so constructing them
means minting tokens and getting metadata merged upstream.

So the Linux column is blocked on fixtures rather than on the GUI, and the macOS
column is blocked on the platform. Neither is blocked on anything this session
can remove.
