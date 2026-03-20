'use client';

import { useState, Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AboutModal } from '@/components/AboutModal';
import { NotificationProvider } from '@/components/NotificationProvider';

function NavbarFallback() {
  return (
    <div className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl py-5 px-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="w-32 h-8 bg-surface-container animate-pulse rounded"></div>
        <div className="flex gap-8">
          <div className="w-16 h-6 bg-surface-container animate-pulse rounded"></div>
          <div className="w-20 h-6 bg-surface-container animate-pulse rounded"></div>
          <div className="w-20 h-6 bg-surface-container animate-pulse rounded"></div>
          <div className="w-16 h-6 bg-surface-container animate-pulse rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-surface flex flex-col font-body selection:bg-primary/20 transition-colors duration-500">
        <Suspense fallback={<NavbarFallback />}>
          <Navbar onAboutClick={() => setShowAbout(true)} />
        </Suspense>
        
        <main className="flex-1 bg-surface">
          {children}
        </main>
        
        <Footer />
        
        {/* About Modal */}
        <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      </div>
    </NotificationProvider>
  );
}
