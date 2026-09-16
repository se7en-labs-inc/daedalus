import BigNumber from 'bignumber.js';
import Wallet, {
  WalletDelegationStatuses,
  WalletDiscovery,
  WalletSyncStateStatuses,
} from '../../../../../source/renderer/app/domains/Wallet';
import { LOVELACES_PER_ADA } from '../../../../../source/renderer/app/config/numbersConfig';

/*
 * Real `Wallet` instances, not plain objects shaped like one.
 *
 * The domain class carries eleven computed getters and the wallet screens read
 * most of them: the receive screen branches on `isRandom` against `isSequential`
 * (`domains/Wallet.ts:252-280`), the shell on `isRestoring`, the summary screen
 * on `hasAssets`, the sidebar on `isDelegating`. A literal can supply the
 * observables and cannot supply those, so every getter it omits reads
 * `undefined`, every branch that tests one takes its false arm, and the screen
 * renders a state it was never put in.
 *
 * `WalletSummaryPage.tsx:119` is the one place this fails loudly rather than
 * quietly: it throws without an active wallet. Everywhere else a half-shaped
 * wallet produces a plausible screen.
 *
 * Ids are fixed rather than generated. A workbench that shows a different wallet
 * id on every reload makes a screenshot useless as a comparison.
 */

const ada = (amount: number) =>
  new BigNumber(amount).dividedBy(LOVELACES_PER_ADA);

type WalletOverrides = Record<string, unknown>;

const baseWallet = (overrides: WalletOverrides = {}) =>
  new Wallet({
    id: 'story-wallet-0',
    addressPoolGap: 20,
    name: 'Main wallet',
    amount: ada(66_998_000_000),
    availableAmount: ada(66_998_000_000),
    reward: ada(12_500_000),
    assets: { available: [], total: [] },
    createdAt: new Date('2026-01-14T09:00:00.000Z'),
    passwordUpdateDate: new Date('2026-06-02T09:00:00.000Z'),
    hasPassword: true,
    syncState: { status: WalletSyncStateStatuses.READY },
    isLegacy: false,
    isHardwareWallet: false,
    discovery: WalletDiscovery.SEQUENTIAL,
    delegatedStakePoolId: null,
    delegationStakePoolStatus: WalletDelegationStatuses.NOT_DELEGATING,
    lastDelegatedStakePoolId: null,
    lastDelegationStakePoolStatus: null,
    pendingDelegations: [],
    votingTarget: null,
    walletNotConnected: false,
    ...overrides,
  } as never);

export const activeWallet = () => baseWallet();

// Holds a token, which is what turns on the assets half of the summary screen.
export const walletWithAssets = (total: Array<Record<string, unknown>> = []) =>
  baseWallet({
    id: 'story-wallet-assets',
    name: 'Wallet with tokens',
    assets: { available: total, total },
  });

// Mid-restore. `isRestoring` is true only while the progress quantity is under
// 100, so the number is part of the state rather than decoration on it.
export const restoringWallet = () =>
  baseWallet({
    id: 'story-wallet-restoring',
    name: 'Restoring wallet',
    syncState: {
      status: WalletSyncStateStatuses.RESTORING,
      progress: { quantity: 42, unit: 'percent' },
    },
  });

// A Byron wallet, which several screens treat as a different thing rather than
// as a wallet with a flag set.
export const legacyWallet = () =>
  baseWallet({
    id: 'story-wallet-legacy',
    name: 'Byron wallet',
    isLegacy: true,
    discovery: WalletDiscovery.RANDOM,
    amount: ada(55_555_000_000),
  });

// The receive screen has two entirely separate branches keyed on this.
export const randomWallet = () =>
  baseWallet({
    id: 'story-wallet-random',
    name: 'Random address wallet',
    discovery: WalletDiscovery.RANDOM,
  });

export const hardwareWallet = () =>
  baseWallet({
    id: 'story-wallet-hardware',
    name: 'Ledger Nano X',
    isHardwareWallet: true,
    hasPassword: false,
  });

export const emptyWallet = () =>
  baseWallet({
    id: 'story-wallet-empty',
    name: 'New wallet',
    amount: ada(0),
    availableAmount: ada(0),
    reward: ada(0),
  });

export const delegatingWallet = () =>
  baseWallet({
    id: 'story-wallet-delegating',
    name: 'Delegating wallet',
    delegatedStakePoolId:
      'pool1storyfixturepoolidentifierxxxxxxxxxxxxxxxxxxxxxx',
    delegationStakePoolStatus: WalletDelegationStatuses.DELEGATING,
    lastDelegationStakePoolStatus: WalletDelegationStatuses.DELEGATING,
  });

export const walletList = () => [
  activeWallet(),
  delegatingWallet(),
  legacyWallet(),
  restoringWallet(),
  emptyWallet(),
];
