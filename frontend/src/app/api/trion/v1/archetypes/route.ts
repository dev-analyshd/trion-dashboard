import { NextResponse } from 'next/server';
import { ARCHETYPES } from '@/lib/live-engine';
export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json({ archetypes: ARCHETYPES }); }