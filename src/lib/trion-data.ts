// TRION Protocol — Institutional Dashboard Data Layer
// 12 languages · 100 chains · 15 VM families · 25 contracts · 345+ API routes

// ─── Types ───────────────────────────────────────────────────────
export interface ChainInfo {
  id: string; name: string; vm: string; chainId: number;
  status: "online" | "indexing" | "degraded" | "offline";
  latency: string; blockHeight: number; bhCount: number;
  color: string; icon: string; tps?: number; tvl?: string;
}

export interface SignalEntry {
  id: string; time: string; entity: string; entityShort: string;
  chain: string; chainColor: string; signalType: string;
  coherence: number; threshold: number; phi: number;
  sigma: number; anima: number; mental: number;
  status: "COHERENT" | "SILENCE" | "MANIPULATION_ALERT" | "GENESIS" | "TRAJECTORY_ANOMALY" | "RESURRECTION" | "FORK_DIVERGENCE" | "LIQUIDITY_HEALTH" | "CROSS_CHAIN_COHERENCE";
  mfScore: number; limitingPlane: string; dataSource: "LIVE" | "BACKEND" | "MOCK";
}

export interface PlaneStatus {
  name: string; symbol: string; score: number; weight: number;
  status: "active" | "bootstrap" | "degraded"; description: string;
  color: string; features: string[];
}

export interface GovernanceItem {
  id: string; title: string; type: string; status: string;
  votes: number; quorum: number; timeLeft: string;
}

export interface FalsifiabilityItem {
  id: string; description: string; status: "PASSING" | "MONITORING" | "FAILING" | "CONJECTURE";
  metric: string; threshold: string;
}

export interface ContractInfo {
  name: string; language: string; chain: string; status: "deployed" | "auditing" | "deploying" | "failed";
  address: string; verified: boolean; linesOfCode: number; functions: number;
  lastInteraction: string; type: string;
}

export interface RelayerInfo {
  name: string; chains: number; status: string; lastTx: string;
  signalsPublished?: number; blobs?: number; syncs?: number;
  daSize?: string; throughput: string; uptime: string;
}

export interface ArchetypeInfo {
  id: number; name: string; risk: "SAFE" | "CAUTION" | "DANGER" | "CRITICAL";
  count: number; color: string; description: string;
}

export interface AnimaStream {
  id: string; name: string; status: "active" | "bootstrap"; languages: number;
  patterns: number; accuracy: number; latency: string;
}

export interface TradingPair {
  pair: string; chain: string; price: string; change24h: number;
  volume24h: string; liquidity: string; firewallStatus: "PROTECTED" | "MONITORING" | "ALERT";
  bhScore: number;
}

export interface BEOEntity {
  id: string; address: string; chains: string[]; archetype: string;
  risk: string; totalTx: number; firstSeen: string; bhHistory: number[];
  coherence: number;
}

export interface CrisprSignature {
  name: string; severity: "critical" | "high" | "medium";
  matches: number; description: string; lastTriggered: string;
}

export interface DeploymentInfo {
  network: string; chainId: number; contract: string; address: string;
  status: "active" | "pending" | "failed"; txHash: string; deployedAt: string;
  blockNumber: number;
}

export interface ApiEndpoint {
  route: string; method: string; status: "active" | "deprecated" | "broken";
  calls24h: number; avgLatency: string; category: string;
}

export interface LivingSecurityComponent {
  name: string; status: "active" | "degraded" | "offline";
  score: number; description: string; icon: string;
}

// ─── Chain Colors ────────────────────────────────────────────────
export const VM_COLORS: Record<string, string> = {
  EVM: "#627EEA", SVM: "#9945FF", PVM: "#E6007A", TVM: "#0098EA",
  NEAR: "#00C1DE", STARKNET: "#7B61FF", MOVE: "#4DDFBA", SUI: "#6FBCF0",
  COSMOS: "#6F7390", UTXO: "#F7931A", TRON: "#FF0013", FUNGIBLE: "#0088CC",
};

