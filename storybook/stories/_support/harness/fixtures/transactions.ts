import BigNumber from 'bignumber.js';
import {
  TransactionStates,
  TransactionTypes,
  WalletTransaction,
} from '../../../../../source/renderer/app/domains/WalletTransaction';
import { LOVELACES_PER_ADA } from '../../../../../source/renderer/app/config/numbersConfig';

/*
 * Transaction lists, built deterministically.
 *
 * `storybook/stories/_support/utils.ts` already generates these, and the
 * component-level transaction stories use it. It draws every id, address,
 * amount and date from faker, which is right for a component story exercising
 * layout against arbitrary content and wrong for a screen story: two runs of the
 * same screen produce different lists, so nothing can be compared against
 * anything, and a rendered date can land in a different relative bucket between
 * one reload and the next.
 *
 * These are the same shapes with the randomness taken out.
 */

const ada = (amount: number) =>
  new BigNumber(amount).dividedBy(LOVELACES_PER_ADA);

// Fixed so a screenshot of a transaction list means the same thing twice.
const EPOCH_START = new Date('2026-08-01T10:00:00.000Z').getTime();
const ONE_DAY = 24 * 60 * 60 * 1000;

const address = (seed: number) =>
  `addr1q9${String(seed).padStart(4, '0')}k85furdn6r9tlyp2q23q9vq7nfl420j7y0yqp3hf6yw7jar5rnzqr4h3g9whm0zjh65utc2ty5uq`;

type TransactionOverrides = Record<string, unknown>;

export const transaction = (
  index: number,
  overrides: TransactionOverrides = {}
) =>
  new WalletTransaction({
    id: `story-tx-${String(index).padStart(3, '0')}`,
    type: index % 2 === 0 ? TransactionTypes.INCOME : TransactionTypes.EXPEND,
    title: '',
    amount: ada((index + 1) * 1_250_000),
    fee: ada(170_000),
    deposit: ada(0),
    assets: [],
    date: new Date(EPOCH_START - index * ONE_DAY),
    description: '',
    addresses: {
      from: [address(index)],
      to: [address(index + 100)],
      withdrawals: [],
    },
    state: TransactionStates.OK,
    confirmations: 12 + index,
    slotNumber: 21_600 + index,
    epochNumber: 512,
    metadata: null,
  });

export const transactionList = (count = 5) =>
  Array.from({ length: count }, (_unused, index) => transaction(index));

// A transaction the node has not confirmed. The summary screen counts these
// separately from the list it shows.
export const pendingTransaction = () =>
  transaction(0, {
    id: 'story-tx-pending',
    state: TransactionStates.PENDING,
    confirmations: 0,
  });

export const failedTransaction = () =>
  transaction(1, {
    id: 'story-tx-failed',
    state: TransactionStates.FAILED,
    confirmations: 0,
  });

/*
 * The store fields a wallet screen reads, as one override. `hasAny` is a
 * computed getter in the real store and a plain value here, so a story that
 * supplies a list without it would show an empty-state screen holding a full
 * list.
 */
export const withTransactions = (count = 5) => {
  const recent = transactionList(count);
  return {
    all: recent,
    allFiltered: recent,
    recent,
    recentFiltered: recent,
    hasAny: true,
    hasAnyFiltered: true,
    totalAvailable: count,
    totalFilteredAvailable: count,
  };
};

/*
 * The filter state a transaction list starts in.
 *
 * `TransactionsStore.populatedFilterOptions` falls back to a constant when no
 * filter is set, and the filter dialog destructures seven fields off it in its
 * constructor, so an absent one throws before the dialog renders. The shape is
 * written out here rather than imported because importing it would pull the
 * store module, and its transitive imports, into the harness graph; the values
 * are those at `stores/TransactionsStore.ts:66-77`.
 */
export const emptyFilterOptions = {
  searchTerm: '',
  searchLimit: 0,
  searchSkip: 0,
  dateRange: '',
  fromDate: '',
  toDate: '',
  fromAmount: '',
  toAmount: '',
  incomingChecked: true,
  outgoingChecked: true,
};
