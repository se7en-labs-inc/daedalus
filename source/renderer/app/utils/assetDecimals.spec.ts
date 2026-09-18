import { AssetDecimalsProvenance, resolveAssetDecimals } from './assetDecimals';

describe('resolveAssetDecimals', () => {
  it('prefers an explicit user setting over an attested registry value', () => {
    expect(
      resolveAssetDecimals({
        userDecimals: 2,
        registryDecimals: 6,
        registryDecimalsAttested: true,
      })
    ).toEqual({
      decimals: 2,
      provenance: AssetDecimalsProvenance.UserSetting,
    });
  });

  it('keeps a user setting of zero against an attested non-zero value', () => {
    // Truthiness on the setting would drop this one and format the amount to
    // six places against the user's explicit instruction not to.
    expect(
      resolveAssetDecimals({
        userDecimals: 0,
        registryDecimals: 6,
        registryDecimalsAttested: true,
      })
    ).toEqual({
      decimals: 0,
      provenance: AssetDecimalsProvenance.UserSetting,
    });
  });

  it('applies an attested registry value when there is no user setting', () => {
    expect(
      resolveAssetDecimals({
        registryDecimals: 6,
        registryDecimalsAttested: true,
      })
    ).toEqual({
      decimals: 6,
      provenance: AssetDecimalsProvenance.AttestedRegistry,
    });
  });

  it('applies an attested value of zero', () => {
    expect(
      resolveAssetDecimals({
        registryDecimals: 0,
        registryDecimalsAttested: true,
      })
    ).toEqual({
      decimals: 0,
      provenance: AssetDecimalsProvenance.AttestedRegistry,
    });
  });

  it('applies an attested value the registry bound to no minting policy', () => {
    // The case this rule exists for, and roughly half of everything the
    // registry publishes a decimals value for. USDM
    // (c48cbb3d…0014df105553444d) publishes 6, signs it at sequence number 0,
    // and carries no `policy` field at all. Daedalus already renders its name,
    // its ticker and its description from that same entry, so withholding the 6
    // withheld the one field an amount depends on and nothing else.
    //
    // Nothing distinguishes it here, and that is the point: the verdict
    // arriving at this function is the attestation and no longer carries the
    // binding, so there is no second input that could refuse it.
    expect(
      resolveAssetDecimals({
        registryDecimals: 6,
        registryDecimalsAttested: true,
      })
    ).toEqual({
      decimals: 6,
      provenance: AssetDecimalsProvenance.AttestedRegistry,
    });
  });

  it('never applies a registry value no signature covers', () => {
    // MELD (6ac8ef33…4d454c44) is the shape this refuses: it publishes 6, and
    // every property declares a sequence number one above the one its
    // signatures were taken over, so nothing the issuer signed covers the
    // number on screen.
    expect(
      resolveAssetDecimals({
        registryDecimals: 6,
        registryDecimalsAttested: false,
      })
    ).toEqual({
      decimals: null,
      provenance: AssetDecimalsProvenance.None,
    });
  });

  it('never applies a registry value with no verdict at all', () => {
    expect(
      resolveAssetDecimals({
        registryDecimals: 6,
      })
    ).toEqual({
      decimals: null,
      provenance: AssetDecimalsProvenance.None,
    });
  });

  it('resolves to none when neither source has a value', () => {
    expect(resolveAssetDecimals({})).toEqual({
      decimals: null,
      provenance: AssetDecimalsProvenance.None,
    });
  });

  it('treats both spellings of an absent user setting alike', () => {
    const fromUndefined = resolveAssetDecimals({
      userDecimals: undefined,
      registryDecimals: 6,
      registryDecimalsAttested: true,
    });
    const fromNull = resolveAssetDecimals({
      userDecimals: null,
      registryDecimals: 6,
      registryDecimalsAttested: true,
    });
    expect(fromUndefined).toEqual(fromNull);
    expect(fromNull.decimals).toEqual(6);
  });

  it('resolves to none when the registry published nothing but attested', () => {
    // `attested` is the verdict for the decimals property, and a subject with no
    // decimals property carries `false`. This case is the belt to that brace:
    // even a true verdict formats nothing without a number to format with.
    expect(
      resolveAssetDecimals({
        registryDecimals: null,
        registryDecimalsAttested: true,
      })
    ).toEqual({
      decimals: null,
      provenance: AssetDecimalsProvenance.None,
    });
  });
});
