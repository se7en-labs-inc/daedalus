import {
  AssetNameProvenance,
  decodeAssetNameText,
  isMinterChosenAssetName,
  resolveAssetName,
} from './assetName';

// 'Cointest' and 'USDC' respectively.
const printableAssetName = '436f696e74657374';
const impersonatingAssetName = '55534443';
const nonPrintableAssetName =
  '787c09a71b2eacdc2a7644591bd32426ed996387470bc6ec9574167ccf6af8cf';

describe('resolveAssetName', () => {
  it('prefers the registry ticker over every other source', () => {
    expect(
      resolveAssetName({
        assetName: printableAssetName,
        metadata: {
          name: 'Test Coin',
          description: 'A test coin',
          ticker: 'TEST',
        },
      })
    ).toEqual({
      name: 'TEST',
      provenance: AssetNameProvenance.RegistryTicker,
    });
  });

  it('falls back to the registry name when no ticker is published', () => {
    expect(
      resolveAssetName({
        assetName: printableAssetName,
        metadata: {
          name: 'Test Coin',
          description: 'A test coin',
        },
      })
    ).toEqual({
      name: 'Test Coin',
      provenance: AssetNameProvenance.RegistryName,
    });
  });

  it('falls back to the decoded asset name when no metadata is published', () => {
    expect(
      resolveAssetName({
        assetName: printableAssetName,
      })
    ).toEqual({
      name: 'Cointest',
      provenance: AssetNameProvenance.MinterChosen,
    });
  });

  it('resolves nothing when the asset name is not printable', () => {
    expect(
      resolveAssetName({
        assetName: nonPrintableAssetName,
      })
    ).toBeNull();
  });

  it('resolves nothing for an asset carrying neither metadata nor a name', () => {
    expect(resolveAssetName({})).toBeNull();
  });

  it('marks a decoded name that spells a registry ticker as minter-chosen', () => {
    const impersonating = resolveAssetName({
      assetName: impersonatingAssetName,
    });
    const published = resolveAssetName({
      assetName: '',
      metadata: {
        name: 'USD Coin',
        description: 'A stablecoin',
        ticker: 'USDC',
      },
    });
    expect(impersonating.name).toBe(published.name);
    expect(isMinterChosenAssetName(impersonating)).toBe(true);
    expect(isMinterChosenAssetName(published)).toBe(false);
  });
});

describe('isMinterChosenAssetName', () => {
  it('returns false when no name resolved', () => {
    expect(isMinterChosenAssetName(null)).toBe(false);
  });
});

describe('resolveAssetName for a chain row', () => {
  // The whole reason a chain row's `source` reaches the renderer. Both a
  // registry name and a CIP-25 name arrive as `metadata.name`, because the
  // cache stores one name column, and the two are not the same claim.
  it('names a CIP-25 record as coming from the chain rather than the registry', () => {
    const resolved = resolveAssetName({
      assetName:
        '787c09a71b2eacdc2a7644591bd32426ed996387470bc6ec9574167ccf6af8cf',
      metadata: { name: 'Northwind Demo', description: '' },
      source: 'chain',
    });
    expect(resolved).toEqual({
      name: 'Northwind Demo',
      provenance: AssetNameProvenance.ChainName,
    });
  });

  it('names the same value from the registry as a registry name', () => {
    const resolved = resolveAssetName({
      assetName: '',
      metadata: { name: 'Northwind Demo', description: '' },
      source: 'registry',
    });
    expect(resolved.provenance).toBe(AssetNameProvenance.RegistryName);
  });

  // A chain name is in the transaction that minted the asset, which had to
  // satisfy the minting policy, so it is not the unbound case the marker exists
  // for.
  it('does not mark a chain name as minter-chosen', () => {
    expect(
      isMinterChosenAssetName(
        resolveAssetName({
          assetName: '436f696e74657374',
          metadata: { name: 'Northwind Demo', description: '' },
          source: 'chain',
        })
      )
    ).toBe(false);
  });

  it('prefers a decoded name over nothing when a chain row carries no name', () => {
    const resolved = resolveAssetName({
      assetName: '436f696e74657374',
      metadata: { name: '', description: '' },
      source: 'chain',
    });
    expect(resolved).toEqual({
      name: 'Cointest',
      provenance: AssetNameProvenance.MinterChosen,
    });
  });
});

/**
 * A CIP-68 asset name is a four-byte CIP-0067 label followed by the name itself.
 * The label's first byte is at most `0x0f`, so a printable test taken over the
 * whole name rejects every CIP-68 asset there is.
 *
 * The label is validated by its structure rather than matched against a list.
 * CIP-0067 lays it out as `[ 0000 | 16 bits label_num | 8 bits checksum | 0000 ]`
 * with the checksum a CRC-8 over `label_num`, and CIP-0068 registers four
 * numbers while requiring any further asset class to arrive as a new CIP. The
 * four cases below are therefore also the check on the CRC-8 implementation:
 * each of the published labels carries the checksum the registry published for
 * it, and none of them would be stripped if the polynomial were wrong.
 */
