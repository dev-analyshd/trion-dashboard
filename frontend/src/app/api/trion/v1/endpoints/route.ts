import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json({ endpoints: [
  {method:'GET',path:'/api/trion/overview',description:'Dashboard overview'},
  {method:'GET',path:'/api/trion/v1/signals/latest',description:'Latest behavioral signals'},
  {method:'GET',path:'/api/trion/v1/chains',description:'All indexed chains'},
  {method:'GET',path:'/api/trion/v1/trading/pairs',description:'Trading pairs with firewall'},
  {method:'GET',path:'/api/trion/v1/security/crispr',description:'CRISPR engine status'},
  {method:'GET',path:'/api/trion/v1/0g/status',description:'0G network status'},
  {method:'GET',path:'/api/trion/v1/protocol/health',description:'Protocol health metrics'},
  {method:'GET',path:'/api/trion/v1/beo/entities',description:'BEO entity data'},
  {method:'GET',path:'/api/trion/v1/anima/streams',description:'ANIMA stream status'},
], total: 9 }); }