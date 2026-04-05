'use client';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  const faqs = [
    {
      question: 'How do I register for GigShield?',
      answer: 'Click "Get Started" on the homepage, fill in your personal details, select your delivery platform, and complete the 4-step registration process. Your coverage starts immediately.',
    },
    {
      question: 'How is my weekly premium calculated?',
      answer: 'Your premium is calculated based on your city risk zone, delivery platform, average weekly earnings, and behavior score. The AI analyzes these factors to determine a fair weekly price between ₹25-₹100.',
    },
    {
      question: 'What triggers are covered?',
      answer: 'GigShield covers 9 parametric triggers: Rain Surge (50mm/hr+), Extreme Heat (45°C+), Pollution Alert (AQI 300+), Flood Alert, Curfew/Lockdown, Platform Outage, Demand Surge, Traffic Disruption, and Transport Strike.',
    },
    {
      question: 'How do I file a claim?',
      answer: 'Claims are automatically generated when covered triggers activate in your area. No paperwork needed! You\'ll receive a notification when a claim is created on your behalf.',
    },
    {
      question: 'When do I get paid?',
      answer: 'Approved claims are processed within 30 minutes. Payouts are sent via UPI to your registered phone number.',
    },
    {
      question: 'How does fraud detection work?',
      answer: 'Our AI analyzes multiple factors including GPS location, claim patterns, behavioral history, and weather correlation to detect and prevent fraudulent claims.',
    },
    {
      question: 'Can I cancel my policy?',
      answer: 'Yes, you can cancel anytime with 24-hour notice. There\'s no cancellation fee, but you won\'t receive a refund for the current week.',
    },
    {
      question: 'How do I contact support?',
      answer: 'You can reach us at support@gigshield.in or call our helpline at 1800-XXX-XXXX (Mon-Sat, 9AM-6PM).',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-white/10 rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto glass-card">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors">
          <span className="material-symbols-outlined text-on-surface">close</span>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">help</span>
          </div>
          <h2 className="text-2xl font-headline font-black text-on-surface">Help Center</h2>
          <p className="text-primary">Frequently Asked Questions</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details key={index} className="group">
              <summary className="flex items-center justify-between p-4 bg-surface-container-low/50 rounded-xl cursor-pointer hover:bg-white/5 transition-colors list-none">
                <span className="font-bold text-on-surface">{faq.question}</span>
                <span className="material-symbols-outlined text-on-surface/50 group-open:rotate-180 transition-transform">expand_more</span>
              </summary>
              <div className="p-4 text-on-surface/70 text-sm leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-8 p-6 bg-primary/5 border border-primary/10 rounded-2xl">
          <h4 className="font-headline font-bold text-on-surface mb-2">Still Need Help?</h4>
          <p className="text-on-surface/70 text-sm mb-4">Contact our support team for personalized assistance.</p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-on-surface/70">
              <span className="material-symbols-outlined text-primary text-sm">email</span>
              support@gigshield.in
            </div>
            <div className="flex items-center gap-2 text-sm text-on-surface/70">
              <span className="material-symbols-outlined text-primary text-sm">phone</span>
              1800-XXX-XXXX
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}