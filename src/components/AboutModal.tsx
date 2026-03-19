'use client';

import { Icons } from './Icons';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Icons.close />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icons.shield />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">GigShield</h2>
          <p className="text-indigo-600">Parametric Insurance Platform</p>
        </div>

        {/* Competition Info */}
        <div className="space-y-6">
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Competition Details</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-indigo-600">Event:</span> <span className="text-gray-700">Guidewire DEVTrails 2026</span></p>
              <p><span className="text-indigo-600">Partner:</span> <span className="text-gray-700">EY</span></p>
              <p><span className="text-indigo-600">Phase:</span> <span className="text-gray-700">Seed (Phase 1)</span></p>
              <p><span className="text-indigo-600">Deadline:</span> <span className="text-gray-700">March 20th</span></p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Team XAX</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                <span className="font-medium text-gray-900">Mayank Maurya</span>
                <span className="text-indigo-600"> (Leader)</span>
              </p>
              <p className="text-gray-700">Mohit Jadon</p>
              <p className="text-gray-700">Aditya Kumar</p>
              <p className="text-gray-700">Mukul Sharma</p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">What We Built</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <Icons.checkCircle />
                <span>Parametric insurance for gig workers</span>
              </li>
              <li className="flex items-center gap-2">
                <Icons.checkCircle />
                <span>Weekly premium pricing model (₹25-100)</span>
              </li>
              <li className="flex items-center gap-2">
                <Icons.checkCircle />
                <span>5 parametric triggers (rain, heat, pollution, flood, curfew)</span>
              </li>
              <li className="flex items-center gap-2">
                <Icons.checkCircle />
                <span>GPS spoofing & ring fraud detection</span>
              </li>
              <li className="flex items-center gap-2">
                <Icons.checkCircle />
                <span>Auto-claim processing with instant payouts</span>
              </li>
            </ul>
          </div>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              Made by <span className="text-gray-900 font-medium">XAX Team</span> for Guidewire DEVTrails 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}