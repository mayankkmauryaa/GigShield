'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getWorker, getWorkers } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const workers = getWorkers();
      let foundWorker = null;

      // Search by Worker ID
      if (input.startsWith('worker-')) {
        foundWorker = getWorker(input.trim());
      }
      
      // Search by Phone number
      if (!foundWorker) {
        for (const w of workers) {
          if (w.phone.replace(/\D/g, '') === input.replace(/\D/g, '')) {
            foundWorker = w;
            break;
          }
        }
      }

      // Search by partial name match
      if (!foundWorker) {
        for (const w of workers) {
          if (w.name.toLowerCase().includes(input.toLowerCase())) {
            foundWorker = w;
            break;
          }
        }
      }

      if (foundWorker) {
        router.push(`/dashboard?workerId=${foundWorker.id}`);
      } else {
        setError('Worker not found. Please check your credentials or register as a new user.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }

    setLoading(false);
  };

  const sampleWorkers = Array.from(getWorkers().values()).slice(0, 5);

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/30 flex flex-col">
      <main className="flex-grow pt-32 pb-20 px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-4xl">login</span>
            </div>
            <h1 className="font-headline text-4xl md:text-5xl text-primary font-extrabold tracking-tighter mb-4">
              Welcome Back
            </h1>
            <p className="text-on-surface/70 font-body text-lg max-w-xl">
              Enter your credentials to access your personalized dashboard
            </p>
          </div>

          {/* Login Form */}
          <div className="glass-card rounded-2xl p-8 shadow-2xl relative overflow-hidden animate-slide-up">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-black text-primary mb-3">
                  Worker ID, Phone, or Name
                </label>
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full bg-surface-container-low border-0 border-b border-outline-variant py-4 focus:ring-2 focus:ring-primary transition-all font-body text-on-surface placeholder:text-on-surface/30 text-lg"
                  placeholder="worker-xxx or +91 98765 43210"
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error flex items-center gap-3">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <p className="text-sm font-bold">{error}</p>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading || !input.trim()}
                className="w-full kinetic-gradient py-4 rounded-xl font-headline font-black text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">login</span>
                    Access Dashboard
                  </>
                )}
              </button>
            </form>

            {/* Sample Workers for Demo */}
            {sampleWorkers.length > 0 && (
              <div className="mt-8 pt-8 border-t border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-4 text-center">
                  Demo: Click to login as existing worker
                </p>
                <div className="space-y-2">
                  {sampleWorkers.map((worker) => (
                    <button
                      key={worker.id}
                      onClick={() => router.push(`/dashboard?workerId=${worker.id}`)}
                      className="w-full p-3 bg-surface-container-low/50 rounded-xl border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-between text-left"
                    >
                      <div>
                        <p className="text-sm font-bold text-on-surface">{worker.name}</p>
                        <p className="text-[10px] text-on-surface/50">{worker.platform} • {worker.location.city}</p>
                      </div>
                      <span className="text-[10px] text-primary font-mono">{worker.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Register Link */}
          <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '100ms' }}>
            <p className="text-on-surface/60 text-sm">
              New here?{' '}
              <Link href="/register" className="text-primary font-bold hover:underline">
                Register as a new worker
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Link href="/" className="text-on-surface/50 text-sm hover:text-primary transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