describe('decodeAssetNameText', () => {
  // Measured in a real wallet: both render with no name at all before the
  // label is recognised, while non-CIP-68 assets in the same list render theirs.
  it('reads the name behind the CIP-68 FT label, 333', () => {
    expect(decodeAssetNameText('0014df105553444d')).toBe('USDM');
    expect(decodeAssetNameText('0014df10464c4454')).toBe('FLDT');
  });

  it('reads the name behind the CIP-68 reference NFT label, 100', () => {
    expect(decodeAssetNameText('000643b05553444d')).toBe('USDM');
  });

  it('reads the name behind the CIP-68 NFT label, 222', () => {
    expect(decodeAssetNameText('000de1405553444d')).toBe('USDM');
  });

  it('reads the name behind the CIP-68 RFT label, 444', () => {
    expect(decodeAssetNameText('001bc2805553444d')).toBe('USDM');
  });

  /**
   * The reason the structure is checked rather than the four values. CIP-0068
   * says a further asset class must be submitted as a new CIP, so a label this
   * code has never heard of is the expected case rather than a malformed one.
   * Label 1 is inside CIP-0067's private-use range, 555 is unregistered today,
   * and 65535 is the largest a sixteen-bit label number can be.
   */
  it('reads the name behind a valid label that is not one of CIP-68 four', () => {
    expect(decodeAssetNameText('000010705553444d')).toBe('USDM');
    expect(decodeAssetNameText('0022bfb05553444d')).toBe('USDM');
    expect(decodeAssetNameText('0ffff2405553444d')).toBe('USDM');
  });

  /**
   * `0014df20` is `0014df10` with the checksum nibble moved by one. The brackets
   * are still zero and the label number is still 333, so only the CRC-8 rejects
   * it. Without this case the four above would pass against an implementation
   * that checked the brackets and ignored the checksum entirely.
   */
  it('does not strip four bytes whose checksum does not match', () => {
    expect(decodeAssetNameText('0014df205553444d')).toBeNull();
    expect(decodeAssetNameText('000644b05553444d')).toBeNull();
  });

  it('does not strip four bytes whose brackets are not zero', () => {
    // Leading bracket set.
    expect(decodeAssetNameText('1014df105553444d')).toBeNull();
    // Trailing bracket set.
    expect(decodeAssetNameText('0014df115553444d')).toBeNull();
  });

  it('reads nothing from a name that is only a label', () => {
    expect(decodeAssetNameText('0014df10')).toBeNull();
    expect(decodeAssetNameText('000643b0')).toBeNull();
  });

  it('reads an upper-case label', () => {
    expect(decodeAssetNameText('0014DF105553444D')).toBe('USDM');
  });

  it('reads nothing when a label is followed by a byte that is not printable', () => {
    expect(decodeAssetNameText('0014df1000')).toBeNull();
    expect(decodeAssetNameText('0014df10ff')).toBeNull();
    expect(decodeAssetNameText('0014df1055534444e29885')).toBeNull();
  });

  /**
   * The label is read from bytes, never from decoded text. This name's text
   * reads `000de140`, which is one of CIP-68's labels spelled out, and its bytes
   * are `3030306465313430`, which is not a label at all: its first byte is
   * `0x30`, so the leading bracket is not zero.
   */
  it('does not strip a name whose text merely reads like a label', () => {
    expect(decodeAssetNameText('3030306465313430')).toBe('000de140');
    expect(decodeAssetNameText('30303134646631305553444d')).toBe(
      '0014df10USDM'
    );
  });

  it('still applies the hex-shape check to what is left after a label', () => {
    expect(decodeAssetNameText('0014df105553444')).toBeNull();
    expect(decodeAssetNameText('0014df10zz')).toBeNull();
  });

  it('decodes an unlabelled printable name whole', () => {
    expect(decodeAssetNameText('436f696e74657374')).toBe('Cointest');
  });

  it('reads nothing from a name that is not text', () => {
    expect(
      decodeAssetNameText(
        '787c09a71b2eacdc2a7644591bd32426ed996387470bc6ec9574167ccf6af8cf'
      )
    ).toBeNull();
  });

  it('reads nothing from a name shorter than a label', () => {
    expect(decodeAssetNameText('0014df')).toBeNull();
    expect(decodeAssetNameText('00')).toBeNull();
  });

  it('reads nothing from an absent name', () => {
    expect(decodeAssetNameText('')).toBeNull();
    expect(decodeAssetNameText(null)).toBeNull();
    expect(decodeAssetNameText(undefined)).toBeNull();
  });
});

describe('resolveAssetName for a CIP-68 asset name', () => {
  it('resolves the name behind the label as minter-chosen', () => {
    const resolved = resolveAssetName({ assetName: '0014df105553444d' });
    expect(resolved).toEqual({
      name: 'USDM',
      provenance: AssetNameProvenance.MinterChosen,
    });
    // Recovering text from behind a label does not make an issuer have
    // published it, so the marking every surface renders must not move.
    expect(isMinterChosenAssetName(resolved)).toBe(true);
  });

  it('still lets a registry ticker win over it', () => {
    expect(
      resolveAssetName({
        assetName: '0014df105553444d',
        metadata: {
          name: 'Mehen USD',
          description: 'A stablecoin',
          ticker: 'USDM',
        },
      }).provenance
    ).toBe(AssetNameProvenance.RegistryTicker);
  });

  it('still lets a chain name win over it', () => {
    expect(
      resolveAssetName({
        assetName: '0014df105553444d',
        metadata: { name: 'Mehen USD', description: '' },
        source: 'chain',
      }).provenance
    ).toBe(AssetNameProvenance.ChainName);
  });
});
