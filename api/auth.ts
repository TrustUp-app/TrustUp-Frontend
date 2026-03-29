/**
 * Auth API module
 * Covers: POST /auth/nonce and POST /auth/verify
 */

import { apiRequest } from '../lib/apiClient';

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface NonceRequestDto {
  wallet: string;
}

export interface NonceResponseDto {
  nonce: string;
  expiresAt: string; // ISO-8601 datetime string
}

export interface VerifyRequestDto {
  wallet: string;
  nonce: string;
  signature: string;
}

export interface VerifyResponseDto {
  accessToken: string;
  refreshToken: string;
}

// ─── API calls ───────────────────────────────────────────────────────────────

/**
 * Step 1 — Request a nonce for the given wallet address.
 * Public endpoint, no auth header needed.
 */
export async function fetchNonce(wallet: string): Promise<NonceResponseDto> {
  return apiRequest<NonceResponseDto>('POST', '/auth/nonce', {
    authenticated: false,
    body: { wallet } satisfies NonceRequestDto,
  });
}

/**
 * Step 2 — Submit the signed nonce to authenticate (register or login).
 * Returns accessToken and refreshToken on success.
 */
export async function verifySignature(dto: VerifyRequestDto): Promise<VerifyResponseDto> {
  return apiRequest<VerifyResponseDto>('POST', '/auth/verify', {
    authenticated: false,
    body: dto,
  });
}