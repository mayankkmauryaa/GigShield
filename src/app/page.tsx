'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDashboardStats, getWeatherData, getActiveTriggers } from '@/lib/store';
import { DashboardStats, WeatherData, Trigger } from '@/lib/types';
import { formatCurrency } from '@/lib/integrations/payment-sim';

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [weather, setWeather] = useState<{ [key: string]: WeatherData }>({});
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [activeCity, setActiveCity] = useState('Mumbai');

  useEffect(() => {
    setStats(getDashboardStats());
    setTriggers(getActiveTriggers());
    
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Pune', 'Chennai', 'Hyderabad'];
    const weatherData: { [key: string]: WeatherData } = {};
    cities.forEach(city => {
      weatherData[city] = getWeatherData(city);
    });
    setWeather(weatherData);
  }, []);

  return (
    <div className="animate-fade-in bg-background text-on-background selection:bg-primary/30 min-h-screen">
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center px-6 hero-gradient overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary blur-[120px] rounded-full"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary blur-[120px] rounded-full opacity-30"></div>
          </div>
          <div className="max-w-5xl text-center z-10 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/20 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              <span className="text-xs font-bold tracking-widest uppercase text-secondary">AI-Powered Parametric Shield Active</span>
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 leading-[1.1]">
              Kinetic Protection for the <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-container to-secondary">Modern Workforce</span>
            </h1>
            <p className="font-body text-lg md:text-xl text-on-surface/80 max-w-2xl mx-auto mb-12 leading-relaxed">
              Automated payouts triggered by weather, risk, and demand patterns. No paperwork, no wait times—just pure digital resilience for gig economy pioneers.
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <Link href="/register" className="px-10 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300">
                Get Protected
              </Link>
              <Link href="/dashboard" className="px-10 py-4 glass-card text-on-surface font-bold rounded-xl hover:bg-white/10 transition-all duration-300">
                View Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        {stats && (
          <section className="py-24 px-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="glass-card p-8 relative overflow-hidden group">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                <p className="text-sm uppercase tracking-[0.2em] text-on-surface/50 font-bold mb-4">Active Workers</p>
                <h3 className="font-headline text-4xl font-extrabold text-on-surface">{stats.totalWorkers}+</h3>
              </div>
              <div className="glass-card p-8 relative overflow-hidden group">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                <p className="text-sm uppercase tracking-[0.2em] text-on-surface/50 font-bold mb-4">Active Policies</p>
                <h3 className="font-headline text-4xl font-extrabold text-on-surface">{stats.activePolicies}+</h3>
              </div>
              <div className="glass-card p-8 relative overflow-hidden group border-secondary/20 bg-secondary/5">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/10 rounded-full blur-2xl"></div>
                <p className="text-sm uppercase tracking-[0.2em] text-secondary/80 font-bold mb-4">Total Payouts</p>
                <h3 className="font-headline text-4xl font-extrabold text-secondary">{formatCurrency(stats.totalPayouts)}</h3>
              </div>
              <div className="glass-card p-8 relative overflow-hidden group border-tertiary/20 bg-tertiary/5">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-tertiary/10 rounded-full blur-2xl"></div>
                <p className="text-sm uppercase tracking-[0.2em] text-tertiary/80 font-bold mb-4">Pending Claims</p>
                <h3 className="font-headline text-4xl font-extrabold text-tertiary">{stats.pendingClaims}</h3>
              </div>
            </div>
          </section>
        )}

        {/* How it Works */}
        <section className="py-32 bg-surface-container-low/50">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Precision Protection</h2>
                <p className="text-on-surface/70 max-w-xl">A frictionless experience designed to keep you moving, even when the environment doesn&apos;t cooperate.</p>
              </div>
              <span className="text-primary font-headline font-bold tracking-widest uppercase text-sm border-b border-primary/30 pb-2">3-Step Protocol</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent -z-10"></div>
              
              <div className="group">
                <div className="w-16 h-16 rounded-2xl bg-primary-container/20 flex items-center justify-center mb-8 border border-primary/20 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>how_to_reg</span>
                </div>
                <h4 className="font-headline text-xl font-bold mb-4 text-on-surface">01. Register</h4>
                <p className="text-on-surface-variant leading-relaxed">Link your delivery partner ID. Our AI syncs with your work logs to establish your active hours and location baseline.</p>
              </div>

              <div className="group">
                <div className="w-16 h-16 rounded-2xl bg-secondary-container/20 flex items-center justify-center mb-8 border border-secondary/20 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>monitoring</span>
                </div>
                <h4 className="font-headline text-xl font-bold mb-4 text-on-surface">02. Monitor</h4>
                <p className="text-on-surface-variant leading-relaxed">Our grid constantly tracks hyperlocal weather and AQI. If conditions cross your selected triggers, coverage activates.</p>
              </div>

              <div className="group">
                <div className="w-16 h-16 rounded-2xl bg-tertiary-container/20 flex items-center justify-center mb-8 border border-tertiary/20 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-tertiary text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>payments</span>
                </div>
                <h4 className="font-headline text-xl font-bold mb-4 text-on-surface">03. Payout</h4>
                <p className="text-on-surface-variant leading-relaxed">No claims filing. Payouts are credited instantly to your linked wallet the moment parametric conditions are verified.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Live Weather Dashboard */}
        <section className="py-32 px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4">
              <h2 className="font-headline text-4xl font-extrabold tracking-tight mb-6">Real-time Monitoring</h2>
              <p className="text-on-surface-variant mb-8 leading-relaxed">Our proprietary node network monitors ground conditions across 7 major clusters. High-risk zones are flagged in milliseconds.</p>
              <div className="space-y-3">
                {['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'].map(city => (
                  <div 
                    key={city}
                    onClick={() => setActiveCity(city)}
                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                      activeCity === city 
                        ? 'bg-surface-container-high border-l-4 border-secondary' 
                        : 'hover:bg-white/5 text-on-surface/50 hover:text-on-surface hover:opacity-100'
                    }`}
                  >
                    <span className="font-bold">{city}</span>
                    {activeCity === city && <span className="text-secondary text-sm font-bold">Active Shielding</span>}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-8 glass-card rounded-[2.5rem] p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <div className="text-right">
                  <p className="text-sm uppercase tracking-widest text-outline mb-1">Current Focus</p>
                  <h3 className="text-3xl font-headline font-extrabold text-on-surface">{activeCity}, IN</h3>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-12 mt-12">
                <div className="flex-1">
                  {weather[activeCity] ? (
                    <>
                      <div className="flex items-center gap-6 mb-8">
                        <span className="material-symbols-outlined text-6xl text-secondary" style={{ fontVariationSettings: '"opsz" 48' }}>
                          {weather[activeCity].condition.toLowerCase().includes('rain') ? 'rainy' : 'wb_sunny'}
                        </span>
                        <div>
                          <h4 className="text-4xl font-headline font-extrabold">{Math.round(weather[activeCity].temperature)}°C</h4>
                          <p className="text-secondary font-bold">{weather[activeCity].condition}</p>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-outline">Precipitation</span>
                            <span className="text-on-surface font-bold">{weather[activeCity].rainfall}mm</span>
                          </div>
                          <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                            <div className="h-full bg-secondary transition-all duration-500" style={{ width: `${Math.min(weather[activeCity].rainfall * 10, 100)}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-outline">AQI Level</span>
                            <span className={`${weather[activeCity].aqi > 150 ? 'text-tertiary' : 'text-primary'} font-bold`}>
                              {weather[activeCity].aqi} {weather[activeCity].aqi > 150 ? 'UNHEALTHY' : 'OPTIMAL'}
                            </span>
                          </div>
                          <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                            <div className={`h-full ${weather[activeCity].aqi > 150 ? 'bg-tertiary' : 'bg-primary'} transition-all duration-500`} style={{ width: `${Math.min(weather[activeCity].aqi / 3, 100)}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-48">
                      <p className="text-outline animate-pulse">Loading Atmospheric Data...</p>
                    </div>
                  )}
                </div>
                
                <div className="w-full md:w-64 glass-card p-6 rounded-2xl border-white/5 bg-white/5">
                  <p className="text-xs font-bold uppercase tracking-widest text-outline mb-6">Parametric Stats</p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">air</span>
                      <div>
                        <p className="text-xs text-outline">Humidity</p>
                        <p className="text-sm font-bold">{weather[activeCity]?.humidity}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary">masks</span>
                      <div>
                        <p className="text-xs text-outline">Wind Speed</p>
                        <p className="text-sm font-bold text-secondary">18 km/h</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-tertiary">thermostat</span>
                      <div>
                        <p className="text-xs text-outline">Heat Index</p>
                        <p className="text-sm font-bold">{Math.round((weather[activeCity]?.temperature || 28) + 2)}°C</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 h-32 w-full rounded-2xl bg-surface-container relative overflow-hidden grayscale">
                <img 
                  alt="City Map Overlay" 
                  className="w-full h-full object-cover opacity-30" 
                  src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=2071&auto=format&fit=crop"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-secondary rounded-full animate-pulse"></span>
                  <span className="text-xs font-bold tracking-widest uppercase">Live Vector Graphing Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Parametric Triggers Grid */}
        <section className="py-24 px-8 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <h2 className="font-headline text-4xl font-extrabold mb-4">Coverage Triggers</h2>
              <p className="text-on-surface-variant">Customise your protection based on your city&apos;s challenges.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: 'water_drop', title: 'Rain Surge', desc: 'Payout activates when rainfall exceeds 5mm/hr in your active geo-fence.', color: 'text-primary', border: 'hover:border-primary/20' },
                { icon: 'wb_sunny', title: 'Extreme Heat', desc: 'Triggers at 42°C+ to compensate for mandatory health breaks and slow delivery times.', color: 'text-secondary', border: 'hover:border-secondary/20' },
                { icon: 'cloud_off', title: 'Pollution Alert', desc: 'Health hazard compensation active when AQI crosses the \'Hazardous\' (300+) threshold.', color: 'text-tertiary', border: 'hover:border-tertiary/20' },
                { icon: 'speed', title: 'Demand Slump', desc: 'Compensates when overall platform demand drops by 40% in your sector due to local events.', color: 'text-primary', border: 'hover:border-primary/20' },
                { icon: 'cyclone', title: 'Storm Warning', desc: 'Automatic lock-in for payout when wind speeds exceed 60km/h, ensuring your safety.', color: 'text-secondary', border: 'hover:border-secondary/20' },
                { icon: 'health_and_safety', title: 'Personal Accident', desc: '24/7 kinetic monitoring for sudden impact detections, triggering immediate emergency support.', color: 'text-tertiary', border: 'hover:border-tertiary/20' },
              ].map((trigger, i) => (
                <div key={i} className={`glass-card p-8 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group border-transparent ${trigger.border}`}>
                  <span className={`material-symbols-outlined ${trigger.color} mb-6 text-3xl`} style={{ fontVariationSettings: '"FILL" 1' }}>{trigger.icon}</span>
                  <h4 className="font-bold text-xl mb-2">{trigger.title}</h4>
                  <p className="text-sm text-on-surface/60 leading-relaxed mb-6">{trigger.desc}</p>
                  <div className={`text-xs font-bold ${trigger.color} group-hover:translate-x-2 transition-transform inline-flex items-center gap-2 uppercase tracking-widest`}>
                    Configure Trigger <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-8 overflow-hidden relative">
          <div className="absolute inset-0 bg-primary/5 -z-10"></div>
          <div className="max-w-4xl mx-auto glass-card p-16 rounded-[3rem] text-center relative border-primary/20 shadow-2xl shadow-primary/5">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/20 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-secondary/20 blur-3xl rounded-full"></div>
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold mb-8">Ready to Shield your Earnings?</h2>
            <p className="text-on-surface-variant text-lg mb-12 max-w-2xl mx-auto">Join the new era of workers who don&apos;t just work hard, but work smart with AI protection.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="px-12 py-5 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                Register My Gear
              </Link>
              <button className="px-12 py-5 border border-outline-variant/30 text-on-surface font-bold rounded-2xl hover:bg-white/5 transition-all">
                Talk to an Agent
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
