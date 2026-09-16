import React from 'react';
import { action } from 'storybook/actions';
import { useArgs } from 'storybook/preview-api';
import BigNumber from 'bignumber.js';
import StoryDecorator from '../../_support/StoryDecorator';
import StoryProvider from '../../_support/StoryProvider';
import {
  generateAssetToken,
  generateWallet,
  generateHash,
} from '../../_support/utils';
import type { WalletTokens } from '../../../../source/renderer/app/api/assets/types';
// Screens
import WalletTokensList from '../../../../source/renderer/app/components/wallet/tokens/wallet-tokens-list/WalletTokensList';

const assets = [
  generateAssetToken(
    '65bc72542b0ca20391caaf66a4d4e7897d282f9c136cd3513136945c',
    '',
    'tokenb0ca20391caaf66a4d4e7897d282f9c136cd3513136945c2541',
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
    '',
    'tokenb0ca20391caaf66a4d4e7897d282f9c136cd3513136945c2542',
    400
  ),
  generateAssetToken(
    '65ac82542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
    '',
    'tokenb0ca20391caaf66a4d4e7897d282f9c136cd3513136945c2544',
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
    'tokenb0ca20391caaf66a4d4e7897d282f9c136cd3513136945c2543',
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
    '65bc72542b0ca20391caaf66a4d4d7s97d281f9c136cd3513136945b',
    '',
    'tokenb0ca20391caaf66aad4e7897d282f9c136cd3513136945c2542',
    500,
    {
      name: 'Little',
      ticker: 'LTTL',
      description: '',
    },
    4
  ),
];
const walletTokens: WalletTokens = {
  available: [
    {
      // @ts-ignore ts-migrate(2322) FIXME: Type '{ id: string; policyId: string; assetName: s... Remove this comment to see the full error message
      id: generateHash(),
      policyId: '65bc72542b0ca20391caaf66a4d4e7897d282f9c136cd3513136945c',
      assetName: '',
      quantity: new BigNumber(400),
      uniqueId: '65bc72542b0ca20391caaf66a4d4e7897d282f9c136cd3513136945c',
    },
    {
      // @ts-ignore ts-migrate(2322) FIXME: Type '{ id: string; policyId: string; assetName: s... Remove this comment to see the full error message
      id: generateHash(),
      policyId: '65bc72542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
      assetName: '',
      quantity: new BigNumber(100),
      uniqueId: '65bc72542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
    },
    {
      // @ts-ignore ts-migrate(2322) FIXME: Type '{ id: string; policyId: string; assetName: s... Remove this comment to see the full error message
      id: generateHash(),
      policyId: '65ac82542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
      assetName: '',
      quantity: new BigNumber(200),
      uniqueId: '65ac82542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
    },
    {
      // @ts-ignore ts-migrate(2322) FIXME: Type '{ id: string; policyId: string; assetName: s... Remove this comment to see the full error message
      id: generateHash(),
      policyId: '65cn72542b0ca10391caaf66a4d4d2897d281f3c136cd3513136945b',
      assetName: '',
      quantity: new BigNumber(300),
      uniqueId: '65cn72542b0ca10391caaf66a4d4d2897d281f3c136cd3513136945b',
    },
  ],
  total: [
    {
      // @ts-ignore ts-migrate(2322) FIXME: Type '{ id: string; policyId: string; assetName: s... Remove this comment to see the full error message
      id: generateHash(),
      policyId: '65bc72542b0ca20391caaf66a4d4e7897d282f9c136cd3513136945c',
      assetName: '',
      quantity: new BigNumber(400),
      uniqueId: '65bc72542b0ca20391caaf66a4d4e7897d282f9c136cd3513136945c',
    },
    {
      // @ts-ignore ts-migrate(2322) FIXME: Type '{ id: string; policyId: string; assetName: s... Remove this comment to see the full error message
      id: generateHash(),
      policyId: '65bc72542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
      assetName: '',
      quantity: new BigNumber(100),
      uniqueId: '65bc72542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
    },
    {
      // @ts-ignore ts-migrate(2322) FIXME: Type '{ id: string; policyId: string; assetName: s... Remove this comment to see the full error message
      id: generateHash(),
      policyId: '65ac82542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
      assetName: '',
      quantity: new BigNumber(200),
      uniqueId: '65ac82542b0ca20391caaf66a4d4d7897d281f9c136cd3513136945b',
    },
    {
      // @ts-ignore ts-migrate(2322) FIXME: Type '{ id: string; policyId: string; assetName: s... Remove this comment to see the full error message
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

  decorators: [
    (story) => (
      <StoryProvider>
        <StoryDecorator>{story()}</StoryDecorator>
      </StoryProvider>
    ),
  ],
};

export const _WalletTokensList = {
  args: {
    hasTokens: true,
    isLoadingAssets: false,
    hasViewAllButton: false,
    title: 'Tokens',
    favorites: {},
  },

  render: () => {
    const [
      { hasTokens, isLoadingAssets, hasViewAllButton, title, favorites },
      updateArgs,
    ] = useArgs();
    return (
      <WalletTokensList
        assets={hasTokens ? assets : []}
        assetSettingsDialogWasOpened
        currentLocale="en-US"
        isLoadingAssets={isLoadingAssets}
        onAssetSettings={action('onAssetSettings')}
        onCopyAssetParam={action('onCopyAssetParam')}
        onOpenAssetSend={action('onOpenAssetSend')}
        onViewAllButtonClick={
          hasViewAllButton ? action('onViewAllButtonClick') : null
        }
        title={title}
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

  name: 'WalletTokensList',
};
