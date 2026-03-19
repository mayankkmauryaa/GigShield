import { NextResponse } from 'next/server';
import { getTriggers, getActiveTriggers, createTrigger, getWeatherData, getPolicies, getWorker } from '@/lib/store';
import { checkWeatherTriggers, processAutomaticClaims, simulateWeatherEvent, getTriggerSummary } from '@/lib/triggers/weather-trigger';
import { generateWeatherForecast } from '@/lib/ai/risk-model';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const triggers = activeOnly ? getActiveTriggers() : getTriggers();
    const summary = getTriggerSummary();

    return NextResponse.json({ triggers, summary });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch triggers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, city, type, severity, value } = body;

    if (action === 'check') {
      const triggeredTriggers = checkWeatherTriggers(city);
      return NextResponse.json({ triggeredTriggers });
    }

    if (action === 'simulate') {
      const result = simulateWeatherEvent(city, type, severity, value);
      return NextResponse.json(result);
    }

    if (action === 'create') {
      const trigger = createTrigger({
        type,
        location: city,
        severity,
        threshold: value,
        currentValue: value,
        active: true,
        affectedWorkers: [],
        startedAt: new Date().toISOString(),
      });

      const claims = processAutomaticClaims(trigger);

      return NextResponse.json({ trigger, claims, success: true });
    }

    if (action === 'forecast') {
      const forecast = generateWeatherForecast(city, 7);
      return NextResponse.json({ forecast });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process trigger action' }, { status: 500 });
  }
}
