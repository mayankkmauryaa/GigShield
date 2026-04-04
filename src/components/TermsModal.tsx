'use client';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-white/10 rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto glass-card">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors">
          <span className="material-symbols-outlined text-on-surface">close</span>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-tertiary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-tertiary text-3xl">description</span>
          </div>
          <h2 className="text-2xl font-headline font-black text-on-surface">Terms of Service</h2>
          <p className="text-tertiary">User Agreement & Coverage Terms</p>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-3">Eligibility</h3>
            <p className="text-on-surface/70 text-sm leading-relaxed">
              GigShield coverage is available to delivery partners working with registered platforms 
              (Zomato, Swiggy, Zepto, Blinkit, Amazon, Dunzo). Must be 18+ years old with valid KYC documents.
            </p>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-3">Coverage Terms</h3>
            <p className="text-on-surface/70 text-sm leading-relaxed">
              Coverage provides income loss protection ONLY during covered events (weather, pollution, 
              curfew, platform outages). Does NOT include health insurance, life insurance, accident 
              coverage, or vehicle repair coverage.
            </p>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-3">Premium & Payment</h3>
            <div className="text-on-surface/70 text-sm space-y-2">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-tertiary text-sm">schedule</span> Weekly premium billed every 7 days</div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-tertiary text-sm">autorenew</span> Auto-renewal enabled by default</div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-tertiary text-sm">cancel</span> Cancel anytime with 24hr notice</div>
            </div>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-3">Claim Processing SLA</h3>
            <div className="text-on-surface/70 text-sm space-y-2">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-tertiary text-sm">bolt</span> Auto-claims: Processed within 5 minutes</div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-tertiary text-sm">verified</span> Manual review: Within 24 hours</div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-tertiary text-sm">payments</span> Payout disbursement: Within 30 minutes of approval</div>
            </div>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-3">Exclusions</h3>
            <div className="text-on-surface/70 text-sm space-y-2">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-error text-sm">block</span> Deliberate self-inflicted loss</div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-error text-sm">block</span> Fraudulent claims</div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-error text-sm">block</span> Under influence of alcohol/drugs</div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-error text-sm">block</span> Illegal activities</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
