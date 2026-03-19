import { Trigger, TriggerType, WeatherData, Claim } from '../types';
import { getWeatherData, createTrigger, createClaim, getActiveTriggers, getPolicies, getWorker, updateClaim } from '../store';
import { analyzeFraud } from '../ai/fraud-detector';
import { calculateDistance } from '../ai/fraud-detector';

interface TriggerThreshold {
  yellow: number;
  orange: number;
  red: number;
  durationHours?: number;
  requiresAlert?: boolean;
}

const TRIGGER_THRESHOLDS: Record<TriggerType, TriggerThreshold> = {
  rain: {
    yellow: 25,
    orange: 40,
    red: 50,
    durationHours: 2,
  },
  heat: {
    yellow: 40,
    orange: 43,
    red: 45,
    durationHours: 4,
  },
  pollution: {
    yellow: 200,
    orange: 250,
    red: 300,
    durationHours: 8,
  },
  flood: {
    yellow: 0,
    orange: 0,
    red: 0,
    requiresAlert: true,
  },
  curfew: {
    yellow: 0,
    orange: 0,
    red: 0,
    requiresAlert: true,
  },
};

interface TriggerState {
  type: TriggerType;
  location: string;
  severity: 'yellow' | 'orange' | 'red';
  startTime: number;
  currentValue: number;
  active: boolean;
  affectedWorkers: Set<string>;
}

const activeTriggerStates: Map<string, TriggerState> = new Map();

export function checkWeatherTriggers(city: string): Trigger[] {
  const weather = getWeatherData(city);
  const triggeredTriggers: Trigger[] = [];

  if (weather.rainfall > TRIGGER_THRESHOLDS.rain.yellow) {
    const severity = getRainSeverity(weather.rainfall);
    const trigger = checkAndCreateTrigger('rain', city, severity, weather.rainfall, weather);
    if (trigger) triggeredTriggers.push(trigger);
  }

  if (weather.temperature > TRIGGER_THRESHOLDS.heat.yellow) {
    const severity = getHeatSeverity(weather.temperature);
    const trigger = checkAndCreateTrigger('heat', city, severity, weather.temperature, weather);
    if (trigger) triggeredTriggers.push(trigger);
  }

  if (weather.aqi > TRIGGER_THRESHOLDS.pollution.yellow) {
    const severity = getPollutionSeverity(weather.aqi);
    const trigger = checkAndCreateTrigger('pollution', city, severity, weather.aqi, weather);
    if (trigger) triggeredTriggers.push(trigger);
  }

  return triggeredTriggers;
}

function getRainSeverity(rainfall: number): 'yellow' | 'orange' | 'red' {
  if (rainfall >= TRIGGER_THRESHOLDS.rain.red) return 'red';
  if (rainfall >= TRIGGER_THRESHOLDS.rain.orange) return 'orange';
  return 'yellow';
}

function getHeatSeverity(temperature: number): 'yellow' | 'orange' | 'red' {
  if (temperature >= TRIGGER_THRESHOLDS.heat.red) return 'red';
  if (temperature >= TRIGGER_THRESHOLDS.heat.orange) return 'orange';
  return 'yellow';
}

function getPollutionSeverity(aqi: number): 'yellow' | 'orange' | 'red' {
  if (aqi >= TRIGGER_THRESHOLDS.pollution.red) return 'red';
  if (aqi >= TRIGGER_THRESHOLDS.pollution.orange) return 'orange';
  return 'yellow';
}

function checkAndCreateTrigger(
  type: TriggerType,
  location: string,
  severity: 'yellow' | 'orange' | 'red',
  currentValue: number,
  weather: WeatherData
): Trigger | null {
  const stateKey = `${type}-${location}`;
  const existingState = activeTriggerStates.get(stateKey);
  const now = Date.now();

  if (severity === 'yellow') {
    if (existingState) {
      activeTriggerStates.delete(stateKey);
    }
    return null;
  }

  if (existingState) {
    existingState.currentValue = currentValue;
    existingState.severity = severity;
    
    const durationHours = (now - existingState.startTime) / (1000 * 60 * 60);
    const requiredDuration = TRIGGER_THRESHOLDS[type].durationHours || 0;

    if (durationHours >= requiredDuration && !existingState.active) {
      existingState.active = true;
      return createActiveTrigger(existingState);
    }
    
    return null;
  }

  activeTriggerStates.set(stateKey, {
    type,
    location,
    severity,
    startTime: now,
    currentValue,
    active: false,
    affectedWorkers: new Set(),
  });

  return null;
}

