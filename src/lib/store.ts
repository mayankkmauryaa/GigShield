import { Worker, Policy, Claim, Trigger, WeatherData, PaymentTransaction, DashboardStats } from './types';
import { calculatePremium } from './ai/premium-calculator';

const workers: Map<string, Worker> = new Map();
const policies: Map<string, Policy> = new Map();
const claims: Map<string, Claim> = new Map();
const triggers: Map<string, Trigger> = new Map();
const payments: Map<string, PaymentTransaction> = new Map();

const indianCities: { city: string; state: string; lat: number; lng: number; riskZone: 'low' | 'medium' | 'high' }[] = [
  { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, riskZone: 'high' },
  { city: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025, riskZone: 'high' },
  { city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946, riskZone: 'medium' },
  { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, riskZone: 'medium' },
  { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, riskZone: 'medium' },
  { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, riskZone: 'high' },
  { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, riskZone: 'high' },
  { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, riskZone: 'medium' },
  { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, riskZone: 'medium' },
  { city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, riskZone: 'medium' },
];

const workerNames = [
  'Rahul Sharma', 'Priya Patel', 'Arun Kumar', 'sneha Verma', 'Vikram Singh',
  'Anita Reddy', 'Rajesh Nair', 'Meera Joshi', 'Suresh Yadav', 'Kavita Mishra',
  'Ajay Thakur', 'Deepa Rao', 'Mohan Das', 'Lakshmi Devi', 'Harish Iyer',
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function generatePolicyNumber(): string {
  return `GS-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

function generateTransactionRef(): string {
  return `TXN${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export function initializeSampleData(): void {
  if (workers.size > 0) return;

  indianCities.forEach((cityData, cityIndex) => {
    const numWorkers = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < numWorkers; i++) {
      const workerId = generateId();
      const name = workerNames[Math.floor(Math.random() * workerNames.length)];
      const phone = `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`;
      const avgEarnings = Math.floor(Math.random() * 15000) + 10000;
      const tenure = Math.floor(Math.random() * 36) + 1;
      const behaviorScore = Math.floor(Math.random() * 40) + 60;

      const worker: Worker = {
        id: workerId,
        name,
        phone,
        email: `${name.toLowerCase().replace(' ', '.')}@gmail.com`,
        aadhaarNumber: `${Math.floor(Math.random() * 900000) + 100000}${Math.floor(Math.random() * 9000) + 1000}${Math.floor(Math.random() * 9000) + 1000}`,
        platform: Math.random() > 0.5 ? 'swiggy' : 'zomato',
        zoneId: `zone-${cityData.city.toLowerCase()}-${i + 1}`,
        location: {
          city: cityData.city,
          state: cityData.state,
          pincode: `${Math.floor(Math.random() * 900000) + 100000}`,
          lat: cityData.lat + (Math.random() - 0.5) * 0.1,
          lng: cityData.lng + (Math.random() - 0.5) * 0.1,
        },
        riskZone: cityData.riskZone,
        behaviorScore,
        avgWeeklyEarnings: avgEarnings,
        avgWeeklyHours: Math.floor(avgEarnings / 100) + 40,
        tenure,
        status: 'active',
        registeredAt: new Date(Date.now() - tenure * 24 * 30 * 60 * 60 * 1000).toISOString(),
        lastActiveAt: new Date().toISOString(),
      };

      workers.set(workerId, worker);

      const premiumCalc = calculatePremium(worker);
      const policyId = generateId();
      
      const policy: Policy = {
        id: policyId,
        workerId,
        policyNumber: generatePolicyNumber(),
        status: 'active',
        weeklyPremium: premiumCalc.finalPremium,
        maxCoverage: premiumCalc.maxCoverage,
        coverageHours: premiumCalc.coverageHours,
        hourlyRate: Math.floor(avgEarnings / premiumCalc.coverageHours),
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
        autoRenew: true,
        triggers: ['rain', 'heat', 'pollution', 'flood'],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      policies.set(policyId, policy);

      if (Math.random() > 0.7) {
        const claimId = generateId();
        const hoursAffected = Math.floor(Math.random() * 6) + 2;
        const hourlyRate = policy.hourlyRate;
        const triggerTypes: ('rain' | 'heat' | 'pollution')[] = ['rain', 'heat', 'pollution'];
        const triggerType = triggerTypes[Math.floor(Math.random() * triggerTypes.length)];
        
        const claim: Claim = {
          id: claimId,
          workerId,
          policyId,
          triggerId: `trigger-${triggerType}-${Date.now()}`,
          triggerType,
          status: Math.random() > 0.3 ? 'paid' : 'approved',
          fraudCheck: {
            passed: true,
            score: Math.floor(Math.random() * 30) + 70,
            flags: [],
            level: 'none',
          },
          payoutAmount: hoursAffected * hourlyRate,
          hoursAffected,
          hourlyRate,
          description: `Income loss due to ${triggerType === 'rain' ? 'heavy rainfall' : triggerType === 'heat' ? 'extreme heat' : 'severe pollution'} conditions`,
          location: {
            lat: worker.location.lat,
            lng: worker.location.lng,
            zone: worker.zoneId,
          },
          triggeredAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          approvedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
          paidAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        claims.set(claimId, claim);
      }
    }
  });

  const activeTriggers: Trigger[] = [
    {
      id: generateId(),
      type: 'rain',
      location: 'Mumbai',
      severity: 'orange',
      threshold: 50,
      currentValue: 65,
      active: true,
      affectedWorkers: Array.from(workers.values())
        .filter(w => w.location.city === 'Mumbai')
        .map(w => w.id),
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      type: 'heat',
      location: 'Delhi',
      severity: 'red',
      threshold: 45,
      currentValue: 47,
      active: true,
      affectedWorkers: Array.from(workers.values())
        .filter(w => w.location.city === 'Delhi')
        .map(w => w.id),
      startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
  ];

  activeTriggers.forEach(t => triggers.set(t.id, t));
}

export function getWorkers(): Worker[] {
  return Array.from(workers.values());
}

export function getWorker(id: string): Worker | undefined {
  return workers.get(id);
}

export function createWorker(data: Omit<Worker, 'id' | 'registeredAt' | 'lastActiveAt'>): Worker {
  const worker: Worker = {
    ...data,
    id: generateId(),
    registeredAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };
  workers.set(worker.id, worker);
  return worker;
}

export function updateWorker(id: string, data: Partial<Worker>): Worker | undefined {
  const worker = workers.get(id);
  if (!worker) return undefined;
  const updated = { ...worker, ...data };
  workers.set(id, updated);
  return updated;
}

export function getPolicies(): Policy[] {
  return Array.from(policies.values());
}

export function getPolicy(id: string): Policy | undefined {
  return policies.get(id);
}

export function getPolicyByWorker(workerId: string): Policy | undefined {
  return Array.from(policies.values()).find(p => p.workerId === workerId);
}

export function createPolicy(data: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>): Policy {
  const policy: Policy = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  policies.set(policy.id, policy);
  return policy;
}

export function updatePolicy(id: string, data: Partial<Policy>): Policy | undefined {
  const policy = policies.get(id);
  if (!policy) return undefined;
  const updated = { ...policy, ...data, updatedAt: new Date().toISOString() };
  policies.set(id, updated);
  return updated;
}

export function getClaims(): Claim[] {
  return Array.from(claims.values());
}

export function getClaim(id: string): Claim | undefined {
  return claims.get(id);
}

export function getClaimsByWorker(workerId: string): Claim[] {
  return Array.from(claims.values()).filter(c => c.workerId === workerId);
}

export function createClaim(data: Omit<Claim, 'id' | 'createdAt'>): Claim {
  const claim: Claim = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  claims.set(claim.id, claim);
  return claim;
}

export function updateClaim(id: string, data: Partial<Claim>): Claim | undefined {
  const claim = claims.get(id);
  if (!claim) return undefined;
  const updated = { ...claim, ...data };
  claims.set(id, updated);
  return updated;
}

export function getTriggers(): Trigger[] {
  return Array.from(triggers.values());
}

export function getActiveTriggers(): Trigger[] {
  return Array.from(triggers.values()).filter(t => t.active);
}

export function createTrigger(data: Omit<Trigger, 'id'>): Trigger {
  const trigger: Trigger = {
    ...data,
    id: generateId(),
  };
  triggers.set(trigger.id, trigger);
  return trigger;
}

export function updateTrigger(id: string, data: Partial<Trigger>): Trigger | undefined {
  const trigger = triggers.get(id);
  if (!trigger) return undefined;
  const updated = { ...trigger, ...data };
  triggers.set(id, updated);
  return updated;
}

export function createPayment(data: Omit<PaymentTransaction, 'id' | 'transactionRef' | 'createdAt'>): PaymentTransaction {
  const payment: PaymentTransaction = {
    ...data,
    id: generateId(),
    transactionRef: generateTransactionRef(),
    createdAt: new Date().toISOString(),
  };
  payments.set(payment.id, payment);
  return payment;
}

export function getDashboardStats(): DashboardStats {
  const allWorkers = Array.from(workers.values());
  const allPolicies = Array.from(policies.values());
  const allClaims = Array.from(claims.values());

  const activePolicies = allPolicies.filter(p => p.status === 'active');
  const pendingClaims = allClaims.filter(c => c.status === 'pending' || c.status === 'approved');
  const paidClaims = allClaims.filter(c => c.status === 'paid');
  const fraudClaims = allClaims.filter(c => c.fraudCheck.level !== 'none');

  const totalPayouts = paidClaims.reduce((sum, c) => sum + c.payoutAmount, 0);
  const avgPremium = activePolicies.length > 0 
    ? activePolicies.reduce((sum, p) => sum + p.weeklyPremium, 0) / activePolicies.length 
    : 0;

  return {
    totalWorkers: allWorkers.length,
    activePolicies: activePolicies.length,
    pendingClaims: pendingClaims.length,
    totalPayouts,
    fraudRate: allClaims.length > 0 ? (fraudClaims.length / allClaims.length) * 100 : 0,
    avgPremium: Math.round(avgPremium),
    claimRate: activePolicies.length > 0 ? (allClaims.length / activePolicies.length) * 100 : 0,
  };
}

export function getWeatherData(city: string): WeatherData {
  const weatherConditions: { [key: string]: { temp: number; rain: number; aqi: number } } = {
    'Mumbai': { temp: 32, rain: 65, aqi: 120 },
    'Delhi': { temp: 42, rain: 5, aqi: 280 },
    'Bangalore': { temp: 28, rain: 20, aqi: 95 },
    'Chennai': { temp: 35, rain: 15, aqi: 110 },
    'Hyderabad': { temp: 38, rain: 8, aqi: 145 },
    'Kolkata': { temp: 36, rain: 45, aqi: 180 },
    'Pune': { temp: 34, rain: 30, aqi: 100 },
    'Ahmedabad': { temp: 40, rain: 3, aqi: 220 },
    'Jaipur': { temp: 39, rain: 2, aqi: 195 },
    'Lucknow': { temp: 37, rain: 10, aqi: 165 },
  };

  const conditions = weatherConditions[city] || { temp: 30, rain: 10, aqi: 100 };

  return {
    city,
    temperature: conditions.temp + (Math.random() - 0.5) * 4,
    humidity: 60 + Math.random() * 30,
    rainfall: conditions.rain + (Math.random() - 0.5) * 20,
    aqi: conditions.aqi + Math.floor((Math.random() - 0.5) * 40),
    condition: conditions.rain > 30 ? 'rainy' : conditions.temp > 38 ? 'hot' : 'clear',
    timestamp: new Date().toISOString(),
  };
}

initializeSampleData();
