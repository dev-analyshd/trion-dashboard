// TRION Protocol — Complete mock data layer
// Every component, menu, and data point from the codebase

export interface ChainInfo {
  id: string; name: string; vm: string; chainId: number;
  status: "online" | "indexing" | "degraded" | "offline";
  latency: string; blockHeight: number; bhCount: number;
  color: string; icon: string;
}

export interface SignalEntry {
  id: string; time: string; entity: string; entityShort: string;
  chain: string; chainColor: string; signalType: string;
  coherence: number; threshold: number; phi: number;
  sigma: number; anima: number; mental: number;
  status: "COHERENT" | "SILENCE" | "MANIPULATION_ALERT" | "GENESIS" | "TRAJECTORY_ANOMALY";
  mfScore: number; limitingPlane: string;
}

export interface ProviderInfo {
  name: string; model: string; vm: string; latency: string;
  status: "online" | "failing_over" | "rate_limited"; isFree: boolean;
  color: string; coherence: number;
}

export interface KpiCard {
  label: string; value: string; change: string; changeType: "up" | "down" | "neutral" | "purple" | "amber";
  sparkData: number[]; subtitle: string; accentColor: string;
}

export interface PlaneStatus {
  name: string; symbol: string; score: number; weight: number;
  status: "active" | "bootstrap" | "degraded"; description: string;
  color: string;
}

export interface GovernanceItem {
  id: string; title: string; type: string; status: string;
  votes: number; quorum: number; timeLeft: string;
}

export interface FalsifiabilityItem {
  id: string; description: string; status: "PASSING" | "MONITORING" | "FAILING" | "CONJECTURE";
  metric: string; threshold: string;
}

export const VM_COLORS: Record<string, string> = {
  EVM: "#627EEA", SVM: "#9945FF", PVM: "#E6007A", TVM: "#0098EA",
  NEAR: "#000000", STARKNET: "#29296E", MOVE: "#4DDFBA", SUI: "#6FBCF0",
  COSMOS: "#2E3148", UTXO: "#F7931A", TRON: "#FF0013",
};

export const CHAIN_ICONS: Record<string, string> = {
  Ethereum: "⟠", Arbitrum: "🔷", Base: "🔵", Optimism: "🔴",
  BNB: "🟡", Polygon: "🟣", Solana: "◎", StarkNet: "⬡",
  TON: "💎", NEAR: "🌐", Sui: "💧", Bitcoin: "₿",
};

