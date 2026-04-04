'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface NavbarProps {
  onAboutClick?: () => void;
}

export function Navbar({ onAboutClick }: NavbarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const workerId = searchParams.get('workerId');
  
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Register', href: '/register' },
    { name: 'Dashboard', href: workerId ? `/dashboard?workerId=${workerId}` : '/dashboard' },
    { name: 'Claims', href: '/claims' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-surface/80 backdrop-blur-xl shadow-2xl shadow-indigo-500/10 py-3' : 'bg-transparent py-5'
    }`}>
      <div className="flex justify-between items-center px-8 max-w-7xl mx-auto">
        <Link href="/" className="group">
          <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-500 font-headline group-hover:from-indigo-400 group-hover:to-indigo-600 transition-all">
            GigShield
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 font-headline tracking-tight font-bold">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href.startsWith('/dashboard') && pathname === '/dashboard');
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`transition-all duration-300 relative py-1 ${
                  isActive 
                    ? 'text-indigo-300' 
                    : 'text-indigo-100/60 hover:text-indigo-100'
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-indigo-400 rounded-full animate-fade-in"></span>
                )}
              </Link>
            );
          })}
          <button 
            onClick={onAboutClick}
            className="text-indigo-100/60 hover:text-indigo-100 transition-all py-1"
          >
            About
          </button>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:block text-indigo-100 font-headline font-bold hover:text-white transition-colors">
            Login
          </Link>
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center cursor-pointer hover:bg-indigo-500/20 transition-all group">
            <span className="material-symbols-outlined text-indigo-200 group-hover:scale-110 transition-transform">account_circle</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
