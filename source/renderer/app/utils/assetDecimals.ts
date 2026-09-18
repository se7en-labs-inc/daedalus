/**
 * Where an applied decimal count came from.
 *
 * A user setting is an explicit choice made in the asset settings dialog and
 * stored per subject in browser storage. An attested registry value is one the
 * issuer published and signed: one of the signatures the registry carries for
 * the `decimals` property verifies over the declared value at the declared
 * sequence number. There is no third source that formats anything, because a
 * number nobody signed is a number nobody can be held to, and a wrong one moves
 * the decimal point on an amount the user is about to sign.
 *
 * Attestation, and not the policy binding, is what unlocks formatting. The
 * registry's `policy` field is optional and about half the entries publishing a
 * decimals value omit it, so requiring it refused a signed value for the
 * absence of a second document rather than for anything wrong with the
 * signature. The main process records the measurement behind that at
 * `source/main/assets/assetMetadataResolver.ts`.
 */
export enum AssetDecimalsProvenance {
  UserSetting = 'userSetting',
  AttestedRegistry = 'attestedRegistry',
  None = 'none',
}

export type ResolvedAssetDecimals = {
  decimals: number | null;
  provenance: AssetDecimalsProvenance;
};

type ResolvableDecimals = {
  /** The explicit per-subject setting, if the user has made one. */
  userDecimals?: number | null;
  /** The registry's published value, attested or not. */
  registryDecimals?: number | null;
  /** The attestation verdict for that published value. */
  registryDecimalsAttested?: boolean;
};

/**
 * Resolves the decimal count that applies to a subject, highest source first:
 * an explicit user setting, then the registry's value if and only if the
 * issuer's signature covers it, then none.
 *
 * `none` means raw units: the integers the chain holds, displayed and entered
 * without a separator. It is the honest rendering of a token whose denomination
 * nobody has signed for, and it is what the amount field degrades to.
 *
 * An unattested published value is deliberately not returned here. It stays
 * available to the settings dialog as the recommended value, which is where the
 * user is asked to decide about it.
 */
export const resolveAssetDecimals = ({
  userDecimals,
  registryDecimals,
  registryDecimalsAttested,
}: ResolvableDecimals): ResolvedAssetDecimals => {
  if (typeof userDecimals === 'number') {
    return {
      decimals: userDecimals,
      provenance: AssetDecimalsProvenance.UserSetting,
    };
  }

  // `=== true` rather than a truthiness test. The field is optional on a merged
  // row and arrives `undefined` for a subject the cache has no verdict for, and
  // this is the comparison that says which single value unlocks formatting.
  if (
    registryDecimalsAttested === true &&
    typeof registryDecimals === 'number'
  ) {
    return {
      decimals: registryDecimals,
      provenance: AssetDecimalsProvenance.AttestedRegistry,
    };
  }

  return { decimals: null, provenance: AssetDecimalsProvenance.None };
};
