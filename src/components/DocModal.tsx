'use client';

import { useState } from 'react';
import Link from 'next/link';

interface DocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocModal({ isOpen, onClose }: DocModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-white/10 rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto glass-card">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors">
          <span className="material-symbols-outlined text-on-surface">close</span>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">menu_book</span>
          </div>
          <h2 className="text-2xl font-headline font-black text-on-surface">GigShield Documentation</h2>
          <p className="text-primary">Platform Guide & API Reference</p>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-3">How Parametric Insurance Works</h3>
            <p className="text-on-surface/70 text-sm leading-relaxed">
              GigShield uses AI-driven parametric triggers to automatically detect income-disrupting events. 
              When weather conditions, pollution levels, or other covered triggers cross defined thresholds, 
              claims are auto-generated and payouts are processed instantly - no paperwork required.
            </p>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-3">9 Parametric Triggers</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-on-surface/70">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">water_drop</span> Rain Surge (&gt;50mm/hr)</div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-sm">wb_sunny</span> Extreme Heat (&gt;45°C)</div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-tertiary text-sm">cloud_off</span> Pollution (AQI &gt;300)</div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">flood</span> Flood Alert</div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-sm">gavel</span> Curfew/Lockdown</div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-tertiary text-sm">wifi_off</span> Platform Outage</div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">block</span> Demand Surge</div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-sm">traffic</span> Traffic Disruption</div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-tertiary text-sm">groups</span> Transport Strike</div>
            </div>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-3">Premium Calculation</h3>
            <p className="text-on-surface/70 text-sm leading-relaxed">
              Weekly premiums range from ₹25-100 based on: city risk zone, delivery platform, 
              average weekly earnings, active hours, and behavior score. AI adjusts pricing 
              dynamically based on real-time risk assessment.
            </p>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-3">API Integration</h3>
            <p className="text-on-surface/70 text-sm leading-relaxed">
              GigShield integrates with Weather APIs (OpenWeatherMap), Delivery Platforms (Zomato, Swiggy), 
              and Payment Gateways (UPI) for seamless claim processing and instant payouts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
