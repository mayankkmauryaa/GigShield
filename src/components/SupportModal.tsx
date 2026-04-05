'use client';

import { useState } from 'react';
import { ChatWidget } from './ChatWidget';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'faq' | 'contact' | 'chat';
}

export function SupportModal({ isOpen, onClose, defaultTab = 'faq' }: SupportModalProps) {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'chat'>(defaultTab);
  const [showChat, setShowChat] = useState(false);

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

  const tabs = [
    { id: 'faq', label: 'FAQ', icon: 'help' },
    { id: 'contact', label: 'Contact', icon: 'contact_phone' },
    { id: 'chat', label: 'Live Chat', icon: 'chat' },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-surface border border-white/10 rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto glass-card">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-on-surface">close</span>
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">support_agent</span>
            </div>
            <h2 className="text-2xl font-headline font-black text-on-surface">Help & Support</h2>
            <p className="text-on-surface/70 text-sm">We&apos;re here to help you 24/7</p>
          </div>

          <div className="flex gap-2 mb-6 border-b border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'faq' | 'contact' | 'chat')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-t-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary border-b-2 border-primary'
                    : 'text-on-surface/60 hover:text-on-surface hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                <span className="font-bold text-sm">{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === 'faq' && (
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <details key={index} className="group">
                  <summary className="flex items-center justify-between p-4 bg-surface-container-low/50 rounded-xl cursor-pointer hover:bg-white/5 transition-colors list-none">
                    <span className="font-bold text-on-surface text-sm">{faq.question}</span>
                    <span className="material-symbols-outlined text-on-surface/50 group-open:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <div className="p-4 text-on-surface/70 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="p-6 bg-surface-container-low/50 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-400">phone</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-on-surface">Call Us</h4>
                    <p className="text-sm text-on-surface/60">Mon-Sat, 9AM-6PM</p>
                  </div>
                </div>
                <a href="tel:18001234567" className="block w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold text-center rounded-xl transition-all">
                  1800-XXX-XXXX
                </a>
              </div>

              <div className="p-6 bg-surface-container-low/50 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-400">email</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-on-surface">Email Support</h4>
                    <p className="text-sm text-on-surface/60">We reply within 24 hours</p>
                  </div>
                </div>
                <a href="mailto:support@gigshield.in" className="block w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-center rounded-xl transition-all">
                  support@gigshield.in
                </a>
              </div>

              <div className="p-6 bg-surface-container-low/50 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-purple-400">chat</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-on-surface">WhatsApp</h4>
                    <p className="text-sm text-on-surface/60">Quick responses</p>
                  </div>
                </div>
                <button onClick={() => setActiveTab('chat')} className="block w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold text-center rounded-xl transition-all">
                  Start Chat
                </button>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-yellow-400">info</span>
                  <div>
                    <p className="text-sm text-yellow-200 font-bold">Emergency Support</p>
                    <p className="text-xs text-yellow-200/70 mt-1">For urgent claims assistance outside working hours, call our 24/7 emergency line.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-white text-4xl">support_agent</span>
              </div>
              <h3 className="text-xl font-headline font-bold text-on-surface mb-2">Start a Conversation</h3>
              <p className="text-on-surface/60 text-sm mb-6">Our AI-powered assistant is available 24/7 to help you instantly.</p>
              <button
                onClick={() => setShowChat(true)}
                className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-xl hover:scale-105 transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">chat</span>
                  Start Live Chat
                </span>
              </button>
              <p className="text-xs text-on-surface/50 mt-4">Average response time: &lt; 1 minute</p>
            </div>
          )}
        </div>
      </div>

      <ChatWidget isOpen={showChat} onClose={() => setShowChat(false)} />
    </>
  );
}
