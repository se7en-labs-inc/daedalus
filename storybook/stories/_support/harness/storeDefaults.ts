import {
  DATE_ENGLISH_OPTIONS,
  DATE_JAPANESE_OPTIONS,
  LANGUAGE_OPTIONS,
  NUMBER_OPTIONS,
  TIME_OPTIONS,
} from '../../../../source/renderer/app/config/profileConfig';
import { ROUTES } from '../../../../source/renderer/app/routes-config';
import environment from '../environment';
import { backendDefaults } from './fixtures/backend';
import { routerAt } from './fixtures/router';
import { emptyFilterOptions } from './fixtures/transactions';
import { stakingDefaults } from './fixtures/staking';
import { governanceDefaults } from './fixtures/governance';
import { votingDefaults } from './fixtures/voting';
import { CATEGORIES_LIST } from '../../../../source/renderer/app/config/sidebarConfig';
import {
  WalletSortBy,
  WalletSortOrder,
} from '../../../../source/renderer/app/types/sidebarTypes';
import {
  appUpdateDefaults,
  newsFeedDefaults,
  uiNotificationsDefaults,
} from './fixtures/news';
import { requestsFor } from './requestDefaults';

// Re-exported so a screen story has one import for everything the harness
// offers rather than two.
export { requestDefault } from './requestDefaults';
export { backendPhase } from './fixtures/backend';

const storyEnvironment = environment;

/*
 * A stand-in for the application's store map.
 *
 * Not real stores. `setUpStores` takes a live `Api` and calls `initialize()`,
 * which starts every store's polling reactions, so constructing one inside a
 * story would put the workbench on a timer and a network client. These are plain
 * objects carrying the fields a store exposes: its observables at the values the
 * real store initializes them to, and its computed getters as plain values.
 *
 * Every one of the 24 keys in `StoresMap` is present, including the ones no
 * screen reads. Stores reach each other through `this.stores`, so a computed
 * that crosses into a missing key throws, and a partial map fails at a distance
 * from the screen that caused it.
 *
 * The type checker will not catch a gap here. `InjectedProps` types `stores` as
 * `any | StoresMap` and `strict` is off, so an incomplete map compiles and fails
 * at render. The defaults are the only thing standing between a screen story and
 * that failure, which is why they are written out rather than inferred.
 */

// The screens read locale, theme and format as settled values rather than as
// the request-and-result pairs the real store derives them from.
const profileDefaults = {
  currentLocale: LANGUAGE_OPTIONS[0].value,
  currentTheme: 'dark-blue',
  currentNumberFormat: NUMBER_OPTIONS[0].value,
  currentDateFormat: DATE_ENGLISH_OPTIONS[0].value,
  currentDateEnglishFormat: DATE_ENGLISH_OPTIONS[0].value,
  currentDateJapaneseFormat: DATE_JAPANESE_OPTIONS[0].value,
  currentTimeFormat: TIME_OPTIONS[0].value,
  currentTimeFormatShort: TIME_OPTIONS[0].value,
  hasLoadedCurrentLocale: true,
  isCurrentLocaleSet: true,
  isCurrentThemeSet: true,
  hasLoadedCurrentTheme: true,
  termsOfUse: '',
  hasLoadedTermsOfUseAcceptance: true,
  areTermsOfUseAccepted: true,
  analyticsAcceptanceStatus: 'ACCEPTED',
  hasLoadedDataLayerMigrationAcceptance: true,
  isDataLayerMigrationAccepted: true,
  isProfilePage: false,
  isSettingsPage: true,
  // Observables, at the values ProfileStore initializes them to.
  systemLocale: LANGUAGE_OPTIONS[0].value,
  systemNumberFormat: NUMBER_OPTIONS[0].value,
  systemDateFormatEnglish: DATE_ENGLISH_OPTIONS[0].value,
  systemDateFormatJapanese: DATE_JAPANESE_OPTIONS[0].value,
  systemTimeFormat: TIME_OPTIONS[0].value,
  listViewPreferences: {},
  error: null,
  logFiles: null,
  compressedLogsFilePath: null,
  compressedLogsStatus: {},
  desktopDirectoryPath: '',
  isSubmittingBugReport: false,
  isInitialScreen: false,
  isRTSModeRecommendationAcknowledged: false,
  ...requestsFor('profile'),
};

