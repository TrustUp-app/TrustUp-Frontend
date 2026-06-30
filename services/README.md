# API Services

This directory contains typed service modules for interacting with the TrustUp API. Each service encapsulates a specific domain of the application.

## Service Modules

### 🔐 Authentication Service (`auth.service.ts`)

Handles user authentication and profile management.

**Available methods:**
- `signIn(credentials)` - Sign in with username/password
- `createAccount(payload)` - Create new user account
- `signOut()` - Sign out and clear tokens
- `getCurrentUser()` - Get current user profile
- `updateProfile(updates)` - Update user profile
- `changePassword(currentPassword, newPassword)` - Change password
- `requestPasswordReset(email)` - Request password reset
- `resetPassword(token, newPassword)` - Reset password with token

**Example:**
```typescript
import { authService } from '../services';

const response = await authService.signIn({
  username: 'myusername',
  password: 'mypassword',
});

const user = response.data.user;
```

---

### 💰 Loans Service (`loans.service.ts`)

Manages loan requests, repayments, and loan-related operations.

**Available methods:**
- `getLoans(params?)` - Get all loans with filtering
- `getMyLoans(params?)` - Get current user's loans
- `getLoanById(loanId)` - Get specific loan details
- `createLoan(loanData)` - Create new loan request
- `updateLoan(loanId, updates)` - Update loan details
- `cancelLoan(loanId)` - Cancel pending loan
- `repayLoan(loanId, amount)` - Make loan repayment
- `getLoanSchedule(loanId)` - Get repayment schedule
- `getLoanStats()` - Get user's loan statistics

**Example:**
```typescript
import { loansService } from '../services';

// Create a new loan request
const loan = await loansService.createLoan({
  amount: 5000,
  duration: 12, // months
  purpose: 'Business expansion',
});

// Get my loans
const myLoans = await loansService.getMyLoans({
  status: 'active',
  page: 1,
  limit: 10,
});
```

---

### 🏪 Merchants Service (`merchants.service.ts`)

Handles merchant discovery and payment operations.

**Available methods:**
- `getMerchants(params?)` - Get all merchants with pagination
- `getMerchantById(merchantId)` - Get specific merchant details
- `searchMerchants(query, category?)` - Search merchants
- `getMerchantCategories()` - Get available categories
- `createPayment(paymentData)` - Create payment to merchant
- `getPaymentHistory(params?)` - Get user's payment history
- `getPaymentById(paymentId)` - Get specific payment details
- `cancelPayment(paymentId)` - Cancel pending payment
- `getPaymentStats()` - Get user's payment statistics

**Example:**
```typescript
import { merchantsService } from '../services';

// Search for merchants
const merchants = await merchantsService.searchMerchants('coffee', 'food');

// Create payment
const payment = await merchantsService.createPayment({
  merchantId: 'merchant-123',
  amount: 25.50,
});
```

---

### 📊 Liquidity Service (`liquidity.service.ts`)

Manages liquidity pool investments and withdrawals.

**Available methods:**
- `getLiquidityPool()` - Get current pool information
- `depositToPool(investData)` - Deposit funds to pool
- `withdrawFromPool(amount)` - Withdraw funds from pool
- `getMyInvestments(params?)` - Get user's investments
- `getInvestmentById(investmentId)` - Get specific investment
- `calculateEarnings(amount, duration)` - Calculate potential earnings
- `getInvestmentStats()` - Get user's investment statistics
- `getPoolAnalytics()` - Get pool analytics and history

**Example:**
```typescript
import { liquidityService } from '../services';

// Calculate potential earnings
const estimate = await liquidityService.calculateEarnings(1000, 365);
console.log(`Estimated earnings: $${estimate.data.estimatedEarnings}`);
console.log(`APY: ${estimate.data.apy}%`);

// Deposit to pool
const investment = await liquidityService.depositToPool({
  amount: 1000,
});
```

---

### 🔔 Notifications Service (`notifications.service.ts`)

Handles user notifications and preferences.

