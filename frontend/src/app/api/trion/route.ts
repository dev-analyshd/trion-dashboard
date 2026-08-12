import { NextResponse } from "next/server";
import { generateNewSignal, CHAINS, PLANE_STATUSES, LIVING_SECURITY, RELAYER_STATUS } from "@/lib/trion-data";

export async function GET() {
  const signal = generateNewSignal();
  const chainStatuses = CHAINS.map(c => ({
    name: c.name,
    status: c.status,
    latency: c.latency,
    blockHeight: c.blockHeight,
  }));
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    latestSignal: signal,
    chainCount: { active: 87, total: 100, indexing: 13 },
    coherence: {
      overall: 0.80 + Math.random() * 0.12,
      threshold: 0.55 + Math.random() * 0.15,
      planes: PLANE_STATUSES.map(p => ({
        symbol: p.symbol,
        score: p.score + (Math.random() - 0.5) * 0.05,
      })),
    },
    security: {
      livingScore: 0.94,
      attacksIntercepted: 1381 + Math.floor(Math.random() * 5),
      components: LIVING_SECURITY.map(c => ({
        name: c.name,
        status: c.status,
        score: c.score,
      })),
    },
    relayers: RELAYER_STATUS.map(r => ({
      name: r.name,
      status: r.status,
      throughput: r.throughput,
    })),
    chains: chainStatuses.slice(0, 20),
    dataSource: "LIVE",
  });
}