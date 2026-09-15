import { hexToPrintableAsciiString } from './strings';
import type { AssetMetadata } from '../api/assets/types';
import type { AssetMetadataSource } from '../../../common/types/asset-metadata.types';

/**
 * Where a displayed asset name came from.
 *
 * A registry name was published by an issuer against the token's minting
 * policy. A chain name is in the transaction that minted the asset, which had
 * to satisfy that policy, so it is bound to the policy too. A minter-chosen
 * name is the asset's own name bytes decoded as text, and those bytes are
 * whatever the minter put there: an asset whose name bytes spell an existing
 * ticker is free to exist. The last must never render like the first two.
 */
export enum AssetNameProvenance {
  RegistryTicker = 'registryTicker',
  RegistryName = 'registryName',
  ChainName = 'chainName',
  MinterChosen = 'minterChosen',
}
/**
 * CRC-8 with the polynomial `0x07`, as CIP-0067 specifies for an asset name
 * label's checksum. The specification publishes a 256-value lookup table; this
 * computes the same values, which is checked against all four of CIP-0068's
 * published labels in the colocated spec.
 */
const CRC8_POLYNOMIAL = 0x07;

const crc8 = (bytes: Array<number>): number => {
  let crc = 0;
  bytes.forEach((byte) => {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc =
        (crc & 0x80) === 0
          ? (crc << 1) & 0xff
          : ((crc << 1) ^ CRC8_POLYNOMIAL) & 0xff;
    }
  });
  return crc;
};

const CIP67_LABEL_HEX_LENGTH = 8;
const CIP67_LABEL_HEX = /^[0-9a-fA-F]{8}/;

/**
 * Whether an asset name begins with a well-formed CIP-0067 asset name label.
 *
 * CIP-0067, Specification, gives the label as four bytes laid out as
 *
 *     [ 0000 | 16 bits label_num | 8 bits checksum | 0000 ]
 *
 * where the leading and trailing nibbles are brackets, `label_num` is the
 * registered number, and the checksum is CRC-8 over `label_num` including its
 * padded zeros. CIP-0068, Specification, registers four of them (100 reference
 * NFT, 222 NFT, 333 FT and 444 RFT) and requires any further asset class to be
 * submitted as a new CIP, so the set of valid labels is open and an allowlist of
 * the four would stop being right the day a fifth is registered.
 *
 * The structure is checked rather than the value, which also discriminates far
 * better: a coincidental four-byte prefix has to carry both zero brackets and a
 * checksum over its own middle bytes, which is one sequence in 65,536 rather
 * than one in four.
 */
const hasCip67Label = (assetName: string): boolean => {
  if (!CIP67_LABEL_HEX.test(assetName)) return false;
  const label = Buffer.from(assetName.slice(0, CIP67_LABEL_HEX_LENGTH), 'hex');
  if (label[0] >> 4 !== 0) return false;
  if ((label[3] & 0x0f) !== 0) return false;
  const labelNumber =
    ((label[0] & 0x0f) << 12) | (label[1] << 4) | (label[2] >> 4);
  const checksum = ((label[2] & 0x0f) << 4) | (label[3] >> 4);
  return checksum === crc8([(labelNumber >> 8) & 0xff, labelNumber & 0xff]);
};

/**
 * The asset name with a CIP-0067 label removed, or unchanged when it carries
 * none.
 *
 * The label is read from the name's bytes, never from its decoded text. A valid
 * label's first byte is at most `0x0f`, so a name that decodes to printable text
 * can never begin with one, and a name whose text merely reads like a label is a
 * different byte string: the text `000de140` is the hex `3030306465313430`.
 */
const withoutCip67Label = (assetName: string): string =>
  hasCip67Label(assetName)
    ? assetName.slice(CIP67_LABEL_HEX_LENGTH)
    : assetName;

/**
 * The text inside an asset name, or `null` when there is none.
 *
 * A CIP-0067 label is removed and the remainder is decoded; a name that carries
 * none is decoded whole. That is what makes a CIP-68 token readable: `USDM` is
 * `0014df105553444d`, where the first four bytes are the FT label and the rest
 * is literally `USDM`, and a printable test taken over the whole name rejects
 * every one of them.
 *
 * Either way the answer is a name the minter chose, and every surface that
 * renders one marks it as such. Recovering text from behind a label does not
 * make an issuer have published it.
 *
 * A name that is only a label leaves an empty remainder, which
 * `hexToPrintableAsciiString` rejects, so a bare label is no name rather than an
 * empty one. A stripped remainder that fails the test is not retried whole: a
 * labelled name begins with a byte no printable test accepts, so the whole form
 * cannot pass either.
 */
export const decodeAssetNameText = (
  assetName?: string | null
): string | null =>
  assetName ? hexToPrintableAsciiString(withoutCip67Label(assetName)) : null;

export type ResolvedAssetName = {
  name: string;
  provenance: AssetNameProvenance;
};
type ResolvableAsset = {
  assetName?: string | null;
  metadata?: AssetMetadata | null;
  source?: AssetMetadataSource | null;
};

/**
 * Resolves the name to display for an asset, highest source first: the registry
 * ticker, the registry name, the CIP-25 or CIP-68 name from a chain row, then
 * the asset's own name bytes when they are printable ASCII, then nothing.
 *
 * The row's `source` is what separates the second rung from the third. Both
 * arrive as `metadata.name`, because the cache stores one name column, and a
 * chain row is the only kind of row whose name did not come from the registry.
 * A chain row carries no ticker, so the first rung cannot be reached by one.
 *
 * Returns `null` when no rung resolves. The caller renders the fingerprint,
 * which is the identity in that case.
 */
export const resolveAssetName = ({
  assetName,
  metadata,
  source,
}: ResolvableAsset): ResolvedAssetName | null => {
  if (metadata?.ticker) {
    return {
      name: metadata.ticker,
      provenance: AssetNameProvenance.RegistryTicker,
    };
  }

  if (metadata?.name) {
    return {
      name: metadata.name,
      provenance:
        source === 'chain'
          ? AssetNameProvenance.ChainName
          : AssetNameProvenance.RegistryName,
    };
  }

  const decodedAssetName = decodeAssetNameText(assetName);

  if (decodedAssetName) {
    return {
      name: decodedAssetName,
      provenance: AssetNameProvenance.MinterChosen,
    };
  }

  return null;
};

/**
 * Whether a resolved name was chosen by the minter rather than published by an
 * issuer. Every surface that renders a name marks this case.
 */
export const isMinterChosenAssetName = (
  resolved: ResolvedAssetName | null
): boolean => resolved?.provenance === AssetNameProvenance.MinterChosen;