// ─── 20 Featured Chains ─────────────────────────────────────────
export const CHAINS: ChainInfo[] = [
  { id: "eth", name: "Ethereum", vm: "EVM", chainId: 1, status: "online", latency: "312ms", blockHeight: 21482341, bhCount: 489210, color: "#627EEA", icon: "⟠", tps: 15.4, tvl: "$52.3B" },
  { id: "arb", name: "Arbitrum", vm: "EVM", chainId: 42161, status: "online", latency: "89ms", blockHeight: 298412034, bhCount: 387412, color: "#28A0F0", icon: "🔷", tps: 40.2, tvl: "$9.8B" },
  { id: "base", name: "Base", vm: "EVM", chainId: 8453, status: "online", latency: "102ms", blockHeight: 19284712, bhCount: 291034, color: "#0052FF", icon: "🔵", tps: 32.1, tvl: "$7.2B" },
  { id: "op", name: "Optimism", vm: "EVM", chainId: 10, status: "online", latency: "95ms", blockHeight: 12894012, bhCount: 234891, color: "#FF0420", icon: "🔴", tps: 28.7, tvl: "$5.1B" },
  { id: "bnb", name: "BNB Chain", vm: "EVM", chainId: 56, status: "online", latency: "78ms", blockHeight: 44892031, bhCount: 198234, color: "#F0B90B", icon: "🟡", tps: 45.0, tvl: "$4.8B" },
  { id: "matic", name: "Polygon", vm: "EVM", chainId: 137, status: "online", latency: "112ms", blockHeight: 62984102, bhCount: 287123, color: "#8247E5", icon: "🟣", tps: 50.0, tvl: "$3.1B" },
  { id: "sol", name: "Solana", vm: "SVM", chainId: 501, status: "online", latency: "41ms", blockHeight: 298471234, bhCount: 312890, color: "#9945FF", icon: "◎", tps: 65000, tvl: "$4.7B" },
  { id: "stark", name: "StarkNet", vm: "STARKNET", chainId: 7000, status: "online", latency: "134ms", blockHeight: 892410, bhCount: 89234, color: "#7B61FF", icon: "⬡", tps: 2000, tvl: "$210M" },
  { id: "ton", name: "TON", vm: "TVM", chainId: 1100, status: "online", latency: "67ms", blockHeight: 42981034, bhCount: 78234, color: "#0098EA", icon: "💎", tps: 100000, tvl: "$380M" },
  { id: "near", name: "NEAR", vm: "NEAR", chainId: 1200, status: "online", latency: "89ms", blockHeight: 198234123, bhCount: 91234, color: "#00C1DE", icon: "🌐", tps: 100000, tvl: "$320M" },
  { id: "sui", name: "Sui", vm: "SUI", chainId: 6000, status: "online", latency: "56ms", blockHeight: 8923412, bhCount: 67234, color: "#6FBCF0", icon: "💧", tps: 120000, tvl: "$580M" },
  { id: "avax", name: "Avalanche", vm: "EVM", chainId: 43114, status: "online", latency: "98ms", blockHeight: 49821034, bhCount: 134567, color: "#E84142", icon: "🔺", tps: 4500, tvl: "$890M" },
  { id: "btc", name: "Bitcoin", vm: "UTXO", chainId: 40001, status: "online", latency: "2400ms", blockHeight: 892341, bhCount: 45678, color: "#F7931A", icon: "₿", tps: 7, tvl: "$1.2T" },
  { id: "dot", name: "Polkadot", vm: "PVM", chainId: 900, status: "online", latency: "6000ms", blockHeight: 21892341, bhCount: 56789, color: "#E6007A", icon: "⚪", tps: 1000, tvl: "$280M" },
  { id: "cosmos", name: "Cosmos Hub", vm: "COSMOS", chainId: 4000, status: "online", latency: "1200ms", blockHeight: 21892341, bhCount: 45678, color: "#6F7390", icon: "⚛️", tps: 10000, tvl: "$1.1B" },
  { id: "tron", name: "TRON", vm: "TRON", chainId: 3000, status: "online", latency: "45ms", blockHeight: 69823412, bhCount: 34567, color: "#FF0013", icon: "🔶", tps: 2000, tvl: "$8.1B" },
  { id: "0g", name: "0G Chain", vm: "EVM", chainId: 16661, status: "online", latency: "201ms", blockHeight: 892412, bhCount: 234567, color: "#00D4AA", icon: "⚫", tps: 1000, tvl: "$45M" },
  { id: "scroll", name: "Scroll", vm: "EVM", chainId: 534352, status: "indexing", latency: "134ms", blockHeight: 5912834, bhCount: 89234, color: "#FFD700", icon: "📜", tps: 20, tvl: "$180M" },
  { id: "linea", name: "Linea", vm: "EVM", chainId: 59144, status: "online", latency: "145ms", blockHeight: 4981234, bhCount: 78123, color: "#61DFFF", icon: "━", tps: 15, tvl: "$120M" },
  { id: "mantle", name: "Mantle", vm: "EVM", chainId: 5000, status: "online", latency: "108ms", blockHeight: 3981234, bhCount: 67891, color: "#000000", icon: "🔷", tps: 25, tvl: "$340M" },
];

