import { WeatherResponse } from '../types/weather';

const API_KEY = '848822cdcc6e2289e2a910d334da2e50';
const BASE_URL = 'http://api.weatherstack.com/current';

export const fetchWeatherData = async (city: string = 'Indore,India'): Promise<WeatherResponse> => {
  try {
    const url = `${BASE_URL}?access_key=${API_KEY}&query=${encodeURIComponent(city)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: WeatherResponse = await response.json();
    
    // Check if API returned an error
    if ('error' in data) {
      throw new Error((data as any).error.info || 'API Error');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};
