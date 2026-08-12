"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Shield, Database, Brain, Eye, Lock, Cpu, Radio,
  Globe2, Bell, Search, Zap, TrendingUp, Layers, Fingerprint,
  Heart, Settings, Key, GitBranch, Users, Wifi,
  Hexagon, Menu, X, RefreshCw, WifiOff, ArrowUpDown, ChevronRight,
  CheckCircle2, AlertTriangle, XCircle, Bot, BookOpen, ShoppingCart,
  Landmark, Clock, HardDrive, Gavel, ArrowLeftRight, BarChart3,
  Timer, Dna, Scan, Swords, type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { BACKEND_WS } from "@/lib/api-client";
import {
  useOverview, useSignals, useSignalStats, useChains, useVmFamilies,
  useRelayers, useSecurityAlerts, useBeoLive, useArchetypes,
  useBhExplorer, useBhStream, useAkashicIndex, useAkashicDepth, useAkashicSearch,
  useAnimaStreams, useLivingSecurity, useCrispr,
  useLivingSecurityGk, useLivingSecurityEpigenetic, useLivingSecurityImmune,
  useAiAgents, useValidators, useValidatorsConsensus,
  useAnnotators, useAnnotatorsReviews,
  useEvolutionaryFitness, useEvolutionaryLoveProtocol,
  useContinuumDex, useContinuumBidEngine, useContinuumCmeEngine, useContinuumBdcCredit,
  useMarketplaceListings, useMarketplaceStats,
  useSbaAssessments, useBiblAnalysis,
  useTimescaleMetrics, useTimescaleEvents,
  useTradingPairs, useZeroGStatus, useGovernance, useSettings,
  useZeroBridgeRoutes, useZeroBridgeStats,
} from "@/lib/useTrionApi";

// ═══════════════════════════════════════════════════════════════════
// DESIGN SYSTEM CONSTANTS
// ═══════════════════════════════════════════════════════════════════
const C = {
  bg: '#0a0b0f',
  card: '#12141c',
  border: '#1e2030',
  text: '#e2e8f0',
  textSec: '#94a3b8',
  green: '#00d4aa',
  red: '#ef4444',
  blue: '#3b82f6',
  amber: '#f59e0b',
  purple: '#8b5cf6',
  sidebarBg: '#0c0d14',
  sidebarBorder: 'rgba(255,255,255,0.06)',
};

// ═══════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════
interface NavItem { id: string; label: string; icon: LucideIcon; section?: string; }

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "signals", label: "Live Signals", icon: Radio },
  { id: "chains", label: "Chains", icon: Globe2 },
  { id: "beo-live", label: "BEO Live", icon: Users },
  { id: "bh-explorer", label: "BH Explorer", icon: Fingerprint },
  { id: "akashic", label: "Akashic Index", icon: Database },
  { id: "anima", label: "ANIMA Intelligence", icon: Brain },
  { id: "section-security", label: "SECURITY", icon: Shield, section: "SECURITY" },
  { id: "living-security", label: "Living Security", icon: Shield },
  { id: "ai-agents", label: "AI Agents", icon: Bot },
  { id: "section-network", label: "NETWORK", icon: Globe2, section: "NETWORK" },
  { id: "validators", label: "Validators", icon: CheckCircle2 },
  { id: "annotators", label: "Annotators", icon: BookOpen },
  { id: "section-defi", label: "DEFI", icon: TrendingUp, section: "DEFI" },
  { id: "evolutionary", label: "Evolutionary Fitness", icon: Heart },
  { id: "continuum", label: "CONTINUUM DEX", icon: ArrowLeftRight },
  { id: "marketplace", label: "Marketplace", icon: ShoppingCart },
  { id: "trading", label: "Trading", icon: BarChart3 },
  { id: "section-protocol", label: "PROTOCOL", icon: Layers, section: "PROTOCOL" },
  { id: "sba", label: "SBA", icon: Landmark },
  { id: "bibl", label: "BIBL", icon: Layers },
  { id: "timescale", label: "TimescaleDB", icon: Clock },
  { id: "0g", label: "0G Network", icon: HardDrive },
  { id: "governance", label: "Governance", icon: Gavel },
  { id: "settings", label: "Settings", icon: Settings },
];

// ═══════════════════════════════════════════════════════════════════
// SHARED UTILITIES
// ═══════════════════════════════════════════════════════════════════
function fmtNum(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

function fmtPct(n: number): string {
  return (n * 100).toFixed(1) + '%';
}

function fmtTime(ts: string): string {
  if (!ts) return '-';
  try { return new Date(ts).toLocaleTimeString(); } catch { return ts; }
}

function statusColor(status: string): string {
  const s = (status || '').toLowerCase();
  if (['active', 'online', 'live', 'healthy', 'passed', 'deployed', 'coherent', 'synced'].includes(s)) return C.green;
  if (['indexing', 'monitoring', 'pending', 'syncing', 'warning', 'bootstrap', 'active', 'auditing', 'deploying', 'observation'].includes(s)) return C.amber;
  if (['critical', 'failed', 'offline', 'intercept', 'rejected', 'degraded'].includes(s)) return C.red;
  if (['discussion', 'inactive', 'planned'].includes(s)) return C.textSec;
  return C.blue;
}

function truncate(s: string, len: number): string {
  if (!s) return '-';
  return s.length > len ? s.slice(0, len) + '...' : s;
}

function arr<T>(data: Record<string, unknown> | undefined, key: string): T[] {
  if (!data) return [];
  const v = data[key];
  if (Array.isArray(v)) return v as T[];
  return [];
}

function num(data: Record<string, unknown> | undefined, key: string, fallback = 0): number {
  if (!data) return fallback;
  const v = data[key];
  if (typeof v === 'number') return v;
  return fallback;
}

function str(data: Record<string, unknown> | undefined, key: string, fallback = '-'): string {
  if (!data) return fallback;
  const v = data[key];
  if (typeof v === 'string') return v;
  return fallback;
}

function obj(data: Record<string, unknown> | undefined, key: string): Record<string, unknown> | undefined {
  if (!data) return undefined;
  const v = data[key];
  if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, unknown>;
  return undefined;
}

// ═══════════════════════════════════════════════════════════════════
// SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════
function PulsingDot({ color = C.green, size = 6 }: { color?: string; size?: number }) {
  return (
    <span className="relative flex items-center justify-center" style={{ width: size + 4, height: size + 4 }}>
      <span className="absolute rounded-full animate-ping" style={{ width: size, height: size, backgroundColor: color, opacity: 0.4 }} />
      <span className="relative rounded-full" style={{ width: size, height: size, backgroundColor: color }} />
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = statusColor(status);
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: color + '18', color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {status || 'unknown'}
    </span>
  );
}

function DashCard({ children, className = '', title }: { children: React.ReactNode; className?: string; title?: string }) {
  return (
    <div className={`rounded-xl ${className}`} style={{ background: C.card, border: `1px solid ${C.border}` }}>
      {title && (
        <div className="px-4 py-3 border-b" style={{ borderColor: C.border }}>
          <h3 className="text-sm font-semibold" style={{ color: C.text }}>{title}</h3>
        </div>
      )}
      <div className={title ? 'p-4' : 'p-4'}>{children}</div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <DashCard>
      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: C.textSec }}>{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color: color || C.text }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: C.textSec }}>{sub}</p>}
    </DashCard>
  );
}

function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <Skeleton className="h-3 w-24 mb-3" style={{ background: C.border }} />
            <Skeleton className="h-8 w-32 mb-2" style={{ background: C.border }} />
            <Skeleton className="h-3 w-20" style={{ background: C.border }} />
          </div>
        ))}
      </div>
      <div className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <Skeleton className="h-4 w-48 mb-4" style={{ background: C.border }} />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full mb-2" style={{ background: C.border }} />
        ))}
      </div>
    </div>
  );
}

function ProgressBar({ value, max = 1, color }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: C.border }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: pct + '%', backgroundColor: color || C.green }} />
    </div>
  );
}

function SectionHeader({ title, icon }: { title: string; icon?: LucideIcon }) {
  const Icon = icon;
  return (
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon className="w-4 h-4" style={{ color: C.green }} />}
      <h2 className="text-base font-semibold" style={{ color: C.text }}>{title}</h2>
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: C.card }}>
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-2.5 text-left font-medium whitespace-nowrap" style={{ color: C.textSec, borderBottom: `1px solid ${C.border}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="transition-colors hover:bg-white/[0.02]">
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-2.5 whitespace-nowrap" style={{ color: C.text, borderBottom: `1px solid ${C.border}` }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyState({ message = 'No data available' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <Database className="w-8 h-8 mb-3" style={{ color: C.textSec }} />
      <p className="text-sm" style={{ color: C.textSec }}>{message}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TRION LOGO
