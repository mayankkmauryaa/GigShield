# GigShield - Complete Project Documentation

## Project Overview
**GigShield** is an AI-powered parametric insurance platform for India's gig economy (food delivery partners). It protects delivery workers from income loss due to weather disruptions.

**Tech Stack:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- In-memory data store

---

## Page Routes

### 1. `/` - Landing Page (`src/app/page.tsx`)
**Purpose:** Main landing page showcasing the platform

**Components:**
- Hero section with gradient background
- Stats cards showing platform metrics
- "How GigShield Works" 3-step process cards
- Weather monitoring section with city selector
- "Parametric Triggers" grid showing 6 trigger types
- CTA section for registration

**Features:**
- Real-time weather display for 7 cities
- Active weather alerts display
- Stats: Active Workers, Active Policies, Total Payouts, Pending Claims

---

### 2. `/register` - Registration Page (`src/app/register/page.tsx`)
**Purpose:** Worker onboarding with 4-step wizard

**Steps:**
- **Step 1:** Personal Information (name, phone, email, aadhaar)
- **Step 2:** Platform selection (Zomato/Swiggy/Both) + City selection
- **Step 3:** Weekly earnings input (earnings, hours)
- **Step 4:** Premium preview with policy creation

**Features:**
- 10 cities with risk zones (Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Kolkata, Pune, Ahmedabad, Jaipur, Lucknow)
- Dynamic premium calculation
- Policy auto-creation on submission
- Redirect to dashboard with worker ID

**Form Validation:**
- Name required
- Phone required
- Aadhaar: exactly 12 digits
- Platform required
- City required

---

### 3. `/dashboard` - Worker Dashboard (`src/app/dashboard/page.tsx`)
**Purpose:** Individual worker's dashboard

**Sections:**
- Welcome header with worker name
- Stats cards: Coverage, Weekly Premium, Total Protected, Claims This Week
- Policy info card showing coverage details
- "Risk Insights" section with current/upcoming risk
- Active triggers in worker's city
- Recent claims history table

**Features:**
- URL param: `?workerId=xxx`
- Time filter: All/Week/Month
- Displays worker-specific data
- Shows payout predictions

---

### 4. `/claims` - Claims Management (`src/app/claims/page.tsx`)
**Purpose:** View and manage all claims

**Stats Cards:**
- Total Claims, Pending, Approved, Paid, Fraud, Total Payout

**Features:**
- Search by claim ID, worker name, or city
- Filter by status
- Sort by date
- Claim detail modal with:
  - Claim ID, Status, Worker info
  - Trigger type, Hours affected, Payout amount
  - Fraud analysis results
  - Location data
- Actions: Pay (UPI), Reject
- Processing state indicators

---

### 5. `/admin` - Admin Dashboard (`src/app/admin/page.tsx`)
**Purpose:** Platform analytics and controls

**Tabs:**

#### Overview Tab
- **Stats Cards:** Total Workers, Active Policies, Weekly Premiums, Gross Margin
- **Claims by Status:** Visual bar chart with counts
- **Claims by Trigger:** Rain/Heat/Pollution breakdown
- **City Risk Overview:** 10 cities with risk scores (0-100)
- **Active Weather Triggers:** List of current triggers

#### Workers Tab
- Worker distribution stats
- Platform breakdown (Zomato/Swiggy/Both)
- Risk zone distribution
- Workers list table with: Name, Phone, City, Platform, Risk Zone, Status, Earnings

#### Simulation Tab
- Weather event simulator
- City selector (10 cities)
- Trigger type (rain/heat/pollution)
- Severity (orange/red)
- Triggers weather event and auto-creates claims
- Results display with claim count and affected workers

#### Defense Tab
- GPS Spoofing & Ring Fraud Detection panel
- "Run Fraud Scan" button to analyze all claims
- "Simulate Attack" to demo fraud detection
- Suspicious claims display with:
  - Claim ID, Risk score
  - Evidence flags (GPS mismatch, teleport, etc.)
  - Payout amount, Hours affected
- Ring fraud alerts showing coordinated attacks
- Defense mechanisms explanation

---

## API Routes

### `/api/workers` (`src/app/api/workers/route.ts`)
**Methods:** GET, POST

**GET:**
- Returns all workers
- Response: `{ workers: Worker[] }`

**POST:**
- Creates new worker
- Body: `{ name, phone, email, aadhaar, platform, city, zoneId, location, riskZone, avgWeeklyEarnings, avgWeeklyHours }`
- Auto-generates: id, behaviorScore, tenure, status, registeredAt, lastActiveAt

