import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../config/firebase';
import { getCurrentWeather, searchCity } from '../services/weatherApi';
import { 
  subscribeFavorites, 
  addFavorite, 
  removeFavorite,
  clearCache 
} from '../services/favoritesService';
import { theme } from '../theme';
import WeatherCard from '../components/WeatherCard';
import LoadingIndicator from '../components/LoadingIndicator';

export default function DashboardScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCity, setCurrentCity] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  const hasInitialized = useRef(false);
  const unsubscribeRef = useRef(null);

  // Stable fetchWeather
  const fetchWeather = useCallback(async (latitude, longitude, cityName) => {
    setLoading(true);
    try {
      const data = await getCurrentWeather(latitude, longitude);
      setWeatherData({ ...data, cityName });
      return true;
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data');
      setSnackbarVisible(true);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Stable getCurrentLocation
  const getCurrentLocation = useCallback(async () => {
    try {
      const defaultCity = { name: 'London', latitude: 51.5074, longitude: -0.1278 };
      setCurrentLocation(defaultCity);
      await fetchWeather(defaultCity.latitude, defaultCity.longitude, defaultCity.name);
    } catch (err) {
      console.error('Error getting location:', err);
    }
  }, [fetchWeather]);

  // Setup real-time favorites subscription
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    
    if (!userId) {
      setFavorites([]);
      return;
    }

    // Subscribe to real-time updates
    console.log('Setting up favorites subscription');
    const unsubscribe = subscribeFavorites(userId, (updatedFavorites) => {
      console.log('Received favorites update:', updatedFavorites.length);
      setFavorites(updatedFavorites);
    });

    unsubscribeRef.current = unsubscribe;

    // Cleanup on unmount
    return () => {
     
    };
  }, []); // Only run once - subscription handles all updates

  // Initialize weather on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      getCurrentLocation();
    }
  }, [getCurrentLocation]);

  // Handle search
  const handleSearch = useCallback(async () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      setError('Please enter a city name');
      setSnackbarVisible(true);
      return;
    }

    setSearching(true);
    setError('');

    try {
      const city = await searchCity(trimmedQuery);
      setCurrentCity(city);
      const success = await fetchWeather(city.latitude, city.longitude, city.name);
      if (success) {
        setSearchQuery('');
      }
    } catch (err) {
      setError(err.message || 'Failed to search city');
      setSnackbarVisible(true);
    } finally {
      setSearching(false);
    }
  }, [searchQuery, fetchWeather]);

  // Refresh weather only (favorites update automatically)
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    
    try {
      if (currentCity) {
        await fetchWeather(currentCity.latitude, currentCity.longitude, currentCity.name);
      } else if (currentLocation) {
        await fetchWeather(currentLocation.latitude, currentLocation.longitude, currentLocation.name);
      }
      // No need to reload favorites - subscription handles it!
    } catch (err) {
      console.error('Error refreshing:', err);
    } finally {
      setRefreshing(false);
    }
  }, [currentCity, currentLocation, fetchWeather]);

  // Optimized add favorite - UI updates via subscription
  const handleAddFavorite = useCallback(async () => {
    if (!currentCity && !weatherData) {
      setError('No city selected');
      setSnackbarVisible(true);
      return;
    }

    const city = currentCity || currentLocation;
    if (!city) return;

    const userId = auth.currentUser?.uid;
    if (!userId) {
      setError('Please sign in to add favorites');
      setSnackbarVisible(true);
      return;
    }

    // Check for duplicates
    const alreadyFavorite = favorites.some(
      fav => fav.cityName.toLowerCase() === city.name.toLowerCase()
    );
    if (alreadyFavorite) {
      setError('City is already in favorites');
      setSnackbarVisible(true);
      return;
    }

    // Show immediate feedback
    setError('Adding to favorites...');
    setSnackbarVisible(true);

    try {
      // Fire and forget - subscription will update UI
      await addFavorite(userId, city);
      setError('Added to favorites');
      setSnackbarVisible(true);
    } catch (err) {
      setError(err.message || 'Failed to add favorite');
      setSnackbarVisible(true);
    }
  }, [currentCity, currentLocation, weatherData, favorites]);

  // Optimized remove favorite - UI updates via subscription
  const handleRemoveFavorite = useCallback(async (favoriteId) => {
    // Show immediate feedback
    setError('Removing from favorites...');
    setSnackbarVisible(true);

    try {
      // Fire and forget - subscription will update UI
      await removeFavorite(favoriteId);
      setError('Removed from favorites');
      setSnackbarVisible(true);
    } catch (err) {
      setError(err.message || 'Failed to remove favorite');
      setSnackbarVisible(true);
    }
  }, []);

  const handleFavoritePress = useCallback(
    async (favorite) => {
      const city = {
        name: favorite.cityName,
        latitude: favorite.latitude,
        longitude: favorite.longitude,
        country: favorite.country,
      };
      setCurrentCity(city);
      await fetchWeather(favorite.latitude, favorite.longitude, favorite.cityName);
    },
    [fetchWeather]
  );

  // Memoize sorted favorites
  const sortedFavorites = useMemo(
    () => [...favorites].sort((a, b) => a.cityName.localeCompare(b.cityName)),
    [favorites]
  );

  const refreshControl = useMemo(
    () => <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />,
    [refreshing, handleRefresh]
  );

  const displayCity = useMemo(
    () => currentCity || currentLocation,
    [currentCity, currentLocation]
  );

  const emptyStateVisible = !weatherData && !loading;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={refreshControl}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            WeatherNow
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            label="Search City"
            value={searchQuery}
            onChangeText={setSearchQuery}
            mode="outlined"
            style={styles.searchInput}
            right={
              <TextInput.Icon
                icon="magnify"
                onPress={handleSearch}
                disabled={searching}
              />
            }
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="words"
            autoCorrect={false}
          />
          {searching && (
            <ActivityIndicator style={styles.searchLoader} size="small" />
          )}
        </View>

        {loading && !weatherData && <LoadingIndicator />}

        {weatherData && (
          <WeatherCard
            weatherData={weatherData}
            city={displayCity}
            onAddFavorite={handleAddFavorite}
          />
        )}

        {sortedFavorites.length > 0 && (
          <View style={styles.favoritesSection}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Favorite Cities ({sortedFavorites.length})
            </Text>
            {sortedFavorites.map((favorite) => (
              <Card
                key={favorite.id}
                style={styles.favoriteCard}
                onPress={() => handleFavoritePress(favorite)}
                mode="outlined"
              >
                <Card.Content style={styles.favoriteContent}>
                  <View style={styles.favoriteInfo}>
                    <Text variant="titleMedium">{favorite.cityName}</Text>
                    <Text variant="bodySmall" style={styles.favoriteCountry}>
                      {favorite.country}
                    </Text>
                  </View>
                  <Button
                    icon="delete"
                    mode="text"
                    onPress={() => handleRemoveFavorite(favorite.id)}
                    compact
                  >
                    Remove
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        {emptyStateVisible && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="weather-cloudy"
              size={64}
              color={theme.colors.placeholder}
            />
            <Text variant="titleMedium" style={styles.emptyText}>
              Search for a city to see weather information
            </Text>
          </View>
        )}
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {error}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  title: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: theme.colors.surface,
  },
  searchLoader: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  favoritesSection: {
    marginTop: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  favoriteCard: {
    marginBottom: 12,
  },
  favoriteContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteCountry: {
    color: theme.colors.placeholder,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    color: theme.colors.placeholder,
    textAlign: 'center',
  },
});