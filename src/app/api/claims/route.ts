import { NextResponse } from 'next/server';
import { getClaims, getClaim, createClaim, updateClaim, getWorker, getPolicyByWorker } from '@/lib/store';
import { analyzeFraud } from '@/lib/ai/fraud-detector';
import { processPayment } from '@/lib/integrations/payment-sim';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get('workerId');
    const status = searchParams.get('status');

    let claims = getClaims();

    if (workerId) {
      claims = claims.filter(c => c.workerId === workerId);
    }

    if (status) {
      claims = claims.filter(c => c.status === status);
    }

    return NextResponse.json({ claims });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workerId, triggerType, triggerId, hoursAffected, description, location } = body;

    const worker = getWorker(workerId);
    if (!worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    const policy = getPolicyByWorker(workerId);
    if (!policy) {
      return NextResponse.json({ error: 'No active policy found' }, { status: 404 });
    }

    const payoutAmount = hoursAffected * policy.hourlyRate;

    const claimData = {
      workerId,
      policyId: policy.id,
      triggerId: triggerId || `trigger-${Date.now()}`,
      triggerType: triggerType || 'rain',
      status: 'pending' as const,
      fraudCheck: {
        passed: true,
        score: 0,
        flags: [] as string[],
        level: 'none' as const,
      },
      payoutAmount,
      hoursAffected,
      hourlyRate: policy.hourlyRate,
      description: description || `${triggerType} disruption caused income loss`,
      location: location || {
        lat: worker.location.lat,
        lng: worker.location.lng,
        zone: worker.zoneId,
      },
      triggeredAt: new Date().toISOString(),
    };

    const claim = createClaim(claimData);
    
    const fraudResult = analyzeFraud(claim);
    const updatedClaim = updateClaim(claim.id, {
      fraudCheck: {
        passed: fraudResult.passed,
        score: fraudResult.score,
        flags: fraudResult.flags,
        level: fraudResult.level,
      },
    });

    if (fraudResult.passed) {
      updateClaim(claim.id, { status: 'approved', approvedAt: new Date().toISOString() });
    } else {
      updateClaim(claim.id, { status: 'fraud' });
    }

    return NextResponse.json({
      claim: updatedClaim,
      fraudAnalysis: fraudResult,
      success: true,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create claim' }, { status: 500 });
  }
}