// ═══════════════════════════════════════════════════════════════════
function TrionLogo() {
  return (
    <div className="flex items-center gap-3 px-2 py-1">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #00d4aa 0%, #00a388 50%, #8b5cf6 100%)', boxShadow: '0 0 20px rgba(0,212,170,0.3)' }}>
        <Hexagon className="w-5 h-5 text-white" strokeWidth={2} />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold tracking-tight leading-none" style={{ color: C.text }}>TRION</span>
        <span className="text-[9px] font-semibold tracking-[0.2em] leading-none mt-1" style={{ color: C.green }}>PROTOCOL</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 1: OVERVIEW
// ═══════════════════════════════════════════════════════════════════
function OverviewPage() {
  const { data: overview, loading: oL } = useOverview();
  const { data: signalsData, loading: sL } = useSignals(10);
  const { data: chainsData, loading: cL } = useChains();
  const { data: relayersData } = useRelayers();
  const { data: alertsData } = useSecurityAlerts();

  if (oL || sL || cL) return <PageSkeleton />;

  const chains = arr<Record<string, unknown>>(chainsData, 'chains');
  const activeChains = num(chainsData, 'active', chains.filter(c => str(c, 'status', '').toLowerCase() === 'active').length);
  const totalChains = num(chainsData, 'total', chains.length);
  const sigStats = obj(overview, 'signalStats') || obj(signalsData, 'signalStats') || {};
  const signalsGenerated = num(sigStats, 'total', num(overview, 'signalsGenerated', 0));
  const coherence = obj(overview, 'coherence') || {};
  const cohVal = num(coherence, 'overall', 0.88);
  const secInfo = obj(overview, 'security') || {};
  const livingScore = num(secInfo, 'livingScore', 96);
  const latestSignals = arr<Record<string, unknown>>(signalsData, 'signals');
  const alerts = arr<Record<string, unknown>>(alertsData, 'alerts').slice(0, 5);
  const relayers = arr<Record<string, unknown>>(relayersData, 'relayers');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Chains" value={String(activeChains)} sub={`${totalChains} total chains`} color={C.green} />
        <StatCard label="Signals Generated" value={fmtNum(signalsGenerated)} sub="All time" color={C.blue} />
        <StatCard label="Living Security" value={fmtPct(livingScore / 100)} sub={`${num(secInfo, 'attacksIntercepted', 0)} intercepted`} color={C.purple} />
        <StatCard label="Coherence" value={fmtPct(cohVal)} sub="Protocol-wide" color={cohVal > 0.8 ? C.green : C.amber} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <DashCard title="Latest Signals">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Entity</th>
                    <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Chain</th>
                    <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Status</th>
                    <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>Coherence</th>
                    <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {latestSignals.slice(0, 10).map((sig, i) => {
                    const coh = num(sig, 'coherence', 0);
                    const status = str(sig, 'status', 'UNKNOWN');
                    return (
                      <tr key={i} className="border-t" style={{ borderColor: C.border }}>
                        <td className="px-3 py-2" style={{ color: C.text }}>{str(sig, 'entity', '-')}</td>
                        <td className="px-3 py-2" style={{ color: C.textSec }}>{str(sig, 'chain', '-')}</td>
                        <td className="px-3 py-2"><StatusBadge status={status} /></td>
                        <td className="px-3 py-2 text-right" style={{ color: coh > 0.8 ? C.green : coh > 0.6 ? C.amber : C.red }}>{fmtPct(coh)}</td>
                        <td className="px-3 py-2 text-right" style={{ color: C.textSec }}>{fmtTime(str(sig, 'timestamp'))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </DashCard>
        </div>

        <div className="space-y-4">
          <DashCard title="Security Alerts">
            <div className="space-y-2">
              {alerts.length === 0 && <p className="text-xs" style={{ color: C.textSec }}>No active alerts</p>}
              {alerts.map((a, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: '#0a0b0f' }}>
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: statusColor(str(a, 'severity', 'medium')) }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate" style={{ color: C.text }}>{str(a, 'signature', 'Alert')}</p>
                    <p className="text-[10px]" style={{ color: C.textSec }}>{str(a, 'chain', '')} - {str(a, 'status', '')}</p>
                  </div>
                </div>
              ))}
            </div>
          </DashCard>

          <DashCard title="Relayer Status">
            <div className="space-y-2">
              {relayers.slice(0, 5).map((r, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg" style={{ background: '#0a0b0f' }}>
                  <span className="text-xs" style={{ color: C.text }}>{str(r, 'name', '-')}</span>
                  <StatusBadge status={str(r, 'status', 'unknown')} />
                </div>
              ))}
            </div>
          </DashCard>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 2: LIVE SIGNALS
// ═══════════════════════════════════════════════════════════════════
function LiveSignalsPage() {
  const { data: signalsData, loading: sL } = useSignals(50);
  const { data: statsData, loading: stL } = useSignalStats();
  const { data: chainsData } = useChains();
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const tableRef = useRef<HTMLDivElement>(null);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    const wsUrl = BACKEND_WS();
    if (!wsUrl) return;
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => setWsConnected(false);
      ws.onerror = () => setWsConnected(false);
    } catch { /* websocket not available */ }
    return () => { if (ws) ws.close(); };
  }, []);

  if (sL || stL) return <PageSkeleton />;

  const signals = arr<Record<string, unknown>>(signalsData, 'signals');
  const coherent = num(statsData, 'coherent', signals.filter(s => str(s, 'status') === 'COHERENT').length);
  const warnings = num(statsData, 'warnings', signals.filter(s => str(s, 'status') === 'WARNING').length);
  const intercepts = num(statsData, 'intercepts', signals.filter(s => str(s, 'status') === 'INTERCEPT').length);

  const filtered = signals.filter(s => {
    if (filter && !str(s, 'entity', '').toLowerCase().includes(filter.toLowerCase()) && !str(s, 'chain', '').toLowerCase().includes(filter.toLowerCase())) return false;
    if (statusFilter !== 'all' && str(s, 'status') !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <PulsingDot color={wsConnected ? C.green : C.red} size={4} />
          <span className="text-xs font-medium" style={{ color: wsConnected ? C.green : C.red }}>{wsConnected ? 'WebSocket Connected' : 'Polling Mode'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-1 rounded" style={{ color: C.green, background: C.green + '18' }}>{coherent} Coherent</span>
          <span className="text-xs font-medium px-2 py-1 rounded" style={{ color: C.amber, background: C.amber + '18' }}>{warnings} Warning</span>
          <span className="text-xs font-medium px-2 py-1 rounded" style={{ color: C.red, background: C.red + '18' }}>{intercepts} Intercept</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: C.textSec }} />
          <Input placeholder="Filter by entity or chain..." value={filter} onChange={e => setFilter(e.target.value)}
            className="pl-9 text-xs h-9" style={{ background: C.card, borderColor: C.border, color: C.text }} />
        </div>
        <div className="flex gap-1">
          {['all', 'COHERENT', 'WARNING', 'INTERCEPT'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ background: statusFilter === s ? C.green + '20' : C.card, color: statusFilter === s ? C.green : C.textSec, border: `1px solid ${statusFilter === s ? C.green + '40' : C.border}` }}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      <DashCard>
        <div ref={tableRef} className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0" style={{ background: C.card }}>
              <tr>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>ID</th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Entity</th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Chain</th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Status</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>Coherence</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>Threshold</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sig, i) => {
                const coh = num(sig, 'coherence', 0);
                const status = str(sig, 'status', 'UNKNOWN');
                return (
                  <tr key={i} className="border-t transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                    <td className="px-3 py-2" style={{ color: C.textSec }}>#{num(sig, 'id', i + 1)}</td>
                    <td className="px-3 py-2 font-medium" style={{ color: C.text }}>{str(sig, 'entity', '-')}</td>
                    <td className="px-3 py-2" style={{ color: C.textSec }}>{str(sig, 'chain', '-')}</td>
                    <td className="px-3 py-2"><StatusBadge status={status} /></td>
                    <td className="px-3 py-2 text-right tabular-nums" style={{ color: coh > 0.8 ? C.green : coh > 0.6 ? C.amber : C.red }}>{fmtPct(coh)}</td>
                    <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.textSec }}>{fmtPct(num(sig, 'threshold', 0))}</td>
                    <td className="px-3 py-2 text-right" style={{ color: C.textSec }}>{fmtTime(str(sig, 'timestamp'))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-8 text-center"><p className="text-xs" style={{ color: C.textSec }}>No signals match your filter</p></div>}
        </div>
      </DashCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 3: CHAINS (ZERO BRIDGE)
// ═══════════════════════════════════════════════════════════════════
function ChainsPage() {
  const { data: chainsData, loading: cL } = useChains();
  const { data: vmData } = useVmFamilies();
  const { data: routesData } = useZeroBridgeRoutes();
  const { data: statsData } = useZeroBridgeStats();
  const [search, setSearch] = useState('');
  const [vmFilter, setVmFilter] = useState('all');

  if (cL) return <PageSkeleton />;

  const chains = arr<Record<string, unknown>>(chainsData, 'chains');
  const families = arr<Record<string, unknown>>(vmData, 'families');
  const routes = arr<Record<string, unknown>>(routesData, 'routes');

  const vms = ['all', ...Array.from(new Set(chains.map(c => str(c, 'vm', 'Unknown'))))];

  const filtered = chains.filter(c => {
    if (vmFilter !== 'all' && str(c, 'vm') !== vmFilter) return false;
    if (search && !str(c, 'name', '').toLowerCase().includes(search.toLowerCase()) && !str(c, 'id', '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusCounts: Record<string, number> = {};
  chains.forEach(c => { const s = str(c, 'status', 'unknown'); statusCounts[s] = (statusCounts[s] || 0) + 1; });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Chains" value={String(chains.length)} color={C.text} />
        <StatCard label="Active" value={String(statusCounts['active'] || 0)} color={C.green} />
        <StatCard label="BTCP Routes" value={String(routes.length)} color={C.blue} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: C.textSec }} />
          <Input placeholder="Search chains..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 text-xs h-9" style={{ background: C.card, borderColor: C.border, color: C.text }} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {vms.slice(0, 10).map(vm => (
            <button key={vm} onClick={() => setVmFilter(vm)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors"
              style={{ background: vmFilter === vm ? C.green + '20' : C.card, color: vmFilter === vm ? C.green : C.textSec, border: `1px solid ${vmFilter === vm ? C.green + '40' : C.border}` }}>
              {vm}
            </button>
          ))}
        </div>
      </div>

      <DashCard>
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0" style={{ background: C.card }}>
              <tr>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Name</th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>VM</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>Chain ID</th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Status</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>Block Height</th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Currency</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const status = str(c, 'status', 'unknown');
                return (
                  <tr key={i} className="border-t transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                    <td className="px-3 py-2 font-medium" style={{ color: C.text }}>{str(c, 'name', '-')}</td>
                    <td className="px-3 py-2"><span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: C.blue + '18', color: C.blue }}>{str(c, 'vm', '-')}</span></td>
                    <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.textSec }}>{str(c, 'chainId', '-')}</td>
                    <td className="px-3 py-2"><StatusBadge status={status} /></td>
                    <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.textSec }}>{num(c, 'blockHeight', 0) > 0 ? fmtNum(num(c, 'blockHeight', 0)) : '-'}</td>
                    <td className="px-3 py-2" style={{ color: C.textSec }}>{str(c, 'currency', str(c, 'symbol', '-'))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-8 text-center"><p className="text-xs" style={{ color: C.textSec }}>No chains match your filter</p></div>}
        </div>
      </DashCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 4: BEO LIVE
// ═══════════════════════════════════════════════════════════════════
function BeoLivePage() {
  const { data: beoData, loading: bL } = useBeoLive();
  const { data: archData } = useArchetypes();

  if (bL) return <PageSkeleton />;

  const entities = arr<Record<string, unknown>>(beoData, 'entities').length > 0
    ? arr<Record<string, unknown>>(beoData, 'entities')
    : arr<Record<string, unknown>>(beoData, 'data');
  const archetypes = arr<Record<string, unknown>>(archData, 'archetypes');

  const archDist: Record<string, number> = {};
  entities.forEach(e => {
    const a = str(e, 'archetype', 'Unknown');
    archDist[a] = (archDist[a] || 0) + 1;
  });
  const maxArchCount = Math.max(...Object.values(archDist), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Entities" value={String(entities.length)} color={C.text} />
        <StatCard label="Archetypes" value={String(archetypes.length || Object.keys(archDist).length)} color={C.purple} />
        <StatCard label="Healthy" value={String(entities.filter(e => str(e, 'status', '').toLowerCase() === 'healthy').length)} color={C.green} />
        <StatCard label="Monitoring" value={String(entities.filter(e => str(e, 'status', '').toLowerCase() === 'monitoring').length)} color={C.amber} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <SectionHeader title="Behavioral Entity Objects" icon={Users} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {entities.map((e, i) => {
              const coh = num(e, 'coherence', 0);
              const status = str(e, 'status', 'unknown');
              return (
                <DashCard key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: C.text }}>{str(e, 'name', '-')}</span>
                    <StatusBadge status={status} />
                  </div>
                  <p className="text-xs mb-3" style={{ color: C.textSec }}>{str(e, 'archetype', '-')}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: C.textSec }}>Coherence</span>
                      <span className="tabular-nums" style={{ color: coh > 0.8 ? C.green : coh > 0.6 ? C.amber : C.red }}>{fmtPct(coh)}</span>
                    </div>
                    <ProgressBar value={coh} color={coh > 0.8 ? C.green : coh > 0.6 ? C.amber : C.red} />
                    <div className="flex gap-4 text-xs mt-2">
                      <span style={{ color: C.textSec }}>Mental <span style={{ color: C.text }}>{fmtPct(num(e, 'mental', 0))}</span></span>
                      <span style={{ color: C.textSec }}>Spiritual <span style={{ color: C.purple }}>{fmtPct(num(e, 'spiritual', 0))}</span></span>
                    </div>
                  </div>
                </DashCard>
              );
            })}
          </div>
        </div>

        <div>
          <SectionHeader title="Archetype Distribution" icon={BarChart3} />
          <DashCard>
            <div className="space-y-3">
              {Object.entries(archDist).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
                <div key={name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span style={{ color: C.text }}>{name.replace(/_/g, ' ')}</span>
                    <span style={{ color: C.textSec }}>{count}</span>
                  </div>
                  <ProgressBar value={count / maxArchCount} color={C.purple} />
                </div>
              ))}
            </div>
          </DashCard>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 5: BH EXPLORER
// ═══════════════════════════════════════════════════════════════════
function BhExplorerPage() {
  const { data: explorerData, loading: eL } = useBhExplorer();
  const { data: streamData } = useBhStream();

  if (eL) return <PageSkeleton />;

  const hashes = arr<Record<string, unknown>>(explorerData, 'hashes').length > 0
    ? arr<Record<string, unknown>>(explorerData, 'hashes')
    : arr<Record<string, unknown>>(explorerData, 'data');
  const stream = arr<Record<string, unknown>>(streamData, 'stream');

  const allHashes = hashes.length > 0 ? hashes : stream;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <PulsingDot color={C.green} size={5} />
        <span className="text-xs font-medium" style={{ color: C.green }}>Streaming Behavioral Hashes</span>
        <span className="text-xs" style={{ color: C.textSec }}>Auto-updating every 2 seconds</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Hashes" value={fmtNum(allHashes.length)} color={C.text} />
        <StatCard label="Complement Verified" value={String(allHashes.filter(h => str(h, 'complementStatus', '') === 'verified').length)} color={C.green} />
        <StatCard label="Chains Tracked" value={String(new Set(allHashes.map(h => str(h, 'chain', ''))).size)} color={C.blue} />
      </div>

      <DashCard>
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0" style={{ background: C.card }}>
              <tr>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Sense Hash</th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Antisense Hash</th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Chain</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>Block</th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Entity</th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Event</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {allHashes.slice(0, 50).map((h, i) => (
                <tr key={i} className="border-t transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                  <td className="px-3 py-2 font-mono" style={{ color: C.green }}>{truncate(str(h, 'sense', str(h, 'senseHash', str(h, 'hash', '-'))), 12)}</td>
                  <td className="px-3 py-2 font-mono" style={{ color: C.red }}>{truncate(str(h, 'antisense', str(h, 'antisenseHash', '-')), 12)}</td>
                  <td className="px-3 py-2" style={{ color: C.textSec }}>{str(h, 'chain', '-')}</td>
                  <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.textSec }}>{num(h, 'blockNumber', num(h, 'block', 0))}</td>
                  <td className="px-3 py-2" style={{ color: C.text }}>{str(h, 'entity', '-')}</td>
                  <td className="px-3 py-2"><span className="px-2 py-0.5 rounded text-[10px]" style={{ background: C.purple + '18', color: C.purple }}>{str(h, 'eventType', str(h, 'event', '-'))}</span></td>
                  <td className="px-3 py-2 text-right" style={{ color: C.textSec }}>{fmtTime(str(h, 'timestamp'))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 6: AKASHIC INDEX
// ═══════════════════════════════════════════════════════════════════
function AkashicIndexPage() {
  const { data: indexData, loading: iL } = useAkashicIndex();
  const { data: depthData } = useAkashicDepth();
  const { data: searchData, refetch: searchRefetch } = useAkashicSearch('');
  const [searchQ, setSearchQ] = useState('');

  const handleSearch = useCallback(() => {
    searchRefetch();
  }, [searchRefetch]);

  if (iL) return <PageSkeleton />;

  const totalEntities = num(indexData, 'totalEntities', num(indexData, 'totalBhEntities', 0));
  const vectorsIndexed = num(indexData, 'vectorsIndexed', 0);
  const indexSize = str(indexData, 'indexSize', '-');
  const queryLatency = str(indexData, 'queryLatency', '-');
  const storageUsed = str(indexData, 'storageUsed', '-');
  const appendRate = str(indexData, 'appendRate', '-');
  const convergenceStatus = str(indexData, 'convergenceStatus', str(indexData, 'convergence', '-'));
  const depthMetrics = obj(depthData, 'metrics') || depthData || {};
  const searchResults = arr<Record<string, unknown>>(searchData, 'results');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total BH Entities" value={fmtNum(totalEntities)} color={C.green} />
        <StatCard label="Vectors Indexed" value={fmtNum(vectorsIndexed)} color={C.blue} />
        <StatCard label="Index Size" value={indexSize} color={C.purple} />
        <StatCard label="Query Latency" value={queryLatency} color={C.amber} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Storage Used" value={storageUsed} color={C.text} />
        <StatCard label="Append Rate" value={appendRate} color={C.green} />
        <StatCard label="Convergence" value={convergenceStatus} color={statusColor(convergenceStatus)} />
        <StatCard label="Depth" value={str(depthMetrics, 'currentDepth', str(depthMetrics, 'depth', '-'))} color={C.purple} />
      </div>

      <DashCard title="Search BEO Entities">
        <div className="flex gap-2">
          <Input placeholder="Search entities..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="flex-1 text-xs h-9" style={{ background: '#0a0b0f', borderColor: C.border, color: C.text }} />
          <button onClick={handleSearch} className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ background: C.green, color: '#0a0b0f' }}>Search</button>
        </div>
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: '#0a0b0f' }}>
                <span className="text-xs font-medium" style={{ color: C.text }}>{str(r, 'name', '-')}</span>
                <span className="text-[10px]" style={{ color: C.textSec }}>{str(r, 'archetype', '')}</span>
                <span className="ml-auto text-[10px]" style={{ color: C.green }}>{fmtPct(num(r, 'coherence', 0))}</span>
              </div>
            ))}
          </div>
        )}
      </DashCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 7: ANIMA INTELLIGENCE
