import React from 'react';
import { observable, action as mobxAction } from 'mobx';
import { action } from 'storybook/actions';
import { useArgs } from 'storybook/preview-api';
import { find, get } from 'lodash';
import StoryDecorator from '../_support/StoryDecorator';
import StoryProvider from '../_support/StoryProvider';
import StoryLayout from '../_support/StoryLayout';
import { currentThemeOf } from '../_support/globals';
import { labelOptionsFrom } from '../_support/argTypes';
import ItemsDropdown from '../../../source/renderer/app/components/widgets/forms/ItemsDropdown';
import WalletsDropdown from '../../../source/renderer/app/components/widgets/forms/WalletsDropdown';
import WalletsDropdownLabel from '../../../source/renderer/app/components/widgets/forms/WalletsDropdownLabel';
import AssetsDropdown from '../../../source/renderer/app/components/widgets/forms/AssetsDropdown';
import STAKE_POOLS from '../../../source/renderer/app/config/stakingStakePools.dummy.json';
import currenciesList from '../../../source/renderer/app/config/currenciesList.json';
import {
  generateWallet,
  generateHash,
  generateAssetToken,
} from '../_support/utils';
import { WalletSyncStateStatuses } from '../../../source/renderer/app/domains/Wallet';

const WALLETS = [
  generateWallet('Second Wallet', '500000000'),
  // @ts-ignore ts-migrate(2345) FIXME: Argument of type '{ relativeStake: number; cost: s... Remove this comment to see the full error message
  generateWallet('Third Wallet', '100000000', STAKE_POOLS[3]),
  generateWallet(
    'Fourth Syncing Wallet',
    '50000000',
    undefined,
    undefined,
    undefined,
    true,
    WalletSyncStateStatuses.SYNCING
  ),
  generateWallet('Fifth Wallet', '7000000'),
];
const stakePoolsList = [
  ...STAKE_POOLS.slice(0, 5),
  ...STAKE_POOLS.slice(150, 155),
  ...STAKE_POOLS.slice(290, 295),
];
const assets = [
  // @ts-ignore ts-migrate(2554) FIXME: Expected 7 arguments, but got 5.
  generateAssetToken(generateHash(), '', generateHash(), 100, {
    name: 'Asset 1',
    ticker: 'ABCD',
    description: 'Asset 1 description',
  }),
  // @ts-ignore ts-migrate(2554) FIXME: Expected 7 arguments, but got 5.
  generateAssetToken(generateHash(), '', generateHash(), 200, {
    name: 'Asset 2',
    ticker: 'EFG',
    description: 'Asset 2 description',
  }),
  // @ts-ignore ts-migrate(2554) FIXME: Expected 7 arguments, but got 5.
  generateAssetToken(generateHash(), '', generateHash(), 300, {
    name: 'Asset 3',
    ticker: 'HI',
    description: 'Asset 3 description',
  }),
  // @ts-ignore ts-migrate(2554) FIXME: Expected 7 arguments, but got 5.
  generateAssetToken(generateHash(), '', generateHash(), 400, {
    name: 'Asset 4',
    ticker: 'JKL',
    description: 'Asset 4 description',
  }),
];
const firstWalletId = generateHash();
const stakePoolsOptions = stakePoolsList.reduce((obj, pool) => {
  const { name, ticker, ranking } = pool;
  obj[`[${ticker}] ${name} - (${ranking})`] = pool;
  return obj;
}, {});
// The knob selected between stake pool objects and defaulted to STAKE_POOLS[0].
// An arg holds the label and `mapping` turns it back into the pool, so the
// default is that pool's label rather than the pool. stakePoolsList opens with
// STAKE_POOLS[0] and the reduce above preserves that order.
const [firstStakePoolLabel] = Object.keys(stakePoolsOptions);

export default {
  title: 'Common / ItemsDropdown',

  decorators: [
    (story: any, context: any) => {
      if (context.name === 'CountdownWidget') {
        return story();
      }

      const onChangeAction = action('onChange');
      const state = observable({
        checked: false,
        onChange: mobxAction((value, event) => {
          state.checked = value;
          onChangeAction(value, event);
        }),
      });
      return (
        <StoryDecorator propsForChildren={state}>
          <StoryProvider>
            <StoryLayout
              activeSidebarCategory={null}
              {...context}
              currentTheme={currentThemeOf(context)}
            >
              <div
                style={{
                  margin: 50,
                }}
              >
                {story()}
              </div>
            </StoryLayout>
          </StoryProvider>
        </StoryDecorator>
      );
    },
  ],
};

