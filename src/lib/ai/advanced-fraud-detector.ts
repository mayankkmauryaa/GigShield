import { Claim, Worker, FraudCheckResult, FraudLevel } from '../types';
import { getClaimsByWorker, getWorker, getClaims } from '../store';

export interface FraudSignals {
  gpsData?: GPSSignal;
  networkData?: NetworkSignal;
  deviceData?: DeviceFingerprint;
  behavioralData?: BehavioralProfile;
}

export interface GPSSignal {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  satellites?: number;
  timestamp: number;
}

export interface NetworkSignal {
  cellTowerId: string;
  wifiBSSID?: string;
  ipGeolocation?: GeoLocation;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  city?: string;
}

export interface DeviceFingerprint {
  deviceId: string;
  emulator: boolean;
  rootAccess: boolean;
  lastLocation: GeoLocation;
}

export interface BehavioralProfile {
  typicalHours: number[];
  typicalZones: string[];
  typicalRoutes: string[];
  anomalyScore: number;
}

export interface AdvancedFraudResult {
  passed: boolean;
  score: number;
  level: 'none' | 'low' | 'medium' | 'high';
  requiresManualReview: boolean;
  checks: FraudCheckResult[];
  flags: string[];
  recommendations: string[];
}

export function advancedFraudCheck(
  claim: Claim,
  worker: Worker,
  signals?: FraudSignals
): AdvancedFraudResult {
  const flags: string[] = [];
  const recommendations: string[] = [];
  const checks: FraudCheckResult[] = [];
  let totalScore = 0;

  // 1. GPS Spoofing Detection
  const gpsCheck = detectGPSSpoofingAdvanced(claim, worker, signals?.gpsData);
  checks.push(gpsCheck);
  if (!gpsCheck.passed) {
    flags.push(...gpsCheck.flags);
    totalScore += gpsCheck.score;
  }

  // 2. Ring Fraud Detection
  const ringCheck = detectRingFraudEnhanced(claim);
  checks.push(ringCheck);
  if (!ringCheck.passed) {
    flags.push(...ringCheck.flags);
    totalScore += ringCheck.score;
  }

  // 3. Behavioral Analysis
  const behaviorCheck = analyzeBehavioralPattern(claim, worker, signals?.behavioralData);
  checks.push(behaviorCheck);
  if (!behaviorCheck.passed) {
    flags.push(...behaviorCheck.flags);
    totalScore += behaviorCheck.score;
  }

  // 4. Weather Correlation
  const weatherCheck = validateWeatherCorrelation(claim, worker);
  checks.push(weatherCheck);
  if (!weatherCheck.passed) {
    flags.push(...weatherCheck.flags);
    totalScore += weatherCheck.score;
  }

  // 5. Historical Pattern Analysis
  const historyCheck = analyzeHistoricalPattern(claim, worker);
  checks.push(historyCheck);
  if (!historyCheck.passed) {
    flags.push(...historyCheck.flags);
    totalScore += historyCheck.score;
  }

  // Determine level
  let level: FraudLevel = 'none';
  if (totalScore >= 60) level = 'high';
  else if (totalScore >= 35) level = 'medium';
  else if (totalScore >= 15) level = 'low';

  const passed = level === 'none' && totalScore < 15;
  const requiresManualReview = totalScore >= 35 && totalScore < 70;

  if (requiresManualReview) {
    recommendations.push('Manual review required - suspicious patterns detected');
  }

  if (totalScore >= 60) {
    recommendations.push('Claim flagged for investigation');
    recommendations.push('Consider suspending policy pending review');
  }

  return {
    passed,
    score: Math.min(100, totalScore),
    level,
    requiresManualReview,
    checks,
    flags,
    recommendations,
  };
}

