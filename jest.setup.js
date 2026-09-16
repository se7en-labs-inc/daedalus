// `jest-environment-jsdom` at this version provides no `globalThis.crypto`, so
// the platform CSPRNG that the renderer and the Electron main process both have
// is missing under test. Install Node's WebCrypto to stand in for it.
//
// This belongs in test configuration rather than in the code under test. The
// alternative, widening `secureRandomBytes` to accept a second source, would
// add a fallback branch to the one function whose whole purpose is not having
// one. It also matters for `@noble/hashes`, which `bip39` 3.1.0 depends on and
// which reads `globalThis.crypto` the same way.
const { webcrypto } = require('crypto');

if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    configurable: true,
    writable: true,
  });
}

// `jest-environment-jsdom` at this version also omits `TextEncoder` and
// `TextDecoder`, which are platform globals everywhere the application actually
// runs. `@noble/hashes` calls `TextEncoder` at import time to encode a constant,
// so a package depending on it throws before any test body executes, and the
// failure names the library rather than the missing global.
//
// Node's own implementations, for the same reason the WebCrypto one above is
// Node's: they are the platform's, not a substitute for it.
const { TextEncoder, TextDecoder } = require('util');

if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = TextEncoder;
}

if (!globalThis.TextDecoder) {
  globalThis.TextDecoder = TextDecoder;
}
