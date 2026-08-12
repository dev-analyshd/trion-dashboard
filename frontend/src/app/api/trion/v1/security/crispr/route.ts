import { NextResponse } from 'next/server';
import { CRISPR_SIGNATURES } from '@/lib/live-engine';
export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json({ signatures: CRISPR_SIGNATURES.map(s => ({ ...s, lastTriggered: new Date().toISOString(), active: Math.random() > 0.25 })), totalIntercepts: CRISPR_SIGNATURES.reduce((a, s) => a + s.intercepts, 0) }); }