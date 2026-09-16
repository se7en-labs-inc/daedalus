import { logger } from '../utils/logging';
import { getTransactionHistory } from './transactions/requests/getTransactionHistory';
import { createWalletSignature } from './voting/requests/createWalletSignature';
import { getAddresses } from './addresses/requests/getAddresses';
import { getWalletPublicKey } from './wallets/requests/getWalletPublicKey';
import { getAccountPublicKey } from './wallets/requests/getAccountPublicKey';
import { getPublicKey } from './transactions/requests/getPublicKey';
import { getICOPublicKey } from './transactions/requests/getICOPublicKey';
import AdaApi from './api';

// The request layer builds an https agent when its module loads, which Jest
// has no global for. Every endpoint below reaches it, so it is replaced rather
// than each endpoint module being given a global to find.
jest.mock('./utils/request', () => ({
  request: jest.fn(),
}));
jest.mock('./transactions/requests/getTransactionHistory', () => ({
  getTransactionHistory: jest.fn(),
}));
jest.mock('./voting/requests/createWalletSignature', () => ({
  createWalletSignature: jest.fn(),
}));
jest.mock('./addresses/requests/getAddresses', () => ({
  getAddresses: jest.fn(),
}));
jest.mock('./wallets/requests/getWalletPublicKey', () => ({
  getWalletPublicKey: jest.fn(),
}));
jest.mock('./wallets/requests/getAccountPublicKey', () => ({
  getAccountPublicKey: jest.fn(),
}));
jest.mock('./transactions/requests/getPublicKey', () => ({
  getPublicKey: jest.fn(),
}));
jest.mock('./transactions/requests/getICOPublicKey', () => ({
  getICOPublicKey: jest.fn(),
}));

const config = {
  hostname: 'localhost',
  port: 8090,
  ca: new Uint8Array(),
  cert: new Uint8Array(),
  key: new Uint8Array(),
};

// Sentinels stand in for the values that must not reach a log line. Each is
// distinctive enough that a substring search over the recorded calls is a
// sound test of absence.
const ADDRESS = 'addr1_SENTINEL_COUNTERPARTY_ADDRESS';
const OWN_ADDRESS = 'addr1_SENTINEL_OWN_ADDRESS';
const ASSET_NAME = 'SENTINEL_ASSET_NAME';
const NFT_NAME = 'SENTINEL_NFT_METADATA';
const XPUB = 'SENTINEL_EXTENDED_PUBLIC_KEY';

const buildTransaction = (index: number) => ({
  id: `sentinel-tx-id-${index}`,
  amount: { quantity: 1000000, unit: 'lovelace' },
  fee: { quantity: 170000, unit: 'lovelace' },
  deposit_taken: { quantity: 0, unit: 'lovelace' },
  deposit_returned: { quantity: 0, unit: 'lovelace' },
  depth: { quantity: 12, unit: 'block' },
  direction: 'incoming',
  status: 'in_ledger',
  inserted_at: {
    time: '2026-09-01T00:00:00.000Z',
    block: { slot_number: 1, epoch_number: 1, height: { quantity: 1 } },
  },
  inputs: [{ address: OWN_ADDRESS, id: `in-${index}`, index: 0 }],
  outputs: [
    {
      address: ADDRESS,
      amount: { quantity: 1000000, unit: 'lovelace' },
      assets: [
        {
          policy_id: 'sentinel-policy-id',
          asset_name: ASSET_NAME,
          quantity: 1,
        },
      ],
    },
  ],
  withdrawals: [],
  certificates: [],
  // CIP-25 payloads ride on this field and scale without bound.
  metadata: {
    721: {
      'sentinel-policy-id': {
        [NFT_NAME]: {
          name: NFT_NAME,
          image: 'ipfs://sentinel',
          description: 'x'.repeat(400),
        },
      },
    },
  },
});