// ═══════════════════════════════════════════════════════════════════
function AnimaIntelligencePage() {
  const { data: streamsData, loading: sL } = useAnimaStreams();

  if (sL) return <PageSkeleton />;

  const streams = arr<Record<string, unknown>>(streamsData, 'streams');
  const crossDomain = obj(streamsData, 'crossDomain') || obj(streamsData, 'crossDomainSources') || {};
  const observerEffect = obj(streamsData, 'observerEffect') || {};
  const sourceCredibility = obj(streamsData, 'sourceCredibility') || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Streams" value={String(streams.length)} color={C.purple} />
        <StatCard label="Avg Accuracy" value={fmtPct(streams.length > 0 ? streams.reduce((a, s) => a + num(s, 'accuracy', 0), 0) / streams.length : 0)} color={C.green} />
        <StatCard label="Cross-Domain Sources" value={str(crossDomain, 'count', str(crossDomain, 'sources', '-'))} color={C.blue} />
        <StatCard label="Observer Effect" value={str(observerEffect, 'status', str(observerEffect, 'indicator', '-'))} color={C.amber} />
      </div>

      <SectionHeader title="Intelligence Streams" icon={Brain} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {streams.map((s, i) => {
          const status = str(s, 'status', 'unknown');
          const accuracy = num(s, 'accuracy', 0);
          return (
            <DashCard key={i}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium" style={{ color: C.text }}>{str(s, 'name', '-')}</span>
                <StatusBadge status={status} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p style={{ color: C.textSec }}>Throughput</p>
                  <p className="font-medium mt-0.5" style={{ color: C.text }}>{str(s, 'throughput', '-')}</p>
                </div>
                <div>
                  <p style={{ color: C.textSec }}>Accuracy</p>
                  <p className="font-medium mt-0.5" style={{ color: accuracy > 0.85 ? C.green : C.amber }}>{fmtPct(accuracy)}</p>
                </div>
                <div className="col-span-2">
                  <p style={{ color: C.textSec }}>Model</p>
                  <p className="font-medium mt-0.5" style={{ color: C.purple }}>{str(s, 'model', '-')}</p>
                </div>
              </div>
            </DashCard>
          );
        })}
      </div>

      {(Object.keys(sourceCredibility).length > 0 || Object.keys(crossDomain).length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(crossDomain).length > 0 && (
            <DashCard title="Cross-Domain Sources">
              <pre className="text-xs overflow-auto" style={{ color: C.textSec }}>{JSON.stringify(crossDomain, null, 2)}</pre>
            </DashCard>
          )}
          {Object.keys(sourceCredibility).length > 0 && (
            <DashCard title="Source Credibility">
              <pre className="text-xs overflow-auto" style={{ color: C.textSec }}>{JSON.stringify(sourceCredibility, null, 2)}</pre>
            </DashCard>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 8: LIVING SECURITY
// ═══════════════════════════════════════════════════════════════════
function LivingSecurityPage() {
  const { data: livingData, loading: lL } = useLivingSecurity();
  const { data: crisprData } = useCrispr();
  const { data: alertsData } = useSecurityAlerts();
  const { data: gkData } = useLivingSecurityGk();
  const { data: epiData } = useLivingSecurityEpigenetic();
  const { data: immuneData } = useLivingSecurityImmune();

  if (lL) return <PageSkeleton />;

  const components = arr<Record<string, unknown>>(livingData, 'components');
  const signatures = arr<Record<string, unknown>>(crisprData, 'signatures');
  const alerts = arr<Record<string, unknown>>(alertsData, 'alerts').slice(0, 8);
  const gkStream = arr<Record<string, unknown>>(gkData, 'stream');
  const epiState = obj(epiData, 'state') || epiData || {};
  const immune = obj(immuneData, 'layers') || immuneData || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Components" value={String(components.length)} color={C.green} />
        <StatCard label="Avg Score" value={components.length > 0 ? fmtPct(components.reduce((a, c) => a + num(c, 'score', 0), 0) / components.length / 100) : '-'} color={C.purple} />
        <StatCard label="CRISPR Signatures" value={String(signatures.length)} color={C.amber} />
        <StatCard label="Active Threats" value={String(components.reduce((a, c) => a + num(c, 'threats', num(c, 'activeThreats', 0)), 0))} color={C.red} />
      </div>

      <SectionHeader title="Security Components" icon={Shield} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {components.map((comp, i) => {
          const score = num(comp, 'score', 0);
          const status = str(comp, 'status', 'unknown');
          return (
            <DashCard key={i}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: C.text }}>{str(comp, 'name', '-')}</span>
                <StatusBadge status={status} />
              </div>
              <p className="text-3xl font-bold mb-1 tabular-nums" style={{ color: score > 95 ? C.green : score > 90 ? C.amber : C.red }}>{score > 0 ? fmtPct(score / 100) : str(comp, 'score', '-')}</p>
              <div className="flex justify-between text-xs mt-2" style={{ color: C.textSec }}>
                <span>Uptime: {str(comp, 'uptime', '-')}</span>
                <span>Threats: {num(comp, 'threats', num(comp, 'activeThreats', 0))}</span>
              </div>
            </DashCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <DashCard title="CRISPR Signatures">
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0" style={{ background: C.card }}>
                <tr>
                  <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>ID</th>
                  <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Name</th>
                  <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Severity</th>
                  <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>Intercepts</th>
                </tr>
              </thead>
              <tbody>
                {signatures.slice(0, 10).map((sig, i) => (
                  <tr key={i} className="border-t" style={{ borderColor: C.border }}>
                    <td className="px-3 py-2" style={{ color: C.textSec }}>{str(sig, 'id', '-')}</td>
                    <td className="px-3 py-2" style={{ color: C.text }}>{str(sig, 'name', '-')}</td>
                    <td className="px-3 py-2"><StatusBadge status={str(sig, 'severity', 'medium')} /></td>
                    <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.text }}>{num(sig, 'intercepts', num(sig, 'count', 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashCard>

        <DashCard title="Security Alerts">
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {alerts.length === 0 && <p className="text-xs py-4 text-center" style={{ color: C.textSec }}>No active alerts</p>}
            {alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg" style={{ background: '#0a0b0f' }}>
                {str(a, 'severity') === 'critical' ? <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: C.red }} /> :
                 str(a, 'severity') === 'high' ? <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: C.amber }} /> :
                 <Bell className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: C.blue }} />}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium" style={{ color: C.text }}>{str(a, 'signature', str(a, 'title', 'Alert'))}</p>
                  <p className="text-[10px]" style={{ color: C.textSec }}>{str(a, 'chain', '')} - {str(a, 'entity', '')}</p>
                  <p className="text-[10px]" style={{ color: C.textSec }}>{fmtTime(str(a, 'timestamp'))}</p>
                </div>
              </div>
            ))}
          </div>
        </DashCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashCard title="Genomic Key Stream">
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {gkStream.length > 0 ? gkStream.slice(0, 5).map((g, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded" style={{ background: '#0a0b0f' }}>
                <span className="font-mono" style={{ color: C.green }}>{truncate(str(g, 'key', str(g, 'hash', '-')), 16)}</span>
                <span style={{ color: C.textSec }}>{str(g, 'status', '')}</span>
              </div>
            )) : <p className="text-xs py-2" style={{ color: C.textSec }}>No genomic key data</p>}
          </div>
        </DashCard>

        <DashCard title="Epigenetic State">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span style={{ color: C.textSec }}>Status</span><StatusBadge status={str(epiState, 'status', 'unknown')} /></div>
            <div className="flex justify-between"><span style={{ color: C.textSec }}>Layer Count</span><span style={{ color: C.text }}>{str(epiState, 'layerCount', str(epiState, 'layers', '-'))}</span></div>
            <div className="flex justify-between"><span style={{ color: C.textSec }}>State</span><span style={{ color: C.text }}>{str(epiState, 'state', str(epiState, 'current', '-'))}</span></div>
          </div>
        </DashCard>

        <DashCard title="Immune System">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span style={{ color: C.textSec }}>Innate</span><span style={{ color: C.green }}>{str(immune, 'innate', str(immune, 'innateStatus', '-'))}</span></div>
            <div className="flex justify-between"><span style={{ color: C.textSec }}>Adaptive</span><span style={{ color: C.blue }}>{str(immune, 'adaptive', str(immune, 'adaptiveStatus', '-'))}</span></div>
            <div className="flex justify-between"><span style={{ color: C.textSec }}>Memory</span><span style={{ color: C.purple }}>{str(immune, 'memory', str(immune, 'memoryStatus', '-'))}</span></div>
            <div className="flex justify-between"><span style={{ color: C.textSec }}>Status</span><StatusBadge status={str(immune, 'status', 'unknown')} /></div>
          </div>
        </DashCard>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 9: AI AGENTS
// ═══════════════════════════════════════════════════════════════════
function AiAgentsPage() {
  const { data: agentsData, loading: aL } = useAiAgents();

  if (aL) return <PageSkeleton />;

  const agents = arr<Record<string, unknown>>(agentsData, 'agents');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Agents" value={String(agents.length)} color={C.text} />
        <StatCard label="Active" value={String(agents.filter(a => str(a, 'status', '').toLowerCase() === 'active').length)} color={C.green} />
        <StatCard label="Avg Coherence" value={agents.length > 0 ? fmtPct(agents.reduce((a, c) => a + num(c, 'coherence', 0), 0) / agents.length) : '-'} color={C.purple} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent, i) => {
          const coh = num(agent, 'coherence', 0);
          const status = str(agent, 'status', 'unknown');
          const depth = num(agent, 'depth', 0);
          return (
            <DashCard key={i}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4" style={{ color: C.purple }} />
                  <span className="text-sm font-medium" style={{ color: C.text }}>{str(agent, 'id', str(agent, 'name', '-'))}</span>
                </div>
                <StatusBadge status={status} />
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span style={{ color: C.textSec }}>Entity</span><span style={{ color: C.text }}>{str(agent, 'entity', '-')}</span></div>
                <div className="flex justify-between"><span style={{ color: C.textSec }}>Archetype</span><span style={{ color: C.text }}>{str(agent, 'archetype', '-')}</span></div>
                <div className="flex justify-between"><span style={{ color: C.textSec }}>Capabilities</span><span style={{ color: C.text }}>{str(agent, 'capabilities', '-')}</span></div>
                <div className="flex justify-between"><span style={{ color: C.textSec }}>Coherence</span><span style={{ color: coh > 0.8 ? C.green : C.amber }}>{fmtPct(coh)}</span></div>
                <div className="flex justify-between"><span style={{ color: C.textSec }}>Depth</span><span style={{ color: C.text }}>{depth > 0 ? String(depth) : '-'}</span></div>
                <div className="flex justify-between"><span style={{ color: C.textSec }}>Chains</span><span style={{ color: C.text }}>{str(agent, 'chains', '-')}</span></div>
              </div>
            </DashCard>
          );
        })}
      </div>
      {agents.length === 0 && <EmptyState message="No AI agents detected" />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 10: VALIDATORS
// ═══════════════════════════════════════════════════════════════════
function ValidatorsPage() {
  const { data: validatorsData, loading: vL } = useValidators();
  const { data: consensusData } = useValidatorsConsensus();

  if (vL) return <PageSkeleton />;

  const validators = arr<Record<string, unknown>>(validatorsData, 'validators');
  const consensus = consensusData || {};

  const diversityDist: Record<string, number> = {};
  validators.forEach(v => {
    const arch = str(v, 'architecture', str(v, 'arch', 'Unknown'));
    diversityDist[arch] = (diversityDist[arch] || 0) + 1;
  });
  const maxDiv = Math.max(...Object.values(diversityDist), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Validators" value={String(validators.length)} color={C.text} />
        <StatCard label="Active" value={String(validators.filter(v => str(v, 'status', '').toLowerCase() === 'active').length)} color={C.green} />
        <StatCard label="HHI Index" value={str(consensus, 'hhi', str(consensus, 'hhiIndex', '-'))} color={C.amber} />
        <StatCard label="Geographic Dist." value={str(consensus, 'geographicDistribution', str(consensus, 'regions', '-'))} color={C.blue} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <DashCard>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0" style={{ background: C.card }}>
                  <tr>
                    <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>ID</th>
                    <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>Stake</th>
                    <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>Diversity</th>
                    <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>Weight</th>
                    <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Architecture</th>
                    <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Region</th>
                    <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>Uptime</th>
                    <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {validators.map((v, i) => (
                    <tr key={i} className="border-t transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                      <td className="px-3 py-2 font-medium" style={{ color: C.text }}>{str(v, 'id', str(v, 'name', '-'))}</td>
                      <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.text }}>{str(v, 'stake', '-')}</td>
                      <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.textSec }}>{fmtPct(num(v, 'diversity', 0))}</td>
                      <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.textSec }}>{fmtPct(num(v, 'effectiveWeight', num(v, 'weight', 0)))}</td>
                      <td className="px-3 py-2"><span className="px-2 py-0.5 rounded text-[10px]" style={{ background: C.blue + '18', color: C.blue }}>{str(v, 'architecture', str(v, 'arch', '-'))}</span></td>
                      <td className="px-3 py-2" style={{ color: C.textSec }}>{str(v, 'region', '-')}</td>
                      <td className="px-3 py-2 text-right" style={{ color: C.green }}>{str(v, 'uptime', '-')}</td>
                      <td className="px-3 py-2"><StatusBadge status={str(v, 'status', 'unknown')} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashCard>
        </div>

        <div>
          <DashCard title="Architecture Distribution">
            <div className="space-y-3">
              {Object.entries(diversityDist).sort((a, b) => b[1] - a[1]).map(([arch, count]) => (
                <div key={arch}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span style={{ color: C.text }}>{arch}</span>
                    <span style={{ color: C.textSec }}>{count}</span>
                  </div>
                  <ProgressBar value={count / maxDiv} color={C.blue} />
                </div>
              ))}
            </div>
          </DashCard>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 11: ANNOTATORS
// ═══════════════════════════════════════════════════════════════════
function AnnotatorsPage() {
  const { data: annotatorsData, loading: aL } = useAnnotators();
  const { data: reviewsData } = useAnnotatorsReviews();

  if (aL) return <PageSkeleton />;

  const annotators = arr<Record<string, unknown>>(annotatorsData, 'annotators');
  const reviews = arr<Record<string, unknown>>(reviewsData, 'reviews');

  const accDist: Record<string, number> = {};
  annotators.forEach(a => {
    const acc = num(a, 'accuracy', 0);
    const bucket = acc > 0.95 ? '95-100%' : acc > 0.9 ? '90-95%' : acc > 0.8 ? '80-90%' : '<80%';
    accDist[bucket] = (accDist[bucket] || 0) + 1;
  });
  const maxAcc = Math.max(...Object.values(accDist), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Annotators" value={String(annotators.length)} color={C.text} />
        <StatCard label="Avg Accuracy" value={annotators.length > 0 ? fmtPct(annotators.reduce((a, c) => a + num(c, 'accuracy', 0), 0) / annotators.length) : '-'} color={C.green} />
        <StatCard label="Total Reviews" value={String(reviews.length)} color={C.blue} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <DashCard>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0" style={{ background: C.card }}>
                  <tr>
                    <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>ID</th>
                    <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>Stake</th>
                    <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>Accuracy</th>
                    <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>Reviews</th>
                    <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Jurisdiction</th>
                    <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Specialty</th>
                    <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {annotators.map((a, i) => (
                    <tr key={i} className="border-t transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                      <td className="px-3 py-2 font-medium" style={{ color: C.text }}>{str(a, 'id', str(a, 'name', '-'))}</td>
                      <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.text }}>{str(a, 'stake', '-')}</td>
                      <td className="px-3 py-2 text-right tabular-nums" style={{ color: num(a, 'accuracy', 0) > 0.9 ? C.green : C.amber }}>{fmtPct(num(a, 'accuracy', 0))}</td>
                      <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.textSec }}>{num(a, 'reviews', num(a, 'totalReviews', 0))}</td>
                      <td className="px-3 py-2" style={{ color: C.textSec }}>{str(a, 'jurisdiction', '-')}</td>
                      <td className="px-3 py-2" style={{ color: C.textSec }}>{str(a, 'specialty', '-')}</td>
                      <td className="px-3 py-2"><StatusBadge status={str(a, 'status', 'unknown')} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashCard>
        </div>

        <div className="space-y-4">
          <DashCard title="Accuracy Distribution">
            <div className="space-y-3">
              {Object.entries(accDist).sort((a, b) => b[1] - a[1]).map(([bucket, count]) => (
                <div key={bucket}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span style={{ color: C.text }}>{bucket}</span>
                    <span style={{ color: C.textSec }}>{count}</span>
                  </div>
                  <ProgressBar value={count / maxAcc} color={C.green} />
                </div>
              ))}
            </div>
          </DashCard>

          <DashCard title="Recent Reviews">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {reviews.slice(0, 5).map((r, i) => (
                <div key={i} className="p-2 rounded-lg text-xs" style={{ background: '#0a0b0f' }}>
                  <div className="flex justify-between">
                    <span style={{ color: C.text }}>{str(r, 'annotator', str(r, 'reviewer', '-'))}</span>
                    <span style={{ color: C.textSec }}>{fmtTime(str(r, 'timestamp'))}</span>
                  </div>
                  <p className="mt-1" style={{ color: C.textSec }}>{str(r, 'assessment', str(r, 'summary', '-'))}</p>
                </div>
              ))}
            </div>
          </DashCard>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 12: EVOLUTIONARY FITNESS
// ═══════════════════════════════════════════════════════════════════
function EvolutionaryFitnessPage() {
  const { data: fitnessData, loading: fL } = useEvolutionaryFitness();
  const { data: loveData } = useEvolutionaryLoveProtocol();

  if (fL) return <PageSkeleton />;

  const components = arr<Record<string, unknown>>(fitnessData, 'components');
  const loveProtocol = loveData || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Components" value={String(components.length)} color={C.text} />
        <StatCard label="Avg Fitness" value={components.length > 0 ? fmtPct(components.reduce((a, c) => a + num(c, 'fitness', 0), 0) / components.length) : '-'} color={C.green} />
        <StatCard label="Love Protocol" value={str(loveProtocol, 'status', str(loveProtocol, 'phase', '-'))} color={C.purple} />
        <StatCard label="Intelligence Maint." value={str(loveProtocol, 'imStatus', str(loveProtocol, 'intelligenceMaintenance', '-'))} color={C.amber} />
      </div>

      <SectionHeader title="Fitness Components" icon={TrendingUp} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {components.map((comp, i) => {
          const fitness = num(comp, 'fitness', 0);
          const status = str(comp, 'status', 'unknown');
          return (
            <DashCard key={i}>
              <p className="text-sm font-medium mb-3" style={{ color: C.text }}>{str(comp, 'name', '-')}</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span style={{ color: C.textSec }}>PA</span><span style={{ color: C.text }}>{fmtPct(num(comp, 'pa', 0))}</span></div>
                <div className="flex justify-between"><span style={{ color: C.textSec }}>ICE</span><span style={{ color: C.text }}>{fmtPct(num(comp, 'ice', 0))}</span></div>
                <div className="flex justify-between"><span style={{ color: C.textSec }}>AS</span><span style={{ color: C.text }}>{fmtPct(num(comp, 'as', 0))}</span></div>
                <div className="flex justify-between"><span style={{ color: C.textSec }}>Love</span><span style={{ color: C.purple }}>{fmtPct(num(comp, 'love', 0))}</span></div>
                <div className="flex justify-between"><span style={{ color: C.textSec }}>Fitness</span><span style={{ color: fitness > 0.7 ? C.green : C.amber }}>{fmtPct(fitness)}</span></div>
                <div className="flex justify-between"><span style={{ color: C.textSec }}>IM</span><span style={{ color: C.text }}>{fmtPct(num(comp, 'im', 0))}</span></div>
                <div className="flex justify-between items-center pt-1 border-t" style={{ borderColor: C.border }}>
                  <span style={{ color: C.textSec }}>Status</span>
                  <StatusBadge status={status} />
                </div>
              </div>
            </DashCard>
          );
        })}
      </div>

      <DashCard title="Love Protocol Metrics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {Object.entries(loveProtocol).filter(([k]) => !['status', 'phase'].includes(k)).slice(0, 8).map(([k, v]) => (
            <div key={k} className="flex justify-between p-2 rounded-lg" style={{ background: '#0a0b0f' }}>
              <span style={{ color: C.textSec }}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span style={{ color: C.text }}>{typeof v === 'number' ? fmtPct(v) : String(v)}</span>
            </div>
          ))}
        </div>
      </DashCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 13: CONTINUUM DEX
