import { Worker, Claim, Trigger, Policy } from '../types';
import { getWorkers, getClaims, getWeatherData, getActiveTriggers } from '../store';

export interface WeatherForecast {
  date: string;
  city: string;
  temperature: number;
  rainfall: number;
  aqi: number;
  humidity: number;
  triggerProbability: {
    rain: number;
    heat: number;
    pollution: number;
    flood: number;
  };
}

export interface CityPrediction {
  city: string;
  trigger: string;
  probability: number;
  expectedClaims: number;
  estimatedPayout: number;
  confidence: number;
}

export interface WeeklyPrediction {
  daily: DayPrediction[];
  weekly: {
    totalExpectedClaims: number;
    totalEstimatedPayout: number;
    riskLevel: 'low' | 'medium' | 'high';
    confidenceInterval: {
      low: number;
      high: number;
    };
  };
  recommendations: string[];
}

export interface DayPrediction {
  date: string;
  city: string;
  triggers: {
    rain: number;
    heat: number;
    pollution: number;
    flood: number;
  };
  expectedClaims: number;
  estimatedPayout: number;
  affectedWorkers: number;
}

export interface PlatformMetrics {
  totalWorkers: number;
  activePolicies: number;
  premiumsCollected: number;
  totalPayouts: number;
  lossRatio: number;
  fraudRate: number;
  avgClaimValue: number;
  profitMargin: number;
  pendingClaims: number;
  approvedClaims: number;
  paidClaims: number;
}

export function predictWeeklyClaims(): WeeklyPrediction {
  const workers = getWorkers();
  const claims = getClaims();
  const activeTriggers = getActiveTriggers();

  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
  const predictions: DayPrediction[] = [];
  let totalExpectedClaims = 0;
  let totalEstimatedPayout = 0;

  // Generate 7-day forecast
  for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    const dateStr = date.toISOString().split('T')[0];

    cities.forEach(city => {
      const weather = getWeatherData(city);
      const cityWorkers = workers.filter(w => w.location.city === city);
      
      // Calculate trigger probabilities based on weather
      const triggerProbs = calculateTriggerProbability(weather, dateStr);
      
      // Calculate expected claims per trigger type
      const expectedClaims = {
        rain: Math.round(cityWorkers.length * triggerProbs.rain * 0.08),
        heat: Math.round(cityWorkers.length * triggerProbs.heat * 0.06),
        pollution: Math.round(cityWorkers.length * triggerProbs.pollution * 0.04),
        flood: Math.round(cityWorkers.length * triggerProbs.flood * 0.02),
      };

      const avgEarnings = cityWorkers.reduce((sum, w) => sum + w.avgWeeklyEarnings, 0) / (cityWorkers.length || 1);
      const avgHourlyRate = avgEarnings / 50; // Assume 50 hours/week
      const avgPayoutPerClaim = avgHourlyRate * 4; // 4 hours average

      const dayClaims = Object.values(expectedClaims).reduce((a, b) => a + b, 0);
      const dayPayout = dayClaims * avgPayoutPerClaim;

      predictions.push({
        date: dateStr,
        city,
        triggers: triggerProbs,
        expectedClaims: dayClaims,
        estimatedPayout: dayPayout,
        affectedWorkers: dayClaims * 2, // Estimate affected workers
      });

      totalExpectedClaims += dayClaims;
      totalEstimatedPayout += dayPayout;
    });
  }

  // Calculate risk level
  const workerCount = workers.length || 1;
  const claimRate = (totalExpectedClaims / workerCount) * 100;
  
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (claimRate > 15) riskLevel = 'high';
  else if (claimRate > 8) riskLevel = 'medium';

  // Confidence interval (±30%)
  const confidenceLow = Math.round(totalEstimatedPayout * 0.7);
  const confidenceHigh = Math.round(totalEstimatedPayout * 1.3);

  // Generate recommendations
  const recommendations = generateRecommendations(predictions, riskLevel);

  return {
    daily: predictions,
    weekly: {
      totalExpectedClaims,
      totalEstimatedPayout,
      riskLevel,
      confidenceInterval: {
        low: confidenceLow,
        high: confidenceHigh,
      },
    },
    recommendations,
  };
}