---

### `/api/policies` (`src/app/api/policies/route.ts`)
**Methods:** GET, POST

**GET:**
- Returns all policies

**POST:**
- Creates policy for worker
- Requires: workerId
- Auto-calculates premium using AI
- Generates: policyNumber, id, createdAt, updatedAt

---

### `/api/claims` (`src/app/api/claims/route.ts`)
**Methods:** GET, POST

**GET:**
- Query params: `workerId`, `status`
- Returns filtered claims

**POST:**
- Creates new claim
- Body: `{ workerId, triggerType, triggerId, hoursAffected, description, location }`
- Auto-runs fraud detection
- Auto-approves if fraud check passes

---

### `/api/premium` (`src/app/api/premium/route.ts`)
**Methods:** GET, POST

**GET/POST:**
- Requires: workerId
- Returns:
  - Premium calculation (base, adjustments, final)
  - Risk profile
  - Claim probability
  - Optimal coverage suggestions

---

### `/api/triggers` (`src/app/api/triggers/route.ts`)
**Methods:** GET, POST

**GET:**
- Query param: `active=true`
- Returns triggers and summary

**POST - Actions:**
- `action: "check"` - Check weather for city
- `action: "simulate"` - Create weather event
- `action: "create"` - Manual trigger creation
- `action: "forecast"` - 7-day weather forecast

---

## Core Libraries

### Data Store (`src/lib/store.ts`)
**Functions:**
- `getWorkers()`, `getWorker(id)`, `createWorker()`, `updateWorker()`
- `getPolicies()`, `getPolicy(id)`, `getPolicyByWorker(workerId)`, `createPolicy()`, `updatePolicy()`
- `getClaims()`, `getClaim(id)`, `getClaimsByWorker(workerId)`, `createClaim()`, `updateClaim()`
- `getTriggers()`, `getActiveTriggers()`, `createTrigger()`, `updateTrigger()`
- `createPayment()`
- `getDashboardStats()` - Platform metrics
- `getWeatherData(city)` - Weather for 10 cities
- `initializeSampleData()` - Creates demo data

**Sample Data:**
- 15 worker names
- 10 Indian cities
- Auto-generates 2-4 workers per city

---

### AI Modules

#### Premium Calculator (`src/lib/ai/premium-calculator.ts`)
**Functions:**
- `calculatePremium(worker)` - Returns:
  - basePremium, riskAdjustments, finalPremium
  - maxCoverage, coverageHours, hourlyRate
  - breakdown of calculations
- `generateRiskProfile(worker)` - Risk category & factors
- `predictClaimProbability(worker)` - Weekly prediction
- `suggestOptimalCoverage(worker)` - Coverage recommendations

**Pricing Model:**
- Base: ₹35-₹45
- City risk multiplier: 0.8-1.4x
- Platform multiplier: 0.9-1.1x
- Tenure discount: up to 15%
- Behavior score: up to 10% discount

---

#### Fraud Detector (`src/lib/ai/fraud-detector.ts`)
**Functions:**
- `analyzeFraud(claim)` - Full fraud analysis
- `detectGPSSpoofing(claim, worker)` - GPS validation
- `detectRingFraud(location, type, time)` - Coordinated attack detection

**Detection Methods:**
- GPS location mismatch
- Velocity/teleport detection
- Duplicate claims
- Claim frequency anomalies
- Ring clustering (same time/location)

---

#### Risk Model (`src/lib/ai/risk-model.ts`)
**Functions:**
- `generateWeatherForecast(city, days)` - 7-day forecast
- `predictWeeklyPayout(worker)` - Payout predictions
- `calculateZoneRisk(zones)` - Zone risk assessment
- `generateRiskInsights(worker)` - Personalized recommendations

---

### Triggers (`src/lib/triggers/weather-trigger.ts`)
**Functions:**
- `checkWeatherTriggers(city)` - Check if triggers activate
- `processAutomaticClaims(trigger)` - Auto-create claims for affected workers
- `simulateWeatherEvent(city, type, severity, value)` - Demo trigger
- `getTriggerSummary()` - Platform trigger stats

**Trigger Types:**
- Rain: >25mm/hr (orange), >50mm/hr (red)
- Heat: >40°C (orange), >45°C (red)
- Pollution: AQI >200 (orange), >300 (red)

---

### Integrations

