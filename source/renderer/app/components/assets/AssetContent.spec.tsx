import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssetContent from './AssetContent';
import { TestDecorator } from '../../../../../tests/_utils/TestDecorator';

const baseAsset = {
  policyId: 'policyId',
  fingerprint: 'asset1t4gm2ptzxj22sqxd7jtx7dwjqy2u3h56j6vrjr',
  uniqueId: 'uniqueId',
  decimals: 1,
  recommendedDecimals: null,
};
// 'Cointest'
const printableAssetName = '436f696e74657374';
// 32 random bytes
const nonPrintableAssetName =
  '787c09a71b2eacdc2a7644591bd32426ed996387470bc6ec9574167ccf6af8cf';
// The CIP-0067 label 333 followed by 'USDM', and the same label followed by a
// byte that is not text.
const cip68AssetName = '0014df105553444d';
const cip68AssetNameWithoutText = '0014df10ff';

const renderAssetContent = (asset) =>
  render(
    <TestDecorator>
      <AssetContent asset={asset} />
    </TestDecorator>
  );

describe('AssetContent', () => {
  afterEach(cleanup);

  it('annotates a printable asset name as chosen by the minter', () => {
    const { container } = renderAssetContent({
      ...baseAsset,
      assetName: printableAssetName,
    });
    const annotation = screen.getByTestId('assetNameMinterChosenParam');
    expect(annotation).toHaveTextContent('Cointest');
    expect(container.textContent).toContain(printableAssetName);
    expect(container.textContent).not.toContain('ASCII');
  });

  it('omits the annotation for an asset name that is not text', () => {
    const { container } = renderAssetContent({
      ...baseAsset,
      assetName: nonPrintableAssetName,
    });
    expect(screen.queryByTestId('assetNameMinterChosenParam')).toBeNull();
    expect(container.textContent).toContain(nonPrintableAssetName);
    expect(container.textContent).not.toContain('�');
  });

  it('annotates the name inside a CIP-68 asset name', () => {
    const { container } = renderAssetContent({
      ...baseAsset,
      assetName: cip68AssetName,
    });
    expect(screen.getByTestId('assetNameMinterChosenParam')).toHaveTextContent(
      'USDM'
    );
    // The row's value is the whole asset name, label included, because that is
    // what identifies the asset and what is copied.
    expect(container.textContent).toContain(cip68AssetName);
  });

  it('omits the annotation when a label carries no text after it', () => {
    const { container } = renderAssetContent({
      ...baseAsset,
      assetName: cip68AssetNameWithoutText,
    });
    expect(screen.queryByTestId('assetNameMinterChosenParam')).toBeNull();
    expect(container.textContent).toContain(cip68AssetNameWithoutText);
  });

  it('omits the annotation for an empty asset name', () => {
    renderAssetContent({
      ...baseAsset,
      assetName: '',
    });
    expect(screen.queryByTestId('assetNameMinterChosenParam')).toBeNull();
  });
});
