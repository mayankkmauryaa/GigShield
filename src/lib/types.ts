export type WorkerStatus = 'active' | 'inactive' | 'suspended';
export type PolicyStatus = 'active' | 'expired' | 'cancelled' | 'pending';
export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'paid' | 'fraud';
export type TriggerType = 'rain' | 'heat' | 'pollution' | 'flood' | 'curfew' | 'app_outage' | 'demand_surge' | 'traffic' | 'strike';
export type DeliveryPlatform = 'zomato' | 'swiggy' | 'zepto' | 'blinkit' | 'amazon' | 'flipkart' | 'dunzo' | 'both' | 'multiple';
export type RiskZone = 'low' | 'medium' | 'high';
export type FraudLevel = 'none' | 'low' | 'medium' | 'high';

export interface Worker {
  id: string;
  name: string;
  phone: string;
  email: string;
  aadhaarNumber: string;
  platform: DeliveryPlatform;
  zoneId: string;
  location: {
    city: string;
    state: string;
    pincode: string;
    lat: number;
    lng: number;
  };
  riskZone: RiskZone;
  behaviorScore: number;
  avgWeeklyEarnings: number;
  avgWeeklyHours: number;
  tenure: number;
  status: WorkerStatus;
  registeredAt: string;
  lastActiveAt: string;
}

export interface Policy {
  id: string;
  workerId: string;
  policyNumber: string;
  status: PolicyStatus;
  weeklyPremium: number;
  maxCoverage: number;
  coverageHours: number;
  hourlyRate: number;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  triggers: TriggerType[];
  createdAt: string;
  updatedAt: string;
}

export interface Trigger {
  id: string;
  type: TriggerType;
  location: string;
  severity: 'yellow' | 'orange' | 'red';
  threshold: number;
  currentValue: number;
  active: boolean;
  affectedWorkers: string[];
  startedAt: string;
  endedAt?: string;
}

export interface Claim {
  id: string;
  workerId: string;
  policyId: string;
  triggerId: string;
  triggerType: TriggerType;
  status: ClaimStatus;
  fraudCheck: {
    passed: boolean;
    score: number;
    flags: string[];
    level: FraudLevel;
  };
  payoutAmount: number;
  deductionReason?: string;
  hoursAffected: number;
  hourlyRate: number;
  description: string;
  location: {
    lat: number;
    lng: number;
    zone: string;
  };
  triggeredAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  paidAt?: string;
  createdAt: string;
}

export interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  aqi: number;
  condition: string;
  timestamp: string;
}

export interface PremiumCalculation {
  basePremium: number;
  locationRiskAdjustment: number;
  activityAdjustment: number;
  behaviorAdjustment: number;
  seasonalAdjustment: number;
  finalPremium: number;
  maxCoverage: number;
  coverageHours: number;
}

export interface FraudCheckResult {
  passed: boolean;
  score: number;
  level: FraudLevel;
  flags: string[];
  recommendations: string[];
}

export interface RiskProfile {
  workerId: string;
  riskScore: number;
  riskZone: RiskZone;
  factors: {
    name: string;
    contribution: number;
    weight: number;
  }[];
  recommendations: string[];
}

export interface DashboardStats {
  totalWorkers: number;
  activePolicies: number;
  pendingClaims: number;
  totalPayouts: number;
  fraudRate: number;
  avgPremium: number;
  claimRate: number;
}

export interface WorkerDashboard {
  worker: Worker;
  policy: Policy | null;
  recentClaims: Claim[];
  earningsProtected: number;
  activeCoverage: number;
  upcomingRenewal: string;
  weeklyProgress: {
    hoursWorked: number;
    hoursProtected: number;
    earnings: number;
  };
}

export interface PaymentTransaction {
  id: string;
  claimId: string;
  amount: number;
  method: 'upi' | 'bank_transfer' | 'wallet';
  status: 'pending' | 'success' | 'failed';
  transactionRef: string;
  createdAt: string;
}
