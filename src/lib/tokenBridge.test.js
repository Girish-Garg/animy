import { describe, it, expect, beforeEach } from 'vitest';
import { setTokenGetter, clearTokenGetter, getAuthToken } from './tokenBridge';

describe('tokenBridge', () => {
  beforeEach(() => clearTokenGetter());

  it('returns null when no getter is registered', async () => {
    expect(await getAuthToken()).toBeNull();
  });

  it('returns the token from the registered getter', async () => {
    setTokenGetter(async () => 'tok_123');
    expect(await getAuthToken()).toBe('tok_123');
  });

  it('forwards options to the getter (e.g. skipCache for the 401 retry)', async () => {
    let received;
    setTokenGetter(async (opts) => { received = opts; return 't'; });
    await getAuthToken({ skipCache: true });
    expect(received).toEqual({ skipCache: true });
  });
});
