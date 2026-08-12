import { NextResponse } from 'next/server';
import { VM_FAMILIES, CHAINS } from '@/lib/live-engine';
export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json({ families: VM_FAMILIES, totalChains: CHAINS.length }); }