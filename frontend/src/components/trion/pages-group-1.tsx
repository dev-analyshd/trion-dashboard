"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  type SignalEntry,
  type ChainInfo,
  type PlaneStatus,
  type TradingPair,
  CHAINS as FALLBACK_CHAINS,
  VM_FAMILIES as FALLBACK_VMS,
  LIVE_SIGNALS as FALLBACK_SIGNALS,
  PLANE_STATUSES,
  TRADING_PAIRS as FALLBACK_TRADING,
  generateNewSignal,
} from "@/lib/trion-data";
import { useOverview, useSignals, useChains, useVmFamilies, useTradingPairs } from "@/lib/useTrionApi";

// ─── Shared Animation Variants ──────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};
const fastItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

// ─── Helpers ────────────────────────────────────────────────────
const PLANE_COLORS: Record<string, string> = {
  Physical: "#00D4AA",
  Mental: "#7B61FF",
  Spiritual: "#FF6B6B",
  Conscious: "#FFD93D",
  ANIMA: "#FF8C42",
};
const WEIGHT_LABELS = ["α", "β", "γ", "δ", "ε"];
const STATUS_COLORS: Record<string, string> = {
  COHERENT: "#00D4AA",
  SILENCE: "#FF5252",
  MANIPULATION_ALERT: "#FF6B6B",
  GENESIS: "#7B61FF",
  TRAJECTORY_ANOMALY: "#FFD93D",
  RESURRECTION: "#6FBCF0",
  FORK_DIVERGENCE: "#FF8C42",
  LIQUIDITY_HEALTH: "#4DDFBA",
  CROSS_CHAIN_COHERENCE: "#00C1DE",
};
const CHAIN_STATUS_DOT: Record<string, string> = {
  online: "#00D4AA",
  indexing: "#FFD93D",
  degraded: "#FF8C42",
  offline: "#FF5252",
};

