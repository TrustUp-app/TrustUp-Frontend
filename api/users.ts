/**
 * Users API module
 * Covers: GET /users/me and PATCH /users/me
 */

import { apiRequest } from '../lib/apiClient';

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  wallet: string;
  username: string;
  displayName: string;
  profileImage: string | null;
}

export interface UpdateProfileDto {
  username?: string;
  displayName?: string;
  profileImage?: string | null;
}

// ─── API calls ───────────────────────────────────────────────────────────────

/**
 * Fetch the authenticated user's profile.
 * Requires a valid access token (attached automatically by apiRequest).
 */
export async function getMe(): Promise<UserProfile> {
  return apiRequest<UserProfile>('GET', '/users/me', { authenticated: true });
}

/**
 * Update the authenticated user's profile with the provided fields.
 */
export async function updateMe(dto: UpdateProfileDto): Promise<UserProfile> {
  return apiRequest<UserProfile>('PATCH', '/users/me', {
    authenticated: true,
    body: dto,
  });
}