function calculateTriggerProbability(weather: any, date: string): {
  rain: number;
  heat: number;
  pollution: number;
  flood: number;
} {
  if (!weather) {
    return { rain: 0.1, heat: 0.1, pollution: 0.1, flood: 0.05 };
  }

  const month = new Date(date).getMonth();
  const isMonsoon = month >= 6 && month <= 9;
  const isSummer = month >= 3 && month <= 5;

  let rain = 0.1;
  let heat = 0.1;
  let pollution = 0.1;
  let flood = 0.05;

  // Rain probability based on rainfall
  if (weather.rainfall > 50) rain = 0.8;
  else if (weather.rainfall > 30) rain = 0.6;
  else if (weather.rainfall > 10) rain = 0.4;
  else if (isMonsoon) rain = 0.5;

  // Heat probability based on temperature
  if (weather.temperature > 45) heat = 0.9;
  else if (weather.temperature > 42) heat = 0.7;
  else if (weather.temperature > 40) heat = 0.5;
  else if (isSummer && weather.temperature > 38) heat = 0.4;

  // Pollution based on AQI
  if (weather.aqi > 300) pollution = 0.9;
  else if (weather.aqi > 200) pollution = 0.7;
  else if (weather.aqi > 150) pollution = 0.5;
  else if (weather.aqi > 100) pollution = 0.3;

  // Flood probability (high rain + low elevation cities)
  if (weather.rainfall > 80 && ['Mumbai', 'Kolkata', 'Chennai'].some(c => weather.city?.includes(c))) {
    flood = 0.7;
  } else if (weather.rainfall > 60) {
    flood = 0.4;
  }

  // Monsoon adjustment
  if (isMonsoon) {
    rain = Math.min(0.9, rain * 1.3);
    flood = Math.min(0.8, flood * 1.5);
  }

  return { rain, heat, pollution, flood };
}

function generateRecommendations(predictions: DayPrediction[], riskLevel: string): string[] {
  const recommendations: string[] = [];

  if (riskLevel === 'high') {
    recommendations.push('⚠️ High risk week predicted - consider increasing reserves');
    recommendations.push('Pre-approve claims in high-risk cities to speed up processing');
  } else if (riskLevel === 'medium') {
    recommendations.push('Monitor weather updates in Delhi and Mumbai regions');
    recommendations.push('Ensure fraud detection team is on alert');
  } else {
    recommendations.push('Week looks stable - focus on new worker acquisitions');
  }

  // Find cities with highest risk
  const cityRisk = predictions.reduce((acc, p) => {
    acc[p.city] = (acc[p.city] || 0) + p.expectedClaims;
    return acc;
  }, {} as Record<string, number>);

  const topCities = Object.entries(cityRisk)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  if (topCities[0] && topCities[0][1] > 10) {
    recommendations.push(`Focus monitoring on: ${topCities.map(([c]) => c).join(', ')}`);
  }

  return recommendations;
}

export function calculatePlatformMetrics(): PlatformMetrics {
  const workers = getWorkers();
  const policies = require('../store').getPolicies();
  const claims = getClaims();

  const activePolicies = policies.filter((p: Policy) => p.status === 'active');
  const premiumsCollected = activePolicies.reduce((sum: number, p: Policy) => sum + p.weeklyPremium, 0);
  
  const paidClaims = claims.filter(c => c.status === 'paid');
  const totalPayouts = paidClaims.reduce((sum, c) => sum + c.payoutAmount, 0);

  const pendingClaims = claims.filter(c => c.status === 'pending').length;
  const approvedClaims = claims.filter(c => c.status === 'approved').length;

  const fraudClaims = claims.filter(c => c.status === 'fraud').length;

  const lossRatio = premiumsCollected > 0 ? (totalPayouts / premiumsCollected) * 100 : 0;
  const fraudRate = claims.length > 0 ? (fraudClaims / claims.length) * 100 : 0;
  const avgClaimValue = paidClaims.length > 0 ? totalPayouts / paidClaims.length : 0;
  const profitMargin = premiumsCollected > 0 ? ((premiumsCollected - totalPayouts) / premiumsCollected) * 100 : 0;

  return {
    totalWorkers: workers.length,
    activePolicies: activePolicies.length,
    premiumsCollected,
    totalPayouts,
    lossRatio,
    fraudRate,
    avgClaimValue,
    profitMargin,
    pendingClaims,
    approvedClaims,
    paidClaims: paidClaims.length,
  };
}