// ═══════════════════════════════════════════════════════════════════
function ContinuumDexPage() {
  const { data: dexData, loading: dL } = useContinuumDex();
  const { data: bidData } = useContinuumBidEngine();
  const { data: cmeData } = useContinuumCmeEngine();
  const { data: bdcData } = useContinuumBdcCredit();

  if (dL) return <PageSkeleton />;

  const pairs = arr<Record<string, unknown>>(dexData, 'pairs');
  const bidEngine = bidData || {};
  const cmeEngine = cmeData || {};
  const bdcCredit = bdcData || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Trading Pairs" value={String(pairs.length)} color={C.text} />
        <StatCard label="BID Engine" value={str(bidEngine, 'status', '-')} color={statusColor(str(bidEngine, 'status', ''))} />
        <StatCard label="CME Engine" value={str(cmeEngine, 'status', '-')} color={statusColor(str(cmeEngine, 'status', ''))} />
        <StatCard label="BDC Credits" value={str(bdcCredit, 'totalCredits', str(bdcCredit, 'total', '-'))} color={C.blue} />
      </div>

      <DashCard>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0" style={{ background: C.card }}>
              <tr>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Pair</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>BID Score</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>Complement</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>PMO Price</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>CCP Premium</th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Settlement</th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>BTCP Route</th>
              </tr>
            </thead>
            <tbody>
              {pairs.map((p, i) => (
                <tr key={i} className="border-t transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                  <td className="px-3 py-2 font-medium" style={{ color: C.text }}>{str(p, 'pair', str(p, 'name', '-'))}</td>
                  <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.green }}>{fmtPct(num(p, 'bidScore', 0))}</td>
                  <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.blue }}>{fmtPct(num(p, 'complementScore', num(p, 'complement', 0)))}</td>
                  <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.text }}>{str(p, 'pmoPrice', '-')}</td>
                  <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.textSec }}>{str(p, 'ccpPremium', '-')}</td>
                  <td className="px-3 py-2"><StatusBadge status={str(p, 'settlementStatus', str(p, 'settlement', '-'))} /></td>
                  <td className="px-3 py-2" style={{ color: C.textSec }}>{str(p, 'btcpRoute', str(p, 'route', '-'))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashCard title="BID Engine">
          <div className="space-y-2 text-xs">
            {Object.entries(bidEngine).slice(0, 8).map(([k, v]) => (
              <div key={k} className="flex justify-between"><span style={{ color: C.textSec }}>{k}</span><span style={{ color: C.text }}>{typeof v === 'number' ? fmtNum(v) : String(v)}</span></div>
            ))}
          </div>
        </DashCard>
        <DashCard title="CME Engine">
          <div className="space-y-2 text-xs">
            {Object.entries(cmeEngine).slice(0, 8).map(([k, v]) => (
              <div key={k} className="flex justify-between"><span style={{ color: C.textSec }}>{k}</span><span style={{ color: C.text }}>{typeof v === 'number' ? fmtNum(v) : String(v)}</span></div>
            ))}
          </div>
        </DashCard>
        <DashCard title="BDC Credit">
          <div className="space-y-2 text-xs">
            {Object.entries(bdcCredit).slice(0, 8).map(([k, v]) => (
              <div key={k} className="flex justify-between"><span style={{ color: C.textSec }}>{k}</span><span style={{ color: C.text }}>{typeof v === 'number' ? fmtNum(v) : String(v)}</span></div>
            ))}
          </div>
        </DashCard>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 14: MARKETPLACE
// ═══════════════════════════════════════════════════════════════════
function MarketplacePage() {
  const { data: listingsData, loading: mL } = useMarketplaceListings();
  const { data: statsData } = useMarketplaceStats();

  if (mL) return <PageSkeleton />;

  const listings = arr<Record<string, unknown>>(listingsData, 'listings');
  const stats = statsData || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Listings" value={String(listings.length)} color={C.text} />
        <StatCard label="Total Volume" value={str(stats, 'totalVolume', '-')} color={C.green} />
        <StatCard label="Total Buyers" value={str(stats, 'totalBuyers', '-')} color={C.blue} />
        <StatCard label="Avg Rating" value={str(stats, 'avgRating', '-')} color={C.amber} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((l, i) => (
          <DashCard key={i}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium" style={{ color: C.text }}>{str(l, 'dataType', str(l, 'type', str(l, 'name', '-')))}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: C.green + '18', color: C.green }}>{str(l, 'price', '-')}</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span style={{ color: C.textSec }}>Provider</span><span style={{ color: C.text }}>{str(l, 'provider', '-')}</span></div>
              <div className="flex justify-between"><span style={{ color: C.textSec }}>Buyers</span><span style={{ color: C.textSec }}>{num(l, 'buyers', 0)}</span></div>
              <div className="flex justify-between"><span style={{ color: C.textSec }}>Rating</span><span style={{ color: C.amber }}>{str(l, 'rating', '-')}</span></div>
              <div className="flex justify-between"><span style={{ color: C.textSec }}>Freshness</span><span style={{ color: C.textSec }}>{str(l, 'freshness', '-')}</span></div>
            </div>
          </DashCard>
        ))}
      </div>
      {listings.length === 0 && <EmptyState message="No marketplace listings" />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 15: SBA
// ═══════════════════════════════════════════════════════════════════
function SbaPage() {
  const { data: sbaData, loading: sL } = useSbaAssessments();

  if (sL) return <PageSkeleton />;

  const nations = arr<Record<string, unknown>>(sbaData, 'nations').length > 0
    ? arr<Record<string, unknown>>(sbaData, 'nations')
    : arr<Record<string, unknown>>(sbaData, 'assessments');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Nations Assessed" value={String(nations.length)} color={C.text} />
        <StatCard label="Avg SBA Score" value={nations.length > 0 ? fmtPct(nations.reduce((a, c) => a + num(c, 'sbaScore', num(c, 'score', 0)), 0) / nations.length) : '-'} color={C.green} />
        <StatCard label="Improving" value={String(nations.filter(n => str(n, 'trend', '').includes('up')).length)} color={C.blue} />
      </div>

      <DashCard>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Nation</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>IQ</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>II</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>SS</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>GB</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>CF</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>SBA Score</th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {nations.map((n, i) => {
                const score = num(n, 'sbaScore', num(n, 'score', 0));
                const trend = str(n, 'trend', 'stable');
                const trendColor = trend.includes('up') ? C.green : trend.includes('down') ? C.red : C.textSec;
                return (
                  <tr key={i} className="border-t transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                    <td className="px-3 py-2 font-medium" style={{ color: C.text }}>{str(n, 'nation', str(n, 'name', '-'))}</td>
                    <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.textSec }}>{num(n, 'iq', 0)}</td>
                    <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.textSec }}>{num(n, 'ii', 0)}</td>
                    <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.textSec }}>{num(n, 'ss', 0)}</td>
                    <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.textSec }}>{num(n, 'gb', 0)}</td>
                    <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.textSec }}>{num(n, 'cf', 0)}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-medium" style={{ color: score > 0.7 ? C.green : C.amber }}>{fmtPct(score)}</td>
                    <td className="px-3 py-2"><span className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" style={{ color: trendColor }} /><span style={{ color: trendColor }}>{trend}</span></span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DashCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 16: BIBL
