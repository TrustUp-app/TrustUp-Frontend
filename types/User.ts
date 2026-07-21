/**
 * UI / app model for the authenticated user profile.
 * Mapped from `GET /users/me` (and optional related endpoints).
 */
export interface UserProfile {
  id: string;
  displayName: string;
  username: string;
  /** Avatar image URL. Absent when the user has no photo (fall back to initials). */
  avatarUrl?: string | null;
  /** Full Stellar wallet address (starts with `G`). */
  walletAddress: string;
  /** Reputation score in the 0–100 range. */
  reputationScore: number;
  /** Total number of loans the user has taken. */
  totalLoans: number;
  /** Total amount deposited by the user, in the platform's base currency. */
  totalDeposited: number;
  /** ISO date string of when the user joined. */
  memberSince: string;
}

/**
 * Raw payload fields commonly returned by `GET /users/me`.
 * Supports both the documented API shape and a flatter UI-oriented shape.
 */
export interface UserMeApiResponse {
  id?: string;
  wallet?: string;
  walletAddress?: string;
  name?: string;
  displayName?: string;
  username?: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  reputationScore?: number;
  totalLoans?: number;
  totalDeposited?: number;
  memberSince?: string;
  createdAt?: string;
}

/**
 * Maps a `GET /users/me` payload into the app's {@link UserProfile} model.
 */
export const mapUserMeToProfile = (raw: UserMeApiResponse): UserProfile => {
  const displayName = raw.displayName ?? raw.name ?? '';
  const walletAddress = raw.walletAddress ?? raw.wallet ?? '';
  const username =
    raw.username ?? (walletAddress ? walletAddress.slice(0, 8).toLowerCase() : 'user');

  return {
    id: raw.id ?? walletAddress ?? 'unknown',
    displayName: displayName || username,
    username,
    avatarUrl: raw.avatarUrl ?? raw.avatar ?? null,
    walletAddress,
    reputationScore: raw.reputationScore ?? 0,
    totalLoans: raw.totalLoans ?? 0,
    totalDeposited: raw.totalDeposited ?? 0,
    memberSince: raw.memberSince ?? raw.createdAt ?? new Date().toISOString(),
  };
};
