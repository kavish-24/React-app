# WeatherNow - Mobile Weather Application

A comprehensive React Native mobile weather application built with Expo, featuring Firebase Authentication, Firestore integration, and real-time weather data from Open-Meteo API.

## Features

- 🔐 **Firebase Authentication** - Secure email/password authentication
- 🌤️ **Real-time Weather Data** - Live weather information from Open-Meteo API
- ⭐ **Favorite Cities** - Save and manage favorite locations using Firestore
- 🎨 **Modern UI/UX** - Clean and responsive design with React Native Paper
- 📱 **Cross-platform** - Works on both iOS and Android
- 🔄 **Pull to Refresh** - Refresh weather data with a simple pull gesture
- ⚡ **Loading States** - Smooth loading indicators and error handling
- 🧭 **Navigation** - Intuitive navigation with React Navigation

## Technologies Used

- **React Native (Expo)** - Cross-platform mobile development framework
- **Firebase Authentication** - User authentication and management
- **Firebase Firestore** - Cloud database for storing favorite cities
- **Open-Meteo API** - Free weather API for real-time weather data
- **Axios** - HTTP client for API requests
- **React Navigation** - Navigation library for React Native
- **React Native Paper** - Material Design component library

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Firebase account (for authentication and Firestore)
- iOS Simulator (for Mac) or Android Emulator / Physical device

## Installation

1. **Clone the repository**
   ```bash
   cd weather-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable Authentication (Email/Password method)
   - Enable Firestore Database
   - Get your Firebase configuration

4. **Configure Firebase**
   - Open `app.config.js`
   - Update the Firebase configuration in the `extra` section with your actual values:
     ```javascript
     extra: {
       firebaseApiKey: "YOUR_API_KEY",
       firebaseAuthDomain: "YOUR_AUTH_DOMAIN",
       firebaseProjectId: "YOUR_PROJECT_ID",
       firebaseStorageBucket: "YOUR_STORAGE_BUCKET",
       firebaseMessagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       firebaseAppId: "YOUR_APP_ID"
     }
     ```
   - Alternatively, you can use environment variables by setting them before running the app:
     ```bash
     export FIREBASE_API_KEY="your_key"
     export FIREBASE_AUTH_DOMAIN="your_domain"
     # ... etc
     ```
   - The default values in `app.config.js` are already set with your Firebase project credentials

5. **Set up Firestore Security Rules**
   - In Firebase Console, go to Firestore Database
   - Navigate to Rules tab
   - Add the following rules:
     ```javascript
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /favorites/{document=**} {
           allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
           allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
         }
       }
     }
     ```

## Running the Application

1. **Start the Expo development server**
   ```bash
   npm start
   ```

2. **Run on iOS**
   ```bash
   npm run ios
   ```
   Or press `i` in the Expo CLI

3. **Run on Android**
   ```bash
   npm run android
   ```
   Or press `a` in the Expo CLI

4. **Run on Web** (for testing)
   ```bash
   npm run web
   ```

## Project Structure

```
weather-app/
├── App.js                 # Main app component with navigation
├── config/
│   └── firebase.js       # Firebase configuration
├── screens/
│   ├── LoginScreen.js    # User login screen
│   ├── SignupScreen.js   # User registration screen
│   ├── DashboardScreen.js # Main weather dashboard
│   └── ProfileScreen.js  # User profile and settings
├── components/
│   ├── WeatherCard.js    # Weather display card component
│   └── LoadingIndicator.js # Loading indicator component
├── services/
│   ├── weatherApi.js     # Open-Meteo API integration
│   └── favoritesService.js # Firestore favorites service
├── theme.js              # App theme configuration
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## Usage

### Authentication
1. Launch the app
2. Create a new account using the Sign Up screen
3. Or sign in with existing credentials

### Viewing Weather
1. On the Dashboard, search for a city by name
2. View current weather information including:
   - Temperature
   - Weather conditions
   - Humidity
   - Wind speed
3. Pull down to refresh weather data

### Managing Favorites
1. After searching for a city, tap "Add to Favorites"
2. View all favorite cities in the Favorites section
3. Tap on a favorite city to view its weather
4. Remove favorites by tapping the "Remove" button

### Profile
1. Navigate to the Profile tab
2. View account information
3. Sign out from the app

## API Integration

### Open-Meteo API
The app uses the Open-Meteo API for weather data:
- **Base URL**: `https://api.open-meteo.com/v1`
- **Geocoding API**: `https://geocoding-api.open-meteo.com/v1/search`
- No API key required (free public API)

### Weather Data
The app fetches:
- Current temperature (°C)
- Relative humidity (%)
- Wind speed (km/h)
- Weather code (for conditions)

## Firebase Setup Details

### Authentication
1. In Firebase Console, go to Authentication
2. Click "Get Started"
3. Enable "Email/Password" sign-in method
4. (Optional) Enable "Google" sign-in for future enhancement

### Firestore Database
1. In Firebase Console, go to Firestore Database
2. Click "Create Database"
3. Start in test mode (for development)
4. Set up security rules as mentioned above
5. The app will create a `favorites` collection automatically

## Error Handling

The app includes comprehensive error handling for:
- Network connectivity issues
- Invalid city searches
- Firebase authentication errors
- API request failures
- Firestore operations

All errors are displayed to users via Snackbar notifications.

## Future Enhancements

Potential features to add:
- Google Sign-In integration
- Location-based weather (GPS)
- Weather forecasts (7-day forecast)
- Weather alerts and notifications
- Dark mode support
- Multiple units (Fahrenheit, Celsius)
- Weather history
- Share weather information

## Troubleshooting

### Firebase Connection Issues
- Verify your Firebase configuration in `config/firebase.js`
- Check that Authentication and Firestore are enabled
- Verify Firestore security rules

### API Issues
- Check internet connectivity
- Verify city name spelling
- Open-Meteo API is free and doesn't require authentication

### Build Issues
- Clear cache: `expo start -c`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

## License

This project is open source and available for educational purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue in the repository.

---

**Note**: Remember to replace Firebase configuration placeholders with your actual Firebase project credentials before running the app.