// ═══════════════════════════════════════════════════════════════════
function BiblPage() {
  const { data: biblData, loading: bL } = useBiblAnalysis();

  if (bL) return <PageSkeleton />;

  const analysis = arr<Record<string, unknown>>(biblData, 'analysis').length > 0
    ? arr<Record<string, unknown>>(biblData, 'analysis')
    : arr<Record<string, unknown>>(biblData, 'data');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Chains Analyzed" value={String(analysis.length)} color={C.text} />
        <StatCard label="Avg NL Score" value={analysis.length > 0 ? fmtPct(analysis.reduce((a, c) => a + num(c, 'nlScore', 0), 0) / analysis.length) : '-'} color={C.green} />
        <StatCard label="Avg Finality" value={analysis.length > 0 ? fmtPct(analysis.reduce((a, c) => a + num(c, 'finality', 0), 0) / analysis.length) : '-'} color={C.blue} />
      </div>

      <DashCard>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Chain</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>NL Score</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>Gas Forecast</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>CC Coherence</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>MF Score</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>Finality</th>
              </tr>
            </thead>
            <tbody>
              {analysis.map((a, i) => (
                <tr key={i} className="border-t transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                  <td className="px-3 py-2 font-medium" style={{ color: C.text }}>{str(a, 'chain', '-')}</td>
                  <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.green }}>{fmtPct(num(a, 'nlScore', 0))}</td>
                  <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.textSec }}>{str(a, 'gasForecast', '-')}</td>
                  <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.blue }}>{fmtPct(num(a, 'ccCoherence', 0))}</td>
                  <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.textSec }}>{fmtPct(num(a, 'mfScore', 0))}</td>
                  <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.green }}>{fmtPct(num(a, 'finality', 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 17: TIMESCALEDB
// ═══════════════════════════════════════════════════════════════════
function TimescaleDbPage() {
  const { data: metricsData, loading: mL } = useTimescaleMetrics();
  const { data: eventsData } = useTimescaleEvents();

  if (mL) return <PageSkeleton />;

  const metrics = metricsData || {};
  const events = arr<Record<string, unknown>>(eventsData, 'events');
  const connPool = obj(metrics, 'connectionPool') || obj(metrics, 'connPool') || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Status" value={str(metrics, 'status', '-')} color={statusColor(str(metrics, 'status', ''))} />
        <StatCard label="Total Events" value={fmtNum(num(metrics, 'totalEvents', 0))} color={C.green} />
        <StatCard label="Events/sec" value={str(metrics, 'eventsPerSec', str(metrics, 'eventsSec', '-'))} color={C.blue} />
        <StatCard label="Storage" value={str(metrics, 'storageUsed', str(metrics, 'storage', '-'))} color={C.purple} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Compression" value={str(metrics, 'compression', '-')} color={C.text} />
        <StatCard label="Query Latency" value={str(metrics, 'queryLatency', '-')} color={C.amber} />
        <StatCard label="Connections" value={str(connPool, 'active', str(connPool, 'count', str(metrics, 'connections', '-')))} color={C.green} />
        <StatCard label="Pool Status" value={str(connPool, 'status', str(metrics, 'poolStatus', '-'))} color={C.blue} />
      </div>

      <DashCard title="Recent Events">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0" style={{ background: C.card }}>
              <tr>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Time</th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Type</th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Source</th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {events.slice(0, 20).map((e, i) => (
                <tr key={i} className="border-t transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                  <td className="px-3 py-2" style={{ color: C.textSec }}>{fmtTime(str(e, 'timestamp'))}</td>
                  <td className="px-3 py-2"><span className="px-2 py-0.5 rounded text-[10px]" style={{ background: C.blue + '18', color: C.blue }}>{str(e, 'type', str(e, 'eventType', '-'))}</span></td>
                  <td className="px-3 py-2" style={{ color: C.text }}>{str(e, 'source', '-')}</td>
                  <td className="px-3 py-2" style={{ color: C.textSec }}>{truncate(str(e, 'details', str(e, 'message', '-')), 50)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 18: TRADING
// ═══════════════════════════════════════════════════════════════════
function TradingPage() {
  const { data: pairsData, loading: pL } = useTradingPairs();

  if (pL) return <PageSkeleton />;

  const pairs = arr<Record<string, unknown>>(pairsData, 'pairs');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Trading Pairs" value={String(pairs.length)} color={C.text} />
        <StatCard label="Active Firewall" value={String(pairs.filter(p => str(p, 'firewall', '').toLowerCase() === 'active').length)} color={C.green} />
        <StatCard label="Monitoring" value={String(pairs.filter(p => str(p, 'firewall', '').toLowerCase() === 'monitoring').length)} color={C.amber} />
        <StatCard label="Total Volume" value={fmtNum(pairs.reduce((a, p) => a + num(p, 'volume24h', 0), 0))} color={C.blue} />
      </div>

      <DashCard>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Pair</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>Price</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>BTV</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>Change 24h</th>
                <th className="px-3 py-2 text-right font-medium" style={{ color: C.textSec }}>Volume 24h</th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSec }}>Firewall</th>
              </tr>
            </thead>
            <tbody>
              {pairs.map((p, i) => {
                const change = num(p, 'change24h', 0);
                return (
                  <tr key={i} className="border-t transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                    <td className="px-3 py-2 font-medium" style={{ color: C.text }}>{str(p, 'pair', str(p, 'name', '-'))}</td>
                    <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.text }}>{str(p, 'price', '-')}</td>
                    <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.green }}>{str(p, 'btv', '-')}</td>
                    <td className="px-3 py-2 text-right tabular-nums" style={{ color: change >= 0 ? C.green : C.red }}>{change >= 0 ? '+' : ''}{fmtPct(change / 100)}</td>
                    <td className="px-3 py-2 text-right tabular-nums" style={{ color: C.textSec }}>{fmtNum(num(p, 'volume24h', 0))}</td>
                    <td className="px-3 py-2"><StatusBadge status={str(p, 'firewall', 'unknown')} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DashCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 19: 0G NETWORK
// ═══════════════════════════════════════════════════════════════════
function ZeroGNetworkPage() {
  const { data: statusData, loading: zL } = useZeroGStatus();

  if (zL) return <PageSkeleton />;

  const status = statusData || {};
  const execGate = obj(status, 'executionGate') || {};
  const daStorage = obj(status, 'daStorage') || {};
  const faissSync = obj(status, 'faissSync') || {};
  const zkProof = obj(status, 'zkProof') || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Network" value={str(status, 'network', str(status, 'name', '-'))} color={C.text} />
        <StatCard label="Status" value={str(status, 'connected', str(status, 'status', '-'))} color={statusColor(str(status, 'connected', str(status, 'status', '')))} />
        <StatCard label="Block Height" value={fmtNum(num(status, 'blockHeight', 0))} color={C.green} />
        <StatCard label="Chain ID" value={str(status, 'chainId', '-')} color={C.blue} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DashCard title="Execution Gate">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span style={{ color: C.textSec }}>Status</span><StatusBadge status={str(execGate, 'status', 'unknown')} /></div>
            <div className="flex justify-between"><span style={{ color: C.textSec }}>Total Executions</span><span style={{ color: C.text }}>{fmtNum(num(execGate, 'totalExecutions', 0))}</span></div>
            <div className="flex justify-between"><span style={{ color: C.textSec }}>Last Execution</span><span style={{ color: C.textSec }}>{fmtTime(str(execGate, 'lastExecution'))}</span></div>
          </div>
        </DashCard>

        <DashCard title="DA Storage">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span style={{ color: C.textSec }}>Status</span><StatusBadge status={str(daStorage, 'status', 'unknown')} /></div>
            <div className="flex justify-between"><span style={{ color: C.textSec }}>Total Commitments</span><span style={{ color: C.text }}>{fmtNum(num(daStorage, 'totalCommitments', 0))}</span></div>
            <div className="flex justify-between"><span style={{ color: C.textSec }}>Storage Used</span><span style={{ color: C.text }}>{str(daStorage, 'storageUsed', '-')}</span></div>
          </div>
        </DashCard>

        <DashCard title="FAISS Sync">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span style={{ color: C.textSec }}>Status</span><StatusBadge status={str(faissSync, 'status', 'unknown')} /></div>
            <div className="flex justify-between"><span style={{ color: C.textSec }}>Vectors Synced</span><span style={{ color: C.text }}>{fmtNum(num(faissSync, 'vectorsSynced', 0))}</span></div>
            <div className="flex justify-between"><span style={{ color: C.textSec }}>Index Size</span><span style={{ color: C.text }}>{str(faissSync, 'indexSize', '-')}</span></div>
          </div>
        </DashCard>

        <DashCard title="ZK Proof">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span style={{ color: C.textSec }}>Enabled</span><span style={{ color: C.green }}>{str(zkProof, 'enabled', '-')}</span></div>
            <div className="flex justify-between"><span style={{ color: C.textSec }}>Proofs Generated</span><span style={{ color: C.text }}>{fmtNum(num(zkProof, 'proofsGenerated', 0))}</span></div>
            <div className="flex justify-between"><span style={{ color: C.textSec }}>Avg Proof Time</span><span style={{ color: C.textSec }}>{str(zkProof, 'avgProofTime', '-')}</span></div>
          </div>
        </DashCard>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 20: GOVERNANCE
// ═══════════════════════════════════════════════════════════════════
function GovernancePage() {
  const { data: govData, loading: gL } = useGovernance();

  if (gL) return <PageSkeleton />;

  const proposals = arr<Record<string, unknown>>(govData, 'proposals');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Proposals" value={String(proposals.length)} color={C.text} />
        <StatCard label="Active" value={String(proposals.filter(p => str(p, 'status', '').toLowerCase() === 'active').length)} color={C.green} />
        <StatCard label="Passed" value={String(proposals.filter(p => str(p, 'status', '').toLowerCase() === 'passed').length)} color={C.blue} />
        <StatCard label="Discussion" value={String(proposals.filter(p => str(p, 'status', '').toLowerCase() === 'discussion').length)} color={C.amber} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {proposals.map((p, i) => {
          const status = str(p, 'status', 'unknown');
          const votesFor = num(p, 'votesFor', num(p, 'votes_for', 0));
          const votesAgainst = num(p, 'votesAgainst', num(p, 'votes_against', 0));
          const totalVotes = votesFor + votesAgainst;
          const quorum = num(p, 'quorum', 0);
          return (
            <DashCard key={i}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium" style={{ color: C.textSec }}>{str(p, 'id', '-')}</span>
                <StatusBadge status={status} />
              </div>
              <p className="text-sm font-medium mb-4" style={{ color: C.text }}>{str(p, 'title', '-')}</p>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span style={{ color: C.green }}>Votes For</span>
                  <span style={{ color: C.green }}>{fmtNum(votesFor)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: C.red }}>Votes Against</span>
                  <span style={{ color: C.red }}>{fmtNum(votesAgainst)}</span>
                </div>
                {totalVotes > 0 && (
                  <ProgressBar value={votesFor / totalVotes} color={C.green} />
                )}
                <div className="flex justify-between pt-1 border-t" style={{ borderColor: C.border }}>
                  <span style={{ color: C.textSec }}>Quorum</span>
                  <span style={{ color: C.text }}>{fmtPct(quorum)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: C.textSec }}>Deadline</span>
                  <span style={{ color: C.textSec }}>{str(p, 'deadline', '-')}</span>
                </div>
              </div>
            </DashCard>
          );
        })}
      </div>
      {proposals.length === 0 && <EmptyState message="No governance proposals" />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 21: SETTINGS
// ═══════════════════════════════════════════════════════════════════
function SettingsPage() {
  const { data: settingsData, loading: sL } = useSettings();

  if (sL) return <PageSkeleton />;

  const settings = settingsData || {};

  const sections: { key: string; title: string; icon: LucideIcon }[] = [
    { key: 'consensus', title: 'Consensus Parameters', icon: CheckCircle2 },
    { key: 'thresholds', title: 'Threshold Configuration', icon: Shield },
    { key: 'features', title: 'Feature Flags', icon: Zap },
    { key: 'network', title: 'Network Configuration', icon: Globe2 },
    { key: 'crates', title: 'Crate & Relayer Configuration', icon: Cpu },
    { key: 'security', title: 'Security Settings', icon: Lock },
    { key: 'anima', title: 'ANIMA Configuration', icon: Brain },
  ];

  const renderSectionData = (data: Record<string, unknown> | undefined) => {
    if (!data || Object.keys(data).length === 0) return <p className="text-xs" style={{ color: C.textSec }}>No data available</p>;
    return (
      <div className="space-y-1.5">
        {Object.entries(data).map(([k, v]) => (
          <div key={k} className="flex items-center justify-between py-1.5 px-2 rounded-lg text-xs" style={{ background: '#0a0b0f' }}>
            <span style={{ color: C.textSec }}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span className="font-medium" style={{ color: C.text }}>{typeof v === 'boolean' ? String(v) : typeof v === 'number' ? String(v) : String(v)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map(sec => {
          const secData = obj(settings, sec.key);
          const hasData = secData && Object.keys(secData).length > 0;
          return (
            <DashCard key={sec.key} title={sec.title}>
              {hasData ? renderSectionData(secData) : renderSectionData(
                Object.fromEntries(
                  Object.entries(settings).filter(([k]) => k.toLowerCase().startsWith(sec.key.slice(0, 4)))
                )
              )}
            </DashCard>
          );
        })}
      </div>

      <DashCard title="All Settings">
        <pre className="text-xs overflow-auto max-h-96 p-2 rounded-lg" style={{ background: '#0a0b0f', color: C.textSec }}>
          {JSON.stringify(settings, null, 2)}
        </pre>
      </DashCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function TrionDashboard() {
  const [activePage, setActivePage] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = useCallback((id: string) => {
    if (id.startsWith('section-')) return;
    setActivePage(id);
    setMobileOpen(false);
  }, []);

  const renderPage = useCallback(() => {
    switch (activePage) {
      case "overview": return <OverviewPage />;
      case "signals": return <LiveSignalsPage />;
      case "chains": return <ChainsPage />;
      case "beo-live": return <BeoLivePage />;
      case "bh-explorer": return <BhExplorerPage />;
      case "akashic": return <AkashicIndexPage />;
      case "anima": return <AnimaIntelligencePage />;
      case "living-security": return <LivingSecurityPage />;
      case "ai-agents": return <AiAgentsPage />;
      case "validators": return <ValidatorsPage />;
      case "annotators": return <AnnotatorsPage />;
      case "evolutionary": return <EvolutionaryFitnessPage />;
      case "continuum": return <ContinuumDexPage />;
      case "marketplace": return <MarketplacePage />;
      case "sba": return <SbaPage />;
      case "bibl": return <BiblPage />;
      case "timescale": return <TimescaleDbPage />;
      case "trading": return <TradingPage />;
      case "0g": return <ZeroGNetworkPage />;
      case "governance": return <GovernancePage />;
      case "settings": return <SettingsPage />;
      default: return <OverviewPage />;
    }
  }, [activePage]);

  const activeNav = NAV_ITEMS.find(n => n.id === activePage);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: C.bg }}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ─── Sidebar ─── */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 0 }}
        className={`fixed lg:relative z-50 h-full flex flex-col overflow-hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          background: C.sidebarBg,
          borderRight: `1px solid ${C.sidebarBorder}`,
        }}
      >
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <div className="mb-6">
            <TrionLogo />
          </div>

          <nav className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              if (item.section) {
                return (
                  <div key={item.id} className="pt-5 pb-2 px-3">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: C.textSec + '80' }}>
                      {item.section}
                    </span>
                  </div>
                );
              }

              const isActive = activePage === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-200 group relative"
                  style={{ backgroundColor: isActive ? C.green + '0D' : 'transparent' }}
                  whileHover={{ backgroundColor: isActive ? C.green + '0D' : 'rgba(255,255,255,0.03)' }}
                  initial={false}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                      style={{ backgroundColor: C.green }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}

                  <item.icon className="flex-shrink-0" style={{ width: 16, height: 16, color: isActive ? C.green : C.textSec + '80' }} />
                  <span className="text-xs font-medium flex-1 truncate" style={{ color: isActive ? C.text : C.textSec }}>
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div style={{ borderTop: `1px solid ${C.sidebarBorder}` }} className="p-3">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #00d4aa, #8b5cf6)' }}>
              T
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: C.text }}>TRION Protocol</p>
              <p className="text-[10px] truncate" style={{ color: C.textSec }}>v1.0.0</p>
            </div>
            <PulsingDot color={C.green} size={5} />
          </div>
        </div>
      </motion.aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 px-4 lg:px-6 py-3"
          style={{ background: 'rgba(10,11,15,0.8)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <Menu className="w-5 h-5" style={{ color: C.textSec }} />
              </button>
              <button onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                {sidebarOpen ? <X className="w-4 h-4" style={{ color: C.textSec }} /> : <Menu className="w-4 h-4" style={{ color: C.textSec }} />}
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold capitalize" style={{ color: C.text }}>
                    {activeNav?.label || "Overview"}
                  </h1>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <PulsingDot color={C.green} size={4} />
                  <span className="text-[10px] font-medium" style={{ color: C.green }}>Live</span>
                  <span className="text-[10px]" style={{ color: C.textSec + '60' }}>Behavioral Truth Oracle</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Bell className="w-4 h-4" style={{ color: C.textSec }} />
              </button>
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                style={{ backgroundColor: C.green + '0D', border: `1px solid ${C.green}30` }}>
                <PulsingDot color={C.green} size={4} />
                <span className="text-[10px] font-semibold" style={{ color: C.green }}>LIVE DATA</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-[1800px] mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex-shrink-0 px-4 lg:px-6 py-2 flex items-center justify-between text-[10px]"
          style={{ background: 'rgba(10,11,15,0.9)', borderTop: `1px solid ${C.border}`, color: C.textSec + '60' }}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <PulsingDot color={C.green} size={4} />
              <span>Core Engine</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PulsingDot color={C.green} size={4} />
              <span>FAISS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PulsingDot color={C.green} size={4} />
              <span>Relayers</span>
            </div>
          </div>
          <span>TRION Protocol - Behavioral Truth Oracle</span>
        </footer>
      </main>
    </div>
  );
}
