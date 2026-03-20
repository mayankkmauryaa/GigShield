'use client';

import { useState, useEffect } from 'react';
import { getClaims, getWorker, updateClaim, getClaimsByWorker, getPolicies, getWorkers } from '@/lib/store';
import { processPayment } from '@/lib/integrations/payment-sim';
import { analyzeFraud } from '@/lib/ai/fraud-detector';
import { Claim, Worker, Policy } from '@/lib/types';
import { formatCurrency } from '@/lib/integrations/payment-sim';
import { ClaimTimeline, ClaimStatusFlow } from '@/components/ClaimTimeline';
import { LoadingSpinner } from '@/components/LoadingStates';

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [workers, setWorkers] = useState<Map<string, Worker>>(new Map());
  const [policies, setPolicies] = useState<Map<string, Policy>>(new Map());
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'paid' | 'fraud'>('all');
  const [triggerFilter, setTriggerFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const allClaims = getClaims();
    const sorted = allClaims.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setClaims(sorted);
    if (sorted.length > 0 && !selectedClaim) {
      setSelectedClaim(sorted[0]);
    }

    const allWorkers = getWorkers();
    const workerMap = new Map();
    allWorkers.forEach(w => workerMap.set(w.id, w));
    setWorkers(workerMap);

    const policyMap = new Map();
    getPolicies().forEach(p => policyMap.set(p.id, p));
    setPolicies(policyMap);
  }, []);

  const filteredClaims = claims.filter(claim => {
    if (filter !== 'all' && claim.status !== filter) return false;
    if (triggerFilter !== 'all' && claim.triggerType !== triggerFilter) return false;
    if (searchTerm) {
      const worker = workers.get(claim.workerId);
      const searchLower = searchTerm.toLowerCase();
      return (
        claim.id.toLowerCase().includes(searchLower) ||
        worker?.name.toLowerCase().includes(searchLower) ||
        worker?.location.city.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handleApprove = async (claim: Claim) => {
    setProcessingId(claim.id);
    await new Promise(resolve => setTimeout(resolve, 800));
    const fraudResult = analyzeFraud(claim);
    
    const updated = updateClaim(claim.id, {
      status: fraudResult.passed ? 'approved' : 'fraud',
      fraudCheck: {
        passed: fraudResult.passed,
        score: fraudResult.score,
        flags: fraudResult.flags,
        level: fraudResult.level,
      },
      approvedAt: new Date().toISOString(),
    });

    if (updated) {
      setClaims(prev => prev.map(c => c.id === claim.id ? updated : c));
      setSelectedClaim(updated);
      setNotification({
        type: 'success',
        message: fraudResult.passed 
          ? `Claim approved! Payout of ${formatCurrency(claim.payoutAmount)} ready.`
          : `Claim flagged for review. Risk Score: ${fraudResult.score}/100`,
      });
    }
    setProcessingId(null);
  };

  const handlePay = async (claim: Claim) => {
    setProcessingId(claim.id);
    const result = await processPayment(claim.id);
    
    if (result.success) {
      const updated = getClaims().find(c => c.id === claim.id);
      if (updated) {
        setClaims(prev => prev.map(c => c.id === claim.id ? updated : c));
        setSelectedClaim(updated);
      }
      setNotification({
        type: 'success',
        message: `Payment successful! Total: ${formatCurrency(result.amount || 0)}`,
      });
    } else {
      setNotification({ type: 'error', message: result.message });
    }
    setProcessingId(null);
  };

  const handleReject = (claim: Claim) => {
    const updated = updateClaim(claim.id, { status: 'rejected' });
    if (updated) {
      setClaims(prev => prev.map(c => c.id === claim.id ? updated : c));
      setSelectedClaim(updated);
      setNotification({ type: 'error', message: 'Claim rejected.' });
    }
  };

  const stats = {
    total: claims.length,
    pending: claims.filter(c => c.status === 'pending').length,
    approved: claims.filter(c => c.status === 'approved').length,
    paid: claims.filter(c => c.status === 'paid').length,
    fraud: claims.filter(c => c.status === 'fraud').length,
    totalPayout: claims.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.payoutAmount, 0),
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/30 flex flex-col overflow-x-hidden">
      <main className="mt-24 px-8 max-w-7xl mx-auto w-full flex-grow animate-fade-in">
        {/* Header & Stats Bento Grid */}
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tighter mb-8 text-on-surface font-headline">Claims Management</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div 
              className={`glass-card p-6 rounded-2xl flex flex-col justify-between border-l-4 border-primary transition-all cursor-pointer hover:scale-[1.02] ${filter === 'all' ? 'bg-primary/10 shadow-lg shadow-primary/10' : ''}`}
              onClick={() => setFilter('all')}
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface/50 mb-4">Total Claims</span>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-black text-primary tracking-tight">{stats.total}</span>
                <span className="material-symbols-outlined text-primary/30">analytics</span>
              </div>
            </div>
            
            <div 
              className={`glass-card p-6 rounded-2xl flex flex-col justify-between border-l-4 border-tertiary transition-all cursor-pointer hover:scale-[1.02] ${filter === 'pending' ? 'bg-tertiary/10 shadow-lg shadow-tertiary/10' : ''}`}
              onClick={() => setFilter('pending')}
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface/50 mb-4">Pending</span>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-black text-tertiary tracking-tight">{stats.pending}</span>
                <span className="material-symbols-outlined text-tertiary/30">pending_actions</span>
              </div>
            </div>

            <div 
              className={`glass-card p-6 rounded-2xl flex flex-col justify-between border-l-4 border-secondary transition-all cursor-pointer hover:scale-[1.02] ${filter === 'approved' ? 'bg-secondary/10 shadow-lg shadow-secondary/10' : ''}`}
              onClick={() => setFilter('approved')}
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface/50 mb-4">Approved</span>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-black text-secondary tracking-tight">{stats.approved}</span>
                <span className="material-symbols-outlined text-secondary/30">verified</span>
              </div>
            </div>

            <div 
              className={`glass-card p-6 rounded-2xl flex flex-col justify-between border-l-4 border-secondary-fixed transition-all cursor-pointer hover:scale-[1.02] ${filter === 'paid' ? 'bg-secondary-fixed/10 shadow-lg shadow-secondary-fixed/10' : ''}`}
              onClick={() => setFilter('paid')}
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface/50 mb-4">Paid</span>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-black text-secondary-fixed tracking-tight">{stats.paid}</span>
                <span className="material-symbols-outlined text-secondary-fixed/30">payments</span>
              </div>
            </div>

            <div 
              className={`glass-card p-6 rounded-2xl flex flex-col justify-between border-l-4 border-error transition-all cursor-pointer hover:scale-[1.02] ${filter === 'fraud' ? 'bg-error/10 shadow-lg shadow-error/10' : ''}`}
              onClick={() => setFilter('fraud')}
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface/50 mb-4">Fraud Flags</span>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-black text-error tracking-tight">{stats.fraud}</span>
                <span className="material-symbols-outlined text-error/30">gpp_maybe</span>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex flex-col justify-between kinetic-gradient">
              <span className="text-[10px] font-black uppercase tracking-widest text-on-primary mb-4">Total Payout</span>
              <div className="flex items-end justify-between">
                <span className="text-xl font-black text-on-primary tracking-tight">{formatCurrency(stats.totalPayout)}</span>
                <span className="material-symbols-outlined text-on-primary/40">account_balance_wallet</span>
              </div>
            </div>
          </div>
        </header>

        {notification && (
          <div className={`mb-8 p-4 rounded-xl border flex items-center justify-between animate-slide-up ${
            notification.type === 'success' 
              ? 'bg-secondary/10 border-secondary/20 text-secondary'
              : 'bg-error/10 border-error/20 text-error'
          }`}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">{notification.type === 'success' ? 'check_circle' : 'error'}</span>
              <p className="text-sm font-bold">{notification.message}</p>
            </div>
            <button onClick={() => setNotification(null)} className="text-on-surface-variant hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {/* Search & Filters */}
        <section className="mb-8">
          <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
              <input 
                type="text"
                placeholder="Search Claim ID, Worker Name, or City..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary rounded-xl pl-10 text-sm py-4 text-on-surface placeholder:text-on-surface-variant/30"
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <select 
                value={triggerFilter}
                onChange={(e) => setTriggerFilter(e.target.value)}
                className="bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary rounded-xl text-[10px] font-black uppercase tracking-widest px-6 py-4 text-on-surface min-w-[160px]"
              >
                <option value="all">Trigger Type</option>
                <option value="rain">Rain Disruption</option>
                <option value="heat">Heat Wave</option>
                <option value="pollution">Pollution Alert</option>
                <option value="flood">Flood Alert</option>
                <option value="curfew">Curfew/Lockdown</option>
                <option value="app_outage">Platform Outage</option>
                <option value="demand_surge">Demand Surge</option>
                <option value="traffic">Traffic Disruption</option>
                <option value="strike">Transport Strike</option>
              </select>
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary rounded-xl text-[10px] font-black uppercase tracking-widest px-6 py-4 text-on-surface min-w-[160px]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="fraud">Fraudulent</option>
              </select>
            </div>
          </div>
        </section>

        {/* Table & Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
          {/* Claims Table */}
          <section className="lg:col-span-8 glass-card rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface/50">Claim ID</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface/50">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface/50">Worker</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface/50">Trigger</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface/50">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface/50">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredClaims.length > 0 ? (
                    filteredClaims.map(claim => {
                      const worker = workers.get(claim.workerId);
                      const isSelected = selectedClaim?.id === claim.id;
                      
                      return (
                        <tr 
                          key={claim.id} 
                          onClick={() => setSelectedClaim(claim)}
                          className={`hover:bg-white/5 transition-all group cursor-pointer border-l-4 ${isSelected ? 'border-primary bg-primary/5' : 'border-transparent'}`}
                        >
                          <td className={`px-6 py-5 font-black text-xs ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                            #{claim.id.slice(0, 8).toUpperCase()}
                          </td>
                          <td className="px-6 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">
                            {new Date(claim.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                                {worker?.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="text-sm font-bold text-on-surface">{worker?.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="flex items-center gap-2 text-xs font-bold text-on-surface uppercase tracking-widest">
                              <span className={`material-symbols-outlined text-sm ${claim.triggerType === 'rain' ? 'text-blue-400' : claim.triggerType === 'heat' ? 'text-orange-400' : 'text-slate-400'}`}>
                                {claim.triggerType === 'rain' ? 'rainy' : claim.triggerType === 'heat' ? 'sunny' : 'masks'}
                              </span>
                              {claim.triggerType}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-sm font-black text-white">{formatCurrency(claim.payoutAmount)}</td>
                          <td className="px-6 py-5 text-right">
                            <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-2 w-fit ${
                              claim.status === 'paid' ? 'bg-secondary/10 text-secondary border border-secondary/20' :
                              claim.status === 'approved' ? 'bg-primary/10 text-primary border border-primary/20' :
                              claim.status === 'pending' ? 'bg-tertiary/10 text-tertiary border border-tertiary/20' :
                              claim.status === 'fraud' ? 'bg-error/10 text-error border border-error/20' :
                              'bg-surface-container-high text-on-surface-variant'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                claim.status === 'paid' ? 'bg-secondary animate-pulse' :
                                claim.status === 'approved' ? 'bg-primary' :
                                claim.status === 'pending' ? 'bg-tertiary' :
                                'bg-error'
                              }`}></span>
                              {claim.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <span className="material-symbols-outlined text-5xl text-on-surface/20 block mb-4">search_off</span>
                        <h3 className="font-headline text-xl font-bold text-on-surface mb-2">No claims match your filters</h3>
                        <p className="text-sm text-on-surface/40">Try adjusting your search or filters to find what you&apos;re looking for.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Detailed View Panel */}
          {selectedClaim && (
          <aside className="lg:col-span-4 glass-card rounded-2xl overflow-hidden flex flex-col h-full sticky top-24 animate-slide-up shadow-2xl border border-white/5">
            <div className="p-8 border-b border-white/5 bg-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full"></div>
              <div className="flex justify-between items-start mb-6 relative">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant block mb-1">Impact Event Analysis</span>
                  <h2 className="text-3xl font-black text-white font-headline">#{selectedClaim.id.slice(0, 8).toUpperCase()}</h2>
                </div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                   selectedClaim.status === 'paid' ? 'bg-secondary/20 text-secondary' :
                   selectedClaim.status === 'approved' ? 'bg-primary/20 text-primary' :
                   selectedClaim.status === 'pending' ? 'bg-tertiary/20 text-tertiary' :
                   'bg-error/20 text-error'
                }`}>
                  {selectedClaim.status} Review
                </span>
              </div>
              
              <div className="flex items-center gap-4 bg-surface-container-lowest/80 p-4 rounded-2xl border border-white/5 backdrop-blur-md relative">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black">
                  {workers.get(selectedClaim.workerId)?.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-black text-sm text-white">{workers.get(selectedClaim.workerId)?.name}</p>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                    {workers.get(selectedClaim.workerId)?.platform} • {workers.get(selectedClaim.workerId)?.location.city}
                  </p>
                </div>
                <button className="ml-auto text-primary p-2 hover:bg-primary/10 rounded-full transition-colors">
                  <span className="material-symbols-outlined text-lg">open_in_new</span>
                </button>
              </div>
            </div>

            <div className="p-8 flex-grow space-y-6">
              {/* Status Timeline */}
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">schedule</span> Status Timeline
                </h3>
                <ClaimTimeline claim={selectedClaim} />
              </div>

              {/* Status Flow */}
              <div className="px-4">
                <ClaimStatusFlow status={selectedClaim.status} />
              </div>

              {/* Fraud Analysis Component */}
              <div className="p-5 rounded-2xl bg-surface-container-lowest/50 border border-white/5 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-error/5 blur-2xl rounded-full"></div>
                <div className="flex justify-between items-center mb-4 relative">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${selectedClaim.fraudCheck.score > 20 ? 'text-error' : 'text-secondary'}`}>
                    <span className="material-symbols-outlined text-sm">security</span> Fraud Risk Audit
                  </h3>
                  <span className={`text-xl font-black ${selectedClaim.fraudCheck.score > 20 ? 'text-error' : 'text-secondary'}`}>
                    {selectedClaim.fraudCheck.score}%
                  </span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-3 relative">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${selectedClaim.fraudCheck.score > 20 ? 'bg-error' : 'bg-secondary'}`} 
                    style={{ width: `${selectedClaim.fraudCheck.score}%` }}
                  ></div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-white font-bold">
                    Risk Level: <span className={`uppercase ${selectedClaim.fraudCheck.level === 'high' ? 'text-error' : selectedClaim.fraudCheck.level === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {selectedClaim.fraudCheck.level}
                    </span>
                  </p>
                  {selectedClaim.fraudCheck.flags.length > 0 ? (
                    <div className="space-y-1">
                      {selectedClaim.fraudCheck.flags.slice(0, 3).map((flag, idx) => (
                        <p key={idx} className="text-[10px] text-white/60 flex items-start gap-1">
                          <span className="material-symbols-outlined text-[10px] text-error mt-0.5">warning</span>
                          {flag}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-white/50 italic">
                      All validation checks passed successfully.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions CTA Section */}
            <div className="p-8 bg-white/5 border-t border-white/5 flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2 px-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Recommended Action</p>
                 <p className="text-xl font-black text-white uppercase font-headline">{formatCurrency(selectedClaim.payoutAmount)}</p>
              </div>
              
              <div className="flex gap-4">
                {selectedClaim.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleApprove(selectedClaim)}
                      disabled={processingId === selectedClaim.id}
                      className="kinetic-gradient flex-1 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest text-on-primary shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {processingId === selectedClaim.id ? (
                         <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                      ) : (
                        <span className="material-symbols-outlined text-sm">verified</span>
                      )}
                      Approve Payout
                    </button>
                    <button 
                      onClick={() => handleReject(selectedClaim)}
                      className="flex-1 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest text-on-surface-variant border border-white/5 hover:bg-error/10 hover:text-error hover:border-error/20 transition-all active:scale-95"
                    >
                      Reject Audit
                    </button>
                  </>
                )}

                {selectedClaim.status === 'approved' && (
                  <button 
                    onClick={() => handlePay(selectedClaim)}
                    disabled={processingId === selectedClaim.id}
                    className="bg-secondary flex-1 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest text-on-secondary shadow-xl shadow-secondary/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {processingId === selectedClaim.id ? (
                       <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                    ) : (
                      <span className="material-symbols-outlined text-sm">payments</span>
                    )}
                    Dispatch Payment
                  </button>
                )}

                {selectedClaim.status === 'paid' && (
                  <div className="flex-1 py-4 rounded-xl border border-secondary/20 bg-secondary/5 text-secondary flex items-center justify-center gap-3">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span className="font-black text-[11px] uppercase tracking-widest">Protocol Settled</span>
                  </div>
                )}
                
                {selectedClaim.status === 'fraud' && (
                  <button className="flex-1 py-4 rounded-xl border border-error/20 bg-error/5 text-error flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest">
                    <span className="material-symbols-outlined text-sm">gpp_maybe</span> Manual Review
                  </button>
                )}
              </div>
            </div>
          </aside>
          )}
        </div>
      </main>
    </div>
  );
}
