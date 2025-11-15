# Quick Setup Guide

## Step-by-Step Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Configuration

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Click "Add Project"
   - Follow the setup wizard

2. **Enable Authentication**
   - In Firebase Console, go to "Authentication"
   - Click "Get Started"
   - Enable "Email/Password" provider
   - Save

3. **Enable Firestore**
   - In Firebase Console, go to "Firestore Database"
   - Click "Create Database"
   - Choose "Start in test mode" (for development)
   - Select a location
   - Click "Enable"

4. **Get Firebase Config**
   - In Firebase Console, go to Project Settings (gear icon)
   - Scroll to "Your apps"
   - Click the web icon (`</>`)
   - Register app with a nickname
   - Copy the `firebaseConfig` object

5. **Update Config File**
   - Open `config/firebase.js`
   - Replace the placeholder values with your Firebase config

### 3. Firestore Security Rules

In Firebase Console → Firestore Database → Rules, paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /favorites/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

Click "Publish"

### 4. Run the App

```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## Testing the App

1. **Sign Up**: Create a new account
2. **Search City**: Type a city name (e.g., "London", "New York")
3. **View Weather**: See temperature, humidity, wind speed
4. **Add Favorite**: Tap "Add to Favorites"
5. **View Favorites**: Scroll to see saved cities
6. **Profile**: Check account info and sign out

## Common Issues

**"Firebase: Error (auth/invalid-api-key)"**
- Check your Firebase config in `config/firebase.js`

**"Permission denied" when adding favorites**
- Verify Firestore security rules are published

**City not found**
- Check spelling
- Try major cities first (London, Paris, Tokyo, etc.)

**App won't start**
- Run `npm install` again
- Clear cache: `expo start -c`

