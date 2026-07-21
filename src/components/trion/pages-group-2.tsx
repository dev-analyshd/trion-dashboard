"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PLANE_STATUSES, LIVING_SECURITY, CRISPR_SIGNATURES, ANIMA_STREAMS,
  ARCHETYPES,
} from "@/lib/trion-data";

// ─── Shared Animation Variants ──────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};
const fadeScale = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const RISK_COLORS: Record<string, string> = { SAFE: "#00D4AA", CAUTION: "#FFD93D", DANGER: "#FF6B6B", CRITICAL: "#FF5252" };
const SEVERITY_COLORS: Record<string, string> = { critical: "#FF6B6B", high: "#FF8C42", medium: "#FFD93D" };
const WEIGHT_LABELS = ["α", "β", "γ", "δ", "ε"];

// ─── Shared Chart Tooltip ───────────────────────────────────────────
function DarkTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-elevated px-3 py-2 text-xs">
      <p className="text-[#8b95a5] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[#e8ecf1]">{p.name}: {typeof p.value === "number" ? p.value.toFixed(3) : p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 1. AKASHIC PAGE
// ═══════════════════════════════════════════════════════════════════════

const AKASHIC_METRICS = [
  { label: "Total Vectors", value: "2,418,923", sub: "128-dim embeddings", color: "#00D4AA", icon: "⬡" },
  { label: "Entity Records", value: "142,307", sub: "Unique BEO entities", color: "#7B61FF", icon: "◉" },
  { label: "Archetypes", value: "64", sub: "Behavioral clusters", color: "#FFD93D", icon: "✦" },
  { label: "Akashic Depth", value: "D≥10K", sub: "Min 10K tx per entity", color: "#FF8C42", icon: "▼" },
  { label: "BH Ledger", value: "4.8M", sub: "Behavioral history records", color: "#FF6B6B", icon: "◎" },
  { label: "0G Storage", value: "892 syncs", sub: "DA blob syncs active", color: "#00D4AA", icon: "⬢" },
  { label: "DA Blobs", value: "12,847", sub: "Data availability blobs", color: "#7B61FF", icon: "◆" },
  { label: "KV Streams", value: "4 active", sub: "0G key-value streams", color: "#FFD93D", icon: "⇌" },
];

function generateVectorGrid() {
  const archetypeColors = ARCHETYPES.map(a => a.color);
  const grid: { color: string; opacity: number }[] = [];
  for (let i = 0; i < 256; i++) {
    const arch = archetypeColors[i % archetypeColors.length];
    const opacity = 0.15 + Math.random() * 0.7;
    grid.push({ color: arch, opacity });
  }
  return grid;
}

export function AkashicPage() {
  const vectorGrid = React.useMemo(() => generateVectorGrid(), []);
  const displayedArchetypes = ARCHETYPES.slice(0, 12);
  const riskCounts = { SAFE: 0, CAUTION: 0, DANGER: 0, CRITICAL: 0 };
  ARCHETYPES.forEach(a => { riskCounts[a.risk] += a.count; });
  const radarData = Object.entries(riskCounts).map(([risk, count]) => ({
    risk,
    count,
    fullMark: Math.max(...Object.values(riskCounts)),
  }));

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {AKASHIC_METRICS.map((m, i) => (
          <motion.div key={m.label} variants={itemVariants}>
            <div className="glass-card p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                style={{ background: `${m.color}18`, color: m.color }}>
                {m.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[#8b95a5] text-xs font-medium uppercase tracking-wider">{m.label}</p>
                <p className="text-[#e8ecf1] text-xl font-bold mt-0.5">{m.value}</p>
                <p className="text-[#4a5568] text-xs mt-0.5">{m.sub}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── 64 Behavioral Archetypes ── */}
      <motion.div variants={fadeScale}>
        <h2 className="text-[#e8ecf1] text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#00D4AA] rounded-full" />64 Behavioral Archetypes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {displayedArchetypes.map((arch, i) => (
            <motion.div key={arch.id} variants={itemVariants}>
              <div className="glass-card p-4 flex gap-3 overflow-hidden relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background: arch.color }} />
                <div className="pl-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[#e8ecf1] text-sm font-semibold truncate">{arch.name}</span>
                    <Badge className="text-[10px] px-1.5 py-0 h-5 font-bold border-0"
                      style={{ background: `${RISK_COLORS[arch.risk]}20`, color: RISK_COLORS[arch.risk] }}>
                      {arch.risk}
                    </Badge>
                  </div>
                  <p className="text-[#4a5568] text-xs mb-2 line-clamp-1">{arch.description}</p>
                  <p className="text-[#8b95a5] text-xs font-mono">{arch.count.toLocaleString()} entities</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Radar Chart + Vector Space ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fadeScale}>
          <div className="glass-card p-6">
            <h3 className="text-[#e8ecf1] text-sm font-semibold mb-4">Archetype Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#1a1f2b" />
                <PolarAngleAxis dataKey="risk" tick={{ fill: "#8b95a5", fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fill: "#4a5568", fontSize: 10 }} axisLine={false} />
                <Radar name="Entities" dataKey="count" stroke="#00D4AA" fill="#00D4AA" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip content={<DarkTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={fadeScale}>
          <div className="glass-card p-6">
            <h3 className="text-[#e8ecf1] text-sm font-semibold mb-4">128-Dim Vector Space</h3>
            <div className="flex flex-wrap gap-[2px] justify-center">
              {vectorGrid.map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: v.opacity, scale: 1 }}
                  transition={{ delay: i * 0.003, duration: 0.2 }}
                  className="w-[13px] h-[13px] rounded-sm"
                  style={{ background: v.color, opacity: v.opacity }}
                />
              ))}
            </div>
            <p className="text-[#4a5568] text-[10px] text-center mt-3">16×16 cluster grid · color = nearest archetype · brightness = density</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 2. PLANES PAGE
// ═══════════════════════════════════════════════════════════════════════

function buildPlaneHistory() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const planes = PLANE_STATUSES;
  return days.map((day, di) => {
    const entry: Record<string, string | number> = { day };
    planes.forEach((p, pi) => {
      const base = p.score;
      const noise = (Math.sin(di * 1.3 + pi * 2.1) * 0.04) + (Math.cos(di * 0.7 + pi) * 0.02);
      entry[p.name] = Math.min(1, Math.max(0, Math.round((base + noise) * 1000) / 1000));
    });
    return entry;
  });
}

function buildShannonFeatures() {
  return PLANE_STATUSES[0].features.map((f) => ({
    name: f,
    value: 0.45 + Math.random() * 0.5,
  }));
}

const CODE_LINES = [
  { text: "// TRION Master Equation — Whitepaper §11", cls: "text-[#4a5568]" },
  { text: "C(t) = ", cls: "text-[#e8ecf1]", after: [
    { text: "α", color: "#00D4AA" }, { text: "·", cls: "text-[#00D4AA]" },
    { text: "Φ_adj", color: "#00D4AA" }, { text: "(0.842) + ", cls: "text-[#e8ecf1]" },
    { text: "β", color: "#7B61FF" }, { text: "·", cls: "text-[#7B61FF]" },
    { text: "M_adj", color: "#7B61FF" }, { text: "(0.791) + ", cls: "text-[#e8ecf1]" },
    { text: "γ", color: "#FF6B6B" }, { text: "·", cls: "text-[#FF6B6B]" },
    { text: "Σ", color: "#FF6B6B" }, { text: "(0.724) + ", cls: "text-[#e8ecf1]" },
    { text: "δ", color: "#FFD93D" }, { text: "·", cls: "text-[#FFD93D]" },
    { text: "K", color: "#FFD93D" }, { text: "(0.100) + ", cls: "text-[#e8ecf1]" },
    { text: "ε", color: "#FF8C42" }, { text: "·", cls: "text-[#FF8C42]" },
    { text: "A", color: "#FF8C42" }, { text: "(0.100)", cls: "text-[#e8ecf1]" },
  ]},
  { text: "C(t) = 0.25×0.842 + 0.30×0.791 + 0.25×0.724 + 0.10×0.100 + 0.10×0.100", cls: "text-[#e8ecf1]" },
  { text: "C(t) = 0.2105 + 0.2373 + 0.1810 + 0.0100 + 0.0100 = 0.6488", cls: "text-[#e8ecf1]" },
  { text: "", cls: "" },
  { text: "// Economic Moat (6-factor multiplicative)", cls: "text-[#4a5568]" },
  { text: "M_moat = D(t)×Q(t)×R(t)×X(t)×F(t)×N(t) = 0.847", cls: "text-[#e8ecf1]" },
  { text: "", cls: "" },
  { text: "// Final Output", cls: "text-[#4a5568]" },
  { text: "T(t) = [C(t) ≥ Θ(t)] · C(t) · e^M_moat = COHERENT · 0.649 · 1.847", cls: "text-[#e8ecf1]" },
];

export function PlanesPage() {
  const planeHistory = buildPlaneHistory();
  const shannonFeatures = buildShannonFeatures();

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      {/* ── 5 Plane Detail Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {PLANE_STATUSES.map((plane, i) => (
          <motion.div key={plane.name} variants={itemVariants}>
            <div className="glass-card p-5 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
                  style={{ background: `${plane.color}20`, color: plane.color, border: `1px solid ${plane.color}30` }}>
                  {plane.symbol}
                </div>
                <div className="min-w-0">
                  <h3 className="text-[#e8ecf1] text-sm font-bold">{plane.name}</h3>
                  <p className="text-[#4a5568] text-[10px]">{plane.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[#8b95a5]">Weight <span style={{ color: plane.color }} className="font-mono font-bold">{WEIGHT_LABELS[i]} = {plane.weight}</span></span>
                <Badge className="text-[9px] px-1.5 py-0 h-5 font-bold border-0"
                  style={{ background: plane.status === "active" ? "#00D4AA20" : "#FFD93D20", color: plane.status === "active" ? "#00D4AA" : "#FFD93D" }}>
                  {plane.status.toUpperCase()}
                </Badge>
              </div>

              <div className="mb-3">
                <div className="flex items-baseline gap-1 mb-1.5">
                  <span className="text-[#e8ecf1] text-2xl font-bold font-mono">{plane.score.toFixed(3)}</span>
                </div>
                <div className="w-full h-1.5 bg-[#0e1019] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: plane.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${plane.score * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-auto">
                {plane.features.slice(0, 4).map((f) => (
                  <span key={f} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${plane.color}12`, color: `${plane.color}cc`, border: `1px solid ${plane.color}20` }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Master Equation ── */}
      <motion.div variants={fadeScale}>
        <div className="glass-card p-6">
          <h3 className="text-[#e8ecf1] text-sm font-semibold mb-4 flex items-center gap-2">
            <span className="text-[#00D4AA]">⟨</span> Master Equation Breakdown <span className="text-[#00D4AA]">⟩</span>
          </h3>
          <div className="bg-[#08090d] rounded-lg p-4 font-mono text-xs leading-6 overflow-x-auto border border-[rgba(255,255,255,0.04)]">
            {CODE_LINES.map((line, li) => (
              <div key={li}>
                {line.after ? (
                  <span>
                    <span className={line.cls}>{line.text}</span>
                    {line.after.map((seg, si) => (
                      <span key={si} style={seg.color ? { color: seg.color } : undefined} className={seg.cls}>
                        {seg.text}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className={line.cls}>{line.text}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Plane Score History ── */}
      <motion.div variants={fadeScale}>
        <div className="glass-card p-6">
          <h3 className="text-[#e8ecf1] text-sm font-semibold mb-4">Plane Score History (7d)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={planeHistory}>
              <defs>
                {PLANE_STATUSES.map((p) => (
                  <linearGradient key={p.name} id={`grad-${p.name}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={p.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={p.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1f2b" />
              <XAxis dataKey="day" tick={{ fill: "#4a5568", fontSize: 11 }} axisLine={{ stroke: "#1a1f2b" }} />
              <YAxis domain={[0, 1]} tick={{ fill: "#4a5568", fontSize: 11 }} axisLine={{ stroke: "#1a1f2b" }} />
              <Tooltip content={<DarkTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#8b95a5" }} />
              {PLANE_STATUSES.map((p) => (
                <Area key={p.name} type="monotone" dataKey={p.name} stroke={p.color}
                  fill={`url(#grad-${p.name})`} strokeWidth={2} dot={false} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── Shannon Entropy Features ── */}
      <motion.div variants={fadeScale}>
        <h2 className="text-[#e8ecf1] text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#00D4AA] rounded-full" /> Shannon Entropy Features
          <span className="text-[#4a5568] text-xs font-normal ml-2">— Physical Plane (Φ)</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {shannonFeatures.map((f, i) => (
            <motion.div key={f.name} variants={itemVariants}>
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#e8ecf1] text-sm font-medium">{f.name}</span>
                  <span className="text-[#00D4AA] text-xs font-mono font-bold">{f.value.toFixed(3)}</span>
                </div>
                <div className="w-full h-1.5 bg-[#0e1019] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[#00D4AA]"
                    initial={{ width: 0 }}
                    animate={{ width: `${f.value * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 3. SECURITY PAGE
// ═══════════════════════════════════════════════════════════════════════

const SECURITY_KPIS = [
  { label: "Living Security Score", value: "SEC(t) = 0.94", sub: "8-component composite", color: "#00D4AA", icon: "◆" },
  { label: "Genomic Key Evolution", value: "GK #482,191", sub: "SHA3-256 hash chain", color: "#7B61FF", icon: "⧫" },
  { label: "CRISPR Intercepts", value: "1,381 total", sub: "10 attack signatures", color: "#FF6B6B", icon: "✦" },
  { label: "PQC Layer", value: "ML-DSA-87", sub: "CRYSTALS-Dilithium", color: "#FFD93D", icon: "◈" },
];

const SECURITY_EVENTS = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  return {
    day: `D${day}`,
    attacks: Math.floor(30 + Math.random() * 50 + (i > 20 ? 40 : 0) + (i > 25 ? 30 : 0)),
    falsePositives: Math.floor(2 + Math.random() * 8),
  };
});

function scoreColor(score: number) {
  if (score > 0.9) return "#00D4AA";
  if (score > 0.8) return "#FFD93D";
  return "#FF6B6B";
}

function ShieldIcon() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-36">
        {/* Outer shield */}
        <div className="absolute inset-0 rounded-t-[50%] rounded-b-[30%] border-2 border-[#00D4AA40]" style={{ background: "linear-gradient(180deg, rgba(0,212,170,0.08) 0%, rgba(0,212,170,0.02) 100%)" }} />
        {/* Inner shield */}
        <div className="absolute inset-[6px] rounded-t-[48%] rounded-b-[28%] border border-[#00D4AA25]" style={{ background: "linear-gradient(180deg, rgba(0,212,170,0.05) 0%, transparent 100%)" }} />
        {/* Lock icon center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-8 h-6 border-2 border-[#00D4AA] rounded-t-full border-b-0 mb-[-2px]" />
            <div className="w-12 h-10 bg-[#00D4AA20] border-2 border-[#00D4AA] rounded-md flex items-center justify-center">
              <div className="w-2 h-3 bg-[#00D4AA] rounded-sm" />
            </div>
          </div>
        </div>
        {/* Corner accents */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#00D4AA60] rounded" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#00D4AA30] rounded" />
        {/* Pulse rings */}
        <motion.div
          className="absolute inset-[-8px] rounded-t-[55%] rounded-b-[35%] border border-[#00D4AA15]"
          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>
      <p className="text-[#00D4AA] text-xs font-bold mt-2 tracking-wider">POST-QUANTUM SECURE</p>
      <p className="text-[#4a5568] text-[10px]">ML-DSA-87 · CRYSTALS-Dilithium Level 5</p>
    </div>
  );
}

export function SecurityPage() {
  const totalMatches = CRISPR_SIGNATURES.reduce((s, c) => s + c.matches, 0);

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SECURITY_KPIS.map((kpi, i) => (
          <motion.div key={kpi.label} variants={itemVariants}>
            <div className="glass-card p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                style={{ background: `${kpi.color}18`, color: kpi.color }}>
                {kpi.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[#8b95a5] text-xs font-medium uppercase tracking-wider">{kpi.label}</p>
                <p className="text-[#e8ecf1] text-lg font-bold font-mono mt-0.5">{kpi.value}</p>
                <p className="text-[#4a5568] text-xs mt-0.5">{kpi.sub}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── 8-Component Living Security ── */}
      <motion.div variants={fadeScale}>
        <h2 className="text-[#e8ecf1] text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#00D4AA] rounded-full" />8-Component Living Security
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {LIVING_SECURITY.map((comp, i) => {
            const sc = scoreColor(comp.score);
            return (
              <motion.div key={comp.name} variants={itemVariants}>
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                      style={{ background: `${sc}18`, color: sc, border: `1px solid ${sc}30` }}>
                      {comp.icon.slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[#e8ecf1] text-xs font-semibold truncate">{comp.name}</p>
                      <div className="flex items-center gap-1.5">
                        <Badge className="text-[9px] px-1 py-0 h-4 font-bold border-0"
                          style={{ background: comp.status === "active" ? "#00D4AA20" : "#FFD93D20", color: comp.status === "active" ? "#00D4AA" : "#FFD93D" }}>
                          {comp.status.toUpperCase()}
                        </Badge>
                        <span className="text-xs font-mono font-bold" style={{ color: sc }}>{comp.score.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[#4a5568] text-[10px] mb-2">{comp.description}</p>
                  <div className="w-full h-1 bg-[#0e1019] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: sc }}
                      initial={{ width: 0 }}
                      animate={{ width: `${comp.score * 100}%` }}
                      transition={{ duration: 0.7, delay: i * 0.06 }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── CRISPR + Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CRISPR Signatures */}
        <motion.div variants={fadeScale}>
          <div className="glass-card p-6">
            <h3 className="text-[#e8ecf1] text-sm font-semibold mb-4 flex items-center justify-between">
              <span>CRISPR Attack Signatures</span>
              <span className="text-[#4a5568] text-xs font-normal">{totalMatches} matches</span>
            </h3>
            <ScrollArea className="h-[380px] pr-2">
              <div className="space-y-2">
                {CRISPR_SIGNATURES.map((sig) => {
                  const isCritical = sig.severity === "critical";
                  return (
                    <div
                      key={sig.name}
                      className="p-3 rounded-lg border transition-colors"
                      style={{
                        background: isCritical ? "rgba(255,107,107,0.04)" : "transparent",
                        borderColor: isCritical ? "rgba(255,107,107,0.15)" : "rgba(255,255,255,0.04)",
                        borderLeftWidth: 3,
                        borderLeftColor: SEVERITY_COLORS[sig.severity],
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#e8ecf1] text-xs font-mono font-semibold">{sig.name}</span>
                        <Badge className="text-[9px] px-1.5 py-0 h-4 font-bold border-0"
                          style={{ background: `${SEVERITY_COLORS[sig.severity]}20`, color: SEVERITY_COLORS[sig.severity] }}>
                          {sig.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-[#4a5568] text-[10px] mb-1.5">{sig.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[#8b95a5] text-[10px] font-mono">{sig.matches} matches</span>
                        <span className="text-[#4a5568] text-[10px]">{sig.lastTriggered}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </motion.div>

        {/* Security Events Chart */}
        <motion.div variants={fadeScale}>
          <div className="glass-card p-6">
            <h3 className="text-[#e8ecf1] text-sm font-semibold mb-4">Security Events (30d)</h3>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={SECURITY_EVENTS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1f2b" />
                <XAxis dataKey="day" tick={{ fill: "#4a5568", fontSize: 10 }} axisLine={{ stroke: "#1a1f2b" }} interval={4} />
                <YAxis tick={{ fill: "#4a5568", fontSize: 10 }} axisLine={{ stroke: "#1a1f2b" }} />
                <Tooltip content={<DarkTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="attacks" name="Attacks Intercepted" stroke="#FF6B6B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="falsePositives" name="False Positives" stroke="#FFD93D" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* ── Post-Quantum Cryptography ── */}
      <motion.div variants={fadeScale}>
        <div className="glass-card p-6">
          <h3 className="text-[#e8ecf1] text-sm font-semibold mb-6 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#FFD93D] rounded-full" /> Post-Quantum Cryptography
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-10">
            <ShieldIcon />
            <div className="space-y-3 flex-1 max-w-md">
              {[
                { label: "Algorithm", value: "ML-DSA-87 (CRYSTALS-Dilithium)", color: "#00D4AA" },
                { label: "Security Level", value: "NIST Level 5 (Highest)", color: "#FFD93D" },
                { label: "Key Size", value: "2,592 bytes (public) / 4,896 bytes (secret)", color: "#7B61FF" },
                { label: "Signature Size", value: "3,309 bytes", color: "#FF8C42" },
                { label: "Quantum Resistance", value: "Proven against Shor's & Grover's algorithms", color: "#00D4AA" },
                { label: "Implementation", value: "Production · All oracle contracts", color: "#e8ecf1" },
              ].map((item, i) => (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="text-[#8b95a5] text-xs w-36 shrink-0 pt-0.5">{item.label}</span>
                  <span className="text-xs font-medium" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 4. ANIMA PAGE
// ═══════════════════════════════════════════════════════════════════════

const LANGUAGES = [
  { code: "EN", name: "English", acc: 97.2 }, { code: "ZH", name: "Chinese", acc: 94.1 },
  { code: "JA", name: "Japanese", acc: 93.8 }, { code: "KO", name: "Korean", acc: 92.5 },
  { code: "AR", name: "Arabic", acc: 91.3 }, { code: "HI", name: "Hindi", acc: 90.8 },
  { code: "ES", name: "Spanish", acc: 96.1 }, { code: "FR", name: "French", acc: 95.7 },
  { code: "DE", name: "German", acc: 95.2 }, { code: "RU", name: "Russian", acc: 93.4 },
  { code: "PT", name: "Portuguese", acc: 94.8 }, { code: "IT", name: "Italian", acc: 95.0 },
  { code: "TR", name: "Turkish", acc: 89.2 }, { code: "VI", name: "Vietnamese", acc: 88.7 },
  { code: "TH", name: "Thai", acc: 87.1 }, { code: "ID", name: "Indonesian", acc: 91.0 },
  { code: "MS", name: "Malay", acc: 89.5 }, { code: "PL", name: "Polish", acc: 90.3 },
  { code: "NL", name: "Dutch", acc: 94.2 }, { code: "SV", name: "Swedish", acc: 93.9 },
  { code: "DA", name: "Danish", acc: 93.1 }, { code: "FI", name: "Finnish", acc: 92.8 },
  { code: "NO", name: "Norwegian", acc: 93.6 }, { code: "UK", name: "Ukrainian", acc: 89.8 },
  { code: "CS", name: "Czech", acc: 90.1 }, { code: "RO", name: "Romanian", acc: 88.9 },
  { code: "EL", name: "Greek", acc: 87.4 }, { code: "HE", name: "Hebrew", acc: 86.2 },
  { code: "BN", name: "Bengali", acc: 85.7 }, { code: "TA", name: "Tamil", acc: 84.3 },
  { code: "TL", name: "Tagalog", acc: 86.8 }, { code: "HU", name: "Hungarian", acc: 89.4 },
  { code: "FA", name: "Persian", acc: 87.9 }, { code: "SW", name: "Swahili", acc: 82.1 },
  { code: "UR", name: "Urdu", acc: 85.3 }, { code: "TE", name: "Telugu", acc: 83.7 },
  { code: "ML", name: "Malayalam", acc: 84.1 }, { code: "KN", name: "Kannada", acc: 82.8 },
  { code: "MR", name: "Marathi", acc: 83.4 }, { code: "GU", name: "Gujarati", acc: 82.5 },
  { code: "PA", name: "Punjabi", acc: 81.9 }, { code: "OR", name: "Odia", acc: 80.2 },
  { code: "MY", name: "Myanmar", acc: 78.4 }, { code: "KM", name: "Khmer", acc: 77.8 },
  { code: "LO", name: "Lao", acc: 76.3 }, { code: "SI", name: "Sinhala", acc: 79.1 },
  { code: "NE", name: "Nepali", acc: 80.7 }, { code: "PS", name: "Pashto", acc: 78.9 },
  { code: "AZ", name: "Azerbaijani", acc: 82.3 }, { code: "UZ", name: "Uzbek", acc: 79.6 },
  { code: "KA", name: "Georgian", acc: 80.1 }, { code: "HY", name: "Armenian", acc: 79.8 },
  { code: "EU", name: "Basque", acc: 81.5 }, { code: "CA", name: "Catalan", acc: 92.1 },
  { code: "HR", name: "Croatian", acc: 90.6 }, { code: "SR", name: "Serbian", acc: 89.7 },
  { code: "BG", name: "Bulgarian", acc: 88.3 }, { code: "SK", name: "Slovak", acc: 90.0 },
  { code: "SL", name: "Slovenian", acc: 89.1 }, { code: "LT", name: "Lithuanian", acc: 88.5 },
  { code: "LV", name: "Latvian", acc: 87.6 }, { code: "ET", name: "Estonian", acc: 88.0 },
  { code: "IW", name: "Hebrew (ALT)", acc: 86.2 }, { code: "AF", name: "Afrikaans", acc: 84.7 },
];

function langColor(acc: number) {
  if (acc >= 94) return "#00D4AA";
  if (acc >= 88) return "#7B61FF";
  if (acc >= 82) return "#FFD93D";
  return "#FF8C42";
}

const PATTERNS = [
  { name: "Pump & Dump", count: 2847, severity: "high" },
  { name: "Rug Pull", count: 891, severity: "critical" },
  { name: "Flash Loan Attack", count: 234, severity: "critical" },
  { name: "Wash Trading", count: 5623, severity: "medium" },
  { name: "Front-Running", count: 12847, severity: "medium" },
  { name: "Governance Attack", count: 56, severity: "critical" },
  { name: "Oracle Manipulation", count: 123, severity: "high" },
  { name: "Bridge Exploit", count: 18, severity: "critical" },
  { name: "Honeypot Detection", count: 423, severity: "high" },
  { name: "Phishing Pattern", count: 8921, severity: "high" },
];

const CROSS_LANG_RADAR = [
  { family: "Germanic", score: 0.89 },
  { family: "Romance", score: 0.87 },
  { family: "Slavic", score: 0.82 },
  { family: "Sino-Tibetan", score: 0.78 },
  { family: "Japonic", score: 0.76 },
  { family: "Koreanic", score: 0.74 },
  { family: "Dravidian", score: 0.71 },
  { family: "Arabic", score: 0.69 },
];

const SENTIMENT_DATA = Array.from({ length: 24 }, (_, i) => {
  const hour = `${i.toString().padStart(2, "0")}:00`;
  return {
    hour,
    Ethereum: 0.3 + Math.sin(i / 4) * 0.3 + Math.random() * 0.1,
    Solana: 0.25 + Math.sin(i / 3.5 + 1) * 0.25 + Math.random() * 0.1,
    Arbitrum: 0.2 + Math.sin(i / 5 + 2) * 0.2 + Math.random() * 0.08,
  };
});

export function AnimaPage() {
  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      {/* ── ANIMA Stream Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {ANIMA_STREAMS.map((stream, i) => {
          const isActive = stream.status === "active";
          const dotColor = isActive ? "#00D4AA" : "#FFD93D";
          return (
            <motion.div key={stream.id} variants={itemVariants}>
              <div className="glass-card p-5 relative overflow-hidden">
                {/* Pulsing dot */}
                <div className="absolute top-4 right-4">
                  <span className="relative flex h-2.5 w-2.5">
                    <motion.span
                      className="absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ background: dotColor }}
                      animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: dotColor }} />
                  </span>
                </div>

                <h3 className="text-[#e8ecf1] text-sm font-bold mb-1 pr-6">{stream.name}</h3>
                <Badge className="text-[9px] px-1.5 py-0 h-4 font-bold border-0 mb-3"
                  style={{ background: isActive ? "#00D4AA20" : "#FFD93D20", color: isActive ? "#00D4AA" : "#FFD93D" }}>
                  {stream.status.toUpperCase()}
                </Badge>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    { label: "Languages", value: stream.languages },
                    { label: "Patterns", value: stream.patterns },
                    { label: "Accuracy", value: `${stream.accuracy}%` },
                    { label: "Latency", value: stream.latency },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-[#4a5568] text-[10px]">{stat.label}</p>
                      <p className="text-[#e8ecf1] text-xs font-mono font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── 54-Language Coverage ── */}
      <motion.div variants={fadeScale}>
        <div className="glass-card p-6">
          <h3 className="text-[#e8ecf1] text-sm font-semibold mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#7B61FF] rounded-full" />54-Language Coverage
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {LANGUAGES.map((lang, i) => (
              <motion.span
                key={lang.code}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.015, duration: 0.2 }}
                className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold cursor-default transition-all hover:scale-105"
                style={{
                  background: `${langColor(lang.acc)}15`,
                  color: langColor(lang.acc),
                  border: `1px solid ${langColor(lang.acc)}25`,
                }}
                title={`${lang.name} — ${lang.acc}% accuracy`}
              >
                {lang.code}
              </motion.span>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px]">
            {[
              { color: "#00D4AA", label: "≥94%" },
              { color: "#7B61FF", label: "88-93%" },
              { color: "#FFD93D", label: "82-87%" },
              { color: "#FF8C42", label: "<82%" },
            ].map((l) => (
              <span key={l.label} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm" style={{ background: l.color }} />
                <span className="text-[#4a5568]">{l.label}</span>
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Pattern Detection + Radar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 30+ Pattern Detection */}
        <motion.div variants={fadeScale}>
          <div className="glass-card p-6">
            <h3 className="text-[#e8ecf1] text-sm font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#FF6B6B] rounded-full" />30+ Pattern Detection
            </h3>
            <ScrollArea className="h-[360px] pr-2">
              <div className="space-y-1.5">
                {PATTERNS.map((pat, i) => (
                  <motion.div
                    key={pat.name}
                    variants={itemVariants}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{ background: `${SEVERITY_COLORS[pat.severity]}18`, color: SEVERITY_COLORS[pat.severity] }}>
                        {i + 1}
                      </div>
                      <span className="text-[#e8ecf1] text-xs font-medium truncate">{pat.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[#8b95a5] text-xs font-mono">{pat.count.toLocaleString()}</span>
                      <Badge className="text-[9px] px-1.5 py-0 h-4 font-bold border-0 min-w-[52px] text-center"
                        style={{ background: `${SEVERITY_COLORS[pat.severity]}20`, color: SEVERITY_COLORS[pat.severity] }}>
                        {pat.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </motion.div>

        {/* Cross-Language Agreement Radar */}
        <motion.div variants={fadeScale}>
          <div className="glass-card p-6">
            <h3 className="text-[#e8ecf1] text-sm font-semibold mb-4">Cross-Language Agreement</h3>
            <ResponsiveContainer width="100%" height={340}>
              <RadarChart data={CROSS_LANG_RADAR} cx="50%" cy="50%" outerRadius="65%">
                <PolarGrid stroke="#1a1f2b" />
                <PolarAngleAxis dataKey="family" tick={{ fill: "#8b95a5", fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 1]} tick={{ fill: "#4a5568", fontSize: 9 }} axisLine={false} />
                <Radar name="Agreement" dataKey="score" stroke="#7B61FF" fill="#7B61FF" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip content={<DarkTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
            <p className="text-[#4a5568] text-[10px] text-center mt-2">Agreement score (CA) across language families — target &gt; 0.65</p>
          </div>
        </motion.div>
      </div>

      {/* ── Sentiment Flow ── */}
      <motion.div variants={fadeScale}>
        <div className="glass-card p-6">
          <h3 className="text-[#e8ecf1] text-sm font-semibold mb-4">Sentiment Flow (24h)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={SENTIMENT_DATA}>
              <defs>
                <linearGradient id="sent-eth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#627EEA" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#627EEA" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sent-sol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9945FF" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#9945FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sent-arb" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#28A0F0" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#28A0F0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1f2b" />
              <XAxis dataKey="hour" tick={{ fill: "#4a5568", fontSize: 10 }} axisLine={{ stroke: "#1a1f2b" }} interval={3} />
              <YAxis domain={[0, 1]} tick={{ fill: "#4a5568", fontSize: 10 }} axisLine={{ stroke: "#1a1f2b" }} />
              <Tooltip content={<DarkTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="Ethereum" stroke="#627EEA" fill="url(#sent-eth)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="Solana" stroke="#9945FF" fill="url(#sent-sol)" strokeWidth={1.5} dot={false} />
              <Area type="monotone" dataKey="Arbitrum" stroke="#28A0F0" fill="url(#sent-arb)" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );
}