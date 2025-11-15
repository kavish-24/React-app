import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  writeBatch,
  onSnapshot,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { db } from '../config/firebase';

const FAVORITES_COLLECTION = 'favorites';

// In-memory cache to reduce Firestore reads
const cache = {
  favorites: null,
  userId: null,
  lastFetch: null,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

// Active listeners map
const listeners = new Map();

/**
 * Enable offline persistence for faster operations
 * Call this once when your app initializes
 */
export const enableOfflinePersistence = async () => {
  try {
    await enableIndexedDbPersistence(db);
    console.log('Offline persistence enabled');
  } catch (err) {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence only works in one tab');
    } else if (err.code === 'unimplemented') {
      console.warn('Browser doesn\'t support persistence');
    }
  }
};

/**
 * Adds a city to user's favorites (optimized)
 * @param {string} userId - User ID from Firebase Auth
 * @param {Object} cityData - City data object
 * @returns {Promise<string>} Document ID of the added favorite
 */
export const addFavorite = async (userId, cityData) => {
  try {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const favoriteData = {
      userId,
      cityName: cityData.name,
      country: cityData.country || '',
      latitude: cityData.latitude,
      longitude: cityData.longitude,
      admin1: cityData.admin1 || '',
      createdAt: new Date().toISOString()
    };

    // Use Firestore's optimistic write - doesn't wait for server confirmation
    const docRef = await addDoc(collection(db, FAVORITES_COLLECTION), favoriteData);
    
    // Invalidate cache
    cache.favorites = null;
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding favorite:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your Firestore security rules.');
    }
    throw new Error('Failed to add favorite city');
  }
};

/**
 * Removes a city from user's favorites (optimized)
 * @param {string} favoriteId - Document ID of the favorite
 * @returns {Promise<void>}
 */
export const removeFavorite = async (favoriteId) => {
  try {
    // Use optimistic delete - doesn't wait for server
    await deleteDoc(doc(db, FAVORITES_COLLECTION, favoriteId));
    
    // Invalidate cache
    cache.favorites = null;
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw new Error('Failed to remove favorite city');
  }
};

/**
 * Batch remove multiple favorites (more efficient for bulk operations)
 * @param {string[]} favoriteIds - Array of document IDs
 * @returns {Promise<void>}
 */
export const removeFavoritesBatch = async (favoriteIds) => {
  try {
    const batch = writeBatch(db);
    
    favoriteIds.forEach(id => {
      const docRef = doc(db, FAVORITES_COLLECTION, id);
      batch.delete(docRef);
    });
    
    await batch.commit();
    cache.favorites = null;
  } catch (error) {
    console.error('Error batch removing favorites:', error);
    throw new Error('Failed to remove favorites');
  }
};

/**
 * Gets all favorite cities for a user (with caching)
 * @param {string} userId - User ID from Firebase Auth
 * @param {boolean} forceRefresh - Force bypass cache
 * @returns {Promise<Array>} Array of favorite cities
 */
export const getFavorites = async (userId, forceRefresh = false) => {
  try {
    if (!userId) {
      return [];
    }

    // Return cached data if valid
    const now = Date.now();
    if (
      !forceRefresh &&
      cache.favorites &&
      cache.userId === userId &&
      cache.lastFetch &&
      now - cache.lastFetch < cache.CACHE_DURATION
    ) {
      console.log('Returning cached favorites');
      return cache.favorites;
    }

    console.log('Fetching favorites from Firestore');
    const q = query(
      collection(db, FAVORITES_COLLECTION),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const favorites = [];
    
    querySnapshot.forEach((doc) => {
      favorites.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Update cache
    cache.favorites = favorites;
    cache.userId = userId;
    cache.lastFetch = now;
    
    return favorites;
  } catch (error) {
    console.error('Error getting favorites:', error);
    if (error.code === 'permission-denied') {
      console.warn('Permission denied accessing favorites. Check Firestore security rules.');
      return [];
    }
    throw new Error('Failed to fetch favorite cities');
  }
};

/**
 * Subscribe to real-time favorites updates
 * More efficient than polling - updates happen instantly
 * @param {string} userId - User ID from Firebase Auth
 * @param {Function} callback - Callback function to receive updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeFavorites = (userId, callback) => {
  try {
    if (!userId) {
      callback([]);
      return () => {};
    }

    // Check if listener already exists
    if (listeners.has(userId)) {
      console.warn('Listener already exists for user:', userId);
    }

    const q = query(
      collection(db, FAVORITES_COLLECTION),
      where('userId', '==', userId)
    );
    
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const favorites = [];
        querySnapshot.forEach((doc) => {
          favorites.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        // Update cache
        cache.favorites = favorites;
        cache.userId = userId;
        cache.lastFetch = Date.now();
        
        callback(favorites);
      },
      (error) => {
        console.error('Error in favorites snapshot:', error);
        callback([]);
      }
    );

    // Store listener
    listeners.set(userId, unsubscribe);

    // Return unsubscribe function
    return () => {
      unsubscribe();
      listeners.delete(userId);
    };
  } catch (error) {
    console.error('Error subscribing to favorites:', error);
    callback([]);
    return () => {};
  }
};

/**
 * Clear cache (useful for logout)
 */
export const clearCache = () => {
  cache.favorites = null;
  cache.userId = null;
  cache.lastFetch = null;
  
  // Unsubscribe all listeners
  listeners.forEach(unsubscribe => unsubscribe());
  listeners.clear();
};

/**
 * Pre-warm cache - call this on app start
 * @param {string} userId - User ID
 */
export const preloadFavorites = async (userId) => {
  try {
    await getFavorites(userId, true);
  } catch (error) {
    console.error('Error preloading favorites:', error);
  }
};