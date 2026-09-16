import {
  DecimalSettingDisagreement,
  decimalSettingDisagreement,
} from './helpers';

describe('decimalSettingDisagreement', () => {
  it('returns none if asset does not have recommended decimals', async () => {
    expect(
      decimalSettingDisagreement({
        decimals: 0,
        recommendedDecimals: undefined,
      })
    ).toEqual(DecimalSettingDisagreement.None);

    expect(
      decimalSettingDisagreement({
        decimals: 5,
        recommendedDecimals: undefined,
      })
    ).toEqual(DecimalSettingDisagreement.None);
  });

  it('returns none if recommended decimal settings are applied by user', async () => {
    expect(
      decimalSettingDisagreement({
        decimals: 0,
        recommendedDecimals: 0,
      })
    ).toEqual(DecimalSettingDisagreement.None);

    expect(
      decimalSettingDisagreement({
        decimals: 5,
        recommendedDecimals: 5,
      })
    ).toEqual(DecimalSettingDisagreement.None);
  });

  it('returns none if 0 (default value) is recommended and user never changed settings', async () => {
    expect(
      decimalSettingDisagreement({
        decimals: undefined,
        recommendedDecimals: 0,
      })
    ).toEqual(DecimalSettingDisagreement.None);
  });

  it('reports a disagreement if non-zero decimals are recommended but user never changed settings', async () => {
    expect(
      decimalSettingDisagreement({
        decimals: undefined,
        recommendedDecimals: 3,
      })
    ).toEqual(DecimalSettingDisagreement.WithUnattested);
  });

  it('reports a disagreement if user applied non-recommended decimal settings', async () => {
    expect(
      decimalSettingDisagreement({
        decimals: 3,
        recommendedDecimals: 0,
      })
    ).toEqual(DecimalSettingDisagreement.WithUnattested);

    expect(
      decimalSettingDisagreement({
        decimals: 0,
        recommendedDecimals: 3,
      })
    ).toEqual(DecimalSettingDisagreement.WithUnattested);
  });

  describe('the attestation verdict', () => {
    it('says nothing when the setting agrees with an attested value', () => {
      expect(
        decimalSettingDisagreement({
          decimals: 6,
          recommendedDecimals: 6,
          recommendedDecimalsAttested: true,
        })
      ).toEqual(DecimalSettingDisagreement.None);
    });

    it('puts a disagreement with an attested value more strongly', () => {
      expect(
        decimalSettingDisagreement({
          decimals: 2,
          recommendedDecimals: 6,
          recommendedDecimalsAttested: true,
        })
      ).toEqual(DecimalSettingDisagreement.WithAttested);
    });

    it('puts a disagreement with an unattested value more weakly', () => {
      expect(
        decimalSettingDisagreement({
          decimals: 2,
          recommendedDecimals: 6,
          recommendedDecimalsAttested: false,
        })
      ).toEqual(DecimalSettingDisagreement.WithUnattested);
    });

    it('treats an absent verdict as unattested', () => {
      // The weaker claim is the safe one: an argument object that has not been
      // told the value was signed for must not say it was.
      expect(
        decimalSettingDisagreement({
          decimals: 2,
          recommendedDecimals: 6,
        })
      ).toEqual(DecimalSettingDisagreement.WithUnattested);

      expect(
        decimalSettingDisagreement({
          decimals: 2,
          recommendedDecimals: 6,
          recommendedDecimalsAttested: null,
        })
      ).toEqual(DecimalSettingDisagreement.WithUnattested);
    });

    it('still says nothing when there is no published value to disagree with', () => {
      expect(
        decimalSettingDisagreement({
          decimals: 2,
          recommendedDecimals: null,
          recommendedDecimalsAttested: true,
        })
      ).toEqual(DecimalSettingDisagreement.None);
    });
  });
});
