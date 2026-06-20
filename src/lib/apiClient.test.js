import { describe, it, expect, vi, beforeEach } from 'vitest';

// The token comes from the bridge; mock it so we can drive the interceptor.
const getAuthToken = vi.fn();
vi.mock('./tokenBridge', () => ({
  getAuthToken: (...args) => getAuthToken(...args),
}));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

const { default: apiClient } = await import('./apiClient');

const requestInterceptor = () => apiClient.interceptors.request.handlers[0].fulfilled;

describe('apiClient request interceptor', () => {
  beforeEach(() => {
    getAuthToken.mockReset();
  });

  it('attaches a Bearer token from the token bridge', async () => {
    getAuthToken.mockResolvedValue('tok_abc');
    const config = await requestInterceptor()({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer tok_abc');
  });

  it('proceeds without an Authorization header when there is no token', async () => {
    getAuthToken.mockResolvedValue(null);
    const config = await requestInterceptor()({ headers: {} });
    expect(config.headers.Authorization).toBeUndefined();
  });

  it('does not throw if the token getter rejects', async () => {
    getAuthToken.mockRejectedValue(new Error('not signed in'));
    const config = await requestInterceptor()({ headers: {} });
    expect(config.headers.Authorization).toBeUndefined();
  });
});