**Available methods:**
- `getNotifications(params?)` - Get all notifications
- `getNotificationById(notificationId)` - Get specific notification
- `markAsRead(notificationId)` - Mark notification as read
- `markAsUnread(notificationId)` - Mark notification as unread
- `markAllAsRead()` - Mark all notifications as read
- `deleteNotification(notificationId)` - Delete notification
- `deleteAllNotifications()` - Delete all notifications
- `getUnreadCount()` - Get unread notification count
- `getNotificationPreferences()` - Get notification preferences
- `updateNotificationPreferences(preferences)` - Update preferences

**Example:**
```typescript
import { notificationsService } from '../services';

// Get unread notifications
const notifications = await notificationsService.getNotifications({
  unreadOnly: true,
  page: 1,
  limit: 20,
});

// Mark as read
await notificationsService.markAsRead(notifications.data.items[0].id);

// Get unread count
const { count } = await notificationsService.getUnreadCount();
```

---

## Using Services in Components

### Basic Usage

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { loansService } from '../services';
import { handleApiError } from '../lib/api-client';
import { Loan } from '../types/api';

export const MyLoansScreen: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      setLoading(true);
      const response = await loansService.getMyLoans({ status: 'active' });
      setLoans(response.data.items);
      setError(null);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View>
      {loans.map((loan) => (
        <Text key={loan.id}>${loan.amount}</Text>
      ))}
    </View>
  );
};
```

### Using with Custom Hooks

```typescript
import { useState, useCallback } from 'react';
import { loansService } from '../services';
import { handleApiError } from '../lib/api-client';
import { CreateLoanRequest, Loan } from '../types/api';

export const useCreateLoan = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLoan = useCallback(async (loanData: CreateLoanRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await loansService.createLoan(loanData);
      return response.data;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createLoan, loading, error };
};
```

## Error Handling

All service methods can throw errors. Always wrap service calls in try-catch blocks:

```typescript
import { authService } from '../services';
import { handleApiError, isApiError } from '../lib/api-client';

try {
  await authService.signIn(credentials);
} catch (error) {
  if (isApiError(error)) {
    // Structured API error
    console.error('API Error:', error.message);
    if (error.errors) {
      // Validation errors
      Object.entries(error.errors).forEach(([field, messages]) => {
        console.error(`${field}: ${messages.join(', ')}`);
      });
    }
  } else {
    // Other errors (network, timeout, etc.)
    const message = handleApiError(error);
    console.error('Error:', message);
  }
}
```

## TypeScript Types

All service methods are fully typed. Import types from `../types/api`:

```typescript
import {
  Loan,
  CreateLoanRequest,
  LoanQueryParams,
  ApiResponse,
  PaginatedResponse,
} from '../types/api';

// Type-safe service call
const response: ApiResponse<PaginatedResponse<Loan>> = 
  await loansService.getMyLoans({ status: 'active' });

const loans: Loan[] = response.data.items;
```

## Testing Services

When testing components that use services, mock the service modules:

```typescript
import { loansService } from '../services';

jest.mock('../services', () => ({
  loansService: {
    getMyLoans: jest.fn(),
    createLoan: jest.fn(),
  },
}));

describe('MyLoansScreen', () => {
  it('should load loans', async () => {
    (loansService.getMyLoans as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        items: [{ id: '1', amount: 5000, status: 'active' }],
        meta: { currentPage: 1, totalPages: 1, totalItems: 1, itemsPerPage: 10 },
      },
    });

    // Test your component
  });
});
```

## Best Practices

1. **Always handle errors** - Wrap service calls in try-catch
2. **Use TypeScript types** - Import and use types from `../types/api`
3. **Don't call services directly in render** - Use `useEffect` or event handlers
4. **Create custom hooks** - Extract service logic into reusable hooks
5. **Show loading states** - Display loading indicators during API calls
6. **Validate before calling** - Validate form data before making API requests
7. **Handle pagination** - Use pagination parameters for large datasets

## Related Documentation

- [API Client Documentation](../lib/README.md)
- [API Types](../types/api.ts)
- [Contributing Guide](../docs/contributing.md)
