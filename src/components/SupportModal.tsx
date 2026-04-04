'use client';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
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
            <span className="material-symbols-outlined text-primary text-3xl">support_agent</span>
          </div>
          <h2 className="text-2xl font-headline font-black text-on-surface">Support Center</h2>
          <p className="text-primary">We are Here to Help</p>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-3">Contact Options</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <span className="material-symbols-outlined text-primary">email</span>
                <div>
                  <p className="text-on-surface text-sm font-bold">Email Support</p>
                  <p className="text-on-surface/60 text-xs">support@gigshield.in</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <span className="material-symbols-outlined text-secondary">phone</span>
                <div>
                  <p className="text-on-surface text-sm font-bold">Helpline</p>
                  <p className="text-on-surface/60 text-xs">1800-XXX-XXXX (Mon-Sat, 9AM-6PM)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <span className="material-symbols-outlined text-tertiary">chat</span>
                <div>
                  <p className="text-on-surface text-sm font-bold">WhatsApp</p>
                  <p className="text-on-surface/60 text-xs">+91-XXXXX-XXXXX</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-3">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div>
                <p className="text-on-surface text-sm font-bold mb-1">Q: How do I file a claim?</p>
                <p className="text-on-surface/70 text-xs">A: Claims are auto-filed when triggers activate. No paperwork needed!</p>
              </div>
              <div>
                <p className="text-on-surface text-sm font-bold mb-1">Q: When do I get paid?</p>
                <p className="text-on-surface/70 text-xs">A: Payouts are processed within 30 minutes of claim approval.</p>
              </div>
              <div>
                <p className="text-on-surface text-sm font-bold mb-1">Q: How is premium calculated?</p>
                <p className="text-on-surface/70 text-xs">A: Based on your city risk, platform, earnings, and activity hours.</p>
              </div>
              <div>
                <p className="text-on-surface text-sm font-bold mb-1">Q: Can I cancel my policy?</p>
                <p className="text-on-surface/70 text-xs">A: Yes, cancel anytime with 24-hour notice. No questions asked.</p>
              </div>
              <div>
                <p className="text-on-surface text-sm font-bold mb-1">Q: What events are covered?</p>
                <p className="text-on-surface/70 text-xs">A: 9 triggers: rain, heat, pollution, flood, curfew, app outage, demand surge, traffic, strike.</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-3">Response Time</h3>
            <div className="text-on-surface/70 text-sm space-y-2">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">schedule</span> Email: Within 24 hours</div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-sm">schedule</span> Phone: Immediate (during business hours)</div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-tertiary text-sm">schedule</span> WhatsApp: Within 4 hours</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
