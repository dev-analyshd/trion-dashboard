import { NextResponse } from 'next/server';
import { BEO_ENTITIES } from '@/lib/live-engine';
export const dynamic = 'force-dynamic';
export async function GET() {
  const entities = BEO_ENTITIES.map(e => ({ ...e, currentCoherence: +(e.coherence + (Math.random() - 0.5) * 0.02).toFixed(4), lastSignal: new Date().toISOString() }));
  return NextResponse.json({ entities });
}