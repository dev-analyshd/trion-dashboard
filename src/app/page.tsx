"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Shield, Database, Brain, Eye, Lock, Cpu, Radio,
  Globe2, Bell, Search, Zap, TrendingUp, Layers, Fingerprint,
  Heart, Settings, Key, GitBranch, FileCode, Users, Wifi,
  Hexagon, Menu, X, ChevronRight, RefreshCw, type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Page components
import { OverviewPage, SignalsPage, ChainsPage, TradingPage } from "@/components/trion/pages-group-1";
import { AkashicPage, PlanesPage, SecurityPage, AnimaPage } from "@/components/trion/pages-group-2";
import { RelayersPage, GovernancePage, ContractsPage, BeoPage } from "@/components/trion/pages-group-3";
import { ProtocolHealthPage, DeploymentsPage, SettingsPage } from "@/components/trion/pages-group-4";

// ─── Nav Items ───────────────────────────────────────────────────
interface NavItem {
  id: string; label: string; icon: LucideIcon;
  badge?: string; badgeColor?: string;
  section?: string; dataSource?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", icon: Activity, dataSource: "LIVE" },
  { id: "signals", label: "Live Signals", icon: Radio, badge: "LIVE", badgeColor: "#00D4AA", dataSource: "LIVE" },
  { id: "chains", label: "Multi-Chain", icon: Globe2, dataSource: "LIVE" },
  { id: "akashic", label: "Akashic Index", icon: Database, dataSource: "BACKEND" },
  { id: "planes", label: "Five Planes", icon: Layers, dataSource: "BACKEND" },
  { id: "trading", label: "Trading Firewall", icon: TrendingUp, dataSource: "LIVE" },
  { id: "security", label: "Living Security", icon: Shield, dataSource: "BACKEND" },
  { id: "anima", label: "ANIMA Intelligence", icon: Brain, dataSource: "BACKEND" },
  { id: "relayers", label: "Relayers & 0G", icon: Wifi, dataSource: "BACKEND" },
  { id: "governance", label: "Governance", icon: Heart, dataSource: "BACKEND" },
  { id: "contracts", label: "Smart Contracts", icon: FileCode, dataSource: "BACKEND" },
  { id: "beo", label: "BEO Entities", icon: Users, dataSource: "BACKEND" },
  { id: "protocol", label: "Protocol Health", icon: Cpu, dataSource: "BACKEND" },
  { id: "deployments", label: "Deployments", icon: GitBranch, dataSource: "BACKEND" },
  { id: "sep-1", label: "SYSTEM", icon: Settings, section: "SYSTEM" },
  { id: "settings", label: "Settings", icon: Settings, dataSource: "LOCAL" },
];

// ─── Pulsing Dot ────────────────────────────────────────────────
function PulsingDot({ color = "#00D4AA", size = 6 }: { color?: string; size?: number }) {
  return (
    <span className="relative flex items-center justify-center" style={{ width: size + 4, height: size + 4 }}>
      <span
        className="absolute rounded-full animate-ping"
        style={{ width: size, height: size, backgroundColor: color, opacity: 0.4 }}
      />
      <span
        className="relative rounded-full"
        style={{ width: size, height: size, backgroundColor: color }}
      />
    </span>
  );
}

// ─── Status Dot ─────────────────────────────────────────────────
function StatusDot({ status, size = 6 }: { status: string; size?: number }) {
  const color = status === "online" || status === "active" || status === "deployed" || status === "live"
    ? "#00D4AA"
    : status === "indexing" || status === "bootstrap" || status === "deploying" || status === "auditing"
    ? "#FFD93D"
    : status === "degraded" || status === "pending" || status === "MONITORING"
    ? "#FF8C42"
    : "#FF5252";
  return <span className="inline-block rounded-full" style={{ width: size, height: size, backgroundColor: color }} />;
}

// ─── Data Source Badge ──────────────────────────────────────────
function DataSourceBadge({ source }: { source: string }) {
  const config: Record<string, { color: string; label: string }> = {
    LIVE: { color: "#00D4AA", label: "LIVE" },
    BACKEND: { color: "#7B61FF", label: "BACKEND" },
    MOCK: { color: "#4a5568", label: "MOCK" },
    LOCAL: { color: "#8b95a5", label: "LOCAL" },
  };
  const c = config[source] || config.MOCK;
  return (
    <span
      className="inline-flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full"
      style={{ backgroundColor: c.color + "18", color: c.color }}
    >
      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: c.color }} />
      {c.label}
    </span>
  );
}

