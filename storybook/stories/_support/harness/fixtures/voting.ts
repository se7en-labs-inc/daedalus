/*
 * The voting store, which carries the Catalyst registration flow.
 *
 * The flow is a four-step wizard held entirely in store state, so the step
 * number is what selects the screen and everything else on the store describes
 * where that step got its data. `registrationStep` starting at 1 is the store's
 * own initial value and the state a user is in before anything happens.
 */
export const votingDefaults = {
  registrationStep: 1,
  selectedWalletId: null,
  transactionId: null,
  transactionConfirmations: 0,
  isTransactionPending: false,
  isTransactionConfirmed: false,
  votingRegistrationKey: null,
  qrCode: null,
  isConfirmationDialogOpen: false,
  initializeVPDelegationTx: () => Promise.resolve(null),
  fundPhase: 'snapshot',
  /*
   * The fund the registration is for. `null` would be truthful about an
   * installation that has not reached the Catalyst API yet, and it is also the
   * state in which the screen renders nothing at all, so the default is a fund
   * and a story asks for the absence.
   */
  catalystFund: {
    current: {
      number: 12,
      startTime: new Date('2026-08-01T00:00:00.000Z'),
      endTime: new Date('2026-09-01T00:00:00.000Z'),
      resultsTime: new Date('2026-09-15T00:00:00.000Z'),
      registrationSnapshotTime: new Date('2026-08-20T00:00:00.000Z'),
    },
    next: {
      number: 13,
      startTime: new Date('2026-10-01T00:00:00.000Z'),
      registrationSnapshotTime: new Date('2026-09-20T00:00:00.000Z'),
    },
  },
};

// Reaches the wallet backend in the application, so it does nothing here: the
// delegation form must be showable without a workbench being able to submit
// from it.
export const initializeVPDelegationTx = () => Promise.resolve(null);

// No fund data, which is what an installation sees when the Catalyst API is
// unreachable, and the branch that removes the screen rather than changing it.
export const noCatalystFund = () => ({ catalystFund: null });
