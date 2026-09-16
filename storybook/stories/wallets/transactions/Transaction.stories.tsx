import React from 'react';
import { action } from 'storybook/actions';
import BigNumber from 'bignumber.js';
// Screens
import Transaction from '../../../../source/renderer/app/components/wallet/transactions/Transaction';
// Assets and helpers
import StoryDecorator from '../../_support/StoryDecorator';
import StoryProvider from '../../_support/StoryProvider';
import {
  generateHash,
  generatePolicyIdHash, // generate eAsset,
} from '../../_support/utils';
import {
  WalletTransaction,
  TransactionTypes,
  TransactionStates,
} from '../../../../source/renderer/app/domains/WalletTransaction';
import { LOVELACES_PER_ADA } from '../../../../source/renderer/app/config/numbersConfig';
import { inCategory, optionsFrom } from '../../_support/argTypes';

const date = new Date();
const assetsMetadata = [
  {
    name: 'MakerDAO',
    ticker: 'DAI',
    description: 'Test description',
    unit: {
      name: 'DAI',
      decimals: 6,
    },
    url: 'http://example.com',
    logo: '',
  },
  {
    name: 'TrueUSD',
    ticker: 'TUSD',
    description: 'Test description',
    unit: {
      name: 'TUSD',
      decimals: 6,
    },
    url: 'http://example.com',
    logo: '',
  },
  {
    name: 'Tether',
    ticker: 'USDT',
    description: 'Test description',
    unit: {
      name: 'USDT',
      decimals: 6,
    },
    url: 'http://example.com',
    logo: '',
  },
  {
    name: 'USD Coin',
    ticker: 'USDC',
    description: 'Test description',
    unit: {
      name: 'USDC',
      decimals: 6,
    },
    url: 'http://example.com',
    logo: '',
  },
];
const transactionTokens = [
  {
    policyId: generatePolicyIdHash(),
    uniqueId: generatePolicyIdHash(),
    assetName: '',
    quantity: new BigNumber(200),
    address: '65bc72542b0ca20391caaf66a4d4e7897d282f9c136cd3513136945c',
    fingerprint: 'tokenb0ca20391caaf66a4d4e7897d282f9c136cd3513136945c2542',
  },
  {
    policyId: generatePolicyIdHash(),
    uniqueId: generatePolicyIdHash(),
    assetName: '',
    quantity: new BigNumber(200),
    address: '65bc72542b0ca20391caaf66a4d4e7897d282f9c136cd3513136945c',
    fingerprint: 'tokenb0ca20391caaf66a4d4d7897d281f9c136cd3513136945b2342',
  },
  {
    policyId: generatePolicyIdHash(),
    uniqueId: generatePolicyIdHash(),
    assetName: '',
    quantity: new BigNumber(200),
    address: '65bc72542b0ca20391caaf66a4d4e7897d282f9c136cd3513136945c',
    fingerprint: 'tokenb0ca20391caaf66a4d4d7897d281f9c136cd3513136945b2542',
  },
  {
    policyId: generatePolicyIdHash(),
    uniqueId: generatePolicyIdHash(),
    assetName: '',
    quantity: new BigNumber(200),
    address: '65bc72542b0ca20391caaf66a4d4e7897d282f9c136cd3513136945c',
    fingerprint: 'tokenb0ca10391caaf66a4d4d2897d281f3c136cd3513136945b2542',
  },
];

export default {
  title: 'Wallets / Transactions',

  decorators: [
    (story) => (
      <StoryProvider>
        <StoryDecorator>{story()}</StoryDecorator>
      </StoryProvider>
    ),
  ],
};

// Two knobs were both labelled `amount`, one in each group, and addon-knobs
// keys a control by its group and its label together, so they were two
// controls. Two args cannot share a name, so the asset's is named for the asset.
const firstAssetArgs = {
  assetAmount: 10,
  assetDecimals: 1,
  hasMetadata: true,
  metadataName: 'MakerDAO',
  metadataTicker: 'DAO',
  metadataDescription: 'Test description',
  metadataUnitName: 'DAI',
};

