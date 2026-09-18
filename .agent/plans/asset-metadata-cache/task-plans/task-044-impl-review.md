Implementation: Iteration 1
Timestamp: 2026-09-15T19:55:00Z

Changes made:
- `source/renderer/app/components/wallet/tokens/wallet-token/WalletTokenHeader.tsx`:
  the image request's condition changed from `hasImage` to
  `source === 'registry'`, with the effect keyed on the new condition and the
  reason for it, including the foreign key, written at the site.
- `WalletTokenHeader.spec.tsx`: four cases became six, rewritten around the
  condition rather than around the flag.
- `assetMetadataChannel.realfs.spec.ts`: one case for the ordering between the
  two handlers.

Files touched:
- the one source file and two specs above
- `.agent/plans/asset-metadata-cache/task-plans/task-044.md`
- `.agent/plans/asset-metadata-cache/task-plans/task-044-plan-review.md`
- `.agent/plans/asset-metadata-cache/task-plans/task-044-impl-review.md`
- `.agent/plans/asset-metadata-cache/asset-metadata-cache-tasks.json`

**Which link was broken.** The defect report asks for a diagnosis before a fix,
so here it is with what settled each step, all driven against a real database
file and a stubbed transport:

| Link | Answer |
|---|---|
| Is the on-demand fetch issued at all? | No. `WalletTokenHeader.tsx:61` returned from the effect unless `hasImage`, and `hasImage` was false for every subject, always. |
| Does the image channel return? | Yes. `readImage` answers `present` with `image/png` and the bytes for a subject whose entry carries a logo. |
| Does `hasImage` reach the row? | Yes. `AssetsStore._assetFor:396` through the merge helper to the component, and asserted there already. |
| Does the component render it? | Yes. Given a URL it renders the `img`, and its four cases proved that much. |
| Is it rendered and invisible? | No. Nothing was rendered; `logoUrl` stayed null. |

So it is link one, and it is in the renderer. The main-process fetch and the
image store are not implicated: the same run that shows the renderer never asks
shows the handler answering correctly when asked. That matters beyond this task,
because it means `task-009`'s corpus gate and `task-012`'s eviction bounds are
not resting on untested code. They are resting on tested code that nothing
called.

**Why it could not fix itself.** `hasImage` is computed from `readImageSubjects`
(`main/ipc/assetMetadataChannel.ts:114` and `:188`), which selects from
`asset_image`. The only writer of that table is `AssetImageStore._fetchOne`
(`assetImageStore.ts:215`), reached only from the image handler, reached only
from the renderer's request, issued only when `hasImage` was true. Driven in
order: false on a cold image table for a subject whose registry entry carries a
logo, `present` from `readImage`, true afterwards. The flag is a report of the
request having already happened, so it can never be the condition on making it.

Three details decided during implementation:

**The condition is `source === 'registry'` and not "the cache has a row".**
`assetMetadataResolver.ts:523-529` sends only subjects the registry did not
answer to the chain channel, so a chain row is a statement that the registry has
nothing for that subject. A wallet holding several hundred chain-named NFTs is
both the wallet with the most rows and the wallet with the least to gain, and
the narrower condition costs nothing to write.

**The condition also has to keep a row from asking too early, and this one
does.** `asset_image.subject` references `asset_metadata (subject)` with foreign
keys on (`assetMetadataDb.ts:250`), so a request made before the metadata row
exists fetches the bytes and is refused on write. Driven: `absent` before the
row, `present` after it, transport called both times. The renderer memo holds the
promise rather than the outcome, so that `absent` would be final for the life of
the window. Asking for every drawn row unconditionally, which was the first
thing considered, would therefore have fetched and discarded a logo for every
token on the first launch and then never asked again.

**`hasImage` stays and now decides nothing.** It is still a true statement about
the cache, the bulk read computes it from an index lookup it already makes, and
the design document puts it on the entry. Removing it is four renderer modules,
the common type, the main handler and four specs, in a change whose subject is
one condition. The note is in the plan, in the tasks file and at the top of the
new main-side case, because an unread field is exactly what invites someone to
restore the condition.

**The memo was checked rather than assumed.** It does what `task-024` says: one
promise per subject for the life of the window, so rows unmounted and remounted
by scrolling share one request, and `task-024`'s two wire-level cases still pass
unchanged. What it cannot do is tell a subject with no logo from a request that
failed, because the channel answers `absent` for both. So a transport failure
suppresses that row's logo until the window is reloaded. This was masked while
nothing asked at all; it is recorded under Risks and not addressed here.

Verification run:

- `jest` over the two specs — 6 header, 27 channel, all passing.
- **The fix is pinned by reinstating the defect.** With the condition put back to
  `hasImage`, four of the six header cases fail: "renders the logo of a subject
  the registry has one for", "asks for a subject in the registry whose logo is
  not cached yet", "adds no element when the cache answers that there is no
  logo", and "asks as soon as the row it is drawn from reaches the registry".
  The two negative controls, "asks for nothing until the cache has a row for
  the subject" and "asks for nothing for a subject the registry did not answer
  for", keep passing. So the six cases cannot pass by never asking for anything,
  and they are not a rename of the four they replace.
- The two negative cases are the ones that would have been missing from a fix
  that simply deleted the condition, and they are the reason the fix is a move
  rather than a deletion.
- `source` reaching the merged row is already driven, at
  `AssetsStore.spec.ts:583-590`, so the condition's input needed no new case.

**What an assertion could have caught, and what it could not.**

Unlike the notice, this one was reachable, and by a cheap test, which makes the
gap sharper rather than softer.