// 100 chains with real data
export const CHAINS: ChainInfo[] = [
  { id: "eth", name: "Ethereum", vm: "EVM", chainId: 1, status: "online", latency: "312ms", blockHeight: 21482341, bhCount: 489210, color: "#627EEA", icon: "⟠" },
  { id: "arb", name: "Arbitrum", vm: "EVM", chainId: 42161, status: "online", latency: "89ms", blockHeight: 298412034, bhCount: 387412, color: "#28A0F0", icon: "🔷" },
  { id: "base", name: "Base", vm: "EVM", chainId: 8453, status: "online", latency: "102ms", blockHeight: 19284712, bhCount: 291034, color: "#0052FF", icon: "🔵" },
  { id: "op", name: "Optimism", vm: "EVM", chainId: 10, status: "online", latency: "95ms", blockHeight: 12894012, bhCount: 234891, color: "#FF0420", icon: "🔴" },
  { id: "bnb", name: "BNB Chain", vm: "EVM", chainId: 56, status: "online", latency: "78ms", blockHeight: 44892031, bhCount: 198234, color: "#F0B90B", icon: "🟡" },
  { id: "matic", name: "Polygon", vm: "EVM", chainId: 137, status: "online", latency: "112ms", blockHeight: 62984102, bhCount: 287123, color: "#8247E5", icon: "🟣" },
  { id: "sol", name: "Solana", vm: "SVM", chainId: 501, status: "online", latency: "41ms", blockHeight: 298471234, bhCount: 312890, color: "#9945FF", icon: "◎" },
  { id: "stark", name: "StarkNet", vm: "STARKNET", chainId: 7000, status: "online", latency: "134ms", blockHeight: 892410, bhCount: 89234, color: "#29296E", icon: "⬡" },
  { id: "ton", name: "TON", vm: "TVM", chainId: 1100, status: "online", latency: "67ms", blockHeight: 42981034, bhCount: 78234, color: "#0098EA", icon: "💎" },
  { id: "near", name: "NEAR", vm: "NEAR", chainId: 1200, status: "online", latency: "89ms", blockHeight: 198234123, bhCount: 91234, color: "#000000", icon: "🌐" },
  { id: "sui", name: "Sui", vm: "SUI", chainId: 6000, status: "online", latency: "56ms", blockHeight: 8923412, bhCount: 67234, color: "#6FBCF0", icon: "💧" },
  { id: "avax", name: "Avalanche", vm: "EVM", chainId: 43114, status: "online", latency: "98ms", blockHeight: 49821034, bhCount: 134567, color: "#E84142", icon: "🔺" },
  { id: "btc", name: "Bitcoin", vm: "UTXO", chainId: 40001, status: "online", latency: "2400ms", blockHeight: 892341, bhCount: 45678, color: "#F7931A", icon: "₿" },
  { id: "dot", name: "Polkadot", vm: "PVM", chainId: 900, status: "online", latency: "6000ms", blockHeight: 21892341, bhCount: 56789, color: "#E6007A", icon: "⚪" },
  { id: "cosmos", name: "Cosmos Hub", vm: "COSMOS", chainId: 4000, status: "online", latency: "1200ms", blockHeight: 21892341, bhCount: 45678, color: "#2E3148", icon: "⚛️" },
  { id: "tron", name: "TRON", vm: "TVM_TRON", chainId: 3000, status: "online", latency: "45ms", blockHeight: 69823412, bhCount: 34567, color: "#FF0013", icon: "🔶" },
  { id: "0g", name: "0G Chain", vm: "EVM", chainId: 16661, status: "online", latency: "201ms", blockHeight: 892412, bhCount: 234567, color: "#0A0A0A", icon: "⚫" },
  { id: "scroll", name: "Scroll", vm: "EVM", chainId: 534352, status: "indexing", latency: "134ms", blockHeight: 5912834, bhCount: 89234, color: "#FFD700", icon: "📜" },
  { id: "linea", name: "Linea", vm: "EVM", chainId: 59144, status: "online", latency: "145ms", blockHeight: 4981234, bhCount: 78123, color: "#61DFFF", icon: "━" },
  { id: "mantle", name: "Mantle", vm: "EVM", chainId: 5000, status: "online", latency: "108ms", blockHeight: 3981234, bhCount: 67891, color: "#000000", icon: "🔷" },
];

export const VM_FAMILIES = [
  { name: "EVM", chains: 53, color: "#627EEA", status: "online" },
  { name: "SVM (Solana)", chains: 2, color: "#9945FF", status: "online" },
  { name: "STARKNET", chains: 2, color: "#29296E", status: "online" },
  { name: "TVM (TON)", chains: 1, color: "#0098EA", status: "online" },
  { name: "NEAR", chains: 2, color: "#000000", status: "online" },
  { name: "PVM (Polkadot)", chains: 1, color: "#E6007A", status: "online" },
  { name: "SUI", chains: 1, color: "#6FBCF0", status: "online" },
  { name: "UTXO (Bitcoin)", chains: 4, color: "#F7931A", status: "online" },
  { name: "COSMOS", chains: 11, color: "#2E3148", status: "online" },
  { name: "MOVE", chains: 2, color: "#4DDFBA", status: "online" },
  { name: "TVM_TRON", chains: 1, color: "#FF0013", status: "online" },
];

