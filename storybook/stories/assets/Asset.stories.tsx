import React from 'react';
import BigNumber from 'bignumber.js';
import { action } from 'storybook/actions';
import StoryDecorator from '../_support/StoryDecorator';
import Asset from '../../../source/renderer/app/components/assets/Asset';

export default {
  title: 'Assets / Asset pill',
  decorators: [(story) => <StoryDecorator>{story()}</StoryDecorator>],
};

export const Default = {
  args: {
    policyId: '6e8dc8b1f3591e8febcc47c51e9f2667c413a497aebd54cf38979086',
    assetName: '6861707079636f696e',
    fingerprint: 'asset18v86ulgre52g4l7lvl5shl8h5cm4u3dmrjg2e8',
    quantity: 1,
    name: undefined,
    ticker: undefined,
    description: undefined,
    unitDecimals: undefined,
    unitName: undefined,
    small: false,
    hidePopOver: undefined,
    isConfigurable: true,
  },

  // Storybook infers a control from the arg's value, so the args that stood in
  // for a knob with no default have nothing to infer from and say what they are.
  argTypes: {
    name: { control: 'text' },
    ticker: { control: 'text' },
    description: { control: 'text' },
    unitDecimals: { control: 'number' },
    unitName: { control: 'text' },
    hidePopOver: { control: 'boolean' },
  },

  render: ({
    policyId,
    assetName,
    fingerprint,
    quantity,
    name,
    ticker,
    description,
    unitDecimals,
    unitName,
    small,
    hidePopOver,
    isConfigurable,
  }) => (
    <div
      style={{
        padding: '30px',
      }}
    >
      <Asset
        asset={{
          policyId,
          assetName,
          uniqueId: `${policyId}${assetName}`,
          fingerprint,
          quantity: new BigNumber(quantity),
          decimals: 0,
          recommendedDecimals: null,
          metadata: {
            name,
            ticker,
            description,
            // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
            unit: {
              decimals: unitDecimals,
              name: unitName,
            },
          },
        }}
        small={small}
        hidePopOver={hidePopOver}
        onCopyAssetParam={action('onCopyAssetParam')}
        onClickSettings={isConfigurable ? action('onClickSettings') : null}
      />
    </div>
  ),
};
