import { NextResponse } from 'next/server';
import { LANGUAGE_STATS } from '@/lib/live-engine';
export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json({ languages: LANGUAGE_STATS, totalLoc: LANGUAGE_STATS.reduce((a, l) => a + l.loc, 0) }); }