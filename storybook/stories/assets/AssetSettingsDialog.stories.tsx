import React from 'react';
import BigNumber from 'bignumber.js';
import { action } from '@storybook/addon-actions';
import StoryDecorator from '../_support/StoryDecorator';
import StoryProvider from '../_support/StoryProvider';
import AssetSettingsDialog from '../../../source/renderer/app/components/assets/AssetSettingsDialog';

// The quantity used to be a knob evaluated where this object is built, which is
// module scope, so it was read once at import rather than once per render. The
// value is an arg on the meta now and the quantity joins the asset in each story.
const asset = {
  policyId: '6e8dc8b1f3591e8febcc47c51e9f2667c413a497aebd54cf38979086',
  assetName: '6861707079636f696e',
  uniqueId:
    '6e8dc8b1f3591e8febcc47c51e9f2667c413a497aebd54cf389790866861707079636f696e',
  fingerprint: 'asset18v86ulgre52g4l7lvl5shl8h5cm4u3dmrjg2e8',
  decimals: undefined,
  recommendedDecimals: null,
  metadata: null,
};

export default {
  title: 'Assets / AssetSettingsDialog',

  args: {
    quantity: 1,
    assetAmount: 500,
  },

  decorators: [
    (story) => (
      <StoryProvider>
        <StoryDecorator>{story()}</StoryDecorator>
      </StoryProvider>
    ),
  ],
};

export const Default = {
  render: ({ quantity, assetAmount }) => (
    <AssetSettingsDialog
      asset={{ ...asset, quantity: new BigNumber(quantity) }}
      // @ts-ignore ts-migrate(2322) FIXME: Type '{ asset: { policyId: string; assetName: stri... Remove this comment to see the full error message
      assetAmount={new BigNumber(assetAmount)}
      onSubmit={action('onSubmit')}
      onCancel={action('onCancel')}
    />
  ),
};

export const WithRecommendedDecimalPrecision = {
  args: { recommendedDecimals: 0 },

  render: ({ quantity, assetAmount, recommendedDecimals }) => (
    <AssetSettingsDialog
      asset={{
        ...asset,
        quantity: new BigNumber(quantity),
        recommendedDecimals,
      }}
      // @ts-ignore ts-migrate(2322) FIXME: Type '{ asset: { recommendedDecimals: number; poli... Remove this comment to see the full error message
      assetAmount={new BigNumber(assetAmount)}
      onSubmit={action('onSubmit')}
      onCancel={action('onCancel')}
    />
  ),

  name: 'With recommended decimal precision',
};

export const WithRecommendedDecimalPrecisionNonZero = {
  args: { recommendedDecimals: 1 },

  render: ({ quantity, assetAmount, recommendedDecimals }) => (
    <AssetSettingsDialog
      asset={{
        ...asset,
        quantity: new BigNumber(quantity),
        decimals: 2,
        recommendedDecimals,
      }}
      // @ts-ignore ts-migrate(2322) FIXME: Type '{ asset: { recommendedDecimals: number; poli... Remove this comment to see the full error message
      assetAmount={new BigNumber(assetAmount)}
      onSubmit={action('onSubmit')}
      onCancel={action('onCancel')}
    />
  ),

  name: 'With recommended decimal precision (non-zero)',
};
