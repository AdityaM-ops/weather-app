
import { RealTimeWeather, WeatherDataPoint } from "../types";

const mapWMOCode = (code: number): string => {
  if (code === 0) return 'Sunny';
  if (code <= 3) return 'Cloudy';
  if (code >= 95) return 'Storm';
  if (code >= 51) return 'Rainy';
  return 'Cloudy';
};

/**
 * Geocodes a search string into coordinates using Nominatim.
 */
export const geocodeLocation = async (query: string): Promise<{ lat: number, lon: number, label: string } | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'SkySync-AI-Weather-App'
        }
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (data.length === 0) return null;
    
    const first = data[0];
    return {
      lat: parseFloat(first.lat),
      lon: parseFloat(first.lon),
      label: first.display_name.split(',').slice(0, 2).join(',')
    };
  } catch (error) {
    console.error("Geocoding failed:", error);
    return null;
  }
};

/**
 * Fetches a human-readable location name using reverse geocoding.
 */
export const fetchLocationName = async (lat: number, lon: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'SkySync-AI-Weather-App'
        }
      }
    );
    if (!response.ok) return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
    
    const data = await response.json();
    const addr = data.address;
    const place = addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.state;
    const country = addr.country;
    
    if (place && country) return `${place}, ${country}`;
    if (place) return place;
    
    return data.display_name?.split(',').slice(0, 2).join(',') || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
  } catch (error) {
    console.warn("Reverse geocoding failed:", error);
    return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
  }
};

export const fetchLiveWeather = async (lat: number, lon: number, customLabel?: string): Promise<RealTimeWeather> => {
  // Requesting current and 24h hourly forecast
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,precipitation,weather_code&hourly=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,precipitation,weather_code&forecast_days=1&timezone=auto`;
  
  const [weatherResponse, locationLabel] = await Promise.all([
    fetch(weatherUrl),
    customLabel ? Promise.resolve(customLabel) : fetchLocationName(lat, lon)
  ]);

  if (!weatherResponse.ok) throw new Error("Failed to fetch live weather data");
  
  const data = await weatherResponse.json();
  const current = data.current;
  const hourly = data.hourly;
  
  // Zipping hourly data into our internal WeatherDataPoint format
  const hourlyForecast: WeatherDataPoint[] = hourly.time.map((time: string, i: number) => ({
    timestamp: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: hourly.temperature_2m[i],
    humidity: hourly.relative_humidity_2m[i],
    pressure: hourly.surface_pressure[i],
    windSpeed: hourly.wind_speed_10m[i],
    rainfall: hourly.precipitation[i],
    condition: mapWMOCode(hourly.weather_code[i])
  }));

  return {
    temperature: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    pressure: current.surface_pressure,
    windSpeed: current.wind_speed_10m,
    precipitation: current.precipitation,
    condition: mapWMOCode(current.weather_code),
    locationLabel: locationLabel,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    hourlyForecast: hourlyForecast
  };
};
