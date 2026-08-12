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
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  Cpu,
  Clock,
  Zap,
  Server,
  MemoryStick,
  ArrowRight,
  Database,
  Globe,
  Shield,
  Radio,
  Brain,
  Layers,
  ChevronRight,
  Circle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wifi,
  WifiOff,
  Settings,
  Info,
  Code2,
  FileCode2,
  GitBranch,
  Box,
  LayoutGrid,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  DEPLOYMENTS,
  API_ENDPOINTS,
  LANGUAGE_STATS,
  CHAINS,
  CONTRACTS,
  RELAYER_STATUS,
} from "@/lib/trion-data";

// ─── Animation Variants ──────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const scaleVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

// ─── Shared Helpers ──────────────────────────────────────────────
function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
}

function SectionTitle({ children, icon: Icon }: { children: React.ReactNode; icon?: React.ElementType }) {
  return (
    <motion.h3
      className="text-sm font-semibold tracking-wider uppercase mb-4 flex items-center gap-2"
      style={{ color: "#8b95a5" }}
      variants={itemVariants}
    >
      {Icon && <Icon className="h-4 w-4" style={{ color: "#00D4AA" }} />}
      {children}
    </motion.h3>
  );
}

// ─── Method badge color ──────────────────────────────────────────
function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "rgba(0, 200, 220, 0.15)",
    POST: "rgba(0, 212, 170, 0.15)",
    PUT: "rgba(255, 217, 61, 0.15)",
    DELETE: "rgba(255, 107, 107, 0.15)",
  };
  const textColors: Record<string, string> = {
    GET: "#00C8DC",
    POST: "#00D4AA",
    PUT: "#FFD93D",
    DELETE: "#FF6B6B",
  };
  return (
    <Badge
      className="font-mono text-xs px-2 py-0.5 border-0"
      style={{
        backgroundColor: colors[method] || "rgba(255,255,255,0.1)",
        color: textColors[method] || "#e8ecf1",
      }}
    >
      {method}
    </Badge>
  );
}

