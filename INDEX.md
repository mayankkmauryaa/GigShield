# GigShield - Complete Documentation

**AI-Powered Parametric Insurance Platform for India's Gig Economy**  
**Team XAX - Guidewire DEVTrails 2026**

---

## 📑 Master Index

| Document               | Description                      | Status      |
| ---------------------- | -------------------------------- | ----------- |
| [README.md](README.md) | Main project documentation       | ✅ Complete |
| [Phase1.md](Phase1.md) | Phase 1: Ideation & Foundation   | ✅ Complete |
| [Phase2.md](Phase2.md) | Phase 2: Automation & Protection | ✅ Complete |
| [Phase3.md](Phase3.md) | Phase 3: Scale & Optimize        | 📋 Planning |
| [deploy.md](deploy.md) | Deployment guide                 | ✅ Complete |

---

## 🚀 Quick Start

### Installation

```bash
# Clone repository
git clone https://github.com/your-repo/GigShield.git
cd GigShield

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## 🚀 Deployment

### Quick Deploy

```bash
# Method 1: Commit with "deploy"
git add .
git commit -m "deploy"
git push

# Method 2: Deploy Hook (no Git)
# Open this URL in browser:
# https://api.vercel.com/v1/integrations/deploy/prj_IGBjjwIWj873Llg5mqlyDIqUAZMd/ClZ9NyVVCp

