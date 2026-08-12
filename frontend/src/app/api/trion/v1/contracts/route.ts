import { NextResponse } from 'next/server';
import { CONTRACTS } from '@/lib/live-engine';
export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json({ contracts: CONTRACTS, total: CONTRACTS.length }); }