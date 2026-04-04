'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DocModal } from './DocModal';
import { PrivacyModal } from './PrivacyModal';
import { TermsModal } from './TermsModal';
import { SupportModal } from './SupportModal';

export function Footer() {
  const [showDoc, setShowDoc] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  return (
    <footer className="w-full py-20 px-8 mt-auto border-t border-white/5 bg-surface relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-indigo-400 text-sm">shield</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-500 font-headline">
              GigShield
            </span>
          </div>
          <p className="font-body text-base leading-relaxed text-on-surface/70 max-w-md">
            Revolutionizing gig economy protection through AI-driven parametric insurance.
            Real-time weather monitoring, instant payouts, and zero-effort claims.
          </p>
          <div className="flex gap-4">
            <a href="https://twitter.com/gigshield" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all text-on-surface-variant/60 hover:text-indigo-400">
              <i className="fa-brands fa-twitter"></i>
            </a>
            <a href="https://www.linkedin.com/in/mayankmaurya05/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all text-on-surface-variant/60 hover:text-indigo-400">
              <i className="fa-brands fa-linkedin-in"></i>
            </a>
            <a href="https://github.com/mayankkmauryaa" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all text-on-surface-variant/60 hover:text-indigo-400">
              <i className="fa-brands fa-github"></i>
            </a>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="font-headline font-bold text-sm uppercase tracking-widest text-indigo-300/80">Platform</h4>
          <ul className="space-y-4">
            <li><Link href="/register" className="text-on-surface/60 hover:text-indigo-300 transition-colors text-sm font-body">Get Started</Link></li>
            <li><Link href="/login" className="text-on-surface/60 hover:text-indigo-300 transition-colors text-sm font-body">Login</Link></li>
            <li><Link href="/dashboard" className="text-on-surface/60 hover:text-indigo-300 transition-colors text-sm font-body">Worker Dashboard</Link></li>
            <li><Link href="/claims" className="text-on-surface/60 hover:text-indigo-300 transition-colors text-sm font-body">Claims Portal</Link></li>
            <li><Link href="/admin" className="text-on-surface/60 hover:text-indigo-300 transition-colors text-sm font-body">Admin Console</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="font-headline font-bold text-sm uppercase tracking-widest text-indigo-300/80">Resources</h4>
          <ul className="space-y-4">
            <li><button onClick={() => setShowDoc(true)} className="text-on-surface/60 hover:text-indigo-300 transition-colors text-sm font-body text-left">Documentation</button></li>
            <li><button onClick={() => setShowPrivacy(true)} className="text-on-surface/60 hover:text-indigo-300 transition-colors text-sm font-body text-left">Privacy Policy</button></li>
            <li><button onClick={() => setShowTerms(true)} className="text-on-surface/60 hover:text-indigo-300 transition-colors text-sm font-body text-left">Terms of Service</button></li>
            <li><button onClick={() => setShowSupport(true)} className="text-on-surface/60 hover:text-indigo-300 transition-colors text-sm font-body text-left">Support Center</button></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-body text-xs tracking-wide text-on-surface/50">
          © 2026 GigShield Technologies. All rights reserved. Built for the future of work.
        </p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-body text-[10px] uppercase tracking-tighter text-on-surface/60">Systems Operational</span>
        </div>
      </div>

      <DocModal isOpen={showDoc} onClose={() => setShowDoc(false)} />
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <SupportModal isOpen={showSupport} onClose={() => setShowSupport(false)} />
    </footer>
  );
}
