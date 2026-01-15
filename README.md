<img width="4554" height="1139" alt="TrustUp-Banner" src="https://github.com/user-attachments/assets/ee412e56-c481-49d6-879f-bde52f2b178a" />

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)


[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-green?style=flat-square)](https://opensource.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=flat-square&logo=react)](https://reactnative.dev/)

**Cross-platform mobile application for Buy Now Pay Later (BNPL) on Stellar Network**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

## 📖 About

TrustUp Mobile App is the frontend application for the TrustUp BNPL ecosystem on Stellar blockchain. Built with React Native and Expo, it provides a seamless mobile experience for users to access loans, manage repayments, and interact with the Stellar network.

### Key Features

- 🔐 **Wallet Integration** - Connect with Stellar wallets securely
- 💰 **Loan Management** - Apply for and manage BNPL loans
- 📊 **Reputation Dashboard** - View your on-chain credit score
- 🛍️ **Merchant Discovery** - Browse participating merchants
- 💳 **Payment Processing** - Easy loan repayments
- 🔔 **Push Notifications** - Stay updated on loan status
- 📱 **Cross-Platform** - iOS and Android support
- 🎨 **Modern UI** - Beautiful, responsive design with NativeWind

## 🛠 Tech Stack

**RN0.81 · TS5.9 · EXPO54 · RR19 · NW4 · RRN7 · RNA4**

### Core Technologies

| Category | Technology | Version |
|----------|-----------|---------|
| **Language** | TypeScript | 5.9 |
| **Framework** | React Native | 0.81.5 |
| **Platform** | Expo | 54.0 |
| **UI Library** | React | 19.1 |
| **Styling** | NativeWind (Tailwind) | latest |
| **Navigation** | React Navigation | 7.1 |
| **Animations** | Reanimated | 4.1 |

### Key Libraries

- 🎨 **NativeWind** - Tailwind CSS for React Native
- 🎭 **React Native Reanimated** - Smooth animations

## 📁 Project Structure
```
TrustUp-Frontend/
├── .expo/                      # Expo configuration cache
├── assets/                     # Static assets (images, fonts)
├── components/                 # Reusable UI components
│   ├── shared/                # Shared components across app
│   │   ├── BottomBar.tsx     # Bottom navigation bar
│   │   ├── Header.tsx        # App header component
│   │   ├── MainLayout.tsx    # Main app layout wrapper
├── pages/                      # Screen pages
│   ├── InvestScreen/          # Investment screen
│   │   ├── components/       # InvestScreen-specific components
│   │   └── InvestScreen.tsx  # Main invest screen
│   └── PayScreen/             # Payment screen
│       ├── components/       # PayScreen-specific components
│       └── PayScreen.tsx     # Main payment screen
├── types/                      # TypeScript type definitions
├── node_modules/              # Dependencies
├── .gitignore                 # Git ignore rules
├── App.tsx                    # App entry point
├── app.json                   # Expo app configuration
├── babel.config.js            # Babel configuration
├── cesconfig.json             # CES configuration
├── eslint.config.js           # ESLint configuration
├── .global.css                # Global CSS styles
├── metro.config.js            # Metro bundler configuration
├── nativewind-env.d.ts        # NativeWind TypeScript definitions
├── package-lock.json          # Locked dependencies
├── package.json               # Project dependencies and scripts
├── prettier.config.js         # Prettier configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18 LTS or higher
- npm or yarn
- iOS Simulator (Mac only) or Android Studio
- Expo Go app (for testing on physical devices)

### Installation
```bash
# Clone the repository
git clone https://github.com/TrustUp-app/TrustUp-Frontend.git
cd TrustUp-Frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your .env file (see Configuration section)
```


### Running the Application
```bash
# Start Expo development server
npm start

# Run on iOS Simulator
npm run ios

# Run on Android Emulator
npm run android

# Run in web browser
npm run web
```

### Development with Expo Go

1. Install Expo Go on your iOS or Android device
2. Run `npm start`
3. Scan the QR code with your camera (iOS) or Expo Go app (Android)

### Building for Production
```bash
# Create native projects
npm run prebuild

# Build for iOS (requires Mac)
eas build --platform ios

# Build for Android
eas build --platform android
```

## 🧪 Testing
```bash
# Run linter
npm run lint

# Fix linting issues and format code
npm run format

# Run unit tests (when configured)
npm test

# Run E2E tests (when configured)
npm run test:e2e
```

## 🎨 Design System

The app uses a custom design system built with NativeWind (Tailwind CSS):

- **Colors** - Brand colors and semantic tokens
- **Typography** - Font scales and weights
- **Spacing** - Consistent spacing system
- **Components** - Reusable UI components
- **Icons** - Expo Vector Icons integration

## 🔗 Backend Integration

This app connects to the [TrustUp API](https://github.com/TrustUp-app/TrustUp-API) backend:

- REST API endpoints for all operations
- JWT-based authentication
- Real-time updates via webhooks
- Stellar transaction signing

## 📱 Platform Support

- ✅ **iOS** - iOS 13.4+
- ✅ **Android** - Android 6.0+ (API 23+)
- ⚠️ **Web** - Basic support (optimized for mobile)

## 🔐 Security

- **Secure Storage** - Encrypted storage for sensitive data
- **Biometric Auth** - Face ID / Touch ID / Fingerprint support
- **Key Management** - Never stores private keys
- **API Security** - JWT token management
- **SSL Pinning** - Certificate pinning for API calls

## 🚀 Performance

- **Optimized Rendering** - React Native best practices
- **Lazy Loading** - Code splitting and dynamic imports
- **Image Optimization** - Optimized asset loading
- **Smooth Animations** - Reanimated for 60fps
- **Efficient State** - Minimal re-renders

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/contributing.md) for:

- Development setup
- Code style guidelines
- Component patterns
- Pull request process

## 🐛 Troubleshooting

### Common Issues

**Metro bundler issues:**
```bash
# Clear cache
npx expo start -c
```

**iOS build issues:**
```bash
# Clean iOS build
cd ios && pod install && cd ..
```

**Android build issues:**
```bash
# Clean Android build
cd android && ./gradlew clean && cd ..
```

## 📞 Support

- 📖 [Documentation](./docs/)
- 🐛 [Issue Tracker](https://github.com/TrustUp-app/TrustUp-Frontend/issues)
- 💬 [Discussions](https://github.com/TrustUp-app/TrustUp-Frontend/discussions)
- 🔗 [Backend API](https://github.com/TrustUp-app/TrustUp-API)

## 🙏 Acknowledgments

- [Stellar Development Foundation](https://www.stellar.org/) - For the blockchain platform
- [Expo](https://expo.dev/) - For the amazing development platform
- [React Native Community](https://reactnative.dev/) - For the mobile framework
- [NativeWind](https://www.nativewind.dev/) - For Tailwind CSS integration

---

**Built with ❤️ for the Stellar ecosystem**

[![Stellar](https://img.shields.io/badge/Powered%20by-Stellar-7D00FF?style=flat-square)](https://www.stellar.org/) [![Open Source](https://img.shields.io/badge/Open%20Source-Yes-green?style=flat-square)](https://opensource.org/)
