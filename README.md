# Expo Router TV demo 👋

![Map Application Screenshot](./assets/tv_icons/icon-1920x720.png)

A React Native application built with Expo Router that provides an interactive map viewing experience optimized for TV platforms. The application features multiple map layers and is designed to work seamlessly with TV remote controls.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- Yarn (recommended) or npm
- Expo CLI (`npm install -g expo-cli`)
- Xcode (for iOS/Apple TV development)
- Android Studio (for Android/Android TV development)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd usmaps
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

### Running the App

#### For TV Development:
```bash
# For Apple TV
yarn prebuild:tv
yarn ios

# For Android TV
yarn prebuild:tv
yarn android

# For web development
yarn web
```

#### For Mobile Development:
```bash
# For iOS
yarn prebuild
yarn ios

# For Android
yarn prebuild
yarn android
```

#### Development Server
Start the development server with live reloading:
```bash
yarn start
```

## 🛠️ Project Configuration

### Environment Setup

1. **Expo Configuration**:
   - Update `app.json` for app metadata and configuration
   - Configure TV-specific settings in `app.json` under the `"tv"` key

2. **TypeScript Support**:
   - Type definitions are available in the `types` directory
   - Custom types can be added to `types/`

3. **Theming**:
   - Use `useColorScheme()` hook for dark/light mode support
   - Define colors in `constants/Colors.ts`
   - Text styles are defined in `constants/TextStyles.ts`

## 🌟 Features

- **TV-Optimized Navigation**: Full support for TV remote controls
- **Expo Router**: File-based routing for better code organization
- **Responsive Design**: Adapts to different screen sizes
- **Performance Optimized**: Built with React Native TV for smooth performance
- **Cross-Platform**: Works on iOS, Android, and web

## Deploy

Deploy on all platforms with Expo Application Services (EAS).

- Deploy the website: `npx eas-cli deploy` — [Learn more](https://docs.expo.dev/eas/hosting/get-started/)
- Deploy on iOS and Android using: `npx eas-cli build` — [Learn more](https://expo.dev/eas)

## TV specific file extensions

This project includes an [example Metro configuration](./metro.config.js) that allows Metro to resolve application source files with TV-specific code, indicated by specific file extensions (`*.ios.tv.tsx`, `*.android.tv.tsx`, `*.tv.tsx`).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/learn): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
