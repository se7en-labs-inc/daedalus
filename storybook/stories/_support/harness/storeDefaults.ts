import {
  DATE_ENGLISH_OPTIONS,
  DATE_JAPANESE_OPTIONS,
  LANGUAGE_OPTIONS,
  NUMBER_OPTIONS,
  TIME_OPTIONS,
} from '../../../../source/renderer/app/config/profileConfig';
import { ROUTES } from '../../../../source/renderer/app/routes-config';
import environment from '../environment';

const storyEnvironment = environment;

/*
 * A stand-in for the application's store map.
 *
 * Not real stores. `setUpStores` takes a live `Api` and calls `initialize()`,
 * which starts every store's polling reactions, so constructing one inside a
 * story would put the workbench on a timer and a network client. These are plain
 * objects carrying the fields a store exposes: its observables at the values the
 * real store initialises them to, and its computed getters as plain values.
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

/*
 * A request as a container reads one. Every screen that touches a request reads
 * some of `isExecuting`, `error`, `wasExecuted`, `result` and
 * `isExecutingFirstTime`, and reads through without guarding, so an omitted
 * field throws inside render rather than degrading.
 *
 * Provisional here and deliberately minimal: `task-041` sweeps the 48 screen
 * containers for every request a screen reads and promotes this to its own
 * module. It exists at all in this task because the two-store proof below reads
 * one.
 */
export const requestDefault = (overrides: Record<string, unknown> = {}) => ({
  isExecuting: false,
  isExecutingFirstTime: false,
  wasExecuted: true,
  error: null,
  result: null,
  reset: () => {},
  execute: () => {},
  ...overrides,
});

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
  // Observables, at the values ProfileStore initialises them to.
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
  // Requests the settings screens read through. task-041 completes the sweep.
  setProfileLocaleRequest: requestDefault(),
  getProfileLocaleRequest: requestDefault(),
  setThemeRequest: requestDefault(),
  getThemeRequest: requestDefault(),
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
 * The ones that are empty objects are empty because nothing this phase covers
 * reads them, not because they are unimportant: walletBackup, walletsLocal and
 * window are read by no screen container at all. A later tranche fills whichever
 * it needs, and a key that is present but empty fails at the field rather than at
 * the store, which is the more useful of the two failures.
 */
export const createStoreDefaults = () => ({
  addresses: {},
  app: { ...appDefaults },
  backend: {},
  appUpdate: {},
  currency: {},
  assets: {
    all: [],
    details: {},
    favorites: {},
    editedAsset: null,
    activeAsset: null,
  },
  hardwareWallets: {},
  governance: {},
  networkStatus: {},
  newsFeed: {},
  profile: { ...profileDefaults },
  router: {},
  sidebar: {},
  staking: {},
  transactions: {},
  uiDialogs: {
    // Containers gate on this before reading anything else, so the default is
    // "no dialog open" and a screen that wants one overrides the predicate.
    isOpen: () => false,
    activeDialog: null,
    dataForActiveDialog: {},
  },
  uiNotifications: {},
  voting: {},
  wallets: { ...walletsDefaults },
  walletsLocal: {},
  walletBackup: {},
  walletMigration: {},
  walletSettings: {},
  window: {},
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
