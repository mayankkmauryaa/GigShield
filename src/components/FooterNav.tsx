'use client';

import Link from 'next/link'
import { useState } from 'react'
import { Icons } from './Icons'
import { AboutModal } from './AboutModal'

export function FooterNav() {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      {/* Hackathon Footer */}
      <footer className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Icons.shield />
                </div>
                <span className="text-lg font-bold text-white">GigShield</span>
              </div>
              <p className="text-indigo-200 text-sm">
                Protecting India&apos;s gig workers from income loss.
              </p>
            </div>
            
            <div className="flex justify-end">
              <div className="text-right">
                <h4 className="font-semibold mb-2">Quick Links</h4>
                <div className="space-y-1 text-sm text-indigo-200">
                  <Link href="/" className="block hover:text-white">Home</Link>
                  <Link href="/register" className="block hover:text-white">Register</Link>
                  <Link href="/dashboard" className="block hover:text-white">Dashboard</Link>
                  <Link href="/claims" className="block hover:text-white">Claims</Link>
                  <button 
                    onClick={() => setShowAbout(true)}
                    className="block hover:text-white text-left"
                  >
                    About Us
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* About Modal */}
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
}