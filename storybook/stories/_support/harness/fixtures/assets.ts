import BigNumber from 'bignumber.js';
import AssetDomain from '../../../../../source/renderer/app/domains/Asset';
import WalletAddress from '../../../../../source/renderer/app/domains/WalletAddress';
import type {
  AssetToken,
  Token,
} from '../../../../../source/renderer/app/api/assets/types';

/*
 * Tokens, the assets that describe them, and addresses.
 *
 * The application keeps these in two places and joins them at render time. A
 * wallet holds `Token`s, which carry a quantity and no name; the assets store
 * holds `Asset`s, which carry the name and metadata and no quantity; and
 * `getAssetTokens` in `utils/assets.ts` pairs them by `uniqueId` to produce what
 * a screen shows.
 *
 * That join is why the two halves are exported together here. A story that
 * supplies wallet tokens without the matching assets gets a screen that believes
 * it is still loading, because `WalletSummaryPage.tsx:129` compares the number of
 * raw tokens against the number it managed to resolve and treats a shortfall as
 * work in progress.
 */

const POLICY_ID = '6e8dc8b1f3591e8febcc47c51e9f2667c413a497aebd54cf38979086';

type AssetSpec = {
  assetName: string;
  fingerprint: string;
  quantity: number;
  name: string;
  ticker: string;
  decimals?: number;
};

// Hex-encoded names, which is what the chain carries and what `assetNameASCII`
// decodes for display.
const SPECS: Array<AssetSpec> = [
  {
    assetName: '6861707079636f696e',
    fingerprint: 'asset18v86ulgre52g4l7lvl5shl8h5cm4u3dmrjg2e8',
    quantity: 3_000_000,
    name: 'Happy Coin',
    ticker: 'HAPPY',
    decimals: 6,
  },
  {
    assetName: '746f6b656e62',
    fingerprint: 'asset1c7v8xqgnxsfz3y7ffsrhxu0mzzgz3nm6hdgw4t',
    quantity: 42,
    name: 'Token B',
    ticker: 'TKB',
  },
  {
    assetName: '6e6674',
    fingerprint: 'asset1hz8kx3m9cq0pfj4b6sr2vldn5x0qw7tyaf9e2u',
    quantity: 1,
    name: 'Collectible',
    ticker: 'NFT',
  },
];

const uniqueIdOf = (spec: AssetSpec) => `${POLICY_ID}${spec.assetName}`;

export const walletTokens = (): Array<Token> =>
  SPECS.map((spec) => ({
    policyId: POLICY_ID,
    assetName: spec.assetName,
    quantity: new BigNumber(spec.quantity),
    uniqueId: uniqueIdOf(spec),
  }));

export const assetDomains = () =>
  SPECS.map(
    (spec) =>
      new AssetDomain({
        policyId: POLICY_ID,
        assetName: spec.assetName,
        fingerprint: spec.fingerprint,
        uniqueId: uniqueIdOf(spec),
        decimals: spec.decimals ?? 0,
        recommendedDecimals: null,
        metadata: {
          name: spec.name,
          description: `${spec.name}, a story fixture`,
          ticker: spec.ticker,
        },
      })
  );

export const assetTokens = (): Array<AssetToken> =>
  SPECS.map((spec) => ({
    policyId: POLICY_ID,
    assetName: spec.assetName,
    fingerprint: spec.fingerprint,
    quantity: new BigNumber(spec.quantity),
    uniqueId: uniqueIdOf(spec),
    decimals: spec.decimals ?? 0,
    recommendedDecimals: null,
    metadata: {
      name: spec.name,
      description: `${spec.name}, a story fixture`,
      ticker: spec.ticker,
    },
  })) as Array<AssetToken>;

/*
 * The assets store as one override, paired with `walletTokens()` on the wallet
 * so the join resolves and no screen thinks it is still loading.
 */
export const withAssets = () => {
  const all = assetDomains();
  const byId = all.reduce<Record<string, unknown>>((acc, asset) => {
    acc[asset.uniqueId] = asset;
    return acc;
  }, {});
  return {
    all,
    details: byId,
    favorites: { [uniqueIdOf(SPECS[0])]: true },
    getAsset: (policyId: string, assetName: string) =>
      all.find(
        (asset) => asset.policyId === policyId && asset.assetName === assetName
      ) || null,
  };
};

const ADDRESS_PREFIX =
  'addr1q9gk7v2xr4m0cqlp83wnd6hu5zjt0yfae2s8l4jwx6h9dmvr3k8t5y0z';

export const addressList = (count = 6) =>
  Array.from(
    { length: count },
    (_unused, index) =>
      new WalletAddress({
        id: `${ADDRESS_PREFIX}${String(index).padStart(4, '0')}`,
        used: index < count / 2,
        spendingPath: `1852'/1815'/0'/0/${index}`,
      })
  );

/*
 * `isInternalAddress` answers "is this one of ours" for every row a transaction
 * list draws. Paired with the list so the answer agrees with what is in it.
 */
export const withAddresses = (count = 6) => {
  const all = addressList(count);
  const ids = new Set(all.map((address) => address.id));
  return {
    all,
    isInternalAddress: (address: string) => ids.has(address),
  };
};
