/**
 * Shapes the two processes share for the asset metadata cache.
 *
 * The cache lives in the main process and the renderer never reaches the
 * registry, the database or the filesystem itself, so these are the only terms
 * in which the two can describe an asset to each other.
 */

/**
 * What is known about an attempt to resolve one subject.
 *
 * Absence has to say which absence it is. A subject with no metadata row can
 * mean three different things: nothing has looked yet, the registry was asked
 * and does not know the subject, or the request failed and is waiting out a
 * retry window. Collapsing them leaves a caller unable to tell "not yet" from
 * "never".
 *
 * `asset_resolution.state` in the main-process schema is constrained to these
 * four values, and the database module imports this declaration rather than
 * carrying its own.
 */
export type AssetResolutionState =
  | 'pending'
  | 'resolved'
  | 'unregistered'
  | 'failed';

/**
 * Where a row came from.
 *
 * A registry row is published by an issuer and may or may not be bound to the
 * minting policy. A chain row is read out of the user's own immutable database
 * and confirmed to mint that asset under that policy, and it still carries
 * `attested: false`, because that field is the verdict on a registry signature
 * and a chain row has none. Without this field the strongest local proof in the
 * design is indistinguishable from the weakest.
 */
export type AssetMetadataSource = 'registry' | 'chain';

/**
 * One resolved asset, as the renderer sees it.
 *
 * `hasImage` says whether asking on the image channel is worth it. The bytes
 * are not here: this is a bulk read for every subject on screen, and carrying
 * logos in it would put megabytes on the path of every render.
 */
export type AssetMetadataEntry = {
  subject: string;
  policyId: string;
  assetName: string;
  ticker: string | null;
  name: string | null;
  decimals: number | null;
  /** Whether the issuer's signature covers `decimals` at its sequence number. */
  attested: boolean;
  source: AssetMetadataSource;
  hasImage: boolean;
  metadata: Record<string, unknown> | null;
};

/** A requested subject the cache holds no row for, and why. */
export type AssetUnresolvedSubject = {
  subject: string;
  state: AssetResolutionState;
};
