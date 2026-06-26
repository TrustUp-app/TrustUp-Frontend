// Centralized environment access.
// Expo exposes env vars at build-time.
//
// Note: this repo may not have `expo-constants` installed, so we rely on
// the common Expo behavior where EXPO_PUBLIC_* values are injected.
export const EXPO_PUBLIC_API_URL: string = (process.env
  .EXPO_PUBLIC_API_URL as string | undefined) ?? '';



