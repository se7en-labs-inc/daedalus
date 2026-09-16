/**
 * Two real mainnet registry entries, fetched from `tokens.cardano.org` on
 * 2026-09-16, trimmed to the five properties these specs read. Neither carries
 * a `policy` field, which is why `policy` is null for both: the field is
 * OPTIONAL and the registry serves these entries without it.
 *
 * They are the two sides of the rule that decides whether a published decimal
 * place count is applied. In a sample of 120 mappings taken from the registry's
 * 7,977 on the same day, 106 publish a decimals value, 104 of those are
 * attested at their declared sequence number, and 53 also carry `policy`. USDM
 * is one of the 51 that are attested and unbound. MELD is one of the 2 that are
 * not attested at all.
 */
import type { RegistryEntry } from './assetRegistryClient';

/**
 * Attested and unbound. Every property verifies at its declared sequence
 * number, `decimals` at 0 with the value 6, and the entry names no minting
 * policy. Daedalus renders the name, the ticker and the description from this
 * entry, so withholding the 6 alone was the inconsistency the attestation rule
 * removes.
 */
export const USDM: RegistryEntry = {
  subject:
    'c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d',
  policy: null,
  properties: {
    name: {
      value: 'USDM',
      sequenceNumber: 0,
      signatures: [
        {
          signature:
            '7ce25404dc104e55ea0dd6910f5a39760cddbc8ad5876fc2c3a738ced18086e57db11a3a7d4909245f8ed15730aa4be6fbbbdf25d73c15b6d2a1058b807df30c',
          publicKey:
            'c215a209c4fb0b9c3537affc459bbc482b4b0a902b59187250942677782848b3',
        },
      ],
    },
    description: {
      value: 'Fiat-backed stablecoin native to the Cardano blockchain',
      sequenceNumber: 0,
      signatures: [
        {
          signature:
            '9014f13f4f1aa647cc98ea24f57be6a8a37e8de214bdd991fa3843973c0accd32d78585a7c5abd86e42c0d46e000ce72497b3a573cd99bfe1aae5c11c5195c00',
          publicKey:
            'c215a209c4fb0b9c3537affc459bbc482b4b0a902b59187250942677782848b3',
        },
      ],
    },
    url: {
      value: 'https://moneta.global/',
      sequenceNumber: 1,
      signatures: [
        {
          signature:
            '818b09f19401efcddeabfbd385b8e1c81c445a8e9ef5a49a2d1dbe29c35afae11daf703935a78ae774c470de12cfdd31ca3943c82ff59496f0415a42df719505',
          publicKey:
            'c215a209c4fb0b9c3537affc459bbc482b4b0a902b59187250942677782848b3',
        },
      ],
    },
    ticker: {
      value: 'USDM',
      sequenceNumber: 0,
      signatures: [
        {
          signature:
            '5ff7ee7a98f1439f178ec1bd520b9312c356bbb7ec5641ab27dae602cbe5e4708634587cdfc52d100f486a4d9d828d7d990fa1ba164de9b0b253826771b2300e',
          publicKey:
            'c215a209c4fb0b9c3537affc459bbc482b4b0a902b59187250942677782848b3',
        },
      ],
    },
    decimals: {
      value: 6,
      sequenceNumber: 0,
      signatures: [
        {
          signature:
            '7d37e1dd5320e59d3e0d191d8345807ce5026fe70d242c357275c37d3ffef4c33bbfdf5b78529a24fa2ca05181a0ac58ccc584757a268cceb423382d353e3d00',
          publicKey:
            'c215a209c4fb0b9c3537affc459bbc482b4b0a902b59187250942677782848b3',
        },
      ],
    },
  },
};

/**
 * Not attested, and a stale edit rather than an attack. Every property of this
 * entry declares `sequenceNumber` 1, the five below and the logo that is not,
 * and every one of its signatures verifies against the payload built at
 * sequence number 0. Somebody edited the entry and bumped the counter without
 * re-signing it.
 *
 * This is the shape a spec has to assert rather than a bare `false`, because
 * `false` is also what a forged signature produces and the two are not the same
 * event. It is the only genuine refusal in the 120-entry sample.
 */
export const MELD: RegistryEntry = {
  subject: '6ac8ef33b510ec004fe11585f7c5a9f0c07f0c23428ab4f29c1d7d104d454c44',
  policy: null,
  properties: {
    name: {
      value: 'MELD',
      sequenceNumber: 1,
      signatures: [
        {
          signature:
            '864d1beba761a960af9ce5b7fe493b51c392e4753c4db332aef234897349e534fe710b79535fea18f4c46e486667a4f405f0ce86f06641fad97fda1584b6fd03',
          publicKey:
            '480e6da73ac87f37154d68d49feddc2e5a4fe0c20c42d59f21be245d4534256f',
        },
      ],
    },
    description: {
      value: 'Deprecated version of the governance token of the MELD protocol.',
      sequenceNumber: 1,
      signatures: [
        {
          signature:
            '810a61adaf621c53c111a3a4b74990c3efc60318798f2a1de13e8db3b10cf8f99c1baa77b85ff048280ba5730cbbe434173f16bca94bd81d4dca96398135920a',
          publicKey:
            '480e6da73ac87f37154d68d49feddc2e5a4fe0c20c42d59f21be245d4534256f',
        },
      ],
    },
    url: {
      value: 'https://meld.com',
      sequenceNumber: 1,
      signatures: [
        {
          signature:
            '13fdfcdd8843bd2b31e3eed9580e8de585f24bf4c00d37a3e5a6ba1b36a510f1fb1b7a81ed6c08450099d74e403b266895b1db74752565dae1e82b4f702e6400',
          publicKey:
            '480e6da73ac87f37154d68d49feddc2e5a4fe0c20c42d59f21be245d4534256f',
        },
      ],
    },
    ticker: {
      value: 'MELD',
      sequenceNumber: 1,
      signatures: [
        {
          signature:
            '96700ca44b7e940eab18047902d7c822ca7136be6b530be5948491213dc72d3bcdcc7b7b28b39418892bfe095d4dfc3e4106d444302b9a748f007f28df14ad06',
          publicKey:
            '480e6da73ac87f37154d68d49feddc2e5a4fe0c20c42d59f21be245d4534256f',
        },
      ],
    },
    decimals: {
      value: 6,
      sequenceNumber: 1,
      signatures: [
        {
          signature:
            '277c755bea4426012e6f01b9e10f93e131e6fffb2beea8403199e024e78c8dad66111be14f6ffa614ccb46666ef310dc13810e910e15c87ea8489b00d11a4003',
          publicKey:
            '480e6da73ac87f37154d68d49feddc2e5a4fe0c20c42d59f21be245d4534256f',
        },
      ],
    },
  },
};

/** The sequence number MELD's signatures actually cover. */
export const MELD_SIGNED_SEQUENCE_NUMBER = 0;
