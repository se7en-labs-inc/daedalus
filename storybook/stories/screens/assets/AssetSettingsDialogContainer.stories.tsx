import React from 'react';
import BigNumber from 'bignumber.js';
import AssetSettingsDialogContainer from '../../../../source/renderer/app/containers/assets/AssetSettingsDialogContainer';
import { screenDecorator } from '../../_support/harness/ScreenStory';

const editedAsset = {
  policyId: '6e8dc8b1f3591e8febcc47c51e9f2667c413a497aebd54cf38979086',
  assetName: '6861707079636f696e',
  uniqueId:
    '6e8dc8b1f3591e8febcc47c51e9f2667c413a497aebd54cf389790866861707079636f696e',
  fingerprint: 'asset18v86ulgre52g4l7lvl5shl8h5cm4u3dmrjg2e8',
  quantity: new BigNumber(1),
  decimals: 0,
  recommendedDecimals: null,
  metadata: null,
};

export default {
  title: 'Screens / Assets / Asset Settings Dialog',
  /*
   * The container returns null unless the dialog is open and an asset is being
   * edited, so both are part of the screen's state rather than of its props:
   * uiDialogs decides whether it renders and assets decides what it renders.
   */
  decorators: [
    screenDecorator({
      uiDialogs: { isOpen: () => true },
      assets: { editedAsset },
    }),
  ],
};

export const Default = {
  render: () => <AssetSettingsDialogContainer />,
};

export const Closed = {
  // The same screen with the dialog shut, which is what most routes see.
  decorators: [screenDecorator({ uiDialogs: { isOpen: () => false } })],
  render: () => <AssetSettingsDialogContainer />,
  name: 'Dialog closed',
};
