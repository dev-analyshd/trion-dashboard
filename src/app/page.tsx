"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Shield, Database, Brain, Eye, Lock, Cpu, Radio,
  Globe2, ChevronRight, Bell, Search, RefreshCw, Zap, TrendingUp,
  TrendingDown, AlertTriangle, CheckCircle2, XCircle, ArrowRight,
  Layers, Fingerprint, Sword, Heart, BookOpen, Settings, Key,
  BarChart3, Users, GitBranch, FileCode, Target, Bot, Hexagon,
  Wifi, WifiOff, Clock, Hash, Thermometer, ShieldCheck,
  Landmark, Scale, CircleDot, Webhook, Binary, CircuitBoard,
  type LucideIcon, Menu, X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
// Tabs available if needed
import {
  CHAINS, VM_FAMILIES, LIVE_SIGNALS, PLANE_STATUSES,
  GOVERNANCE_ITEMS, FALSIFIABILITY, CRISPR_SIGNATURES,
  ARCHETYPES, DEPLOYMENTS, RELAYER_STATUS,
  type SignalEntry, type ChainInfo,
} from "@/lib/trion-data";

// ─── Icons ──────────────────────────────────────────────────────
const TrionLogo = () => (
  <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
      <Hexagon className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
    </div>
    <div className="flex flex-col">
      <span className="text-[15px] font-bold tracking-tight text-gray-900 leading-none">TRION</span>
      <span className="text-[9px] font-medium tracking-[0.15em] text-blue-600 uppercase leading-none mt-0.5">Protocol</span>
    </div>
  </div>
);

const PulsingDot = ({ color = "bg-emerald-500" }: { color?: string }) => (
  <span className="relative flex h-2 w-2">
    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
    <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
  </span>
);

