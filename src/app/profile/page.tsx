'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getWorker, getPolicyByWorker, getClaimsByWorker, updateWorker } from '@/lib/store';
import { Worker, Policy, Claim } from '@/lib/types';
import { formatCurrency } from '@/lib/integrations/payment-sim';

function ProfileContent() {
  const searchParams = useSearchParams();
  const workerId = searchParams.get('workerId');
  
  const [worker, setWorker] = useState<Worker | null>(null);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (workerId) {
      const w = getWorker(workerId);
      if (w) {
        setWorker(w);
        setPolicy(getPolicyByWorker(w.id) || null);
        setClaims(getClaimsByWorker(w.id));
        setEditForm({
          name: w.name,
          phone: w.phone,
          email: w.email,
        });
      }
    } else {
      const workers = require('@/lib/store').getWorkers();
      if (workers.length > 0) {
        const w = workers[0];
        setWorker(w);
        setPolicy(getPolicyByWorker(w.id) || null);
        setClaims(getClaimsByWorker(w.id));
        setEditForm({
          name: w.name,
          phone: w.phone,
          email: w.email,
        });
      }
    }
  }, [workerId]);

  const handleSave = () => {
    if (worker) {
      const updated = updateWorker(worker.id, {
        name: editForm.name,
        phone: editForm.phone,
        email: editForm.email,
      });
      if (updated) {
        setWorker(updated);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    }
  };

  if (!worker) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-on-surface/30">person_off</span>
          <p className="text-on-surface/60 mt-4">No worker found</p>
        </div>
      </div>
    );
  }

  const totalPaid = claims.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.payoutAmount, 0);

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/30">
      <main className="pt-24 pb-12 px-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/dashboard?workerId=${worker.id}`} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="text-3xl font-headline font-black">My Profile</h1>
        </div>

        {saveSuccess && (
          <div className="mb-6 p-4 bg-secondary/10 border border-secondary/20 rounded-xl flex items-center gap-3 animate-slide-up">
            <span className="material-symbols-outlined text-secondary">check_circle</span>
            <p className="text-sm font-bold text-secondary">Profile updated successfully!</p>
          </div>
        )}

        <div className="grid gap-8">
          <div className="glass-card p-8 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-black text-primary">
                  {worker.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-2xl font-headline font-black">{worker.name}</h2>
                  <p className="text-on-surface/60">{worker.platform} • {worker.location.city}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-surface-container-high rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-on-surface/50 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-on-surface/50 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-on-surface/50 mb-2">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-on-surface"
                  />
                </div>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/90 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-1">Phone</p>
                  <p className="font-bold">{worker.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-1">Email</p>
                  <p className="font-bold">{worker.email}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-1">Aadhaar</p>
                  <p className="font-bold">•••• •••• {worker.aadhaarNumber.slice(-4)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-1">Location</p>
                  <p className="font-bold">{worker.location.city}, {worker.location.state}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-1">Pincode</p>
                  <p className="font-bold">{worker.location.pincode}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-1">Behavior Score</p>
                  <p className="font-bold">{worker.behaviorScore}/100</p>
                </div>
              </div>
            )}
          </div>

          {policy && (
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-lg font-headline font-black mb-6">Policy Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-1">Policy Number</p>
                  <p className="font-bold">{policy.policyNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-1">Weekly Premium</p>
                  <p className="font-bold">{formatCurrency(policy.weeklyPremium)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-1">Max Coverage</p>
                  <p className="font-bold">{formatCurrency(policy.maxCoverage)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-1">Status</p>
                  <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full uppercase">
                    {policy.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-6 rounded-2xl">
              <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-2">Total Claims</p>
              <p className="text-2xl font-headline font-black">{claims.length}</p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-2">Total Paid</p>
              <p className="text-2xl font-headline font-black text-secondary">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-2">Tenure</p>
              <p className="text-2xl font-headline font-black">{worker.tenure} months</p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <p className="text-[10px] uppercase tracking-widest text-on-surface/50 mb-2">Weekly Earnings</p>
              <p className="text-2xl font-headline font-black">{formatCurrency(worker.avgWeeklyEarnings)}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}