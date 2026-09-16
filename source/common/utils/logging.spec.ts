import { describeError, filterLogData } from './logging';

describe('describeError', () => {
  it('records the name and message of an Error that JSON.stringify drops', () => {
    // The premise: an Error has no enumerable own properties, so a handler
    // that logs it directly writes `{}` and no information at all.
    expect(JSON.stringify(new Error('backend went away'))).toBe('{}');

    expect(describeError(new Error('backend went away'))).toEqual({
      name: 'Error',
      message: 'backend went away',
    });
  });

  it('survives serialisation', () => {
    expect(
      JSON.parse(JSON.stringify(describeError(new TypeError('bad'))))
    ).toEqual({
      name: 'TypeError',
      message: 'bad',
    });
  });

  it('keeps the status code an Error carries alongside its message', () => {
    const error: any = new Error('Unknown API response (500)');
    error.statusCode = 500;

    expect(describeError(error)).toEqual({
      name: 'Error',
      message: 'Unknown API response (500)',
      statusCode: 500,
    });
  });

  it('keeps the code and message of a backend rejection object', () => {
    expect(
      describeError({
        code: 'not_enough_money',
        message: 'I cannot afford this transaction',
      })
    ).toEqual({
      code: 'not_enough_money',
      message: 'I cannot afford this transaction',
    });
  });

  it('keeps the syscall and code of a connection failure', () => {
    const error: any = new Error('connect ECONNREFUSED 127.0.0.1:8090');
    error.code = 'ECONNREFUSED';
    error.syscall = 'connect';

    expect(describeError(error)).toEqual({
      name: 'Error',
      message: 'connect ECONNREFUSED 127.0.0.1:8090',
      code: 'ECONNREFUSED',
      syscall: 'connect',
    });
  });

  it('bounds a message that carries the response it could not parse', () => {
    const body = JSON.stringify(
      Array.from({ length: 2000 }, (_, index) => ({
        id: `tx-${index}`,
      }))
    );
    const raw = `Failed to parse API response (500) - raw body: ${body}`;
    const description = describeError(new Error(raw));

    expect(body.length).toBeGreaterThan(20000);
    expect(description.message).toBe(
      `${raw.slice(0, 512)} [truncated, ${raw.length} chars]`
    );
    expect(JSON.stringify(description).length).toBeLessThan(700);
  });

  it('omits a response payload hung off an Error', () => {
    const error: any = new Error('Unknown API response (502)');
    error.statusCode = 502;
    error.responseBody = {
      transactions: [{ id: 'tx-1', metadata: { 721: 'nft-metadata' } }],
    };

    const description = describeError(error);

    expect(description).not.toHaveProperty('responseBody');
    expect(JSON.stringify(description)).not.toContain('nft-metadata');
  });

  it('omits the stack', () => {
    expect(describeError(new Error('boom'))).not.toHaveProperty('stack');
  });

  it('reports that a thrown empty object carried nothing', () => {
    expect(describeError({})).toEqual({
      message: 'thrown value carried no diagnostic fields',
    });
  });

  it('describes thrown values that are not objects', () => {
    expect(describeError('plain string failure')).toEqual({
      message: 'plain string failure',
    });
    expect(describeError(null)).toEqual({
      message: 'null',
    });
    expect(describeError(undefined)).toEqual({
      message: 'undefined',
    });
    expect(describeError(404)).toEqual({
      message: '404',
    });
  });
});

describe('filterLogData', () => {
  it('redacts every public key the wallet backend returns', () => {
    const filtered = filterLogData({
      walletId: 'wallet-1',
      walletPublicKey: 'xpub-wallet',
      accountPublicKey: 'xpub-account',
      icoPublicKey: 'xpub-ico',
      extendedPublicKey: {
        publicKeyHex: 'aa',
        chainCodeHex: 'bb',
      },
    });

    expect(filtered).toEqual({
      walletId: 'wallet-1',
    });
    expect(JSON.stringify(filtered)).not.toContain('xpub');
  });
});
