'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createWorker, createPolicy } from '@/lib/store';
import { calculatePremium } from '@/lib/ai/premium-calculator';
import { Worker, DeliveryPlatform, RiskZone } from '@/lib/types';
import { formatCurrency } from '@/lib/integrations/payment-sim';

const CITIES = [
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, riskZone: 'high' as RiskZone },
  { name: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025, riskZone: 'high' as RiskZone },
  { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946, riskZone: 'medium' as RiskZone },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, riskZone: 'medium' as RiskZone },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, riskZone: 'medium' as RiskZone },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, riskZone: 'high' as RiskZone },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, riskZone: 'high' as RiskZone },
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, riskZone: 'medium' as RiskZone },
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, riskZone: 'medium' as RiskZone },
  { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, riskZone: 'medium' as RiskZone },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    aadhaar: '',
    platform: '' as DeliveryPlatform | '',
    city: '',
    avgWeeklyEarnings: 15000,
    avgWeeklyHours: 50,
  });
  const [previewPremium, setPreviewPremium] = useState<{
    finalPremium: number;
    maxCoverage: number;
    coverageHours: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'avgWeeklyEarnings' || name === 'avgWeeklyHours' ? parseInt(value) || 0 : value,
    }));

    if (name === 'city') {
      setPreviewPremium(null);
    }
  };

  useEffect(() => {
    if (step === 3 && formData.city && formData.platform) {
      previewPremiumCalc();
    }
  }, [formData.avgWeeklyEarnings, formData.avgWeeklyHours, formData.city, formData.platform, step]);

  const previewPremiumCalc = () => {
    const city = CITIES.find(c => c.name === formData.city);
    if (!city || !formData.platform) return;

    const mockWorker: Worker = {
      id: 'preview',
      name: formData.name || 'Preview Worker',
      phone: formData.phone || '+910000000000',
      email: formData.email || 'preview@example.com',
      aadhaarNumber: formData.aadhaar || '000000000000',
      platform: formData.platform as DeliveryPlatform,
      zoneId: `zone-${city.name.toLowerCase()}-1`,
      location: {
        city: city.name,
        state: city.state,
        pincode: '000000',
        lat: city.lat,
        lng: city.lng,
      },
      riskZone: city.riskZone,
      behaviorScore: 80,
      avgWeeklyEarnings: formData.avgWeeklyEarnings,
      avgWeeklyHours: formData.avgWeeklyHours,
      tenure: 1,
      status: 'active',
      registeredAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    const premium = calculatePremium(mockWorker);
    setPreviewPremium({
      finalPremium: premium.finalPremium,
      maxCoverage: premium.maxCoverage,
      coverageHours: premium.coverageHours,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const city = CITIES.find(c => c.name === formData.city);
      if (!city) {
        setError('Please select your city');
        setLoading(false);
        return;
      }

      const workerData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        aadhaarNumber: formData.aadhaar,
        platform: formData.platform as DeliveryPlatform,
        zoneId: `zone-${city.name.toLowerCase()}-${Date.now()}`,
        location: {
          city: city.name,
          state: city.state,
          pincode: `${Math.floor(Math.random() * 900000) + 100000}`,
          lat: city.lat + (Math.random() - 0.5) * 0.1,
          lng: city.lng + (Math.random() - 0.5) * 0.1,
        },
        riskZone: city.riskZone,
        behaviorScore: 80,
        avgWeeklyEarnings: formData.avgWeeklyEarnings,
        avgWeeklyHours: formData.avgWeeklyHours,
        tenure: 1,
        status: 'active' as const,
      };

      const worker = createWorker(workerData);
      
      const premium = calculatePremium({
        ...worker,
        registeredAt: worker.registeredAt,
        lastActiveAt: worker.lastActiveAt,
      });
      
      createPolicy({
        workerId: worker.id,
        policyNumber: `GS-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        status: 'active',
        weeklyPremium: premium.finalPremium,
        maxCoverage: premium.maxCoverage,
        coverageHours: premium.coverageHours,
        hourlyRate: Math.floor(formData.avgWeeklyEarnings / premium.coverageHours),
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        autoRenew: true,
        triggers: ['rain', 'heat', 'pollution', 'flood'],
      });

      router.push(`/dashboard?workerId=${worker.id}`);
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Registration failed. Please try again.');
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/30 flex flex-col">
      <main className="flex-grow pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-12 text-center md:text-left animate-fade-in">
            <h1 className="font-headline text-5xl md:text-6xl text-primary font-extrabold tracking-tighter mb-4">Secure your hustle.</h1>
            <p className="text-on-surface/80 font-body text-lg max-w-xl">Complete your registration in four simple steps and activate your kinetic protection today.</p>
          </div>

          {/* Progress Wizard */}
          <div className="mb-12 animate-slide-up">
            <div className="flex justify-between mb-4 px-2">
              {[
                { n: 1, label: 'Identity', icon: 'person' },
                { n: 2, label: 'Platform', icon: 'delivery_dining' },
                { n: 3, label: 'Earnings', icon: 'payments' },
                { n: 4, label: 'Preview', icon: 'shield_with_heart' },
              ].map((s) => (
                <div key={s.n} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                    step >= s.n ? 'kinetic-gradient text-on-primary' : 'bg-surface-container-high text-on-surface/40'
                  }`}>
                    {step > s.n ? <span className="material-symbols-outlined text-sm">check</span> : s.n}
                  </div>
                  <span className={`text-[10px] uppercase tracking-widest font-black ${
                    step >= s.n ? 'text-primary' : 'text-on-surface/50'
                  }`}>{s.label}</span>
                </div>
              ))}
            </div>
            <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div 
                className="h-full kinetic-gradient transition-all duration-700 ease-out" 
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-error/10 border border-error/20 rounded-xl text-error flex items-center gap-3 animate-shake">
              <span className="material-symbols-outlined">warning</span>
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {/* Registration Form Canvas */}
          <div className="glass-card rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
            {/* Decorative element */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Left: Form Fields */}
              <div className="space-y-8 min-h-[400px] flex flex-col">
                {step === 1 && (
                  <div className="space-y-8 animate-fade-in flex-grow">
                    <h2 className="font-headline text-3xl font-black text-white mb-8">Personal Information</h2>
                    <div className="space-y-10">
                      <div className="relative group">
                        <label className="block text-[10px] uppercase tracking-widest font-black text-primary mb-3">Full Legal Name</label>
                        <input 
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full bg-transparent border-0 border-b border-outline-variant py-3 focus:ring-0 focus:border-primary transition-all font-body text-on-surface placeholder:text-on-surface/30 text-lg" 
                          placeholder="Arjun Sharma"
                        />
                      </div>
                      <div className="relative group">
                        <label className="block text-[10px] uppercase tracking-widest font-black text-primary mb-3">Phone Number</label>
                        <input 
                          type="tel" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full bg-transparent border-0 border-b border-outline-variant py-3 focus:ring-0 focus:border-primary transition-all font-body text-on-surface placeholder:text-on-surface/30 text-lg" 
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div className="relative group">
                        <label className="block text-[10px] uppercase tracking-widest font-black text-primary mb-3">Aadhaar (12 Digits)</label>
                        <input 
                          type="text" 
                          name="aadhaar"
                          value={formData.aadhaar}
                          onChange={handleChange}
                          maxLength={12}
                          className="w-full bg-transparent border-0 border-b border-outline-variant py-3 focus:ring-0 focus:border-primary transition-all font-body text-on-surface tracking-[0.3em] placeholder:text-on-surface/30 text-lg" 
                          placeholder="000000000000"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8 animate-fade-in flex-grow">
                    <h2 className="font-headline text-3xl font-black text-white mb-8">Platform & Network</h2>
                    <div className="space-y-8">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-black text-primary mb-5">Select Your Primary Partner</label>
                        <div className="grid grid-cols-2 gap-4">
                          {(['zomato', 'swiggy', 'both'] as const).map(p => (
                            <button
                              key={p}
                              onClick={() => setFormData(prev => ({ ...prev, platform: p }))}
                              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all group ${
                                formData.platform === p 
                                  ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10' 
                                  : 'bg-surface-container-low/30 border-white/5 text-on-surface/60 hover:border-white/20'
                              }`}
                            >
                              <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">
                                {p === 'zomato' ? 'restaurant' : p === 'swiggy' ? 'delivery_dining' : 'rocket_launch'}
                              </span>
                              <span className="text-[10px] font-black uppercase tracking-widest">{p}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="relative group">
                        <label className="block text-[10px] uppercase tracking-widest font-black text-primary mb-3">City of Operation</label>
                        <select 
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full bg-surface-container-low border-0 border-b border-outline-variant py-4 focus:ring-0 focus:border-primary transition-all font-body text-on-surface rounded-t-xl"
                        >
                          <option value="">Choose your city</option>
                          {CITIES.map(c => (
                            <option key={c.name} value={c.name}>{c.name}, {c.state}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8 animate-fade-in flex-grow">
                    <h2 className="font-headline text-3xl font-black text-white mb-8">Earnings Intelligence</h2>
                    <div className="space-y-10">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <label className="block text-[10px] uppercase tracking-widest font-black text-primary">Avg. Weekly Earnings</label>
                          <span className="text-xl font-headline font-black text-on-surface">{formatCurrency(formData.avgWeeklyEarnings)}</span>
                        </div>
                        <input 
                          type="range" 
                          name="avgWeeklyEarnings"
                          min="5000" 
                          max="40000" 
                          step="500"
                          value={formData.avgWeeklyEarnings}
                          onChange={handleChange}
                          className="w-full h-1.5 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between mt-2 text-[8px] font-black uppercase text-on-surface/50 tracking-widest">
                          <span>₹5,000</span>
                          <span>₹40,000</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <label className="block text-[10px] uppercase tracking-widest font-black text-primary">Weekly Active Hours</label>
                          <span className="text-xl font-headline font-black text-on-surface">{formData.avgWeeklyHours} hrs</span>
                        </div>
                        <input 
                          type="range" 
                          name="avgWeeklyHours"
                          min="20" 
                          max="84" 
                          step="1"
                          value={formData.avgWeeklyHours}
                          onChange={handleChange}
                          className="w-full h-1.5 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-secondary"
                        />
                        <div className="flex justify-between mt-2 text-[8px] font-black uppercase text-on-surface/50 tracking-widest">
                          <span>20 HRS</span>
                          <span>84 HRS</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-8 animate-fade-in flex-grow">
                    <h2 className="font-headline text-3xl font-black text-white mb-8">Quote Preview</h2>
                    <div className="space-y-6">
                      <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20 relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                          <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                        </div>
                        <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em] mb-4">Weekly Kinetic Premium</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-headline font-black text-white">
                            {previewPremium ? formatCurrency(previewPremium.finalPremium) : '₹---'}
                          </span>
                          <span className="text-sm font-bold text-primary">/ week</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-surface-container-lowest/50 rounded-xl border border-white/5">
                          <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Max Coverage</p>
                          <p className="text-lg font-headline font-black">{previewPremium ? formatCurrency(previewPremium.maxCoverage) : '—'}</p>
                        </div>
                        <div className="p-4 bg-surface-container-lowest/50 rounded-xl border border-white/5">
                          <p className="text-[8px] font-black text-on-surface/50 uppercase tracking-widest mb-1">Impact Threshold</p>
                          <p className="text-lg font-headline font-black text-secondary">5mm Rain</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-12 flex items-center justify-between mt-auto">
                  <button 
                    onClick={prevStep}
                    disabled={step === 1 || loading}
                    className={`font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all ${
                      step === 1 ? 'opacity-0' : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                  </button>
                  
                  {step < 4 ? (
                    <button 
                      onClick={nextStep}
                      disabled={
                        (step === 1 && (!formData.name || !formData.phone || formData.aadhaar.length !== 12)) ||
                        (step === 2 && (!formData.platform || !formData.city))
                      }
                      className="kinetic-gradient px-10 py-4 rounded-xl font-headline font-black text-white shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:scale-100 uppercase tracking-widest text-xs"
                    >
                      Continue <span className="material-symbols-outlined font-black text-sm">arrow_forward</span>
                    </button>
                  ) : (
                    <button 
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-secondary text-on-secondary px-10 py-4 rounded-xl font-headline font-black shadow-xl shadow-secondary/20 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 uppercase tracking-widest text-xs"
                    >
                      {loading ? 'Initializing Protocol...' : 'Activate Coverage'}
                      <span className="material-symbols-outlined font-black text-sm">bolt</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right: Info Panel (Contextual) */}
              <div className="hidden md:flex flex-col bg-surface-container-lowest/40 rounded-2xl p-8 border border-white/5 relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-2xl rounded-full"></div>
                
                <div className="mb-10">
                  <span className="material-symbols-outlined text-secondary text-5xl mb-6 block transition-transform group-hover:rotate-12" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {step === 1 ? 'verified_user' : step === 2 ? 'hub' : step === 3 ? 'monitoring' : 'rocket'}
                  </span>
                  <h3 className="font-headline text-2xl font-black text-white mb-3">
                    {step === 1 ? 'Identity Shield' : step === 2 ? 'Network Nodes' : step === 3 ? 'Income Pulse' : 'Coverage Launch'}
                  </h3>
                  <p className="text-on-surface/70 text-sm leading-relaxed font-bold">
                    {step === 1 ? 'Your data is protected by AES-256 encryption. We utilize hardware-level security modules for KYC validation.' : 
                     step === 2 ? 'GigShield integrates directly with local weather stations and platform APIs to verify operational status.' : 
                     step === 3 ? 'Our AI analyzes local risk vectors and historical earnings to calibrate your personalized protection levels.' : 
                     'Review your kinetic quote. Once activated, your protection pulse begins immediately with automated payouts.'}
                  </p>
                </div>
                
                <div className="space-y-5 mt-auto">
                  <div className="flex items-start gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="material-symbols-outlined text-primary-container text-lg">lock</span>
                    <span className="text-[10px] text-on-surface/70 font-black uppercase tracking-widest pt-1">Encryption Protocol Active</span>
                  </div>
                  <div className="flex items-start gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="material-symbols-outlined text-primary-container text-lg">account_balance</span>
                    <span className="text-[10px] text-on-surface/70 font-black uppercase tracking-widest pt-1">EY Partnered Architecture</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Preview for Next Steps (Teaser) */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className={`bg-surface-container-low rounded-2xl p-6 border border-white/5 transition-all duration-500 ${step > 2 ? 'opacity-30 scale-95' : 'opacity-100 scale-100 shadow-xl'}`}>
              <span className="material-symbols-outlined text-primary mb-4 text-3xl">delivery_dining</span>
              <h4 className="font-headline font-black text-white mb-2">Platform Context</h4>
              <p className="text-[10px] text-on-surface/60 font-bold uppercase tracking-widest">Zomato / Swiggy Network</p>
            </div>
            <div className={`bg-surface-container-low rounded-2xl p-6 border border-white/5 transition-all duration-500 ${step > 3 ? 'opacity-30 scale-95' : step === 3 ? 'opacity-100 scale-100 shadow-xl border-primary/30' : 'opacity-50'}`}>
              <span className="material-symbols-outlined text-primary mb-4 text-3xl">analytics</span>
              <h4 className="font-headline font-black text-white mb-2">Earnings Audit</h4>
              <p className="text-[10px] text-on-surface/60 font-bold uppercase tracking-widest">Connect Payout Metrics</p>
            </div>
            <div className={`bg-surface-container-low rounded-2xl p-6 border border-white/5 transition-all duration-500 ${step === 4 ? 'opacity-100 scale-100 shadow-xl border-primary/30' : 'opacity-50'}`}>
              <span className="material-symbols-outlined text-primary mb-4 text-3xl">shield_with_heart</span>
              <h4 className="font-headline font-black text-white mb-2">Kinetic Launch</h4>
              <p className="text-[10px] text-on-surface/60 font-bold uppercase tracking-widest">Review Kinetic Quote</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
