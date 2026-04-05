'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { getWorkers, getClaims } from '@/lib/store';
import { Worker, Claim } from '@/lib/types';

interface NavbarProps {
  onAboutClick?: () => void;
}

export function Navbar({ onAboutClick }: NavbarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const workerId = searchParams.get('workerId');
  const { theme, toggleTheme } = useTheme();
  
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ workers: Worker[]; claims: Claim[] }>({ workers: [], claims: [] });

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const workers = getWorkers();
      const claims = getClaims();
      
      const matchedWorkers = workers.filter(w => 
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.phone.includes(searchQuery) ||
        w.location.city.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      
      const matchedClaims = claims.filter(c => 
        c.id.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      
      setSearchResults({ workers: matchedWorkers, claims: matchedClaims });
    } else {
      setSearchResults({ workers: [], claims: [] });
    }
  }, [searchQuery]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Register', href: '/register' },
    { name: 'Dashboard', href: workerId ? `/dashboard?workerId=${workerId}` : '/dashboard' },
    { name: 'Claims', href: '/claims' },
    { name: 'Admin', href: '/admin' },
    { name: 'Reports', href: '/reports' },
    { name: 'Settings', href: '/settings' },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-surface/80 backdrop-blur-xl shadow-2xl shadow-indigo-500/10 py-3' : 'bg-transparent py-5'
      }`}>
        <div className="flex justify-between items-center px-8 max-w-7xl mx-auto">
          <Link href="/" className="group">
            <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-500 font-headline group-hover:from-indigo-400 group-hover:to-indigo-600 transition-all">
              GigShield
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 font-headline tracking-tight font-bold">
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

          <div className="flex items-center gap-2">
            {/* Global Search - Desktop */}
            <div className="hidden lg:block relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all"
              >
                <span className="material-symbols-outlined text-indigo-200">search</span>
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-12 w-80 bg-surface border border-white/10 rounded-2xl shadow-2xl p-4 animate-slide-up">
                  <input
                    type="text"
                    placeholder="Search workers, claims..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-on-surface mb-3"
                    autoFocus
                  />
                  {searchResults.workers.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-2">Workers</p>
                      {searchResults.workers.map(w => (
                        <Link
                          key={w.id}
                          href={`/dashboard?workerId=${w.id}`}
                          onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                          className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-black text-primary">
                            {w.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-on-surface">{w.name}</p>
                            <p className="text-[10px] text-on-surface/50">{w.location.city}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchResults.claims.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-2">Claims</p>
                      {searchResults.claims.map(c => (
                        <Link
                          key={c.id}
                          href="/claims"
                          onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                          className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg"
                        >
                          <span className="material-symbols-outlined text-on-surface/50">receipt</span>
                          <div>
                            <p className="text-sm font-bold text-on-surface">#{c.id.slice(0, 8)}</p>
                            <p className="text-[10px] text-on-surface/50">{c.triggerType} - ₹{c.payoutAmount}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchQuery.length >= 2 && searchResults.workers.length === 0 && searchResults.claims.length === 0 && (
                    <p className="text-sm text-on-surface/50 text-center py-4">No results found</p>
                  )}
                </div>
              )}
            </div>

            {/* {mounted && (
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <span className="material-symbols-outlined text-indigo-200">
                  {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
            )} */}
            
            <Link href="/login" className="hidden md:block text-indigo-100 font-headline font-bold hover:text-white transition-colors">
              Login
            </Link>
            
            <Link 
              href={workerId ? `/profile?workerId=${workerId}` : '/dashboard'} 
              className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center cursor-pointer hover:bg-indigo-500/20 transition-all group"
            >
              <span className="material-symbols-outlined text-indigo-200 group-hover:scale-110 transition-transform">account_circle</span>
            </Link>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500/10 transition-all"
            >
              <span className="material-symbols-outlined text-indigo-200">menu</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-surface animate-fade-in">
          <div className="flex justify-between items-center p-6 border-b border-white/5">
            <Link href="/" onClick={closeMobileMenu} className="text-2xl font-black text-indigo-400">
              GigShield
            </Link>
            <button 
              onClick={closeMobileMenu}
              className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-on-surface">close</span>
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href.startsWith('/dashboard') && pathname === '/dashboard');
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={`block text-xl font-bold py-4 px-6 rounded-2xl transition-all ${
                    isActive 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'text-on-surface hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            
            <button 
              onClick={() => { onAboutClick?.(); closeMobileMenu(); }}
              className="block w-full text-xl font-bold py-4 px-6 rounded-2xl text-on-surface hover:bg-white/5"
            >
              About
            </button>
          </div>

          <div className="absolute bottom-8 left-0 right-0 px-6">
            <div className="flex justify-center gap-4 mb-6">
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-on-surface"
                >
                  <span className="material-symbols-outlined">
                    {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                  </span>
                  {theme === 'dark' ? 'Light' : 'Dark'} Mode
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}