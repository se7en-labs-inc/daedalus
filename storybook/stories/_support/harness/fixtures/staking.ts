import BigNumber from 'bignumber.js';
import STAKE_POOLS from '../../../../../source/renderer/app/config/stakingStakePools.dummy.json';
import { REDEEM_ITN_REWARDS_STEPS } from '../../../../../source/renderer/app/config/stakingConfig';
import { LOVELACES_PER_ADA } from '../../../../../source/renderer/app/config/numbersConfig';
import { walletList } from './wallets';

/*
 * The staking store's shape, and the pools the screens list.
 *
 * The pools come from the application's own sample at
 * `config/stakingStakePools.dummy.json`, which the component-level staking
 * stories already use. It carries 300 entries, which is the right order of
 * magnitude: the list screen virtualises its rows and a fixture of three would
 * exercise none of that.
 *
 * `stakePools` and `recentStakePools` are computed getters in the real store,
 * and `getStakePoolById` is a method the list passes down to its rows, so a
 * fixture that supplied the array without the lookup would render a list whose
 * every row failed to resolve its own pool.
 */

const ada = (amount: number) =>
  new BigNumber(amount).dividedBy(LOVELACES_PER_ADA);

export const stakePools = () => STAKE_POOLS;

// The three a wallet has most recently delegated to, which the list shows above
// the rest.
export const recentStakePools = () => STAKE_POOLS.slice(0, 3);

export const getStakePoolById = (id: string) =>
  STAKE_POOLS.find((pool) => pool.id === id);

/*
 * One reward row per wallet, which is what the rewards screen lists. The real
 * getter builds these by crossing into the wallets and transactions stores, so
 * the fixture derives them from the same wallet list the rest of the harness
 * uses rather than inventing names.
 */
export const rewards = () =>
  walletList().map((wallet) => ({
    wallet: wallet.name,
    total: wallet.reward,
    unspent: wallet.reward,
    rewardsAddress: `stake_test1${wallet.id}`,
    isRestoring: wallet.isRestoring,
    syncingProgress: wallet.isRestoring ? wallet.restorationProgress : 100,
  }));

export const stakingDefaults = {
  isDelegationTransactionPending: false,
  fetchingStakePoolsFailed: false,
  selectedDelegationWalletId: null,
  stake: 1000,
  isRanking: false,
  smashServerUrl: 'https://smash.cardano-mainnet.iohk.io',
  smashServerUrlError: null,
  smashServerLoading: false,
  /*
   * The first-run tooltip over the list-view button, dismissed for good the
   * first time the list is visited. The store starts it shown; the harness
   * starts it dismissed, for the same reason `networkStatus` starts connected:
   * it is the state all but one session is in.
   *
   * It is also the state that can be rendered here at all. The tooltip is a
   * Tippy instance anchored to a ref the page fills in after mount, and Tippy
   * measures its target against the document when it shows, which jsdom has no
   * layout for. So the shown state has no story rather than a story that cannot
   * be checked.
   */
  stakePoolsListViewTooltipVisible: false,
  /*
   * `null` keeps the ITN redemption flow unmounted. `Root.tsx:68-70` reads it to
   * decide whether the container exists at all, so this is the difference
   * between a screen and no screen rather than between two screens.
   */
  redeemStep: null,
  redeemRecoveryPhrase: null,
  redeemWallet: null,
  walletName: null,
  transactionFees: null,
  redeemedRewards: null,
  isSubmittingReedem: false,
  isCalculatingReedemFees: false,
  redeemSuccess: null,
  configurationStepError: null,
  confirmationStepError: null,
  isFetchingStakePools: false,
  numberOfStakePoolsFetched: 0,
  cyclesWithoutIncreasingStakePools: 0,
  stakingInfoWasOpen: false,
  // Computed getters, as plain values.
  stakePools: STAKE_POOLS,
  recentStakePools: STAKE_POOLS.slice(0, 3),
  rewards: [],
  maxDelegationFunds: 64_000_000,
  isStakingDelegationCountdown: false,
  isStakingPage: true,
  currentRoute: '',
  // Methods the screens pass down as handlers.
  getStakePoolById,
  hideStakePoolsListViewTooltip: () => {},
  // Read by the staking shell on every render to decide whether the section is
  // a countdown or the real thing. A method, so an absent one throws.
  showCountdown: () => false,
  getRewardForWallet: (wallet) => ({
    wallet: wallet ? wallet.name : '',
    total: wallet ? wallet.reward : ada(0),
    unspent: wallet ? wallet.reward : ada(0),
    rewardsAddress: '',
    isRestoring: wallet ? wallet.isRestoring : false,
    syncingProgress: 0,
  }),
};

// The ITN redemption flow on its first step, which is the only way to reach it.
export const redeemingItnRewards = () => ({
  redeemStep: REDEEM_ITN_REWARDS_STEPS.CONFIGURATION,
});