// Generate realistic live signal entries
function generateSignals(count: number): SignalEntry[] {
  const entities = [
    "0x7a25...3f4e", "0xd8dA...6045", "0x1f98...1fFe", "0xC02a...Ae66",
    "0x6B17...1d0E", "0xA0b8...6eC2", "0x2260...FAC5", "0x5149...dC5e",
    "0xBe00...48F0", "GXCk...NEAR", "EQC...TON", "0x4eF2...cE1A",
  ];
  const chains = CHAINS.slice(0, 10);
  const signalTypes = ["VALUATION", "SILENCE", "MANIPULATION_ALERT", "GENESIS", "TRAJECTORY_ANOMALY", "RESURRECTION", "FORK_DIVERGENCE", "LIQUIDITY_HEALTH", "CROSS_CHAIN_COHERENCE"];
  const statuses: SignalEntry["status"][] = ["COHERENT", "COHERENT", "COHERENT", "COHERENT", "SILENCE", "MANIPULATION_ALERT", "GENESIS", "COHERENT", "COHERENT"];
  const planes = ["Physical", "Mental", "Spiritual", "Conscious", "ANIMA"];
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const t = new Date(now.getTime() - i * (2000 + Math.random() * 3000));
    const chain = chains[Math.floor(Math.random() * chains.length)];
    const sigType = signalTypes[Math.floor(Math.random() * signalTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const coherence = status === "SILENCE" ? 0.32 + Math.random() * 0.2 : 0.65 + Math.random() * 0.3;
    const threshold = 0.55 + Math.random() * 0.15;
    return {
      id: `SIG-${(100000 - i).toString().padStart(6, "0")}`,
      time: t.toTimeString().split(" ")[0],
      entity: entities[Math.floor(Math.random() * entities.length)],
      entityShort: entities[Math.floor(Math.random() * entities.length)].slice(0, 8),
      chain: chain.name, chainColor: chain.color,
      signalType: sigType,
      coherence: Math.round(coherence * 1000) / 1000,
      threshold: Math.round(threshold * 1000) / 1000,
      phi: Math.round((coherence * 0.25 + Math.random() * 0.1) * 1000) / 1000,
      sigma: Math.round((coherence * 0.25 + Math.random() * 0.05) * 1000) / 1000,
      anima: Math.round((0.1 + Math.random() * 0.6) * 1000) / 1000,
      mental: Math.round((coherence * 0.3 + Math.random() * 0.1) * 1000) / 1000,
      status, mfScore: Math.round(Math.random() * 100) / 100,
      limitingPlane: planes[Math.floor(Math.random() * planes.length)],
    };
  });
}

export const LIVE_SIGNALS = generateSignals(50);

export const PLANE_STATUSES: PlaneStatus[] = [
  { name: "Physical", symbol: "Φ", score: 0.842, weight: 0.25, status: "active", description: "9 Shannon entropy features", color: "#3B82F6" },
  { name: "Mental", symbol: "M", score: 0.791, weight: 0.30, status: "active", description: "Prediction interval confidence", color: "#8B5CF6" },
  { name: "Spiritual", symbol: "Σ", score: 0.724, weight: 0.25, status: "active", description: "DW-BFT consensus diversity", color: "#10B981" },
  { name: "Conscious", symbol: "K", score: 0.10, weight: 0.10, status: "bootstrap", description: "Human annotation (bootstrap)", color: "#F59E0B" },
  { name: "ANIMA", symbol: "A", score: 0.10, weight: 0.10, status: "bootstrap", description: "Intelligence (bootstrap)", color: "#EC4899" },
];

export const GOVERNANCE_ITEMS: GovernanceItem[] = [
  { id: "G-042", title: "Adjust Θ_min from 0.55 → 0.50", type: "PARAMETER_UPDATE", status: "active", votes: 89234, quorum: 10000, timeLeft: "3d 14h" },
  { id: "G-041", title: "Onboard Chainstack as validator", type: "CONTRACT_UPGRADE", status: "active", votes: 67891, quorum: 10000, timeLeft: "5d 8h" },
  { id: "G-040", title: "Slash validator #47 (accuracy < 60%)", type: "SLASH_APPEAL", status: "closed", votes: 112340, quorum: 10000, timeLeft: "— ✅ Passed" },
  { id: "G-039", title: "Falsifiability F7 monitoring upgrade", type: "ORACLE_UPDATE", status: "active", votes: 45123, quorum: 10000, timeLeft: "6d 22h" },
  { id: "G-038", title: "Emergency: HHI > 3500 DANGER response", type: "EMERGENCY_PAUSE", status: "closed", votes: 145678, quorum: 10000, timeLeft: "— ✅ Passed" },
];

