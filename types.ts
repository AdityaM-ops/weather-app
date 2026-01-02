
export interface WeatherDataPoint {
  timestamp: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  rainfall: number;
  condition: string;
}

export interface RealTimeWeather {
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  precipitation: number;
  condition: string;
  locationLabel: string;
  timestamp: string;
  hourlyForecast: WeatherDataPoint[];
}

export interface ModelComparison {
  name: string;
  mae: number;
  rmse: number;
  accuracy: number;
  inferenceTime: string;
  description: string;
}

export interface PredictionResult {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: string;
  confidence: number;
  reasoning: string;
}

export enum AppTab {
  HOME = 'Home',
  CURRENT = 'Current Weather',
  FORECAST = 'Forecast',
  ANALYTICS = 'Analytics',
  MAP = 'Map',
  ALERTS = 'Alerts',
  SETTINGS = 'Settings',
  ABOUT = 'About'
}