const networkStatusDefaults = {
  /*
   * Observables at the values NetworkStatusStore initializes them to, except
   * where that value is a state no user waits in. The real store starts
   * disconnected and unsynced and climbs out within seconds; a harness that
   * starts there shows every screen its loading shell and nothing else, so the
   * defaults are the settled state and a screen that wants the loading one says
   * so.
   */
  isNodeResponding: true,
  isNodeSyncing: true,
  isNodeInSync: true,
  isNodeSubscribed: true,
  isNodeTimeCorrect: true,
  isSystemTimeIgnored: false,
  isSplashShown: false,
  isSyncProgressStalling: false,
  hasBeenConnected: true,
  syncProgress: 100,
  localTip: null,
  networkTip: null,
  nextEpoch: null,
  futureEpoch: null,
  lastSyncProgressChangeTimestamp: 0,
  localTimeDifference: 0,
  decentralizationProgress: 100,
  desiredPoolNumber: 500,
  isNotEnoughDiskSpace: false,
  diskSpaceRequired: '',
  diskSpaceMissing: '',
  diskSpaceRecommended: '',
  diskSpaceAvailable: '',
  isTlsCertInvalid: false,
  stateDirectoryPath: '/home/ada/.local/share/Daedalus/mainnet',
  isShelleyActivated: true,
  isShelleyPending: false,
  isAlonzoActivated: true,
  isAlonzoPending: false,
  shelleyActivationTime: '',
  alonzoActivationTime: '',
  epochLength: null,
  slotLength: null,
  // Computed getters, as plain values.
  isConnected: true,
  isSystemTimeCorrect: true,
  isSynced: true,
  syncPercentage: 100,
  absoluteSlotNumber: 0,
  isEpochsInfoAvailable: false,
  isRTSFlagsModeEnabled: false,
  /*
   * Not a field of NetworkStatusStore: `environment` is declared on the Store
   * base class at stores/lib/Store.ts:10, so every store carries it and the RTS
   * recommendation overlay reads it through this one. It is set here rather than
   * on all 24 keys because this is the store a screen reads it from; the same
   * fixture `_support/environment.ts` installs on the global, so the two agree.
   */
  environment,
  // Methods on the store, passed straight through as click handlers.
  ignoreSystemTimeChecks: () => {},
  openStateDirectory: () => {},
  ...requestsFor('networkStatus'),
};

/*
 * CurrencyStore's observables, plus the two computed getters that derive from
 * them. `isActive` gates the whole conversion panel, and the real store starts
 * it off, so a screen that wants the panel open says so.
 */
const currencyDefaults = {
  isFetchingList: false,
  isFetchingRate: false,
  isActive: false,
  list: [],
  selected: null,
  rate: null,
  lastFetched: null,
  localizedCurrencyList: [],
  localizedCurrency: null,
};

const appDefaults = {
  error: null,
  isDownloadNotificationVisible: false,
  gpuStatus: null,
  activeDialog: null,
  newsFeedIsOpen: false,
  currentRoute: ROUTES.ROOT,
  currentPage: '',
  isSetupPage: false,
  // The stories' own environment fixture, not the ambient global, so a screen
  // that prints a version string prints the same one in the workbench and in a
  // spec. _support/environment.ts installs the same object on global.environment
  // for the components that read it there.
  environment: storyEnvironment,
  openExternalLink: () => {},
  openLocalDirectory: () => {},
};

