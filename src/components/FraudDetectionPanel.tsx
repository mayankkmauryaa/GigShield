'use client';

import { useState, useEffect } from 'react';
import { getClaims, getWorkers, getActiveTriggers, getWorker } from '@/lib/store';
import { detectGPSSpoofing, detectRingFraud, analyzeFraud } from '@/lib/ai/fraud-detector';
import { Claim, Worker } from '@/lib/types';
import { Icons } from './Icons';

export function FraudDetectionPanel() {
  const [suspiciousClaims, setSuspiciousClaims] = useState<{
    claim: Claim;
    worker: Worker | undefined;
    gpsAnalysis: ReturnType<typeof detectGPSSpoofing> | null;
    flags: string[];
    score: number;
  }[]>([]);
  const [ringFraudAlerts, setRingFraudAlerts] = useState<{
    location: string;
    type: string;
    count: number;
    confidence: number;
  }[]>([]);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'complete'>('idle');

  const runFraudScan = () => {
    setScanStatus('scanning');
    
    setTimeout(() => {
      const claims = getClaims();
      const workers = getWorkers();
      const workerMap = new Map(workers.map(w => [w.id, w]));
      
      const analyzed = claims
        .filter(c => c.status !== 'paid' && c.status !== 'rejected')
        .map(claim => {
          const worker = workerMap.get(claim.workerId);
          const gpsAnalysis = worker ? detectGPSSpoofing(claim, worker) : null;
          
          return {
            claim,
            worker,
            gpsAnalysis,
            flags: claim.fraudCheck.flags,
            score: claim.fraudCheck.score,
          };
        })
        .filter(item => 
          (item.gpsAnalysis && item.gpsAnalysis.isSpoofed) || 
          item.score > 20 ||
          item.flags.length > 0
        )
        .sort((a, b) => b.score - a.score);

      setSuspiciousClaims(analyzed);

      const triggers = getActiveTriggers();
      const alerts: typeof ringFraudAlerts = [];
      
      triggers.forEach(trigger => {
        const ringResult = detectRingFraud(
          trigger.location,
          trigger.type,
          trigger.startedAt
        );
        
        if (ringResult.isRingFraud) {
          alerts.push({
            location: trigger.location,
            type: trigger.type,
            count: ringResult.relatedClaims.length,
            confidence: ringResult.confidence,
          });
        }
      });

      setRingFraudAlerts(alerts);
      setScanStatus('complete');
    }, 2000);
  };

  const simulateAttack = () => {
    setScanStatus('scanning');
    
    setTimeout(() => {
      const mockAttack = [
        {
          claim: {
            id: 'attack-001',
            workerId: 'worker-spoof-1',
            policyId: 'policy-1',
            triggerId: 'trigger-1',
            triggerType: 'rain' as const,
            status: 'pending' as const,
            fraudCheck: { passed: true, score: 0, flags: [], level: 'none' as const },
            payoutAmount: 2400,
            hoursAffected: 8,
            hourlyRate: 300,
            description: 'Income loss due to heavy rainfall',
            location: { lat: 19.0760, lng: 72.8777, zone: 'mumbai-central' },
            triggeredAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
          worker: undefined,
          gpsAnalysis: {
            isSpoofed: true,
            confidence: 85,
            evidence: ['Location mismatch: 15km from registered address', 'GPS teleport detected'],
          },
          flags: ['GPS spoofing detected', 'Location mismatch'],
          score: 85,
        },
        {
          claim: {
            id: 'attack-002',
            workerId: 'worker-spoof-2',
            policyId: 'policy-2',
            triggerId: 'trigger-1',
            triggerType: 'rain' as const,
            status: 'pending' as const,
            fraudCheck: { passed: true, score: 0, flags: [], level: 'none' as const },
            payoutAmount: 2000,
            hoursAffected: 8,
            hourlyRate: 250,
            description: 'Income loss due to heavy rainfall',
            location: { lat: 19.0760, lng: 72.8777, zone: 'mumbai-central' },
            triggeredAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
          worker: undefined,
          gpsAnalysis: {
            isSpoofed: true,
            confidence: 78,
            evidence: ['Location mismatch: 12km from registered address', 'Same location as other suspicious claims'],
          },
          flags: ['GPS spoofing detected', 'Location mismatch'],
          score: 78,
        },
      ];

      setSuspiciousClaims(mockAttack);
      
      setRingFraudAlerts([
        { location: 'Mumbai', type: 'rain', count: 15, confidence: 92 },
      ]);

      setScanStatus('complete');
    }, 1500);
  };

  return (
    <div className="glass-card p-6 bg-white/80">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Adversarial Defense System</h3>
          <p className="text-sm text-gray-500">GPS Spoofing & Ring Fraud Detection</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={runFraudScan}
            disabled={scanStatus === 'scanning'}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {scanStatus === 'scanning' ? 'Scanning...' : 'Run Fraud Scan'}
          </button>
          <button
            onClick={simulateAttack}
            disabled={scanStatus === 'scanning'}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors"
          >
            Simulate Attack
          </button>
        </div>
      </div>

      {ringFraudAlerts.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-600 font-medium">Active Threat Detected</span>
          </div>
          <div className="space-y-2">
            {ringFraudAlerts.map((alert, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <span className="text-gray-900 font-medium">{alert.location}</span>
                  <span className="text-gray-500"> - {alert.type} trigger</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-red-600">{alert.count} claims</span>
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                    {alert.confidence}% confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {suspiciousClaims.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-500">Suspicious Claims ({suspiciousClaims.length})</h4>
          {suspiciousClaims.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${
                item.score >= 60 
                  ? 'bg-red-50 border-red-200' 
                  : item.score >= 30
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-gray-900 font-mono text-sm">{item.claim.id}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      item.score >= 60 ? 'bg-red-100 text-red-700' :
                      item.score >= 30 ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      Risk: {item.score}
                    </span>
                    {item.gpsAnalysis?.isSpoofed && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                        GPS Spoofed
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {item.flags.map((flag, fIdx) => (
                      <p key={fIdx} className="text-sm text-gray-600">- {flag}</p>
                    ))}
                    {item.gpsAnalysis?.evidence.map((evidence, eIdx) => (
                      <p key={eIdx} className="text-sm text-red-600">! {evidence}</p>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 font-medium">Rs. {item.claim.payoutAmount}</p>
                  <p className="text-sm text-gray-500">{item.claim.hoursAffected}h affected</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : scanStatus === 'complete' ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.checkCircle />
          </div>
          <p className="text-emerald-600 font-medium">No suspicious activity detected</p>
          <p className="text-sm text-gray-500 mt-1">Platform is secure</p>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Click &quot;Run Fraud Scan&quot; to analyze claims</p>
          <p className="text-sm mt-1">or &quot;Simulate Attack&quot; to test defense system</p>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-500 mb-3">Defense Mechanisms</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-indigo-600 text-sm font-medium mb-1">GPS Validation</div>
            <div className="text-xs text-gray-500">Cross-references device location with claimed zone</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-indigo-600 text-sm font-medium mb-1">Pattern Detection</div>
            <div className="text-xs text-gray-500">Identifies coordinated fraud rings via clustering</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-indigo-600 text-sm font-medium mb-1">Behavioral Analysis</div>
            <div className="text-xs text-gray-500">Flags unusual claim frequency and timing patterns</div>
          </div>
        </div>
      </div>
    </div>
  );
}