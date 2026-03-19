import { NextResponse } from 'next/server';
import { getPolicies, createPolicy, getPolicyByWorker, getWorker } from '@/lib/store';
import { calculatePremium } from '@/lib/ai/premium-calculator';

export async function GET() {
  try {
    const policies = getPolicies();
    return NextResponse.json({ policies });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch policies' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workerId } = body;

    const worker = getWorker(workerId);
    if (!worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    const premiumCalc = calculatePremium(worker);

    const policy = createPolicy({
      workerId,
      policyNumber: `GS-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'active',
      weeklyPremium: premiumCalc.finalPremium,
      maxCoverage: premiumCalc.maxCoverage,
      coverageHours: premiumCalc.coverageHours,
      hourlyRate: Math.floor(worker.avgWeeklyEarnings / premiumCalc.coverageHours),
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      autoRenew: body.autoRenew ?? true,
      triggers: ['rain', 'heat', 'pollution', 'flood'],
    });

    return NextResponse.json({ policy, success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create policy' }, { status: 500 });
  }
}