# Method 3: Vercel CLI (Recommended)
vercel --prod
```

**Production URL**: https://guidewire.vercel.app

For detailed instructions, see [deploy.md](deploy.md).

### Demo Credentials

```
Worker Dashboard: /dashboard?workerId=worker-1
Admin Panel: /admin
Claims: /claims
Registration: /register
```

---

## 📁 Project Structure

```
GigShield/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Landing page
│   │   ├── register/          # Worker registration
│   │   ├── dashboard/         # Worker dashboard
│   │   ├── claims/            # Claims management
│   │   ├── admin/             # Admin panel
│   │   └── api/               # API routes
│   │       ├── workers/       # Worker CRUD
│   │       ├── policies/      # Policy management
│   │       ├── claims/        # Claims processing
│   │       ├── premium/       # Premium calculation
│   │       └── triggers/      # Trigger management
│   ├── components/            # React components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── AboutModal.tsx
│   │   ├── FraudDetectionPanel.tsx
│   │   ├── FooterNav.tsx
│   │   └── Icons.tsx
│   └── lib/                   # Core libraries
│       ├── types.ts           # TypeScript interfaces
│       ├── store.ts           # In-memory data store
│       ├── ai/
│       │   ├── premium-calculator.ts
│       │   ├── fraud-detector.ts
│       │   └── risk-model.ts
│       ├── triggers/
│       │   └── weather-trigger.ts
│       └── integrations/
│           ├── payment-sim.ts
│           └── weather-api.ts
├── Phase1.md                   # Phase 1 documentation
├── Phase2.md                   # Phase 2 documentation
├── Phase3.md                   # Phase 3 documentation
├── deploy.md                    # Deployment guide
└── README.md                   # Main documentation
```

---

## 📋 Phase Documentation Summary

### Phase 1: Ideation & Foundation

**Timeline:** March 4 - March 20, 2026

| Deliverable              | Status      |
| ------------------------ | ----------- |
| Problem Analysis         | ✅ Complete |
| Solution Architecture    | ✅ Complete |
| Core Features            | ✅ Complete |
| AI/ML Integration        | ✅ Complete |
| Fraud Detection Strategy | ✅ Complete |
| Adversarial Defense      | ✅ Complete |

**Key Achievements:**

- Built complete platform infrastructure
- Implemented 9 parametric triggers
- Created multi-layer fraud detection
- Added 6 delivery platforms
- Documented adversarial defense strategy

**Location:** [Phase1.md](Phase1.md)

---

### Phase 2: Automation & Protection

**Timeline:** March 21 - April 4, 2026

| Deliverable           | Status      |
| --------------------- | ----------- |
| Registration Process  | ✅ Complete |
| Policy Management     | ✅ Complete |
| Dynamic Premium       | ✅ Complete |
| Claims Management     | ✅ Complete |
| Auto-Claim Processing | ✅ Complete |
| Demo Video            | ⏳ Pending  |

**Key Achievements:**

- Enhanced trigger system (5 → 9)
- Multi-platform support expanded
- Admin simulation improved
- Zero-touch claim flow demonstrated
- Comprehensive demo script prepared

**Location:** [Phase2.md](Phase2.md)

---

### Phase 3: Scale & Optimize

**Timeline:** April 5 - April 17, 2026

| Deliverable              | Status      |
| ------------------------ | ----------- |
| Advanced Fraud Detection | 📋 Planning |
| Real Payment Integration | 📋 Planning |
| Predictive Analytics     | 📋 Planning |
| 5-Minute Demo Video      | 📋 Planning |
| Final Pitch Deck         | 📋 Planning |
| Final Submission         | ⏳ Pending  |

**Planned Features:**

- Advanced GPS spoofing detection
- Razorpay/Stripe integration
- ML-based predictive analytics
- Comprehensive admin dashboard
- Investor-ready pitch deck

**Location:** [Phase3.md](Phase3.md)

---

## 🎯 Features Overview

### Core Features

| Feature             | Description                | Phase |
| ------------------- | -------------------------- | ----- |
| Registration Wizard | 4-step worker onboarding   | 1     |
| Premium Calculator  | AI-powered dynamic pricing | 1     |
| Worker Dashboard    | Personalized coverage view | 1     |
| Claims Management   | Full claim lifecycle       | 1     |
| Admin Dashboard     | Platform analytics         | 1     |
| Trigger System      | 9 parametric triggers      | 1     |
| Auto-Claim          | Zero-touch claim creation  | 2     |
| Fraud Detection     | Multi-layer fraud check    | 1     |
| Payment Simulation  | UPI payout demo            | 1     |
| Weather Simulation  | Admin trigger testing      | 2     |

### AI/ML Modules

| Module               | Description               | Phase |
| -------------------- | ------------------------- | ----- |
| Premium Calculator   | Dynamic weekly pricing    | 1     |
| Fraud Detector       | GPS/ring fraud detection  | 1     |
| Risk Model           | Weather predictions       | 1     |
| Advanced Fraud       | Multi-signal verification | 3     |
| Predictive Analytics | Loss forecasting          | 3     |

### Parametric Triggers

| Trigger      | Type          | Threshold        | Phase |
| ------------ | ------------- | ---------------- | ----- |
| Rain         | Environmental | >25/40/50mm/hr   | 1     |
| Heat         | Environmental | >40/43/45°C      | 1     |
| Pollution    | Environmental | >200/250/300 AQI | 1     |
| Flood        | Environmental | Alert-based      | 1     |
| Curfew       | Social        | Alert-based      | 1     |
| App Outage   | Technical     | Alert-based      | 2     |
| Demand Surge | Technical     | Alert-based      | 2     |
| Traffic      | Urban         | >60/80/100%      | 2     |
| Strike       | Social        | Alert-based      | 2     |

---

## 💻 Technology Stack

| Layer    | Technology                       |
| -------- | -------------------------------- |
| Frontend | Next.js 14, React 18, TypeScript |
| Styling  | Tailwind CSS                     |
| State    | In-memory Map store              |
| API      | Next.js App Router               |
| Charts   | Recharts                         |
| Icons    | Material Symbols                 |

---

## 📊 Key Metrics

### Platform Statistics

| Metric             | Value     |
| ------------------ | --------- |
| Active Workers     | 1,247     |
| Active Policies    | 1,180     |
| Total Claims       | 523       |
| Claims Paid        | 312       |
| Fraud Detected     | 47        |
| Total Payout       | ₹4,82,000 |
| Premiums Collected | ₹8,35,000 |
| Loss Ratio         | 35.7%     |

### Technical Statistics

| Metric        | Value  |
| ------------- | ------ |
| API Routes    | 5      |
| Pages         | 5      |
| Components    | 6      |
| AI Modules    | 3      |
| Triggers      | 9      |
| Cities        | 10     |
| Platforms     | 6      |
| Lines of Code | ~3,500 |

---

## 🏆 Competition Progress

### Timeline

```
Week 1-2: March 4-20    ████████████████████ Phase 1 Complete ✅
Week 3-4: March 21-Apr 4 ░░░░░░░░░░░░░░░░░░░ Phase 2 In Progress
Week 5-6: April 5-17    ░░░░░░░░░░░░░░░░░░░ Phase 3 Upcoming
```

### Deliverables Status

| Phase | Deliverable       | Status      |
| ----- | ----------------- | ----------- |
| 1     | README.md         | ✅ Complete |
| 1     | Git Repository    | ✅ Ready    |
| 1     | Core Features     | ✅ Complete |
| 2     | 2-min Demo Video  | ⏳ Pending  |
| 3     | 5-min Final Video | ⏳ Pending  |
| 3     | Final Pitch Deck  | ⏳ Pending  |

---

## 🎓 Learning Resources

### Documentation

- [Phase 1 Details](Phase1.md) - Foundation and ideation
- [Phase 2 Details](Phase2.md) - Automation walkthrough
- [Phase 3 Plan](Phase3.md) - Scale and optimization

### Problem Statement

- AI-Powered Insurance for India's Gig Economy
- Targeting food delivery partners
- Weekly pricing model
- Income loss protection only

### Economy Guide

- DC 1,00,000 starting capital
- DC 75,000 total burn
- Funding rounds at phase end
- CTF and quiz opportunities

---

## 👥 Team XAX

| Member        | Role      |
| ------------- | --------- |
| Mayank Maurya | Team Lead |
| Mohit Jadon   | Developer |
| Aditya Kumar  | Developer |
| Mukul Sharma  | Developer |

---

## 📞 Contact

- **Competition:** Guidewire DEVTrails 2026
- **Partner:** EY
- **Event:** DEVTrails 2026: Unicorn Chase

---

## 📝 License

This project was built for the Guidewire DEVTrails 2026 competition.

---

_Last Updated: March 20, 2026_  
_Documentation Version: 1.0_  
_Project Status: Phase 1 Complete, Phase 2 In Progress_
