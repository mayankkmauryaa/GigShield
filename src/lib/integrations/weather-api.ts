import { WeatherData } from '../types';

const MOCK_WEATHER_DATA: { [key: string]: WeatherData } = {
  'Mumbai': {
    city: 'Mumbai',
    temperature: 32,
    humidity: 85,
    rainfall: 45,
    aqi: 120,
    condition: 'Cloudy',
    timestamp: new Date().toISOString(),
  },
  'Delhi': {
    city: 'Delhi',
    temperature: 44,
    humidity: 25,
    rainfall: 0,
    aqi: 320,
    condition: 'Haze',
    timestamp: new Date().toISOString(),
  },
  'Bangalore': {
    city: 'Bangalore',
    temperature: 28,
    humidity: 65,
    rainfall: 15,
    aqi: 95,
    condition: 'Partly Cloudy',
    timestamp: new Date().toISOString(),
  },
  'Chennai': {
    city: 'Chennai',
    temperature: 35,
    humidity: 75,
    rainfall: 20,
    aqi: 110,
    condition: 'Humid',
    timestamp: new Date().toISOString(),
  },
  'Hyderabad': {
    city: 'Hyderabad',
    temperature: 38,
    humidity: 45,
    rainfall: 5,
    aqi: 145,
    condition: 'Clear',
    timestamp: new Date().toISOString(),
  },
  'Kolkata': {
    city: 'Kolkata',
    temperature: 36,
    humidity: 80,
    rainfall: 35,
    aqi: 180,
    condition: 'Rainy',
    timestamp: new Date().toISOString(),
  },
  'Pune': {
    city: 'Pune',
    temperature: 34,
    humidity: 70,
    rainfall: 25,
    aqi: 100,
    condition: 'Cloudy',
    timestamp: new Date().toISOString(),
  },
  'Ahmedabad': {
    city: 'Ahmedabad',
    temperature: 42,
    humidity: 30,
    rainfall: 0,
    aqi: 220,
    condition: 'Hot',
    timestamp: new Date().toISOString(),
  },
  'Jaipur': {
    city: 'Jaipur',
    temperature: 40,
    humidity: 35,
    rainfall: 5,
    aqi: 195,
    condition: 'Hazy',
    timestamp: new Date().toISOString(),
  },
  'Lucknow': {
    city: 'Lucknow',
    temperature: 38,
    humidity: 55,
    rainfall: 10,
    aqi: 165,
    condition: 'Smog',
    timestamp: new Date().toISOString(),
  },
};

export async function fetchWeatherData(city: string): Promise<WeatherData> {
  const baseData = MOCK_WEATHER_DATA[city] || {
    city,
    temperature: 30,
    humidity: 60,
    rainfall: 10,
    aqi: 100,
    condition: 'Clear',
    timestamp: new Date().toISOString(),
  };

  return {
    ...baseData,
    temperature: baseData.temperature + (Math.random() - 0.5) * 3,
    humidity: Math.max(20, Math.min(100, baseData.humidity + (Math.random() - 0.5) * 10)),
    rainfall: Math.max(0, baseData.rainfall + (Math.random() - 0.5) * 10),
    aqi: Math.max(50, baseData.aqi + Math.floor((Math.random() - 0.5) * 20)),
    timestamp: new Date().toISOString(),
  };
}

export async function fetchWeatherForecast(
  city: string,
  days: number = 5
): Promise<WeatherData[]> {
  const forecasts: WeatherData[] = [];
  const baseData = await fetchWeatherData(city);

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    forecasts.push({
      ...baseData,
      city,
      temperature: baseData.temperature + (Math.random() - 0.5) * 5 * (i + 1) * 0.2,
      rainfall: Math.max(0, baseData.rainfall + Math.random() * 10 * i * 0.3),
      aqi: Math.max(50, baseData.aqi + Math.floor(Math.random() * 30 * i * 0.2)),
      condition: getConditionFromWeather(baseData.rainfall, baseData.temperature),
      timestamp: date.toISOString(),
    });
  }

  return forecasts;
}

function getConditionFromWeather(rainfall: number, temperature: number): string {
  if (rainfall > 40) return 'Heavy Rain';
  if (rainfall > 20) return 'Rainy';
  if (rainfall > 5) return 'Light Rain';
  if (temperature > 40) return 'Hot';
  if (temperature > 35) return 'Warm';
  return 'Clear';
}

export async function getWeatherAlert(city: string): Promise<{
  active: boolean;
  type: string;
  severity: string;
  message: string;
} | null> {
  const weather = await fetchWeatherData(city);

  if (weather.rainfall > 50) {
    return {
      active: true,
      type: 'rain',
      severity: 'red',
      message: `Heavy rainfall alert: ${Math.round(weather.rainfall)}mm/hour expected`,
    };
  }

  if (weather.temperature > 45) {
    return {
      active: true,
      type: 'heat',
      severity: 'red',
      message: `Extreme heat warning: ${Math.round(weather.temperature)}°C`,
    };
  }

  if (weather.aqi > 300) {
    return {
      active: true,
      type: 'pollution',
      severity: 'red',
      message: `Severe air quality: AQI ${Math.round(weather.aqi)}`,
    };
  }

  if (weather.rainfall > 25 || weather.temperature > 40 || weather.aqi > 200) {
    const type = weather.rainfall > 25 ? 'rain' : weather.temperature > 40 ? 'heat' : 'pollution';
    return {
      active: true,
      type,
      severity: 'orange',
      message: `Weather advisory: Conditions may affect outdoor work`,
    };
  }

  return null;
}

export async function getHistoricalWeather(
  city: string,
  startDate: string,
  endDate: string
): Promise<WeatherData[]> {
  const data: WeatherData[] = [];
  const baseData = MOCK_WEATHER_DATA[city] || MOCK_WEATHER_DATA['Bangalore'];
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  for (let i = 0; i <= days; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);

    const monthFactor = Math.sin((date.getMonth() + 1) * Math.PI / 6);
    
    data.push({
      city,
      temperature: baseData.temperature + monthFactor * 5 + (Math.random() - 0.5) * 3,
      humidity: 60 + monthFactor * 20 + (Math.random() - 0.5) * 10,
      rainfall: Math.max(0, baseData.rainfall + monthFactor * 20 + (Math.random() - 0.5) * 15),
      aqi: Math.max(50, baseData.aqi + monthFactor * 30 + (Math.random() - 0.5) * 20),
      condition: getConditionFromWeather(baseData.rainfall, baseData.temperature),
      timestamp: date.toISOString(),
    });
  }

  return data;
}

export function getWeatherIcon(condition: string): string {
  const icons: { [key: string]: string } = {
    'Clear': '☀️',
    'Cloudy': '☁️',
    'Rainy': '🌧️',
    'Heavy Rain': '⛈️',
    'Light Rain': '🌦️',
    'Hot': '🌡️',
    'Warm': '🌤️',
    'Haze': '🌫️',
    'Smog': '🌫️',
    'Humid': '💧',
  };
  return icons[condition] || '🌤️';
}
