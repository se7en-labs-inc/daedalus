# Finding: a send transaction can fail the minimum-ada rule with nothing on screen to fix it

**Status:** open, not scheduled
**Raised from:** manual QA of the asset metadata cache, 2026-09-17
**Scope:** the send form. **Pre-existing, and not caused by the asset metadata
work.** It was surfaced by QA of that work and the code it lives in has not been
touched since 2022.
**Severity:** a real defect for a user sending a native token who has already
typed an ada amount that the token then makes too small. The form states that the
transaction is wrong and offers no way to make it right.

All line references measured against `5bd24fee1`.

---

## What was observed

Adding a native asset to a send transaction does not raise the ada amount to meet
the minimum required for the output. The form shows a red invalid state, with no
button to top the ada up and no automatic adjustment.

## Both affordances exist in the code

`WalletSendForm.tsx:1230-1247` renders an **UPDATE** button, labelled from
`wallet.send.form.asset.updateAdaAmountButton` (`en-US.json:1382`) and wired to
`updateAdaAmount` at `:800-816`, which writes the minimum into the ada field.

`checkAdaInputState` at `:752-778` and `trySetMinimumAdaAmount` at `:779-799`
raise the field **automatically**, and `:1401-1409` then renders a notice saying
the field was updated for the user.

Both are conditional, and in the case QA hit neither condition holds.

## Where the minimum comes from, and where it is compared

There is one number, `state.minimumAda`, initialized to zero at `:168` and reset
to zero at `:327`. It is written in exactly two places.

**From a successful fee response.** `calculateTransactionFee` sets it at `:670-676`
from what the API layer returns. `api.ts:3375-3391` reads it out of
`minimum_coins[0].quantity` of the `POST /v2/wallets/{id}/payment-fees` response
(`getTransactionFee.ts:12`, called at `api.ts:1160-1171`), defaulting to `0` when
the field is absent.

**From a `utxo_too_small` error.** `errors.ts:181-189` attaches it to the ApiError
by parsing the figure out of the error's human-readable message:

```js
minimumAda: get(
  /(Expected min coin value: +)([0-9]+.[0-9]+)/.exec(error.message),
  2,
  0
),
```

The comparison that decides whether the button appears is
`isAdaAmountLessThanMinimumRequired` at `:827-831`: the field value against
`state.minimumAda`.

## Why neither affordance fires

**The phrase that regular expression looks for is not in the message.** The
backend `5bd24fee1` pins is `cardano-foundation/cardano-wallet` at ref
`v2026-08-21`, rev `49e06790051e` (`git show 5bd24fee1:flake.lock`). There,
`utxo_too_small` is raised at
`lib/api/src/Cardano/Wallet/Api/Http/Server/Error.hs:1227-1250`, and its message is
`selectionOutputCoinInsufficientMessage` at `:1295-1302`:

> One of the outputs you've specified has an ada quantity that is below the
> minimum required. Either increase the ada quantity to at least the minimum, or
> specify an ada quantity of zero, in which case the wallet will automatically
> assign the correct minimum ada quantity to the output.

No figure appears in it, and no numeral does. The required minimum travels in the
structured field `txOutputLovelaceRequiredMinimum` (`Error.hs:1247-1249`), which
nothing in `source/` reads: `grep -rn "txOutputLovelaceRequiredMinimum" source`
returns nothing.

So `exec` returns `null`, `get(null, 2, 0)` returns `0`, and the guard at
`WalletSendForm.tsx:709`, `if (minimumAda && !Number.isNaN(Number(minimumAda)))`,
is false on a zero. That single false skips all three of the things inside it: the
automatic raise at `:717-721`, the write of the new minimum into state at `:725`,
and the substitution of the min-ada wording for the raw error at `:710-715`.

**So the button is compared against a stale number.** The condition is a non-zero
ada amount below the minimum for the bundle. A user who enters an address and an
ada amount gets a successful fee response, so `state.minimumAda` holds the minimum
for a plain ada output, around one ada, which the amount they typed already meets.
Adding a token calls `addAssetRow` at `:890-900`, which resets the fee and issues
no request at all. Typing the token amount runs the asset validator at `:974-1034`,
the one place other than `removeAssetRow` (`:927`) that asks for the minimum to be
re-checked (`shouldUpdateMinimumAdaAmount: true` at `:1011`). The bundle's minimum
is higher than a plain output's, so that request fails with `utxo_too_small`, the
figure is lost, and `state.minimumAda` keeps its pre-token value.
`isAdaAmountLessThanMinimumRequired` is therefore false, and the form renders the
plain notice branch at `:1248-1254` instead of the button.

**Two paths do work, and they bound the defect.** An ada field left empty sends
zero, because `formattedAmountToLovelace('')` is `0`
(`utils/formatters.ts:170-183`). The wallet assigns the minimum itself for a zero
output rather than refusing it, which its own message says it does, so that
response succeeds, carries the figure, and the automatic raise fills the field. An
amount already at or above the bundle's minimum also succeeds. So the defect needs
a user who typed an ada amount, and typed one that a token then makes too small.

