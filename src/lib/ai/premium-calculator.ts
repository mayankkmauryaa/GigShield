import { Worker, PremiumCalculation, RiskProfile } from '../types';

const ZONE_RISK_MULTIPLIERS: { [key: string]: number } = {
  'Mumbai': 1.3,
  'Delhi': 1.25,
  'Kolkata': 1.2,
  'Pune': 1.15,
  'Ahmedabad': 1.1,
  'Bangalore': 1.0,
  'Chennai': 0.95,
  'Hyderabad': 0.9,
  'Jaipur': 1.0,
  'Lucknow': 1.05,
};

const SEASONAL_FACTORS: { [key: string]: number } = {
  'monsoon': 1.25,
  'summer': 1.2,
  'winter': 1.0,
  'spring': 0.95,
  'autumn': 0.95,
};

const BASE_PREMIUMS: { [key: string]: number } = {
  'low': 35,
  'medium': 50,
  'high': 75,
};

export function getSeason(): string {
  const month = new Date().getMonth();
  if (month >= 6 && month <= 9) return 'monsoon';
  if (month >= 3 && month <= 5) return 'summer';
  if (month >= 10 && month <= 11) return 'autumn';
  if (month >= 2 && month <= 1) return 'spring';
  return 'winter';
}

export function calculatePremium(worker: Worker): PremiumCalculation {
  const basePremium = BASE_PREMIUMS[worker.riskZone];
  
  const zoneMultiplier = ZONE_RISK_MULTIPLIERS[worker.location.city] || 1.0;
  const locationRiskAdjustment = Math.round((zoneMultiplier - 1) * basePremium);
  
  const earningsFactor = worker.avgWeeklyEarnings / 15000;
  const hoursFactor = worker.avgWeeklyHours / 50;
  const activityAdjustment = Math.round((earningsFactor + hoursFactor) * 5);
  
  const tenureBonus = Math.min(worker.tenure / 12, 1) * 10;
  const behaviorBonus = (worker.behaviorScore - 50) / 10;
  const behaviorAdjustment = Math.round(tenureBonus - behaviorBonus);
  
  const season = getSeason();
  const seasonalAdjustment = Math.round((SEASONAL_FACTORS[season] - 1) * basePremium);
  
  const finalPremium = Math.max(
    25,
    Math.min(100, basePremium + locationRiskAdjustment + activityAdjustment + behaviorAdjustment + seasonalAdjustment)
  );
  
  const coverageHours = Math.min(60, Math.round(finalPremium * 0.8));
  const hourlyRate = Math.round(worker.avgWeeklyEarnings / coverageHours);
  const maxCoverage = coverageHours * hourlyRate;

  return {
    basePremium,
    locationRiskAdjustment,
    activityAdjustment,
    behaviorAdjustment,
    seasonalAdjustment,
    finalPremium,
    maxCoverage,
    coverageHours,
  };
}

export function generateRiskProfile(worker: Worker): RiskProfile {
  const factors: { name: string; contribution: number; weight: number }[] = [];
  
  const zoneRisk = ZONE_RISK_MULTIPLIERS[worker.location.city] || 1.0;
  factors.push({
    name: 'Location Risk',
    contribution: (zoneRisk - 1) * 40,
    weight: 40,
  });
  
  const earningsRisk = (worker.avgWeeklyEarnings / 20000) * 30;
  factors.push({
    name: 'Activity Level',
    contribution: earningsRisk,
    weight: 30,
  });
  
  const behaviorRisk = (100 - worker.behaviorScore) / 5 * 3;
  factors.push({
    name: 'Behavior Score',
    contribution: behaviorRisk,
    weight: 30,
  });
  
  const totalRisk = factors.reduce((sum, f) => sum + f.contribution, 0);
  
  let riskZone: 'low' | 'medium' | 'high' = 'low';
  if (totalRisk > 60) riskZone = 'high';
  else if (totalRisk > 40) riskZone = 'medium';
  
  const recommendations: string[] = [];
  if (zoneRisk > 1.2) {
    recommendations.push('Consider relocating to a lower-risk zone for reduced premiums');
  }
  if (worker.behaviorScore < 70) {
    recommendations.push('Improve claim history to unlock premium discounts');
  }
  if (worker.tenure < 6) {
    recommendations.push('Build tenure to qualify for loyalty discounts');
  }

  return {
    workerId: worker.id,
    riskScore: Math.round(totalRisk),
    riskZone,
    factors,
    recommendations,
  };
}

export function predictClaimProbability(worker: Worker, days: number = 7): number {
  const baseProbability = 0.15;
  
  const zoneMultiplier = ZONE_RISK_MULTIPLIERS[worker.location.city] || 1.0;
  const season = getSeason();
  const seasonMultiplier = SEASONAL_FACTORS[season];
  
  const riskFactors = zoneMultiplier * seasonMultiplier;
  const tenureDiscount = Math.max(0.8, 1 - (worker.tenure / 100));
  const behaviorDiscount = Math.max(0.9, 1 - (100 - worker.behaviorScore) / 200);
  
  const weeklyProbability = baseProbability * riskFactors * tenureDiscount * behaviorDiscount;
  
  return Math.min(0.95, weeklyProbability * (days / 7));
}

export function suggestOptimalCoverage(worker: Worker): {
  recommendedHours: number;
  recommendedPremium: number;
  potentialPayout: number;
  roi: number;
} {
  const avgDailyLoss = (worker.avgWeeklyEarnings / 7) * 0.3;
  const expectedDisruptionDays = predictClaimProbability(worker) * 7;
  
  const recommendedHours = Math.min(60, Math.max(20, Math.round(expectedDisruptionDays * 8)));
  const hourlyRate = worker.avgWeeklyEarnings / worker.avgWeeklyHours;
  const potentialPayout = recommendedHours * hourlyRate;
  
  const basePremium = BASE_PREMIUMS[worker.riskZone];
  const recommendedPremium = calculatePremium(worker).finalPremium;
  
  const expectedAnnualClaims = expectedDisruptionDays * 52;
  const annualPremium = recommendedPremium * 52;
  const annualPayout = potentialPayout * expectedAnnualClaims;
  const roi = annualPremium > 0 ? (annualPayout - annualPremium) / annualPremium : 0;

  return {
    recommendedHours,
    recommendedPremium,
    potentialPayout: Math.round(potentialPayout),
    roi: Math.round(roi * 100) / 100,
  };
}
