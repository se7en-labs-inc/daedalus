import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssetContent from './AssetContent';
import styles from './AssetContent.scss';
import { TestDecorator } from '../../../../../tests/_utils/TestDecorator';

const baseAsset = {
  policyId: 'policyId',
  fingerprint: 'asset1t4gm2ptzxj22sqxd7jtx7dwjqy2u3h56j6vrjr',
  uniqueId: 'uniqueId',
  decimals: 1,
  recommendedDecimals: null,
};
// 'HOSKY'
const printableAssetName = '484f534b59';
// 32 random bytes, the shape every asset under policy
// bcd713bb7858d4b08738bed90ee7068d8f9b38d02e0cae0b45ac7a9b carries.
const nonPrintableAssetName =
  '787c09a71b2eacdc2a7644591bd32426ed996387470bc6ec9574167ccf6af8cf';
// The CIP-0067 label 333 followed by 'USDM', the same label followed by a byte
// that is not text, and the same label with nothing after it at all.
const cip68AssetName = '0014df105553444d';
const cip68AssetNameWithoutText = '0014df10ff';
const cip68LabelOnly = '0014df10';
// The longest a decoded name can be: 32 printable bytes, so 64 hex characters
// of value and 32 characters of name on one row.
const longPrintableAssetName = '436f696e74657374'.repeat(4);
const longDecodedName = 'Cointest'.repeat(4);

const renderAssetContent = (asset) =>
  render(
    <TestDecorator>
      <AssetContent asset={asset} />
    </TestDecorator>
  );

// The asset name row is the last one the component renders, so the component's
// whole text ends with that row's value. A name that does not decode must leave
// it ending at the hex: no brackets, no empty pair, no trailing space.
const expectRowEndsAtHex = (container, assetName) =>
  expect(container.textContent.endsWith(assetName)).toBe(true);

describe('AssetContent', () => {
  afterEach(cleanup);

  it('renders a decoded asset name in brackets after the bytes it decodes', () => {
    const { container } = renderAssetContent({
      ...baseAsset,
      assetName: printableAssetName,
    });
    const annotation = screen.getByTestId('assetNameOnChainParam');
    expect(annotation).toHaveTextContent('(HOSKY)');
    expect(container.textContent).toContain(`${printableAssetName} (HOSKY)`);
    expect(container.textContent).not.toContain('ASCII');
  });

  // The marking is the whole signal on this row, and it belongs to the brackets
  // and not to the bytes, which are the asset's identity and are not in doubt.
  it('marks the brackets and not the hex', () => {
    const { container } = renderAssetContent({
      ...baseAsset,
      assetName: printableAssetName,
    });
    const annotation = screen.getByTestId('assetNameOnChainParam');
    expect(annotation).toHaveClass(styles.onChainName);
    // The value element is the row's own, reached from the annotation rather
    // than by position: every param row renders one with the same class.
    const value = annotation.parentElement;
    expect(value).toHaveClass(styles.value);
    expect(value).not.toHaveClass(styles.onChainName);
    expect(value.textContent).toContain(printableAssetName);
  });

  it('explains the decoded name to a screen reader', () => {
    renderAssetContent({
      ...baseAsset,
      assetName: printableAssetName,
    });
    const annotation = screen.getByTestId('assetNameOnChainParam');
    expect(annotation).toHaveAttribute('aria-label');
    expect(annotation.getAttribute('aria-label')).not.toHaveLength(0);
  });

  it('renders the hex alone for an asset name that is not text', () => {
    const { container } = renderAssetContent({
      ...baseAsset,
      assetName: nonPrintableAssetName,
    });
    expect(screen.queryByTestId('assetNameOnChainParam')).toBeNull();
    expect(container.textContent).toContain(nonPrintableAssetName);
    expect(container.textContent).not.toContain('()');
    expect(container.textContent).not.toContain('�');
    expectRowEndsAtHex(container, nonPrintableAssetName);
  });

  it('renders the name inside a CIP-68 asset name after the whole hex', () => {
    const { container } = renderAssetContent({
      ...baseAsset,
      assetName: cip68AssetName,
    });
    expect(screen.getByTestId('assetNameOnChainParam')).toHaveTextContent(
      '(USDM)'
    );
    // The row's value is the whole asset name, label included, because that is
    // what identifies the asset and what is copied.
    expect(container.textContent).toContain(`${cip68AssetName} (USDM)`);
  });

  it('renders the hex alone when a label carries no text after it', () => {
    const { container } = renderAssetContent({
      ...baseAsset,
      assetName: cip68AssetNameWithoutText,
    });
    expect(screen.queryByTestId('assetNameOnChainParam')).toBeNull();
    expect(container.textContent).not.toContain('()');
    expectRowEndsAtHex(container, cip68AssetNameWithoutText);
  });

  // Stripping the label leaves an empty string, which is not text. An empty
  // remainder rendered as brackets would be the one output worse than none.
  it('renders the hex alone for a name that is only a label', () => {
    const { container } = renderAssetContent({
      ...baseAsset,
      assetName: cip68LabelOnly,
    });
    expect(screen.queryByTestId('assetNameOnChainParam')).toBeNull();
    expect(container.textContent).not.toContain('()');
    expectRowEndsAtHex(container, cip68LabelOnly);
  });

  it('renders no brackets for an empty asset name', () => {
    const { container } = renderAssetContent({
      ...baseAsset,
      assetName: '',
    });
    expect(screen.queryByTestId('assetNameOnChainParam')).toBeNull();
    expect(container.textContent).not.toContain('()');
  });

  // The longest row this layout can produce. Both parts stay in the one value
  // element, which wraps on word boundaries and inside the hex; nothing is
  // truncated and nothing is dropped.
  it('keeps the longest asset name and its decoded form on one row', () => {
    const { container } = renderAssetContent({
      ...baseAsset,
      assetName: longPrintableAssetName,
    });
    expect(longPrintableAssetName).toHaveLength(64);
    expect(longDecodedName).toHaveLength(32);
    const annotation = screen.getByTestId('assetNameOnChainParam');
    expect(annotation).toHaveTextContent(`(${longDecodedName})`);
    expect(container.textContent).toContain(
      `${longPrintableAssetName} (${longDecodedName})`
    );
    const value = annotation.parentElement;
    expect(value).toHaveClass(styles.value);
    expect(value.textContent).toContain(longPrintableAssetName);
  });
});