**What the user is left looking at.** The ada input binds
`error={adaAmountField.error || transactionFeeError}` at `:1209`, and the error
resolves through the ApiError id `api.errors.utxoTooSmall` (`errors.ts:94-95`),
whose string is `"Invalid transaction."` (`en-US.json:43`). Beside it, the notice
reads `"a minimum of {minimumAda} ADA required"` (`en-US.json:1395`) with the stale
figure, or with the flat constant `TRANSACTION_MIN_ADA_VALUE`, which is `1`
(`walletsConfig.ts:46`), whenever `state.minimumAda` is still zero
(`getMinimumAdaValue`, `:1089-1094`). The Send button is disabled because the fee
is zero (`isDisabled`, `:421-430`).

**Two validators never ask for the check at all.** The receiver validator
(`:454-457`) and the ada amount validator (`:510-513`) build their payload without
`shouldUpdateMinimumAdaAmount`, so it defaults to false (`:644`). Editing the
address or the ada amount after a token is on the form recomputes the fee and
never re-checks the minimum.

## That it is pre-existing

The machinery is from the January 2022 send screen and has not been touched since
June 2022:

| What | Oldest commit | Newest commit |
|---|---|---|
| `isAdaAmountLessThanMinimumRequired` | `de6ce2512`, 2022-01-24 | the same |
| `trySetMinimumAdaAmount` | `de6ce2512`, 2022-01-24 | the same |
| `updateAdaAmountButton` | `de6ce2512`, 2022-01-24 | `ec18b0bc8`, 2022-06-28 |
| `shouldUpdateMinimumAdaAmount` | `de6ce2512`, 2022-01-24 | `fd38d7bf6`, 2022-06-13 |
| the `Expected min coin value` regex | `38dbf4b8a`, 2021-02-27 | `916fa6da3`, 2022-04-08 |

Each row is the first and last line of `git log --all -S "<identifier>"`, so it
records when the string was added or removed and not every edit to the body it
sits in. The parse is the oldest of them: it arrived with the original native
token support in February 2021, before the earliest outside report of this
behavior, dated 2021-05-14.

Three commits from this work touch `WalletSendForm.tsx` (`4a2d151f2`, `1b41ab1bb`,
`61cfac7e7`, all 2026-09-14) and none of them touches a min-ada line:

```bash
git show --format='' --unified=0 61cfac7e7 -- source/renderer/app/components/wallet/WalletSendForm.tsx \
  | grep -cE "^[+-].*(minimumAda|MinimumAda|adaInputState|AdaInputState)"   # 0, and 0 for the other two
```

The defect is a backend message that changed under a client that parses it. Stating
it as a regression of the asset metadata branch would be wrong in both directions:
it would blame the wrong change, and it would date a defect that has been shipping
to 2026.

The surface has been reported from outside as well.
`input-output-hk/daedalus#2565`, opened 2021-05-14 against Daedalus 4.0.5, reports
this field showing a flat one ada minimum, then the real figure once an amount
below it is entered, then one ada again, with screenshots of all three states. The
flat figure is `TRANSACTION_MIN_ADA_VALUE`. The issue was closed on 2026-07-27 in a
backlog retirement rather than by a change to this code.

## The shape of the error

A validation error with no affordance to resolve it is the worst shape a validation
error can take. The application holds the answer in this case: the required
minimum is in the response it has already received, in a field it does not read.

## What this finding does not establish

The app was not run. What is verified is what the code does with each input and
what the pinned backend sends; which of the two zero-minimum branches the QA
session took is inferred from the observation, not measured. Reproducing it against
a live wallet, and capturing the 403 body, would settle that.

Whether `minimum_coins` can arrive empty for a payment. It cannot, at the pinned
version: the handler computes one minimum per output, at
`lib/api/src/Cardano/Wallet/Api/Http/Shelley/Server.hs:2852-2855`. The empty array
that appears in the wallet's own fixtures
(`lib/unit/test/data/Cardano/Wallet/Api/ApiFee.json:292`) is the shape of the
deposit-only variant, which passes `[]` explicitly at `Server.hs:4708`. Daedalus
reads element zero with a default of `0`, so that default is reached on the error
path and not on a successful payment fee. Nothing here establishes the same for
older backend versions.

Whether the regular expression ever matched. The phrase is absent from the pinned
clone; no search was made of the wallet's history for the release it was written
against.

The separate case of a user who does not hold enough ada to meet the minimum at
all. No affordance can fix that one, and the honest answer there is a different
message, not a button.

## What was not done and why

Nothing was changed. The fix is in the API error layer rather than the form: read
the minimum from the structured error field instead of the message. That is a
change to shared error handling with its own blast radius, in a file this work has
no reason to touch, and the form's existing affordances start working again as soon
as the number arrives.

## Relevant files

- `source/renderer/app/components/wallet/WalletSendForm.tsx` (the state, both
  affordances, the conditions)
- `source/renderer/app/api/errors.ts:181-189` (the figure, parsed out of prose)
- `source/renderer/app/api/api.ts:3375-3391` (the figure on the success path)
- `source/renderer/app/config/walletsConfig.ts:46` (the flat fallback)