function createActiveTrigger(state: TriggerState): Trigger {
  const policies = getPolicies();
  const affectedWorkerIds: string[] = [];

  policies.forEach(policy => {
    if (policy.status !== 'active') return;
    
    const worker = getWorker(policy.workerId);
    if (!worker) return;
    
    if (worker.location.city === state.location) {
      state.affectedWorkers.add(worker.id);
      affectedWorkerIds.push(worker.id);
    }
  });

  const trigger = createTrigger({
    type: state.type,
    location: state.location,
    severity: state.severity,
    threshold: TRIGGER_THRESHOLDS[state.type][state.severity as keyof typeof TRIGGER_THRESHOLDS['rain']] as number,
    currentValue: state.currentValue,
    active: true,
    affectedWorkers: affectedWorkerIds,
    startedAt: new Date(state.startTime).toISOString(),
  });

  return trigger;
}

export function processAutomaticClaims(trigger: Trigger): Claim[] {
  const createdClaims: Claim[] = [];
  const policies = getPolicies();

  policies.forEach(policy => {
    if (policy.status !== 'active') return;
    if (!policy.triggers.includes(trigger.type)) return;
    if (!trigger.affectedWorkers.includes(policy.workerId)) return;

    const worker = getWorker(policy.workerId);
    if (!worker) return;

    const hoursAffected = calculateHoursAffected(trigger);
    const payoutAmount = hoursAffected * policy.hourlyRate;

    const claimData: Omit<Claim, 'id' | 'createdAt'> = {
      workerId: worker.id,
      policyId: policy.id,
      triggerId: trigger.id,
      triggerType: trigger.type,
      status: 'pending',
      fraudCheck: {
        passed: true,
        score: 0,
        flags: [],
        level: 'none',
      },
      payoutAmount,
      hoursAffected,
      hourlyRate: policy.hourlyRate,
      description: generateClaimDescription(trigger),
      location: {
        lat: worker.location.lat,
        lng: worker.location.lng,
        zone: worker.zoneId,
      },
      triggeredAt: trigger.startedAt,
    };

    const claim = createClaim(claimData);
    const fraudResult = analyzeFraud(claim);
    
    updateClaim(claim.id, {
      fraudCheck: {
        passed: fraudResult.passed,
        score: fraudResult.score,
        flags: fraudResult.flags,
        level: fraudResult.level,
      },
    });

    if (!fraudResult.passed) {
      updateClaim(claim.id, { status: 'fraud' });
    }

    createdClaims.push(claim);
  });

  return createdClaims;
}

function calculateHoursAffected(trigger: Trigger): number {
  const baseHours: { [key in TriggerType]: number } = {
    rain: 8,
    heat: 6,
    pollution: 8,
    flood: 12,
    curfew: 10,
  };

  let hours = baseHours[trigger.type];

  if (trigger.severity === 'red') {
    hours *= 1.5;
  } else if (trigger.severity === 'orange') {
    hours *= 1.25;
  }

  return Math.round(hours);
}

function generateClaimDescription(trigger: Trigger): string {
  const descriptions: { [key in TriggerType]: string } = {
    rain: 'Heavy rainfall prevented outdoor deliveries',
    heat: 'Extreme heat conditions limited working hours',
    pollution: 'Severe air quality restricted outdoor work',
    flood: 'Flood conditions made deliveries unsafe',
    curfew: 'Local restrictions prevented access to work areas',
  };

  return `${descriptions[trigger.type]} in ${trigger.location} (${trigger.severity.toUpperCase()} alert)`;
}

export function simulateWeatherEvent(
  city: string,
  type: TriggerType,
  severity: 'yellow' | 'orange' | 'red',
  value: number
): {
  trigger: Trigger | null;
  claims: Claim[];
} {
  const triggerState: TriggerState = {
    type,
    location: city,
    severity,
    startTime: Date.now() - ((TRIGGER_THRESHOLDS[type].durationHours || 0) + 1) * 60 * 60 * 1000,
    currentValue: value,
    active: true,
    affectedWorkers: new Set(),
  };

  const trigger = createActiveTrigger(triggerState);
  const claims = processAutomaticClaims(trigger);

  return { trigger, claims };
}

export function getTriggerSummary(): {
  activeTriggers: number;
  byType: { [key in TriggerType]?: number };
  bySeverity: { [key: string]: number };
  affectedWorkers: number;
} {
  const active = getActiveTriggers();
  
  const byType: { [key in TriggerType]?: number } = {};
  const bySeverity: { [key: string]: number } = {};
  const uniqueWorkers = new Set<string>();

  active.forEach(t => {
    byType[t.type] = (byType[t.type] || 0) + 1;
    bySeverity[t.severity] = (bySeverity[t.severity] || 0) + 1;
    t.affectedWorkers.forEach(w => uniqueWorkers.add(w));
  });

  return {
    activeTriggers: active.length,
    byType,
    bySeverity,
    affectedWorkers: uniqueWorkers.size,
  };
}
