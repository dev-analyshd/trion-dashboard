import { NextResponse } from 'next/server';
import { signalFactory } from '@/lib/live-engine';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const count = Math.min(parseInt(searchParams.get('count') || '50'), 200);
  const signals = signalFactory.latest(count);
  return NextResponse.json({ signals, count: signals.length });
}