// Every level, because a payload moved to a different level is still a payload.
const spyOnLogger = () => ({
  debug: jest.spyOn(logger, 'debug').mockImplementation(() => undefined),
  info: jest.spyOn(logger, 'info').mockImplementation(() => undefined),
  warn: jest.spyOn(logger, 'warn').mockImplementation(() => undefined),
  error: jest.spyOn(logger, 'error').mockImplementation(() => undefined),
});

const recorded = (spies: ReturnType<typeof spyOnLogger>) =>
  JSON.stringify(Object.values(spies).map((spy) => spy.mock.calls));

describe('AdaApi logging', () => {
  let api: AdaApi;
  let spies: ReturnType<typeof spyOnLogger>;

  beforeEach(() => {
    api = new AdaApi(false, config);
    spies = spyOnLogger();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getTransactions', () => {
    const request = {
      walletId: 'sentinel-wallet-id',
      order: 'descending' as const,
      isLegacy: false,
      fromDate: null,
      toDate: null,
    };

    it('logs the transaction count', async () => {
      const response = Array.from({ length: 250 }, (_, index) =>
        buildTransaction(index)
      );
      (getTransactionHistory as jest.Mock).mockResolvedValue(response);

      await api.getTransactions(request as any);

      expect(spies.debug).toHaveBeenCalledWith(
        'AdaApi::getTransactions success',
        {
          transactions: 250,
        }
      );
    });

    it('bounds the log line regardless of how large the response is', async () => {
      const small = Array.from({ length: 1 }, (_, i) => buildTransaction(i));
      const large = Array.from({ length: 500 }, (_, i) => buildTransaction(i));

      (getTransactionHistory as jest.Mock).mockResolvedValue(small);
      await api.getTransactions(request as any);
      const afterSmall = recorded(spies).length;

      jest.restoreAllMocks();
      spies = spyOnLogger();

      (getTransactionHistory as jest.Mock).mockResolvedValue(large);
      await api.getTransactions(request as any);
      const afterLarge = recorded(spies).length;

      // A 500-transaction response serialises to several hundred kilobytes.
      // The log line is identical in both cases and three orders of magnitude
      // smaller, so its size is not a function of the response.
      expect(JSON.stringify(large).length).toBeGreaterThan(500000);
      // The two lines differ only by the digit width of the count itself.
      expect(afterLarge - afterSmall).toBeLessThanOrEqual(4);
      expect(afterLarge).toBeLessThan(500);
      expect(JSON.stringify(large).length / afterLarge).toBeGreaterThan(1000);
    });

    it('records no address, asset name or metadata from the response', async () => {
      const response = Array.from({ length: 30 }, (_, i) =>
        buildTransaction(i)
      );
      (getTransactionHistory as jest.Mock).mockResolvedValue(response);

      await api.getTransactions(request as any);
      const logged = recorded(spies);

      expect(logged).not.toContain(ADDRESS);
      expect(logged).not.toContain(OWN_ADDRESS);
      expect(logged).not.toContain(ASSET_NAME);
      expect(logged).not.toContain(NFT_NAME);
      expect(logged).not.toContain('sentinel-tx-id-0');
    });

    it('records the name and message of a failure rather than an empty object', async () => {
      (getTransactionHistory as jest.Mock).mockRejectedValue(
        new Error('wallet backend is not responding')
      );

      await expect(api.getTransactions(request as any)).rejects.toBeDefined();

      expect(spies.error).toHaveBeenCalledWith(
        'AdaApi::getTransactions error',
        {
          error: {
            name: 'Error',
            message: 'wallet backend is not responding',
          },
        }
      );
      expect(recorded(spies)).not.toContain('"error":{}');
    });
  });

  describe('getAddresses', () => {
    it('logs the address count and no address value', async () => {
      (getAddresses as jest.Mock).mockResolvedValue(
        Array.from({ length: 40 }, (_, index) => ({
          id: `${ADDRESS}-${index}`,
          state: 'used',
          derivation_path: ['1852H', '1815H', '0H', '0', `${index}`],
        }))
      );

      await api.getAddresses({
        walletId: 'sentinel-wallet-id',
        isLegacy: false,
        queryParams: {},
      } as any);

      expect(spies.debug).toHaveBeenCalledWith('AdaApi::getAddresses success', {
        addresses: 40,
      });
      expect(recorded(spies)).not.toContain(ADDRESS);
    });
  });

  describe('public key handlers', () => {
    it('getWalletPublicKey records no key material', async () => {
      (getWalletPublicKey as jest.Mock).mockResolvedValue(XPUB);

      const result = await api.getWalletPublicKey({
        walletId: 'sentinel-wallet-id',
        role: 'utxo_external',
        index: '0',
      } as any);

      // The key still reaches the caller; it just never reaches the log.
      expect(result).toBe(XPUB);
      expect(spies.debug).toHaveBeenCalledWith(
        'AdaApi::getWalletPublicKey success'
      );
      expect(recorded(spies)).not.toContain(XPUB);
    });

    it('getAccountPublicKey records no key material', async () => {
      (getAccountPublicKey as jest.Mock).mockResolvedValue(XPUB);

      const result = await api.getAccountPublicKey({
        walletId: 'sentinel-wallet-id',
        index: '0',
        passphrase: 'sentinel-passphrase',
        extended: true,
      } as any);

      expect(result).toBe(XPUB);
      expect(spies.debug).toHaveBeenCalledWith(
        'AdaApi::getAccountPublicKey success'
      );
      expect(recorded(spies)).not.toContain(XPUB);
      expect(recorded(spies)).not.toContain('sentinel-passphrase');
    });

    it('getPublicKey records no key material', async () => {
      (getPublicKey as jest.Mock).mockResolvedValue(XPUB);

      await api.getPublicKey({
        walletId: 'sentinel-wallet-id',
        role: 'utxo_external',
        index: '0',
      });

      expect(spies.debug).toHaveBeenCalledWith('AdaApi::getPublicKey success');
      expect(recorded(spies)).not.toContain(XPUB);
    });

    it('getICOPublicKey records no key material', async () => {
      (getICOPublicKey as jest.Mock).mockResolvedValue(XPUB);

      await api.getICOPublicKey({
        walletId: 'sentinel-wallet-id',
        index: '0',
        passphrase: 'sentinel-passphrase',
        format: 'extended',
        purpose: '1854H',
      } as any);

      expect(spies.debug).toHaveBeenCalledWith(
        'AdaApi::getICOPublicKey success'
      );
      expect(recorded(spies)).not.toContain(XPUB);
    });

    it('logs each success with no payload at all', async () => {
      (getWalletPublicKey as jest.Mock).mockResolvedValue(XPUB);

      await api.getWalletPublicKey({
        walletId: 'sentinel-wallet-id',
        role: 'utxo_external',
        index: '0',
      } as any);

      const successCall = spies.debug.mock.calls.find(
        ([message]) => message === 'AdaApi::getWalletPublicKey success'
      );
      // A summarised key is still a key, so the call carries one argument.
      expect(successCall).toHaveLength(1);
    });
  });

  describe('createWalletSignature', () => {
    it('records no signature', async () => {
      const signature = Buffer.from('SENTINEL_SIGNATURE_BYTES');
      (createWalletSignature as jest.Mock).mockResolvedValue(signature);

      await api.createWalletSignature({
        walletId: 'sentinel-wallet-id',
        role: 'utxo_external',
        index: '0',
        passphrase: 'sentinel-passphrase',
        votingKey: 'SENTINEL_VOTING_KEY',
        stakeKey: 'SENTINEL_STAKE_KEY',
        addressHex: 'SENTINEL_ADDRESS_HEX',
        absoluteSlotNumber: 1,
      } as any);

      const logged = recorded(spies);

      expect(spies.debug).toHaveBeenCalledWith(
        'AdaApi::createWalletSignature success'
      );
      expect(logged).not.toContain('SENTINEL_SIGNATURE_BYTES');
      expect(logged).not.toContain(signature.toString('hex'));
      expect(logged).not.toContain('SENTINEL_VOTING_KEY');
      expect(logged).not.toContain('SENTINEL_STAKE_KEY');
    });
  });
});