const StatusDot = ({ status }: { status: string }) => {
  const color = status === "online" ? "bg-emerald-500" : status === "indexing" ? "bg-blue-500" : status === "degraded" ? "bg-amber-500" : "bg-red-500";
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${color}`} />;
};

// ─── Sparkline ───────────────────────────────────────────────────
function Sparkline({ data, color = "#10B981", width = 80, height = 28 }: { data: number[]; color?: string; width?: number; height?: number }) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M0,${height} L${pts} L${width},${height} Z`} fill={`url(#grad-${color.replace("#","")})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Navigation ─────────────────────────────────────────────────
interface NavItem { id: string; label: string; icon: LucideIcon; badge?: string; badgeColor?: string; section?: string; }
const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "signals", label: "Signals", icon: Radio, badge: "LIVE", badgeColor: "emerald" },
  { id: "chains", label: "Chains", icon: Globe2 },
  { id: "akashic", label: "Akashic Index", icon: Database },
  { id: "planes", label: "Five Planes", icon: Layers },
  { id: "protocol", label: "Protocol Health", icon: Heart },
  { id: "anima", label: "ANIMA Intelligence", icon: Brain },
  { id: "security", label: "Security", icon: Shield },
  { id: "relayers", label: "Relayers", icon: Wifi },
  { id: "governance", label: "Governance", icon: Scale },
  { id: "trading", label: "Trading", icon: TrendingUp },
  { id: "auditor", label: "Contract Audit", icon: FileCode },
  { id: "beo", label: "BEO Entities", icon: Users },
  { id: "sep-1", label: "ACCOUNT", icon: Settings, section: "ACCOUNT" },
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "deployments", label: "Deployments", icon: GitBranch },
  { id: "settings", label: "Settings", icon: Settings },
];

// ─── KPI Card ────────────────────────────────────────────────────
function KpiCard({ label, value, change, changeType, subtitle, accentColor, sparkData }: {
  label: string; value: string; change: string; changeType: string;
  subtitle: string; accentColor: string; sparkData: number[];
}) {
  const changeColor = changeType === "up" ? "text-emerald-600" : changeType === "down" ? "text-red-500" : changeType === "amber" ? "text-amber-600" : changeType === "purple" ? "text-purple-600" : "text-gray-500";
  const sparkColor = changeType === "purple" ? "#8B5CF6" : changeType === "amber" ? "#F59E0B" : "#10B981";
  return (
    <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow duration-200">
      <CardContent className="p-4 pb-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
          <Sparkline data={sparkData} color={sparkColor} />
        </div>
        <p className="text-[26px] font-bold tracking-tight leading-none" style={{ color: accentColor }}>{value}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          {changeType === "up" && <TrendingUp className="w-3 h-3 text-emerald-500" />}
          {changeType === "down" && <TrendingDown className="w-3 h-3 text-red-500" />}
          <span className={`text-[11px] font-medium ${changeColor}`}>{change}</span>
        </div>
        {subtitle && <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Five-Plane Pipeline ────────────────────────────────────────
function CoherencePipeline({ planes, coherence, threshold }: {
  planes: typeof PLANE_STATUSES; coherence: number; threshold: number;
}) {
  const passing = coherence >= threshold;
  return (
    <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-gray-900">Five-Plane Coherence Pipeline</span>
              <Badge variant="outline" className="text-[10px] font-medium px-1.5 py-0">5-plane C(t)</Badge>
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">Master Equation: C(t) = α·Φ + β·M + γ·Σ + δ·K + ε·A → compared against Θ(t)</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5">
              <PulsingDot color={passing ? "bg-emerald-500" : "bg-red-500"} />
              <span className={`text-[11px] font-semibold ${passing ? "text-emerald-600" : "text-red-600"}`}>
                {passing ? "COHERENT" : "SILENCE"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {planes.map((plane, i) => (
            <React.Fragment key={plane.symbol}>
              <div className={`flex-1 rounded-lg p-2.5 border transition-all duration-300 ${
                plane.status === "active" ? "border-emerald-200 bg-emerald-50/50" : "border-gray-200 bg-gray-50/50"
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400">α/β/γ/δ/ε</span>
                    <span className="text-[10px] text-gray-300">=</span>
                    <span className="text-[10px] font-bold" style={{ color: plane.color }}>{plane.weight.toFixed(2)}</span>
                  </div>
                  {plane.status === "bootstrap" && (
                    <Badge className="text-[8px] px-1 py-0 bg-amber-100 text-amber-700 border-0 font-medium">BOOTSTRAP</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[11px] font-bold" style={{ backgroundColor: plane.color }}>
                    {plane.symbol}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-gray-800 truncate">{plane.name}</p>
                    <p className="text-[9px] text-gray-400 truncate">{plane.description}</p>
                  </div>
                  <span className="text-[14px] font-bold tabular-nums" style={{ color: plane.color }}>
                    {plane.score.toFixed(3)}
                  </span>
                </div>
                <Progress value={plane.score * 100} className="h-1 mt-1.5" style={{ ["--progress-color" as string]: plane.color }} />
              </div>
              {i < planes.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />}
            </React.Fragment>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100">
          <div className="flex items-center gap-4 text-[10px] text-gray-400">
            <span>C(t) = <span className="font-bold text-gray-700">{coherence.toFixed(3)}</span></span>
            <span>Θ(t) = <span className="font-bold text-gray-700">{threshold.toFixed(3)}</span></span>
            <span>Margin = <span className={`font-bold ${passing ? "text-emerald-600" : "text-red-600"}`}>{(coherence - threshold).toFixed(3)}</span></span>
          </div>
          <span className="text-[10px] text-gray-400">Dynamic threshold · 84 whitepaper formulas</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Signal Row ──────────────────────────────────────────────────
function SignalRow({ signal, index }: { signal: SignalEntry; index: number }) {
  const statusStyles: Record<string, string> = {
    COHERENT: "bg-emerald-50 text-emerald-700 border-emerald-200",
    SILENCE: "bg-red-50 text-red-700 border-red-200",
    MANIPULATION_ALERT: "bg-amber-50 text-amber-700 border-amber-200",
    GENESIS: "bg-blue-50 text-blue-700 border-blue-200",
    TRAJECTORY_ANOMALY: "bg-purple-50 text-purple-700 border-purple-200",
    RESURRECTION: "bg-cyan-50 text-cyan-700 border-cyan-200",
    FORK_DIVERGENCE: "bg-orange-50 text-orange-700 border-orange-200",
    LIQUIDITY_HEALTH: "bg-teal-50 text-teal-700 border-teal-200",
    CROSS_CHAIN_COHERENCE: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
    >
      <td className="py-2 px-3 text-[11px] font-mono text-gray-400 tabular-nums">{signal.time}</td>
      <td className="py-2 px-3">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: signal.chainColor }}>
            {signal.entityShort.slice(2, 4).toUpperCase()}
          </div>
          <span className="text-[11px] font-mono text-gray-700">{signal.entityShort}</span>
        </div>
      </td>
      <td className="py-2 px-3">
        <div className="flex items-center gap-1.5">
          <StatusDot status="online" />
          <span className="text-[11px] text-gray-600">{signal.chain}</span>
        </div>
      </td>
      <td className="py-2 px-3 text-[11px] text-gray-600">{signal.signalType.replace(/_/g, " ")}</td>
      <td className="py-2 px-3">
        <span className={`text-[12px] font-bold tabular-nums ${signal.coherence >= signal.threshold ? "text-emerald-600" : "text-red-600"}`}>
          {signal.coherence.toFixed(3)}
        </span>
      </td>
      <td className="py-2 px-3 text-[11px] text-gray-400 tabular-nums">{signal.threshold.toFixed(3)}</td>
      <td className="py-2 px-3">
        <Badge className={`text-[9px] px-1.5 py-0 border font-medium ${statusStyles[signal.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
          {signal.status === "COHERENT" ? "200 OK" : signal.status}
        </Badge>
      </td>
    </motion.tr>
  );
}

// ─── Chain Row ──────────────────────────────────────────────────
function ChainRow({ chain }: { chain: ChainInfo }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50/50 rounded-lg transition-colors">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px]" style={{ backgroundColor: chain.color + "15", color: chain.color }}>
        {chain.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-semibold text-gray-800 truncate">{chain.name}</span>
          <Badge className="text-[8px] px-1 py-0 bg-gray-100 text-gray-500 border-0 font-mono">{chain.vm}</Badge>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <StatusDot status={chain.status} />
          <span className="text-[10px] text-gray-400">{chain.latency}</span>
          <span className="text-[10px] text-gray-300">·</span>
          <span className="text-[10px] text-gray-400">#{(chain.blockHeight / 1000000).toFixed(1)}M</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[11px] font-semibold text-gray-700 tabular-nums">{(chain.bhCount / 1000).toFixed(0)}K</p>
        <p className="text-[9px] text-gray-400">BH records</p>
      </div>
    </div>
  );
}

// ─── Pages ───────────────────────────────────────────────────────

function OverviewPage() {
  const [signals, setSignals] = useState(LIVE_SIGNALS);
  const [coherence, setCoherence] = useState(0.847);
  const [threshold, setThreshold] = useState(0.673);

  useEffect(() => {
    const interval = setInterval(() => {
      setSignals(prev => {
        const newSig = { ...prev[0], id: `SIG-${Date.now().toString().slice(-6)}`, time: new Date().toTimeString().split(" ")[0], coherence: 0.6 + Math.random() * 0.35, chain: CHAINS[Math.floor(Math.random() * 10)].name, chainColor: CHAINS[Math.floor(Math.random() * 10)].color };
        return [newSig, ...prev.slice(0, 49)];
      });
      setCoherence(0.80 + Math.random() * 0.12);
      setThreshold(0.55 + Math.random() * 0.15);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard label="Signals Published" value="51,904" change="13.6% vs yesterday" changeType="up" subtitle="across 87 chains" accentColor="#111827" sparkData={[30, 35, 28, 42, 38, 45, 50, 48, 55, 51, 58, 62]} />
        <KpiCard label="Vectors Indexed" value="2.4M" change="128-dim FAISS · 64 archetypes" changeType="purple" subtitle="Akashic Index depth" accentColor="#7C3AED" sparkData={[1.8, 1.9, 2.0, 2.1, 2.0, 2.2, 2.3, 2.4, 2.3, 2.5, 2.4, 2.6]} />
        <KpiCard label="Chains Active" value="87 / 100" change="all online, 13 bootstrapping" changeType="up" subtitle="15 VM families indexed" accentColor="#111827" sparkData={[70, 72, 75, 78, 80, 82, 84, 85, 86, 87, 87, 87]} />
        <KpiCard label="Attacks Intercepted" value="1,381" change="0 dropped, avg 0ms switch" changeType="amber" subtitle="CRISPR · 7 signature patterns" accentColor="#D97706" sparkData={[20, 25, 22, 30, 28, 35, 40, 38, 42, 45, 43, 48]} />
        <KpiCard label="System Coherence" value={coherence.toFixed(3)} change={`Θ = ${threshold.toFixed(3)} · margin ${(coherence - threshold).toFixed(3)}`} changeType="up" subtitle="C(t) ≥ Θ(t) → emitting" accentColor="#059669" sparkData={[0.78, 0.82, 0.80, 0.85, 0.83, 0.87, 0.84, 0.86, 0.89, 0.85, 0.87, 0.91]} />
      </div>

      {/* Five-Plane Pipeline */}
      <CoherencePipeline planes={PLANE_STATUSES} coherence={coherence} threshold={threshold} />

      {/* Live Signals Table + Chains Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Live Signals */}
        <Card className="xl:col-span-3 border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <CardHeader className="pb-2 px-4 pt-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-[14px] font-bold">Live Signals</CardTitle>
                  <span className="text-[10px] text-gray-400 italic">streaming from 87 chains</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PulsingDot />
                <span className="text-[10px] font-semibold text-emerald-600">real-time</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["TIME", "ENTITY", "CHAIN", "SIGNAL", "C(t)", "Θ(t)", "STATUS"].map(h => (
                      <th key={h} className="py-1.5 px-3 text-left text-[9px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {signals.slice(0, 12).map((sig, i) => <SignalRow key={sig.id + i} signal={sig} index={i} />)}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Chains Panel */}
        <Card className="xl:col-span-2 border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <CardHeader className="pb-2 px-4 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[14px] font-bold">Chains</CardTitle>
              <Badge className="text-[9px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">87 ACTIVE</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <ScrollArea className="h-[420px]">
              <div className="space-y-0.5">
                {CHAINS.map(chain => <ChainRow key={chain.id} chain={chain} />)}
              </div>
            </ScrollArea>
            <div className="mt-2 pt-2 border-t border-gray-100 text-center">
              <button className="text-[11px] font-medium text-blue-600 hover:text-blue-700">+ 77 more chains</button>
              <span className="text-[10px] text-gray-400 ml-1">100 total connected</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SignalsPage() {
  const [signals] = useState(LIVE_SIGNALS);
  const [filter, setFilter] = useState("ALL");
  const filtered = filter === "ALL" ? signals : signals.filter(s => s.status === filter);
  const types = ["ALL", "COHERENT", "SILENCE", "MANIPULATION_ALERT", "GENESIS"];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all ${filter === t ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
            {t.replace(/_/g, " ")} {t !== "ALL" && <span className="ml-1 text-gray-400">({signals.filter(s => s.status === t).length})</span>}
          </button>
        ))}
      </div>
      <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["TIME", "ENTITY", "CHAIN", "SIGNAL TYPE", "C(t)", "Θ(t)", "Φ", "M", "Σ", "K", "A", "MF", "LIMITING", "STATUS"].map(h => (
                  <th key={h} className="py-2 px-3 text-left text-[9px] font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 25).map((sig, i) => (
                <tr key={sig.id + i} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-2 px-3 text-[11px] font-mono text-gray-400 tabular-nums">{sig.time}</td>
                  <td className="py-2 px-3 text-[11px] font-mono text-gray-700">{sig.entity}</td>
                  <td className="py-2 px-3"><div className="flex items-center gap-1.5"><StatusDot status="online" /><span className="text-[11px] text-gray-600">{sig.chain}</span></div></td>
                  <td className="py-2 px-3 text-[11px] text-gray-600">{sig.signalType}</td>
                  <td className={`py-2 px-3 text-[11px] font-bold tabular-nums ${sig.coherence >= sig.threshold ? "text-emerald-600" : "text-red-600"}`}>{sig.coherence.toFixed(3)}</td>
                  <td className="py-2 px-3 text-[11px] text-gray-400 tabular-nums">{sig.threshold.toFixed(3)}</td>
                  <td className="py-2 px-3 text-[11px] tabular-nums text-blue-600">{sig.phi.toFixed(3)}</td>
                  <td className="py-2 px-3 text-[11px] tabular-nums text-purple-600">{sig.mental.toFixed(3)}</td>
                  <td className="py-2 px-3 text-[11px] tabular-nums text-emerald-600">{sig.sigma.toFixed(3)}</td>
                  <td className="py-2 px-3 text-[11px] tabular-nums text-amber-600">{sig.anima.toFixed(3)}</td>
                  <td className="py-2 px-3 text-[11px] tabular-nums text-pink-600">{sig.anima.toFixed(3)}</td>
                  <td className="py-2 px-3 text-[11px] tabular-nums">{sig.mfScore.toFixed(2)}</td>
                  <td className="py-2 px-3 text-[10px] text-gray-500">{sig.limitingPlane}</td>
                  <td className="py-2 px-3"><Badge className={`text-[9px] px-1.5 py-0 border font-medium ${sig.status === "COHERENT" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>{sig.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function ChainsPage() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {VM_FAMILIES.map(vm => (
          <Card key={vm.name} className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: vm.color + "20" }} />
                <span className="text-[11px] font-bold text-gray-800">{vm.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[20px] font-bold text-gray-900">{vm.chains}</span>
                <StatusDot status="online" />
              </div>
              <p className="text-[9px] text-gray-400 mt-1">chains indexed</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <CardHeader className="pb-2 px-4 pt-3"><CardTitle className="text-[14px] font-bold">All Chains</CardTitle></CardHeader>
        <CardContent className="px-2 pb-3">
          <ScrollArea className="h-[500px]">
            <div className="space-y-0.5">
              {CHAINS.map(chain => <ChainRow key={chain.id} chain={chain} />)}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function AkashicPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {[
        { label: "Total Vectors", value: "2,418,923", sub: "128-dim FAISS IndexFlatL2", icon: Database, color: "#3B82F6" },
        { label: "Entity Records", value: "142,307", sub: "BEO clusters · 75% confidence", icon: Users, color: "#8B5CF6" },
        { label: "Archetypes", value: "64", sub: "K-means centroids · cosine", icon: Layers, color: "#10B981" },
        { label: "Akashic Depth", value: "D ≥ 10K", sub: "exponential recency weighting", icon: Hash, color: "#F59E0B" },
        { label: "BH Ledger", value: "4.8M", sub: "93-byte canonical dual-strand", icon: Fingerprint, color: "#EC4899" },
        { label: "0G Storage", value: "892 syncs", sub: "Merkle-256 provenance", icon: Globe2, color: "#06B6D4" },
        { label: "DA Blobs", value: "12,847", sub: "Reed-Solomon 2x erasure coding", icon: Binary, color: "#7C3AED" },
        { label: "KV Streams", value: "4 active", sub: "sub-10ms hot cache", icon: CircuitBoard, color: "#059669" },
      ].map(item => (
        <Card key={item.label} className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: item.color + "12" }}>
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{item.label}</span>
            </div>
            <p className="text-[22px] font-bold text-gray-900">{item.value}</p>
            <p className="text-[10px] text-gray-400 mt-1">{item.sub}</p>
          </CardContent>
        </Card>
      ))}
      <Card className="md:col-span-2 xl:col-span-4 border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <CardHeader className="pb-2 px-4 pt-3"><CardTitle className="text-[14px] font-bold">64 Behavioral Archetypes</CardTitle></CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ARCHETYPES.map(a => (
              <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                <div className="w-2 h-8 rounded-full" style={{ backgroundColor: a.color }} />
                <div>
                  <p className="text-[11px] font-semibold text-gray-800">{a.name}</p>
                  <div className="flex items-center gap-1.5">
                    <Badge className={`text-[8px] px-1 py-0 border-0 font-medium ${a.risk === "SAFE" ? "bg-emerald-100 text-emerald-700" : a.risk === "CRITICAL" ? "bg-red-100 text-red-700" : a.risk === "DANGER" ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700"}`}>{a.risk}</Badge>
                    <span className="text-[9px] text-gray-400">{a.count.toLocaleString()} entities</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PlanesPage() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {PLANE_STATUSES.map(p => (
          <Card key={p.symbol} className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CardContent className="p-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[16px] font-bold mb-3" style={{ backgroundColor: p.color }}>{p.symbol}</div>
              <p className="text-[13px] font-bold text-gray-900">{p.name} Plane</p>
              <p className="text-[10px] text-gray-400 mt-0.5 mb-3">{p.description}</p>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[24px] font-bold" style={{ color: p.color }}>{p.score.toFixed(3)}</span>
                <Badge className={`text-[8px] px-1.5 py-0 border-0 font-medium ${p.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{p.status === "active" ? "ACTIVE" : "BOOTSTRAP"}</Badge>
              </div>
              <p className="text-[10px] text-gray-400">Weight: α/β/γ/δ/ε = {p.weight.toFixed(2)}</p>
              <Progress value={p.score * 100} className="h-1.5 mt-2" style={{ ["--progress-color" as string]: p.color }} />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <CardContent className="p-4">
          <h3 className="text-[13px] font-bold text-gray-900 mb-3">Master Equation Breakdown</h3>
          <div className="font-mono text-[11px] bg-gray-900 text-emerald-400 rounded-lg p-4 leading-relaxed">
            <p><span className="text-gray-500">// TRION Master Equation — Whitepaper §11</span></p>
            <p>C(t) = <span className="text-blue-400">α·Φ_adj(0.842)</span> + <span className="text-purple-400">β·M_adj(0.791)</span> + <span className="text-emerald-400">γ·Σ(0.724)</span> + <span className="text-amber-400">δ·K(0.100)</span> + <span className="text-pink-400">ε·A(0.100)</span></p>
            <p>C(t) = <span className="text-white">0.25×0.842 + 0.30×0.791 + 0.25×0.724 + 0.10×0.100 + 0.10×0.100</span></p>
            <p>C(t) = <span className="text-white font-bold">0.2105 + 0.2373 + 0.1810 + 0.0100 + 0.0100 = 0.6488</span></p>
            <p className="mt-1"><span className="text-gray-500">// Economic Moat (6-factor multiplicative)</span></p>
            <p>M_moat = D(t)×Q(t)×R(t)×X(t)×F(t)×N(t) = <span className="text-cyan-400">0.847</span></p>
            <p className="mt-1"><span className="text-gray-500">// Final Output</span></p>
            <p>T(t) = [C(t) ≥ Θ(t)] · C(t) · e^M_moat = <span className="text-emerald-400 font-bold">COHERENT · 0.649 · 1.847</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SecurityPage() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Living Security Score", value: "SEC(t) = 0.94", sub: "LSS × PQC × CC", color: "#059669" },
          { label: "Genomic Key Evolution", value: "GK #482,191", sub: "SHA3-256 hash chain", color: "#3B82F6" },
          { label: "CRISPR Intercepts", value: "1,381 total", sub: "7 attack signatures active", color: "#DC2626" },
          { label: "PQC Layer", value: "ML-DSA-87", sub: "CRYSTALS-Dilithium active", color: "#7C3AED" },
        ].map(item => (
          <Card key={item.label} className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CardContent className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{item.label}</p>
              <p className="text-[18px] font-bold mt-1" style={{ color: item.color }}>{item.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <CardHeader className="pb-2 px-4 pt-3"><CardTitle className="text-[14px] font-bold">CRISPR Attack Signatures</CardTitle></CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="space-y-2">
            {CRISPR_SIGNATURES.map(sig => (
              <div key={sig.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50">
                <div className={`w-2 h-8 rounded-full ${sig.severity === "critical" ? "bg-red-500" : "bg-amber-500"}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-gray-800 font-mono">{sig.name}</span>
                    <Badge className={`text-[8px] px-1.5 py-0 border-0 font-medium uppercase ${sig.severity === "critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{sig.severity}</Badge>
                  </div>
                  <p className="text-[10px] text-gray-400">{sig.description}</p>
                </div>
                <span className="text-[12px] font-bold tabular-nums text-gray-700">{sig.matches}</span>
                <span className="text-[9px] text-gray-400">matches</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RelayersPage() {
  return (
    <div className="space-y-4">
      {RELAYER_STATUS.map(r => (
        <Card key={r.name} className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-gray-900">{r.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-gray-400">{r.chains} chains</span>
                    <PulsingDot />
                    <span className="text-[10px] font-semibold text-emerald-600">{r.status}</span>
                    <span className="text-[10px] text-gray-400">Last: {r.lastTx}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[18px] font-bold text-gray-900">{typeof r.signalsPublished !== "undefined" ? r.signalsPublished.toLocaleString() : r.blobs?.toLocaleString() || r.syncs?.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400">{typeof r.signalsPublished !== "undefined" ? "signals published" : r.daSize || "syncs completed"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function GovernancePage() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Proposals", value: "3", sub: "2 voting · 1 queued" },
          { label: "AWA Status", value: "3/4 MET", sub: "validators, diversity, audit" },
          { label: "Validator HHI", value: "1,247", sub: "HEALTHY · 4 continents" },
          { label: "Total Staked", value: "847K TRION", sub: "23 active validators" },
        ].map(item => (
          <Card key={item.label} className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CardContent className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{item.label}</p>
              <p className="text-[20px] font-bold text-gray-900 mt-1">{item.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <CardHeader className="pb-2 px-4 pt-3"><CardTitle className="text-[14px] font-bold">Governance Proposals</CardTitle></CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="space-y-2">
            {GOVERNANCE_ITEMS.map(g => (
              <div key={g.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-400">{g.id}</span>
                    <Badge className={`text-[8px] px-1.5 py-0 border font-medium ${g.status === "active" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>{g.status}</Badge>
                    <Badge className="text-[8px] px-1.5 py-0 bg-gray-100 text-gray-600 border-gray-200 font-mono">{g.type}</Badge>
                  </div>
                  <p className="text-[12px] font-semibold text-gray-800 mt-1">{g.title}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[12px] font-bold tabular-nums text-gray-700">{(g.votes / 1000).toFixed(1)}K</p>
                  <p className="text-[9px] text-gray-400">{g.timeLeft}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <CardHeader className="pb-2 px-4 pt-3"><CardTitle className="text-[14px] font-bold">Falsifiability Registry (F1–F15)</CardTitle></CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="space-y-1.5">
            {FALSIFIABILITY.map(f => (
              <div key={f.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <span className="text-[10px] font-bold font-mono text-gray-500 w-6">{f.id}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-700 truncate">{f.description}</p>
                </div>
                <span className="text-[11px] font-mono font-bold tabular-nums">{f.metric}</span>
                <Badge className={`text-[8px] px-1.5 py-0 border font-medium ${f.status === "PASSING" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : f.status === "MONITORING" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>{f.status}</Badge>
                <span className="text-[9px] text-gray-400 tabular-nums">{f.threshold}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DefaultPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
        <Activity className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-[14px] font-bold text-gray-900">{title}</h3>
      <p className="text-[12px] text-gray-400 mt-1">Connected to TRION Oracle API · FAISS · 0G Storage</p>
      <div className="flex items-center gap-2 mt-3">
        <PulsingDot />
        <span className="text-[11px] font-medium text-emerald-600">Live data streaming</span>
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────
export default function TrionDashboard() {
  const [activePage, setActivePage] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderPage = useCallback(() => {
    switch (activePage) {
      case "overview": return <OverviewPage />;
      case "signals": return <SignalsPage />;
      case "chains": return <ChainsPage />;
      case "akashic": return <AkashicPage />;
      case "planes": return <PlanesPage />;
      case "security": return <SecurityPage />;
      case "relayers": return <RelayersPage />;
      case "governance": return <GovernancePage />;
      default: return <DefaultPage title={NAV_ITEMS.find(n => n.id === activePage)?.label || activePage} />;
    }
  }, [activePage]);

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 0 }}
        className={`fixed lg:relative z-50 h-full bg-white border-r border-gray-100 flex flex-col overflow-hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ width: undefined }}
      >
        <div className="flex-1 overflow-y-auto py-4 px-3">
          {/* Logo */}
          <div className="px-2 mb-5">
            <TrionLogo />
          </div>

          {/* Nav Items */}
          <nav className="space-y-0.5">
            {NAV_ITEMS.map(item => {
              if (item.section) {
                return <div key={item.id} className="pt-4 pb-1.5 px-3"><span className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400">{item.section}</span></div>;
              }
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActivePage(item.id); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-150 group ${
                    isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                  <span className="text-[12.5px] font-medium flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor === "emerald" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile */}
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">T</div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-gray-900 truncate">TRION Protocol</p>
              <p className="text-[10px] text-gray-400 truncate">CC0 · v1.0.0 · Mainnet</p>
            </div>
            <Badge className="text-[8px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200 font-medium flex-shrink-0">LIVE</Badge>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 bg-white border-b border-gray-100 px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100">
                <Menu className="w-4.5 h-4.5 text-gray-600" />
              </button>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100">
                {sidebarOpen ? <X className="w-4 h-4 text-gray-400" /> : <Menu className="w-4 h-4 text-gray-400" />}
              </button>
              <div>
                <h1 className="text-[18px] font-bold text-gray-900 capitalize leading-none">
                  {NAV_ITEMS.find(n => n.id === activePage)?.label || "Overview"}
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <PulsingDot />
                  <span className="text-[10px] font-medium text-emerald-600">Production</span>
                  <span className="text-[10px] text-gray-300 mx-0.5">·</span>
                  <span className="text-[10px] text-gray-400">Behavioral Truth Oracle</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-gray-400 hidden sm:inline">87 chains indexed</span>
              <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 hidden sm:flex">Last 24 hours</Badge>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 relative">
                <Bell className="w-4 h-4 text-gray-500" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-[1600px] mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}