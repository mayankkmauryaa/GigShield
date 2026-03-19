import { Worker, RiskProfile, WeatherData } from '../types';
import { getWeatherData } from '../store';

export interface WeatherForecast {
  date: string;
  temperature: number;
  rainfall: number;
  aqi: number;
  riskLevel: 'low' | 'medium' | 'high';
  claimProbability: number;
}

export function generateWeatherForecast(city: string, days: number = 7): WeatherForecast[] {
  const currentWeather = getWeatherData(city);
  const forecasts: WeatherForecast[] = [];
  
  const baseTemp = currentWeather.temperature;
  const baseRain = currentWeather.rainfall;
  const baseAqi = currentWeather.aqi;

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    const tempVariation = (Math.random() - 0.5) * 6;
    const rainVariation = (Math.random() - 0.5) * 30;
    const aqiVariation = (Math.random() - 0.5) * 50;

    const temp = Math.max(20, Math.min(50, baseTemp + tempVariation));
    const rainfall = Math.max(0, Math.min(100, baseRain + rainVariation));
    const aqi = Math.max(50, Math.min(500, baseAqi + aqiVariation));

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (temp > 45 || rainfall > 50 || aqi > 300) riskLevel = 'high';
    else if (temp > 40 || rainfall > 30 || aqi > 200) riskLevel = 'medium';

    const claimProbability = calculateDailyClaimProbability(temp, rainfall, aqi, riskLevel);

    forecasts.push({
      date: date.toISOString().split('T')[0],
      temperature: Math.round(temp * 10) / 10,
      rainfall: Math.round(rainfall * 10) / 10,
      aqi: Math.round(aqi),
      riskLevel,
      claimProbability,
    });
  }

  return forecasts;
}

function calculateDailyClaimProbability(
  temperature: number,
  rainfall: number,
  aqi: number,
  riskLevel: 'low' | 'medium' | 'high'
): number {
  let probability = 0.02;

  if (temperature > 45) probability += 0.15;
  else if (temperature > 40) probability += 0.08;

  if (rainfall > 50) probability += 0.18;
  else if (rainfall > 30) probability += 0.10;

  if (aqi > 300) probability += 0.15;
  else if (aqi > 200) probability += 0.08;

  if (riskLevel === 'high') probability *= 1.5;
  else if (riskLevel === 'medium') probability *= 1.2;

  return Math.min(0.95, probability);
}

export function predictWeeklyPayout(worker: Worker): {
  expectedPayout: number;
  bestCase: number;
  worstCase: number;
  confidence: number;
} {
  const forecasts = generateWeatherForecast(worker.location.city, 7);
  
  const avgProbability = forecasts.reduce((sum, f) => sum + f.claimProbability, 0) / 7;
  
  const baseHourlyRate = worker.avgWeeklyEarnings / worker.avgWeeklyHours;
  const avgHoursAffected = 4;
  
  const expectedPayout = avgProbability * avgHoursAffected * baseHourlyRate * 7;
  
  const highRiskDays = forecasts.filter(f => f.riskLevel === 'high').length;
  const worstCase = highRiskDays * 8 * baseHourlyRate;
  
  const lowRiskDays = forecasts.filter(f => f.riskLevel === 'low').length;
  const bestCase = lowRiskDays * 2 * baseHourlyRate;

  const variance = forecasts.reduce((sum, f) => {
    const diff = f.claimProbability - avgProbability;
    return sum + (diff * diff);
  }, 0) / 7;
  const confidence = Math.max(0.5, 1 - Math.sqrt(variance));

  return {
    expectedPayout: Math.round(expectedPayout),
    bestCase: Math.round(bestCase),
    worstCase: Math.round(worstCase),
    confidence: Math.round(confidence * 100) / 100,
  };
}

