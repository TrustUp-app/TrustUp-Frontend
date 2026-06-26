# TODO - Connect Create Account flow to backend and navigate to Pay Screen

- [ ] Implement navigation stack in `App.tsx` (Create Account -> Pay) using `RootStackParamList`
- [ ] Add API/http client using `EXPO_PUBLIC_API_URL` and Authorization helper
- [ ] Add secure token storage (accessToken/refreshToken) helper
- [ ] Implement `POST /api/v1/auth/nonce` and `POST /api/v1/auth/verify` in `use-create-account.ts`
- [ ] Implement wallet nonce signing + signature submission aligned with backend VerifyRequestDto (add signing integration if missing)
- [ ] Implement profile sync via `GET /api/v1/users/me` and `PATCH /api/v1/users/me` as needed
- [ ] Remove mock `setTimeout + Alert` success; replace with real success + errors + loading state
- [ ] Wire `CreateAccountScreen` navigation types and navigate to `Pay Screen` after success
- [ ] Lint + typecheck + run tests
- [ ] Ensure PR template can be completed: document nonce/verify, token storage, users/me sync, wallet signing, navigation to Pay

