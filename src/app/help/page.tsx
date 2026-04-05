'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function HelpContent() {
  const searchParams = useSearchParams();
  const workerId = searchParams.get('workerId');
  const [activeCategory, setActiveCategory] = useState('getting-started');

  const categories = [
    { id: 'getting-started', label: 'Getting Started', icon: 'rocket_launch' },
    { id: 'premiums', label: 'Premiums & Pricing', icon: 'attach_money' },
    { id: 'triggers', label: 'Triggers & Coverage', icon: 'bolt' },
    { id: 'claims', label: 'Claims', icon: 'description' },
    { id: 'account', label: 'Account', icon: 'account_circle' },
  ];

  const faqs: { [key: string]: { question: string; answer: string }[] } = {
    'getting-started': [
      {
        question: 'How do I register for GigShield?',
        answer: 'Click "Get Started" on the homepage, fill in your personal details, select your delivery platform (Zomato, Swiggy, Amazon, Zepto, or Blinkit), and complete the 4-step registration process. Your coverage starts immediately after registration.',
      },
      {
        question: 'What documents do I need?',
        answer: 'You only need your Aadhaar-linked phone number for UPI payouts. No paperwork, no documents to upload - completely digital!',
      },
      {
        question: 'Which platforms are supported?',
        answer: 'GigShield works with all major delivery platforms: Zomato, Swiggy, Amazon, Zepto, and Blinkit. We support delivery partners across 7 cities in India.',
      },
      {
        question: 'How long does registration take?',
        answer: 'The entire registration process takes less than 5 minutes. Just fill in your details, select your platform, and you\'re covered!',
      },
    ],
    'premiums': [
      {
        question: 'How is my weekly premium calculated?',
        answer: 'Your premium is calculated based on your city risk zone, delivery platform, average weekly earnings, and behavior score. The AI analyzes these factors to determine a fair weekly price between ₹25-₹100.',
      },
      {
        question: 'When do I pay the premium?',
        answer: 'Premiums are auto-deducted weekly from your UPI-linked account. You only need to ensure sufficient balance.',
      },
      {
        question: 'Can I get a refund if I don\'t use the service?',
        answer: 'There\'s no refund for the current week once deducted. However, you can cancel anytime with 24-hour notice to stop future deductions.',
      },
      {
        question: 'Is there a discount for good behavior?',
        answer: 'Yes! Workers with good claim history and no fraud flags receive up to 20% discount on their premiums.',
      },
    ],
    'triggers': [
      {
        question: 'What triggers are covered?',
        answer: 'GigShield covers 9 parametric triggers: Rain Surge (50mm/hr+), Extreme Heat (45°C+), Pollution Alert (AQI 300+), Flood Alert, Curfew/Lockdown, Platform Outage, Demand Surge, Traffic Disruption, and Transport Strike.',
      },
      {
        question: 'How do I know if a trigger is active?',
        answer: 'You\'ll receive an SMS and in-app notification when a trigger activates in your area. You can also check the dashboard for active triggers.',
      },
      {
        question: 'Do I need to file a claim?',
        answer: 'No! Claims are automatically generated when covered triggers activate in your area. No paperwork needed - it\'s completely automatic!',
      },
      {
        question: 'What if multiple triggers activate at once?',
        answer: 'You receive payout for each activated trigger. There\'s no limit on the number of claims per week.',
      },
    ],
    'claims': [
      {
        question: 'How do I file a claim?',
        answer: 'You don\'t need to file claims manually! GigShield automatically detects when covered triggers activate in your area and generates claims on your behalf.',
      },
      {
        question: 'When do I get paid?',
        answer: 'Approved claims are processed within 30 minutes! Payouts are sent via UPI to your registered phone number.',
      },
      {
        question: 'How much will I receive?',
        answer: 'Payout amounts vary by trigger: Rain Surge (₹500), Extreme Heat (₹300), Pollution Alert (₹250), Flood Alert (₹750), Curfew/Lockdown (₹1000), Platform Outage (₹400), Demand Surge (₹350), Traffic Disruption (₹200), Transport Strike (₹450).',
      },
      {
        question: 'Why was my claim rejected?',
        answer: 'Claims may be rejected if: (1) GPS data shows you weren\'t in the affected area, (2) Multiple claims show suspicious patterns, (3) Behavioral analysis flags potential fraud. You can appeal rejected claims.',
      },
    ],
    'account': [
      {
        question: 'How do I update my phone number?',
        answer: 'Go to Profile page and update your phone number. Make sure it\'s linked to UPI for seamless payouts.',
      },
      {
        question: 'How do I cancel my policy?',
        answer: 'Go to Settings page and click "Cancel Policy". There\'s no cancellation fee, but you won\'t receive a refund for the current week.',
      },
      {
        question: 'How do I contact support?',
        answer: 'You can: (1) Use the Live Chat on homepage, (2) Email support@gigshield.in, (3) Call 1800-XXX-XXXX (Mon-Sat, 9AM-6PM).',
      },
      {
        question: 'Is my data secure?',
        answer: 'Yes! We use bank-level encryption and never share your personal data with third parties. Your information is completely secure.',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-on-background pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href={workerId ? `/?workerId=${workerId}` : '/'} className="inline-flex items-center gap-2 text-on-surface/60 hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Home
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold mb-4">Help Center</h1>
          <p className="text-on-surface/60 text-lg max-w-2xl mx-auto">
            Find answers to common questions about GigShield. Can&apos;t find what you&apos;re looking for? Chat with us!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-surface border border-white/10 rounded-2xl p-6 sticky top-24">
              <h3 className="font-headline font-bold text-on-surface mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeCategory === cat.id
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-on-surface/60 hover:bg-white/5 hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                    <span className="font-bold text-sm">{cat.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-8 p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
                <h4 className="font-headline font-bold text-on-surface mb-2">Still Need Help?</h4>
                <p className="text-on-surface/60 text-sm mb-4">Our support team is available 24/7</p>
                <div className="space-y-2">
                  <Link href="/chat" className="flex items-center justify-center gap-2 w-full py-2 bg-primary rounded-lg text-on-primary font-bold text-sm hover:bg-primary/90 transition-all">
                    <span className="material-symbols-outlined text-lg">chat</span>
                    Start Chat
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-surface border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary text-2xl">{categories.find(c => c.id === activeCategory)?.icon}</span>
                <h2 className="text-2xl font-headline font-bold text-on-surface">{categories.find(c => c.id === activeCategory)?.label}</h2>
              </div>

              <div className="space-y-4">
                {faqs[activeCategory].map((faq, index) => (
                  <details key={index} className="group">
                    <summary className="flex items-center justify-between p-5 bg-surface-container-low/50 rounded-xl cursor-pointer hover:bg-white/5 transition-colors list-none">
                      <span className="font-bold text-on-surface pr-4">{faq.question}</span>
                      <span className="material-symbols-outlined text-on-surface/50 group-open:rotate-180 transition-transform flex-shrink-0">expand_more</span>
                    </summary>
                    <div className="p-5 text-on-surface/70 leading-relaxed border-t border-white/5">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HelpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background text-on-background pt-24 pb-16 px-6 flex items-center justify-center">
        <div className="animate-pulse text-on-surface/60">Loading...</div>
      </div>
    }>
      <HelpContent />
    </Suspense>
  );
}
