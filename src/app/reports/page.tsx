'use client';

import { useState, useEffect } from 'react';
import { getWorkers, getClaims, getPolicies } from '@/lib/store';
import { Worker, Claim, Policy } from '@/lib/types';
import { formatCurrency } from '@/lib/integrations/payment-sim';
import { exportClaimsToCSV, exportWorkersToCSV, exportAnalyticsToCSV } from '@/lib/utils/csv-export';
import { calculatePlatformMetrics, getWeeklyTrend, getFraudAlerts } from '@/lib/ai/predictive-analytics';

type ReportType = 'claims' | 'workers' | 'financial';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('claims');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [weeklyTrend, setWeeklyTrend] = useState<any>(null);
  const [fraudAlerts, setFraudAlerts] = useState<any>(null);

  useEffect(() => {
    setWorkers(getWorkers());
    setClaims(getClaims());
    setPolicies(getPolicies());
    setMetrics(calculatePlatformMetrics());
    setWeeklyTrend(getWeeklyTrend());
    setFraudAlerts(getFraudAlerts());
  }, []);

  const handleExportCSV = () => {
    if (activeReport === 'claims') {
      const workerMap = new Map();
      workers.forEach(w => workerMap.set(w.id, w));
      exportClaimsToCSV(claims, workerMap, 'gigshield-claims-report.csv');
    } else if (activeReport === 'workers') {
      exportWorkersToCSV(workers, 'gigshield-workers-report.csv');
    } else if (activeReport === 'financial' && metrics) {
      exportAnalyticsToCSV(metrics, 'gigshield-financial-report.csv');
    }
  };

  const ClaimsReport = () => (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-2">Total Claims</p>
          <p className="text-2xl font-headline font-black">{claims.length}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-2">Pending</p>
          <p className="text-2xl font-headline font-black text-amber-500">{claims.filter(c => c.status === 'pending').length}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-2">Approved</p>
          <p className="text-2xl font-headline font-black text-primary">{claims.filter(c => c.status === 'approved').length}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-2">Paid</p>
          <p className="text-2xl font-headline font-black text-secondary">{claims.filter(c => c.status === 'paid').length}</p>
        </div>
      </div>

      {/* By Status */}
      <div className="glass-card p-8 rounded-2xl">
        <h3 className="text-lg font-headline font-black mb-6">Claims by Status</h3>
        <div className="grid grid-cols-5 gap-4">
          {['pending', 'approved', 'paid', 'rejected', 'fraud'].map(status => {
            const count = claims.filter(c => c.status === status).length;
            const percent = claims.length > 0 ? (count / claims.length) * 100 : 0;
            return (
              <div key={status} className="text-center">
                <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center mx-auto mb-3 relative">
                  <span className="text-xl font-black">{count}</span>
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-surface-container-high" />
                    <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray={`${percent} 100`} className={`${
                      status === 'pending' ? 'text-amber-500' :
                      status === 'approved' ? 'text-primary' :
                      status === 'paid' ? 'text-secondary' :
                      status === 'fraud' ? 'text-error' : 'text-on-surface/50'
                    }`} />
                  </svg>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface/50">{status}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* By Trigger */}
      <div className="glass-card p-8 rounded-2xl">
        <h3 className="text-lg font-headline font-black mb-6">Claims by Trigger Type</h3>
        <div className="space-y-4">
          {['rain', 'heat', 'pollution', 'flood', 'curfew', 'app_outage', 'demand_surge', 'traffic', 'strike'].map(trigger => {
            const count = claims.filter(c => c.triggerType === trigger).length;
            const total = claims.length || 1;
            return (
              <div key={trigger} className="flex items-center gap-4">
                <span className="w-32 text-sm font-bold capitalize">{trigger.replace('_', ' ')}</span>
                <div className="flex-grow h-4 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(count / total) * 100}%` }}></div>
                </div>
                <span className="w-12 text-right font-black">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const WorkersReport = () => (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-2">Total Workers</p>
          <p className="text-2xl font-headline font-black">{workers.length}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-2">Active Policies</p>
          <p className="text-2xl font-headline font-black text-secondary">{policies.filter(p => p.status === 'active').length}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-2">Avg Earnings</p>
          <p className="text-2xl font-headline font-black text-primary">{formatCurrency(workers.reduce((sum, w) => sum + w.avgWeeklyEarnings, 0) / (workers.length || 1))}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-2">Avg Behavior</p>
          <p className="text-2xl font-headline font-black">{Math.round(workers.reduce((sum, w) => sum + w.behaviorScore, 0) / (workers.length || 1))}</p>
        </div>
      </div>

      {/* By City */}
      <div className="glass-card p-8 rounded-2xl">
        <h3 className="text-lg font-headline font-black mb-6">Workers by City</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'].map(city => {
            const count = workers.filter(w => w.location.city === city).length;
            return (
              <div key={city} className="p-4 bg-surface-container-low/50 rounded-2xl text-center">
                <p className="text-lg font-black">{count}</p>
                <p className="text-[10px] uppercase tracking-widest text-on-surface/50">{city}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* By Platform */}
      <div className="glass-card p-8 rounded-2xl">
        <h3 className="text-lg font-headline font-black mb-6">Workers by Platform</h3>
        <div className="flex justify-around">
          {['zomato', 'swiggy', 'zepto', 'blinkit', 'amazon'].map(platform => {
            const count = workers.filter(w => w.platform === platform).length;
            const percent = workers.length > 0 ? (count / workers.length) * 100 : 0;
            return (
              <div key={platform} className="text-center">
                <div className="w-24 h-24 rounded-full bg-surface-container-low flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-black">{count}</span>
                </div>
                <p className="text-sm font-bold capitalize">{platform}</p>
                <p className="text-[10px] text-on-surface/50">{percent.toFixed(1)}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const FinancialReport = () => (
    <div className="space-y-8">
      {metrics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-6 rounded-2xl">
              <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-2">Premiums Collected</p>
              <p className="text-2xl font-headline font-black text-secondary">{formatCurrency(metrics.premiumsCollected)}</p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-2">Total Payouts</p>
              <p className="text-2xl font-headline font-black text-error">{formatCurrency(metrics.totalPayouts)}</p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-2">Loss Ratio</p>
              <p className="text-2xl font-headline font-black text-primary">{metrics.lossRatio.toFixed(1)}%</p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-2">Profit Margin</p>
              <p className="text-2xl font-headline font-black text-secondary">{metrics.profitMargin.toFixed(1)}%</p>
            </div>
          </div>

          {/* Weekly Trend Chart */}
          {weeklyTrend && (
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-lg font-headline font-black mb-6">Weekly Premium vs Payout Trend</h3>
              <div className="flex items-end gap-2 h-40">
                {weeklyTrend.labels.map((label: string, idx: number) => (
                  <div key={label} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center gap-1">
                      <div className="w-full bg-primary/50 rounded-t" style={{ height: `${(weeklyTrend.premiums[idx] / Math.max(...weeklyTrend.premiums.filter((p: number) => p > 0), 1)) * 100}px` }}></div>
                      <div className="w-full bg-secondary/50 rounded-t" style={{ height: `${(weeklyTrend.payouts[idx] / Math.max(...weeklyTrend.payouts.filter((p: number) => p > 0), 1)) * 100}px` }}></div>
                    </div>
                    <span className="text-[10px] text-on-surface/50">{label}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-primary rounded-full"></span>
                  <span className="text-xs text-on-surface/70">Premium</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-secondary rounded-full"></span>
                  <span className="text-xs text-on-surface/70">Payout</span>
                </div>
              </div>
            </div>
          )}

          {/* Fraud Stats */}
          {fraudAlerts && (
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-lg font-headline font-black mb-6">Fraud Detection Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-6 bg-error/10 rounded-2xl text-center">
                  <p className="text-3xl font-headline font-black text-error">{fraudAlerts.high}</p>
                  <p className="text-[10px] uppercase tracking-widest text-error">High Risk</p>
                </div>
                <div className="p-6 bg-amber-500/10 rounded-2xl text-center">
                  <p className="text-3xl font-headline font-black text-amber-500">{fraudAlerts.medium}</p>
                  <p className="text-[10px] uppercase tracking-widest text-amber-500">Medium Risk</p>
                </div>
                <div className="p-6 bg-secondary/10 rounded-2xl text-center">
                  <p className="text-3xl font-headline font-black text-secondary">{fraudAlerts.low}</p>
                  <p className="text-[10px] uppercase tracking-widest text-secondary">Low Risk</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/30">
      <main className="pt-24 pb-12 px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-headline font-black">Analytics Reports</h1>
          <button
            onClick={handleExportCSV}
            className="px-6 py-3 bg-primary/10 text-primary rounded-xl font-bold flex items-center gap-2 hover:bg-primary/20 transition-colors"
          >
            <span className="material-symbols-outlined">download</span>
            Export CSV
          </button>
        </div>

        {/* Report Type Tabs */}
        <div className="flex gap-4 mb-8">
          {(['claims', 'workers', 'financial'] as ReportType[]).map(type => (
            <button
              key={type}
              onClick={() => setActiveReport(type)}
              className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
                activeReport === type
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                  : 'bg-surface-container-low text-on-surface/60 hover:bg-white/5'
              }`}
            >
              {type === 'claims' && 'Claims'}
              {type === 'workers' && 'Workers'}
              {type === 'financial' && 'Financial'}
            </button>
          ))}
        </div>

        {/* Report Content */}
        {activeReport === 'claims' && <ClaimsReport />}
        {activeReport === 'workers' && <WorkersReport />}
        {activeReport === 'financial' && <FinancialReport />}
      </main>
    </div>
  );
}