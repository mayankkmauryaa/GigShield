'use client';

import { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { Trigger } from '@/lib/types';

interface TriggerWidgetProps {
  triggers: Trigger[];
  compact?: boolean;
}

export function TriggerWidget({ triggers, compact = false }: TriggerWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);

  const activeTriggers = triggers.filter(t => t.active);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'red':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/50',
          badge: 'bg-red-500 text-white',
          text: 'text-red-400',
          pulse: 'bg-red-500',
        };
      case 'orange':
        return {
          bg: 'bg-amber-500/20',
          border: 'border-amber-500/50',
          badge: 'bg-amber-500 text-white',
          text: 'text-amber-400',
          pulse: 'bg-amber-500',
        };
      default:
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/50',
          badge: 'bg-yellow-500 text-black',
          text: 'text-yellow-400',
          pulse: 'bg-yellow-500',
        };
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'rain':
        return 'water_drop';
      case 'heat':
        return 'wb_sunny';
      case 'pollution':
        return 'cloud_off';
      case 'flood':
        return 'flood';
      case 'curfew':
        return 'gavel';
      case 'strike':
        return 'groups';
      case 'app_outage':
        return 'wifi_off';
      case 'demand_surge':
        return 'trending_down';
      case 'traffic':
        return 'traffic';
      default:
        return 'warning';
    }
  };

  const formatDuration = (startedAt: string) => {
    const start = new Date(startedAt);
    const diff = Math.floor((currentTime.getTime() - start.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getTriggerName = (type: string) => {
    const names: Record<string, string> = {
      rain: 'Heavy Rain',
      heat: 'Extreme Heat',
      pollution: 'Pollution Alert',
      flood: 'Flood Warning',
      curfew: 'Curfew Active',
      strike: 'Transport Strike',
      app_outage: 'Platform Outage',
      demand_surge: 'Zone Blocked',
      traffic: 'Traffic Disruption',
    };
    return names[type] || type;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${activeTriggers.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`} />
          <span className="text-xs text-white/60">
            {activeTriggers.length > 0 ? `${activeTriggers.length} Active` : 'All Clear'}
          </span>
        </div>
        
        {activeTriggers.length > 0 && (
          <div className="flex -space-x-2">
            {activeTriggers.slice(0, 3).map((trigger) => {
              const config = getSeverityConfig(trigger.severity);
              return (
                <div
                  key={trigger.id}
                  className={`w-6 h-6 ${config.bg} border border-white/20 rounded-full flex items-center justify-center`}
                  title={`${getTriggerName(trigger.type)} - ${trigger.severity}`}
                >
                  <span className="material-symbols-outlined text-[10px] text-white">
                    {getTriggerIcon(trigger.type)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            activeTriggers.length > 0 
              ? 'bg-amber-500/20' 
              : 'bg-emerald-500/20'
          }`}>
            <span className={`material-symbols-outlined ${
              activeTriggers.length > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`} style={{ fontVariationSettings: '"FILL" 1' }}>
              {activeTriggers.length > 0 ? 'warning' : 'check_circle'}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Active Triggers</h3>
            <p className="text-xs text-white/50">
              {activeTriggers.length > 0 
                ? `${activeTriggers.length} ${activeTriggers.length === 1 ? 'alert' : 'alerts'} active`
                : 'No active alerts'}
            </p>
          </div>
        </div>
        
        <span className={`material-symbols-outlined text-white/40 transition-transform ${
          isExpanded ? 'rotate-180' : ''
        }`}>
          expand_more
        </span>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-white/5">
          {activeTriggers.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icons.checkCircle />
              </div>
              <p className="text-sm text-white/60">All clear! No active triggers.</p>
              <p className="text-xs text-white/30 mt-1">Workers are protected and can operate normally.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {activeTriggers.map((trigger) => {
                const config = getSeverityConfig(trigger.severity);
                return (
                  <div key={trigger.id} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 ${config.bg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <span className={`material-symbols-outlined text-sm ${config.text}`} style={{ fontVariationSettings: '"FILL" 1' }}>
                          {getTriggerIcon(trigger.type)}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">
                            {getTriggerName(trigger.type)}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${config.badge}`}>
                            {trigger.severity.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-1 text-xs text-white/50">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">location_on</span>
                            {trigger.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">schedule</span>
                            {formatDuration(trigger.startedAt)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2 text-xs">
                          <span className="text-white/60">
                            Workers: <span className="text-white font-medium">{trigger.affectedWorkers.length}</span>
                          </span>
                          <span className="text-white/60">
                            Threshold: <span className="text-white font-medium">{trigger.threshold}</span>
                          </span>
                          <span className="text-white/60">
                            Current: <span className={`font-medium ${config.text}`}>{trigger.currentValue}</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className={`w-2 h-2 rounded-full ${config.pulse} animate-pulse flex-shrink-0 mt-2`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Live Indicator */}
          <div className="p-3 bg-surface-container-lowest flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-white/40 uppercase tracking-widest">
                Live Monitoring
              </span>
            </div>
            <span className="text-[10px] text-white/30">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

interface TriggerBadgeProps {
  type: string;
  severity: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TriggerBadge({ type, severity, size = 'md' }: TriggerBadgeProps) {
  const getSeverityConfig = (sev: string) => {
    switch (sev) {
      case 'red':
        return { bg: 'bg-red-500', text: 'text-white' };
      case 'orange':
        return { bg: 'bg-amber-500', text: 'text-white' };
      default:
        return { bg: 'bg-yellow-500', text: 'text-black' };
    }
  };

  const getTriggerIcon = (t: string) => {
    switch (t) {
      case 'rain': return 'water_drop';
      case 'heat': return 'wb_sunny';
      case 'pollution': return 'cloud_off';
      case 'flood': return 'flood';
      case 'curfew': return 'gavel';
      case 'strike': return 'groups';
      case 'app_outage': return 'wifi_off';
      case 'demand_surge': return 'trending_down';
      case 'traffic': return 'traffic';
      default: return 'warning';
    }
  };

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const config = getSeverityConfig(severity);

  return (
    <span 
      className={`
        inline-flex items-center gap-1 font-bold rounded-full
        ${config.bg} ${config.text}
        ${sizeClasses[size]}
      `}
    >
      <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: '"FILL" 1' }}>
        {getTriggerIcon(type)}
      </span>
      {severity.toUpperCase()}
    </span>
  );
}