const walletsDefaults = {
  active: null,
  activeValue: null,
  activePublicKey: null,
  icoPublicKey: null,
  all: [],
  allWallets: [],
  hasAnyWallets: false,
  hasLoadedWallets: true,
  hasMaxWallets: false,
  hasRewardsWallets: false,
  isWalletRoute: false,
  isValidAddress: () => Promise.resolve(true),
  // Inherited from the Store base class, the way networkStatus carries it. The
  // add-wallet screen reads three network flags off it.
  environment,
  createWalletStep: null,
  createWalletShowAbortConfirmation: false,
  createWalletUseNewProcess: false,
  restoreWalletStep: null,
  restoreWalletShowAbortConfirmation: false,
  restoreWalletUseNewProcess: true,
  walletKind: null,
  walletKindDaedalus: null,
  walletKindYoroi: null,
  walletKindHardware: null,
  mnemonics: [],
  walletName: '',
  spendingPassword: '',
  repeatPassword: '',
  restoredWallet: null,
  walletExportType: 'paperWallet',
  isDeleting: false,
  isRestoring: false,
  isAddressFromSameWallet: false,
  createPaperWalletCertificateStep: 0,
  walletCertificatePassword: null,
  walletCertificateAddress: null,
  walletCertificateRecoveryPhrase: null,
  generatingCertificateInProgress: false,
  generatingCertificateError: null,
  generatingRewardsCsvInProgress: false,
  generatingRewardsCsvError: null,
  certificateStep: null,
  certificateTemplate: null,
  additionalMnemonicWords: null,
  transferFundsSourceWalletId: '',
  transferFundsTargetWalletId: '',
  transferFundsStep: 0,
  transferFundsFee: null,
  transferFundsLeftovers: null,
  undelegateWalletSubmissionSuccess: null,
};

/*
 * The 24 keys of StoresMap, in the order stores/index.ts declares them.
 *
 * The ones that are empty objects are empty because no screen covered so far
 * reads them, not because they are unimportant: walletBackup, walletsLocal and
 * window are read by no screen container at all. A later tranche fills whichever
 * it needs, and a key that is present but empty fails at the field rather than at
 * the store, which is the more useful of the two failures.
 */
