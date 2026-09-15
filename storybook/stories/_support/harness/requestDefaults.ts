/*
 * Requests as a container reads one.
 *
 * `Request` wraps an API call and exposes the state of the last one. Containers
 * read straight through it — `someRequest.isExecuting`, `.error`, `.result` —
 * without guarding, so a request the harness omits does not degrade: it throws
 * inside render, one property access deep, and the stack names the component
 * rather than the missing field.
 *
 * Cheap to fix once here and expensive to fix at every screen that reads one,
 * which is why the whole population is defaulted rather than filled in as
 * failures appear.
 *
 * The five fields are the ones the containers actually read, measured over
 * `source/renderer/app/containers`: `isExecuting`, `isExecutingFirstTime`,
 * `wasExecuted`, `error` and `result`. `reset` and `execute` are here because a
 * screen's own handlers call them, and a handler that throws on click is a worse
 * story than one that does nothing.
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

/*
 * Every request name the 48 screen containers read, grouped by the store that
 * declares it. Measured rather than guessed: the list comes from matching
 * `<name>Request` in the containers against `<name>Request =  new Request` in
 * the stores, so a name here is one some screen reaches for.
 */
export const REQUESTS_BY_STORE: Record<string, Array<string>> = {
  addresses: ['createByronWalletAddressRequest'],
  hardwareWallets: [
    'selectCoinsRequest',
    'sendMoneyRequest',
    'sendMoneyExternalRequest',
    'updateTxSignRequest',
  ],
  networkStatus: ['getNetworkClockRequest', 'getNetworkInfoRequest'],
  profile: [
    'setAnalyticsAcceptanceRequest',
    'setDataLayerMigrationAcceptanceRequest',
    'setProfileLocaleRequest',
    'setTermsOfUseAcceptanceRequest',
    'getProfileLocaleRequest',
    'getThemeRequest',
    'setThemeRequest',
  ],
  staking: [
    'joinStakePoolRequest',
    'quitStakePoolRequest',
    'stakePoolsRequest',
  ],
  transactions: [
    'deleteTransactionRequest',
    'recentTransactionsRequest',
    'searchRequest',
  ],
  voting: [
    'createVotingRegistrationTransactionRequest',
    'getWalletPublicKeyRequest',
    'signMetadataRequest',
  ],
  walletSettings: [
    'exportWalletToFileRequest',
    'getWalletUtxosRequest',
    'updateSpendingPasswordRequest',
    'updateWalletRequest',
  ],
  wallets: [
    'accountPublicKeyRequest',
    'createHardwareWalletRequest',
    'createWalletRequest',
    'deleteWalletRequest',
    'getWalletRecoveryPhraseFromCertificateRequest',
    'icoPublicKeyRequest',
    'restoreDaedalusRequest',
    'restoreLegacyRequest',
    'restoreRequest',
    'transferFundsCalculateFeeRequest',
    'transferFundsRequest',
    'onSubmitSupportRequest',
  ],
};

/*
 * A store's requests, each at the shape above. Spread into the store's defaults
 * so a screen that wants one in flight overrides that one field rather than
 * restating the object.
 */
export const requestsFor = (store: string) =>
  (REQUESTS_BY_STORE[store] || []).reduce<Record<string, unknown>>(
    (acc, name) => {
      acc[name] = requestDefault();
      return acc;
    },
    {}
  );