export const Generic = {
  args: {
    value: 'usd',
    hasError: false,
  },

  render: () => {
    const [{ value, hasError }, updateArgs] = useArgs();
    const options = Object.values(currenciesList).map((currency, index) => {
      const label = get(currency, 'name.en-US');
      const code = get(currency, 'code');
      const decimalDigits = get(currency, 'decimalDigits');
      const detail = `Code: ${code} - Decimal digits: ${decimalDigits}`;
      const isSyncing = index === 1;
      return {
        label,
        detail,
        value: code,
        isSyncing,
      };
    });
    return (
      <ItemsDropdown
        options={options}
        // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
        value={value}
        handleChange={(newValue) =>
          updateArgs({
            value: newValue,
          })
        }
        // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
        hasSearch
        error={hasError ? 'Error message' : ''}
      />
    );
  },
};

export const Wallets = {
  args: {
    walletId: firstWalletId,
    name: 'First Wallet',
    amount: 1000000000,
    stakePool: firstStakePoolLabel,
    isSyncing: false,
    isHardwareWallet: true,
    hasStakePools: true,
    label: 'Wallets',
    placeholder: undefined,
    syncingLabel: 'syncing',
    hasSearch: false,
  },

  // The five knobs the first wallet is built from carried a `First wallet`
  // group id, which is a table category here.
  argTypes: {
    name: { table: { category: 'First wallet' } },
    amount: { table: { category: 'First wallet' } },
    stakePool: {
      ...labelOptionsFrom(stakePoolsOptions),
      table: { category: 'First wallet' },
    },
    isSyncing: { table: { category: 'First wallet' } },
    isHardwareWallet: { table: { category: 'First wallet' } },
    hasStakePools: { table: { category: 'First wallet' } },
    placeholder: { control: 'text' },
  },

  render: () => {
    const [
      {
        walletId,
        name,
        amount,
        stakePool,
        isSyncing,
        isHardwareWallet,
        hasStakePools,
        label,
        placeholder,
        syncingLabel,
        hasSearch,
      },
      updateArgs,
    ] = useArgs();
    const firstWallet = generateWallet(
      name,
      `${amount}`,
      undefined,
      undefined,
      stakePoolsOptions[stakePool],
      true,
      isSyncing
        ? WalletSyncStateStatuses.SYNCING
        : WalletSyncStateStatuses.READY,
      isHardwareWallet,
      firstWalletId
    );
    const wallets = [firstWallet, ...WALLETS];
    return (
      <WalletsDropdown
        getStakePoolById={(poolId) =>
          find(STAKE_POOLS, (pool) => pool.id === poolId)
        }
        // @ts-ignore ts-migrate(2322) FIXME: Type '{ getStakePoolById: (poolId: any) => { relat... Remove this comment to see the full error message
        label={label}
        numberOfStakePools={hasStakePools ? STAKE_POOLS.length : 0}
        onChange={(newWalletId) =>
          updateArgs({
            walletId: newWalletId,
          })
        }
        placeholder={placeholder}
        syncingLabel={syncingLabel}
        value={walletId}
        wallets={wallets}
        hasSearch={hasSearch}
      />
    );
  },
};

export const WalletsLabelOnly = {
  args: {
    walletName: 'Wallet name',
    walletStakePool: firstStakePoolLabel,
    isHardwareWallet: true,
    isSyncing: false,
    hasStakePools: true,
    syncingLabel: 'syncing',
  },

  argTypes: {
    walletStakePool: labelOptionsFrom(stakePoolsOptions),
  },

  render: ({
    walletName,
    walletStakePool,
    isHardwareWallet,
    isSyncing,
    hasStakePools,
    syncingLabel,
  }) => {
    const wallet = generateWallet(
      walletName,
      '1000000000',
      undefined,
      undefined,
      stakePoolsOptions[walletStakePool],
      true,
      undefined,
      isHardwareWallet
    );
    return (
      <div
        style={{
          fontFamily: 'var(--font-regular)',
          fontSize: 14,
          lineHeight: 18,
          color:
            'var(--theme-delegation-steps-choose-wallet-custom-value-color)',
        }}
      >
        <WalletsDropdownLabel
          getStakePoolById={(poolId) =>
            find(STAKE_POOLS, (stakePool) => stakePool.id === poolId)
          }
          // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
          isSyncing={isSyncing}
          numberOfStakePools={hasStakePools ? STAKE_POOLS.length : 0}
          syncingLabel={syncingLabel}
          wallet={wallet}
        />
      </div>
    );
  },

  name: 'Wallets - Label only',
};

export const Assets = {
  args: {
    assetId: assets[0].fingerprint,
  },

  render: () => {
    const [{ assetId }, updateArgs] = useArgs();
    return (
      <AssetsDropdown
        assets={assets}
        // @ts-ignore ts-migrate(2322) FIXME: Type '{ assets: AssetToken[]; value: string; onCha... Remove this comment to see the full error message
        value={assetId}
        onChange={(newAssetId) =>
          updateArgs({
            assetId: newAssetId,
          })
        }
      />
    );
  },
};
