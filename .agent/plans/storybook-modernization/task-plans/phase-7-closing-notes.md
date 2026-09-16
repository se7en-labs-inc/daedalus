# Phase 7 closing notes

Status: complete. Opened at `task-050`.

Every reachable screen in the application now has a story that mounts its real container. Forty-nine
story files, 129 stories, and the 258-pair component label set untouched from phase 3 through to here.

## What the phase was gated on, and what the gate found

`task-050` existed to answer one question before twenty more screens were committed to: does an
override shape sized for a settings screen hold for `WalletSummaryPage`, which reads about
twenty-five fields across nine stores and throws outright without an active wallet.

It holds. Each of its four stories names two stores at most, because the other seven carry defaults
built over the five tranches before it, and all four states rendered on the first attempt.

The counterfactual: the same task would have failed two commits earlier, with a hard throw at
`WalletSummaryPage.tsx:119`, and the defect responsible was found in the chrome tranche by a top bar
story that merely looked wrong.

## The instrument reported on something other than what it appeared to measure

`StoryProvider` spread its own fixtures at the same level as a story's overrides, so a story naming
`wallets` to set one flag silently lost the active wallet the provider supplies. The screen still
rendered. It rendered a real state of the application, just not the one the story asked for, and
nothing in the output said a fixture had been discarded.

It was caught because a story asserted that something was on the page and got nothing. That is the
weakest assertion in the spec. It is the third time in two phases that it has been the one to fire:
the general settings screen blanking on a failed locale write, the news fixtures producing empty
collections, and this.

The harness now carries nine fixture modules, six of them added in this phase, and every screen
story in the corpus draws on the same three merge layers. A defect in any shared fixture produces
plausible screens across every story that touches it, and the assertions that would catch it are the
ones about presence rather than correctness. Two habits follow from that, and both are already in
place rather than proposed:

- Where the application derives one value from another, the fixture derives it too. Wallet tokens are
  exported with the assets that resolve them, because a half-supplied join is a permanent loading
  state rather than a gap. The DRep cohort is drawn from the directory population by the
  application's own selection, because two independent lists let a story show a suggested DRep absent
  from its own directory.
- Where a fixture departs from what the real store initializes to, it says so at the point of
  departure. There are four such departures: `networkStatus` settled rather than cold, `backend`
  ready rather than starting, the stake pool list-view tooltip dismissed rather than shown, and the
  Catalyst fund present rather than absent.

## The harness reads shapes from the application and values by transcription

Four constants are now copied into the harness with the line they came from rather than imported:
the loading phases, the transaction filter defaults, the governance refresh states, and the empty
filter options. All four live in store modules, and importing any of them would pull that module and
its transitive imports into the harness graph.

That is not a hypothetical cost. `WalletReceiveDialog.tsx:3` imports `HardwareWalletsStore`, and the
consequence is that rendering a display component pulls in `@trezor/connect`, its `@noble`
dependencies and a USB protocol library. `screens/harness.spec.ts` asserts the property directly for
both the stories and the harness, ignoring type-only imports, which are erased.

So the rule the harness follows, and the one phase 8 should write down: take shapes from `config/`,
`domains/` and `components/`, and take values from `stores/` only by transcription with a citation.

## The test environment was its own source of failures

Nothing in a container's render body predicts this, so no amount of reading them finds it in advance.
Five environment gaps were closed across the two phases, each once:

| Gap | Effect before |
|---|---|
| jsdom has no canvas | `lottie-web` writes to a 2d context at import, so the syncing screen could not be imported |
| jsdom omits `TextEncoder` | `@noble/hashes` calls it at import, so the receive screen could not be imported |
| `@trezor` and `@noble` are ESM only | the same, one layer further out |
| `lodash-es` is ESM only | the stake pool list could not be imported |
| webpack resolves images and markdown to URLs | the display settings and terms screens died on a PNG header |

All five are properties of the checking environment rather than of the code, and all five are fixed
where they belong rather than routed around with a stub standing in for the real module.

## What a tranche cost, at wallet and staking scale

| Tranche | Screens | Story lines | Per screen | Harness work first |
|---|---|---|---|---|
| 6, wallets | 9 | 596 | 66 | six store members, two of jest's settings |
| 7, staking | 6 | 382 | 63 | one store, one transform rule |
| 8, governance and voting | 5 | 356 | 71 | two stores, and nothing mid-tranche |

Per-screen cost did not rise with the number of fields a screen reads. It rose slightly with the
number of states a screen has, which is what the phase 6 measurements already showed. Tranche 8 needed
no harness change once its fixtures existed, which is the first roster of five or more where that was
true.

## What is not covered, and why

Named rather than left as gaps a reader has to notice:

- Seven stories assert that they throw at `LogosDisplay.componentDidMount`, which dereferences an
  unguarded `document.querySelector` on a generated class name. They move into the mounted set the
  day a guard lands, because the assertion fails then.
- The staking shell's countdown branch. The store computes it from Shelley still being pending.
- The DRep directory's refreshing state, which differs from loaded by a toolbar spinner.
- The DRep detail page's rejected fetch. A fixture whose promise rejects surfaces as an unhandled
  rejection in the spec rather than as a rendered failure state.
- The stake pool list's first-run tooltip, which anchors to a ref filled in after mount and measures
  against a document jsdom gives no layout to.

The last two are limits of the check rather than of the screens, and both would be recoverable if the
render check ever ran in a browser.

## The corpus, as it stands

- 49 screen story files, one per reachable screen, asserted mechanically rather than counted by hand.
- 129 stories, sorted into four outcomes that sum to it: 113 put content on the page, 6 render nothing
  by design, 3 render a frame with no text, and 7 throw at a named line with the message asserted.
- 2,191 lines of harness across nine fixture modules, a store map, a request shape and a screen frame.
- 258 component label pairs, unchanged since phase 3, read from `index.json` of a real build.