export function getWeeklyTrend(): {
  labels: string[];
  premiums: number[];
  claims: number[];
  payouts: number[];
} {
  const claims = getClaims();
  const policies = require('../store').getPolicies();

  const last8Weeks: string[] = [];
  const weeklyPremiums: number[] = [];
  const weeklyClaims: number[] = [];
  const weeklyPayouts: number[] = [];

  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (i * 7));
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - ((i - 1) * 7));

    const weekLabel = `W${8 - i}`;
    last8Weeks.push(weekLabel);

    // Get premiums for active policies (simplified)
    const weekPremium = policies
      .filter((p: Policy) => p.status === 'active')
      .reduce((sum: number, p: Policy) => sum + p.weeklyPremium, 0);
    weeklyPremiums.push(weekPremium);

    // Get claims in this week
    const weekClaims = claims.filter(c => {
      const claimDate = new Date(c.createdAt);
      return claimDate >= weekStart && claimDate <= weekEnd;
    });
    weeklyClaims.push(weekClaims.length);

    // Get payouts in this week
    const weekPayouts = weekClaims
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + c.payoutAmount, 0);
    weeklyPayouts.push(weekPayouts);
  }

  return {
    labels: last8Weeks,
    premiums: weeklyPremiums,
    claims: weeklyClaims,
    payouts: weeklyPayouts,
  };
}

export function getFraudAlerts(): {
  high: number;
  medium: number;
  low: number;
  recentAlerts: string[];
} {
  const claims = getClaims();

  let high = 0;
  let medium = 0;
  let low = 0;
  const recentAlerts: string[] = [];

  claims.forEach(claim => {
    if (claim.status === 'fraud') {
      high++;
      recentAlerts.push(`Fraud confirmed: ${claim.id.slice(0, 8).toUpperCase()} - ${claim.triggerType}`);
    } else if (claim.fraudCheck.level === 'high') {
      high++;
      recentAlerts.push(`High risk: ${claim.id.slice(0, 8).toUpperCase()} requires manual review`);
    } else if (claim.fraudCheck.level === 'medium') {
      medium++;
      if (recentAlerts.length < 5) {
        recentAlerts.push(`Medium risk: ${claim.id.slice(0, 8).toUpperCase()} - ${claim.fraudCheck.flags[0] || 'verify'}`);
      }
    } else if (claim.fraudCheck.level === 'low') {
      low++;
    }
  });

  return {
    high,
    medium,
    low,
    recentAlerts: recentAlerts.slice(0, 5),
  };
}

export function getTopRiskCities(): { city: string; riskScore: number; trigger: string }[] {
  const workers = getWorkers();
  const claims = getClaims();

  const cityStats: Record<string, { claims: number; payouts: number; workers: number }> = {};

  workers.forEach(w => {
    if (!cityStats[w.location.city]) {
      cityStats[w.location.city] = { claims: 0, payouts: 0, workers: 0 };
    }
    cityStats[w.location.city].workers++;
  });

  claims.filter(c => c.status === 'paid').forEach(c => {
    const worker = workers.find(w => w.id === c.workerId);
    if (worker && cityStats[worker.location.city]) {
      cityStats[worker.location.city].claims++;
      cityStats[worker.location.city].payouts += c.payoutAmount;
    }
  });

  // Calculate risk score (claims per 100 workers)
  const cityRisks = Object.entries(cityStats).map(([city, stats]): { city: string; riskScore: number; trigger: string } => {
    const claimRate = (stats.claims / (stats.workers || 1)) * 100;
    const avgPayout = stats.claims > 0 ? stats.payouts / stats.claims : 0;
    const riskScore = Math.min(100, (claimRate * 2) + (avgPayout / 100));
    
    return { city, riskScore, trigger: claimRate > 15 ? 'rain' : claimRate > 10 ? 'heat' : 'pollution' };
  });

  return cityRisks.sort((a, b) => b.riskScore - a.riskScore);
}