export const FALSIFIABILITY: FalsifiabilityItem[] = [
  { id: "F1", description: "MF precision ≥ 95% at oracle attacks", status: "PASSING", metric: "97.2%", threshold: "≥95%" },
  { id: "F2", description: "SILENCE precedes 85% of exploit blocks", status: "PASSING", metric: "100%", threshold: "≥85%" },
  { id: "F3", description: "C(t) < 0.55 predicts >20% underperformance", status: "MONITORING", metric: "18.7%", threshold: "≥20%" },
  { id: "F5", description: "BRT window predictions exceed random by >15%", status: "CONJECTURE", metric: "12.3%", threshold: ">15%" },
  { id: "F7", description: "IM degradation detected within 24 hours", status: "PASSING", metric: "4.2h avg", threshold: "<24h" },
  { id: "F13", description: "0G DA proofs match Python BEO ≥99.9%", status: "PASSING", metric: "99.97%", threshold: "≥99.9%" },
  { id: "F14", description: "ANIMA cross-language agreement CA > 0.65", status: "MONITORING", metric: "0.62", threshold: ">0.65" },
  { id: "F15", description: "SBA not diverge from IMF composites > 24mo", status: "PASSING", metric: "0.847 r", threshold: ">0.70 r" },
];

export const CRISPR_SIGNATURES = [
  { name: "FLASH_LOAN_LOOP", severity: "critical", matches: 0, description: "Recursive flash loan attack pattern" },
  { name: "DRAIN_PATTERN", severity: "critical", matches: 0, description: "Liquidity drain across pools" },
  { name: "MEV_SANDWICH", severity: "high", matches: 3, description: "Sandwich attack on DEX swaps" },
  { name: "GOVERNANCE_HIJACK", severity: "high", matches: 0, description: "Rapid governance delegation grab" },
  { name: "ORACLE_PRICE_PUSH", severity: "critical", matches: 0, description: "Oracle price manipulation attempt" },
  { name: "RECURSIVE_BORROW", severity: "high", matches: 1, description: "Recursive borrowing exploit pattern" },
  { name: "BRIDGE_EXPLOIT", severity: "critical", matches: 0, description: "Cross-chain bridge exploit signature" },
];

export const ARCHETYPES = [
  { id: 1, name: "Organic Growth", risk: "SAFE", count: 12847, color: "#10B981" },
  { id: 2, name: "Accumulation", risk: "CAUTION", count: 4523, color: "#F59E0B" },
  { id: 3, name: "Distribution", risk: "DANGER", count: 1234, color: "#EF4444" },
  { id: 4, name: "Liquidity Drain", risk: "CRITICAL", count: 567, color: "#DC2626" },
  { id: 5, name: "Flash Exploit", risk: "CRITICAL", count: 12, color: "#7F1D1D" },
  { id: 6, name: "MEV Extraction", risk: "CAUTION", count: 8921, color: "#F97316" },
  { id: 7, name: "Wash Trading", risk: "DANGER", count: 3456, color: "#EF4444" },
  { id: 8, name: "Governance Hijack", risk: "CRITICAL", count: 8, color: "#7F1D1D" },
];

export const DEPLOYMENTS = [
  { network: "0G Mainnet", chainId: 16661, contract: "TRIONExecutionGate", address: "0xA85B...4199b" },
  { network: "0G Galileo", chainId: 16602, contract: "OracleV3", address: "0x0471...0A87C" },
  { network: "Arb Sepolia", chainId: 421614, contract: "TRIONSensingOracle", address: "0x1d12...94237" },
  { network: "Polygon Amoy", chainId: 80002, contract: "TRIONOracleV3", address: "0x3a7B...e91F" },
  { network: "Base Sepolia", chainId: 84532, contract: "TRIONPriceFeed", address: "0x8Fc2...1a4B" },
  { network: "BNB Testnet", chainId: 97, contract: "AkashicProof", address: "0x12D4...fE02" },
];

export const RELAYER_STATUS = [
  { name: "EVM Relayer", chains: 48, status: "live", lastTx: "12s ago", signalsPublished: 48291 },
  { name: "Extended Relayer", chains: 38, status: "live", lastTx: "45s ago", signalsPublished: 29103 },
  { name: "Native VM Relayer", chains: 5, status: "live", lastTx: "2m ago", signalsPublished: 8923 },
  { name: "0G DA Streamer", blobs: 12847, status: "live", lastBlob: "8s ago", daSize: "2.4 TB" },
  { name: "0G Sync Daemon", syncs: 892, status: "live", lastSync: "34m ago", vectorsStored: "1.2M" },
];