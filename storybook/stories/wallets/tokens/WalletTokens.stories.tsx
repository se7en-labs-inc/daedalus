import React from 'react';
import { action } from '@storybook/addon-actions';
import { useArgs } from '@storybook/preview-api';
import BigNumber from 'bignumber.js';
// Helpers and config
import {
  generateAssetToken,
  generateWallet,
  generateHash,
} from '../../_support/utils';
import WalletsWrapper from '../_utils/WalletsWrapper';
// Screens
import WalletTokens from '../../../../source/renderer/app/components/wallet/tokens/wallet-tokens/WalletTokens';

const assets = [
  generateAssetToken(
    '65bc72542b0ca20391caaf66a4d4e7897d282f9c136cd3513136945c',
    '',
    'tokenb0ca20391caaf66a4d4e7897d282f9c136cd3513136945c2542',
    100,
    {
      name: 'MakerDAO',
      ticker: 'DAI',
      description: 'Test description',
      url: 'http://example.com',
      logo: '',
    }
  ),
  generateAssetToken(
    '65bc72542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
    '546f6b656e2077697468206c61726765206e616d65',
    'tokenb0ca20391caaf66a4d4d7897d281f9c136cd3513136945b2342',
    400
  ),
  generateAssetToken(
    '65bc72542b0ca20391caaf66a4d4d7897e291f9c136cd3513136945c',
    '',
    'tokenb0ca20391caaf66a4d4d7897d281f9c136cd3513136945b2341',
    0,
    {
      name: 'Nope',
      ticker: 'NOPE',
      description: 'The one with zero balance',
      url: 'http://example.com',
      logo: '',
    }
  ),
  generateAssetToken(
    '65ac82542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
    '',
    'tokenb0ca20391caaf66a4d4d7897d281f9c136cd3513136945b2542',
    100,
    {
      name: 'Tether',
      ticker: 'USDT',
      description: 'Test description',
      url: 'http://example.com',
      logo: '',
    }
  ),
  generateAssetToken(
    '65cn72542b0ca10391caaf66a4d4d2897d281f3c136cd3513136945b',
    '',
    'tokenb0ca10391caaf66a4d4d2897d281f3c136cd3513136945b2542',
    100,
    {
      name: 'USD Coin',
      ticker: 'USDC',
      description: 'Test description',
      url: 'http://example.com',
      logo: '',
    }
  ),
];
const walletTokens = {
  available: [
    {
      id: generateHash(),
      policyId: '65bc72542b0ca20391caaf66a4d4e7897d282f9c136cd3513136945c',
      assetName: '',
      quantity: new BigNumber(400),
      uniqueId: '65bc72542b0ca20391caaf66a4d4e7897d282f9c136cd3513136945c',
    },
    {
      id: generateHash(),
      policyId: '65bc72542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
      assetName: '',
      quantity: new BigNumber(100),
      uniqueId: '65bc72542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
    },
    {
      id: generateHash(),
      policyId: '65ac82542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
      assetName: '',
      quantity: new BigNumber(200),
      uniqueId: '65ac82542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
    },
    {
      id: generateHash(),
      policyId: '65cn72542b0ca10391caaf66a4d4d2897d281f3c136cd3513136945b',
      assetName: '',
      quantity: new BigNumber(300),
      uniqueId: '65cn72542b0ca10391caaf66a4d4d2897d281f3c136cd3513136945b',
    },
  ],
  total: [
    {
      id: generateHash(),
      policyId: '65bc72542b0ca20391caaf66a4d4e7897d282f9c136cd3513136945c',
      assetName: '',
      quantity: new BigNumber(400),
      uniqueId: '65bc72542b0ca20391caaf66a4d4e7897d282f9c136cd3513136945c',
    },
    {
      id: generateHash(),
      policyId: '65bc72542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
      assetName: '',
      quantity: new BigNumber(100),
      uniqueId: '65bc72542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
    },
    {
      id: generateHash(),
      policyId: '65ac82542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
      assetName: '',
      quantity: new BigNumber(200),
      uniqueId: '65ac82542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
    },
    {
      id: generateHash(),
      policyId: '65cn72542b0ca10391caaf66a4d4d2897d281f3c136cd3513136945b',
      assetName: '',
      quantity: new BigNumber(300),
      uniqueId: '65cn72542b0ca10391caaf66a4d4d2897d281f3c136cd3513136945b',
    },
  ],
};

export default {
  title: 'Wallets / Tokens',
  decorators: [WalletsWrapper],
};

export const _WalletTokens = {
  args: {
    hasTokens: true,
    isLoadingAssets: false,
    searchValue: '',
    favorites: {},
  },

  render: () => {
    const [{ hasTokens, isLoadingAssets, searchValue, favorites }, updateArgs] =
      useArgs();
    return (
      <WalletTokens
        assets={hasTokens ? assets : []}
        assetSettingsDialogWasOpened
        currentLocale="en-US"
        isLoadingAssets={isLoadingAssets}
        onAssetSettings={action('onAssetSettings')}
        onCopyAssetParam={action('onCopyAssetParam')}
        onOpenAssetSend={action('onOpenAssetSend')}
        searchValue={searchValue}
        wallet={generateWallet('Wallet name', '45119903750165', walletTokens)}
        onToggleFavorite={({ uniqueId }: { uniqueId: string }) => {
          updateArgs({
            favorites: { ...favorites, [uniqueId]: !favorites[uniqueId] },
          });
        }}
        tokenFavorites={favorites}
      />
    );
  },

  name: 'WalletTokens',
};
