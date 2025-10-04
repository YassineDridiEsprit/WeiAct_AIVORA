import { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, MapPin, Thermometer, Eye, Gauge } from 'lucide-react';
import { farmAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface WeatherData {
  location: string;
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    visibility: number;
    pressure: number;
    icon: string;
  };
  forecast: Array<{
    date: string;
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    precipitation: number;
  }>;
}


interface Parcel {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
  boundary?: {
    coordinates: number[][][];
  };
}

export default function Weather() {
  const { user } = useAuth();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sample weather data (fallback when API is not available)
  const sampleWeatherData: WeatherData = {
    location: 'Farm Location',
    current: {
      temperature: 24,
      condition: 'Sunny',
      humidity: 65,
      windSpeed: 12,
      visibility: 10,
      pressure: 1013,
      icon: 'sun'
    },
    forecast: [
      { date: new Date().toISOString(), day: 'Today', high: 26, low: 18, condition: 'Sunny', icon: 'sun', humidity: 65, windSpeed: 12, precipitation: 0 },
      { date: new Date(Date.now() + 86400000).toISOString(), day: 'Tomorrow', high: 24, low: 16, condition: 'Partly Cloudy', icon: 'cloud', humidity: 70, windSpeed: 15, precipitation: 10 },
      { date: new Date(Date.now() + 2 * 86400000).toISOString(), day: 'Wednesday', high: 22, low: 14, condition: 'Rain', icon: 'rain', humidity: 85, windSpeed: 18, precipitation: 80 },
      { date: new Date(Date.now() + 3 * 86400000).toISOString(), day: 'Thursday', high: 25, low: 17, condition: 'Sunny', icon: 'sun', humidity: 60, windSpeed: 10, precipitation: 0 },
      { date: new Date(Date.now() + 4 * 86400000).toISOString(), day: 'Friday', high: 27, low: 19, condition: 'Sunny', icon: 'sun', humidity: 55, windSpeed: 8, precipitation: 0 },
    ]
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load only parcels for weather, we don't need operations calendar here
      const parcelsRes = await farmAPI.getParcels();
      
      setParcels(parcelsRes.data);
      
      // Set default parcel for weather
      if (parcelsRes.data.length > 0) {
        const defaultParcel = parcelsRes.data[0];
        setSelectedParcel(defaultParcel);
        await fetchWeatherData(defaultParcel);
      } else {
        // If no parcels, use sample data with generic location
        setWeatherData({
          ...sampleWeatherData,
          location: 'Default Location (Sample Data)'
        });
      }
    } catch (error) {
      console.error('Error loading parcels:', error);
      setError('Failed to load parcels. Using sample weather data.');
      setWeatherData({
        ...sampleWeatherData,
        location: 'Default Location (Sample Data)'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherData = async (parcel: Parcel) => {
    setWeatherLoading(true);
    try {
      const location = getParcelLocation(parcel);
      
      // OpenWeatherMap Free API with real API key
      const API_KEY = '498745ba899931fe15772e0aa83d2d97'; // Default active API key
      const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=${API_KEY}&units=metric`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lng}&appid=${API_KEY}&units=metric`;
      
      console.log('Fetching weather data for location:', location);
      console.log('Current weather URL:', currentWeatherUrl);
      
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(currentWeatherUrl),
        fetch(forecastUrl)
      ]);
      
      console.log('Current response status:', currentResponse.status);
      console.log('Forecast response status:', forecastResponse.status);
      
      if (!currentResponse.ok || !forecastResponse.ok) {
        const currentError = !currentResponse.ok ? `Current: ${currentResponse.status} ${currentResponse.statusText}` : '';
        const forecastError = !forecastResponse.ok ? `Forecast: ${forecastResponse.status} ${forecastResponse.statusText}` : '';
        const errorMsg = `Weather API error: ${currentError} ${forecastError}`.trim();
        
        // Try to get more detailed error info
        try {
          const errorData = await currentResponse.json();
          console.log('API error details:', errorData);
        } catch (e) {
          console.log('Could not parse error response');
        }
        
        throw new Error(errorMsg);
      }
      
      const currentData = await currentResponse.json();
      const forecastData = await forecastResponse.json();
      
      // Process current weather
      const current = {
        temperature: Math.round(currentData.main.temp),
        condition: currentData.weather[0].description.replace(/\b\w/g, (l: string) => l.toUpperCase()),
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
        visibility: Math.round(currentData.visibility / 1000), // Convert m to km
        pressure: currentData.main.pressure,
        icon: getOpenWeatherIcon(currentData.weather[0].main)
      };
      
      // Process 5-day forecast (taking one reading per day at 12:00)
      const forecast: Array<{
        date: string;
        day: string;
        high: number;
        low: number;
        condition: string;
        icon: string;
        humidity: number;
        windSpeed: number;
        precipitation: number;
      }> = [];
      const dailyForecasts = forecastData.list.filter((_: any, index: number) => {
        // Take every 8th item (24 hours / 3 hour intervals) starting from the closest to 12:00
        return index % 8 === 0 && forecast.length < 5;
      });
      
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      dailyForecasts.forEach((item: any, index: number) => {
        const date = new Date(item.dt * 1000);
        let dayName;
        
        if (index === 0) {
          dayName = 'Today';
        } else if (index === 1) {
          dayName = 'Tomorrow';
        } else {
          dayName = dayNames[date.getDay()];
        }
        
        // Get daily min/max from the 8 forecasts for this day
        const dayStart = index * 8;
        const dayEnd = Math.min(dayStart + 8, forecastData.list.length);
        const dayData = forecastData.list.slice(dayStart, dayEnd);
        
        const temps = dayData.map((d: any) => d.main.temp);
        const high = Math.round(Math.max(...temps));
        const low = Math.round(Math.min(...temps));
        
        forecast.push({
          date: date.toISOString(),
          day: dayName,
          high,
          low,
          condition: item.weather[0].description.replace(/\b\w/g, (l: string) => l.toUpperCase()),
          icon: getOpenWeatherIcon(item.weather[0].main),
          humidity: item.main.humidity,
          windSpeed: Math.round(item.wind.speed * 3.6),
          precipitation: item.pop ? Math.round(item.pop * 100) : 0 // Probability of precipitation
        });
      });
      
      const weatherData: WeatherData = {
        location: `${parcel.name} - ${currentData.name || 'Location'}, ${currentData.sys.country || ''}`,
        current,
        forecast
      };
      
      setWeatherData(weatherData);
      setError(null); // Clear any previous errors
      
    } catch (error) {
      console.error('Error fetching weather:', error);
      
      // Always fall back to sample data gracefully
      const weatherWithLocation = {
        ...sampleWeatherData,
        location: `${parcel.name} - Sample Weather Data`
      };
      setWeatherData(weatherWithLocation);
      
      // Show error message for API failures
      let errorMessage = 'Unable to fetch weather data. Using sample data.';
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = 'API Key authentication failed. Please verify your OpenWeatherMap account is activated and email is confirmed.';
        } else if (error.message.includes('API error')) {
          errorMessage = `Weather API issue: ${error.message}. Using sample data.`;
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Unable to connect to weather service. Using sample data.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setWeatherLoading(false);
    }
  };
  
  // Map OpenWeatherMap weather conditions to our icon system
  const getOpenWeatherIcon = (weatherMain: string): string => {
    const iconMap: { [key: string]: string } = {
      'Clear': 'sun',
      'Clouds': 'cloud', 
      'Rain': 'rain',
      'Drizzle': 'rain',
      'Thunderstorm': 'rain',
      'Snow': 'cloud',
      'Mist': 'cloud',
      'Fog': 'cloud',
      'Haze': 'cloud',
      'Dust': 'cloud',
      'Sand': 'cloud',
      'Ash': 'cloud',
      'Squall': 'cloud',
      'Tornado': 'cloud'
    };
    return iconMap[weatherMain] || 'sun';
  };

  const getParcelLocation = (parcel: Parcel) => {
    if (parcel.latitude && parcel.longitude) {
      // Ensure coordinates are numbers
      const lat = typeof parcel.latitude === 'string' ? parseFloat(parcel.latitude) : parcel.latitude;
      const lng = typeof parcel.longitude === 'string' ? parseFloat(parcel.longitude) : parcel.longitude;
      return { lat, lng };
    }
    
    if (parcel.boundary?.coordinates?.[0]?.[0]) {
      const coords = parcel.boundary.coordinates[0][0];
      const lat = typeof coords[1] === 'string' ? parseFloat(coords[1]) : coords[1];
      const lng = typeof coords[0] === 'string' ? parseFloat(coords[0]) : coords[0];
      return { lat, lng };
    }
    
    // Default coordinates (Tunis, Tunisia - appropriate for the project)
    return { lat: 36.8065, lng: 10.1815 };
  };

  const getWeatherIcon = (iconType: string) => {
    switch (iconType.toLowerCase()) {
      case 'sun':
      case 'sunny':
        return Sun;
      case 'rain':
      case 'rainy':
        return CloudRain;
      case 'cloud':
      case 'cloudy':
      case 'partly cloudy':
        return Cloud;
      default:
        return Sun;
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
          <div className="flex items-start space-x-2">
            <Sun className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{error}</p>
              {error.includes('authentication failed') && (
                <div className="text-sm mt-2 space-y-1">
                  <p>Common solutions:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Check if your OpenWeatherMap email is verified</li>
                    <li>Wait a few minutes for new API keys to activate</li>
                    <li>Ensure your account subscription is active</li>
                  </ul>
                </div>
              )}
              {error.includes('sample') && !error.includes('authentication') && !error.includes('API unavailable') && (
                <p className="text-sm mt-1">
                  API key is configured. This may be a temporary network issue.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Weather Forecast</h1>
          <p className="text-gray-600 mt-1">Real-time weather conditions for your farm locations</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Location:</span>
          </div>
          <select
            value={selectedParcel?.id || ''}
            onChange={(e) => {
              const parcelId = e.target.value;
              if (parcelId) {
                const parcel = parcels.find(p => p.id === parseInt(parcelId));
                if (parcel) {
                  setSelectedParcel(parcel);
                  fetchWeatherData(parcel);
                }
              }
            }}
            className="min-w-48 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            disabled={parcels.length === 0}
          >
            <option value="">{parcels.length === 0 ? 'No parcels available' : 'Select parcel for weather'}</option>
            {parcels.map(parcel => {
              const lat = typeof parcel.latitude === 'string' ? parseFloat(parcel.latitude) : parcel.latitude;
              const lng = typeof parcel.longitude === 'string' ? parseFloat(parcel.longitude) : parcel.longitude;
              const coordinates = (lat && lng && !isNaN(lat) && !isNaN(lng)) ? `(${lat.toFixed(3)}, ${lng.toFixed(3)})` : '';
              
              return (
                <option key={parcel.id} value={parcel.id}>
                  {parcel.name} {coordinates}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {weatherData && (
        <div className="bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
          {weatherLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="h-5 w-5 opacity-90" />
                <p className="text-lg opacity-90">{weatherData.location}</p>
              </div>
              <div className="text-6xl font-bold mb-4">{weatherData.current.temperature}°C</div>
              <p className="text-xl mb-6">{weatherData.current.condition}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Wind className="h-4 w-4" />
                    <span className="text-sm opacity-90">Wind</span>
                  </div>
                  <p className="font-semibold">{weatherData.current.windSpeed} km/h</p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Droplets className="h-4 w-4" />
                    <span className="text-sm opacity-90">Humidity</span>
                  </div>
                  <p className="font-semibold">{weatherData.current.humidity}%</p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm opacity-90">Visibility</span>
                  </div>
                  <p className="font-semibold">{weatherData.current.visibility} km</p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Gauge className="h-4 w-4" />
                    <span className="text-sm opacity-90">Pressure</span>
                  </div>
                  <p className="font-semibold">{weatherData.current.pressure} hPa</p>
                </div>
              </div>
            </div>
            {(() => {
              const IconComponent = getWeatherIcon(weatherData.current.icon);
              return <IconComponent className="h-32 w-32 opacity-90" />;
            })()}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 5-Day Forecast */}
        {weatherData && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">5-Day Forecast</h2>
            <div className="space-y-4">
              {weatherData.forecast.map((day, index) => {
                const IconComponent = getWeatherIcon(day.icon);
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-50 to-purple-50 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <IconComponent className="h-10 w-10 text-rose-600" />
                      <div>
                        <p className="font-medium text-gray-900">{day.day}</p>
                        <p className="text-sm text-gray-600">{day.condition}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{day.high}°/{day.low}°C</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>💧 {day.precipitation}%</span>
                        <span>🌬️ {day.windSpeed}km/h</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Weather Alerts */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Weather Alerts & Recommendations</h2>
          <div className="space-y-4">
            {/* Temperature alerts */}
            {weatherData?.current && weatherData.current.temperature > 30 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <Thermometer className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">High Temperature Alert</p>
                  <p className="text-sm text-red-700 mt-1">Temperature above 30°C. Increase irrigation and provide shade for sensitive crops.</p>
                </div>
              </div>
            )}
            
            {weatherData?.current && weatherData.current.temperature < 5 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                <Thermometer className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Low Temperature Alert</p>
                  <p className="text-sm text-blue-700 mt-1">Temperature below 5°C. Protect sensitive plants from frost damage.</p>
                </div>
              </div>
            )}
            
            {/* Rain alerts */}
            {weatherData?.forecast.some(day => day.precipitation > 70) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                <CloudRain className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Heavy Rain Expected</p>
                  <p className="text-sm text-blue-700 mt-1">Rain probability over 70%. Consider postponing irrigation and outdoor operations. Good time for indoor maintenance.</p>
                </div>
              </div>
            )}
            
            {/* Wind alerts */}
            {weatherData?.current && weatherData.current.windSpeed > 20 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start space-x-3">
                <Wind className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-900">High Winds Alert</p>
                  <p className="text-sm text-orange-700 mt-1">Wind speed {weatherData?.current?.windSpeed} km/h. Avoid pesticide spraying and be cautious with tall crops.</p>
                </div>
              </div>
            )}
            
            {/* Humidity alerts */}
            {weatherData?.current && weatherData.current.humidity > 85 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
                <Droplets className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">High Humidity Alert</p>
                  <p className="text-sm text-yellow-700 mt-1">Humidity {weatherData?.current?.humidity}%. Monitor for fungal diseases and ensure good air circulation.</p>
                </div>
              </div>
            )}
            
            {/* Optimal conditions */}
            {weatherData && weatherData.current &&
             weatherData.current.temperature >= 15 && weatherData.current.temperature <= 25 &&
             weatherData.current.windSpeed < 15 &&
             !weatherData.forecast.slice(0, 2).some(day => day.precipitation > 50) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                <Thermometer className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Optimal Conditions</p>
                  <p className="text-sm text-green-700 mt-1">Perfect weather for outdoor farming activities. Ideal for planting, harvesting, and field work.</p>
                </div>
              </div>
            )}
            
            {/* No alerts */}
            {weatherData && weatherData.current &&
             weatherData.current.temperature >= 5 && weatherData.current.temperature <= 30 &&
             weatherData.current.windSpeed < 20 &&
             weatherData.current.humidity < 85 &&
             !weatherData.forecast.some(day => day.precipitation > 70) && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start space-x-3">
                <Eye className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Normal Conditions</p>
                  <p className="text-sm text-gray-700 mt-1">Weather conditions are within normal range for agricultural activities.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      
      {/* Data Source Attribution */}
      <div className="bg-white rounded-xl shadow-sm p-4 border-t border-gray-100">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <Sun className="h-4 w-4" />
          <span>Weather data from</span>
          <a 
            href="https://openweathermap.org" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-rose-600 hover:text-rose-700 font-medium"
          >
            OpenWeatherMap
          </a>
          <span>• {error && error.includes('sample') ? 'Showing sample data' : 'Live weather data for precise agricultural planning'}</span>
        </div>
      </div>
    </div>
  );
}
