# task-065 plan review

## Planner: Iteration 1

2026-09-15.

Wrote `task-065.md` after the owner settled each of the five controls. The plan verifies each
disposition against the component that consumes the flag rather than accepting it, because two of the
five are named after something other than what they do.

Critique of iteration 1:

- The plan accepted that `isAlonzoActivated` should be dropped because Alonzo is permanently
  activated. Reading `TopBar.tsx:15-25` shows no such prop in its `Props` type and no read anywhere in
  the component. Both call sites pass it into an existing overload suppression. The conclusion is the
  same and the reason is better: dropping it changes nothing, rather than changing something no user
  sees.
- The plan described `shouldShowTadaIcon` as `isAlonzoActivated && !stakingInfoWasOpen`. That is
  `shouldShowTadaIconAnimation`, `TopBarContainer.tsx:37`. `shouldShowTadaIcon` is
  `IS_TADA_ICON_AVAILABLE && (isAlonzoPending || isAlonzoActivated)` at `:39`, and
  `IS_TADA_ICON_AVAILABLE` is `false`, which makes the whole branch unreachable regardless of the
  chain. Corrected, and the stronger version is what the finding records.
- The plan put `hasRewardsWallets` on "the two or three metas whose stories show the affordance".
  Measured, that is wrong in both directions: five of the six wrappers cannot show it at all, because
  `StoryLayout` passes `activeWallet` only for the wallets category, and every meta under the wallets
  wrapper can, because the sidebar lets a viewer make either legacy wallet active. So it is all
  fifteen, and the owner's instruction not to minimise coverage points the same way.
- The plan threaded the two globals to their consumers as props, 21 files for one and six for the
  other. Replaced with a context published once above every story, which touches four files and no
  call site.
- The plan did not say that dropping `hasTadaIcon` changes what stories render. It does, and it is the
  only such change in the phase. Given its own section.

Scope guard: no shipped source changes; four globals and no more; `DiscreetValue.story.tsx`'s own
per-story toggle untouched.

Outcome: `approved`.
