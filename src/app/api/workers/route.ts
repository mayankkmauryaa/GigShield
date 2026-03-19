import { NextResponse } from 'next/server';
import { getWorkers, createWorker, getWorker, updateWorker } from '@/lib/store';
import { calculatePremium } from '@/lib/ai/premium-calculator';
import { Worker, DeliveryPlatform } from '@/lib/types';

export async function GET() {
  try {
    const workers = getWorkers();
    return NextResponse.json({ workers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch workers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const workerData = {
      name: body.name,
      phone: body.phone,
      email: body.email,
      aadhaarNumber: body.aadhaar,
      platform: body.platform as DeliveryPlatform,
      zoneId: body.zoneId || `zone-${body.city?.toLowerCase()}-${Date.now()}`,
      location: body.location,
      riskZone: body.riskZone || 'medium',
      behaviorScore: 80,
      avgWeeklyEarnings: body.avgWeeklyEarnings,
      avgWeeklyHours: body.avgWeeklyHours,
      tenure: 1,
      status: 'active' as const,
    };

    const worker = createWorker(workerData);
    return NextResponse.json({ worker, success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create worker' }, { status: 500 });
  }
}
