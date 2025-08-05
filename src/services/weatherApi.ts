import axios from 'axios';
import { format } from 'date-fns';
import { WeatherData } from '../types';

const BASE_URL = 'https://archive-api.open-meteo.com/v1/archive';


export const fetchWeatherData = async (
  latitude: number,
  longitude: number,
  startDate: Date,
  endDate: Date
): Promise<WeatherData> => {
  try {
    const params = {
      latitude: latitude.toFixed(2),
      longitude: longitude.toFixed(2),
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      hourly: 'temperature_2m',
      timezone: 'auto',
    };

    const response = await axios.get(BASE_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error('Failed to fetch weather data');
  }
};

export const calculatePolygonCentroid = (coordinates: [number, number][]): [number, number] => {
  const sumLat = coordinates.reduce((sum, coord) => sum + coord[0], 0);
  const sumLng = coordinates.reduce((sum, coord) => sum + coord[1], 0);
  return [sumLat / coordinates.length, sumLng / coordinates.length];
};

export const getValueForTimestamp = (
  weatherData: WeatherData,
  targetTime: Date
): number | null => {
  const targetTimeString = format(targetTime, "yyyy-MM-dd'T'HH:00");
  console.log('--- getValueForTimestamp ---');
  console.log('Target (rounded) time:', targetTime);
  console.log('Formatted time string:', targetTimeString);
  console.log('Available API times:', weatherData.hourly.time);


  const timeIndex = weatherData.hourly.time.findIndex(time => time === targetTimeString);
  
  if (timeIndex === -1) {
    console.warn('❌ Time not found in weather data:', targetTimeString);
    return null;
  }
  
  const tempValue = weatherData.hourly.temperature_2m[timeIndex];
  console.log('✅ Matched temperature value:', tempValue);

  return tempValue;
};

export const getAverageValueForTimeRange = (
  weatherData: WeatherData,
  startTime: Date,
  endTime: Date
): number | null => {
  const values: number[] = [];
  
  weatherData.hourly.time.forEach((timeString, index) => {
    const time = new Date(timeString);
    if (time >= startTime && time <= endTime) {
      const value = weatherData.hourly.temperature_2m[index];
      if (value !== null && value !== undefined) {
        values.push(value);
      }
    }
  });
  
  if (values.length === 0) {
    return null;
  }
  
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};