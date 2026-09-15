/**
 * The token row header asking for a logo, and what it does with the answer.
 *
 * The channel client is mocked: what is under test is which rows ask and what
 * they render, not the transport, which has its own suite.
 *
 * The tree is built here rather than through `createTestBed`, because one case
 * re-renders the header and that helper wraps its argument in providers it does
 * not export, so a re-render through it would replace the provider tree instead
 * of the component under it.
 */
import '@testing-library/jest-dom';

import React from 'react';
import noop from 'lodash/noop';
import { cleanup, render, screen, waitFor } from '@testing-library/react';

import { TestDecorator } from 'tests/_utils/TestDecorator';
import { zeroDecimalPlacesToken } from 'tests/mocks/asset';

import type { AssetMetadataSource } from '../../../../../../common/types/asset-metadata.types';

import {
  BrowserLocalStorageBridge,
  DiscreetModeFeatureProvider,
} from '../../../../features';

import WalletTokenHeader from './WalletTokenHeader';

jest.mock('../../../../ipc/assetMetadataChannel', () => ({
  requestAssetImageUrl: jest.fn(),
}));

const { requestAssetImageUrl } = jest.requireMock(
  '../../../../ipc/assetMetadataChannel'
);

const LOGO = 'data:image/png;base64,iVBORw==';
const { policyId, assetName, fingerprint } = zeroDecimalPlacesToken;
const SUBJECT = `${policyId}${assetName}`;

type Source = AssetMetadataSource | null;

const renderHeader = (source: Source, hasImage = false) => {
  // A fresh element each render. `WalletTokenHeader` is an `observer`, so
  // mobx-react gives it a shallow prop comparison and an identical element with
  // a mutated asset would be skipped. In the application the row is a new plain
  // object on every container render for the same reason.
  const tree = (rowSource: Source) => (
    <TestDecorator>
      <BrowserLocalStorageBridge>
        <DiscreetModeFeatureProvider>
          <WalletTokenHeader
            asset={{ ...zeroDecimalPlacesToken, source: rowSource, hasImage }}
            anyAssetWasHovered={false}
            assetSettingsDialogWasOpened={false}
            isExpanded={false}
            isFavorite={false}
            isLoading={false}
            hasWarning={false}
            onClick={noop}
            onCopyAssetParam={noop}
          />
        </DiscreetModeFeatureProvider>
      </BrowserLocalStorageBridge>
    </TestDecorator>
  );
  const { rerender } = render(tree(source));
  return {
    setSource: (next: Source) => rerender(tree(next)),
  };
};

describe('WalletTokenHeader', () => {
  afterEach(() => cleanup());

  it('renders the logo of a subject the registry has one for', async () => {
    requestAssetImageUrl.mockResolvedValue(LOGO);
    renderHeader('registry');

    expect(await screen.findByTestId('logo')).toHaveAttribute('src', LOGO);
    expect(requestAssetImageUrl).toHaveBeenCalledWith(SUBJECT);
  });

  // The defect this case exists for: the row used to ask only when the cache
  // already held the bytes, and the cache only holds bytes a row asked for, so
  // no row ever asked and no logo ever rendered. A registry row is the whole
  // condition; whether a logo is already stored decides how the answer is
  // found, not whether it is worth looking for.
  it('asks for a subject in the registry whose logo is not cached yet', async () => {
    requestAssetImageUrl.mockResolvedValue(LOGO);
    renderHeader('registry', false);

    expect(await screen.findByTestId('logo')).toHaveAttribute('src', LOGO);
  });

  it('asks for nothing until the cache has a row for the subject', async () => {
    requestAssetImageUrl.mockResolvedValue(LOGO);
    renderHeader(null);

    await waitFor(() => screen.getByText(fingerprint));
    expect(requestAssetImageUrl).not.toHaveBeenCalled();
    expect(screen.queryByTestId('logo')).not.toBeInTheDocument();
  });

  // The image table's key references the metadata table's, so a request issued
  // before the row exists fetches the bytes and is refused on write. The client
  // remembers the nothing that comes back for the life of the window, so asking
  // early does not merely waste a request, it loses the logo until a reload.
  it('asks for nothing for a subject the registry did not answer for', async () => {
    requestAssetImageUrl.mockResolvedValue(LOGO);
    renderHeader('chain');

    await waitFor(() => screen.getByText(fingerprint));
    expect(requestAssetImageUrl).not.toHaveBeenCalled();
    expect(screen.queryByTestId('logo')).not.toBeInTheDocument();
  });

  it('adds no element when the cache answers that there is no logo', async () => {
    requestAssetImageUrl.mockResolvedValue(null);
    renderHeader('registry');

    await waitFor(() => expect(requestAssetImageUrl).toHaveBeenCalled());
    expect(screen.queryByTestId('logo')).not.toBeInTheDocument();
  });

  it('asks as soon as the row it is drawn from reaches the registry', async () => {
    requestAssetImageUrl.mockResolvedValue(LOGO);
    const { setSource } = renderHeader(null);
    await waitFor(() => screen.getByText(fingerprint));
    expect(requestAssetImageUrl).not.toHaveBeenCalled();

    // A row drawn before its metadata arrives belongs to neither channel. A
    // component keyed on the subject alone would never ask once that changes.
    setSource('registry');
    expect(await screen.findByTestId('logo')).toHaveAttribute('src', LOGO);
  });
});
