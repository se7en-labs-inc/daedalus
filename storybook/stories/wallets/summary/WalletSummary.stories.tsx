import React from 'react';
import BigNumber from 'bignumber.js';
// Assets and helpers
import { action } from '@storybook/addon-actions';
import {
  generateAssetToken,
  generateHash,
  generateRewardForWallet,
  generateWallet,
} from '../../_support/utils';
import WalletsWrapper, { walletsLayoutArgs } from '../_utils/WalletsWrapper';
import { localeOf } from '../../_support/globals';
import {
  inCategory,
  labelOptionsFrom,
  optionsFrom,
} from '../../_support/argTypes';
import currenciesList from '../../../../source/renderer/app/config/currenciesList.json';
// Screens
import WalletSummary from '../../../../source/renderer/app/components/wallet/summary/WalletSummary';

const allAssets = [
  generateAssetToken(
    '65bc72542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
    '',
    'token1rjklcrnsdzqp65wjgrg55sy9723kw09m5z1234',
    100
  ),
  generateAssetToken(
    '65ac82542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
    '',
    'token1rjklcrnsdzqp65wjgrg55sy9723kw09m5z2345',
    100
  ),
  generateAssetToken(
    '65cn72542b0ca10391caaf66a4d4d2897d281f3c136cd3513136945b',
    '',
    'token1rjklcrnsdzqp65wjgrg55sy9723kw09m5z3456',
    100,
    {
      name: 'USD Coin',
      ticker: 'USDC',
      description: 'Test description',
      url: 'http://example.com',
      logo: '',
    }
  ),
  generateAssetToken(
    '65bc72542b0ca20391caaf66a4d4e7897d282f9c136cd3513136945c',
    '',
    'token1rjklcrnsdzqp65wjgrg55sy9723kw09m5z4567',
    100,
    {
      name: 'MakerDAO',
      ticker: 'DAI',
      description: 'Test description',
      url: 'http://example.com',
      logo: '',
    }
  ),
];
const assets = {
  available: [
    {
      id: generateHash(),
      policyId: '65bc72542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
      uniqueId: '65bc72542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
      assetName: '',
      quantity: new BigNumber(45119903.750165),
    },
    {
      id: generateHash(),
      policyId: '65ac82542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
      uniqueId: '65ac82542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
      assetName: '',
      quantity: new BigNumber(200),
    },
    {
      id: generateHash(),
      policyId: '65cn72542b0ca10391caaf66a4d4d2897d281f3c136cd3513136945b',
      uniqueId: '65cn72542b0ca10391caaf66a4d4d2897d281f3c136cd3513136945b',
      assetName: '',
      quantity: new BigNumber(300),
    },
    {
      id: generateHash(),
      policyId: '65bc72542b0ca20391caaf66a4d4e7897d282f9c136cd3513136945c',
      uniqueId: '65bc72542b0ca20391caaf66a4d4e7897d282f9c136cd3513136945c',
      assetName: '',
      quantity: new BigNumber(400),
    },
  ],
  total: [
    {
      id: generateHash(),
      policyId: '65bc72542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
      uniqueId: '65bc72542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
      assetName: '',
      quantity: new BigNumber(45119903.750165),
    },
    {
      id: generateHash(),
      policyId: '65ac82542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
      uniqueId: '65ac82542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
      assetName: '',
      quantity: new BigNumber(200),
    },
    {
      id: generateHash(),
      policyId: '65cn72542b0ca10391caaf66a4d4d2897d281f3c136cd3513136945b',
      uniqueId: '65cn72542b0ca10391caaf66a4d4d2897d281f3c136cd3513136945b',
      assetName: '',
      quantity: new BigNumber(300),
    },
    {
      id: generateHash(),
      policyId: '65bc72542b0ca20391caaf66a4d4e7897d282f9c136cd3513136945c',
      uniqueId: '65bc72542b0ca20391caaf66a4d4e7897d282f9c136cd3513136945c',
      assetName: '',
      quantity: new BigNumber(400),
    },
  ],
};
const walletAssets = assets.total.map((assetTotal) => {
  const assetData = allAssets.find(
    (item) => item.policyId === assetTotal.policyId
  );
  let fingerprint;

  if (!assetData || !assetData.fingerprint) {
    fingerprint = `token${assetTotal.policyId}${assetTotal.assetName}`.substr(
      0,
      44
    );
  } else {
    fingerprint = assetData.fingerprint;
  }

  return {
    policyId: assetTotal.policyId,
    assetName: assetTotal.assetName,
    uniqueId: assetTotal.policyId + assetTotal.assetName,
    fingerprint,
    quantity: assetTotal.quantity,
    decimals: 0,
    recommendedDecimals: null,
    metadata: assetData
      ? assetData.metadata
      : {
          name: '',
          ticker: '',
          description: '',
        },
  };
});

