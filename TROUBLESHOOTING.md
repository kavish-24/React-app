# Troubleshooting Guide

## Common Issues and Solutions

### Firestore WebChannelConnection Warnings

**Symptom:** You see repeated warnings like:
```
@firebase/firestore: Firestore (10.14.1): WebChannelConnection RPC 'Listen' stream transport errored
```

**Explanation:**
These warnings are **normal and harmless** in React Native/Expo development environments. They occur because:
- Firestore uses WebChannel for real-time connections
- React Native/Expo environments can have connection issues with the WebChannel transport layer
- These are development warnings and don't affect app functionality

**Solution:**
- These warnings can be safely ignored
- They don't prevent Firestore operations from working
- If you see actual errors (not warnings) about permission denied, check your Firestore security rules

**Note:** In production builds, these warnings are typically less frequent or don't appear.

---

### "City not found" Errors

**Symptom:** When searching for a city, you get "City not found" errors.

**Possible Causes:**
1. **Rate Limiting:** OpenStreetMap Nominatim API has rate limits (1 request per second)
2. **Invalid City Name:** City name might be misspelled or not exist
3. **Network Issues:** Internet connection problems

**Solutions:**
1. **Wait between searches:** Don't search too quickly (wait at least 1 second between searches)
2. **Check spelling:** Ensure city names are spelled correctly
3. **Try major cities first:** Test with well-known cities like "London", "New York", "Paris", "Tokyo"
4. **Check internet connection:** Ensure you have a stable internet connection

**Example valid searches:**
- "London"
- "New York"
- "Paris, France"
- "Tokyo, Japan"

---

### Firestore Permission Denied Errors

**Symptom:** You see errors like "Permission denied" when trying to add or view favorites.

**Cause:** Firestore security rules are not properly configured.

**Solution:**
1. Go to Firebase Console → Firestore Database → Rules
2. Make sure you have the following rules:

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

3. Click "Publish" to save the rules

---

### Authentication Not Persisting

**Symptom:** Users are logged out every time they close the app.

**Solution:**
- Make sure `@react-native-async-storage/async-storage` is installed
- Verify Firebase Auth is configured with AsyncStorage persistence (already set up in `config/firebase.js`)

---

### Network Timeout Errors

**Symptom:** Weather data or city search times out.

**Solutions:**
1. Check your internet connection
2. Wait a moment and try again
3. For OSM API: Don't make requests too frequently (rate limit: 1 per second)

---

### App Won't Start

**Solutions:**
1. Clear cache: `expo start -c`
2. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```
3. Check Node.js version (should be v14 or higher)
4. Restart Expo development server

---

### Firebase Configuration Errors

**Symptom:** "Firebase: Error (auth/invalid-api-key)" or similar errors.

**Solution:**
1. Verify your Firebase config in `config/firebase.js`
2. Make sure all fields are filled correctly:
   - apiKey
   - authDomain
   - projectId
   - storageBucket
   - messagingSenderId
   - appId (optional for basic functionality)

---

## Still Having Issues?

If you continue to experience problems:

1. Check the console logs for specific error messages
2. Verify all dependencies are installed: `npm install`
3. Ensure Firebase services are enabled in Firebase Console:
   - Authentication (Email/Password)
   - Firestore Database
4. Check that Firestore security rules are published
5. Try restarting the Expo development server

---

## Development vs Production

Many warnings and issues you see in development are normal:
- Firestore WebChannel warnings are expected in development
- Some network errors are more common in development
- Performance may be slower in development mode

These typically don't occur or are less frequent in production builds.

