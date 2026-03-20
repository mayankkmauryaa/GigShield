'use client';

import { useState, useEffect } from 'react';
import { getDashboardStats, getWorkers, getPolicies, getClaims, getTriggers, getWeatherData, createTrigger, getActiveTriggers } from '@/lib/store';
import { simulateWeatherEvent, getTriggerSummary } from '@/lib/triggers/weather-trigger';
import { generateWeatherForecast, calculateZoneRisk } from '@/lib/ai/risk-model';
import { DashboardStats, Worker, Policy, Claim, Trigger, WeatherData } from '@/lib/types';
import { formatCurrency } from '@/lib/integrations/payment-sim';
import { FraudDetectionPanel } from '@/components/FraudDetectionPanel';
import { AutoClaimNotification, AutoClaimNotificationContainer } from '@/components/AutoClaimNotification';

interface ClaimEvent {
  id: string;
  triggerType: string;
  triggerName: string;
  location: string;
  severity: 'yellow' | 'orange' | 'red';
  affectedWorkers: number;
  claimsCreated: number;
  timestamp: Date;
}

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [weather, setWeather] = useState<{ [key: string]: WeatherData }>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'workers' | 'simulation' | 'defense'>('overview');
  const [simulationCity, setSimulationCity] = useState('Mumbai');
  const [simulationType, setSimulationType] = useState<'rain' | 'heat' | 'pollution' | 'flood' | 'curfew' | 'app_outage' | 'demand_surge' | 'traffic' | 'strike'>('rain');
  const [simulationSeverity, setSimulationSeverity] = useState<'orange' | 'red'>('red');
  const [simResult, setSimResult] = useState<{ trigger: Trigger | null; claims: Claim[] } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [claimEvents, setClaimEvents] = useState<ClaimEvent[]>([]);
  const [zoneRisks, setZoneRisks] = useState<ReturnType<typeof calculateZoneRisk>>(CITIES.map(city => ({
    zoneId: city,
    riskScore: 0,
    riskLevel: 'low' as const,
    recommendation: '',
  })));

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshData = () => {
    setStats(getDashboardStats());
    setWorkers(getWorkers());
    setPolicies(getPolicies());
    setClaims(getClaims());
    setTriggers(getActiveTriggers());

    const weatherData: { [key: string]: WeatherData } = {};
    CITIES.forEach(city => {
      weatherData[city] = getWeatherData(city);
    });
    setWeather(weatherData);

    const allZones = workers.length > 0 
      ? [...new Set(workers.map(w => w.location.city))]
      : CITIES;
    setZoneRisks(calculateZoneRisk(allZones));
  };

  const handleSimulation = () => {
    setIsSimulating(true);
    
    setTimeout(() => {
      const values: { [key: string]: number } = {
        rain: simulationSeverity === 'red' ? 65 : 45,
        heat: simulationSeverity === 'red' ? 47 : 42,
        pollution: simulationSeverity === 'red' ? 350 : 260,
      };

      const result = simulateWeatherEvent(simulationCity, simulationType, simulationSeverity, values[simulationType]);
      if (result.trigger) {
        setSimResult(result);
        
        // Add claim event notification
        const triggerNames: Record<string, string> = {
          rain: 'Heavy Rain',
          heat: 'Extreme Heat',
          pollution: 'Pollution Alert',
          flood: 'Flood Warning',
          curfew: 'Curfew Active',
          strike: 'Transport Strike',
          app_outage: 'Platform Outage',
          demand_surge: 'Demand Surge',
          traffic: 'Traffic Disruption',
        };
        
        const newEvent: ClaimEvent = {
          id: `event-${Date.now()}`,
          triggerType: simulationType,
          triggerName: triggerNames[simulationType] || simulationType,
          location: simulationCity,
          severity: simulationSeverity,
          affectedWorkers: result.claims.length,
          claimsCreated: result.claims.length,
          timestamp: new Date(),
        };
        
        setClaimEvents(prev => [...prev, newEvent]);
      }
      refreshData();
      setIsSimulating(false);
    }, 1500);
  };

  const totalPremiums = policies.filter(p => p.status === 'active').reduce((sum, p) => sum + p.weeklyPremium, 0);
  const totalPayouts = claims.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.payoutAmount, 0);
  const grossMargin = totalPremiums - totalPayouts;

  const claimsByStatus = {
    pending: claims.filter(c => c.status === 'pending').length,
    approved: claims.filter(c => c.status === 'approved').length,
    paid: claims.filter(c => c.status === 'paid').length,
    fraud: claims.filter(c => c.status === 'fraud').length,
  };

  const claimsByTrigger = {
    rain: claims.filter(c => c.triggerType === 'rain').length,
    heat: claims.filter(c => c.triggerType === 'heat').length,
    pollution: claims.filter(c => c.triggerType === 'pollution').length,
    other: claims.filter(c => !['rain', 'heat', 'pollution'].includes(c.triggerType)).length,
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/30">
      {/* Auto-Claim Notification Container */}
      <AutoClaimNotificationContainer 
        events={claimEvents.map(e => ({
          id: e.id,
          triggerType: e.triggerType,
          triggerName: e.triggerName,
          location: e.location,
          severity: e.severity,
          affectedWorkers: e.affectedWorkers,
          claimsCreated: e.claimsCreated,
          timestamp: e.timestamp,
        }))}
        onDismiss={(id) => setClaimEvents(prev => prev.filter(e => e.id !== id))}
        onViewClaims={() => {
          setActiveTab('simulation');
          setClaimEvents([]);
        }}
      />
      <div className="max-w-7xl mx-auto px-8 py-24">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 animate-fade-in">
          <div>
            <h1 className="text-4xl font-headline font-black tracking-tight text-on-surface mb-2">Platform Control Ledger</h1>
            <p className="text-on-surface/70 font-medium">Real-time risk distribution and system oversight</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={refreshData} 
              className="px-6 py-2.5 bg-surface-container-high hover:bg-surface-bright text-on-surface rounded-xl font-bold text-sm uppercase tracking-widest transition-all border border-white/5 active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Synchronize Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Side Navigation Cluster */}
          <aside className="col-span-12 lg:col-span-3 space-y-8 animate-slide-up">
            <div className="glass-card p-6 rounded-3xl border-white/5">
              <p className="text-[10px] font-black text-on-surface/50 uppercase tracking-[0.2em] mb-6">Navigation Matrix</p>
              <div className="flex flex-col gap-2">
                {(['overview', 'workers', 'simulation', 'defense'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-sm ${
                        activeTab === tab
                          ? 'bg-primary/10 border-l-4 border-primary text-on-surface shadow-xl shadow-primary/5 translate-x-1'
                          : 'text-on-surface/60 hover:text-on-surface hover:bg-white/5'
                      }`}
                    >
                    <span className="material-symbols-outlined text-[20px]">
                      {tab === 'overview' ? 'dashboard' : tab === 'workers' ? 'group' : tab === 'simulation' ? 'thunderstorm' : 'security'}
                    </span>
                    <span className="capitalize">{tab === 'defense' ? 'Sentinel Defense' : tab}</span>
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-white/5">
                <div className="p-4 rounded-2xl bg-surface-container-low border border-white/5 mb-6 group">
                  <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest mb-2">System Pulse</p>
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_12px_rgba(69,223,164,0.5)] animate-pulse"></span>
                    <span className="text-xs font-bold text-on-surface">Live Monitoring Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulation Preview Card (When not in simulation tab) */}
            {activeTab !== 'simulation' && (
              <div className="bg-gradient-to-br from-primary/10 to-surface-container-high p-8 rounded-3xl border border-primary/20 group cursor-pointer" onClick={() => setActiveTab('simulation')}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-primary group-hover:rotate-12 transition-transform">model_training</span>
                  <h4 className="text-sm font-headline font-black text-on-surface uppercase tracking-tight">Rapid Simulator</h4>
                </div>
                <p className="text-[10px] text-on-surface-variant leading-relaxed font-bold mb-4 uppercase tracking-wider">Configure atmospheric triggers for node testing.</p>
                <div className="flex gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-primary/30"></div>
                  <div className="flex-1 h-1.5 rounded-full bg-primary/30"></div>
                  <div className="flex-1 h-1.5 rounded-full bg-white/10"></div>
                </div>
              </div>
            )}
          </aside>

          {/* Main Dashboard Interaction Area */}
          <section className="col-span-12 lg:col-span-9 space-y-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fade-in">
                {/* Stats Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border-white/5">
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                    <p className="text-[10px] font-black text-on-surface/50 uppercase tracking-[0.2em] mb-2">Total Node Census</p>
                    <h3 className="text-3xl font-headline font-black text-on-surface">{stats?.totalWorkers || 0}</h3>
                    <div className="flex items-center gap-1 mt-3 text-secondary text-[10px] font-black">
                      <span className="material-symbols-outlined text-xs">trending_up</span>
                      <span>ACTIVE PARTNERS</span>
                    </div>
                  </div>
                  <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border-white/5">
                    <p className="text-[10px] font-black text-on-surface/50 uppercase tracking-[0.2em] mb-2">Premium Inflow</p>
                    <h3 className="text-3xl font-headline font-black text-on-surface">{formatCurrency(totalPremiums)}</h3>
                    <div className="flex items-center gap-1 mt-3 text-primary text-[10px] font-black">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      <span>WEEKLY CONTRACTED</span>
                    </div>
                  </div>
                  <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border-white/5">
                    <p className="text-[10px] font-black text-on-surface/50 uppercase tracking-[0.2em] mb-2">Platform Margin</p>
                    <h3 className={`text-3xl font-headline font-black ${grossMargin >= 0 ? 'text-secondary' : 'text-error'}`}>
                      {formatCurrency(grossMargin)}
                    </h3>
                    <div className="flex items-center gap-1 mt-3 text-on-surface/40 text-[10px] font-black">
                      <span className="material-symbols-outlined text-xs">balance</span>
                      <span>NET YIELD</span>
                    </div>
                  </div>
                  <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border-white/5">
                    <p className="text-[10px] font-black text-on-surface/50 uppercase tracking-[0.2em] mb-2">System Health</p>
                    <h3 className="text-3xl font-headline font-black text-secondary">Optimal</h3>
                    <div className="flex items-center gap-2 mt-3 text-secondary text-[10px] font-black">
                      <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(69,223,164,0.6)]"></span>
                      <span>ALL NODES SYNCED</span>
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Status Distribution */}
                  <div className="glass-card p-8 rounded-3xl border-white/5">
                    <div className="flex justify-between items-center mb-10">
                      <div>
                        <h4 className="text-lg font-headline font-black text-on-surface">Claims Dispersion</h4>
                        <p className="text-xs text-on-surface-variant font-medium">Lifecycle status breakdown</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      {Object.entries(claimsByStatus).map(([status, count]) => (
                        <div key={status} className="group">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-3">
                              <span className={`w-2 h-2 rounded-full ${
                                status === 'pending' ? 'bg-amber-500' :
                                status === 'approved' ? 'bg-primary' :
                                status === 'paid' ? 'bg-secondary' : 'bg-error'
                              }`}></span>
                              <span className="text-[10px] font-black text-on-surface uppercase tracking-widest">{status}</span>
                            </div>
                            <span className="text-xs font-black text-on-surface">{count}</span>
                          </div>
                          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-1000 ${
                                status === 'pending' ? 'bg-amber-500' :
                                status === 'approved' ? 'bg-primary' :
                                status === 'paid' ? 'bg-secondary' : 'bg-error'
                              }`}
                              style={{ width: `${claims.length > 0 ? (count / claims.length) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trigger Analysis */}
                  <div className="glass-card p-8 rounded-3xl border-white/5">
                    <div className="flex justify-between items-center mb-10">
                      <div>
                        <h4 className="text-lg font-headline font-black text-on-surface">Trigger Vectors</h4>
                        <p className="text-xs text-on-surface-variant font-medium">Atmospheric event correlation</p>
                      </div>
                    </div>
                    <div className="space-y-5">
                      {Object.entries(claimsByTrigger).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between p-4 bg-surface-container-low/50 rounded-2xl border border-white/5 group hover:bg-white/5 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              type === 'rain' ? 'bg-secondary/10' :
                              type === 'heat' ? 'bg-amber-500/10' :
                              type === 'pollution' ? 'bg-primary/10' : 'bg-white/5'
                            }`}>
                              <span className={`material-symbols-outlined ${
                                type === 'rain' ? 'text-secondary' :
                                type === 'heat' ? 'text-amber-500' :
                                type === 'pollution' ? 'text-primary' : 'text-on-surface-variant'
                              }`}>
                                {type === 'rain' ? 'rainy' : type === 'heat' ? 'thermostat' : type === 'pollution' ? 'cloud' : 'info'}
                              </span>
                            </div>
                            <span className="text-xs font-black text-on-surface uppercase tracking-widest">{type}</span>
                          </div>
                          <span className="text-sm font-black text-on-surface">{count} <span className="text-[10px] text-on-surface-variant">Claims</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* City Risk Map Preview */}
                <div className="glass-card p-8 rounded-3xl border-white/5">
                  <h4 className="text-lg font-headline font-black text-on-surface mb-8">Node Risk Topography</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {zoneRisks.map(cityRisk => (
                      <div
                        key={cityRisk.zoneId}
                        className={`p-5 rounded-2xl border transition-all hover:scale-105 cursor-pointer ${
                          cityRisk.riskLevel === 'high'
                            ? 'bg-error/10 border-error/20 group'
                            : cityRisk.riskLevel === 'medium'
                            ? 'bg-amber-500/10 border-amber-500/20'
                            : 'bg-secondary/10 border-secondary/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-black text-on-surface uppercase tracking-tighter">{cityRisk.zoneId}</span>
                          <span className={`text-[10px] font-black ${
                            cityRisk.riskLevel === 'high' ? 'text-error' :
                            cityRisk.riskLevel === 'medium' ? 'text-amber-500' : 'text-secondary'
                          }`}>
                            {cityRisk.riskScore}
                          </span>
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${
                          cityRisk.riskLevel === 'high' ? 'text-error' :
                          cityRisk.riskLevel === 'medium' ? 'text-amber-500' : 'text-secondary'
                        }`}>
                          {cityRisk.riskLevel}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'workers' && (
              <div className="glass-card p-8 rounded-3xl border-white/5 animate-fade-in">
                <div className="flex justify-between items-end mb-10">
                  <div>
                    <h4 className="text-2xl font-headline font-black text-on-surface">Partner Distribution</h4>
                    <p className="text-sm text-on-surface-variant font-medium">Network census by geographic cluster</p>
                  </div>
                </div>
                
                <div className="overflow-x-auto rounded-2xl border border-white/5">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-surface-container-high/50 text-on-surface-variant font-label text-[10px] font-black uppercase tracking-[0.2em]">
                        <th className="px-8 py-5">Node Cluster</th>
                        <th className="px-8 py-5 text-right">Population</th>
                        <th className="px-8 py-5 text-right">Avg Premium</th>
                        <th className="px-8 py-5 text-right">Yield Capacity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm font-medium">
                      {CITIES.map(city => {
                        const cityWorkers = workers.filter(w => w.location.city === city);
                        const avgPremium = cityWorkers.length > 0
                          ? policies.filter(p => cityWorkers.some(w => w.id === p.workerId))
                              .reduce((sum, p) => sum + p.weeklyPremium, 0) / cityWorkers.length
                          : 0;
                        const avgEarnings = cityWorkers.length > 0
                          ? cityWorkers.reduce((sum, w) => sum + w.avgWeeklyEarnings, 0) / cityWorkers.length
                          : 0;
                        
                        return (
                          <tr key={city} className="hover:bg-white/5 transition-colors group">
                            <td className="px-8 py-5 font-bold text-on-surface">{city}</td>
                            <td className="px-8 py-5 text-right font-black text-primary">{cityWorkers.length}</td>
                            <td className="px-8 py-5 text-right text-on-surface-variant">{formatCurrency(avgPremium)}</td>
                            <td className="px-8 py-5 text-right text-secondary-fixed">{formatCurrency(avgEarnings)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'simulation' && (
              <div className="space-y-8 animate-fade-in">
                <div className="glass-card p-10 rounded-3xl border-white/5 bg-gradient-to-br from-surface to-primary/5">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-3xl">model_training</span>
                    </div>
                    <div>
                      <h4 className="text-2xl font-headline font-black text-on-surface">Atmospheric Event Simulator</h4>
                      <p className="text-on-surface-variant font-medium text-sm">Synchronize triggers with platform payout engines</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-10">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1">Target Cluster</label>
                      <select
                        value={simulationCity}
                        onChange={(e) => setSimulationCity(e.target.value)}
                        className="w-full bg-surface-container-high border-white/10 rounded-xl text-sm font-bold text-on-surface focus:ring-primary h-12 px-4 appearance-none"
                      >
                        {CITIES.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1">Hazard Vector</label>
                      <select
                        value={simulationType}
                        onChange={(e) => setSimulationType(e.target.value as typeof simulationType)}
                        className="w-full bg-surface-container-high border-white/10 rounded-xl text-sm font-bold text-on-surface focus:ring-primary h-12 px-4 appearance-none"
                      >
                        <option value="rain">Heavy Precipitation (Rain)</option>
                        <option value="heat">Extreme Thermal Index (Heat)</option>
                        <option value="pollution">Particulate Toxicity (AQI)</option>
                        <option value="flood">Flood Alert</option>
                        <option value="curfew">Local Curfew</option>
                        <option value="app_outage">Platform Outage</option>
                        <option value="demand_surge">Demand Surge (Zone Block)</option>
                        <option value="traffic">Traffic Jam</option>
                        <option value="strike">Transport Strike</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1">Alert Criticality</label>
                      <select
                        value={simulationSeverity}
                        onChange={(e) => setSimulationSeverity(e.target.value as typeof simulationSeverity)}
                        className="w-full bg-surface-container-high border-white/10 rounded-xl text-sm font-bold text-on-surface focus:ring-primary h-12 px-4 appearance-none"
                      >
                        <option value="orange">Orange Level Impact</option>
                        <option value="red">Red Line Crisis</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={handleSimulation} 
                    disabled={isSimulating}
                    className="w-full py-5 bg-primary text-on-primary rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isSimulating ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Simulating...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">bolt</span>
                        Invoke Event Simulation
                      </>
                    )}
                  </button>

                  {simResult && (
                    <div className="mt-10 p-8 rounded-3xl bg-gradient-to-br from-surface-container-low to-primary/5 border border-emerald-500/20 animate-slide-up">
                      {/* Success Header */}
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-emerald-400" style={{ fontVariationSettings: '"FILL" 1' }}>
                            check_circle
                          </span>
                        </div>
                        <div>
                          <h5 className="text-sm font-black text-emerald-400">Simulation Successful</h5>
                          <p className="text-xs text-white/50">
                            {simResult.claims.length} workers affected, claims auto-generated
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {simResult.trigger && (
                          <div className="space-y-3">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Trigger Created</p>
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-emerald-500/20">
                              <span className="material-symbols-outlined text-4xl text-emerald-400">
                                {simResult.trigger.type === 'rain' ? 'water_drop' : 
                                 simResult.trigger.type === 'heat' ? 'wb_sunny' : 
                                 simResult.trigger.type === 'pollution' ? 'cloud_off' : 'warning'}
                              </span>
                              <div>
                                <p className="font-bold text-on-surface text-sm uppercase">{simResult.trigger.type.replace('_', ' ')}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    simResult.trigger.severity === 'red' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                                  }`}>
                                    {simResult.trigger.severity.toUpperCase()}
                                  </span>
                                  <span className="text-xs text-white/50">{simResult.trigger.location}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Claims Generated</p>
                          <div className="p-4 bg-white/5 rounded-2xl border border-emerald-500/20 flex flex-col justify-center h-full">
                            <div className="flex items-center gap-2">
                              <p className="text-3xl font-headline font-black text-secondary">{simResult.claims.length}</p>
                              <span className="material-symbols-outlined text-xl text-emerald-400 animate-bounce">auto_awesome</span>
                            </div>
                            <p className="text-[10px] font-bold text-white/50 uppercase mt-1">Auto-Created via AI</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Payout Amount</p>
                          <div className="p-4 bg-white/5 rounded-2xl border border-emerald-500/20 flex flex-col justify-center h-full">
                            <p className="text-2xl font-headline font-black text-emerald-400">
                              {formatCurrency(simResult.claims.reduce((sum, c) => sum + c.payoutAmount, 0))}
                            </p>
                            <p className="text-[10px] font-bold text-white/50 uppercase mt-1">Projected Disbursement</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Processing Timeline */}
                      <div className="mt-6 p-4 bg-black/20 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                          <span className="text-xs font-bold text-emerald-400">Auto-Claim Processing</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <span className="material-symbols-outlined text-emerald-400 text-lg">flash_on</span>
                            <p className="text-[10px] text-white/60 mt-1">Triggered</p>
                          </div>
                          <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <span className="material-symbols-outlined text-emerald-400 text-lg">description</span>
                            <p className="text-[10px] text-white/60 mt-1">Claims Created</p>
                          </div>
                          <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <span className="material-symbols-outlined text-emerald-400 text-lg">security</span>
                            <p className="text-[10px] text-white/60 mt-1">Fraud Check</p>
                          </div>
                          <div className="p-2 bg-amber-500/10 rounded-lg">
                            <span className="material-symbols-outlined text-amber-400 text-lg">schedule</span>
                            <p className="text-[10px] text-white/60 mt-1">Awaiting Approval</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Forecast Grid */}
                <div className="glass-card p-8 rounded-3xl border-white/5">
                  <h4 className="text-lg font-headline font-black text-on-surface mb-8">Atmospheric Projection Matrix</h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CITIES.slice(0, 6).map(city => {
                      const forecast = generateWeatherForecast(city, 3);
                      
                      return (
                        <div key={city} className="p-6 bg-surface-container-low/50 rounded-2xl border border-white/5 hover:bg-white/5 transition-all">
                          <div className="flex items-center justify-between mb-6">
                            <span className="font-bold text-on-surface uppercase tracking-tighter">{city}</span>
                            <span className="material-symbols-outlined text-primary">data_thresholding</span>
                          </div>
                          <div className="space-y-4">
                            {forecast.map((day, i) => (
                              <div key={i} className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-on-surface-variant">{day.date}</span>
                                <div className="flex items-center gap-3">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                    day.riskLevel === 'high' ? 'bg-error/20 text-error' :
                                    day.riskLevel === 'medium' ? 'bg-amber-500/20 text-amber-500' : 'bg-secondary/20 text-secondary'
                                  }`}>
                                    {day.riskLevel}
                                  </span>
                                  <span className="text-[10px] font-black text-on-surface">{day.claimProbability * 100}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'defense' && (
              <div className="space-y-8 animate-fade-in">
                <div className="glass-card p-10 rounded-3xl border-white/5 bg-gradient-to-br from-surface to-error/5 text-on-surface">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-error text-3xl">security</span>
                    </div>
                    <div>
                      <h4 className="text-2xl font-headline font-black text-on-surface">Sentinel Fraud Defense</h4>
                      <p className="text-on-surface/60 font-medium text-sm">Real-time pattern analysis and threat mitigation</p>
                    </div>
                  </div>
                  <FraudDetectionPanel />
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