export default {
  title: 'Wallets / Summary',
  args: walletsLayoutArgs,
  decorators: [WalletsWrapper],
};

const currencyArgs = {
  currencyState: 'fetched',
  currencySelected: 'usd',
};

const headerArgs = {
  numberOfTransactions: 100,
  numberOfRecentTransactions: 100,
  numberOfPendingTransactions: 0,
  isLoadingTransactions: false,
};

const firstAssetArgs = {
  quantity: 100,
  decimals: 0,
  recommendedDecimals: 0,
  metadataName: 'FIRST',
  metadataTicker: '',
  metadataDescription: '',
};

export const _WalletSummary = {
  args: {
    ...currencyArgs,
    ...headerArgs,
    ...firstAssetArgs,
    isLoadingAssets: false,
    hasAssetsEnabled: true,
    assetSettingsDialogWasOpened: true,
  },

  argTypes: {
    ...inCategory('Currency', currencyArgs, {
      currencyState: optionsFrom({
        Fetched: 'fetched',
        'Fetching rate': 'loading',
        'Disabled or unavailable': 'off',
      }),
      // The options were the currency records themselves. An argType's options
      // have to be primitives, so the arg holds the code and the story looks
      // the record up.
      currencySelected: labelOptionsFrom(currenciesList),
    }),
    ...inCategory('Header', headerArgs),
    ...inCategory('First Asset', firstAssetArgs),
  },

  render: (args, context) => {
    const locale = localeOf(context);
    const { currencyState } = args;
    let currencyIsFetchingRate = false;
    let currencyIsActive = true;
    let currencyLastFetched = new Date();

    if (currencyState === 'loading') {
      currencyIsFetchingRate = true;
      currencyLastFetched = null;
    } else if (currencyState === 'off') {
      currencyIsActive = false;
    }

    const currencySelected = currenciesList[args.currencySelected];
    const wallet = generateWallet('Wallet name', '45119903750165', assets);
    const reward = generateRewardForWallet(wallet, '0');
    const [firstAsset] = walletAssets;
    return (
      <WalletSummary
        wallet={wallet}
        reward={reward}
        numberOfTransactions={args.numberOfTransactions}
        numberOfRecentTransactions={args.numberOfRecentTransactions}
        numberOfPendingTransactions={args.numberOfPendingTransactions}
        isLoadingTransactions={args.isLoadingTransactions}
        currentLocale={locale}
        currencyIsFetchingRate={currencyIsFetchingRate}
        currencyIsActive={currencyIsActive}
        // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
        currencySelected={currencySelected}
        currencyRate={0.321}
        onToggleFavorite={action('onToggleFavorite')}
        tokenFavorites={{}}
        currencyLastFetched={currencyLastFetched}
        onCurrencySettingClick={action('onCurrencySettingClick')}
        assets={[
          {
            ...firstAsset,
            quantity: new BigNumber(args.quantity),
            decimals: args.decimals,
            recommendedDecimals: args.recommendedDecimals,
            metadata: {
              name: args.metadataName,
              ticker: args.metadataTicker,
              description: args.metadataDescription,
            },
          },
          ...walletAssets.slice(1),
        ]}
        isLoadingAssets={args.isLoadingAssets}
        onOpenAssetSend={action('onOpenAssetSend')}
        onCopyAssetParam={action('onCopyAsset')}
        onAssetSettings={action('onAssetSettings')}
        // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
        hasAssetsEnabled={args.hasAssetsEnabled}
        assetSettingsDialogWasOpened={args.assetSettingsDialogWasOpened}
        onExternalLinkClick={action('onExternalLinkClick')}
        onViewAllButtonClick={action('onViewAllButtonClick')}
      />
    );
  },
};