export function detectGPSSpoofingAdvanced(
  claim: Claim,
  worker: Worker,
  gpsData?: GPSSignal
): FraudCheckResult {
  const flags: string[] = [];
  let score = 0;

  // Check 1: Distance from registered location
  const geoDistance = calculateDistance(
    worker.location.lat,
    worker.location.lng,
    claim.location.lat,
    claim.location.lng
  );

  if (geoDistance > 10) {
    flags.push(`GPS location mismatch: ${Math.round(geoDistance)}km from registered address`);
    score += 25;
  }

  // Check 2: Accuracy check (if provided - spoofed GPS often has perfect accuracy)
  if (gpsData && gpsData.accuracy < 3) {
    flags.push('GPS accuracy too high (suspicious - possible spoofing)');
    score += 20;
  }

  // Check 3: Satellite count validation (if provided)
  if (gpsData && gpsData.satellites !== undefined && gpsData.satellites < 4) {
    flags.push(`Insufficient GPS satellites: ${gpsData.satellites} (need 4+)`);
    score += 30;
  }

  // Check 4: Altitude anomaly (if provided)
  if (gpsData && gpsData.altitude !== undefined) {
    const expectedAltitude = getExpectedAltitude(worker.location.lat);
    if (Math.abs(gpsData.altitude - expectedAltitude) > 100) {
      flags.push('Altitude mismatch detected (possible GPS spoofing)');
      score += 25;
    }
  }

  // Check 5: Historical teleport detection
  const historicalClaims = getClaimsByWorker(worker.id);
  const locations = historicalClaims
    .filter(c => c.id !== claim.id)
    .map(c => ({ lat: c.location.lat, lng: c.location.lng }));

  let teleportCount = 0;
  for (let i = 1; i < locations.length; i++) {
    const dist = calculateDistance(
      locations[i - 1].lat,
      locations[i - 1].lng,
      locations[i].lat,
      locations[i].lng
    );
    if (dist > 50) teleportCount++;
  }

  if (teleportCount > 2) {
    flags.push(`GPS teleport detected: ${teleportCount} impossible location changes`);
    score += 35;
  }

  // Check 6: Network location cross-reference (if provided)
  if (gpsData?.timestamp && gpsData?.latitude) {
    // This would normally compare with network IP location
    // For demo, check timestamp consistency
    const timeSinceClaim = Math.abs(Date.now() - gpsData.timestamp) / 1000;
    if (timeSinceClaim > 300) { // More than 5 min old
      flags.push('GPS timestamp too old - possible stale location data');
      score += 10;
    }
  }

  const passed = score < 40;
  return {
    passed,
    score,
    level: score >= 60 ? 'high' : score >= 30 ? 'medium' : score >= 15 ? 'low' : 'none',
    flags,
    recommendations: passed ? [] : ['Verify with external GPS validation service'],
  };
}

