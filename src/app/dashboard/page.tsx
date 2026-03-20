'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getWorker, getPolicyByWorker, getClaimsByWorker, getWeatherData, getActiveTriggers } from '@/lib/store';
import { generateRiskInsights, predictWeeklyPayout } from '@/lib/ai/risk-model';
import { Worker, Policy, Claim, WeatherData, Trigger } from '@/lib/types';
import { formatCurrency } from '@/lib/integrations/payment-sim';
import { TriggerWidget } from '@/components/TriggerWidget';

function DashboardContent() {
  const searchParams = useSearchParams();
  const workerId = searchParams.get('workerId');
  
  const [worker, setWorker] = useState<Worker | null>(null);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [riskInsights, setRiskInsights] = useState<{
    currentRisk: string;
    upcomingRisk: string;
    recommendations: string[];
    savingsOpportunity?: string;
  } | null>(null);
  const [payoutPrediction, setPayoutPrediction] = useState<{
    expectedPayout: number;
    bestCase: number;
    worstCase: number;
  } | null>(null);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    if (workerId) {
      const w = getWorker(workerId);
      if (w) {
        setWorker(w);
        setPolicy(getPolicyByWorker(w.id) || null);
        setClaims(getClaimsByWorker(w.id));
        setWeather(getWeatherData(w.location.city));
        setRiskInsights(generateRiskInsights(w));
        setPayoutPrediction(predictWeeklyPayout(w));
      }
    } else {
      const workers = require('@/lib/store').getWorkers();
      if (workers.length > 0) {
        const w = workers[0];
        setWorker(w);
        setPolicy(getPolicyByWorker(w.id) || null);
        setClaims(getClaimsByWorker(w.id));
        setWeather(getWeatherData(w.location.city));
        setRiskInsights(generateRiskInsights(w));
        setPayoutPrediction(predictWeeklyPayout(w));
      }
    }
    
    setTriggers(getActiveTriggers());
  }, [workerId]);

  if (!worker) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="glass-card p-12 rounded-2xl max-w-md w-full text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl text-primary">person_off</span>
            </div>
            <h2 className="text-3xl font-headline font-bold text-on-surface mb-4">No Worker Found</h2>
            <p className="text-on-surface/70 mb-8 leading-relaxed">
              We couldn&apos;t locate your profile. Please register to access your personalized protection dashboard.
            </p>
            <a href="/register" className="inline-block w-full px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
              Register Now
            </a>
          </div>
        </div>
      </div>
    );
  }

  const filteredClaims = claims.filter(c => {
    if (timeFilter === 'all') return true;
    const daysDiff = (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return timeFilter === 'week' ? daysDiff <= 7 : daysDiff <= 30;
  });

  const totalPaid = claims.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.payoutAmount, 0);
  const activeTriggerForCity = triggers.find(t => t.location === worker.location.city);

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/30">
      <main className="pt-24 pb-12 px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
          <div>
            <p className="text-primary font-label tracking-[0.1em] uppercase mb-2 text-xs font-bold">Worker Portal / {worker.platform}</p>
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-on-surface">Welcome back, {worker.name.split(' ')[0]}!</h1>
            <p className="text-on-surface-variant mt-1 text-sm">{worker.location.city} • Active Monitoring Enabled</p>
          </div>
          <div className="flex items-center gap-3 bg-secondary-container/10 px-5 py-2.5 rounded-full border border-secondary/20 glass-card">
            <div className="w-2.5 h-2.5 bg-secondary rounded-full pulse-dot"></div>
            <span className="text-xs font-bold text-secondary tracking-widest uppercase">Kinetic Protection Live</span>
          </div>
        </header>

        {/* Status Messenger for Alerts */}
        {activeTriggerForCity && (
          <div className={`mb-8 glass-card p-6 rounded-2xl border-l-[6px] animate-slide-up ${
            activeTriggerForCity.severity === 'red' ? 'border-l-error bg-error/5' : 'border-l-secondary bg-secondary/5'
          }`}>
            <div className="flex items-start gap-5">
              <div className={`p-3 rounded-xl ${
                activeTriggerForCity.severity === 'red' ? 'bg-error text-on-error' : 'bg-secondary text-on-secondary'
              }`}>
                <span className="material-symbols-outlined">
                  {activeTriggerForCity.type === 'rain' ? 'rainy' : 
                   activeTriggerForCity.type === 'heat' ? 'thermostat' : 'foggy'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded ${
                    activeTriggerForCity.severity === 'red' ? 'bg-error/20 text-error' : 'bg-secondary/20 text-secondary'
                  }`}>
                    {activeTriggerForCity.severity} severity ALERT
                  </span>
                  <p className="font-headline font-bold text-lg">
                    {activeTriggerForCity.type.charAt(0).toUpperCase() + activeTriggerForCity.type.slice(1)} threshold crossed in {worker.location.city}
                  </p>
                </div>
                <p className="text-on-surface/60 text-sm">
                  Detected value: <span className="text-on-surface font-bold">{activeTriggerForCity.currentValue}</span> | 
                  Trigger point: <span className="text-on-surface font-bold">{activeTriggerForCity.threshold}</span>
                </p>
                <div className="flex items-center gap-2 mt-3 text-secondary text-xs font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  Coverage active. Claims processing automatically.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between group hover:border-secondary/30 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-secondary/10 rounded-xl group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              </div>
              <span className="text-[10px] font-black text-on-surface/50 uppercase tracking-widest">Insurance Status</span>
            </div>
            <div>
              <h3 className="text-2xl font-headline font-black text-on-surface">Active Protection</h3>
              <p className="text-xs text-on-surface/60 mt-1 font-bold">Guardian Protocol Enforced</p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between border-l-4 border-l-primary group hover:border-primary/30 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary">payments</span>
              </div>
              <span className="text-[10px] font-black text-on-surface/50 uppercase tracking-widest">Current Premium</span>
            </div>
            <div>
              <h3 className="text-2xl font-headline font-black text-on-surface">{policy ? formatCurrency(policy.weeklyPremium) : 'N/A'}</h3>
              <p className="text-xs text-on-surface/60 mt-1 font-bold">Weekly Subscription</p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between group hover:border-primary-container/30 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-primary-container/10 rounded-xl group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary-container">account_balance_wallet</span>
              </div>
              <span className="text-[10px] font-black text-on-surface/50 uppercase tracking-widest">Earnings Shielded</span>
            </div>
            <div>
              <h3 className="text-2xl font-headline font-black text-on-surface">{formatCurrency(totalPaid)}</h3>
              <p className="text-xs text-on-surface/60 mt-1 font-bold">Lifetime Protection Payout</p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between group hover:border-tertiary/30 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-tertiary/10 rounded-xl group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-tertiary">star</span>
              </div>
              <span className="text-[10px] font-black text-on-surface/50 uppercase tracking-widest">Behavior Score</span>
            </div>
            <div>
              <h3 className="text-2xl font-headline font-black text-on-surface">{worker.behaviorScore}</h3>
              <p className="text-xs text-on-surface/60 mt-1 font-bold">Top {worker.behaviorScore > 80 ? '5%' : '15%'} of Partners</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 animate-slide-up" style={{ animationDelay: '200ms' }}>
          {/* Left: Policy Card & Forecast */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {policy && (
              <section className="glass-card rounded-2xl overflow-hidden relative border-white/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -z-10 animate-pulse"></div>
                <div className="p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                    <div>
                      <h2 className="text-2xl font-headline font-black mb-1">Guardian Policy {policy.policyNumber}</h2>
                      <p className="text-on-surface-variant text-sm font-bold">Issued via GigShield Parametric Network</p>
                    </div>
                    <button className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                      View Full Certificate
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="p-5 bg-surface-container-lowest/50 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black text-primary uppercase mb-3 tracking-widest">Max Weekly Coverage</p>
                      <p className="text-2xl font-headline font-black">{formatCurrency(policy.maxCoverage)}</p>
                    </div>
                    <div className="p-5 bg-surface-container-lowest/50 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black text-primary uppercase mb-3 tracking-widest">Hourly Coverage</p>
                      <p className="text-2xl font-headline font-black">{formatCurrency(policy.hourlyRate)}/hr</p>
                    </div>
                    <div className="p-5 bg-surface-container-lowest/50 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black text-primary uppercase mb-3 tracking-widest">Active Until</p>
                      <p className="text-2xl font-headline font-black text-sm pt-1">{new Date(policy.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/5">
                    <h3 className="text-[10px] font-black uppercase text-on-surface-variant mb-5 tracking-[0.2em]">Enforced Coverage Vectors</h3>
                    <div className="flex flex-wrap gap-3">
                      <span className="px-4 py-2 bg-surface-container-high/40 rounded-full text-[10px] font-black uppercase tracking-tight border border-outline-variant/20 flex items-center gap-2 text-on-surface shadow-sm hover:border-primary/50 transition-colors">
                        <span className="material-symbols-outlined text-sm text-primary">rainy</span> Heavy Rainfall
                      </span>
                      <span className="px-4 py-2 bg-surface-container-high/40 rounded-full text-[10px] font-black uppercase tracking-tight border border-outline-variant/20 flex items-center gap-2 text-on-surface shadow-sm hover:border-primary/50 transition-colors">
                        <span className="material-symbols-outlined text-sm text-primary">thermostat</span> Extreme Heat
                      </span>
                      <span className="px-4 py-2 bg-surface-container-high/40 rounded-full text-[10px] font-black uppercase tracking-tight border border-outline-variant/20 flex items-center gap-2 text-on-surface shadow-sm hover:border-primary/50 transition-colors">
                        <span className="material-symbols-outlined text-sm text-primary">air</span> Severe Air Quality
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Payout Prediction - Styled as Forecast */}
            {payoutPrediction && (
              <section className="glass-card rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/5 blur-[60px] -z-10 transition-colors"></div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <span className="material-symbols-outlined text-secondary">trending_up</span>
                  </div>
                  <h3 className="text-xl font-headline font-bold">Earnings Resilience Prediction</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-on-surface/50 uppercase tracking-widest mb-1">Expected Payout</span>
                    <span className="text-3xl font-headline font-black text-secondary">{formatCurrency(payoutPrediction.expectedPayout)}</span>
                    <p className="text-xs text-on-surface/60 mt-2 font-bold">Based on current weather trends</p>
                  </div>
                  <div className="flex flex-col border-l border-white/5 pl-8">
                    <span className="text-[10px] font-black text-on-surface/50 uppercase tracking-widest mb-1">Potential Peak</span>
                    <span className="text-xl font-headline font-black text-on-surface">{formatCurrency(payoutPrediction.bestCase)}</span>
                    <p className="text-[10px] text-on-surface/50 mt-1">If conditions deteriorate further</p>
                  </div>
                  <div className="flex flex-col border-l border-white/5 pl-8">
                    <span className="text-[10px] font-black text-on-surface/50 uppercase tracking-widest mb-1">Minimum Guard</span>
                    <span className="text-xl font-headline font-black text-on-surface">{formatCurrency(payoutPrediction.worstCase)}</span>
                    <p className="text-[10px] text-on-surface/50 mt-1">Base protection enabled</p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Right: Risk Insights & Live Local Data */}
          <div className="lg:col-span-1">
            <section className="glass-card rounded-2xl p-8 h-full flex flex-col border-white/5">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-tertiary/10 rounded-lg">
                  <span className="material-symbols-outlined text-tertiary">insights</span>
                </div>
                <h2 className="text-xl font-headline font-bold">Risk Insights</h2>
              </div>

              {weather && (
                <div className="bg-surface-container-lowest/80 p-6 rounded-2xl mb-8 relative border border-white/5">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4">Live: {worker.location.city}</p>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-secondary text-lg">rainy</span>
                          <span className="text-xs font-bold uppercase tracking-wider">Rain Impact</span>
                        </div>
                        <span className="text-xs font-black">{weather.rainfall} mm/hr</span>
                      </div>
                      <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                        <div className="bg-secondary h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((weather.rainfall / 10) * 100, 100)}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-tertiary text-lg">air</span>
                          <span className="text-xs font-bold uppercase tracking-wider">Air Quality</span>
                        </div>
                        <span className="text-xs font-black">{weather.aqi} AQI</span>
                      </div>
                      <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                        <div className="bg-tertiary h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((weather.aqi / 300) * 100, 100)}%` }}></div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between items-center text-center">
                      <div>
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Temp</p>
                        <p className="text-lg font-black">{Math.round(weather.temperature)}°C</p>
                      </div>
                      <div className="w-px h-8 bg-white/5"></div>
                      <div>
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Humidity</p>
                        <p className="text-lg font-black">{Math.round(weather.humidity)}%</p>
                      </div>
                      <div className="w-px h-8 bg-white/5"></div>
                      <div>
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Wind</p>
                        <p className="text-lg font-black">18 kmh</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {riskInsights && (
                <div className="mt-auto space-y-6">
                  <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl">
                    <div className="flex gap-4">
                      <span className="material-symbols-outlined text-primary text-2xl">shield_with_heart</span>
                      <div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Guardian Insight</p>
                        <p className="text-xs font-bold text-on-surface-variant leading-relaxed">
                          {riskInsights.upcomingRisk}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {riskInsights.recommendations.slice(0, 2).map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-high/30 border border-white/5">
                        <span className="material-symbols-outlined text-sm text-secondary pt-0.5">bolt</span>
                        <p className="text-[10px] text-on-surface-variant font-bold leading-tight">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Active Triggers Widget - Full Width */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '250ms' }}>
          <TriggerWidget triggers={triggers} />
        </div>

        {/* Recent Claims Table */}
        <section className="glass-card rounded-2xl overflow-hidden animate-slide-up bg-surface-container-lowest/30" style={{ animationDelay: '300ms' }}>
          <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-xl font-headline font-black">Claims Engine Ledger</h2>
            <div className="flex gap-2 p-1 bg-surface-container-high rounded-xl">
              {(['week', 'month', 'all'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    timeFilter === filter
                      ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-lowest text-on-surface-variant font-label text-[10px] uppercase font-black tracking-[0.2em]">
                  <th className="px-8 py-5">Correlation ID</th>
                  <th className="px-8 py-5">Vector Type</th>
                  <th className="px-8 py-5">Detection Pulse</th>
                  <th className="px-8 py-5">Payout Amount</th>
                  <th className="px-8 py-5">Ledger Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredClaims.length > 0 ? (
                  filteredClaims.map(claim => (
                    <tr key={claim.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6 font-bold font-mono text-xs tracking-tight">#{claim.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${
                            claim.triggerType === 'rain' ? 'bg-secondary/10 text-secondary' : 
                            claim.triggerType === 'heat' ? 'bg-tertiary/10 text-tertiary' : 'bg-primary/10 text-primary'
                          }`}>
                            <span className="material-symbols-outlined text-sm">
                              {claim.triggerType === 'rain' ? 'rainy' : 
                               claim.triggerType === 'heat' ? 'thermostat' : 'air'}
                            </span>
                          </div>
                          <span className="text-xs font-bold uppercase tracking-tight">
                            {claim.triggerType} Interference
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-on-surface-variant text-xs font-bold">
                        {new Date(claim.triggeredAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6 font-black text-on-surface">{formatCurrency(claim.payoutAmount)}</td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                          claim.status === 'paid' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                          claim.status === 'approved' ? 'bg-primary/10 text-primary border-primary/20' :
                          claim.status === 'pending' ? 'bg-tertiary/10 text-tertiary border-tertiary/20' :
                          'bg-error/10 text-error border-error/20'
                        }`}>
                          {claim.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <span className="material-symbols-outlined text-on-surface/20 text-5xl mb-4">verified_user</span>
                        <p className="text-on-surface/40 font-bold text-sm tracking-widest uppercase">No disruption anomalies detected</p>
                        <p className="text-[10px] text-on-surface/30 mt-2">Continuously monitoring parametric vectors...</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-primary font-headline font-black tracking-widest uppercase text-sm">Initializing Shield Dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
