'use client';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-white/10 rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto glass-card">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors">
          <span className="material-symbols-outlined text-on-surface">close</span>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-secondary text-3xl">privacy_tip</span>
          </div>
          <h2 className="text-2xl font-headline font-black text-on-surface">Privacy Policy</h2>
          <p className="text-secondary">Your Data is Protected</p>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-3">Data Collection</h3>
            <p className="text-on-surface/70 text-sm leading-relaxed">
              We collect only essential data required for insurance coverage: name, phone number, 
              Aadhaar for KYC, delivery platform ID, location coordinates, and earnings information. 
              No unnecessary personal data is collected or stored.
            </p>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-3">Data Encryption</h3>
            <p className="text-on-surface/70 text-sm leading-relaxed">
              All sensitive data including Aadhaar numbers and personal information is encrypted 
              using AES-256 encryption. We utilize hardware-level security modules (HSM) for 
              KYC validation and key management.
            </p>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-3">Data Usage</h3>
            <p className="text-on-surface/70 text-sm leading-relaxed">
              Your data is used exclusively for: policy issuance, premium calculation, claims processing, 
              and compliance with regulatory requirements. We never sell or share your data with 
              third parties for marketing purposes.
            </p>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-3">Your Rights</h3>
            <div className="text-on-surface/70 text-sm space-y-2">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-sm">check_circle</span> Right to access your data</div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-sm">check_circle</span> Right to data portability</div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-sm">check_circle</span> Right to data deletion</div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-sm">check_circle</span> Right to opt-out</div>
            </div>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-3">Contact</h3>
            <p className="text-on-surface/70 text-sm leading-relaxed">
              For privacy concerns, contact our Data Protection Officer at: 
              <span className="text-primary font-bold"> privacy@gigshield.in</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
