import { NextResponse } from 'next/server';
import { signalFactory } from '@/lib/live-engine';
export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json({ ...signalFactory.stats(), timestamp: new Date().toISOString() }); }