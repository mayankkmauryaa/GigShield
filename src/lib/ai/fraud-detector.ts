import { Claim, Worker, FraudCheckResult, FraudLevel } from '../types';
import { getClaimsByWorker, getWorker, getClaims } from '../store';

export function analyzeFraud(claim: Claim): FraudCheckResult {
  const flags: string[] = [];
  const recommendations: string[] = [];
  let riskScore = 0;

  const worker = getWorker(claim.workerId);
  if (!worker) {
    return {
      passed: false,
      score: 100,
      level: 'high',
      flags: ['Worker not found'],
      recommendations: ['Manual verification required'],
    };
  }

  const historicalClaims = getClaimsByWorker(worker.id);
  const recentClaims = historicalClaims.filter(c => {
    const daysDiff = (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 30;
  });

  if (recentClaims.length > 3) {
    flags.push(`High claim frequency: ${recentClaims.length} claims in last 30 days`);
    riskScore += 25;
    recommendations.push('Review claim history for patterns');
  }

  if (recentClaims.length > 0) {
    const avgPayout = recentClaims.reduce((sum, c) => sum + c.payoutAmount, 0) / recentClaims.length;
    if (claim.payoutAmount > avgPayout * 2) {
      flags.push(`Unusual payout amount: ₹${claim.payoutAmount} vs avg ₹${Math.round(avgPayout)}`);
      riskScore += 20;
    }
  }

  const hoursDiff = (Date.now() - new Date(worker.registeredAt).getTime()) / (1000 * 60 * 60 * 24);
  if (hoursDiff < 7 && recentClaims.length > 0) {
    flags.push('Recent registration with immediate claims');
    riskScore += 30;
    recommendations.push('Enhanced verification for new registrations');
  }

  if (worker.behaviorScore < 60) {
    flags.push(`Low behavior score: ${worker.behaviorScore}`);
    riskScore += 15;
  }

  const similarRecent = historicalClaims.filter(c => {
    if (c.id === claim.id) return false;
    const hoursDiff = Math.abs(
      new Date(c.triggeredAt).getTime() - new Date(claim.triggeredAt).getTime()
    ) / (1000 * 60 * 60);
    return hoursDiff < 24 && c.triggerType === claim.triggerType;
  });

  if (similarRecent.length >= 3) {
    flags.push(`Potential ring fraud: ${similarRecent.length} similar claims in same area`);
    riskScore += 35;
    recommendations.push('Cross-reference with other claims in zone');
  }

  const zoneClaims = historicalClaims.filter(c => {
    return c.location.zone === claim.location.zone;
  });

  if (zoneClaims.length > 10) {
    const zoneFraudRate = zoneClaims.filter(c => c.fraudCheck.level !== 'none').length / zoneClaims.length;
    if (zoneFraudRate > 0.1) {
      flags.push(`High fraud zone: ${Math.round(zoneFraudRate * 100)}% fraud rate`);
      riskScore += 15;
    }
  }

  const timingHour = new Date(claim.triggeredAt).getHours();
  if (timingHour < 6 || timingHour > 22) {
    flags.push(`Unusual claim timing: ${timingHour}:00`);
    riskScore += 10;
  }

  if (claim.hoursAffected > 12) {
    flags.push(`Excessive hours claimed: ${claim.hoursAffected} hours`);
    riskScore += 15;
    recommendations.push('Verify with external weather data');
  }

  const geoDistance = calculateDistance(
    worker.location.lat,
    worker.location.lng,
    claim.location.lat,
    claim.location.lng
  );

  if (geoDistance > 10) {
    flags.push(`Location mismatch: ${Math.round(geoDistance)}km from registered address`);
    riskScore += 25;
    recommendations.push('GPS spoofing detection triggered');
  }

  let level: FraudLevel = 'none';
  if (riskScore >= 60) level = 'high';
  else if (riskScore >= 35) level = 'medium';
  else if (riskScore >= 15) level = 'low';

  const passed = level === 'none' && riskScore < 15;

  return {
    passed,
    score: Math.min(100, riskScore),
    level,
    flags,
    recommendations,
  };
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

export function detectGPSSpoofing(claim: Claim, worker: Worker): {
  isSpoofed: boolean;
  confidence: number;
  evidence: string[];
} {
  const evidence: string[] = [];
  let confidence = 0;

  const distance = calculateDistance(
    worker.location.lat,
    worker.location.lng,
    claim.location.lat,
    claim.location.lng
  );

  if (distance > 5) {
    evidence.push(`Distance from registered location: ${Math.round(distance)}km`);
    confidence += 40;
  }

  const historicalClaims = getClaimsByWorker(worker.id);
  const locations = historicalClaims.map(c => ({ lat: c.location.lat, lng: c.location.lng }));
  
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
    evidence.push(`GPS teleport detected: ${teleportCount} impossible location changes`);
    confidence += 35;
  }

  return {
    isSpoofed: confidence > 60,
    confidence,
    evidence,
  };
}

export function detectRingFraud(zoneId: string, triggerType: string, triggeredAt: string): {
  isRingFraud: boolean;
  confidence: number;
  relatedClaims: string[];
} {
  const allClaims = getClaims();
  const timeWindow = 6 * 60 * 60 * 1000;
  const triggeredTime = new Date(triggeredAt).getTime();

  const suspiciousClaims = allClaims.filter((c: Claim) => {
    const claimTime = new Date(c.triggeredAt).getTime();
    const withinWindow = Math.abs(claimTime - triggeredTime) <= timeWindow;
    const sameZone = c.location.zone === zoneId;
    const sameTrigger = c.triggerType === triggerType;
    return withinWindow && sameZone && sameTrigger;
  });

  const claimIds = suspiciousClaims.map((c: Claim) => c.id);

  if (suspiciousClaims.length >= 5) {
    return {
      isRingFraud: true,
      confidence: Math.min(95, 50 + suspiciousClaims.length * 5),
      relatedClaims: claimIds,
    };
  }

  return {
    isRingFraud: false,
    confidence: 0,
    relatedClaims: [],
  };
}

export function calculatePremiumPenalty(fraudLevel: FraudLevel): number {
  const penalties: { [key in FraudLevel]: number } = {
    none: 0,
    low: 5,
    medium: 15,
    high: 30,
  };
  return penalties[fraudLevel];
}

export function generateFraudReport(claimId: string): {
  summary: string;
  details: string[];
  actions: string[];
} | null {
  const claims = getClaims();
  const claim = claims.find((c: Claim) => c.id === claimId);

  if (!claim) return null;

  const details: string[] = [];
  const actions: string[] = [];

  if (claim.fraudCheck.level !== 'none') {
    details.push(`Fraud Level: ${claim.fraudCheck.level.toUpperCase()}`);
    details.push(`Fraud Score: ${claim.fraudCheck.score}/100`);
    
    claim.fraudCheck.flags.forEach(flag => {
      details.push(`Flag: ${flag}`);
    });

    if (claim.fraudCheck.level === 'high') {
      actions.push('Flag for manual review');
      actions.push('Suspend policy pending investigation');
      actions.push('Report to compliance team');
    } else if (claim.fraudCheck.level === 'medium') {
      actions.push('Request additional documentation');
      actions.push('Apply reduced payout (80%)');
    } else {
      actions.push('Approve with warning');
      actions.push('Log for pattern analysis');
    }
  }

  return {
    summary: claim.fraudCheck.passed 
      ? 'Claim passed automated fraud checks' 
      : `Claim flagged for ${claim.fraudCheck.level} risk fraud indicators`,
    details,
    actions,
  };
}