export function detectRingFraudEnhanced(claim: Claim): FraudCheckResult {
  const flags: string[] = [];
  let score = 0;
  const allClaims = getClaims();

  // Step 1: Cluster claims by location (500m radius)
  const nearbyClaims = allClaims.filter(c => {
    if (c.id === claim.id) return false;
    const distance = calculateDistance(
      claim.location.lat,
      claim.location.lng,
      c.location.lat,
      c.location.lng
    );
    return distance < 0.5; // 500m radius
  });

  // Step 2: Check timing correlation (within 6 hours)
  const timeWindowClaims = nearbyClaims.filter(c => {
    const hoursDiff = Math.abs(
      new Date(c.triggeredAt).getTime() - new Date(claim.triggeredAt).getTime()
    ) / (1000 * 60 * 60);
    return hoursDiff < 6;
  });

  if (timeWindowClaims.length >= 5) {
    flags.push(`Potential ring fraud: ${timeWindowClaims.length + 1} claims in same area within 6 hours`);
    score += 30;
  }

  // Step 3: Check amount similarity (if multiple claims have similar amounts)
  const similarAmountClaims = nearbyClaims.filter(c => {
    const amountDiff = Math.abs(c.payoutAmount - claim.payoutAmount) / claim.payoutAmount;
    return amountDiff < 0.2; // Within 20%
  });

  if (similarAmountClaims.length >= 3) {
    flags.push(`Amount similarity detected: ${similarAmountClaims.length + 1} claims with similar payout`);
    score += 25;
  }

  // Step 4: Check for coordinated timing pattern
  const sameTriggerClaims = nearbyClaims.filter(c => c.triggerType === claim.triggerType);
  if (sameTriggerClaims.length >= 4) {
    flags.push(`Coordinated trigger pattern: ${sameTriggerClaims.length + 1} claims for same trigger type`);
    score += 20;
  }

  // Step 5: Zone-based cluster analysis
  const zoneClaims = allClaims.filter(c => c.location.zone === claim.location.zone);
  if (zoneClaims.length > 10) {
    const recentZoneClaims = zoneClaims.filter(c => {
      const daysDiff = (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });
    if (recentZoneClaims.length >= 5) {
      flags.push(`High cluster activity in zone: ${recentZoneClaims.length} claims in last 7 days`);
      score += 15;
    }
  }

  const passed = score < 40;
  return {
    passed,
    score,
    level: score >= 50 ? 'high' : score >= 25 ? 'medium' : score >= 10 ? 'low' : 'none',
    flags,
    recommendations: passed ? [] : ['Cross-reference with other claims in zone', 'Check for coordinated fraud pattern'],
  };
}

export function analyzeBehavioralPattern(
  claim: Claim,
  worker: Worker,
  behavioralData?: BehavioralProfile
): FraudCheckResult {
  const flags: string[] = [];
  let score = 0;

  // Get historical claims to build behavioral profile
  const historicalClaims = getClaimsByWorker(worker.id);
  
  if (historicalClaims.length > 0) {
    // Analyze typical working hours
    const claimHours = historicalClaims.map(c => new Date(c.triggeredAt).getHours());
    const typicalHours = [...new Set(claimHours)];
    const currentHour = new Date(claim.triggeredAt).getHours();

    if (typicalHours.length > 0 && !typicalHours.includes(currentHour)) {
      // Check if claim is outside typical hours but worker has history
      const avgHour = claimHours.reduce((a, b) => a + b, 0) / claimHours.length;
      if (Math.abs(currentHour - avgHour) > 6) {
        flags.push(`Claim outside typical working hours: ${currentHour}:00 (typical: ${Math.round(avgHour)}:00)`);
        score += 15;
      }
    }

    // Analyze claim frequency
    const recentClaims = historicalClaims.filter(c => {
      const daysDiff = (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30;
    });

    if (recentClaims.length > 3) {
      flags.push(`High claim frequency: ${recentClaims.length} claims in last 30 days`);
      score += 25;
    }

    // Check for claim amount anomalies
    const avgPayout = recentClaims.reduce((sum, c) => sum + c.payoutAmount, 0) / recentClaims.length;
    if (claim.payoutAmount > avgPayout * 2) {
      flags.push(`Unusual payout amount: ₹${claim.payoutAmount} vs avg ₹${Math.round(avgPayout)}`);
      score += 20;
    }

    // Check tenure vs claims (new worker with claims)
    const tenureDays = (Date.now() - new Date(worker.registeredAt).getTime()) / (1000 * 60 * 60 * 24);
    if (tenureDays < 7 && recentClaims.length > 0) {
      flags.push(`Recent registration (${Math.round(tenureDays)} days) with ${recentClaims.length} claims`);
      score += 30;
    }

    // Check behavior score
    if (worker.behaviorScore < 60) {
      flags.push(`Low behavior score: ${worker.behaviorScore}`);
      score += 15;
    }

    // Analyze location consistency
    const locations = [...new Set(historicalClaims.map(c => c.location.zone))];
    if (locations.length > 5 && historicalClaims.length > 5) {
      flags.push(`High location variability: ${locations.length} different zones in ${historicalClaims.length} claims`);
      score += 15;
    }
  } else if (behavioralData) {
    // Use provided behavioral data
    if (behavioralData.typicalHours.length > 0) {
      const currentHour = new Date(claim.triggeredAt).getHours();
      if (!behavioralData.typicalHours.includes(currentHour)) {
        flags.push('Claim outside typical behavioral hours');
        score += 10;
      }
    }

    if (behavioralData.anomalyScore > 50) {
      flags.push(`High behavioral anomaly score: ${behavioralData.anomalyScore}`);
      score += behavioralData.anomalyScore / 2;
    }
  }

  const passed = score < 40;
  return {
    passed,
    score,
    level: score >= 50 ? 'high' : score >= 25 ? 'medium' : score >= 10 ? 'low' : 'none',
    flags,
    recommendations: passed ? [] : ['Review worker behavioral profile', 'Consider additional verification'],
  };
}

export function validateWeatherCorrelation(claim: Claim, worker: Worker): FraudCheckResult {
  const flags: string[] = [];
  let score = 0;

  // Get weather data for the location
  const { getWeatherData } = require('../store');
  const weather = getWeatherData(worker.location.city);

  if (weather) {
    // Check if weather actually supports the claim trigger
    const triggerCorrelations: Record<string, { condition: string; threshold: number }> = {
      rain: { condition: 'rainfall', threshold: 10 },
      heat: { condition: 'temperature', threshold: 40 },
      pollution: { condition: 'aqi', threshold: 200 },
      flood: { condition: 'rainfall', threshold: 50 },
    };

    const correlation = triggerCorrelations[claim.triggerType];
    if (correlation) {
      const weatherValue = weather[correlation.condition as keyof typeof weather] as number;
      if (weatherValue < correlation.threshold) {
        flags.push(`Weather data doesn't support ${claim.triggerType} claim: ${correlation.condition} is ${weatherValue} (threshold: ${correlation.threshold})`);
        score += 30;
      }
    }
  }

  const passed = score < 30;
  return {
    passed,
    score,
    level: score >= 30 ? 'high' : score >= 15 ? 'medium' : 'none',
    flags,
    recommendations: passed ? [] : ['Verify weather data correlation', 'Cross-reference with external weather API'],
  };
}

export function analyzeHistoricalPattern(claim: Claim, worker: Worker): FraudCheckResult {
  const flags: string[] = [];
  let score = 0;

  const allClaims = getClaims();

  // Check zone fraud rate
  const zoneClaims = allClaims.filter(c => c.location.zone === claim.location.zone);
  if (zoneClaims.length > 10) {
    const zoneFraudRate = zoneClaims.filter(c => c.status === 'fraud').length / zoneClaims.length;
    if (zoneFraudRate > 0.15) {
      flags.push(`High fraud zone: ${Math.round(zoneFraudRate * 100)}% fraud rate in zone`);
      score += 20;
    }
  }

  // Check similar claims in same period
  const similarClaims = allClaims.filter(c => {
    if (c.id === claim.id) return false;
    const hoursDiff = Math.abs(
      new Date(c.triggeredAt).getTime() - new Date(claim.triggeredAt).getTime()
    ) / (1000 * 60 * 60);
    return hoursDiff < 24 && c.triggerType === claim.triggerType;
  });

  if (similarClaims.length >= 5) {
    flags.push(`High cluster of similar claims: ${similarClaims.length} claims within 24 hours`);
    score += 15;
  }

  // Check for duplicate amounts (potential ring fraud)
  const sameAmountClaims = allClaims.filter(c => 
    c.id !== claim.id && 
    Math.abs(c.payoutAmount - claim.payoutAmount) < 100
  );

  if (sameAmountClaims.length >= 3) {
    flags.push(`Pattern of identical claim amounts detected`);
    score += 10;
  }

  const passed = score < 35;
  return {
    passed,
    score,
    level: score >= 35 ? 'medium' : score >= 15 ? 'low' : 'none',
    flags,
    recommendations: passed ? [] : ['Analyze historical patterns for fraud ring'],
  };
}

// Helper functions
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

function getExpectedAltitude(lat: number): number {
  // Approximate elevation for major Indian cities
  const cityAltitudes: Record<string, number> = {
    'Mumbai': 14,
    'Delhi': 216,
    'Bangalore': 920,
    'Chennai': 6,
    'Hyderabad': 617,
    'Kolkata': 9,
    'Pune': 560,
    'Ahmedabad': 53,
    'Jaipur': 391,
    'Lucknow': 123,
  };
  
  const city = Object.keys(cityAltitudes).find(c => 
    lat.toString().includes(c.toLowerCase().substring(0, 3))
  );
  return city ? cityAltitudes[city] : 200;
}

export function getFraudSummary(): {
  high: number;
  medium: number;
  low: number;
  total: number;
  recentAlerts: string[];
} {
  const allClaims = getClaims();
  
  let high = 0;
  let medium = 0;
  let low = 0;
  const recentAlerts: string[] = [];

  allClaims.forEach(claim => {
    if (claim.status === 'fraud') {
      high++;
      recentAlerts.push(`Fraud detected in ${claim.location.zone} - ${claim.triggerType}`);
    } else if (claim.fraudCheck.level === 'high') {
      high++;
      recentAlerts.push(`High risk claim ${claim.id.slice(0, 8)} requires review`);
    } else if (claim.fraudCheck.level === 'medium') {
      medium++;
    } else if (claim.fraudCheck.level === 'low') {
      low++;
    }
  });

  return {
    high,
    medium,
    low,
    total: allClaims.length,
    recentAlerts: recentAlerts.slice(0, 5),
  };
}