export const createStoreDefaults = () => ({
  /*
   * `isInternalAddress` answers "is this one of ours" for every row a
   * transaction list draws, and the real store answers it by searching `all`.
   * Defaulted to false so an address a story did not supply reads as external
   * rather than throwing.
   */
  addresses: {
    all: [],
    active: null,
    lastGeneratedAddress: null,
    addressesRequests: [],
    stakeAddresses: {},
    error: null,
    isInternalAddress: () => false,
    ...requestsFor('addresses'),
  },
  app: { ...appDefaults },
  backend: { ...backendDefaults },
  appUpdate: { ...appUpdateDefaults },
  currency: { ...currencyDefaults },
  assets: {
    all: [],
    details: {},
    favorites: {},
    editedAsset: null,
    activeAsset: null,
  },
  hardwareWallets: { ...requestsFor('hardwareWallets') },
  governance: { ...governanceDefaults },
  networkStatus: { ...networkStatusDefaults },
  newsFeed: { ...newsFeedDefaults },
  profile: { ...profileDefaults },
  /*
   * At the root. `screenDecorator` replaces this from the story's own path, so
   * the default is what a screen sees when it does not care where it is, and
   * AppStore.currentRoute is computed from the same field.
   */
  router: routerAt(),
  /*
   * The real category list, not a stand-in. The sidebar renders one button per
   * entry and marks one of them active by route, so a shortened list would show
   * a different application rather than a simpler fixture. `wallets` is the
   * store's computed grouping and is empty here because no wallet is loaded; the
   * layout renders its sidebar without one.
   */
  sidebar: {
    CATEGORIES: CATEGORIES_LIST,
    activeSidebarCategory: CATEGORIES_LIST[0].route,
    isShowingSubMenus: true,
    walletSortConfig: {
      sortBy: WalletSortBy.Date,
      sortOrder: WalletSortOrder.Asc,
    },
    searchValue: '',
    wallets: [],
    onChangeWalletSortType: () => {},
    onSearchValueUpdated: () => {},
  },
  staking: { ...stakingDefaults, ...requestsFor('staking') },
  /*
   * Observables and the computed getters the wallet screens read. The list
   * starts empty, which is the state a new wallet is in and the state the
   * summary screen has its own component for.
   */
  transactions: {
    transactionsRequests: [],
    deleteTransactionRequestQueue: [],
    _filterOptionsForWallets: {},
    all: [],
    allFiltered: [],
    recent: [],
    recentFiltered: [],
    hasAny: false,
    hasAnyFiltered: false,
    totalAvailable: 0,
    totalFilteredAvailable: 0,
    pendingTransactionsCount: 0,
    withdrawals: {},
    filterOptions: null,
    populatedFilterOptions: emptyFilterOptions,
    defaultFilterOptions: emptyFilterOptions,
    deletePendingTransaction: () => Promise.resolve(),
    // Form validators, called from the send screen as the user types.
    validateAmount: () => Promise.resolve(true),
    validateAssetAmount: () => Promise.resolve(true),
    ...requestsFor('transactions'),
  },
  uiDialogs: {
    // Containers gate on this before reading anything else, so the default is
    // "no dialog open" and a screen that wants one overrides the predicate.
    isOpen: () => false,
    activeDialog: null,
    dataForActiveDialog: {},
  },
  uiNotifications: { ...uiNotificationsDefaults },
  voting: { ...votingDefaults, ...requestsFor('voting') },
  wallets: { ...walletsDefaults, ...requestsFor('wallets') },
  walletsLocal: {},
  walletBackup: {},
  /*
   * The Byron import flow, which runs once on an installation that has an old
   * state directory and never again. Every count is zero, which is what the
   * screens branch on to stay out of the way.
   */
  walletMigration: {
    walletMigrationStep: null,
    isExportRunning: false,
    exportedWallets: [],
    exportErrors: '',
    exportSourcePath: '',
    defaultExportSourcePath: '',
    isTestMigrationEnabled: false,
    isRestorationRunning: false,
    restoredWallets: [],
    restorationErrors: [],
    pendingImportWallets: [],
    pendingImportWalletsCount: 0,
    exportedWalletsData: [],
    exportedWalletsCount: 0,
    restoredWalletsData: [],
    restoredWalletsCount: 0,
  },
  walletSettings: {
    walletFieldBeingEdited: null,
    lastUpdatedWalletField: null,
    walletUtxos: null,
    recoveryPhraseStep: 0,
    walletsRecoveryPhraseVerificationData: {},
    // A method, keyed by wallet id. The wallet shell calls it before reading
    // anything off the result, so an absent one throws rather than reads
    // undefined.
    getWalletsRecoveryPhraseVerificationData: () => ({}),
    // Per-wallet local preferences, keyed by id. The receive screen reads
    // `showUsedAddresses` off whatever comes back, and tolerates nothing.
    getLocalWalletDataById: () => ({ showUsedAddresses: true }),
    ...requestsFor('walletSettings'),
  },
  window: {},
});

/*
 * A dialog open, as one override.
 *
 * Containers ask `uiDialogs.isOpen(SomeDialog)` with the component itself rather
 * than a name, and the settings screens mount ten of them side by side. A story
 * that flipped the predicate to always-true would open all ten at once, so the
 * predicate answers for one and the rest stay shut.
 */
export const dialogOpen = (dialog: unknown) => ({
  isOpen: (candidate: unknown) => candidate === dialog,
  activeDialog: dialog,
  dataForActiveDialog: {},
});

export type StoreOverrides = Partial<
  Record<keyof ReturnType<typeof createStoreDefaults>, Record<string, unknown>>
>;

/*
 * A screen supplies only the keys it reads, and only the fields it reads on
 * them. Merging one level deep rather than replacing keeps the rest of a store's
 * defaults in place, which is what makes an override two or three lines instead
 * of a second fixture.
 */
export const withStoreOverrides = (overrides: StoreOverrides = {}) => {
  const base = createStoreDefaults();
  Object.keys(overrides).forEach((key) => {
    base[key] = { ...base[key], ...overrides[key] };
  });
  return base;
};
