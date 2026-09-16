import BigNumber from 'bignumber.js';
import {
  DEFAULT_DREP_COHORT_CRITERIA,
  drawDRepCohort,
  selectDRepCohortPool,
} from '../../../../../source/renderer/app/components/governance/_shared/drepCohort';
import {
  TOTAL_DREP_STAKE,
  makeDRepPopulation,
} from '../../../governance/_utils/drepPopulation';

/*
 * The governance store, drawn from the same seeded population the
 * component-level governance stories use.
 *
 * That population is measured rather than invented: its active, verified and
 * lapsing proportions come from a thousand-DRep mainnet sample, and its names
 * carry the scripts and lengths a real directory does. A screen reviewed against
 * two hand-written entries is reviewed against a chain that does not exist.
 *
 * The suggested cohort is drawn by the application's own selection from that
 * population rather than listed here, so the story shows a cohort the directory
 * would actually produce. Listing twenty entries by hand would show one it never
 * would.
 */

/*
 * The refresh states, written out rather than imported.
 *
 * `GovernanceRefreshState` is an enum exported from `stores/GovernanceStore`,
 * and importing it would pull the store module into the harness graph, which is
 * the thing `screens/harness.spec.ts` asserts against two files away. The values
 * are those at `stores/GovernanceStore.ts:52-58`.
 */
export const REFRESH_STATE = {
  IDLE: 'idle',
  LOADING: 'loading',
  REFRESHING: 'refreshing',
  LOADED: 'loaded',
  FAILED: 'failed',
};

const POPULATION_SIZE = 240;
const COHORT_SEED = 1;

export const drepPopulation = () => makeDRepPopulation(POPULATION_SIZE);

export const drepSummary = () => ({
  totalDRepStake: TOTAL_DREP_STAKE,
  activeDRepCount: 88,
  inactiveDRepCount: 152,
  totalDRepCount: POPULATION_SIZE,
});

const cohortPoolFor = (population) =>
  selectDRepCohortPool(
    population,
    DEFAULT_DREP_COHORT_CRITERIA,
    TOTAL_DREP_STAKE
  );

export const governanceDefaults = {
  allDReps: [],
  refreshState: REFRESH_STATE.IDLE,
  error: null,
  lastFetchedAt: null,
  cohortCriteria: DEFAULT_DREP_COHORT_CRITERIA,
  cohortSeed: COHORT_SEED,
  drepSummary: null,
  drepSummaryState: REFRESH_STATE.IDLE,
  favoriteDRepIds: new Set(),
  fetchedDReps: new Map(),
  delegationNavState: null,
  // Computed getters, as plain values.
  isLoading: false,
  isRefreshing: false,
  isLoaded: false,
  hasError: false,
  isGovernancePage: true,
  isDRepSummaryAvailable: false,
  isEmpty: true,
  cohortPool: cohortPoolFor([]),
  suggestedDReps: [],
  favoriteEntries: [],
  /*
   * Methods, so an absent one throws rather than reading undefined. Every one of
   * these reaches the wallet backend in the application, so here they do
   * nothing: a workbench must be able to show the refresh button without being
   * able to press it into a network call.
   */
  setCohortCriteria: () => {},
  setDelegationNavState: () => {},
  toggleFavorite: () => {},
  refresh: () => Promise.resolve(),
  rerollCohort: () => {},
  loadAllDReps: () => Promise.resolve(),
  ensureDRep: () => Promise.resolve(null),
  ensureFavorites: () => Promise.resolve(),
  fetchDRep: () => Promise.resolve(null),
  resolveAnchor: () => Promise.resolve(null),
};

/*
 * A loaded directory. The cohort and the pool are derived from the same
 * population as the list, so the suggested entries are a subset of the ones the
 * directory can show rather than a separate set that happens to look similar.
 */
export const loadedDirectory = () => {
  const population = drepPopulation();
  const pool = cohortPoolFor(population);
  return {
    allDReps: population,
    refreshState: REFRESH_STATE.LOADED,
    drepSummary: drepSummary(),
    drepSummaryState: REFRESH_STATE.LOADED,
    lastFetchedAt: new Date('2026-09-01T12:00:00.000Z').getTime(),
    isLoaded: true,
    isEmpty: false,
    isDRepSummaryAvailable: true,
    cohortPool: pool,
    suggestedDReps: drawDRepCohort(pool, COHORT_SEED),
  };
};

// The directory with three entries starred, which is the whole content of the
// favorites view.
export const withFavorites = () => {
  const loaded = loadedDirectory();
  const favorites = loaded.allDReps.slice(0, 3);
  return {
    ...loaded,
    favoriteDRepIds: new Set(favorites.map((entry) => entry.drepId)),
    favoriteEntries: favorites,
  };
};

export const loadingDirectory = () => ({
  refreshState: REFRESH_STATE.LOADING,
  isLoading: true,
});

export const failedDirectory = () => ({
  refreshState: REFRESH_STATE.FAILED,
  hasError: true,
  error: {
    kind: 'network',
    message: 'The DRep directory could not be reached.',
  },
});

export const totalDRepStake = () => new BigNumber(TOTAL_DREP_STAKE);
