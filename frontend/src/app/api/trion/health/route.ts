import { NextResponse } from 'next/server';
import { signalFactory } from '@/lib/live-engine';
export const dynamic = 'force-dynamic';
export async function GET() {
  return NextResponse.json({ status: 'healthy', signalsGenerated: (signalFactory as any).counter });
}
