/**
 * Shared unauthorized-session signal. `lib/api.ts` calls `notifyUnauthorized()`
 * on a 401 so a single AuthContext registration covers every API surface in
 * the app.
 */
let unauthorizedHandler: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: (() => void) | null): void => {
  unauthorizedHandler = handler;
};

export const notifyUnauthorized = (): void => {
  unauthorizedHandler?.();
};
