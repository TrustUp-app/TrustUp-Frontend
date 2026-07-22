/**
 * Minimal access-token holder for the API client's Authorization header.
 *
 * @todo Back this with a real secure store once the auth flow lands (the
 *   auth PRs — nonce/verify → JWT — are not merged yet). `expo-secure-store`
 *   is the intended backend on device; keep the async signature so swapping in
 *   persistent storage requires no changes at call sites.
 */

let accessToken: string | null = null;

export async function getAccessToken(): Promise<string | null> {
  return accessToken;
}

export async function setAccessToken(token: string | null): Promise<void> {
  accessToken = token;
}
