import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getWeatherDescription, getWeatherIcon } from '../services/weatherApi';
import { theme } from '../theme';

function WeatherCard({ weatherData, city, onAddFavorite }) {
  if (!weatherData) return null;

  // Memoize weather icon and description
  const weatherIcon = useMemo(() => getWeatherIcon(weatherData.weatherCode), [weatherData.weatherCode]);
  const weatherDescription = useMemo(() => getWeatherDescription(weatherData.weatherCode), [weatherData.weatherCode]);

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.locationInfo}>
            <Text variant="headlineSmall" style={styles.cityName}>
              {weatherData.cityName || city?.name}
            </Text>
            {city?.country && (
              <Text variant="bodyMedium" style={styles.country}>
                {city.country}
              </Text>
            )}
          </View>
          <Text style={styles.weatherIcon}>{weatherIcon}</Text>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.temperatureContainer}>
          <Text variant="displayMedium" style={styles.temperature}>
            {Math.round(weatherData.temperature)}°
          </Text>
          <Text variant="titleMedium" style={styles.unit}>
            C
          </Text>
        </View>

        <Text variant="titleMedium" style={styles.description}>
          {weatherDescription}
        </Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons
              name="water-percent"
              size={24}
              color={theme.colors.primary}
            />
            <View style={styles.detailContent}>
              <Text variant="bodySmall" style={styles.detailLabel}>
                Humidity
              </Text>
              <Text variant="bodyLarge" style={styles.detailValue}>
                {weatherData.humidity}%
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <MaterialCommunityIcons
              name="weather-windy"
              size={24}
              color={theme.colors.primary}
            />
            <View style={styles.detailContent}>
              <Text variant="bodySmall" style={styles.detailLabel}>
                Wind Speed
              </Text>
              <Text variant="bodyLarge" style={styles.detailValue}>
                {weatherData.windSpeed} km/h
              </Text>
            </View>
          </View>
        </View>

        {onAddFavorite && (
          <Button
            mode="outlined"
            onPress={onAddFavorite}
            style={styles.favoriteButton}
            icon="heart-plus"
          >
            Add to Favorites
          </Button>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  locationInfo: {
    flex: 1,
  },
  cityName: {
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  country: {
    color: theme.colors.placeholder,
  },
  weatherIcon: {
    fontSize: 48,
  },
  divider: {
    marginVertical: 16,
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  temperature: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    lineHeight: 80,
  },
  unit: {
    color: theme.colors.primary,
    marginTop: 8,
    marginLeft: 4,
  },
  description: {
    color: theme.colors.text,
    marginBottom: 24,
    textTransform: 'capitalize',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailContent: {
    marginLeft: 12,
  },
  detailLabel: {
    color: theme.colors.placeholder,
    marginBottom: 4,
  },
  detailValue: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  favoriteButton: {
    marginTop: 8,
  },
});

// Memoize component to prevent unnecessary re-renders
export default memo(WeatherCard);

