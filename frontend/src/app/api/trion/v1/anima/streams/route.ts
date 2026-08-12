import { NextResponse } from 'next/server';
import { ANIMA_STREAMS } from '@/lib/live-engine';
export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json({ streams: ANIMA_STREAMS.map(s => ({ ...s, lastUpdate: new Date().toISOString(), vectorsProcessed: 100000 + Math.floor(Math.random() * 4900000) })) }); }