const transactionArgs = {
  amount: 10,
  confirmations: 10,
  slotNumber: 10,
  epochNumber: 10,
  fee: 1,
  deposit: 1,
  isExpanded: true,
  isRestoreActive: false,
};

export const _Transaction = {
  args: {
    direction: 'incoming',
    ...firstAssetArgs,
    ...transactionArgs,
    isLastInList: false,
    isShowingMetadata: false,
    isDeletingTransaction: false,
    hasAssetsEnabled: true,
    isLoadingAssets: false,
  },

  argTypes: {
    direction: optionsFrom({ outgoing: 'Sent', incoming: 'Received' }),
    ...inCategory('First Asset', firstAssetArgs),
    ...inCategory('Transaction', transactionArgs),
  },

  render: (args) => {
    const {
      direction,
      assetAmount,
      assetDecimals,
      hasMetadata,
      metadataName,
      metadataTicker,
      metadataDescription,
      metadataUnitName,
    } = args;
    const tokens = [
      {
        ...transactionTokens[0],
        quantity: new BigNumber(assetAmount),
      },
      ...transactionTokens.slice(1),
    ];
    const assetTokens = tokens.map((token, index) => ({
      ...token,
      uniqueId: token.policyId + token.assetName,
      decimals: 0,
      recommendedDecimals: null,
      metadata:
        index === 0
          ? hasMetadata && {
              name: metadataName,
              ticker: metadataTicker,
              description: metadataDescription,
              unit: {
                name: metadataUnitName,
                decimals: assetDecimals,
              },
            }
          : assetsMetadata[index],
    }));
    const amount = new BigNumber(args.amount);
    const transaction = new WalletTransaction({
      id: generateHash(),
      confirmations: args.confirmations,
      slotNumber: args.slotNumber,
      epochNumber: args.epochNumber,
      // @ts-ignore ts-migrate(2367) FIXME: This condition will always return 'false' since th... Remove this comment to see the full error message
      title: direction === 'outgoing' ? 'Ada sent' : 'Ada received',
      type:
        // @ts-ignore ts-migrate(2367) FIXME: This condition will always return 'false' since th... Remove this comment to see the full error message
        direction === 'outgoing'
          ? TransactionTypes.EXPEND
          : TransactionTypes.INCOME,
      amount,
      fee: new BigNumber(args.fee).dividedBy(LOVELACES_PER_ADA),
      deposit: new BigNumber(args.deposit).dividedBy(LOVELACES_PER_ADA),
      assets: tokens,
      date,
      description: '',
      addresses: {
        from: ['65bc72542b0ca20391caaf66a4d4e7897d282f9c136cd3513136945c'],
        to: ['65bc72542b0ca20391caaf66a4d4e7897d282f9c136cd3513136945c'],
        withdrawals: [],
      },
      state: TransactionStates.OK,
      metadata: {},
    });
    return (
      <Transaction
        data={transaction}
        state={TransactionStates.OK}
        isExpanded={args.isExpanded}
        isRestoreActive={args.isRestoreActive}
        isLastInList={args.isLastInList}
        isShowingMetadata={args.isShowingMetadata}
        isDeletingTransaction={args.isDeletingTransaction}
        hasAssetsEnabled={args.hasAssetsEnabled}
        isLoadingAssets={args.isLoadingAssets}
        currentTimeFormat="hh:mm:ss A"
        walletId={generateHash()}
        assetTokens={assetTokens}
        onShowMetadata={action('onShowMetadata')}
        getUrlByType={action('getUrlByType')}
        deletePendingTransaction={action('deletePendingTransaction')}
        formattedWalletAmount={action('formattedWalletAmount')}
        onDetailsToggled={action('onDetailsToggled')}
        onOpenExternalLink={action('onOpenExternalLink')}
        isInternalAddress={() => direction === 'incoming'}
        onCopyAssetParam={action('onCopyAssetParam')}
      />
    );
  },
};
