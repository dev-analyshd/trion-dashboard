import { NextResponse } from 'next/server';
import { generateSecurityAlerts } from '@/lib/live-engine';
export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json(generateSecurityAlerts()); }