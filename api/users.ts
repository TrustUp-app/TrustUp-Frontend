import { httpRequest } from './httpClient';

export interface UserProfileDto {
  walletAddress: string;
  username: string;
  displayName: string;
  profileImage?: string | null;
  // Add fields if backend includes more.
}

export interface GetMeResponseDto {
  user: UserProfileDto;
}

export interface UpdateMeRequestDto {
  walletAddress?: string;
  username?: string;
  displayName?: string;
  profileImage?: string | null;
}

export const usersApi = {
  getMe: () => httpRequest<GetMeResponseDto>('GET', '/users/me'),

  updateMe: (payload: UpdateMeRequestDto) =>
    httpRequest<GetMeResponseDto | undefined>('PATCH', '/users/me', payload),
};