- **What the existing cases could not catch.** All four supplied `hasImage`
  directly in the fixture. A component test that constructs its own input can
  only ever assert what the component does with an input; it cannot assert that
  the input occurs. `hasImage: true` in a fixture reads as a description of a
  state the system reaches, and here it was a state the system could not reach,
  so four passing cases and a build in which no logo could ever render are
  perfectly consistent. This is the same shape as the notice defect, in a
  different place: a test asserting an element is in the document while it is
  invisible, and a test asserting a component received a prop while nothing
  produces that prop.

- **What an assertion could have caught.** The ordering between the two handlers
  is ordinary, cheap and in-process, and it is now one case in a spec that
  already had a real database file and a stubbed transport next to it. It needed
  no display, no wallet and no network. What was missing was not the ability to
  write it but a reason to: nobody asked where a fixture value comes from,
  because a fixture value that is wrong looks exactly like one that is right.

- **The general form.** A boundary crossed by a value is only as tested as the
  weakest side of it, and a suite that mocks both sides of a boundary tests
  neither. Both specs here were honest about their own layer. What no case
  asserted was that the producer can produce what the consumer expects, and that
  is the assertion that fails on a build like this one.

**Checks**, all through Nix with every change staged:
- `nix build '.#checks.x86_64-linux.compile' --no-link` — built
  `25zcay7q1g1drxvmqvl7n260rp3vkf0r-daedalus-compile.drv`, exit 0.
- `nix build '.#checks.x86_64-linux.lint' --no-link` — built
  `rniyxrsiqbyz42ml885bazxmw7kxi6x8-daedalus-lint.drv`, exit 0.
- `nix build '.#checks.x86_64-linux.stylelint' --no-link` — built
  `fplhf4bsblcxk3m6rv74a2w7d7ja1bga-daedalus-stylelint.drv`, exit 0.
- `nix build '.#checks.x86_64-linux.i18n' --no-link` — built
  `xyl989n9jsqsx8nn7hip82xk47r1mpbp-daedalus-i18n.drv`, exit 0. No message
  changed, which is the expected result.
- `nix build '.#checks.x86_64-linux.jest' --no-link -L` — 100 suites passed,
  1,842 tests with 1,839 passed and 3 skipped, exit 0. The branch stood at
  1,839 after `task-042`, so the three cases this task adds are the whole of the
  difference and no suite was added.
- `nix build '.#checks.x86_64-linux.docs' --no-link` — exit 0, run because
  `.agent/` files changed.

`nix fmt` reported 0 files changed.

No new `@ts-ignore` and no new `@ts-expect-error`.
`git diff HEAD -- package.json yarn.lock` produces nothing.

Deviations from the approved plan:
- None.

Outcome: Implementation complete and ready for review

Review of Iteration 1
Timestamp: 2026-09-15T20:05:00Z

Acceptance criteria, each against the evidence:

1. *A token whose issuer published a logo renders it.* Met in the suite, and the
   suite is now driving the condition the application actually supplies rather
   than one supplied by hand. The remaining confirmation is `task-027`'s
   Scenario 9, against a wallet holding such a token.

2. *A registry row asks whether or not a logo is cached.* Met, and it is the case
   the defect turned on: the previous build asked only in the state that could
   not occur.

3. *No record, and a chain row, ask for nothing.* Met, as two cases, and both are
   controls in the pinning run. The chain case is the one that keeps an NFT
   wallet from paying a request per token for an answer already known; the
   no-record case is the foreign-key guard.

4. *A row asks once its metadata arrives.* Met, driven as a re-render.

5. *At most one request per subject.* Met, unchanged, still on the wire in the
   channel spec.

6-7. *Checks, suppressions, dependencies.* Met.

Three judgements worth naming.

**The obvious fix was the wrong one and would have looked right.** Removing the
condition makes the logo appear in a warm cache and lose it in a cold one: the
first launch asks for every row before any metadata exists, fetches every logo,
has every write refused by the foreign key, and remembers the refusal for the
life of the window. It would have passed a header spec, passed a channel spec,
and failed in exactly the situation the defect was reported from. The thing that
stopped it was driving the write refusal rather than reading the schema.

**The narrow condition is a judgement and not a fact.** `source === 'registry'`
is correct because the resolver sends only unanswered subjects to the chain
channel. If that ever changed, this would silently stop asking for a class of
row. The alternative, "the cache has a row", is robust to that change and costs
a request per chain token per launch. The comment at the site states the
dependency, which is what makes the narrower one safe to prefer.

**Nothing reads `hasImage` now, and that is a real cost.** `task-024` existed
because bytes on disk with no reader are not a feature, and this leaves a field
on the IPC contract in that position. It is kept because removing it is three
times the size of the fix and deletes something the design document specifies and
the main spec asserts. It is recorded in three places so that the next reader
finds the reason before the field.

What this does not do, so it is not mistaken for finished: a logo still appears
in one place, the token row header. A registry row with no logo still costs one
small request per process run, which is what one-subject-at-a-time always
implied. And a request that fails on the network is remembered as "no logo"
until the window is reloaded, because the channel answers `absent` for both.

Summary: The row asks for its logo when the cache has a registry row for the
subject, which is both the fact the old condition was standing in for and the
earliest point a logo can be stored against it. The break was in the renderer,
one line of it; the fetch, the store, the channel and the plumbing were all
sound and all unreached. The finding worth keeping is that four passing
component cases and a build where no logo can ever render are consistent, because
every one of them supplied the value whose absence was the defect.

Decision: approved