export const VM_FAMILIES = [
  { name: "EVM", chains: 53, color: "#627EEA", status: "online", description: "Ethereum Virtual Machine" },
  { name: "SVM", chains: 2, color: "#9945FF", status: "online", description: "Solana Virtual Machine" },
  { name: "STARKNET", chains: 2, color: "#7B61FF", status: "online", description: "Cairo/StarkNet VM" },
  { name: "TVM", chains: 1, color: "#0098EA", status: "online", description: "TON Virtual Machine" },
  { name: "NEAR", chains: 2, color: "#00C1DE", status: "online", description: "NEAR WASM Runtime" },
  { name: "PVM", chains: 1, color: "#E6007A", status: "online", description: "Polkadot Parachain VM" },
  { name: "SUI", chains: 1, color: "#6FBCF0", status: "online", description: "Sui Move VM" },
  { name: "UTXO", chains: 4, color: "#F7931A", status: "online", description: "Bitcoin UTXO Model" },
  { name: "COSMOS", chains: 11, color: "#6F7390", status: "online", description: "Cosmos SDK / IBC" },
  { name: "MOVE", chains: 2, color: "#4DDFBA", status: "online", description: "Move Language VM" },
  { name: "TRON", chains: 1, color: "#FF0013", status: "online", description: "TRON Virtual Machine" },
  { name: "FUNGIBLE", chains: 3, color: "#0088CC", status: "online", description: "FunC / TON Fift" },
];

// ─── Signal Generator ────────────────────────────────────────────
function generateSignals(count: number): SignalEntry[] {
  const entities = [
    "0x7a25...3f4e", "0xd8dA...6045", "0x1f98...1fFe", "0xC02a...Ae66",
    "0x6B17...1d0E", "0xA0b8...6eC2", "0x2260...FAC5", "0x5149...dC5e",
    "0xBe00...48F0", "GXCk...NEAR", "EQC...TON", "0x4eF2...cE1A",
    "0xDead...Beef", "0xSui...4a2b", "0x1a1a...2b2b",
  ];
  const chains = CHAINS.slice(0, 15);
  const signalTypes = ["VALUATION", "SILENCE", "MANIPULATION_ALERT", "GENESIS", "TRAJECTORY_ANOMALY", "RESURRECTION", "FORK_DIVERGENCE", "LIQUIDITY_HEALTH", "CROSS_CHAIN_COHERENCE"];
  const statuses: SignalEntry["status"][] = ["COHERENT", "COHERENT", "COHERENT", "COHERENT", "COHERENT", "SILENCE", "MANIPULATION_ALERT", "GENESIS", "COHERENT", "COHERENT", "CROSS_CHAIN_COHERENCE"];
  const planes = ["Physical", "Mental", "Spiritual", "Conscious", "ANIMA"];
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const t = new Date(now.getTime() - i * (1500 + Math.random() * 2500));
    const chain = chains[Math.floor(Math.random() * chains.length)];
    const sigType = signalTypes[Math.floor(Math.random() * signalTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const coherence = status === "SILENCE" ? 0.28 + Math.random() * 0.2 : status === "MANIPULATION_ALERT" ? 0.4 + Math.random() * 0.15 : 0.68 + Math.random() * 0.28;
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
      dataSource: (i < 5) ? "LIVE" as const : "MOCK" as const,
    };
  });
}

export const LIVE_SIGNALS = generateSignals(50);

// ─── Five Planes ─────────────────────────────────────────────────
export const PLANE_STATUSES: PlaneStatus[] = [
  { name: "Physical", symbol: "Φ", score: 0.842, weight: 0.25, status: "active", description: "9 Shannon entropy features", color: "#00D4AA", features: ["Tx frequency", "Amount variance", "Time entropy", "Gas deviation", "Token diversity", "Counterparty count", "Interval regularity", "Value concentration", "Pattern complexity"] },
  { name: "Mental", symbol: "M", score: 0.791, weight: 0.30, status: "active", description: "Prediction interval confidence", color: "#7B61FF", features: ["Prediction accuracy", "Interval calibration", "Model confidence", "Backtest Sharpe", "Forward return", "Risk-adjusted score"] },
  { name: "Spiritual", symbol: "Σ", score: 0.724, weight: 0.25, status: "active", description: "DW-BFT consensus diversity", color: "#FF6B6B", features: ["Validator diversity", "Cross-chain agreement", "Consensus weight", "Geographic spread", "Temporal consistency"] },
  { name: "Conscious", symbol: "K", score: 0.10, weight: 0.10, status: "bootstrap", description: "Human annotation layer", color: "#FFD93D", features: ["Annotation coverage", "Label agreement", "Expert consensus", "Quality score"] },
  { name: "ANIMA", symbol: "A", score: 0.10, weight: 0.10, status: "bootstrap", description: "AI intelligence layer", color: "#FF8C42", features: ["NLP sentiment", "Cross-language", "Pattern detection", "Anomaly flagging"] },
];