// ─── Status dot ──────────────────────────────────────────────────
function StatusDot({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: "#00D4AA",
    live: "#00D4AA",
    online: "#00D4AA",
    pending: "#FFD93D",
    indexing: "#00C8DC",
    degraded: "#FF8C42",
    deprecated: "#FFD93D",
    failed: "#FF6B6B",
    broken: "#FF6B6B",
    offline: "#FF6B6B",
  };
  return (
    <span
      className="inline-block h-2 w-2 rounded-full mr-1.5"
      style={{ backgroundColor: colorMap[status] || "#4a5568" }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
// 1. PROTOCOL HEALTH PAGE
// ═══════════════════════════════════════════════════════════════════

export function ProtocolHealthPage() {
  // KPI data
  const kpis = [
    { label: "Uptime (30d)", value: "99.94%", icon: Activity, color: "#00D4AA", sub: "↑ 0.02% from last month" },
    { label: "API Response (p99)", value: "234ms", icon: Clock, color: "#00C8DC", sub: "Target: <300ms" },
    { label: "Error Rate", value: "0.03%", icon: AlertTriangle, color: "#FF6B6B", sub: "↓ 0.01% improvement" },
    { label: "Active Connections", value: "847", icon: Wifi, color: "#7B61FF", sub: "92 chains connected" },
    { label: "Memory Usage", value: "67.2%", icon: MemoryStick, color: "#FF8C42", sub: "12.8 GB / 19 GB" },
    { label: "GPU Utilization", value: "23.4%", icon: Cpu, color: "#FFD93D", sub: "FAISS vector search" },
  ];

  // Service health data
  const services = [
    { name: "Core Engine", status: "active", health: 99.8, lastCheck: "2s ago", icon: Server },
    { name: "FAISS Service", status: "active", health: 99.5, lastCheck: "5s ago", icon: Database },
    { name: "Relayer Network", status: "active", health: 99.9, lastCheck: "1s ago", icon: Radio },
    { name: "0G Services", status: "active", health: 99.7, lastCheck: "8s ago", icon: Layers },
    { name: "P2P Network", status: "degraded", health: 94.2, lastCheck: "12s ago", icon: Globe },
  ];

  // Generate 24h request volume data
  const requestVolumeData = Array.from({ length: 24 }, (_, i) => {
    const hour = `${i.toString().padStart(2, "0")}:00`;
    const base = 30000 + Math.sin((i - 6) * 0.5) * 15000 + Math.random() * 8000;
    const errorBase = 0.02 + Math.random() * 0.04;
    return {
      hour,
      requests: Math.round(base),
      errorRate: Math.round(errorBase * 1000) / 1000,
    };
  });

  // Data flow steps
  const dataFlow = [
    { label: "On-Chain", sublabel: "100 Chains", type: "LIVE" as const, icon: Globe },
    { label: "Indexers", sublabel: "Rust / Go", type: "BACKEND" as const, icon: Database },
    { label: "Core Engine", sublabel: "Python / FAISS", type: "BACKEND" as const, icon: Cpu },
    { label: "API Layer", sublabel: "345+ Routes", type: "BACKEND" as const, icon: Server },
    { label: "Dashboard", sublabel: "Real-time", type: "LIVE" as const, icon: LayoutGrid },
  ];

  const dataSourceColors: Record<string, { dot: string; bg: string; text: string }> = {
    LIVE: { dot: "#00D4AA", bg: "rgba(0,212,170,0.12)", text: "#00D4AA" },
    BACKEND: { dot: "#7B61FF", bg: "rgba(123,97,255,0.12)", text: "#7B61FF" },
    MOCK: { dot: "#4a5568", bg: "rgba(74,85,104,0.12)", text: "#4a5568" },
  };

  const maxLines = Math.max(...LANGUAGE_STATS.map((l) => l.lines));

  return (
    <motion.div
      className="space-y-6 p-1"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} variants={scaleVariants}>
            <Card className="glass-card p-4 hover:border-[rgba(255,255,255,0.1)] transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div
                  className="p-1.5 rounded-lg"
                  style={{ backgroundColor: `${kpi.color}15` }}
                >
                  <kpi.icon className="h-4 w-4" style={{ color: kpi.color }} />
                </div>
              </div>
              <div className="text-2xl font-bold" style={{ color: "#e8ecf1" }}>
                {kpi.value}
              </div>
              <div className="text-xs mt-1" style={{ color: "#8b95a5" }}>
                {kpi.label}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "#4a5568" }}>
                {kpi.sub}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── System Architecture ── */}
      <motion.div variants={itemVariants}>
        <SectionTitle icon={Code2}>System Architecture — 12 Languages</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {LANGUAGE_STATS.map((lang) => (
            <motion.div
              key={lang.language}
              variants={scaleVariants}
              whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.12)" }}
              transition={{ duration: 0.2 }}
            >
              <Card className="glass-card p-4 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: lang.color }}
                  />
                  <span
                    className="font-semibold text-sm"
                    style={{ color: "#e8ecf1" }}
                  >
                    {lang.language}
                  </span>
                  <span
                    className="ml-auto text-xs font-mono"
                    style={{ color: "#8b95a5" }}
                  >
                    {lang.lines.toLocaleString()} LOC
                  </span>
                </div>
                <div
                  className="text-xs mb-2 leading-relaxed"
                  style={{ color: "#8b95a5" }}
                >
                  {lang.role}
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: lang.color }}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(lang.lines / maxLines) * 100}%`,
                    }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  />
                </div>
                <div className="text-xs mt-1.5" style={{ color: "#4a5568" }}>
                  {lang.files} files
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── API Endpoints Table ── */}
      <motion.div variants={itemVariants}>
        <SectionTitle icon={Server}>API Endpoints</SectionTitle>
        <Card className="glass-card">
          <ScrollArea className="max-h-96">
            <div className="min-w-[800px]">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="border-b"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    {["ROUTE", "METHOD", "STATUS", "CALLS/24H", "AVG LATENCY", "CATEGORY"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 text-xs font-semibold tracking-wider"
                          style={{ color: "#4a5568" }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {API_ENDPOINTS.map((ep, i) => (
                    <motion.tr
                      key={ep.route + i}
                      className="border-b transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                      style={{ borderColor: "rgba(255,255,255,0.04)" }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.03 }}
                    >
                      <td
                        className="px-4 py-2.5 font-mono text-xs"
                        style={{ color: "#e8ecf1" }}
                      >
                        {ep.route}
                      </td>
                      <td className="px-4 py-2.5">
                        <MethodBadge method={ep.method} />
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="flex items-center text-xs" style={{ color: "#8b95a5" }}>
                          <StatusDot status={ep.status} />
                          {ep.status}
                        </span>
                      </td>
                      <td
                        className="px-4 py-2.5 text-xs font-mono"
                        style={{ color: "#e8ecf1" }}
                      >
                        {ep.calls24h.toLocaleString()}
                      </td>
                      <td
                        className="px-4 py-2.5 text-xs font-mono"
                        style={{ color: "#8b95a5" }}
                      >
                        {ep.avgLatency}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge
                          className="text-xs px-2 py-0 border-0"
                          style={{
                            backgroundColor: "rgba(255,255,255,0.06)",
                            color: "#8b95a5",
                          }}
                        >
                          {ep.category}
                        </Badge>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </Card>
      </motion.div>

      {/* ── Service Health ── */}
      <motion.div variants={itemVariants}>
        <SectionTitle icon={Activity}>Service Health</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {services.map((svc, i) => (
            <motion.div
              key={svc.name}
              variants={scaleVariants}
              custom={i}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <svc.icon className="h-4 w-4" style={{ color: svc.status === "degraded" ? "#FF8C42" : "#00D4AA" }} />
                    <span className="text-sm font-medium" style={{ color: "#e8ecf1" }}>
                      {svc.name}
                    </span>
                  </div>
                  <StatusDot status={svc.status} />
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "#8b95a5" }}>Health</span>
                    <span style={{ color: svc.health >= 99 ? "#00D4AA" : svc.health >= 95 ? "#FFD93D" : "#FF6B6B" }}>
                      {svc.health}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor:
                          svc.health >= 99
                            ? "#00D4AA"
                            : svc.health >= 95
                            ? "#FFD93D"
                            : "#FF6B6B",
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${svc.health}%` }}
                      transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
                    />
                  </div>
                </div>
                <div className="text-xs" style={{ color: "#4a5568" }}>
                  Last check: {svc.lastCheck}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Request Volume & Error Rate Chart ── */}
      <motion.div variants={itemVariants}>
        <SectionTitle icon={TrendingUp}>Request Volume &amp; Error Rate (24h)</SectionTitle>
        <Card className="glass-card p-4">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={requestVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="hour"
                  tick={{ fill: "#4a5568", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "#4a5568", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  tickLine={false}
                  tickFormatter={(v: number) => formatNumber(v)}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 0.1]}
                  tick={{ fill: "#4a5568", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  tickLine={false}
                  tickFormatter={(v: number) => `${(v * 100).toFixed(1)}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#161b25",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#e8ecf1",
                  }}
                  labelStyle={{ color: "#8b95a5" }}
                  formatter={(value: number, name: string) => {
                    if (name === "requests") return [value.toLocaleString(), "Requests"];
                    return [`${(value * 100).toFixed(2)}%`, "Error Rate"];
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", color: "#8b95a5" }}
                  formatter={(value: string) =>
                    value === "requests" ? "Request Volume" : "Error Rate"
                  }
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="requests"
                  stroke="#00D4AA"
                  strokeWidth={2}
                  dot={false}
                  animationDuration={1200}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="errorRate"
                  stroke="#FF6B6B"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* ── Data Flow ── */}
      <motion.div variants={itemVariants}>
        <SectionTitle icon={ArrowRight}>Data Flow Pipeline</SectionTitle>
        <Card className="glass-card p-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-0 justify-between">
            {dataFlow.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2 sm:gap-0">
                <motion.div
                  className="flex flex-col items-center text-center px-3 sm:px-4"
                  variants={scaleVariants}
                  custom={i}
                  whileHover={{ scale: 1.05 }}
                >
                  <div
                    className="p-3 rounded-xl mb-2"
                    style={{ backgroundColor: `${dataSourceColors[step.type].dot}15` }}
                  >
                    <step.icon
                      className="h-5 w-5"
                      style={{ color: dataSourceColors[step.type].dot }}
                    />
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "#e8ecf1" }}
                  >
                    {step.label}
                  </span>
                  <span className="text-xs mt-0.5" style={{ color: "#4a5568" }}>
                    {step.sublabel}
                  </span>
                  <Badge
                    className="text-[10px] mt-1.5 px-1.5 py-0 border-0 font-mono"
                    style={{
                      backgroundColor: dataSourceColors[step.type].bg,
                      color: dataSourceColors[step.type].text,
                    }}
                  >
                    {step.type}
                  </Badge>
                </motion.div>
                {i < dataFlow.length - 1 && (
                  <motion.div
                    className="hidden sm:block mx-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.15 }}
                  >
                    <ChevronRight
                      className="h-5 w-5"
                      style={{ color: "#4a5568" }}
                    />
                  </motion.div>
                )}
                {i < dataFlow.length - 1 && (
                  <motion.div
                    className="sm:hidden my-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.15 }}
                  >
                    <ArrowRight
                      className="h-4 w-4 rotate-90"
                      style={{ color: "#4a5568" }}
                    />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 2. DEPLOYMENTS PAGE
// ═══════════════════════════════════════════════════════════════════

export function DeploymentsPage() {
  // Contract deployment matrix
  const networks = DEPLOYMENTS.map((d) => d.network);
  const contractNames = [...new Set(DEPLOYMENTS.map((d) => d.contract))];
  const matrix = DEPLOYMENTS.reduce<Record<string, Record<string, boolean>>>(
    (acc, d) => {
      if (!acc[d.contract]) acc[d.contract] = {};
      acc[d.contract][d.network] = true;
      return acc;
    },
    {}
  );

  // Bar chart data: deployments per chain
  const chainDeployCounts = DEPLOYMENTS.reduce<Record<string, number>>(
    (acc, d) => {
      acc[d.network] = (acc[d.network] || 0) + 1;
      return acc;
    },
    {}
  );
  const barData = Object.entries(chainDeployCounts).map(([name, count]) => ({
    name: name.length > 14 ? name.slice(0, 14) + "…" : name,
    fullName: name,
    count,
  }));

  // Status badge colors
  const statusColors: Record<string, { bg: string; text: string }> = {
    active: { bg: "rgba(0,212,170,0.15)", text: "#00D4AA" },
    pending: { bg: "rgba(255,217,61,0.15)", text: "#FFD93D" },
    failed: { bg: "rgba(255,107,107,0.15)", text: "#FF6B6B" },
  };

  return (
    <motion.div
      className="space-y-6 p-1"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Deployments Table ── */}
      <motion.div variants={itemVariants}>
        <SectionTitle icon={Box}>Contract Deployments</SectionTitle>
        <Card className="glass-card">
          <ScrollArea className="max-h-96">
            <div className="min-w-[900px]">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="border-b"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    {[
                      "NETWORK",
                      "CHAIN ID",
                      "CONTRACT",
                      "ADDRESS",
                      "STATUS",
                      "TX HASH",
                      "DEPLOYED AT",
                      "BLOCK",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold tracking-wider"
                        style={{ color: "#4a5568" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DEPLOYMENTS.map((dep, i) => (
                    <motion.tr
                      key={dep.txHash + dep.network}
                      className="border-b transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                      style={{ borderColor: "rgba(255,255,255,0.04)" }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.04 }}
                    >
                      <td
                        className="px-4 py-2.5 text-xs font-medium"
                        style={{ color: "#e8ecf1" }}
                      >
                        {dep.network}
                      </td>
                      <td
                        className="px-4 py-2.5 text-xs font-mono"
                        style={{ color: "#8b95a5" }}
                      >
                        {dep.chainId}
                      </td>
                      <td
                        className="px-4 py-2.5 text-xs font-mono"
                        style={{ color: "#00D4AA" }}
                      >
                        {dep.contract}
                      </td>
                      <td
                        className="px-4 py-2.5 text-xs font-mono"
                        style={{ color: "#8b95a5" }}
                      >
                        {dep.address}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge
                          className="text-xs px-2 py-0 border-0 capitalize"
                          style={{
                            backgroundColor: statusColors[dep.status]?.bg,
                            color: statusColors[dep.status]?.text,
                          }}
                        >
                          {dep.status}
                        </Badge>
                      </td>
                      <td
                        className="px-4 py-2.5 text-xs font-mono cursor-pointer hover:text-white transition-colors"
                        style={{ color: "#7B61FF" }}
                      >
                        {dep.txHash}
                      </td>
                      <td
                        className="px-4 py-2.5 text-xs"
                        style={{ color: "#8b95a5" }}
                      >
                        {dep.deployedAt}
                      </td>
                      <td
                        className="px-4 py-2.5 text-xs font-mono"
                        style={{ color: "#4a5568" }}
                      >
                        {dep.blockNumber.toLocaleString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </Card>
      </motion.div>

      {/* ── Contract Deployment Map ── */}
      <motion.div variants={itemVariants}>
        <SectionTitle icon={LayoutGrid}>Contract Deployment Map</SectionTitle>
        <Card className="glass-card p-4">
          <ScrollArea className="max-h-72">
            <div className="min-w-[700px]">
              <table className="w-full text-xs">
                <thead>
                  <tr
                    className="border-b"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    <th
                      className="text-left px-3 py-2 font-semibold tracking-wider"
                      style={{ color: "#4a5568" }}
                    >
                      CONTRACT
                    </th>
                    {networks.map((n) => (
                      <th
                        key={n}
                        className="text-center px-2 py-2 font-semibold tracking-wider"
                        style={{ color: "#4a5568", minWidth: "80px" }}
                      >
                        <div className="truncate" title={n}>
                          {n.length > 12 ? n.slice(0, 12) + "…" : n}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contractNames.map((contract, i) => (
                    <motion.tr
                      key={contract}
                      className="border-b"
                      style={{ borderColor: "rgba(255,255,255,0.04)" }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                    >
                      <td
                        className="px-3 py-2 font-mono"
                        style={{ color: "#e8ecf1" }}
                      >
                        {contract.length > 22
                          ? contract.slice(0, 22) + "…"
                          : contract}
                      </td>
                      {networks.map((n) => (
                        <td key={n} className="text-center px-2 py-2">
                          {matrix[contract]?.[n] ? (
                            <motion.span
                              className="inline-block h-3 w-3 rounded-full"
                              style={{ backgroundColor: "#00D4AA" }}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.5 + i * 0.05 }}
                            />
                          ) : (
                            <span style={{ color: "#4a5568" }}>—</span>
                          )}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </Card>
      </motion.div>

      {/* ── Deployment Timeline ── */}
      <motion.div variants={itemVariants}>
        <SectionTitle icon={Clock}>Deployment Timeline</SectionTitle>
        <Card className="glass-card p-6">
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-4 sm:left-6 top-0 bottom-0 w-px"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            />
            <div className="space-y-6">
              {[...DEPLOYMENTS]
                .sort(
                  (a, b) =>
                    new Date(b.deployedAt).getTime() -
                    new Date(a.deployedAt).getTime()
                )
                .map((dep, i) => (
                  <motion.div
                    key={dep.txHash + dep.network}
                    className="relative flex items-start gap-4 pl-0 sm:pl-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.07 }}
                  >
                    {/* Dot on the line */}
                    <div className="relative z-10 flex-shrink-0 mt-1">
                      <motion.div
                        className="h-3.5 w-3.5 rounded-full border-2"
                        style={{
                          borderColor: statusColors[dep.status]?.text,
                          backgroundColor: `${statusColors[dep.status]?.text}33`,
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.07 }}
                      />
                    </div>
                    {/* Spacer to push content right of the line */}
                    <div className="absolute left-4 sm:left-6 w-4 sm:w-6" />
                    {/* Content */}
                    <div
                      className="glass-card-elevated p-3 sm:p-4 flex-1 ml-2"
                      style={{ borderRadius: "10px" }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: "#e8ecf1" }}
                        >
                          {dep.contract}
                        </span>
                        <Badge
                          className="text-[10px] px-1.5 py-0 border-0 w-fit"
                          style={{
                            backgroundColor: "rgba(123,97,255,0.15)",
                            color: "#7B61FF",
                          }}
                        >
                          {dep.network}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs" style={{ color: "#4a5568" }}>
                        <span>{dep.deployedAt}</span>
                        <span>•</span>
                        <span className="font-mono">{dep.address}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Multi-Chain Coverage ── */}
      <motion.div variants={itemVariants}>
        <SectionTitle icon={BarChart3}>Multi-Chain Coverage</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Bar chart */}
          <Card className="glass-card p-4 lg:col-span-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: "#4a5568", fontSize: 11 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "#8b95a5", fontSize: 11 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                    tickLine={false}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#161b25",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#e8ecf1",
                    }}
                    labelFormatter={(_l: string, payload: Array<{ payload?: { fullName?: string } }>) =>
                      payload?.[0]?.payload?.fullName || _l
                    }
                    formatter={(value: number) => [
                      `${value} deployment${value !== 1 ? "s" : ""}`,
                      "Count",
                    ]}
                  />
                  <Bar
                    dataKey="count"
                    fill="#00D4AA"
                    radius={[0, 4, 4, 0]}
                    animationDuration={800}
                  >
                    {barData.map((entry, index) => (
                      <motion.rect
                        key={entry.fullName}
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        transition={{ delay: 0.4 + index * 0.06 }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Stats panel */}
          <div className="flex flex-col gap-4">
            <Card className="glass-card p-5 flex-1 flex flex-col justify-center">
              <div className="text-center space-y-4">
                <div>
                  <div className="text-4xl font-bold" style={{ color: "#00D4AA" }}>
                    8
                  </div>
                  <div className="text-sm mt-1" style={{ color: "#8b95a5" }}>
                    Networks
                  </div>
                </div>
                <Separator style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
                <div>
                  <div className="text-4xl font-bold" style={{ color: "#7B61FF" }}>
                    6
                  </div>
                  <div className="text-sm mt-1" style={{ color: "#8b95a5" }}>
                    Contract Types
                  </div>
                </div>
                <Separator style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
                <div className="flex justify-center gap-6">
                  <div>
                    <div className="text-2xl font-bold" style={{ color: "#FFD93D" }}>
                      4
                    </div>
                    <div className="text-xs" style={{ color: "#8b95a5" }}>
                      Testnets
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: "#00D4AA" }}>
                      4
                    </div>
                    <div className="text-xs" style={{ color: "#8b95a5" }}>
                      Mainnets
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            <Card className="glass-card p-4">
              <div className="text-xs" style={{ color: "#4a5568" }}>
                Coverage spans EVM, Cairo (StarkNet), and FunC (TON) VM families
              </div>
            </Card>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 3. SETTINGS PAGE
// ═══════════════════════════════════════════════════════════════════

export function SettingsPage() {
  // Data source toggles state
  const dataSources = [
    {
      id: "rpc-ethereum",
      label: "On-chain RPC — Ethereum",
      enabled: true,
      status: "Connected",
      statusColor: "#00D4AA",
      type: "LIVE" as const,
    },
    {
      id: "rpc-arbitrum",
      label: "On-chain RPC — Arbitrum",
      enabled: true,
      status: "Connected",
      statusColor: "#00D4AA",
      type: "LIVE" as const,
    },
    {
      id: "rpc-base",
      label: "On-chain RPC — Base",
      enabled: true,
      status: "Connected",
      statusColor: "#00D4AA",
      type: "LIVE" as const,
    },
    {
      id: "rpc-polygon",
      label: "On-chain RPC — Polygon",
      enabled: false,
      status: "Disabled",
      statusColor: "#4a5568",
      type: "LIVE" as const,
    },
    {
      id: "rpc-bnb",
      label: "On-chain RPC — BNB Chain",
      enabled: false,
      status: "Disabled",
      statusColor: "#4a5568",
      type: "LIVE" as const,
    },
    {
      id: "backend-api",
      label: "TRION Backend API (oracle_api)",
      enabled: true,
      status: "http://localhost:5000",
      statusColor: "#7B61FF",
      type: "BACKEND" as const,
    },
    {
      id: "faiss-service",
      label: "FAISS Vector Service",
      enabled: true,
      status: "Connected — 847 indexes loaded",
      statusColor: "#7B61FF",
      type: "BACKEND" as const,
    },
    {
      id: "0g-storage",
      label: "0G Storage / DA Layer",
      enabled: true,
      status: "Syncing — 99.7% current",
      statusColor: "#FFD93D",
      type: "BACKEND" as const,
    },
    {
      id: "anima-nlp",
      label: "ANIMA NLP Engine",
      enabled: true,
      status: "54 languages loaded",
      statusColor: "#7B61FF",
      type: "BACKEND" as const,
    },
  ];

  const dataSourceLegend = [
    {
      type: "LIVE" as const,
      dot: "#00D4AA",
      description: "Data from real on-chain RPC or public API",
    },
    {
      type: "BACKEND" as const,
      dot: "#7B61FF",
      description: "Data from TRION backend services (requires running server)",
    },
    {
      type: "MOCK" as const,
      dot: "#4a5568",
      description: "Simulated data for demonstration",
    },
  ];

  return (
    <motion.div
      className="space-y-6 p-1"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Data Source Configuration ── */}
      <motion.div variants={itemVariants}>
        <SectionTitle icon={Database}>Data Source Configuration</SectionTitle>
        <Card className="glass-card p-5">
          <div className="space-y-0 divide-y" style={{ "--tw-divide-opacity": 1, borderColor: "rgba(255,255,255,0.04)" } as React.CSSProperties}>
            {dataSources.map((source, i) => (
              <motion.div
                key={source.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-4 first:pt-0 last:pb-0"
                style={{
                  borderBottom:
                    i < dataSources.length - 1
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "none",
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Switch
                    checked={source.enabled}
                    className="data-[state=checked]:bg-[#00D4AA] data-[state=unchecked]:bg-[rgba(255,255,255,0.1)]"
                    aria-label={`Toggle ${source.label}`}
                  />
                  <div className="min-w-0">
                    <div
                      className="text-sm font-medium truncate"
                      style={{ color: "#e8ecf1" }}
                    >
                      {source.label}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: source.statusColor }}
                      />
                      <span
                        className="text-xs truncate"
                        style={{ color: "#4a5568" }}
                      >
                        {source.status}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge
                  className="text-[10px] px-1.5 py-0 border-0 font-mono flex-shrink-0 w-fit"
                  style={{
                    backgroundColor:
                      source.type === "LIVE"
                        ? "rgba(0,212,170,0.12)"
                        : source.type === "BACKEND"
                        ? "rgba(123,97,255,0.12)"
                        : "rgba(74,85,104,0.12)",
                    color:
                      source.type === "LIVE"
                        ? "#00D4AA"
                        : source.type === "BACKEND"
                        ? "#7B61FF"
                        : "#4a5568",
                  }}
                >
                  {source.type}
                </Badge>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* ── Live Data Indicators Legend ── */}
      <motion.div variants={itemVariants}>
        <SectionTitle icon={Info}>Live Data Indicators</SectionTitle>
        <Card className="glass-card p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {dataSourceLegend.map((item, i) => (
              <motion.div
                key={item.type}
                className="flex items-start gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <div
                  className="p-2 rounded-lg flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: `${item.dot}15` }}
                >
                  <Circle
                    className="h-4 w-4 fill-current"
                    style={{ color: item.dot }}
                  />
                </div>
                <div>
                  <div
                    className="text-sm font-semibold font-mono"
                    style={{ color: item.dot }}
                  >
                    {item.type}
                  </div>
                  <div
                    className="text-xs mt-0.5 leading-relaxed"
                    style={{ color: "#8b95a5" }}
                  >
                    {item.description}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* ── API Configuration ── */}
      <motion.div variants={itemVariants}>
        <SectionTitle icon={Settings}>API Configuration</SectionTitle>
        <Card className="glass-card p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Backend URL */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Label
                className="text-xs font-semibold tracking-wider uppercase"
                style={{ color: "#8b95a5" }}
              >
                Backend URL
              </Label>
              <Input
                className="font-mono text-sm bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.06)] text-[#e8ecf1] focus:border-[rgba(0,212,170,0.5)] placeholder:text-[#4a5568]"
                defaultValue="http://localhost:5000"
                placeholder="http://localhost:5000"
              />
              <p className="text-xs" style={{ color: "#4a5568" }}>
                TRION oracle_api backend endpoint
              </p>
            </motion.div>

            {/* WebSocket URL */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Label
                className="text-xs font-semibold tracking-wider uppercase"
                style={{ color: "#8b95a5" }}
              >
                WebSocket URL
              </Label>
              <Input
                className="font-mono text-sm bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.06)] text-[#e8ecf1] focus:border-[rgba(0,212,170,0.5)] placeholder:text-[#4a5568]"
                defaultValue="ws://localhost:5000/ws"
                placeholder="ws://localhost:5000/ws"
              />
              <p className="text-xs" style={{ color: "#4a5568" }}>
                Real-time signal stream endpoint
              </p>
            </motion.div>

            {/* Refresh interval slider */}
            <motion.div
              className="space-y-3 lg:col-span-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <Label
                  className="text-xs font-semibold tracking-wider uppercase"
                  style={{ color: "#8b95a5" }}
                >
                  Refresh Interval
                </Label>
                <span
                  className="text-sm font-mono font-bold"
                  style={{ color: "#00D4AA" }}
                >
                  5s
                </span>
              </div>
              <Slider
                defaultValue={[5]}
                min={1}
                max={30}
                step={1}
                className="[&_[role=slider]]:bg-[#00D4AA] [&_[role=slider]]:border-[#00D4AA]"
              />
              <div className="flex justify-between text-xs" style={{ color: "#4a5568" }}>
                <span>1s</span>
                <span>15s</span>
                <span>30s</span>
              </div>
            </motion.div>

            {/* Theme toggle */}
            <motion.div
              className="flex items-center justify-between lg:col-span-2 py-3 px-4 rounded-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div>
                <div
                  className="text-sm font-medium"
                  style={{ color: "#e8ecf1" }}
                >
                  Theme
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#4a5568" }}>
                  Dark mode is currently the only available theme
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: "#8b95a5" }}>
                  Dark
                </span>
                <Switch
                  checked={true}
                  disabled={true}
                  className="data-[state=checked]:bg-[#00D4AA] opacity-70"
                  aria-label="Theme toggle"
                />
                <span className="text-xs" style={{ color: "#4a5568" }}>
                  Light
                </span>
              </div>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* ── About TRION Protocol ── */}
      <motion.div variants={itemVariants}>
        <SectionTitle icon={FileCode2}>About TRION Protocol</SectionTitle>
        <Card className="glass-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Logo area and version */}
            <div className="space-y-4">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: "rgba(0,212,170,0.1)" }}
                >
                  <Shield className="h-8 w-8" style={{ color: "#00D4AA" }} />
                </div>
                <div>
                  <h4
                    className="text-lg font-bold"
                    style={{ color: "#e8ecf1" }}
                  >
                    TRION Protocol
                  </h4>
                  <p className="text-xs" style={{ color: "#8b95a5" }}>
                    Coherence-Preserving Oracle Network
                  </p>
                </div>
              </motion.div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "#8b95a5" }}>
                    Version
                  </span>
                  <span
                    className="text-xs font-mono font-semibold"
                    style={{ color: "#e8ecf1" }}
                  >
                    v1.0.0
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "#8b95a5" }}>
                    License
                  </span>
                  <span
                    className="text-xs font-mono font-semibold"
                    style={{ color: "#e8ecf1" }}
                  >
                    CC0
                  </span>
                </div>
              </div>

              {/* Master Equation */}
              <motion.div
                className="p-4 rounded-lg mt-4"
                style={{
                  backgroundColor: "rgba(0,212,170,0.05)",
                  border: "1px solid rgba(0,212,170,0.15)",
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div
                  className="text-[10px] uppercase tracking-widest mb-2 font-semibold"
                  style={{ color: "#00D4AA" }}
                >
                  Master Equation
                </div>
                <div
                  className="font-mono text-sm leading-relaxed"
                  style={{ color: "#e8ecf1" }}
                >
                  T(t) = [C(t) ≥ Θ(t)] · C(t) · e^M_moat
                </div>
                <p className="text-xs mt-2" style={{ color: "#4a5568" }}>
                  Coherence-preserving signal truth function with
                  manipulation-resistance exponent
                </p>
              </motion.div>
            </div>

            {/* Right: Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Programming Languages",
                  value: "12",
                  color: "#7B61FF",
                  icon: Code2,
                },
                {
                  label: "Chains",
                  value: "100",
                  color: "#00D4AA",
                  icon: GitBranch,
                },
                {
                  label: "VM Families",
                  value: "15",
                  color: "#00C8DC",
                  icon: Layers,
                },
                {
                  label: "Smart Contracts",
                  value: "25",
                  color: "#FFD93D",
                  icon: FileCode2,
                },
                {
                  label: "Lines of Code",
                  value: "106,000+",
                  color: "#FF8C42",
                  icon: FileCode2,
                },
                {
                  label: "API Routes",
                  value: "345+",
                  color: "#FF6B6B",
                  icon: Server,
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="glass-card-elevated p-4 flex flex-col items-center text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.07 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <stat.icon
                    className="h-5 w-5 mb-2"
                    style={{ color: stat.color }}
                  />
                  <div
                    className="text-2xl font-bold"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-xs mt-1"
                    style={{ color: "#8b95a5" }}
                  >
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}