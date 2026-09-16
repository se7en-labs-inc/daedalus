import React, { Component } from 'react';
// @ts-ignore ts-migrate(2305) FIXME: Module '"react"' has no exported member 'Node'.
import type { Node } from 'react';
import { Provider, observer } from 'mobx-react';
import faker from '@faker-js/faker';
import { observable, computed, runInAction } from 'mobx';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import actions from '../../../source/renderer/app/actions';
import { WalletSyncStateStatuses } from '../../../source/renderer/app/domains/Wallet';
import {
  DiscreetModeFeatureProvider,
  BrowserLocalStorageBridge,
} from '../../../source/renderer/app/features';
import { DiscreetModeSync } from './DiscreetModeSync';
import {
  withStoreOverrides,
  type StoreOverrides,
} from './harness/storeDefaults';
import { activeWallet } from './harness/fixtures/wallets';

type Props = {
  children: Node;
  /*
   * A screen story names the stores it reads and the fields it reads on them.
   * Merged over the full 24-key default map, so an override is two or three
   * lines rather than a second fixture. See harness/storeDefaults.ts.
   */
  storeOverrides?: StoreOverrides;
};
export const WALLETS = [
  {
    id: '0',
    name: 'With Password',
    amount: new BigNumber(0),
    reward: new BigNumber(0),
    hasPassword: true,
    passwordUpdateDate: moment().subtract(1, 'month').toDate(),
    syncState: {
      status: WalletSyncStateStatuses.READY,
    },
    isNotResponding: false,
    isRestoring: false,
    isLegacy: false,
    recoveryPhraseVerificationDate: new Date(),
    delegatedStakePoolId: 'kfhdsdkhfskdjfhskdhf',
    assets: {
      total: [
        {
          policyId: '008',
          assetName: 'NFT',
          quantity: new BigNumber(0),
          uniqueId: '9998',
        },
      ],
    },
  },
  {
    id: '1',
    name: 'No Password',
    amount: new BigNumber(66.998),
    reward: new BigNumber(0),
    hasPassword: false,
    passwordUpdateDate: new Date(),
    syncState: {
      status: WalletSyncStateStatuses.READY,
    },
    isNotResponding: false,
    isRestoring: false,
    isLegacy: false,
    recoveryPhraseVerificationDate: new Date(),
    delegatedStakePoolId: 'kfhdsdkhfskdjfhskdhf',
  },
  {
    id: '2',
    name: 'Legacy with funds',
    amount: new BigNumber(55.555),
    reward: new BigNumber(0),
    hasPassword: true,
    passwordUpdateDate: moment().subtract(1, 'month').toDate(),
    syncState: {
      status: WalletSyncStateStatuses.READY,
    },
    isNotResponding: false,
    isRestoring: false,
    isLegacy: true,
    recoveryPhraseVerificationDate: moment().subtract(200, 'days').toDate(),
    delegatedStakePoolId: 'kfhdsdkhfskdjfhskdhf',
  },
  {
    id: '3',
    name: 'Legacy with no funds',
    amount: new BigNumber(0),
    reward: new BigNumber(0),
    hasPassword: true,
    passwordUpdateDate: moment().subtract(1, 'month').toDate(),
    syncState: {
      status: WalletSyncStateStatuses.READY,
    },
    isNotResponding: false,
    isRestoring: false,
    isLegacy: true,
    recoveryPhraseVerificationDate: moment().subtract(200, 'days').toDate(),
  },
  {
    id: '4',
    name: 'Restoring',
    amount: new BigNumber(12.345),
    reward: new BigNumber(0),
    hasPassword: true,
    passwordUpdateDate: moment().subtract(1, 'month').toDate(),
    syncState: {
      progress: {
        quantity: 50,
        unit: 'percent',
      },
      status: WalletSyncStateStatuses.RESTORING,
    },
    isNotResponding: false,
    isRestoring: true,
    isLegacy: false,
    recoveryPhraseVerificationDate: moment().subtract(400, 'days').toDate(),
  },
  {
    id: '5',
    name: 'Not responding',
    amount: new BigNumber(66.998),
    reward: new BigNumber(0),
    hasPassword: true,
    passwordUpdateDate: moment().subtract(1, 'month').toDate(),
    syncState: {
      status: WalletSyncStateStatuses.NOT_RESPONDING,
    },
    isNotResponding: true,
    isRestoring: false,
    isLegacy: false,
    recoveryPhraseVerificationDate: new Date(),
    delegatedStakePoolId: 'kfhdsdkhfskdjfhskdhf',
  },
];
export const WALLETS_V2 = [
  {
    id: '1',
    name: 'Wallet 1',
    amount: new BigNumber(faker.finance.amount()),
    reward: new BigNumber(faker.finance.amount()),
    delegatedStakePoolId: 'kfhdsdkhfskdjfhskdhf',
  },
  {
    id: '2',
    name: 'Wallet 2',
    amount: new BigNumber(faker.finance.amount()),
    reward: new BigNumber(faker.finance.amount()),
    delegatedStakePoolId: 'kfhdsdkhfskdjfhskdhf',
  },
  {
    id: '3',
    name: 'Wallet 3',
    amount: new BigNumber(faker.finance.amount()),
    reward: new BigNumber(faker.finance.amount()),
    delegatedStakePoolId: 'kfhdsdkhfskdjfhskdhf',
  },
  {
    id: '4',
    name: 'Wallet 4',
    amount: new BigNumber(faker.finance.amount()),
    reward: new BigNumber(faker.finance.amount()),
    delegatedStakePoolId: 'kfhdsdkhfskdjfhskdhf',
  },
  {
    id: '5',
    name: 'Wallet 5',
    amount: new BigNumber(faker.finance.amount()),
    reward: new BigNumber(faker.finance.amount()),
  },
];

