import axios from 'axios';

const BASE_URL = 'https://api.open-meteo.com/v1';

/**
 * Fetches current weather data for a given location
 * @param {number} latitude - Latitude of the location
 * @param {number} longitude - Longitude of the location
 * @returns {Promise<Object>} Weather data object
 */
export const getCurrentWeather = async (latitude, longitude) => {
  try {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
        timezone: 'auto',
        forecast_days: 1
      }
    });

    const { current } = response.data;
    
    return {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      weatherCode: current.weather_code,
      time: current.time
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error('Failed to fetch weather data. Please try again.');
  }
};

/**
 * Gets weather description from weather code
 * @param {number} code - Weather code from API
 * @returns {string} Weather description
 */
export const getWeatherDescription = (code) => {
  const weatherCodes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  
  return weatherCodes[code] || 'Unknown';
};

/**
 * Gets weather icon emoji from weather code
 * @param {number} code - Weather code from API
 * @returns {string} Weather icon emoji
 */
export const getWeatherIcon = (code) => {
  if (code === 0 || code === 1) return '☀️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code >= 45 && code <= 48) return '🌫️';
  if (code >= 51 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 86) return '🌦️';
  if (code >= 95 && code <= 99) return '⛈️';
  return '🌤️';
};

/**
 * Searches for city coordinates using OpenStreetMap Nominatim API
 * @param {string} cityName - Name of the city
 * @returns {Promise<Object>} City coordinates and details
 */
export const searchCity = async (cityName) => {
  if (!cityName || cityName.trim().length === 0) {
    throw new Error('Please enter a city name');
  }

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: cityName.trim(),
        format: 'json',
        limit: 1,
        addressdetails: 1,
      },
      headers: {
        // Required by OSM usage policy
        'User-Agent': 'WeatherNowApp/1.0 (contact@weathernow.app)',
      },
      timeout: 10000, // 10 second timeout
    });

    if (response.data && response.data.length > 0) {
      const location = response.data[0];
      
      // Validate coordinates
      if (!location.lat || !location.lon) {
        throw new Error('Invalid location data received');
      }

      const address = location.address || {};
      
      // Extract city name (prefer city, town, or village)
      const extractedCityName = address.city || address.town || address.village || address.municipality || location.display_name.split(',')[0];
      
      // Extract country
      const country = address.country || '';
      
      // Extract state/region (admin1)
      const admin1 = address.state || address.region || '';
      
      return {
        name: extractedCityName.trim(),
        country: country.trim(),
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lon),
        admin1: admin1.trim(),
      };
    }
    
    throw new Error('City not found');
  } catch (error) {
    console.error('Error searching city:', error);
    
    // Handle specific error cases
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error('Request timed out. Please check your internet connection and try again.');
    }
    
    if (error.response) {
      // HTTP error response
      if (error.response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      if (error.response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    
    if (error.message === 'City not found' || error.message === 'Please enter a city name') {
      throw error;
    }
    
    if (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw new Error('City not found. Please check the spelling and try again.');
  }
};

