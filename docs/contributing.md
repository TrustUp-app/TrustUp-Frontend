# Contributing Guide

## Prerequisites

- Node.js 18 LTS or higher
- npm or yarn
- Git
- iOS Simulator (Mac only) or Android Studio
- Expo CLI
- Expo Go app (for physical device testing)

## Initial Setup

### 1. Clone the Repository
```bash
git clone https://github.com/TrustUp-app/TrustUp-Frontend.git
cd TrustUp-Frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set:

| Variable | Description | Default |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | TrustUp API base URL (no trailing slash) | `http://localhost:4000` |

> All `EXPO_PUBLIC_*` variables are embedded at build time by Expo. Restart the dev server after changes.

### 4. Backend API Setup

This frontend connects to the [TrustUp API](https://github.com/TrustUp-app/TrustUp-API) backend.

#### Option A: Use Production API (Recommended for Quick Start)

The default configuration points to the production API. No additional setup needed.

#### Option B: Run API Locally

1. Clone and setup the backend repository:
```bash
   git clone https://github.com/TrustUp-app/TrustUp-API.git
   cd TrustUp-API
   npm install
```

2. Follow the [TrustUp API Contributing Guide](https://github.com/TrustUp-app/TrustUp-API/blob/main/docs/contributing.md)

3. Start the API:
```bash
   npm run start:dev
```

4. Update your frontend `.env`:
```env
   EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### 5. Expo Configuration

Install Expo CLI globally (if not already installed):
```bash
npm install -g expo-cli
```

Login to Expo (optional, needed for building):
```bash
expo login
```

### 6. iOS Setup (Mac only)

#### Install Xcode

1. Download Xcode from the Mac App Store
2. Install Xcode Command Line Tools:
```bash
   xcode-select --install
```

#### Install iOS Simulator

1. Open Xcode
2. Go to Preferences → Components
3. Download your preferred iOS Simulator

#### Install CocoaPods
```bash
sudo gem install cocoapods
```

### 7. Android Setup

#### Install Android Studio

1. Download from [developer.android.com](https://developer.android.com/studio)
2. During installation, ensure these components are selected:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device

#### Configure Environment Variables

Add to your `~/.bashrc`, `~/.zshrc`, or equivalent:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### Create Android Virtual Device (AVD)

1. Open Android Studio
2. Go to Tools → AVD Manager
3. Click "Create Virtual Device"
4. Select a device (e.g., Pixel 5)
5. Download and select a system image (e.g., Android 13)
6. Click Finish

### 8. Run the Application

#### Start Development Server
```bash
npm start
```

This opens the Expo Developer Tools in your browser.

#### Run on iOS Simulator
```bash
npm run ios
```

Or press `i` in the Expo Developer Tools terminal.

#### Run on Android Emulator
```bash
npm run android
```

Or press `a` in the Expo Developer Tools terminal.

#### Run on Physical Device

1. Install **Expo Go** on your device:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Ensure your device and computer are on the same network

3. Run `npm start` and scan the QR code:
   - **iOS**: Use the Camera app
   - **Android**: Use the Expo Go app

#### Run in Web Browser
```bash
npm run web
```

## Development Workflow

### HTTP Layer

The app uses a pre-configured Axios client with automatic JWT handling.

**Files:**
- `src/lib/token-storage.ts` — reads/writes access + refresh tokens via `expo-secure-store`
- `src/lib/api-client.ts` — Axios instance with base URL from `EXPO_PUBLIC_API_URL`
  - **Request interceptor**: attaches `Authorization: Bearer <token>` header
  - **Response interceptor**: on 401, calls `POST /auth/refresh`, retries the original request, and queues any concurrent requests; on refresh failure it clears storage

**Service modules** (`src/services/`):

| File | Covers |
|---|---|
| `auth.service.ts` | `/auth/*`, `/users/me` |
| `loans.service.ts` | `/loans/*`, `/reputation/*` |
| `merchants.service.ts` | `/merchants/*` |
| `liquidity.service.ts` | `/liquidity/*` |
| `notifications.service.ts` | `/notifications/*` |
| `transactions.service.ts` | `/transactions/*` |

All service functions are fully typed — no `any`.

### Project Structure

- `App.tsx` - Application entry point
- `components/` - Reusable UI components
  - `shared/` - Shared components (Layout, Navigation, etc.)
- `pages/` - Screen components
  - `InvestScreen/` - Investment flow screens
  - `PayScreen/` - Payment flow screens
- `types/` - TypeScript type definitions
- `assets/` - Images, fonts, and static resources

### Creating New Components

1. Create component file in appropriate directory:
```typescript
   // components/shared/Button.tsx
   import React from 'react';
   import { TouchableOpacity, Text } from 'react-native';
   
   interface ButtonProps {
     title: string;
     onPress: () => void;
   }
   
   export const Button: React.FC<ButtonProps> = ({ title, onPress }) => {
     return (
       <TouchableOpacity 
         onPress={onPress}
         className="bg-blue-500 px-4 py-2 rounded"
       >
         <Text className="text-white font-bold">{title}</Text>
       </TouchableOpacity>
     );
   };
```

2. Export from index file if needed:
```typescript
   // components/shared/index.ts
   export * from './Button';
```

### Creating New Screens

1. Create screen directory and component:
```typescript
   // pages/ProfileScreen/ProfileScreen.tsx
   import React from 'react';
   import { View, Text } from 'react-native';
   
   export const ProfileScreen: React.FC = () => {
     return (
       <View className="flex-1 p-4">
         <Text className="text-2xl font-bold">Profile</Text>
       </View>
     );
   };
```

2. Add screen-specific components in subdirectory:
```
   pages/ProfileScreen/
   ├── ProfileScreen.tsx
   └── components/
       ├── ProfileHeader.tsx
       └── ProfileSettings.tsx
```

### Styling with NativeWind

Use Tailwind utility classes with the `className` prop:
```typescript
<View className="flex-1 bg-white p-4">
  <Text className="text-xl font-bold text-gray-900">
    Hello World
  </Text>
</View>
```

### Code Quality

#### Linting
```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run format
```

#### Type Checking
```bash
# TypeScript type checking
npx tsc --noEmit
```

### Testing
```bash
# Run unit tests (when configured)
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests (when configured)
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## Building for Production

### Prerequisites

Install EAS CLI:
```bash
npm install -g eas-cli
```

Login to Expo:
```bash
eas login
```

Configure EAS:
```bash
eas build:configure
```

### Build for iOS
```bash
# Development build
eas build --platform ios --profile development

# Production build
eas build --platform ios --profile production
```

**Note**: iOS production builds require an Apple Developer account ($99/year).

### Build for Android
```bash
# Development build
eas build --platform android --profile development

# Production build
eas build --platform android --profile production
```

### Generate Native Projects Locally
```bash
npm run prebuild
```

This creates `ios/` and `android/` directories for advanced customization.

## Standards and Conventions

### Component Naming

- Use PascalCase for component files: `UserProfile.tsx`
- Use descriptive names: `LoanApplicationForm.tsx` not `Form.tsx`
- Group related components in directories

### File Organization
```
components/
├── shared/           # Reusable across entire app
│   ├── Button.tsx
│   └── Input.tsx
└── LoanScreen/           # Domain-specific components
    └── LoanScreen.tsx
    ├── components.tsx
    └── LoanCard.tsx
```

### TypeScript

- Always define prop interfaces
- Avoid `any` types
- Use strict mode
- Export types for reusability
```typescript
// types/Loan.ts
export interface Loan {
  id: string;
  amount: number;
  status: 'pending' | 'active' | 'completed';
}

// components/LoanCard.tsx
import { Loan } from '@/types/Loan';

interface LoanCardProps {
  loan: Loan;
  onPress: (id: string) => void;
}

export const LoanCard: React.FC<LoanCardProps> = ({ loan, onPress }) => {
  // Component implementation
};
```

### Styling Conventions

- Use NativeWind (Tailwind) for styling
- Follow mobile-first approach
- Use consistent spacing scale (p-2, p-4, p-6, etc.)
- Define custom colors in `tailwind.config.js`

### State Management

- Use React hooks (`useState`, `useEffect`) for local state
- Consider Context API for shared state
- Implement custom hooks for reusable logic
```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Authentication logic
  
  return { user, loading, login, logout };
};
```

## Common Issues

### Metro Bundler Cache Issues
```bash
# Clear Metro bundler cache
npx expo start -c

# Or manually clear cache
rm -rf node_modules/.cache
```

### iOS Simulator Not Launching
```bash
# Reset iOS Simulator
xcrun simctl erase all

# Rebuild iOS project
cd ios
pod install
cd ..
npm run ios
```

### Android Emulator Issues
```bash
# List available AVDs
emulator -list-avds

# Start specific AVD
emulator -avd Pixel_5_API_33

# Cold boot
emulator -avd Pixel_5_API_33 -no-snapshot-load
```

### Environment Variables Not Loading

1. Restart the development server
2. Ensure variables start with `EXPO_PUBLIC_`
3. Check `.env` file is in root directory
4. Clear cache: `npx expo start -c`

### TypeScript Errors
```bash
# Regenerate TypeScript definitions
npx expo customize tsconfig.json

# Check for type errors
npx tsc --noEmit
```

### NativeWind Styles Not Applying

1. Verify `tailwind.config.js` is properly configured
2. Check `babel.config.js` includes NativeWind plugin
3. Restart Metro bundler with cache clear
4. Ensure `className` prop is used (not `style` for Tailwind)

### API Connection Issues

1. Verify `EXPO_PUBLIC_API_URL` in `.env`
2. Check backend is running (if using local API)
3. Ensure device/emulator can reach the API:
   - Use `http://10.0.2.2:4000` for Android Emulator
   - Use computer's IP for physical devices (e.g., `http://192.168.1.100:4000`)

## Pull Request Process

1. **Create a feature branch**:
```bash
   git checkout -b feature/my-feature
```

2. **Make your changes** following the conventions above

3. **Test your changes**:
```bash
   npm run lint
   npm test
```

4. **Commit with descriptive message**:
```bash
   git commit -m "feat: add loan application form"
```

5. **Push to your fork**:
```bash
   git push origin feature/my-feature
```

6. **Open a Pull Request** on GitHub with:
   - Clear description of changes
   - Screenshots/videos for UI changes
   - Reference to related issues

## Getting Help

- 📖 Check [documentation](./docs/)
- 🔗 [Backend API Docs](https://github.com/TrustUp-app/TrustUp-API)
- 📱 [Expo Documentation](https://docs.expo.dev/)
- ⚛️ [React Native Documentation](https://reactnative.dev/)

## Code of Conduct

Please be respectful and constructive in all interactions. We're building this together! 🚀