function MiniSparkline({ data, color, width = 64, height = 24 }: { data: number[]; color: string; width?: number; height?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} className="shrink-0">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Generate 24h network activity data
function generateNetworkActivity() {
  const hours = Array.from({ length: 24 }, (_, i) => {
    const h = (new Date().getHours() - 23 + i + 24) % 24;
    return `${h.toString().padStart(2, "0")}:00`;
  });
  return hours.map((hour) => ({
    time: hour,
    throughput: 280 + Math.floor(Math.random() * 180 + Math.sin(parseInt(hour) / 3) * 60),
    signals: 200 + Math.floor(Math.random() * 120),
  }));
}

// Firewall events
const FIREWALL_EVENTS = [
  { time: "14:23:41", type: "MEV_SANDWICH", chain: "Ethereum", pair: "ETH/USDC", action: "Blocked" },
  { time: "14:21:17", type: "FRONT_RUN", chain: "Arbitrum", pair: "ARB/USDC", action: "Blocked" },
  { time: "14:19:05", type: "HONEYPOT", chain: "BNB Chain", pair: "TOKEN/USDT", action: "Blocked" },
  { time: "14:15:33", type: "RECURSIVE_BORROW", chain: "Ethereum", pair: "USDC/USDT", action: "Monitored" },
  { time: "14:12:08", type: "ORACLE_PUSH", chain: "Polygon", pair: "MATIC/USDC", action: "Blocked" },
];

// ═══════════════════════════════════════════════════════════════
// 1. OVERVIEW PAGE
// ═══════════════════════════════════════════════════════════════
export function OverviewPage() {
  const { data: overview, dataSource } = useOverview();
  const isLive = dataSource === 'LIVE';
  const ov = isLive && overview ? overview : {
    signalStats: { total: 51904, coherent: 48120, warnings: 2100, intercepts: 1684, avgCoherence: 0.847 },
    chains: { active: 18, total: 20, indexing: 2 },
    coherence: { overall: 0.847, physical: 0.912, mental: 0.856, spiritual: 0.734, conscious: 0.801, anima: 0.823 },
    security: { livingScore: 96.8, attacksIntercepted: 1381 },
    latestSignals: FALLBACK_SIGNALS.slice(0, 5),
  };

  const signals = ov.latestSignals || [];
  const st = ov.signalStats || { total: 0, coherent: 0, warnings: 0, intercepts: 0, avgCoherence: 0 };
  const ch = ov.chains || { active: 0, total: 0 };
  const coh = ov.coherence || { overall: 0, physical: 0, mental: 0, spiritual: 0, conscious: 0, anima: 0 };
  const sec = ov.security || { livingScore: 0, attacksIntercepted: 0 };

  const sparklines = useMemo(() => ({
    signals: Array.from({ length: 12 }, () => 50 + Math.random() * 50),
    vectors: Array.from({ length: 12 }, () => 60 + Math.random() * 40),
    chains: Array.from({ length: 12 }, () => 80 + Math.random() * 20),
    attacks: Array.from({ length: 12 }, () => Math.random() * 30),
    coherence: Array.from({ length: 12 }, () => 0.78 + Math.random() * 0.18),
  }), []);

  const kpiCards = [
    { label: "Signals Published", value: st.total.toLocaleString(), change: `${st.coherent} coherent`, color: "#00D4AA", spark: sparklines.signals },
    { label: "Chains Active", value: `${ch.active}/${ch.total}`, change: `${ch.indexing || 0} indexing`, color: "#FFD93D", spark: sparklines.chains },
    { label: "Attacks Intercepted", value: sec.attacksIntercepted?.toLocaleString() || "0", change: isLive ? "LIVE" : "Mock", color: "#FF6B6B", spark: sparklines.attacks },
    { label: "System Coherence", value: (coh.overall || 0).toFixed(3), change: (coh.overall || 0) > 0.84 ? "↑ Nominal" : "↓ Fluctuating", color: "#00D4AA", spark: sparklines.coherence },
    { label: "Security Score", value: (sec.livingScore || 0).toFixed(1), change: isLive ? "LIVE" : "Mock", color: "#7B61FF", spark: sparklines.vectors },
  ];

  const weights = ["α", "β", "γ", "δ", "ε"];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpiCards.map((kpi, i) => (
          <motion.div key={kpi.label} variants={itemVariants}>
            <div className="glass-card p-4 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${kpi.color}, transparent)` }} />
              <p className="text-[11px] uppercase tracking-wider text-[#8b95a5] mb-2">{kpi.label}</p>
              <div className="flex items-end justify-between gap-2">
                <span className="text-[28px] font-bold tabular-nums text-[#e8ecf1] leading-none">{kpi.value}</span>
                <MiniSparkline data={kpi.spark} color={kpi.color} />
              </div>
              <p className="text-[11px] mt-2" style={{ color: kpi.color }}>{kpi.change}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Five-Plane Coherence Pipeline */}
      <motion.div variants={itemVariants}>
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#e8ecf1]">Five-Plane Coherence Pipeline</h3>
            <span className="text-[11px] text-[#8b95a5] font-mono">MF = Σ(wᵢ · Pᵢ) = {(coh.overall || 0).toFixed(3)}</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {PLANE_STATUSES.map((plane, i) => (
              <React.Fragment key={plane.symbol}>
                <div className="glass-card-elevated min-w-[140px] flex-1 p-3 text-center relative">
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: plane.color }} />
                  <div className="text-2xl font-bold mb-1" style={{ color: plane.color }}>{plane.symbol}</div>
                  <div className="text-[11px] text-[#8b95a5] mb-2">{plane.name}</div>
                  <div className="text-lg font-bold tabular-nums text-[#e8ecf1] mb-1">{plane.score.toFixed(3)}</div>
                  <div className="text-[10px] text-[#8b95a5] mb-2">w = {weights[i]}</div>
                  <div className="w-full h-1.5 rounded-full bg-[#0a0c12] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: plane.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${plane.score * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                    />
                  </div>
                  <div className="text-[9px] text-[#4a5568] mt-1 uppercase">{plane.status}</div>
                </div>
                {i < PLANE_STATUSES.length - 1 && (
                  <div className="text-[#4a5568] text-lg shrink-0 px-0.5">›</div>
                )}
              </React.Fragment>
            ))}
          </div>
          {/* Master equation */}
          <div className="mt-4 bg-[#0a0c12] rounded-lg p-3 font-mono text-[11px] leading-relaxed overflow-x-auto">
            <span className="text-[#4a5568]">MF(t) = </span>
            {PLANE_STATUSES.map((p, i) => (
              <span key={p.symbol}>
                <span style={{ color: p.color }}>{weights[i]}·{p.symbol}</span>
                <span className="text-[#4a5568]">({p.score.toFixed(3)})</span>
                {i < PLANE_STATUSES.length - 1 && <span className="text-[#4a5568]"> + </span>}
              </span>
            ))}
            <span className="text-[#4a5568]"> = </span>
            <span className="text-[#00D4AA] font-bold">{coherence.toFixed(3)}</span>
            <span className="text-[#4a5568]"> · Θ_min = 0.550 · </span>
            <span className="text-[#00D4AA]">NOMINAL</span>
          </div>
        </div>
      </motion.div>

      {/* Live Signals Table + Chain Health */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Signals Table — 60% */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#e8ecf1]">Live Signals</h3>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4AA] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D4AA]" />
                </span>
                <span className="text-[10px] text-[#00D4AA]">LIVE</span>
              </div>
            </div>
            <ScrollArea className="h-[320px]">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-[#8b95a5] uppercase tracking-wider border-b border-[rgba(255,255,255,0.06)]">
                    <th className="text-left py-2 px-2 font-medium">Time</th>
                    <th className="text-left py-2 px-2 font-medium">Entity</th>
                    <th className="text-left py-2 px-2 font-medium">Chain</th>
                    <th className="text-left py-2 px-2 font-medium">Signal</th>
                    <th className="text-right py-2 px-2 font-medium">C(t)</th>
                    <th className="text-right py-2 px-2 font-medium">Θ(t)</th>
                    <th className="text-right py-2 px-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {signals.map((sig) => (
                      <motion.tr
                        key={sig.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-b border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                      >
                        <td className="py-2 px-2 tabular-nums text-[#8b95a5]">{sig.time}</td>
                        <td className="py-2 px-2 font-mono text-[#e8ecf1]">{sig.entityShort}</td>
                        <td className="py-2 px-2">
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: sig.chainColor }} />
                            <span className="text-[#c0c6d0]">{sig.chain}</span>
                          </span>
                        </td>
                        <td className="py-2 px-2 text-[#e8ecf1]">{sig.signalType}</td>
                        <td className="py-2 px-2 text-right tabular-nums" style={{ color: sig.coherence > 0.55 ? "#00D4AA" : "#FF5252" }}>
                          {sig.coherence.toFixed(3)}
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums text-[#8b95a5]">{sig.threshold.toFixed(3)}</td>
                        <td className="py-2 px-2 text-right">
                          <span
                            className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium"
                            style={{
                              color: STATUS_COLORS[sig.status] || "#8b95a5",
                              backgroundColor: `${STATUS_COLORS[sig.status] || "#8b95a5"}15`,
                            }}
                          >
                            {sig.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </ScrollArea>
          </div>
        </motion.div>

        {/* Chain Health — 40% */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="glass-card p-4 h-full">
            <h3 className="text-sm font-semibold text-[#e8ecf1] mb-3">Chain Health</h3>
            <ScrollArea className="h-[320px]">
              <div className="space-y-1">
                {CHAINS.map((chain) => (
                  <div
                    key={chain.id}
                    className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: CHAIN_STATUS_DOT[chain.status] }}
                    />
                    <span className="text-sm text-[#e8ecf1] shrink-0 w-24 truncate">{chain.name}</span>
                    <span className="text-[10px] text-[#8b95a5] tabular-nums shrink-0 w-14 text-right">{chain.latency}</span>
                    <span className="text-[10px] text-[#4a5568] tabular-nums shrink-0 w-20 text-right font-mono">
                      #{chain.blockHeight.toLocaleString()}
                    </span>
                    <span className="text-[10px] tabular-nums shrink-0 w-14 text-right" style={{ color: chain.bhCount > 100000 ? "#00D4AA" : "#8b95a5" }}>
                      {chain.bhCount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </motion.div>
      </div>

      {/* Network Activity Chart */}
      <motion.div variants={itemVariants}>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#e8ecf1]">Network Activity — 24h</h3>
            <div className="flex items-center gap-4 text-[10px]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 rounded-full bg-[#00D4AA]" />Throughput</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 rounded-full bg-[#7B61FF]" />Signals</span>
            </div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={networkData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00D4AA" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#00D4AA" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7B61FF" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#7B61FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1f2b" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: "#4a5568", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4a5568", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0e1019", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: "#8b95a5" }}
                  itemStyle={{ color: "#e8ecf1" }}
                />
                <Area type="monotone" dataKey="throughput" stroke="#00D4AA" strokeWidth={1.5} fill="url(#gradTeal)" />
                <Area type="monotone" dataKey="signals" stroke="#7B61FF" strokeWidth={1.5} fill="url(#gradPurple)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 2. SIGNALS PAGE
// ═══════════════════════════════════════════════════════════════
const SIGNAL_FILTERS = ["ALL", "COHERENT", "SILENCE", "MANIPULATION_ALERT", "GENESIS"] as const;
type SignalFilter = (typeof SIGNAL_FILTERS)[number];

export function SignalsPage() {
  const [filter, setFilter] = useState<SignalFilter>("ALL");
  const { data: signalsData, dataSource } = useSignals(80);
  const isLive = dataSource === 'LIVE';
  const signals = (isLive && signalsData?.signals) ? signalsData.signals : FALLBACK_SIGNALS.slice(0, 80);
  const [localSignals, setLocalSignals] = useState(signals);

  // Keep local signals in sync with API data, but also add new ones locally
  useEffect(() => { setLocalSignals(signals); }, [signals]);
  const addSignal = useCallback(() => {
    const sig = generateNewSignal();
    setLocalSignals((prev) => [sig, ...prev].slice(0, 80));
  }, []);

  useEffect(() => {
    const interval = setInterval(addSignal, 2000);
    return () => clearInterval(interval);
  }, [addSignal]);

  const filtered = useMemo(() => {
    if (filter === "ALL") return localSignals;
    return localSignals.filter((s) => s.status === filter);
  }, [localSignals, filter]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Filter Buttons */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
        {SIGNAL_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${
              filter === f
                ? "bg-[#00D4AA] text-[#08090d]"
                : "bg-[rgba(255,255,255,0.04)] text-[#8b95a5] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#e8ecf1]"
            }`}
          >
            {f.replace(/_/g, " ")}
            <span className="ml-1.5 opacity-60">
              {f === "ALL" ? localSignals.length : localSignals.filter((s) => s.status === f).length}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Full Signal Table */}
      <motion.div variants={itemVariants}>
        <div className="glass-card overflow-hidden">
          <ScrollArea className="h-[600px]">
            <table className="w-full text-[11px] min-w-[1100px]">
              <thead className="sticky top-0 z-10 bg-[#0e1019]/95 backdrop-blur-sm">
                <tr className="text-[#8b95a5] uppercase tracking-wider border-b border-[rgba(255,255,255,0.06)]">
                  <th className="text-left py-2.5 px-2.5 font-medium">Time</th>
                  <th className="text-left py-2.5 px-2.5 font-medium">Entity</th>
                  <th className="text-left py-2.5 px-2.5 font-medium">Chain</th>
                  <th className="text-left py-2.5 px-2.5 font-medium">Signal Type</th>
                  <th className="text-right py-2.5 px-2.5 font-medium">C(t)</th>
                  <th className="text-right py-2.5 px-2.5 font-medium">Θ(t)</th>
                  <th className="text-right py-2.5 px-2.5 font-medium">Φ</th>
                  <th className="text-right py-2.5 px-2.5 font-medium">M</th>
                  <th className="text-right py-2.5 px-2.5 font-medium">Σ</th>
                  <th className="text-right py-2.5 px-2.5 font-medium">K</th>
                  <th className="text-right py-2.5 px-2.5 font-medium">A</th>
                  <th className="text-right py-2.5 px-2.5 font-medium">MF</th>
                  <th className="text-left py-2.5 px-2.5 font-medium">Limiting</th>
                  <th className="text-center py-2.5 px-2.5 font-medium">Status</th>
                  <th className="text-center py-2.5 px-2.5 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filtered.map((sig) => (
                    <motion.tr
                      key={sig.id}
                      initial={{ opacity: 0, x: -6, backgroundColor: "rgba(0,212,170,0.06)" }}
                      animate={{ opacity: 1, x: 0, backgroundColor: "rgba(0,0,0,0)" }}
                      transition={{ duration: 0.35 }}
                      className="border-b border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.015)] transition-colors"
                    >
                      <td className="py-2 px-2.5 tabular-nums text-[#8b95a5] whitespace-nowrap">{sig.time}</td>
                      <td className="py-2 px-2.5 font-mono text-[#e8ecf1]">{sig.entityShort}</td>
                      <td className="py-2 px-2.5">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: sig.chainColor }} />
                          <span className="text-[#c0c6d0]">{sig.chain}</span>
                        </span>
                      </td>
                      <td className="py-2 px-2.5 text-[#e8ecf1] whitespace-nowrap">{sig.signalType}</td>
                      <td className="py-2 px-2.5 text-right tabular-nums font-medium" style={{ color: sig.coherence > 0.55 ? "#00D4AA" : "#FF5252" }}>
                        {sig.coherence.toFixed(3)}
                      </td>
                      <td className="py-2 px-2.5 text-right tabular-nums text-[#8b95a5]">{sig.threshold.toFixed(3)}</td>
                      <td className="py-2 px-2.5 text-right tabular-nums" style={{ color: PLANE_COLORS.Physical }}>{sig.phi.toFixed(3)}</td>
                      <td className="py-2 px-2.5 text-right tabular-nums" style={{ color: PLANE_COLORS.Mental }}>{sig.mental.toFixed(3)}</td>
                      <td className="py-2 px-2.5 text-right tabular-nums" style={{ color: PLANE_COLORS.Spiritual }}>{sig.sigma.toFixed(3)}</td>
                      <td className="py-2 px-2.5 text-right tabular-nums" style={{ color: PLANE_COLORS.Conscious }}>{(sig.coherence * 0.1).toFixed(3)}</td>
                      <td className="py-2 px-2.5 text-right tabular-nums" style={{ color: PLANE_COLORS.ANIMA }}>{sig.anima.toFixed(3)}</td>
                      <td className="py-2 px-2.5 text-right tabular-nums text-[#c0c6d0]">{sig.mfScore.toFixed(2)}</td>
                      <td className="py-2 px-2.5" style={{ color: PLANE_COLORS[sig.limitingPlane] || "#8b95a5" }}>
                        {sig.limitingPlane}
                      </td>
                      <td className="py-2 px-2.5 text-center">
                        <span
                          className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap"
                          style={{
                            color: STATUS_COLORS[sig.status] || "#8b95a5",
                            backgroundColor: `${STATUS_COLORS[sig.status] || "#8b95a5"}18`,
                          }}
                        >
                          {sig.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 text-center">
                        <span className="inline-flex items-center gap-1">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: sig.dataSource === "LIVE" ? "#00D4AA" : "#4a5568" }}
                          />
                          <span className="text-[10px] text-[#8b95a5]">{sig.dataSource}</span>
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </ScrollArea>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 3. CHAINS PAGE
// ═══════════════════════════════════════════════════════════════
const CHAIN_SORT = { key: "bhCount", dir: "desc" } as const;

const SORT_ARROWS: Record<string, string> = {
  asc: " ↑",
  desc: " ↓",
};

export function ChainsPage() {
  const { data: chainsData, dataSource } = useChains();
  const { data: vmData } = useVmFamilies();
  const isLive = dataSource === 'LIVE';

  const displayChains = (isLive && chainsData?.chains?.length) ? chainsData.chains : FALLBACK_CHAINS.map(c => ({...c, latency: Math.floor(Math.random()*100)+10, blockHeight: 180000000+Math.floor(Math.random()*20000000), behaviorsIndexed: Math.floor(Math.random()*400000)+10000}));
  const displayVMs = (isLive && vmData?.families?.length) ? vmData.families.map(v => ({...v, color: FALLBACK_VMS.find(f=>f.name===v.name)?.color || '#00D4AA', description: v.languages?.join(', '), status: 'online'})) : FALLBACK_VMS;

  const chainCount = isLive && chainsData ? `${chainsData.active}/${chainsData.total}` : `${displayChains.length}`;

  const [sortKey, setSortKey] = useState<string>("blockHeight");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sortedChains = useMemo(() => {
    return [...displayChains].sort((a, b) => {
      const aVal = (a as any)[sortKey];
      const bVal = (b as any)[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "desc" ? bVal - aVal : aVal - bVal;
      }
      return 0;
    });
  }, [displayChains, sortKey, sortDir]);

  const handleSort = useCallback((key: string) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortDir("desc");
      }
      return key;
    });
  }, []);

  const pieData = useMemo(() => {
    return displayVMs.filter((v) => v.chains > 0).map((vm) => ({
      name: vm.name,
      value: vm.chains,
      color: (vm as any).color || '#00D4AA',
    }));
  }, []);

  const columns = [
    { key: "name", label: "Chain" },
    { key: "vm", label: "VM" },
    { key: "status", label: "Status" },
    { key: "latency", label: "Latency" },
    { key: "blockHeight", label: "Block Height" },
    { key: "behaviorsIndexed", label: "Behaviors Indexed" },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* VM Family Cards */}
      <motion.div variants={itemVariants}>
        <h3 className="text-sm font-semibold text-[#e8ecf1] mb-3">VM Families — {displayVMs.length} Machines</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {displayVMs.map((vm) => (
            <motion.div key={vm.name} variants={fastItemVariants}>
              <div className="glass-card p-3 relative overflow-hidden group hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
                  style={{ background: `linear-gradient(180deg, ${(vm as any).color || '#00D4AA'}, ${(vm as any).color || '#00D4AA'}40)` }}
                />
                <div className="flex items-center gap-2 mb-2 pl-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: (vm as any).color || '#00D4AA' }} />
                  <span className="text-[13px] font-bold text-[#e8ecf1]">{vm.name}</span>
                </div>
                <div className="pl-2 space-y-1">
                  <p className="text-[10px] text-[#8b95a5]">{vm.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[18px] font-bold tabular-nums text-[#e8ecf1]">{vm.chains}</span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        color: vm.status === "online" ? "#00D4AA" : "#FFD93D",
                        backgroundColor: vm.status === "online" ? "#00D4AA18" : "#FFD93D18",
                      }}
                    >
                      {vm.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* All Chains Table + Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-[rgba(255,255,255,0.06)]">
              <h3 className="text-sm font-semibold text-[#e8ecf1]">All {chainCount} Chains</h3>
            </div>
            <ScrollArea className="h-[420px]">
              <table className="w-full text-[11px] min-w-[700px]">
                <thead className="sticky top-0 z-10 bg-[#0e1019]/95 backdrop-blur-sm">
                  <tr className="text-[#8b95a5] uppercase tracking-wider border-b border-[rgba(255,255,255,0.06)]">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className={`py-2.5 px-3 font-medium cursor-pointer hover:text-[#e8ecf1] transition-colors select-none ${
                          col.key === "name" ? "text-left" : col.key === "vm" ? "text-left" : "text-right"
                        }`}
                      >
                        {col.label}
                        {sortKey === col.key && (
                          <span className="text-[#00D4AA] text-[9px]">{SORT_ARROWS[sortDir]}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedChains.map((chain: any) => (
                    <tr key={chain.id} className="border-b border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.015)] transition-colors">
                      <td className="py-2.5 px-3">
                        <span className="text-[#e8ecf1] font-medium">{chain.name}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ color: '#00D4AA', backgroundColor: '#00D4AA18' }}>
                          {chain.vm}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: chain.status === 'active' ? '#00D4AA' : '#FFD93D' }} />
                          <span className="capitalize text-[#c0c6d0]">{chain.status}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-[#8b95a5]">{chain.latency ? chain.latency + 'ms' : '—'}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-[#c0c6d0] font-mono">#{(chain.blockHeight || 0).toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums" style={{ color: (chain.behaviorsIndexed || 0) > 100000 ? '#00D4AA' : '#8b95a5' }}>
                        {(chain.behaviorsIndexed || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <div className="glass-card p-4 h-full">
            <h3 className="text-sm font-semibold text-[#e8ecf1] mb-4">Chains by VM Family</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#0e1019", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 11 }}
                    labelStyle={{ color: "#8b95a5" }}
                    itemStyle={{ color: "#e8ecf1" }}
                    formatter={(value: number, name: string) => [`${value} chains`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
                  <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-[#8b95a5] truncate">{d.name}</span>
                  <span className="tabular-nums text-[#c0c6d0] ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 4. TRADING PAGE
// ═══════════════════════════════════════════════════════════════
const FIREWALL_BADGE: Record<string, { color: string; bg: string }> = {
  PROTECTED: { color: "#00D4AA", bg: "#00D4AA18" },
  MONITORING: { color: "#FFD93D", bg: "#FFD93D18" },
  ALERT: { color: "#FF5252", bg: "#FF525218" },
};

export function TradingPage() {
  const [attackCount, setAttackCount] = useState(47);
  const [swayCount, setSwayCount] = useState(89234);

  useEffect(() => {
    const interval = setInterval(() => {
      setAttackCount((c) => c + (Math.random() > 0.9 ? 1 : 0));
      setSwayCount((c) => c + Math.floor(Math.random() * 5) + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const volumeChartData = useMemo(() => {
    return TRADING_PAIRS.map((p) => ({
      name: p.pair.split("/")[0],
      volume: parseFloat(p.volume24h.replace(/[$BKM]/g, "")) * (p.volume24h.includes("B") ? 1000 : p.volume24h.includes("M") ? 1 : 0.001),
      fill: "#00D4AA",
    })).sort((a, b) => b.volume - a.volume);
  }, []);

  const tradingKpis = [
    { label: "Total Value Protected", value: "$2.4B", change: "+$180M this week", color: "#00D4AA", icon: "🛡️" },
    { label: "Sways Monitored", value: swayCount.toLocaleString(), change: "+1,247 last hour", color: "#7B61FF", icon: "📊" },
    { label: "Avg Firewall Latency", value: "0.3ms", change: "↓ 12% from baseline", color: "#FFD93D", icon: "⚡" },
    { label: "24h Attack Attempts", value: attackCount.toLocaleString(), change: "47 blocked · 0 breached", color: "#FF6B6B", icon: "🔒" },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tradingKpis.map((kpi) => (
          <motion.div key={kpi.label} variants={itemVariants}>
            <div className="glass-card p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${kpi.color}, transparent)` }} />
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{kpi.icon}</span>
                <span className="text-[11px] uppercase tracking-wider text-[#8b95a5]">{kpi.label}</span>
              </div>
              <div className="text-[26px] font-bold tabular-nums text-[#e8ecf1] leading-none mb-2">{kpi.value}</div>
              <p className="text-[11px]" style={{ color: kpi.color }}>{kpi.change}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trading Pairs Table */}
      <motion.div variants={itemVariants}>
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-[rgba(255,255,255,0.06)]">
            <h3 className="text-sm font-semibold text-[#e8ecf1]">Trading Pairs — Firewall Protected</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] min-w-[800px]">
              <thead>
                <tr className="text-[#8b95a5] uppercase tracking-wider border-b border-[rgba(255,255,255,0.06)]">
                  <th className="text-left py-2.5 px-3 font-medium">Pair</th>
                  <th className="text-left py-2.5 px-3 font-medium">Chain</th>
                  <th className="text-right py-2.5 px-3 font-medium">Price</th>
                  <th className="text-right py-2.5 px-3 font-medium">24h Change</th>
                  <th className="text-right py-2.5 px-3 font-medium">Volume</th>
                  <th className="text-right py-2.5 px-3 font-medium">Liquidity</th>
                  <th className="text-center py-2.5 px-3 font-medium">Firewall</th>
                  <th className="text-right py-2.5 px-3 font-medium">BH Score</th>
                </tr>
              </thead>
              <tbody>
                {TRADING_PAIRS.map((pair) => (
                  <tr key={pair.pair} className="border-b border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.015)] transition-colors">
                    <td className="py-2.5 px-3 text-[#e8ecf1] font-semibold">{pair.pair}</td>
                    <td className="py-2.5 px-3 text-[#8b95a5]">{pair.chain}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-[#e8ecf1] font-medium">{pair.price}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-medium" style={{ color: pair.change24h >= 0 ? "#00D4AA" : "#FF5252" }}>
                      {pair.change24h >= 0 ? "+" : ""}{pair.change24h.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-[#c0c6d0]">{pair.volume24h}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-[#8b95a5]">{pair.liquidity}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold"
                        style={{
                          color: FIREWALL_BADGE[pair.firewallStatus]?.color || "#8b95a5",
                          backgroundColor: FIREWALL_BADGE[pair.firewallStatus]?.bg || "#8b95a518",
                        }}
                      >
                        {pair.firewallStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-12 h-1.5 rounded-full bg-[#0a0c12] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pair.bhScore * 100}%`,
                              backgroundColor: pair.bhScore > 0.85 ? "#00D4AA" : pair.bhScore > 0.7 ? "#FFD93D" : "#FF8C42",
                            }}
                          />
                        </div>
                        <span className="tabular-nums text-[#c0c6d0] w-10 text-right">{pair.bhScore.toFixed(3)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Volume Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-[#e8ecf1] mb-4">Top Pairs by Volume</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1f2b" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#4a5568", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#4a5568", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#0e1019", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 11 }}
                    labelStyle={{ color: "#8b95a5" }}
                    itemStyle={{ color: "#e8ecf1" }}
                    formatter={(value: number) => [`${value.toLocaleString()}M`, "Volume"]}
                  />
                  <Bar dataKey="volume" fill="#00D4AA" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Recent Firewall Events */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <div className="glass-card p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#e8ecf1]">Recent Firewall Events</h3>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B6B] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6B6B]" />
              </span>
            </div>
            <div className="space-y-2">
              {FIREWALL_EVENTS.map((evt, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                  className="p-2.5 rounded-lg bg-[#0a0c12] border border-[rgba(255,255,255,0.06)]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono tabular-nums text-[#4a5568]">{evt.time}</span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                      style={{
                        color: evt.action === "Blocked" ? "#FF5252" : "#FFD93D",
                        backgroundColor: evt.action === "Blocked" ? "#FF525218" : "#FFD93D18",
                      }}
                    >
                      {evt.action}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-[#FF6B6B]">{evt.type}</span>
                    <span className="text-[#4a5568]">·</span>
                    <span className="text-[10px] text-[#8b95a5]">{evt.chain}</span>
                    <span className="text-[#4a5568]">·</span>
                    <span className="text-[10px] text-[#c0c6d0]">{evt.pair}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}