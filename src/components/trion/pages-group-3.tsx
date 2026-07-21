"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  Check,
  X,
  Search,
  Activity,
  Radio,
  Database,
  Cpu,
  HardDrive,
  Globe,
  Shield,
  ArrowRight,
  Link2,
  TrendingUp,
  AlertTriangle,
  Eye,
  Gavel,
  Users,
  FileCheck,
  Layers,
  Code2,
  Lock,
  Box,
  Zap,
  Circle,
} from "lucide-react";
import {
  RELAYER_STATUS,
  GOVERNANCE_ITEMS,
  FALSIFIABILITY,
  BEO_ENTITIES,
  DEPLOYMENTS,
  CHAINS,
  VM_COLORS,
  type RelayerInfo,
  type GovernanceItem,
  type FalsifiabilityItem,
  type BEOEntity,
  type ContractInfo,
} from "@/lib/trion-data";

// ─── Shared Animation Variants ──────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const RELAYER_COLORS = [
  "#00D4AA",
  "#7B61FF",
  "#FF8C42",
  "#FFD93D",
  "#627EEA",
  "#FF6B6B",
  "#6FBCF0",
];

// ─── Mini Sparkline SVG ─────────────────────────────────────────
function MiniSparkline({
  data,
  color = "#00D4AA",
  width = 120,
  height = 32,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#grad-${color.slice(1)})`}
      />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

// ─── Status Dot ──────────────────────────────────────────────────
function StatusDot({ color = "#00D4AA" }: { color?: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span
        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative inline-flex h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 1. RELAYERS PAGE
// ═══════════════════════════════════════════════════════════════════
export function RelayersPage() {
  const relayerChartData = [
    { hour: "00", evm: 4200, extended: 2400, native: 810, og_da: 320, og_compute: 180 },
    { hour: "04", evm: 3100, extended: 1800, native: 620, og_da: 280, og_compute: 150 },
    { hour: "08", evm: 5600, extended: 3200, native: 920, og_da: 410, og_compute: 250 },
    { hour: "12", evm: 8200, extended: 4800, native: 1340, og_da: 580, og_compute: 380 },
    { hour: "16", evm: 7400, extended: 4200, native: 1180, og_da: 510, og_compute: 340 },
    { hour: "20", evm: 6100, extended: 3600, native: 980, og_da: 440, og_compute: 280 },
  ];

  const ogIntegrations = [
    { name: "Storage", status: "active", icon: HardDrive, detail: "2.4 TB stored", color: "#00D4AA" },
    { name: "DA", status: "active", icon: Database, detail: "12,847 blobs/day", color: "#7B61FF" },
    { name: "Compute", status: "active", icon: Cpu, detail: "847 req/min", color: "#FF8C42" },
    { name: "KV", status: "active", icon: Layers, detail: "4.2K ops/min", color: "#FFD93D" },
    { name: "Chain", status: "active", icon: Globe, detail: "Block 892,412", color: "#627EEA" },
  ];

  const architectureSteps = [
    { name: "Chain Indexers", lang: "Rust", icon: Code2, color: "#CE422B" },
    { name: "Core Engine", lang: "Python", icon: Activity, color: "#3776AB" },
    { name: "Relayers", lang: "JavaScript", icon: Radio, color: "#F7DF1E" },
    { name: "Smart Contracts", lang: "Solidity", icon: Lock, color: "#627EEA" },
    { name: "0G Storage/DA", lang: "Go", icon: Database, color: "#00ADD8" },
  ];

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Section Header */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-[#e8ecf1] flex items-center gap-3">
          <Radio className="h-6 w-6 text-[#00D4AA]" />
          Relayer Infrastructure
        </h2>
        <p className="text-sm text-[#8b95a5] mt-1">
          Real-time cross-chain signal relay and 0G integration status
        </p>
      </motion.div>

      {/* 7 Relayer Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RELAYER_STATUS.map((r: RelayerInfo, idx: number) => (
          <motion.div key={r.name} variants={itemVariants}>
            <Card className="glass-card overflow-hidden relative">
              {/* Left gradient border */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px]"
                style={{
                  background: `linear-gradient(to bottom, ${RELAYER_COLORS[idx]}, transparent)`,
                }}
              />
              <CardContent className="p-4 pl-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <StatusDot color={RELAYER_COLORS[idx]} />
                    <span className="text-sm font-semibold text-[#e8ecf1]">
                      {r.name}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase tracking-wider"
                    style={{
                      borderColor: "rgba(0,212,170,0.3)",
                      color: "#00D4AA",
                    }}
                  >
                    {r.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8b95a5]">Chains</span>
                    <span className="text-[#e8ecf1] font-medium tabular-nums">
                      {r.chains}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b95a5]">Throughput</span>
                    <span className="text-[#e8ecf1] font-medium tabular-nums">
                      {r.throughput}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b95a5]">Last TX</span>
                    <span className="text-[#e8ecf1] tabular-nums">{r.lastTx}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b95a5]">Uptime</span>
                    <span
                      className="font-medium tabular-nums"
                      style={{ color: "#00D4AA" }}
                    >
                      {r.uptime}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Architecture Flow Diagram */}
      <motion.div variants={itemVariants}>
        <h3 className="text-sm font-semibold text-[#8b95a5] uppercase tracking-wider mb-3">
          Relayer Architecture
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {architectureSteps.map((step, idx) => (
            <div key={step.name} className="flex items-center gap-2">
              <Card className="glass-card p-3 min-w-[140px]">
                <div className="flex items-center gap-2 mb-1">
                  <step.icon className="h-3.5 w-3.5" style={{ color: step.color }} />
                  <span className="text-xs font-semibold text-[#e8ecf1]">
                    {step.name}
                  </span>
                </div>
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `${step.color}18`,
                    color: step.color,
                  }}
                >
                  {step.lang}
                </span>
              </Card>
              {idx < architectureSteps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-[#4a5568] flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stacked Bar Chart: Signals Published (24h) */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#e8ecf1]">
              Signals Published by Relayer (24h)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={relayerChartData}
                  margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1a1f2b"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="hour"
                    tick={{ fill: "#4a5568", fontSize: 11 }}
                    axisLine={{ stroke: "#1a1f2b" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#4a5568", fontSize: 11 }}
                    axisLine={{ stroke: "#1a1f2b" }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#161b25",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      color: "#e8ecf1",
                      fontSize: 12,
                    }}
                    itemStyle={{ color: "#e8ecf1" }}
                    labelStyle={{ color: "#8b95a5" }}
                  />
                  <Bar dataKey="evm" stackId="a" fill="#00D4AA" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="extended" stackId="a" fill="#7B61FF" />
                  <Bar dataKey="native" stackId="a" fill="#FF8C42" />
                  <Bar dataKey="og_da" stackId="a" fill="#FFD93D" />
                  <Bar dataKey="og_compute" stackId="a" fill="#627EEA" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-[10px] text-[#8b95a5]">
              {[
                { label: "EVM", color: "#00D4AA" },
                { label: "Extended", color: "#7B61FF" },
                { label: "Native VM", color: "#FF8C42" },
                { label: "0G DA", color: "#FFD93D" },
                { label: "0G Compute", color: "#627EEA" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: l.color }}
                  />
                  {l.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 0G Integration Status */}
      <motion.div variants={itemVariants}>
        <h3 className="text-sm font-semibold text-[#8b95a5] uppercase tracking-wider mb-3">
          0G Integration Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {ogIntegrations.map((og) => (
            <Card key={og.name} className="glass-card">
              <CardContent className="p-4 text-center">
                <og.icon className="h-5 w-5 mx-auto mb-2" style={{ color: og.color }} />
                <div className="text-xs font-semibold text-[#e8ecf1] mb-1">
                  {og.name}
                </div>
                <div className="text-[10px] text-[#8b95a5] mb-2">{og.detail}</div>
                <Badge
                  className="text-[9px] uppercase tracking-wider"
                  style={{
                    backgroundColor: `${og.color}20`,
                    color: og.color,
                    border: `1px solid ${og.color}30`,
                  }}
                >
                  {og.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 2. GOVERNANCE PAGE
// ═══════════════════════════════════════════════════════════════════
export function GovernancePage() {
  const kpis = [
    { label: "Active Proposals", value: "3", icon: Gavel, color: "#00D4AA" },
    {
      label: "AWA Status",
      value: "3/4 MET",
      icon: FileCheck,
      color: "#7B61FF",
    },
    { label: "Validator HHI", value: "1,247", icon: Users, color: "#FFD93D" },
    {
      label: "Total Staked",
      value: "847K TRION",
      icon: Shield,
      color: "#FF8C42",
    },
  ];

  const statusColor = (s: string) => {
    if (s === "active") return { bg: "rgba(0,212,212,0.12)", color: "#00D4DD" };
    if (s === "closed") return { bg: "rgba(107,114,128,0.15)", color: "#8b95a5" };
    if (s === "queued") return { bg: "rgba(255,217,61,0.12)", color: "#FFD93D" };
    return { bg: "rgba(107,114,128,0.15)", color: "#8b95a5" };
  };

  const fStatusColor = (s: string) => {
    if (s === "PASSING") return { bg: "rgba(0,212,170,0.12)", color: "#00D4AA" };
    if (s === "MONITORING") return { bg: "rgba(255,217,61,0.12)", color: "#FFD93D" };
    if (s === "CONJECTURE") return { bg: "rgba(123,97,255,0.12)", color: "#7B61FF" };
    return { bg: "rgba(255,107,107,0.12)", color: "#FF6B6B" };
  };

  const continents = [
    { name: "North America", validators: 8, color: "#00D4AA" },
    { name: "Europe", validators: 7, color: "#7B61FF" },
    { name: "Asia", validators: 5, color: "#FF8C42" },
    { name: "South America", validators: 3, color: "#FFD93D" },
  ];

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-[#e8ecf1] flex items-center gap-3">
          <Gavel className="h-6 w-6 text-[#7B61FF]" />
          Governance & Falsifiability
        </h2>
        <p className="text-sm text-[#8b95a5] mt-1">
          Protocol governance, falsifiability tests, and validator diversity
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <motion.div key={kpi.label} variants={itemVariants}>
            <Card className="glass-card">
              <CardContent className="p-4">
                <kpi.icon
                  className="h-4 w-4 mb-2"
                  style={{ color: kpi.color }}
                />
                <div className="text-2xl font-bold text-[#e8ecf1] tabular-nums">
                  {kpi.value}
                </div>
                <div className="text-xs text-[#8b95a5] mt-1">{kpi.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Governance Proposals */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#e8ecf1]">
              Governance Proposals
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="max-h-[360px]">
              <div className="space-y-3 pr-3">
                {GOVERNANCE_ITEMS.map((g: GovernanceItem) => {
                  const sc = statusColor(g.status);
                  const ratio = Math.min(g.votes / g.quorum, 1);
                  return (
                    <div
                      key={g.id}
                      className="p-3 rounded-lg bg-[rgba(22,27,37,0.5)] border border-[rgba(255,255,255,0.04)]"
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-xs font-mono text-[#4a5568]">
                          {g.id}
                        </span>
                        <Badge
                          className="text-[10px] uppercase tracking-wider"
                          style={{
                            backgroundColor: sc.bg,
                            color: sc.color,
                            border: "none",
                          }}
                        >
                          {g.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                          style={{ borderColor: "rgba(255,255,255,0.08)", color: "#8b95a5" }}
                        >
                          {g.type}
                        </Badge>
                        <span className="ml-auto text-[10px] text-[#4a5568] tabular-nums">
                          {g.timeLeft}
                        </span>
                      </div>
                      <p className="text-xs text-[#e8ecf1] mb-2 leading-relaxed">
                        {g.title}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-[rgba(255,255,255,0.06)]">
                          <div
                            className="h-full rounded-full progress-bar"
                            style={{
                              width: `${ratio * 100}%`,
                              backgroundColor: "#00D4AA",
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-[#8b95a5] tabular-nums whitespace-nowrap">
                          {g.votes.toLocaleString()} / {g.quorum.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* Falsifiability Registry Table */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#e8ecf1]">
              Falsifiability Registry (F1–F15)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow className="border-[rgba(255,255,255,0.06)] hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-wider text-[#4a5568]">
                    ID
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-[#4a5568]">
                    Description
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-[#4a5568]">
                    Status
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-[#4a5568] text-right">
                    Metric
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-[#4a5568] text-right">
                    Threshold
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {FALSIFIABILITY.map((f: FalsifiabilityItem) => {
                  const fc = fStatusColor(f.status);
                  return (
                    <TableRow
                      key={f.id}
                      className="border-[rgba(255,255,255,0.04)] hover:bg-[rgba(22,27,37,0.4)]"
                    >
                      <TableCell className="text-xs font-mono text-[#7B61FF]">
                        {f.id}
                      </TableCell>
                      <TableCell className="text-xs text-[#8b95a5] max-w-[300px]">
                        {f.description}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="text-[10px] uppercase tracking-wider"
                          style={{
                            backgroundColor: fc.bg,
                            color: fc.color,
                            border: "none",
                          }}
                        >
                          {f.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-[#e8ecf1] text-right tabular-nums font-medium">
                        {f.metric}
                      </TableCell>
                      <TableCell className="text-xs text-[#4a5568] text-right tabular-nums">
                        {f.threshold}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Validator Diversity */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#e8ecf1]">
              Validator Diversity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {continents.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(22,27,37,0.5)] border border-[rgba(255,255,255,0.04)]"
                >
                  <span
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <div>
                    <div className="text-xs font-medium text-[#e8ecf1]">
                      {c.name}
                    </div>
                    <div className="text-[10px] text-[#8b95a5] tabular-nums">
                      {c.validators} validators
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* DW-BFT Consensus */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#e8ecf1]">
              DW-BFT Consensus
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <p className="text-xs text-[#8b95a5] leading-relaxed">
              Diversity-Weighted Byzantine Fault Tolerance uses geographic and
              behavioral decorrelation to ensure no single entity can dominate
              consensus. Each validator&apos;s weight is inversely proportional to
              their correlation with the mean validator behavior.
            </p>
            <div className="p-3 rounded-lg bg-[rgba(22,27,37,0.6)] border border-[rgba(255,255,255,0.06)]">
              <div className="text-xs font-mono text-[#00D4AA] text-center mb-1">
                d<sub>j</sub> = 1 &minus; corr(M<sub>j</sub>, M&#x0304;)
              </div>
              <p className="text-[10px] text-[#4a5568] text-center">
                Where M<sub>j</sub> is the behavior matrix of validator j, and
                M&#x0304; is the mean behavior across all validators.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[rgba(0,212,170,0.06)] border border-[rgba(0,212,170,0.15)]">
                <div className="text-[#00D4AA] font-semibold mb-1">
                  HHI &lt; 1,500
                </div>
                <div className="text-[#8b95a5]">Healthy — diverse validator set</div>
              </div>
              <div className="p-3 rounded-lg bg-[rgba(255,217,61,0.06)] border border-[rgba(255,217,61,0.15)]">
                <div className="text-[#FFD93D] font-semibold mb-1">
                  HHI 1,500–3,000
                </div>
                <div className="text-[#8b95a5]">Moderate — monitoring recommended</div>
              </div>
              <div className="p-3 rounded-lg bg-[rgba(255,107,107,0.06)] border border-[rgba(255,107,107,0.15)]">
                <div className="text-[#FF6B6B] font-semibold mb-1">
                  HHI &gt; 3,000
                </div>
                <div className="text-[#8b95a5]">Danger — emergency response</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 3. CONTRACTS PAGE
// ═══════════════════════════════════════════════════════════════════
export function ContractsPage() {
  const CONTRACTS: ContractInfo[] = [
    { name: "TRIONOracle.sol", language: "Solidity", chain: "Ethereum", status: "deployed", address: "0xA85B...4199b", verified: true, linesOfCode: 487, functions: 23, lastInteraction: "12s ago", type: "Oracle" },
    { name: "TRIONOracleV3.sol", language: "Solidity", chain: "Arbitrum", status: "deployed", address: "0x0471...0A87C", verified: true, linesOfCode: 623, functions: 31, lastInteraction: "8s ago", type: "Oracle" },
    { name: "TRIONFirewall.sol", language: "Solidity", chain: "Ethereum", status: "deployed", address: "0xBe00...48F0", verified: true, linesOfCode: 342, functions: 18, lastInteraction: "3s ago", type: "Firewall" },
    { name: "TRIONExecutionGate.sol", language: "Solidity", chain: "0G Chain", status: "deployed", address: "0x1d12...94237", verified: true, linesOfCode: 891, functions: 42, lastInteraction: "1s ago", type: "Execution" },
    { name: "TRIONProtectedVault.sol", language: "Solidity", chain: "Ethereum", status: "deployed", address: "0x3a7B...e91F", verified: true, linesOfCode: 256, functions: 15, lastInteraction: "45s ago", type: "Vault" },
    { name: "ConfidentialCohVault.sol", language: "Solidity", chain: "0G Chain", status: "deployed", address: "0x8Fc2...1a4B", verified: true, linesOfCode: 412, functions: 22, lastInteraction: "2m ago", type: "Vault" },
    { name: "AkashicProof.sol", language: "Solidity", chain: "BNB Chain", status: "deployed", address: "0x12D4...fE02", verified: true, linesOfCode: 178, functions: 12, lastInteraction: "5m ago", type: "Storage" },
    { name: "TRIONStaking.vy", language: "Vyper", chain: "Ethereum", status: "deployed", address: "0x5149...dC5e", verified: true, linesOfCode: 234, functions: 14, lastInteraction: "30s ago", type: "Staking" },
    { name: "TRIONToken.vy", language: "Vyper", chain: "Ethereum", status: "deployed", address: "0x4eF2...cE1A", verified: true, linesOfCode: 156, functions: 9, lastInteraction: "15s ago", type: "Token" },
    { name: "TRIONOracle.cairo", language: "Cairo", chain: "StarkNet", status: "deployed", address: "0x0abc...7890", verified: false, linesOfCode: 389, functions: 20, lastInteraction: "1m ago", type: "Oracle" },
    { name: "BEOAttestation.cairo", language: "Cairo", chain: "StarkNet", status: "deployed", address: "0x1def...4567", verified: false, linesOfCode: 267, functions: 16, lastInteraction: "3m ago", type: "Attestation" },
    { name: "BTCFiGuard.cairo", language: "Cairo", chain: "StarkNet", status: "deployed", address: "0x2ghi...3456", verified: false, linesOfCode: 198, functions: 11, lastInteraction: "10m ago", type: "Security" },
    { name: "trion_gate.fc", language: "FunC", chain: "TON", status: "deployed", address: "EQC...abc", verified: false, linesOfCode: 312, functions: 18, lastInteraction: "2m ago", type: "Gate" },
    { name: "trion_intent.fc", language: "FunC", chain: "TON", status: "deployed", address: "EQD...def", verified: false, linesOfCode: 245, functions: 14, lastInteraction: "5m ago", type: "Intent" },
    { name: "trion_liquidity.fc", language: "FunC", chain: "TON", status: "deployed", address: "EQE...ghi", verified: false, linesOfCode: 189, functions: 12, lastInteraction: "8m ago", type: "Liquidity" },
    { name: "trion_oracle.fc", language: "FunC", chain: "TON", status: "deploying", address: "—", verified: false, linesOfCode: 278, functions: 15, lastInteraction: "—", type: "Oracle" },
    { name: "TRIONOracle.near", language: "Rust/NEAR", chain: "NEAR", status: "deployed", address: "trion.oracle.near", verified: true, linesOfCode: 523, functions: 28, lastInteraction: "30s ago", type: "Oracle" },
    { name: "TRIONVault.near", language: "Rust/NEAR", chain: "NEAR", status: "deployed", address: "trion.vault.near", verified: true, linesOfCode: 341, functions: 19, lastInteraction: "2m ago", type: "Vault" },
    { name: "trion::oracle", language: "Move/Sui", chain: "Sui", status: "deploying", address: "—", verified: false, linesOfCode: 445, functions: 22, lastInteraction: "—", type: "Oracle" },
    { name: "trion::firewall", language: "Move/Sui", chain: "Sui", status: "auditing", address: "—", verified: false, linesOfCode: 312, functions: 17, lastInteraction: "—", type: "Firewall" },
    { name: "pallet-trion", language: "Rust/Substrate", chain: "Polkadot", status: "auditing", address: "—", verified: false, linesOfCode: 687, functions: 35, lastInteraction: "—", type: "Runtime" },
    { name: "trion-da", language: "CosmWasm", chain: "Cosmos", status: "deployed", address: "cosmos1...trion", verified: true, linesOfCode: 234, functions: 13, lastInteraction: "1m ago", type: "DA" },
    { name: "trion-indexer", language: "Rust", chain: "Multi", status: "deployed", address: "off-chain", verified: true, linesOfCode: 11091, functions: 89, lastInteraction: "1s ago", type: "Indexer" },
    { name: "living_security.py", language: "Python", chain: "Core", status: "deployed", address: "off-chain", verified: true, linesOfCode: 1203, functions: 67, lastInteraction: "1s ago", type: "Security" },
    { name: "signal_factory.py", language: "Python", chain: "Core", status: "deployed", address: "off-chain", verified: true, linesOfCode: 1080, functions: 54, lastInteraction: "1s ago", type: "Signals" },
  ];

  const langColors: Record<string, string> = {
    Solidity: "#627EEA",
    Vyper: "#1A1A2E",
    Cairo: "#7B61FF",
    FunC: "#0088CC",
    "Rust/NEAR": "#CE422B",
    "Rust/Substrate": "#CE422B",
    Rust: "#CE422B",
    Python: "#3776AB",
    "Move/Sui": "#4DDFBA",
    CosmWasm: "#6F7390",
  };

  const statusBadgeStyle = (s: string) => {
    switch (s) {
      case "deployed":
        return { bg: "rgba(0,212,170,0.12)", color: "#00D4AA" };
      case "auditing":
        return { bg: "rgba(255,217,61,0.12)", color: "#FFD93D" };
      case "deploying":
        return { bg: "rgba(98,126,234,0.12)", color: "#627EEA" };
      case "failed":
        return { bg: "rgba(255,107,107,0.12)", color: "#FF6B6B" };
      default:
        return { bg: "rgba(107,114,128,0.15)", color: "#8b95a5" };
    }
  };

  // Language distribution for donut chart
  const langMap: Record<string, number> = {};
  CONTRACTS.forEach((c) => {
    langMap[c.language] = (langMap[c.language] || 0) + 1;
  });
  const langDistData = Object.entries(langMap).map(([name, value]) => ({
    name,
    value,
    color: langColors[name] || "#8b95a5",
  }));

  // Contract types
  const typeMap: Record<string, number> = {};
  CONTRACTS.forEach((c) => {
    typeMap[c.type] = (typeMap[c.type] || 0) + 1;
  });
  const contractTypes = Object.entries(typeMap).sort((a, b) => b[1] - a[1]);

  const totalContracts = CONTRACTS.length;
  const totalLanguages = Object.keys(langMap).length;
  const deployedCount = CONTRACTS.filter((c) => c.status === "deployed").length;
  const totalLines = CONTRACTS.reduce((s, c) => s + c.linesOfCode, 0);

  const kpis = [
    { label: "Total Contracts", value: totalContracts.toString(), icon: Box, color: "#00D4AA" },
    { label: "Languages", value: totalLanguages.toString(), icon: Code2, color: "#7B61FF" },
    { label: "Deployed", value: deployedCount.toString(), icon: Check, color: "#FFD93D" },
    { label: "Total Lines", value: totalLines.toLocaleString(), icon: Layers, color: "#FF8C42" },
  ];

  // Deployment map: which contracts on which chains
  const chainList = [...new Set(CONTRACTS.map((c) => c.chain))];
  const contractNames = CONTRACTS.map((c) => c.name);
  const deployMatrix = CONTRACTS.map((c) => ({
    name: c.name,
    chain: c.chain,
    status: c.status,
  }));

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-[#e8ecf1] flex items-center gap-3">
          <Code2 className="h-6 w-6 text-[#627EEA]" />
          Smart Contracts
        </h2>
        <p className="text-sm text-[#8b95a5] mt-1">
          Multi-language contract deployment across 12+ chains
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <motion.div key={kpi.label} variants={itemVariants}>
            <Card className="glass-card">
              <CardContent className="p-4">
                <kpi.icon
                  className="h-4 w-4 mb-2"
                  style={{ color: kpi.color }}
                />
                <div className="text-2xl font-bold text-[#e8ecf1] tabular-nums">
                  {kpi.value}
                </div>
                <div className="text-xs text-[#8b95a5] mt-1">{kpi.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Contract Table */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#e8ecf1]">
              All Contracts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="max-h-[420px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-[rgba(255,255,255,0.06)] hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase tracking-wider text-[#4a5568]">
                      Contract
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-[#4a5568]">
                      Language
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-[#4a5568]">
                      Chain
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-[#4a5568]">
                      Status
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-[#4a5568] text-right">
                      Functions
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-[#4a5568] text-right">
                      LOC
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-[#4a5568]">
                      Last Interaction
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-[#4a5568] text-center">
                      Verified
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CONTRACTS.map((c: ContractInfo) => {
                    const ss = statusBadgeStyle(c.status);
                    const lc = langColors[c.language] || "#8b95a5";
                    return (
                      <TableRow
                        key={c.name}
                        className="border-[rgba(255,255,255,0.04)] hover:bg-[rgba(22,27,37,0.4)]"
                      >
                        <TableCell className="text-xs font-mono text-[#e8ecf1] max-w-[180px] truncate">
                          {c.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className="text-[10px]"
                            style={{
                              backgroundColor: `${lc}20`,
                              color: lc,
                              border: `1px solid ${lc}30`,
                            }}
                          >
                            {c.language}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-[#8b95a5]">
                          {c.chain}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className="text-[10px] uppercase tracking-wider"
                            style={{ backgroundColor: ss.bg, color: ss.color, border: "none" }}
                          >
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-[#e8ecf1] text-right tabular-nums">
                          {c.functions}
                        </TableCell>
                        <TableCell className="text-xs text-[#8b95a5] text-right tabular-nums">
                          {c.linesOfCode.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs text-[#4a5568] tabular-nums">
                          {c.lastInteraction}
                        </TableCell>
                        <TableCell className="text-center">
                          {c.verified ? (
                            <Check className="h-3.5 w-3.5 text-[#00D4AA] inline" />
                          ) : (
                            <X className="h-3.5 w-3.5 text-[#FF6B6B] inline" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* Language Distribution Donut + Contract Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-[#e8ecf1]">
                Language Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[260px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={langDistData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {langDistData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#161b25",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                        color: "#e8ecf1",
                        fontSize: 12,
                      }}
                      itemStyle={{ color: "#e8ecf1" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {langDistData.map((l) => (
                  <div key={l.name} className="flex items-center gap-1.5 text-[10px] text-[#8b95a5]">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: l.color }}
                    />
                    {l.name} ({l.value})
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contract Types */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-[#e8ecf1]">
                Contract Types
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {contractTypes.map(([type, count]) => (
                  <div
                    key={type}
                    className="p-3 rounded-lg bg-[rgba(22,27,37,0.5)] border border-[rgba(255,255,255,0.04)] text-center"
                  >
                    <div className="text-lg font-bold text-[#e8ecf1] tabular-nums">
                      {count}
                    </div>
                    <div className="text-[10px] text-[#8b95a5] mt-0.5">{type}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Deployment Map Matrix */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#e8ecf1]">
              Deployment Map
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="max-h-[360px]">
              <div className="min-w-[700px]">
                {/* Header row */}
                <div className="flex items-center gap-0 mb-1">
                  <div className="w-[180px] flex-shrink-0 text-[10px] uppercase tracking-wider text-[#4a5568] pr-2">
                    Contract
                  </div>
                  <div className="flex gap-0 flex-1 overflow-x-auto">
                    {chainList.map((chain) => (
                      <div
                        key={chain}
                        className="flex-1 min-w-[60px] text-[10px] uppercase tracking-wider text-[#4a5568] text-center truncate px-1"
                      >
                        {chain}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Rows */}
                <div className="space-y-0.5">
                  {CONTRACTS.map((c) => (
                    <div
                      key={c.name}
                      className="flex items-center gap-0 py-1 border-t border-[rgba(255,255,255,0.03)]"
                    >
                      <div className="w-[180px] flex-shrink-0 text-[11px] font-mono text-[#e8ecf1] pr-2 truncate">
                        {c.name}
                      </div>
                      <div className="flex gap-0 flex-1">
                        {chainList.map((chain) => {
                          const isDeployed = c.chain === chain && c.status === "deployed";
                          const isOther = c.chain === chain && c.status !== "deployed";
                          return (
                            <div
                              key={chain}
                              className="flex-1 min-w-[60px] flex items-center justify-center"
                            >
                              {isDeployed && (
                                <Check className="h-3.5 w-3.5 text-[#00D4AA]" />
                              )}
                              {isOther && (
                                <Zap className="h-3 w-3 text-[#FFD93D]" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 4. BEO PAGE
// ═══════════════════════════════════════════════════════════════════
export function BeoPage() {
  const riskColor = (risk: string) => {
    switch (risk) {
      case "LOW":
        return { bg: "rgba(0,212,170,0.12)", color: "#00D4AA" };
      case "MEDIUM":
        return { bg: "rgba(255,217,61,0.12)", color: "#FFD93D" };
      case "HIGH":
        return { bg: "rgba(255,107,107,0.12)", color: "#FF6B6B" };
      case "CRITICAL":
        return { bg: "rgba(255,82,82,0.15)", color: "#FF5252" };
      default:
        return { bg: "rgba(107,114,128,0.15)", color: "#8b95a5" };
    }
  };

  const sparkColor = (risk: string) => {
    switch (risk) {
      case "LOW":
        return "#00D4AA";
      case "MEDIUM":
        return "#FFD93D";
      case "HIGH":
        return "#FF6B6B";
      case "CRITICAL":
        return "#FF5252";
      default:
        return "#8b95a5";
    }
  };

  // Archetype distribution pie data
  const archetypeData = [
    { name: "Organic Growth", value: 1, color: "#00D4AA" },
    { name: "Whale Movement", value: 1, color: "#FFD93D" },
    { name: "Yield Farmer", value: 1, color: "#FF8C42" },
    { name: "Flash Exploit", value: 1, color: "#FF5252" },
    { name: "Active Trader", value: 1, color: "#7B61FF" },
  ];

  // Cross-chain connections for entity map
  const entityConnections = BEO_ENTITIES.map((e: BEOEntity) => ({
    id: e.id,
    address: e.address,
    chains: e.chains,
    risk: e.risk,
    color: riskColor(e.risk).color,
  }));

  const allChains = [...new Set(BEO_ENTITIES.flatMap((e: BEOEntity) => e.chains))];

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-[#e8ecf1] flex items-center gap-3">
          <Eye className="h-6 w-6 text-[#FF6B6B]" />
          Behavioral Entity Oracle (BEO)
        </h2>
        <p className="text-sm text-[#8b95a5] mt-1">
          Cross-chain entity profiling, behavioral analysis, and risk classification
        </p>
      </motion.div>

      {/* 5 BEO Entity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {BEO_ENTITIES.map((entity: BEOEntity) => {
          const rc = riskColor(entity.risk);
          const sc = sparkColor(entity.risk);
          return (
            <motion.div key={entity.id} variants={itemVariants}>
              <Card className="glass-card">
                <CardContent className="p-4 space-y-3">
                  {/* Top row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#7B61FF]">
                        {entity.id}
                      </span>
                      <span className="text-xs font-mono text-[#8b95a5]">
                        {entity.address}
                      </span>
                    </div>
                    <Badge
                      className="text-[10px] uppercase tracking-wider font-bold"
                      style={{
                        backgroundColor: rc.bg,
                        color: rc.color,
                        border: "none",
                      }}
                    >
                      {entity.risk}
                    </Badge>
                  </div>

                  {/* Chain badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {entity.chains.map((chain) => {
                      const chainData = CHAINS.find((c) => c.name === chain);
                      const cColor = chainData?.color || "#8b95a5";
                      return (
                        <Badge
                          key={chain}
                          variant="outline"
                          className="text-[10px]"
                          style={{
                            borderColor: `${cColor}40`,
                            color: cColor,
                          }}
                        >
                          {chain}
                        </Badge>
                      );
                    })}
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="text-[#4a5568]">Archetype</div>
                      <div className="text-[#e8ecf1] font-medium text-[11px]">
                        {entity.archetype}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#4a5568]">Transactions</div>
                      <div className="text-[#e8ecf1] tabular-nums">
                        {entity.totalTx.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#4a5568]">First Seen</div>
                      <div className="text-[#8b95a5] tabular-nums">
                        {entity.firstSeen}
                      </div>
                    </div>
                  </div>

                  {/* Coherence score */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-[#4a5568]">
                        Coherence Score
                      </span>
                      <span
                        className="text-[11px] font-medium tabular-nums"
                        style={{ color: sc }}
                      >
                        {(entity.coherence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)]">
                      <div
                        className="h-full rounded-full progress-bar"
                        style={{
                          width: `${entity.coherence * 100}%`,
                          backgroundColor: sc,
                        }}
                      />
                    </div>
                  </div>

                  {/* Sparkline */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#4a5568]">
                      BH History
                    </span>
                    <MiniSparkline data={entity.bhHistory} color={sc} width={140} height={28} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Archetype Distribution Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-[#e8ecf1]">
                Behavioral Archetype Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={archetypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {archetypeData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#161b25",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                        color: "#e8ecf1",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {archetypeData.map((a) => (
                  <div key={a.name} className="flex items-center gap-1.5 text-[10px] text-[#8b95a5]">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: a.color }}
                    />
                    {a.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cross-Chain Entity Map */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-[#e8ecf1]">
                Cross-Chain Entity Map
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="relative space-y-4 py-4">
                {/* Entity nodes */}
                {entityConnections.map((ec, idx) => (
                  <div key={ec.id} className="flex items-center gap-3">
                    {/* Entity dot + name */}
                    <div className="flex items-center gap-2 min-w-[160px]">
                      <span
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: ec.color }}
                      />
                      <div>
                        <div className="text-[11px] font-mono text-[#e8ecf1]">
                          {ec.id}
                        </div>
                        <div className="text-[9px] text-[#4a5568]">
                          {ec.address}
                        </div>
                      </div>
                    </div>
                    {/* Connection lines */}
                    <div className="flex items-center gap-1 flex-1 flex-wrap">
                      <div
                        className="h-[1px] w-4"
                        style={{ backgroundColor: `${ec.color}40` }}
                      />
                      {ec.chains.map((chain) => {
                        const cd = CHAINS.find((c) => c.name === chain);
                        const cc = cd?.color || "#8b95a5";
                        return (
                          <div key={chain} className="flex items-center gap-1">
                            <Link2 className="h-3 w-3" style={{ color: cc }} />
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: `${cc}18`,
                                color: cc,
                              }}
                            >
                              {chain}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Entity Search */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#e8ecf1]">
              Entity Search
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4a5568]" />
              <Input
                placeholder="Search by address, entity ID, or archetype..."
                className="pl-9 bg-[rgba(22,27,37,0.6)] border-[rgba(255,255,255,0.08)] text-[#e8ecf1] placeholder:text-[#4a5568] text-xs h-9"
              />
            </div>
            <ScrollArea className="max-h-[240px]">
              <div className="space-y-2 pr-2">
                {BEO_ENTITIES.map((entity: BEOEntity) => {
                  const rc = riskColor(entity.risk);
                  return (
                    <div
                      key={entity.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-[rgba(22,27,37,0.4)] border border-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Circle
                          className="h-3 w-3 fill-current"
                          style={{ color: rc.color }}
                        />
                        <div>
                          <div className="text-xs font-mono text-[#e8ecf1]">
                            {entity.id}{" "}
                            <span className="text-[#4a5568]">
                              {entity.address}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#8b95a5]">
                            {entity.archetype} &middot; {entity.totalTx} txs
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MiniSparkline
                          data={entity.bhHistory}
                          color={sparkColor(entity.risk)}
                          width={80}
                          height={24}
                        />
                        <Badge
                          className="text-[9px] uppercase tracking-wider font-bold"
                          style={{
                            backgroundColor: rc.bg,
                            color: rc.color,
                            border: "none",
                          }}
                        >
                          {entity.risk}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}