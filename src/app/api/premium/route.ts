import { NextResponse } from 'next/server';
import { getWorker } from '@/lib/store';
import { calculatePremium, generateRiskProfile, predictClaimProbability, suggestOptimalCoverage } from '@/lib/ai/premium-calculator';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get('workerId');

    if (!workerId) {
      return NextResponse.json({ error: 'Worker ID required' }, { status: 400 });
    }

    const worker = getWorker(workerId);
    if (!worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    const premium = calculatePremium(worker);
    const riskProfile = generateRiskProfile(worker);
    const claimProbability = predictClaimProbability(worker);
    const optimalCoverage = suggestOptimalCoverage(worker);

    return NextResponse.json({
      premium,
      riskProfile,
      claimProbability,
      optimalCoverage,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate premium' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workerId } = body;

    if (!workerId) {
      return NextResponse.json({ error: 'Worker ID required' }, { status: 400 });
    }

    const worker = getWorker(workerId);
    if (!worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    const premium = calculatePremium(worker);
    const riskProfile = generateRiskProfile(worker);
    const claimProbability = predictClaimProbability(worker);
    const optimalCoverage = suggestOptimalCoverage(worker);

    return NextResponse.json({
      premium,
      riskProfile,
      claimProbability,
      optimalCoverage,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate premium' }, { status: 500 });
  }
}