const coinSelectionResponse = {
  inputs: {
    address: '',
    amount: {
      quantity: 1,
      unit: 'lovelace',
    },
    id: '001',
    index: 1,
    derivationPath: [''],
  },
  outputs: {
    address: '',
    amount: {
      quantity: 1,
      unit: 'lovelace',
    },
    derivationPath: [''],
    assets: [
      {
        policyId: '',
        assetName: 'NFT',
        quantity: 1,
      },
    ],
  },
  certificates: [
    {
      pool: '',
      certificateType: 'register_reward_account',
      rewardAccountPath: [''],
    },
  ],
  deposits: new BigNumber(10),
  depositsReclaimed: new BigNumber(1),
  withdrawals: [],
  fee: new BigNumber(0.2),
  metadata: null,
};
@observer
class StoryProvider extends Component<Props> {
  @observable
  activeWalletId = '0';

  @computed
  get storiesProps(): {} {
    return {
      wallets: WALLETS,
      activeWalletId: this.activeWalletId,
      setActiveWalletId: this.setActiveWalletId,
    };
  }

  /*
   * The fixtures this provider has always supplied. They carry shapes the
   * component-level stories depend on, so they sit between the harness defaults
   * and whatever a screen story asks for.
   */
  @computed
  get providerFixtures(): StoreOverrides {
    return {
      assets: {
        getAsset: () => {
          return {
            coinSelection: coinSelectionResponse,
            receiver:
              'addr1qzhk85furdn6r9tlyp2q23q9vq7nfl420j7y0yqp3hf6yw7jar5rnzqr4h3g9whm0zjh65utc2ty5uqtcpm0rm7ahj0qq75een',
            selectedAssets: [
              {
                assetName: 'coin',
                fingerprint: 'urdn6r9tlyp2q23q9vq7nfl420',
                uniqueId: 'u000',
                policyId: '003',
                quantity: new BigNumber(2),
              },
            ],
            assetsAmounts: [''],
            amount: new BigNumber(20),
            totalAmount: new BigNumber(20),
            transactionFee: new BigNumber(20),
            adaAmount: 20,
            selectedAddress:
              'addr1qzhk85furdn6r9tlyp2q23q9vq7nfl420j7y0yqp3hf6yw7jar5rnzqr4h3g9whm0zjh65utc2ty5uqtcpm0rm7ahj0qq75ytr',
          };
        },
      },
      wallets: {
        /*
         * A real `Wallet` instance rather than the literal from the list below.
         *
         * The domain class carries eleven computed getters and the wallet
         * screens branch on most of them: `isRandom` against `isSequential` on
         * the receive screen, `isRestoring` on the shell, `hasAssets` on the
         * summary. A literal supplies the observables and none of the getters,
         * so each one reads `undefined` and every branch testing it takes its
         * false arm, producing a screen the application cannot actually be in.
         *
         * `WALLETS` below is unchanged and still feeds `storiesProps`, which is
         * what the component corpus's own layout reads. Nothing outside the
         * screen corpus reads `stores.wallets.active`.
         */
        active: activeWallet(),
        sendMoney: () => {},
        sendMoneyRequest: {
          isExecuting: false,
          reset: () => {},
        },
      },
      hardwareWallets: {
        _resetTransaction: () => {},
        sendMoneyRequest: () => {},
        isTransactionPending: false,
        checkIsTrezorByWalletId: () => {},
        initiateTransaction: null,
      },
    };
  }

  @computed
  get stores(): {} {
    /*
     * Three layers, each merged one key deep rather than replaced: the harness
     * defaults, then this provider's fixtures, then the story's own overrides.
     *
     * Merging rather than spreading at the same level matters. Spread, a screen
     * story naming `wallets` to set one flag would silently take away the active
     * wallet this provider supplies, and the screen would render the state it
     * shows with no wallet selected while claiming to be on one. Measured: that
     * is exactly what the top bar story did.
     */
    const overrides = this.props.storeOverrides || {};
    const fixtures = this.providerFixtures;
    const merged: StoreOverrides = { ...fixtures };
    Object.keys(overrides).forEach((key) => {
      merged[key] = { ...(fixtures[key] || {}), ...overrides[key] };
    });
    return withStoreOverrides(merged);
  }

  setActiveWalletId = (walletId: string) =>
    runInAction(() => {
      this.activeWalletId = walletId;
    });

  render() {
    return (
      <Provider
        stores={this.stores}
        actions={actions}
        storiesProps={this.storiesProps}
      >
        <BrowserLocalStorageBridge>
          <DiscreetModeFeatureProvider>
            <>
              {this.props.children}
              <DiscreetModeSync />
            </>
          </DiscreetModeFeatureProvider>
        </BrowserLocalStorageBridge>
      </Provider>
    );
  }
}

export default StoryProvider;
