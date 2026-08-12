import { NextResponse } from 'next/server';
import { generateProtocolHealth } from '@/lib/live-engine';
export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json(generateProtocolHealth()); }