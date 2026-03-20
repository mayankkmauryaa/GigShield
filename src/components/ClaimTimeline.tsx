'use client';

import { Icons } from './Icons';
import { Claim } from '@/lib/types';

interface ClaimTimelineProps {
  claim: Claim;
  showDetails?: boolean;
}

export function ClaimTimeline({ claim, showDetails = true }: ClaimTimelineProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          bg: 'bg-emerald-500/20',
          border: 'border-emerald-500/50',
          icon: 'check_circle',
          iconColor: 'text-emerald-400',
          text: 'text-emerald-400',
          label: 'Paid',
        };
      case 'approved':
        return {
          bg: 'bg-primary/20',
          border: 'border-primary/50',
          icon: 'verified',
          iconColor: 'text-primary',
          text: 'text-primary',
          label: 'Approved',
        };
      case 'pending':
        return {
          bg: 'bg-amber-500/20',
          border: 'border-amber-500/50',
          icon: 'schedule',
          iconColor: 'text-amber-400',
          text: 'text-amber-400',
          label: 'Pending',
        };
      case 'rejected':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/50',
          icon: 'cancel',
          iconColor: 'text-red-400',
          text: 'text-red-400',
          label: 'Rejected',
        };
      case 'fraud':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/50',
          icon: 'gpp_bad',
          iconColor: 'text-red-400',
          text: 'text-red-400',
          label: 'Fraud Detected',
        };
      default:
        return {
          bg: 'bg-white/10',
          border: 'border-white/20',
          icon: 'help',
          iconColor: 'text-white/60',
          text: 'text-white/60',
          label: status,
        };
    }
  };

  const config = getStatusConfig(claim.status);

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const triggeredAt = formatDate(claim.triggeredAt);
  const createdAt = formatDate(claim.createdAt);
  const approvedAt = formatDate(claim.approvedAt);
  const paidAt = formatDate(claim.paidAt);

  const hasFraud = claim.fraudCheck && !claim.fraudCheck.passed;

  return (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} ${config.border} border`}>
        <span className={`material-symbols-outlined text-sm ${config.iconColor}`} style={{ fontVariationSettings: '"FILL" 1' }}>
          {config.icon}
        </span>
        <span className={`text-sm font-bold ${config.text}`}>
          {config.label}
        </span>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {/* Triggered */}
        <TimelineItem 
          icon="flash_on"
          title="Trigger Activated"
          description={claim.description}
          timestamp={triggeredAt}
          color="text-amber-400"
        />

        {/* Claim Created */}
        <TimelineItem 
          icon="description"
          title="Claim Created"
          description={`${claim.hoursAffected} hours affected @ ₹${claim.hourlyRate}/hr`}
          timestamp={createdAt}
          color="text-blue-400"
        />

        {/* Fraud Check */}
        <TimelineItem 
          icon={hasFraud ? "security" : "verified_user"}
          title={hasFraud ? "Fraud Flagged" : "Fraud Check Passed"}
          description={hasFraud 
            ? `${claim.fraudCheck.flags.length} flags detected`
            : 'All checks passed'
          }
          color={hasFraud ? "text-red-400" : "text-emerald-400"}
          details={hasFraud ? claim.fraudCheck.flags : undefined}
          fraudLevel={hasFraud ? claim.fraudCheck.level : undefined}
        />

        {/* Approved */}
        {(claim.status === 'approved' || claim.status === 'paid') && (
          <TimelineItem 
            icon="approval"
            title="Claim Approved"
            description="Ready for payout"
            timestamp={approvedAt}
            color="text-primary"
          />
        )}

        {/* Paid */}
        {claim.status === 'paid' && (
          <TimelineItem 
            icon="payments"
            title="Payment Processed"
            description={`₹${claim.payoutAmount.toLocaleString('en-IN')} credited`}
            timestamp={paidAt}
            color="text-emerald-400"
            isLast
          />
        )}

        {/* Fraud */}
        {(claim.status === 'fraud' || claim.status === 'rejected') && (
          <TimelineItem 
            icon="block"
            title={claim.status === 'fraud' ? "Fraud Detected" : "Claim Rejected"}
            description={claim.deductionReason || "Review required"}
            timestamp={approvedAt}
            color="text-red-400"
            isLast
          />
        )}
      </div>

      {/* Summary Card */}
      {showDetails && (
        <div className="mt-4 p-4 bg-surface-container-low rounded-xl space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Hours Affected</span>
            <span className="text-white font-medium">{claim.hoursAffected} hrs</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Hourly Rate</span>
            <span className="text-white font-medium">₹{claim.hourlyRate}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-white/10 pt-3">
            <span className="text-white/50">Payout Amount</span>
            <span className={`font-bold ${config.text}`}>
              ₹{claim.payoutAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

interface TimelineItemProps {
  icon: string;
  title: string;
  description: string;
  timestamp?: { date: string; time: string } | null;
  color: string;
  details?: string[];
  fraudLevel?: string;
  isLast?: boolean;
}

function TimelineItem({ 
  icon, 
  title, 
  description, 
  timestamp, 
  color,
  details,
  fraudLevel,
  isLast = false 
}: TimelineItemProps) {
  return (
    <div className="relative pl-6 pb-4">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gradient-to-b from-white/20 to-transparent" />
      )}

      {/* Timeline Dot */}
      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full bg-surface-container flex items-center justify-center ${color}`}>
        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: '"FILL" 1' }}>
          {icon}
        </span>
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">{title}</span>
          {timestamp && (
            <span className="text-[10px] text-white/30">
              {timestamp.date} {timestamp.time}
            </span>
          )}
        </div>
        <p className="text-xs text-white/50 mt-0.5">{description}</p>
        
        {/* Fraud Flags */}
        {details && details.length > 0 && (
          <div className="mt-2 space-y-1">
            {details.map((flag, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="material-symbols-outlined text-[10px] text-red-400">warning</span>
                <span className="text-red-300/80">{flag}</span>
              </div>
            ))}
            {fraudLevel && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-white/40">Risk Level:</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  fraudLevel === 'high' ? 'bg-red-500/20 text-red-400' :
                  fraudLevel === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {fraudLevel.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface ClaimStatusFlowProps {
  status: string;
}

export function ClaimStatusFlow({ status }: ClaimStatusFlowProps) {
  const steps = [
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'paid', label: 'Paid' },
  ];

  if (status === 'fraud' || status === 'rejected') {
    return (
      <div className="flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-bold">
          {status === 'fraud' ? 'Fraud Detected' : 'Rejected'}
        </div>
      </div>
    );
  }

  const currentIndex = steps.findIndex(s => s.key === status);

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isPending = idx > currentIndex;

        return (
          <div key={step.key} className="flex items-center">
            <div 
              className={`
                px-3 py-1.5 rounded-full text-xs font-bold
                ${isCompleted ? 'bg-emerald-500 text-white' : ''}
                ${isCurrent ? 'bg-primary/30 text-primary border border-primary/50' : ''}
                ${isPending ? 'bg-white/5 text-white/30 border border-white/10' : ''}
              `}
            >
              {step.label}
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-4 h-px ${idx < currentIndex ? 'bg-emerald-500' : 'bg-white/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
