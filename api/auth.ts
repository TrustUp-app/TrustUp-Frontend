import { httpRequest } from './httpClient';

export interface NonceResponseDto {
  nonce: string;
  expiresAt?: string;
}

export interface VerifyRequestDto {
  wallet: string;
  nonce: string;
  signature: string;
  // If backend expects additional fields, add them here.
}

export interface VerifyResponseDto {
  accessToken: string;
  refreshToken?: string;
}

export const authApi = {
  requestNonce: (wallet: string) => {
    return httpRequest<NonceResponseDto>('POST', '/auth/nonce', { wallet });
  },

  verify: (payload: VerifyRequestDto) => {
    return httpRequest<VerifyResponseDto>('POST', '/auth/verify', payload);
  },
};

