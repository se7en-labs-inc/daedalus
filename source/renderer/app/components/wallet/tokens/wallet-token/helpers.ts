/**
 * How strongly a disagreement between the user's decimal-place setting and the
 * issuer's published value is worth putting.
 *
 * A published value the issuer signed is a claim that can be checked against
 * the signature, and a setting that contradicts it is worth saying plainly. A
 * published value no signature covers is a number nobody can vouch for, and
 * saying the user is "not using the recommended configuration" overstates it.
 */
export enum DecimalSettingDisagreement {
  None = 'none',
  WithAttested = 'withAttested',
  WithUnattested = 'withUnattested',
}

type DecimalSettingDisagreementArgs = {
  decimals: number | null | undefined;
  recommendedDecimals: number | null | undefined;
  /**
   * The attestation verdict for `recommendedDecimals`. Read with `===`, so an
   * argument object built without it reports the weaker disagreement rather
   * than the stronger one.
   */
  recommendedDecimalsAttested?: boolean | null;
};

export const decimalSettingDisagreement = ({
  recommendedDecimals,
  decimals,
  recommendedDecimalsAttested,
}: DecimalSettingDisagreementArgs): DecimalSettingDisagreement => {
  const hasRecommendedDecimals = typeof recommendedDecimals === 'number';
  const hasConfiguredDecimals = typeof decimals === 'number';

  if (!hasRecommendedDecimals) {
    return DecimalSettingDisagreement.None;
  }

  const disagreement =
    recommendedDecimalsAttested === true
      ? DecimalSettingDisagreement.WithAttested
      : DecimalSettingDisagreement.WithUnattested;

  if (hasConfiguredDecimals) {
    return decimals !== recommendedDecimals
      ? disagreement
      : DecimalSettingDisagreement.None;
  }

  if (recommendedDecimals === 0) {
    return DecimalSettingDisagreement.None;
  }

  return disagreement;
};
