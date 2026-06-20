// Bridges Clerk's React-only getToken() into non-React modules (the axios
// interceptor). Clerk's getToken() already caches the session token and
// refreshes it near expiry, so this is a thin pass-through — no custom
// caching or expiry tracking (that was the source of the stale-token 401s).
let getter = null;

export function setTokenGetter(fn) {
  getter = fn;
}

export function clearTokenGetter() {
  getter = null;
}

export async function getAuthToken(options) {
  if (!getter) return null;
  return getter(options);
}
