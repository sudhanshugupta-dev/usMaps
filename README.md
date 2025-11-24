# US Maps - TV-Optimized Map Viewer

![Map Application Screenshot](./assets/tv_icons/icon-1920x720.png)

A React Native / Expo app for TV-first mapping and analytics. Core areas:
- **Maps (`app/maps`)**: Esri REST + OSM base maps, layer toggles, and TV remote navigation.
- **RNMaps (`app/rnmaps`)**: React Native Maps playground with fullscreen controls and focus-safe UI.
- **Analytics (`app/analytics`)**: Real-time trading dashboards and sample weather analytics with focusable cards.

Paste Loom walkthrough links directly in the **Loom demos** section so teammates can jump to the right feature set.

This application combines the power of Esri REST API and OpenStreetMap to deliver a rich mapping experience on TV platforms. It's specifically designed for TV remote navigation, with all interactive elements fully accessible via D-pad controls.

## 🌍 Map Data Sources

### Esri REST API Integration
- **Data Layers**: Access various US map layers through Esri's REST API
- **Dynamic Updates**: Real-time data fetching and rendering
- **Custom Styling**: Thematic mapping with customizable styles
- **Layer Management**: Toggle and combine multiple data layers

### OpenStreetMap (OSM) Integration
- **Base Maps**: High-quality OSM tiles for base mapping
- **Open Source**: Free and open mapping data
- **Global Coverage**: Comprehensive worldwide map coverage
- **Custom Tiles**: Support for custom OSM tile servers

## 🎮 D-Pad Navigation

### Remote Control Support
- **Full D-Pad Navigation**: All UI elements are navigable using TV remote D-pad
- **Focus Management**: Visual feedback for focused elements
- **Intuitive Controls**:
  - **Up/Down/Left/Right**: Navigate between interactive elements
  - **Select**: Activate the focused element
  - **Back**: Return to previous screen or close modals
  - **Menu**: Access additional options

### Implementation Details
- Custom `useTVFocus` hook for managing focus states
- Smooth animations for focus transitions
- Haptic feedback (where supported)
- Optimized for both Apple TV and Android TV remotes

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

## 📁 Feature Areas

### Maps (`app/maps`)
- Esri REST API layer config in `app/maps/layersConfig.ts`
- OSM tiles as base map with optional custom tile servers
- Layer toggles, dynamic updates, and thematic styling for political, environmental, and demographic data

### RNMaps (`app/rnmaps`)
- React Native Maps-backed experience with fullscreen mode and keep-awake support
- Focus-friendly components for TV remotes; theme-aware layout in `app/rnmaps/_layout.tsx`
- Context-driven fullscreen state management in `app/rnmaps/context`

### Analytics (`app/analytics`)
- Landing grid of focusable cards to launch real-time dashboards (trades, line/bar/scatter/gauge/Gantt)
- Weather and general analytics sample screens; screens live in `app/analytics/screens`
- Reusable focusable UI components in `app/analytics/components`
- Service layer for live data hooks in `app/analytics/services`

## 🗺️ Map Configuration

### Esri REST API Setup
1. **API Endpoints**: Configured in `app/maps/layersConfig.ts`
2. **Layer Types**:
   - Feature Layers
   - Map Image Layers
   - Vector Tile Layers
3. **Authentication**: Add your Esri API key in `.env`

### OSM Integration
- Base map tiles from OpenStreetMap
- Custom tile server configuration available
- Supports standard OSM tile format

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

## 🌟 Key Features

## 🌐 Map Visualization Types

### 1. Base Maps
- **Street / Physical / Terrain**
  - Detailed road networks and physical features
  - Terrain visualization with elevation data
  - High-resolution satellite imagery

### 2. Political & Administrative Boundaries
- **State Boundaries**
  - Clear delineation of US states
  - Interactive state selection
  - Custom styling for different zoom levels

- **County-Level Maps**
  - Detailed county boundaries
  - Population and demographic data integration
  - Custom styling based on statistical data

### 3. Thematic Maps
- **Choropleth Maps**
  - Color-coded by statistical data
  - Visual representation of population density
  - Custom color ramps and classification methods

- **Heatmaps**
  - Density visualization of point data
  - Dynamic intensity scaling
  - Customizable color gradients

### 4. Specialized Visualizations
- **Cluster Maps**
  - Grouped markers for high-density areas
  - Dynamic clustering at different zoom levels
  - Interactive cluster exploration

- **Region & Custom Boundaries**
  - Custom geographic regions
  - User-defined boundary visualization
  - Multi-level administrative regions

### 5. Environmental & Infrastructure
- **Hydrology & Water Resources**
  - River networks and water bodies
  - Watershed boundaries
  - Water quality monitoring points

- **Utilities & Infrastructure**
  - Power grid visualization
  - Transportation networks
  - Communication infrastructure

### 6. Natural Hazards & Weather
- **Weather Radar**
  - Real-time weather data
  - Storm tracking
  - Precipitation visualization

- **Natural Hazards**
  - Flood zones
  - Wildfire risk areas
  - Seismic activity mapping

### 7. Demographics
- **Population Density**
  - Population distribution visualization
  - Age and gender demographics
  - Population growth trends

### TV-Optimized Experience
- **Full D-Pad Navigation**: Complete remote control support
- **Focus Management**: Clear visual feedback for navigation
- **Performance**: Optimized for TV hardware
- **Responsive UI**: Adapts to different screen sizes and aspect ratios

### Developer Friendly
- **Expo Router**: File-based routing
- **TypeScript Support**: Type-safe codebase
- **Modular Architecture**: Easy to extend and maintain
- **Cross-Platform**: Works on iOS, Android, and web

## 🎥 Loom demos (paste links here)
- US Maps overview: `your-loom-link-for-maps`
 link: https://www.loom.com/share/f21cbcfd52ea4faeb58b2de6ac4735f8
- RNMaps walkthrough: `your-loom-link-for-rnmaps`
  link: https://www.loom.com/share/d2a5b0d26650429bb9fa74a4c4b4db90
- Analytics dashboards: `your-loom-link-for-analytics`
  link : https://www.loom.com/share/98b68402e53b40ad8b78b1ca702d780f

## 🚀 Deployment

### Building for TV Platforms

#### Apple TV
```bash
yarn prebuild:tv
expo run:ios --device "Apple TV" --configuration Release
```

#### Android TV
```bash
yarn prebuild:tv
expo run:android --variant release
```

### Web Deployment
```bash
npx expo export -p web
# Deploy the generated web-build directory
```

### App Store Submission
- **Apple TV**: Submit through App Store Connect
- **Google Play**: Upload to Google Play Console as a TV app

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
