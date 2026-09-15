import React from 'react';
import BigNumber from 'bignumber.js';
// Assets and helpers
import WalletsWrapper from '../_utils/WalletsWrapper';
import { getUtxoChartData } from '../../../../source/renderer/app/utils/utxoUtils';
import { rangeFrom } from '../../_support/argTypes';
// Screens
import WalletUtxo from '../../../../source/renderer/app/components/wallet/utxo/WalletUtxo';

const bucketRange = { min: 0, max: 20, step: 1 };

// The seventeen chart buckets. An arg name has to be an identifier and these
// controls were labelled by the amount they count, so the label is kept on the
// argType and the threshold, the name and the default live in one row each.
const utxoBuckets = [
  { threshold: 10, arg: 'bucket01', label: '1. 0.00001', value: 0 },
  { threshold: 100, arg: 'bucket02', label: '2. 0.0001', value: 2 },
  { threshold: 1000, arg: 'bucket03', label: '3. 0.001', value: 0 },
  { threshold: 10000, arg: 'bucket04', label: '4. 0.01', value: 1 },
  { threshold: 100000, arg: 'bucket05', label: '5. 0.1', value: 0 },
  { threshold: 1000000, arg: 'bucket06', label: '6. 1', value: 0 },
  { threshold: 10000000, arg: 'bucket07', label: '7. 10', value: 0 },
  { threshold: 100000000, arg: 'bucket08', label: '8. 100', value: 0 },
  { threshold: 1000000000, arg: 'bucket09', label: '9. 1000', value: 0 },
  { threshold: 10000000000, arg: 'bucket10', label: '10. 10K', value: 0 },
  {
    threshold: 100000000000,
    arg: 'bucket11',
    label: '11. 10K+ - 100K',
    value: 0,
  },
  {
    threshold: 1000000000000,
    arg: 'bucket12',
    label: '12. 10K+ - 1M',
    value: 0,
  },
  {
    threshold: 10000000000000,
    arg: 'bucket13',
    label: '13. 10K+ - 10M',
    value: 0,
  },
  {
    threshold: 100000000000000,
    arg: 'bucket14',
    label: '14. 10K+ - 100M',
    value: 0,
  },
  {
    threshold: 1000000000000000,
    arg: 'bucket15',
    label: '15. 10K+ - 1B',
    value: 0,
  },
  {
    threshold: 10000000000000000,
    arg: 'bucket16',
    label: '16. 10K+ - 10B',
    value: 0,
  },
  {
    threshold: 45000000000000000,
    arg: 'bucket17',
    label: '17. 10K+ - 45B',
    value: 0,
  },
];

const bucketArgs = utxoBuckets.reduce<Record<string, number>>((acc, bucket) => {
  acc[bucket.arg] = bucket.value;
  return acc;
}, {});

const bucketArgTypes = utxoBuckets.reduce<Record<string, unknown>>(
  (acc, bucket) => {
    acc[bucket.arg] = { name: bucket.label, ...rangeFrom(bucketRange) };
    return acc;
  },
  {}
);

export default {
  title: 'Wallets / Transactions',
  decorators: [WalletsWrapper],
};

export const UtxoDistribution = {
  args: { amount: 66.998, utxos: 100, ...bucketArgs },

  argTypes: {
    amount: { name: 'Amount', ...rangeFrom({ min: 0, max: 9999, step: 1 }) },
    utxos: { name: 'UTXOs', ...rangeFrom({ min: 0, max: 1000, step: 1 }) },
    ...bucketArgTypes,
  },

  render: (args) => (
    <WalletUtxo
      walletAmount={new BigNumber(args.amount)}
      walletUtxosAmount={args.utxos}
      chartData={getUtxoChartData(
        utxoBuckets.reduce<Record<number, number>>((acc, bucket) => {
          acc[bucket.threshold] = args[bucket.arg];
          return acc;
        }, {})
      )}
      onExternalLinkClick={() => {}}
      pendingTxnsCount={0}
    />
  ),

  name: 'UTXO Distribution',
};
