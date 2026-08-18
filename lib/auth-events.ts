/**
 * Shared unauthorized-session signal. Both lib/api.ts (auth flow, #60) and
 * the pre-existing lib/api-client.ts (reputation/merchants/loans/pay) call
 * notifyUnauthorized() on a 401 so a single AuthContext registration covers
 * every API surface in the app, not just the new one.
 */
let unauthorizedHandler: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: (() => void) | null): void => {
  unauthorizedHandler = handler;
};

export const notifyUnauthorized = (): void => {
  unauthorizedHandler?.();
};