export function calculateZoneRisk(zones: string[]): {
  zoneId: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string;
}[] {
  return zones.map(zoneId => {
    const weather = getWeatherData(zoneId.replace('zone-', '').split('-')[0] || zoneId);
    
    let riskScore = 0;
    
    if (weather.temperature > 40) riskScore += 30;
    else if (weather.temperature > 35) riskScore += 15;
    
    if (weather.rainfall > 40) riskScore += 35;
    else if (weather.rainfall > 20) riskScore += 15;
    
    if (weather.aqi > 250) riskScore += 25;
    else if (weather.aqi > 150) riskScore += 10;

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (riskScore > 60) riskLevel = 'high';
    else if (riskScore > 30) riskLevel = 'medium';

    let recommendation = 'Normal operations';
    if (riskLevel === 'high') {
      recommendation = 'Activate enhanced coverage and pre-position claims team';
    } else if (riskLevel === 'medium') {
      recommendation = 'Monitor conditions and prepare for potential triggers';
    }

    return {
      zoneId,
      riskScore,
      riskLevel,
      recommendation,
    };
  });
}

export function optimizePremiumForRisk(
  basePremium: number,
  riskScore: number,
  marketCompetition: number = 1.0
): number {
  const riskMultiplier = 1 + (riskScore / 100) * 0.5;
  
  const competitiveAdjustment = (marketCompetition - 1) * 0.2;
  
  const adjustedPremium = basePremium * riskMultiplier * (1 + competitiveAdjustment);
  
  const minPremium = basePremium * 0.7;
  const maxPremium = basePremium * 1.5;
  
  return Math.round(Math.max(minPremium, Math.min(maxPremium, adjustedPremium)));
}

export function generateRiskInsights(worker: Worker): {
  currentRisk: string;
  upcomingRisk: string;
  recommendations: string[];
  savingsOpportunity?: string;
} {
  const currentWeather = getWeatherData(worker.location.city);
  const forecasts = generateWeatherForecast(worker.location.city, 7);
  
  const currentRisk = determineRiskLevel(currentWeather);
  
  const upcomingHighRisk = forecasts.filter(f => f.riskLevel === 'high').length;
  const upcomingRisk = upcomingHighRisk > 3 
    ? `High alert: ${upcomingHighRisk} high-risk days expected`
    : upcomingHighRisk > 1
    ? `Moderate: ${upcomingHighRisk} potential disruption days`
    : 'Stable conditions expected';

  const recommendations: string[] = [];

  if (currentRisk === 'high') {
    recommendations.push('Current conditions may trigger claims - ensure coverage is active');
  }

  if (worker.tenure < 6) {
    recommendations.push('Build tenure to unlock loyalty discounts');
  }

  if (worker.behaviorScore < 70) {
    recommendations.push('Maintain clean claim history to reduce premiums by up to 15%');
  }

  const avgForecast = forecasts.reduce((sum, f) => sum + f.claimProbability, 0) / 7;
  if (avgForecast > 0.15) {
    recommendations.push('High disruption probability this week - consider increasing coverage');
  } else if (avgForecast < 0.05) {
    recommendations.push('Low disruption risk - good time to review and optimize your coverage');
  }

  let savingsOpportunity: string | undefined;
  if (worker.riskZone === 'high' && currentRisk === 'low') {
    const potentialSavings = Math.round(worker.avgWeeklyEarnings * 0.05);
    savingsOpportunity = `Save up to ₹${potentialSavings} this week with low-risk bonus`;
  }

  return {
    currentRisk,
    upcomingRisk,
    recommendations,
    savingsOpportunity,
  };
}

function determineRiskLevel(weather: WeatherData): 'low' | 'medium' | 'high' {
  let score = 0;
  
  if (weather.temperature > 45) score += 40;
  else if (weather.temperature > 40) score += 20;
  
  if (weather.rainfall > 50) score += 40;
  else if (weather.rainfall > 25) score += 20;
  
  if (weather.aqi > 300) score += 30;
  else if (weather.aqi > 200) score += 15;

  if (score > 60) return 'high';
  if (score > 30) return 'medium';
  return 'low';
}
