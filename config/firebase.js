// config/firebase.js
import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { 
  getFirestore,
  initializeFirestore,
  getFirestore as getFirestoreInstance
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyD1VXUU7vobOI4IUJeWR2P8QEHsR_8nMd0",
  authDomain: "bhayi-e04ef.firebaseapp.com",
  projectId: "bhayi-e04ef",
  storageBucket: "bhayi-e04ef.firebasestorage.app",
  messagingSenderId: "917185980343",
  appId: "1:917185980343:web:YOUR_WEB_APP_ID"
};

// Initialize Firebase - prevent duplicate initialization during hot reloads
let app;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
} catch (error) {
  app = getApp();
}

// Initialize Auth with AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    throw error;
  }
}

// Initialize Firestore with named database "default"
// For named databases, use getFirestore with the database name as second parameter
// Note: initializeFirestore doesn't support named databases, so we use getFirestore directly
let db;
try {
  // Try to initialize with long polling settings first (for default database)
  initializeFirestore(app, {
    experimentalForceLongPolling: true,
    experimentalAutoDetectLongPolling: true,
  });
} catch (error) {
  // Ignore if already initialized
}

// Get the named database "default"
// This will use the named database you created in Firebase Console
db = getFirestoreInstance(app, 'default');

export { auth, db };
export default app;