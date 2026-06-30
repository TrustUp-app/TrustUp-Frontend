# API Client & HTTP Layer

This directory contains the core HTTP client and authentication infrastructure for the TrustUp frontend application.

## Overview

The API client is built with **Axios** and includes:
- Automatic JWT token management
- Token refresh mechanism with request retry
- Request/response interceptors
- Secure token storage using `expo-secure-store`
- TypeScript type safety throughout

## Architecture

### Files

- **`api-client.ts`** - Configured Axios instance with interceptors
- **`token-storage.ts`** - Secure token persistence layer
- **`api-client.test.ts`** - Unit tests for the API client

## Usage

### Making API Calls

Import the `apiClient` and use it like a standard Axios instance:

```typescript
import { apiClient } from '../lib/api-client';

const response = await apiClient.get('/users/me');
const user = response.data;
```

### Using Services

For structured API calls, use the service modules instead:

```typescript
import { authService } from '../services';

const response = await authService.signIn({
  username: 'user@example.com',
  password: 'password123',
});
```

## Authentication Flow

### 1. Sign In

When a user signs in, tokens are automatically stored:

```typescript
import { authService } from '../services';

const response = await authService.signIn({
  username: 'myusername',
  password: 'mypassword',
});

// Tokens are automatically stored in secure storage
```

### 2. Authenticated Requests

All subsequent requests automatically include the access token:

```typescript
// No need to manually add Authorization header
const loans = await loansService.getMyLoans();
```

### 3. Token Refresh

When the access token expires (401 error), the client automatically:
1. Pauses the failed request
2. Calls `/auth/refresh` with the refresh token
3. Stores the new tokens
4. Retries the original request with the new access token
5. Resumes all queued requests

This happens transparently - your code doesn't need to handle it.

### 4. Sign Out

```typescript
import { authService } from '../services';

// Clears all stored tokens
await authService.signOut();
```

## Token Storage

Tokens are stored securely using `expo-secure-store`:

```typescript
import { setTokens, getTokens, clearTokens } from '../lib/token-storage';

// Store tokens
await setTokens({
  accessToken: 'jwt-access-token',
  refreshToken: 'jwt-refresh-token',
});

// Retrieve tokens
const tokens = await getTokens();

// Clear tokens
await clearTokens();
```

## Error Handling

### Using Type Guards

```typescript
import { apiClient, isApiError, handleApiError } from '../lib/api-client';

try {
  const response = await apiClient.get('/protected-route');
} catch (error) {
  if (isApiError(error)) {
    // Error is an ApiError with structured data
    console.error(error.message);
    console.error(error.statusCode);
  } else {
    // Handle other errors
    const message = handleApiError(error);
    console.error(message);
  }
}
```

### Service-Level Error Handling

```typescript
import { authService } from '../services';
import { handleApiError } from '../lib/api-client';

try {
  await authService.signIn(credentials);
} catch (error) {
  const errorMessage = handleApiError(error);
  Alert.alert('Error', errorMessage);
}
```

## Configuration

### Environment Variables

Set the API base URL in your `.env` file:

```env
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
```

**Platform-specific URLs:**
- **iOS Simulator**: `http://localhost:4000/api/v1`
- **Android Emulator**: `http://10.0.2.2:4000/api/v1`
- **Physical Device**: `http://192.168.1.100:4000/api/v1` (your computer's IP)
- **Production**: `https://api.trustup.app/v1`

### Timeout

Default request timeout is 30 seconds. To modify:

```typescript
const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds
});
```

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm test:watch
```

Generate coverage report:

```bash
npm test:coverage
```

## TypeScript Types

All API responses are fully typed. Import types from `../types/api`:

```typescript
import { User, Loan, ApiResponse } from '../types/api';

const response: ApiResponse<User> = await apiClient.get('/auth/me');
const user: User = response.data;
```

## Best Practices

1. **Always use services** - Don't call `apiClient` directly from components
2. **Handle errors gracefully** - Use `handleApiError` for user-facing messages
3. **Type everything** - Never use `any` types
4. **Don't store tokens manually** - Let the auth service handle it
5. **Test your integrations** - Write tests for service modules

## Security Notes

- Tokens are stored in `expo-secure-store`, which uses the device's secure storage
- Never log tokens to the console in production
- Always use HTTPS in production
- The refresh token is only sent to `/auth/refresh`, never to other endpoints

## Troubleshooting

### "Network Error" on Android Emulator

Use `http://10.0.2.2:4000/api/v1` instead of `localhost`.

### "Request failed with status code 401" repeatedly

The refresh token may have expired. Clear app data and sign in again.

### Tokens not persisting

Ensure `expo-secure-store` is properly installed and compatible with your Expo version.

## Related Documentation

- [Services Documentation](../services/README.md)
- [API Types](../types/api.ts)
- [Contributing Guide](../docs/contributing.md)