#### Payment Simulation (`src/lib/integrations/payment-sim.ts`)
**Functions:**
- `processPayment(claimId, method)` - Process UPI payment
- `processBulkPayments(claimIds)` - Batch processing
- `validateUPIAddress(upiId)` - UPI format validation
- `getPaymentStatus(transactionId)` - Check status
- `initiatePayoutSimulation(claimId, upiId)` - Start payout
- `confirmPayoutWithOTP(referenceId, otp)` - Complete with OTP

**Features:**
- 95% success rate simulation
- Fraud hold: 10% (low), 20% (medium)
- Processing time: 500-1500ms

---

#### Weather API (`src/lib/integrations/weather-api.ts`)
**Functions:**
- `fetchWeatherData(city)` - Current weather
- `fetchWeatherForecast(city, days)` - Multi-day forecast
- `getWeatherAlert(city)` - Active alerts
- `getHistoricalWeather(city, startDate, endDate)` - Historical data

**Data for 10 cities:**
- Mumbai, Delhi, Bangalore, Chennai, Hyderabad
- Kolkata, Pune, Ahmedabad, Jaipur, Lucknow

---

## Components

### 1. FooterNav (`src/components/FooterNav.tsx`)
- GigShield logo
- Quick Links (Home, Register, Dashboard, Claims, About Us)
- Competition info line
- Team details

### 2. AboutModal (`src/components/AboutModal.tsx`)
- Competition details (Event, Partner, Phase, Deadline)
- Team XAX member list
- What we built list
- Glassmorphism popup with backdrop

### 3. FraudDetectionPanel (`src/components/FraudDetectionPanel.tsx`)
- Run Fraud Scan button
- Simulate Attack button
- Suspicious claims display
- Ring fraud alerts
- Defense mechanisms info

### 4. Icons (`src/components/Icons.tsx`)
SVG icons:
- shield, dashboard, document, settings
- user, users, check, close
- arrowRight, arrowLeft, plus, refresh
- search, download, trendingUp/trendingDown
- alert, checkCircle, xCircle, clock
- mapPin, calendar, dollar, activity, zap
- umbrella, sun, cloud, wind

---

## Types (`src/lib/types.ts`)

```typescript
Worker, Policy, Claim, Trigger, PaymentTransaction
WeatherData, DashboardStats, DeliveryPlatform
RiskProfile, ClaimProbability, CoverageSuggestion
```

---

## Configuration Files

### `tailwind.config.ts`
- Content paths
- Custom colors (primary: indigo)
- Animations (pulse-slow, slide-up, fade-in)

### `globals.css`
- Tailwind base
- Custom component classes (.btn-primary, .card, .input, .stat-card, .badge)
- Glassmorphism classes (.glass, .glass-card, .glass-stat)
- Skeleton loading animation

---

## File Structure Summary

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── register/page.tsx      # Registration wizard
│   ├── dashboard/page.tsx    # Worker dashboard
│   ├── claims/page.tsx       # Claims management
│   ├── admin/page.tsx        # Admin with 4 tabs
│   ├── layout.tsx            # Root layout
│   ├── ClientLayout.tsx      # Client wrapper
│   └── api/
│       ├── workers/route.ts
│       ├── policies/route.ts
│       ├── claims/route.ts
│       ├── premium/route.ts
│       └── triggers/route.ts
├── components/
│   ├── Icons.tsx
│   ├── FooterNav.tsx
│   ├── AboutModal.tsx
│   └── FraudDetectionPanel.tsx
└── lib/
    ├── store.ts
    ├── types.ts
    ├── ai/
    │   ├── premium-calculator.ts
    │   ├── fraud-detector.ts
    │   └── risk-model.ts
    ├── integrations/
    │   ├── payment-sim.ts
    │   └── weather-api.ts
    └── triggers/
        └── weather-trigger.ts
```

---

## Features Summary

| Feature | Status |
|---------|--------|
| Worker Registration | ✅ |
| Policy Creation with AI Premium | ✅ |
| Weekly Pricing Model (₹25-100) | ✅ |
| 5 Parametric Triggers | ✅ |
| Auto-claim Processing | ✅ |
| GPS Spoofing Detection | ✅ |
| Ring Fraud Detection | ✅ |
| UPI Payment Simulation | ✅ |
| Weather Simulation | ✅ |
| Admin Analytics Dashboard | ✅ |
| Defense System Panel | ✅ |
| About Us Modal | ✅ |
| Glassmorphism UI | ✅ |

---

**All routes and components documented!** ✅