// ─── Governance ──────────────────────────────────────────────────
export const GOVERNANCE_ITEMS: GovernanceItem[] = [
  { id: "G-042", title: "Adjust Θ_min from 0.55 → 0.50 for expanded coverage", type: "PARAMETER_UPDATE", status: "active", votes: 89234, quorum: 10000, timeLeft: "3d 14h" },
  { id: "G-041", title: "Onboard Chainstack as validator (APAC region)", type: "CONTRACT_UPGRADE", status: "active", votes: 67891, quorum: 10000, timeLeft: "5d 8h" },
  { id: "G-040", title: "Slash validator #47 (accuracy < 60% for 7d)", type: "SLASH_APPEAL", status: "closed", votes: 112340, quorum: 10000, timeLeft: "Passed" },
  { id: "G-039", title: "Falsifiability F7 monitoring upgrade to 4h window", type: "ORACLE_UPDATE", status: "active", votes: 45123, quorum: 10000, timeLeft: "6d 22h" },
  { id: "G-038", title: "Emergency: HHI > 3500 DANGER response protocol", type: "EMERGENCY_PAUSE", status: "closed", votes: 145678, quorum: 10000, timeLeft: "Passed" },
  { id: "G-037", title: "Integrate Move VM support for Sui/Aptos", type: "PROTOCOL_UPGRADE", status: "queued", votes: 23456, quorum: 10000, timeLeft: "12d 4h" },
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

// ─── CRISPR Signatures ───────────────────────────────────────────
export const CRISPR_SIGNATURES: CrisprSignature[] = [
  { name: "FLASH_LOAN_LOOP", severity: "critical", matches: 0, description: "Recursive flash loan attack pattern", lastTriggered: "Never" },
  { name: "DRAIN_PATTERN", severity: "critical", matches: 0, description: "Liquidity drain across pools", lastTriggered: "Never" },
  { name: "MEV_SANDWICH", severity: "high", matches: 3, description: "Sandwich attack on DEX swaps", lastTriggered: "2h ago" },
  { name: "GOVERNANCE_HIJACK", severity: "high", matches: 0, description: "Rapid governance delegation grab", lastTriggered: "Never" },
  { name: "ORACLE_PRICE_PUSH", severity: "critical", matches: 0, description: "Oracle price manipulation attempt", lastTriggered: "Never" },
  { name: "RECURSIVE_BORROW", severity: "high", matches: 1, description: "Recursive borrowing exploit pattern", lastTriggered: "8h ago" },
  { name: "BRIDGE_EXPLOIT", severity: "critical", matches: 0, description: "Cross-chain bridge exploit signature", lastTriggered: "Never" },
  { name: "RUG_PULL_VECTOR", severity: "critical", matches: 0, description: "Token withdrawal + liquidity removal", lastTriggered: "Never" },
  { name: "HONEYPOT_DETECTION", severity: "high", matches: 5, description: "Unsellable token pattern detection", lastTriggered: "45m ago" },
  { name: "FRONT_RUN_ATTACK", severity: "medium", matches: 12, description: "Pending tx front-running detection", lastTriggered: "3m ago" },
];

// ─── Archetypes ──────────────────────────────────────────────────
export const ARCHETYPES: ArchetypeInfo[] = [
  { id: 1, name: "Organic Growth", risk: "SAFE", count: 12847, color: "#00D4AA", description: "Natural accumulation with consistent behavior" },
  { id: 2, name: "Steady Accumulator", risk: "SAFE", count: 8923, color: "#00D4AA", description: "Regular buying with low variance" },
  { id: 3, name: "DCA Investor", risk: "SAFE", count: 6234, color: "#00D4AA", description: "Dollar-cost averaging pattern" },
  { id: 4, name: "Active Trader", risk: "CAUTION", count: 14291, color: "#FFD93D", description: "High frequency, moderate risk" },
  { id: 5, name: "Yield Farmer", risk: "CAUTION", count: 7821, color: "#FFD93D", description: "Protocol hopping for yield" },
  { id: 6, name: "MEV Extractor", risk: "CAUTION", count: 8921, color: "#FF8C42", description: "MEV extraction patterns detected" },
  { id: 7, name: "Whale Movement", risk: "DANGER", count: 4523, color: "#FF6B6B", description: "Large position changes" },
  { id: 8, name: "Wash Trading", risk: "DANGER", count: 3456, color: "#FF6B6B", description: "Circular trading patterns" },
  { id: 9, name: "Liquidity Drain", risk: "CRITICAL", count: 567, color: "#FF3333", description: "Rapid liquidity withdrawal" },
  { id: 10, name: "Flash Exploit", risk: "CRITICAL", count: 12, color: "#FF3333", description: "Flash loan attack pattern" },
  { id: 11, name: "Governance Hijack", risk: "CRITICAL", count: 8, color: "#FF3333", description: "Governance takeover attempt" },
  { id: 12, name: "Bridge Exploiter", risk: "CRITICAL", count: 3, color: "#FF3333", description: "Cross-chain exploit pattern" },
];

// ─── Smart Contracts (25) ────────────────────────────────────────
export const CONTRACTS: ContractInfo[] = [
  { name: "TRIONOracle.sol", language: "Solidity", chain: "Ethereum", status: "deployed", address: "0xA85B...4199b", verified: true, linesOfCode: 487, functions: 23, lastInteraction: "12s ago", type: "Oracle" },
  { name: "TRIONOracleV3.sol", language: "Solidity", chain: "Arbitrum", status: "deployed", address: "0x0471...0A87C", verified: true, linesOfCode: 623, functions: 31, lastInteraction: "8s ago", type: "Oracle" },
  { name: "TRIONFirewall.sol", language: "Solidity", chain: "Ethereum", status: "deployed", address: "0xBe00...48F0", verified: true, linesOfCode: 342, functions: 18, lastInteraction: "3s ago", type: "Firewall" },
  { name: "TRIONExecutionGate.sol", language: "Solidity", chain: "0G Chain", status: "deployed", address: "0x1d12...94237", verified: true, linesOfCode: 891, functions: 42, lastInteraction: "1s ago", type: "Execution" },
  { name: "TRIONProtectedVault.sol", language: "Solidity", chain: "Ethereum", status: "deployed", address: "0x3a7B...e91F", verified: true, linesOfCode: 256, functions: 15, lastInteraction: "45s ago", type: "Vault" },
  { name: "ConfidentialCoherenceVault.sol", language: "Solidity", chain: "0G Chain", status: "deployed", address: "0x8Fc2...1a4B", verified: true, linesOfCode: 412, functions: 22, lastInteraction: "2m ago", type: "Vault" },
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

// ─── Relayers ────────────────────────────────────────────────────
export const RELAYER_STATUS: RelayerInfo[] = [
  { name: "EVM Relayer", chains: 48, status: "live", lastTx: "12s ago", signalsPublished: 48291, throughput: "342 sig/min", uptime: "99.97%" },
  { name: "Extended Relayer", chains: 38, status: "live", lastTx: "45s ago", signalsPublished: 29103, throughput: "198 sig/min", uptime: "99.91%" },
  { name: "Native VM Relayer", chains: 5, status: "live", lastTx: "2m ago", signalsPublished: 8923, throughput: "67 sig/min", uptime: "99.84%" },
  { name: "0G DA Streamer", chains: 1, status: "live", lastTx: "8s ago", blobs: 12847, throughput: "12 blobs/min", uptime: "99.99%" },
  { name: "0G Storage Sync", chains: 1, status: "live", lastTx: "34m ago", syncs: 892, throughput: "2.1 syncs/min", uptime: "99.95%" },
  { name: "0G Compute Engine", chains: 1, status: "live", lastTx: "5s ago", throughput: "847 req/min", uptime: "99.98%" },
  { name: "0G KV Stream", chains: 1, status: "live", lastTx: "1s ago", throughput: "4.2K ops/min", uptime: "99.99%" },
];

// ─── Deployments ─────────────────────────────────────────────────
export const DEPLOYMENTS: DeploymentInfo[] = [
  { network: "0G Mainnet", chainId: 16661, contract: "TRIONExecutionGate", address: "0xA85B...4199b", status: "active", txHash: "0xabc...123", deployedAt: "2025-11-15", blockNumber: 892412 },
  { network: "0G Galileo (Test)", chainId: 16602, contract: "OracleV3", address: "0x0471...0A87C", status: "active", txHash: "0xdef...456", deployedAt: "2025-10-20", blockNumber: 678234 },
  { network: "Arb Sepolia", chainId: 421614, contract: "TRIONSensingOracle", address: "0x1d12...94237", status: "active", txHash: "0xghi...789", deployedAt: "2025-09-10", blockNumber: 1234567 },
  { network: "Polygon Amoy", chainId: 80002, contract: "TRIONOracleV3", address: "0x3a7B...e91F", status: "active", txHash: "0xjkl...012", deployedAt: "2025-09-05", blockNumber: 5678901 },
  { network: "Base Sepolia", chainId: 84532, contract: "TRIONPriceFeed", address: "0x8Fc2...1a4B", status: "active", txHash: "0xmno...345", deployedAt: "2025-08-28", blockNumber: 2345678 },
  { network: "BNB Testnet", chainId: 97, contract: "AkashicProof", address: "0x12D4...fE02", status: "active", txHash: "0xpqr...678", deployedAt: "2025-08-15", blockNumber: 3456789 },
  { network: "StarkNet Sepolia", chainId: 7001, contract: "TRIONOracle.cairo", address: "0x0abc...7890", status: "active", txHash: "0xstu...901", deployedAt: "2025-12-01", blockNumber: 234567 },
  { network: "TON Testnet", chainId: -1, contract: "trion_gate.fc", address: "EQC...abc", status: "active", txHash: "vwx...234", deployedAt: "2025-11-20", blockNumber: 42981034 },
];

// ─── ANIMA Streams ───────────────────────────────────────────────
export const ANIMA_STREAMS: AnimaStream[] = [
  { id: "ANIMA-NLP", name: "Natural Language Processing", status: "active", languages: 54, patterns: 32, accuracy: 94.7, latency: "120ms" },
  { id: "ANIMA-SENTIMENT", name: "Cross-Chain Sentiment", status: "active", languages: 54, patterns: 18, accuracy: 89.2, latency: "85ms" },
  { id: "ANIMA-ENTITY", name: "Entity Resolution", status: "active", languages: 42, patterns: 24, accuracy: 91.8, latency: "200ms" },
  { id: "ANIMA-ANOMALY", name: "Anomaly Detection", status: "bootstrap", languages: 12, patterns: 8, accuracy: 76.3, latency: "340ms" },
];

// ─── Trading Pairs ───────────────────────────────────────────────
export const TRADING_PAIRS: TradingPair[] = [
  { pair: "ETH/USDC", chain: "Ethereum", price: "$3,847.23", change24h: 2.4, volume24h: "$2.1B", liquidity: "$890M", firewallStatus: "PROTECTED", bhScore: 0.891 },
  { pair: "BTC/USDC", chain: "Ethereum", price: "$98,421.50", change24h: -0.8, volume24h: "$4.7B", liquidity: "$1.2B", firewallStatus: "PROTECTED", bhScore: 0.923 },
  { pair: "SOL/USDC", chain: "Solana", price: "$187.34", change24h: 5.2, volume24h: "$890M", liquidity: "$340M", firewallStatus: "PROTECTED", bhScore: 0.856 },
  { pair: "ARB/USDC", chain: "Arbitrum", price: "$1.23", change24h: -1.2, volume24h: "$340M", liquidity: "$120M", firewallStatus: "PROTECTED", bhScore: 0.812 },
  { pair: "TON/USDC", chain: "TON", price: "$6.78", change24h: 3.1, volume24h: "$120M", liquidity: "$45M", firewallStatus: "MONITORING", bhScore: 0.743 },
  { pair: "NEAR/USDC", chain: "NEAR", price: "$7.12", change24h: 1.8, volume24h: "$89M", liquidity: "$34M", firewallStatus: "PROTECTED", bhScore: 0.823 },
  { pair: "SUI/USDC", chain: "Sui", price: "$4.56", change24h: -2.1, volume24h: "$67M", liquidity: "$23M", firewallStatus: "MONITORING", bhScore: 0.698 },
  { pair: "MATIC/USDC", chain: "Polygon", price: "$0.72", change24h: 0.5, volume24h: "$230M", liquidity: "$89M", firewallStatus: "PROTECTED", bhScore: 0.845 },
];

// ─── BEO Entities ────────────────────────────────────────────────
export const BEO_ENTITIES: BEOEntity[] = [
  { id: "BEO-001", address: "0x7a25...3f4e", chains: ["Ethereum", "Arbitrum", "Base"], archetype: "Organic Growth", risk: "LOW", totalTx: 1247, firstSeen: "2024-03-15", bhHistory: [0.7, 0.75, 0.82, 0.85, 0.87, 0.89, 0.91, 0.89, 0.92, 0.91], coherence: 0.912 },
  { id: "BEO-002", address: "0xd8dA...6045", chains: ["Ethereum", "Optimism"], archetype: "Whale Movement", risk: "MEDIUM", totalTx: 892, firstSeen: "2024-01-20", bhHistory: [0.6, 0.65, 0.58, 0.52, 0.48, 0.45, 0.43, 0.41], coherence: 0.412 },
  { id: "BEO-003", address: "0x1f98...1fFe", chains: ["Ethereum", "BNB", "Polygon"], archetype: "Yield Farmer", risk: "MEDIUM", totalTx: 3421, firstSeen: "2023-11-08", bhHistory: [0.8, 0.78, 0.81, 0.79, 0.82, 0.80, 0.83, 0.81, 0.84, 0.82], coherence: 0.823 },
  { id: "BEO-004", address: "0xDead...Beef", chains: ["Ethereum"], archetype: "Flash Exploit", risk: "CRITICAL", totalTx: 3, firstSeen: "2025-06-12", bhHistory: [0.9, 0.1, 0.05], coherence: 0.048 },
  { id: "BEO-005", address: "GXCk...NEAR", chains: ["NEAR", "Ethereum"], archetype: "Active Trader", risk: "LOW", totalTx: 8923, firstSeen: "2024-05-22", bhHistory: [0.7, 0.72, 0.71, 0.74, 0.73, 0.75, 0.76, 0.74, 0.77, 0.78], coherence: 0.782 },
];

// ─── Living Security Components ──────────────────────────────────
export const LIVING_SECURITY: LivingSecurityComponent[] = [
  { name: "Genomic Key Evolution", status: "active", score: 0.98, description: "SHA3-256 hash chain · GK #482,191", icon: "Key" },
  { name: "Epigenetic State", status: "active", score: 0.94, description: "8-component DNA-mimetic system", icon: "Dna" },
  { name: "PQC Layer", status: "active", score: 0.99, description: "ML-DSA-87 · CRYSTALS-Dilithium", icon: "Shield" },
  { name: "CRISPR Engine", status: "active", score: 0.87, description: "10 attack signatures · real-time", icon: "Scissors" },
  { name: "Mutation Defense", status: "active", score: 0.92, description: "Adaptive response to novel attacks", icon: "Zap" },
  { name: "Behavioral Immune", status: "active", score: 0.89, description: "Cross-chain behavioral firewall", icon: "Brain" },
  { name: "Provenance Chain", status: "active", score: 0.96, description: "Merkle-256 data provenance", icon: "Link" },
  { name: "Consensus Immunity", status: "degraded", score: 0.78, description: "DW-BFT validator diversity", icon: "Users" },
];

// ─── API Endpoints (sample) ──────────────────────────────────────
export const API_ENDPOINTS: ApiEndpoint[] = [
  { route: "/api/v1/oracle/signal", method: "POST", status: "active", calls24h: 89234, avgLatency: "45ms", category: "Oracle" },
  { route: "/api/v1/oracle/coherence", method: "GET", status: "active", calls24h: 124567, avgLatency: "12ms", category: "Oracle" },
  { route: "/api/v1/oracle/bh/<address>", method: "GET", status: "active", calls24h: 45678, avgLatency: "23ms", category: "Oracle" },
  { route: "/api/v1/firewall/check", method: "POST", status: "active", calls24h: 67891, avgLatency: "34ms", category: "Firewall" },
  { route: "/api/v1/firewall/allowlist", method: "GET", status: "active", calls24h: 23456, avgLatency: "8ms", category: "Firewall" },
  { route: "/api/v1/akashic/search", method: "POST", status: "active", calls24h: 34567, avgLatency: "67ms", category: "Akashic" },
  { route: "/api/v1/akashic/archetype/<id>", method: "GET", status: "active", calls24h: 12345, avgLatency: "15ms", category: "Akashic" },
  { route: "/api/v1/security/crispr", method: "GET", status: "active", calls24h: 8901, avgLatency: "28ms", category: "Security" },
  { route: "/api/v1/governance/proposals", method: "GET", status: "active", calls24h: 5678, avgLatency: "18ms", category: "Governance" },
  { route: "/api/v1/anima/sentiment/<chain>", method: "GET", status: "active", calls24h: 23456, avgLatency: "89ms", category: "ANIMA" },
  { route: "/api/v1/0g/store", method: "POST", status: "active", calls24h: 12847, avgLatency: "156ms", category: "0G" },
  { route: "/api/v1/0g/da/blob", method: "POST", status: "active", calls24h: 12847, avgLatency: "234ms", category: "0G" },
  { route: "/api/v1/relayer/status", method: "GET", status: "active", calls24h: 34567, avgLatency: "5ms", category: "Relayer" },
  { route: "/health", method: "GET", status: "active", calls24h: 234567, avgLatency: "2ms", category: "System" },
  { route: "/api/v1/beo/entity/<id>", method: "GET", status: "active", calls24h: 7890, avgLatency: "34ms", category: "BEO" },
];

// ─── Language Stats ──────────────────────────────────────────────
export const LANGUAGE_STATS = [
  { language: "Python", files: 45, lines: 28400, color: "#3776AB", role: "Core Engine, FAISS, API" },
  { language: "Rust", files: 38, lines: 18900, color: "#CE422B", role: "Chain Indexers, FAISS, WASM" },
  { language: "Solidity", files: 8, lines: 4200, color: "#627EEA", role: "Smart Contracts (EVM)" },
  { language: "TypeScript", files: 18, lines: 12300, color: "#3178C6", role: "Chain Adapters, 0G, SDK" },
  { language: "JavaScript", files: 12, lines: 8900, color: "#F7DF1E", role: "Relayers, Tooling" },
  { language: "Go", files: 8, lines: 6700, color: "#00ADD8", role: "P2P, Consensus" },
  { language: "Cairo", files: 3, lines: 854, color: "#7B61FF", role: "StarkNet Contracts" },
  { language: "FunC", files: 4, lines: 1024, color: "#0088CC", role: "TON Contracts" },
  { language: "Vyper", files: 2, lines: 390, color: "#1A1A2E", role: "EVM Contracts" },
  { language: "Haskell", files: 3, lines: 1200, color: "#5D4F85", role: "Formal Verification" },
  { language: "Julia", files: 2, lines: 680, color: "#9558B2", role: "Statistical Models" },
  { language: "C++/WASM", files: 5, lines: 3100, color: "#00599C", role: "Native Performance" },
];

// ─── Helpers ─────────────────────────────────────────────────────
export function generateNewSignal(): SignalEntry {
  const entities = ["0x7a25...3f4e", "0xd8dA...6045", "0x1f98...1fFe", "0xC02a...Ae66", "0x6B17...1d0E", "0xA0b8...6eC2", "0xBe00...48F0", "GXCk...NEAR"];
  const chains = CHAINS.slice(0, 15);
  const signalTypes = ["VALUATION", "SILENCE", "MANIPULATION_ALERT", "GENESIS", "TRAJECTORY_ANOMALY", "LIQUIDITY_HEALTH"];
  const statuses: SignalEntry["status"][] = ["COHERENT", "COHERENT", "COHERENT", "COHERENT", "SILENCE", "MANIPULATION_ALERT"];
  const planes = ["Physical", "Mental", "Spiritual", "Conscious", "ANIMA"];
  const chain = chains[Math.floor(Math.random() * chains.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const coherence = status === "SILENCE" ? 0.28 + Math.random() * 0.2 : 0.68 + Math.random() * 0.28;
  const threshold = 0.55 + Math.random() * 0.15;
  return {
    id: `SIG-${Date.now().toString().slice(-6)}`,
    time: new Date().toTimeString().split(" ")[0],
    entity: entities[Math.floor(Math.random() * entities.length)],
    entityShort: entities[Math.floor(Math.random() * entities.length)].slice(0, 8),
    chain: chain.name, chainColor: chain.color,
    signalType: signalTypes[Math.floor(Math.random() * signalTypes.length)],
    coherence: Math.round(coherence * 1000) / 1000,
    threshold: Math.round(threshold * 1000) / 1000,
    phi: Math.round((coherence * 0.25 + Math.random() * 0.1) * 1000) / 1000,
    sigma: Math.round((coherence * 0.25 + Math.random() * 0.05) * 1000) / 1000,
    anima: Math.round((0.1 + Math.random() * 0.6) * 1000) / 1000,
    mental: Math.round((coherence * 0.3 + Math.random() * 0.1) * 1000) / 1000,
    status, mfScore: Math.round(Math.random() * 100) / 100,
    limitingPlane: planes[Math.floor(Math.random() * planes.length)],
    dataSource: "LIVE" as const,
  };
}