// ─── Trion Logo ─────────────────────────────────────────────────
function TrionLogo() {
  return (
    <div className="flex items-center gap-3 px-2 py-1">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #00D4AA 0%, #00A388 50%, #7B61FF 100%)",
          boxShadow: "0 0 20px rgba(0, 212, 170, 0.3)",
        }}
      >
        <Hexagon className="w-5 h-5 text-white" strokeWidth={2} />
      </div>
      <div className="flex flex-col">
        <span className="text-[15px] font-bold tracking-tight text-[#e8ecf1] leading-none">
          TRION
        </span>
        <span className="text-[9px] font-semibold tracking-[0.2em] leading-none mt-1" style={{ color: "#00D4AA" }}>
          PROTOCOL
        </span>
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────
export default function TrionDashboard() {
  const [activePage, setActivePage] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleNavClick = useCallback((id: string) => {
    setActivePage(id);
    setMobileOpen(false);
  }, []);

  const renderPage = useCallback(() => {
    switch (activePage) {
      case "overview": return <OverviewPage />;
      case "signals": return <SignalsPage />;
      case "chains": return <ChainsPage />;
      case "akashic": return <AkashicPage />;
      case "planes": return <PlanesPage />;
      case "trading": return <TradingPage />;
      case "security": return <SecurityPage />;
      case "anima": return <AnimaPage />;
      case "relayers": return <RelayersPage />;
      case "governance": return <GovernancePage />;
      case "contracts": return <ContractsPage />;
      case "beo": return <BeoPage />;
      case "protocol": return <ProtocolHealthPage />;
      case "deployments": return <DeploymentsPage />;
      case "settings": return <SettingsPage />;
      default: return null;
    }
  }, [activePage]);

  const activeNav = NAV_ITEMS.find(n => n.id === activePage);

  return (
    <div className="flex h-screen bg-[#08090d] overflow-hidden">
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

      {/* ─── Sidebar ─────────────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 0 }}
        className={`fixed lg:relative z-50 h-full flex flex-col overflow-hidden transition-colors ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          width: undefined,
          background: "linear-gradient(180deg, #0a0c12 0%, #08090d 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex-1 overflow-y-auto py-4 px-3">
          {/* Logo */}
          <div className="mb-6">
            <TrionLogo />
          </div>

          {/* Nav Items */}
          <nav className="space-y-0.5">
            {NAV_ITEMS.map((item, idx) => {
              if (item.section) {
                return (
                  <div key={item.id} className="pt-5 pb-2 px-3">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#4a5568]">
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
                  style={{
                    backgroundColor: isActive ? "rgba(0, 212, 170, 0.08)" : "transparent",
                  }}
                  whileHover={{ backgroundColor: isActive ? "rgba(0, 212, 170, 0.08)" : "rgba(255,255,255,0.03)" }}
                  initial={false}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                      style={{ backgroundColor: "#00D4AA" }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}

                  <item.icon
                    className="flex-shrink-0 transition-colors duration-200"
                    style={{
                      width: 16,
                      height: 16,
                      color: isActive ? "#00D4AA" : "#4a5568",
                    }}
                  />
                  <span
                    className="text-[12.5px] font-medium flex-1 truncate transition-colors duration-200"
                    style={{ color: isActive ? "#e8ecf1" : "#8b95a5" }}
                  >
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className="text-[8px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: (item.badgeColor || "#00D4AA") + "20",
                        color: item.badgeColor || "#00D4AA",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} className="p-3">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #00D4AA, #7B61FF)" }}
            >
              T
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-[#e8ecf1] truncate">TRION Protocol</p>
              <p className="text-[10px] text-[#4a5568] truncate">CC0 · v1.0.0 · Mainnet</p>
            </div>
            <div className="flex items-center gap-1">
              <PulsingDot color="#00D4AA" size={5} />
            </div>
          </div>
        </div>
      </motion.aside>

      {/* ─── Main Content ─────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden grid-bg">
        {/* Header */}
        <header
          className="flex-shrink-0 px-4 lg:px-6 py-3"
          style={{
            background: "rgba(8, 9, 13, 0.8)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              >
                <Menu className="w-5 h-5 text-[#8b95a5]" />
              </button>

              {/* Collapse toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              >
                {sidebarOpen
                  ? <X className="w-4 h-4 text-[#4a5568]" />
                  : <Menu className="w-4 h-4 text-[#4a5568]" />
                }
              </button>

              {/* Page title */}
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-[18px] font-bold text-[#e8ecf1] capitalize leading-none">
                    {activeNav?.label || "Overview"}
                  </h1>
                  {activeNav?.dataSource && (
                    <DataSourceBadge source={activeNav.dataSource} />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <PulsingDot color="#00D4AA" size={4} />
                  <span className="text-[10px] font-medium" style={{ color: "#00D4AA" }}>Production</span>
                  <span className="text-[10px] text-[#2a2f3a]">·</span>
                  <span className="text-[10px] text-[#4a5568]">Behavioral Truth Oracle</span>
                  <span className="text-[10px] text-[#2a2f3a]">·</span>
                  <span className="text-[10px] text-[#4a5568]">87 chains · 15 VM families</span>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px]"
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#4a5568",
                }}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search...</span>
                <span className="ml-4 text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>⌘K</span>
              </div>

              {/* Last refresh */}
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[#4a5568]">
                <RefreshCw className="w-3 h-3" />
                <span>{lastRefresh.toLocaleTimeString()}</span>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                <Bell className="w-4 h-4 text-[#8b95a5]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: "#FF5252" }} />
              </button>

              {/* Connection status */}
              <div
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                style={{
                  backgroundColor: "rgba(0, 212, 170, 0.06)",
                  border: "1px solid rgba(0, 212, 170, 0.15)",
                }}
              >
                <PulsingDot color="#00D4AA" size={4} />
                <span className="text-[10px] font-semibold" style={{ color: "#00D4AA" }}>CONNECTED</span>
              </div>
            </div>
          </div>
        </header>

        {/* ─── Page Content ────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-[1800px] mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ─── Status Bar ──────────────────────────────────────── */}
        <footer
          className="flex-shrink-0 px-4 lg:px-6 py-2 flex items-center justify-between text-[10px]"
          style={{
            background: "rgba(8, 9, 13, 0.9)",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            color: "#4a5568",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <StatusDot status="online" size={4} />
              <span>Core Engine</span>
            </div>
            <div className="flex items-center gap-1.5">
              <StatusDot status="online" size={4} />
              <span>FAISS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <StatusDot status="online" size={4} />
              <span>Relayers</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <StatusDot status="online" size={4} />
              <span>0G</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              <StatusDot status="indexing" size={4} />
              <span>ANIMA</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">106K LOC · 12 Languages · 100 Chains</span>
            <span>Master Eq: T(t) = [C(t) ≥ Θ(t)] · C(t) · e^M_moat</span>
          </div>
        </footer>
      </main>
    </div>
  );
}