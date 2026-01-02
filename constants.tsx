
import React from 'react';
import { Cloud, Sun, CloudRain, Zap, TrendingUp, BarChart3, BrainCircuit, FileText, Activity, Map as MapIcon, Bell, Settings as SettingsIcon, Info, LayoutDashboard } from 'lucide-react';
import { AppTab, ModelComparison, WeatherDataPoint } from './types';

export const NAV_ITEMS = [
  { id: AppTab.HOME, label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: AppTab.CURRENT, label: 'Current Weather', icon: <TrendingUp className="w-5 h-5" /> },
  { id: AppTab.FORECAST, label: 'Forecast', icon: <CloudRain className="w-5 h-5" /> },
  { id: AppTab.ANALYTICS, label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { id: AppTab.MAP, label: 'Map', icon: <MapIcon className="w-5 h-5" /> },
  { id: AppTab.ALERTS, label: 'Alerts', icon: <Bell className="w-5 h-5" /> },
  { id: AppTab.SETTINGS, label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
  { id: AppTab.ABOUT, label: 'About', icon: <Info className="w-5 h-5" /> },
];

export const MOCK_TIMESERIES: WeatherDataPoint[] = Array.from({ length: 24 }).map((_, i) => ({
  timestamp: `${i}:00`,
  temperature: 22 + Math.sin(i / 3) * 5 + Math.random() * 2,
  humidity: 60 + Math.cos(i / 4) * 15 + Math.random() * 5,
  pressure: 1012 + Math.random() * 2,
  windSpeed: 5 + Math.random() * 8,
  rainfall: Math.random() > 0.8 ? Math.random() * 10 : 0,
  condition: i > 18 || i < 6 ? 'Cloudy' : 'Sunny'
}));

export const MODEL_STATS: ModelComparison[] = [
  {
    name: 'Linear Regression (Baseline)',
    mae: 1.84,
    rmse: 2.12,
    accuracy: 68.5,
    inferenceTime: '0.2ms',
    description: 'Uses historical trends with seasonal weights. High explainability but misses non-linear complexities.'
  },
  {
    name: 'XGBoost (Random Forest Ensemble)',
    mae: 0.92,
    rmse: 1.15,
    accuracy: 89.2,
    inferenceTime: '4.5ms',
    description: 'Gradient boosted trees capturing feature correlations. Excellent at detecting condition transitions.'
  },
  {
    name: 'LSTM (Deep Learning)',
    mae: 0.65,
    rmse: 0.81,
    accuracy: 94.8,
    inferenceTime: '18.2ms',
    description: 'Recurrent Neural Network with 3 layers. Leverages long-term temporal dependencies in time-series data.'
  }
];

export const CONDITION_ICONS = {
  Sunny: <Sun className="text-yellow-500 w-10 h-10" />,
  Cloudy: <Cloud className="text-gray-400 w-10 h-10" />,
  Rainy: <CloudRain className="text-blue-400 w-10 h-10" />,
  Storm: <Zap className="text-purple-500 w-10 h-10" />,
};
