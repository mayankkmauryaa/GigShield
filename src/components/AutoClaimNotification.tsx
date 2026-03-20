'use client';

import { useState, useEffect } from 'react';
import { Icons } from './Icons';

export interface AutoClaimEvent {
  id: string;
  triggerType: string;
  triggerName: string;
  location: string;
  severity: 'yellow' | 'orange' | 'red';
  affectedWorkers: number;
  claimsCreated: number;
  timestamp: Date;
}

interface AutoClaimNotificationProps {
  event: AutoClaimEvent;
  onDismiss?: () => void;
  onViewClaims?: () => void;
  autoHideDelay?: number;
}

export function AutoClaimNotification({
  event,
  onDismiss,
  onViewClaims,
  autoHideDelay = 8000,
}: AutoClaimNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / autoHideDelay) * 100);
      setProgress(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
        setIsVisible(false);
        setTimeout(() => onDismiss?.(), 300);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [autoHideDelay, onDismiss]);

  const getSeverityConfig = () => {
    switch (event.severity) {
      case 'red':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/50',
          badge: 'bg-red-500 text-white',
          icon: 'text-red-400',
          pulse: 'bg-red-500',
        };
      case 'orange':
        return {
          bg: 'bg-amber-500/20',
          border: 'border-amber-500/50',
          badge: 'bg-amber-500 text-white',
          icon: 'text-amber-400',
          pulse: 'bg-amber-500',
        };
      case 'yellow':
      default:
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/50',
          badge: 'bg-yellow-500 text-black',
          icon: 'text-yellow-400',
          pulse: 'bg-yellow-500',
        };
    }
  };

  const getTriggerIcon = () => {
    switch (event.triggerType) {
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

  const config = getSeverityConfig();

  if (!isVisible) return null;

  return (
    <div
      className={`
        ${config.bg} ${config.border}
        border rounded-2xl p-5 backdrop-blur-xl
        shadow-2xl shadow-black/30
        transform transition-all duration-300
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
        max-w-md w-full
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${config.icon} bg-white/10 rounded-xl flex items-center justify-center`}>
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>
              {getTriggerIcon()}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Auto-Claim Generated</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.badge}`}>
                {event.severity.toUpperCase()}
              </span>
              <span className="text-xs text-white/50">
                {event.location}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.pulse} animate-pulse`} />
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onDismiss?.(), 300);
            }}
            className="text-white/40 hover:text-white transition-colors"
          >
            <Icons.close />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Trigger</span>
          <span className="text-white font-medium">{event.triggerName}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Workers Affected</span>
          <span className="text-white font-medium">{event.affectedWorkers}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Claims Created</span>
          <span className="text-emerald-400 font-bold">{event.claimsCreated}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full ${config.pulse.replace('bg-', 'bg-')} transition-all`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Time & Action */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-[10px] text-white/40">
          {event.timestamp.toLocaleTimeString()}
        </span>
        <button
          onClick={onViewClaims}
          className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          View Claims <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}

interface AutoClaimNotificationContainerProps {
  events: AutoClaimEvent[];
  onDismiss: (id: string) => void;
  onViewClaims?: (event: AutoClaimEvent) => void;
}

export function AutoClaimNotificationContainer({
  events,
  onDismiss,
  onViewClaims,
}: AutoClaimNotificationContainerProps) {
  const [visibleEvents, setVisibleEvents] = useState<AutoClaimEvent[]>([]);

  useEffect(() => {
    events.forEach((event) => {
      if (!visibleEvents.find((e) => e.id === event.id)) {
        setVisibleEvents((prev) => [...prev, event]);
      }
    });
  }, [events]);

  const handleDismiss = (id: string) => {
    setVisibleEvents((prev) => prev.filter((e) => e.id !== id));
    onDismiss(id);
  };

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 max-w-md">
      {visibleEvents.map((event) => (
        <AutoClaimNotification
          key={event.id}
          event={event}
          onDismiss={() => handleDismiss(event.id)}
          onViewClaims={() => onViewClaims?.(event)}
        />
      ))}
    </div>
  );
}
