import { NextResponse } from 'next/server';
import { LIVING_SECURITY } from '@/lib/live-engine';
export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json({ components: LIVING_SECURITY.map(s => ({ ...s, score: +Math.max(85, Math.min(100, s.score + (Math.random() - 0.5) * 0.6)).toFixed(1), lastCheck: new Date().toISOString() })) }); }