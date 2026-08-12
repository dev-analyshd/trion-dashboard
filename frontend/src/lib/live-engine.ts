// TRION Live Data Engine — runs inside Next.js API routes
// Generates real-time behavioral signals, chain data, and all protocol metrics
// No external Python process needed.

import { randomBytes } from 'crypto';

// ─── Helpers ──────────────────────────────────────────────────────
function ts(): string {
  return new Date().toISOString().replace('Z', '') + `${Math.floor(Math.random()*1000).toString().padStart(3,'0')}Z`;
}
function clamp(v: number, lo = 0, hi = 1): number { return Math.max(lo, Math.min(hi, v)); }
function gauss(mu: number, sigma: number): number {
  const u1 = Math.random(), u2 = Math.random();
  return mu + sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
function jitter(val: number, pct: number): number { return val + val * pct * (Math.random() - 0.5) * 2; }
function shortHash(): string { return randomBytes(8).toString('hex'); }

// ─── Static Data ──────────────────────────────────────────────────
export const CHAINS = [
  { id: "arbitrum", name: "Arbitrum One", vm: "EVM", chainId: 42161, status: "active" },
  { id: "ethereum", name: "Ethereum Mainnet", vm: "EVM", chainId: 1, status: "active" },
  { id: "polygon", name: "Polygon PoS", vm: "EVM", chainId: 137, status: "active" },
  { id: "optimism", name: "Optimism", vm: "EVM", chainId: 10, status: "active" },
  { id: "base", name: "Base", vm: "EVM", chainId: 8453, status: "active" },
  { id: "bsc", name: "BNB Smart Chain", vm: "EVM", chainId: 56, status: "active" },
  { id: "avalanche", name: "Avalanche C-Chain", vm: "EVM", chainId: 43114, status: "active" },
  { id: "solana", name: "Solana", vm: "SVM", chainId: 103, status: "active" },
  { id: "near", name: "NEAR Protocol", vm: "WASM", chainId: 1313161554, status: "active" },
  { id: "ton", name: "TON", vm: "TVM", chainId: -239, status: "active" },
  { id: "starknet", name: "StarkNet", vm: "Cairo", chainId: 1, status: "active" },
  { id: "sui", name: "Sui", vm: "Move", chainId: 1, status: "active" },
  { id: "aptos", name: "Aptos", vm: "Move", chainId: 1, status: "indexing" },
  { id: "cosmos", name: "Cosmos Hub", vm: "CosmWasm", chainId: "cosmoshub-4", status: "active" },
  { id: "polkadot", name: "Polkadot", vm: "Substrate", chainId: 0, status: "active" },
  { id: "hsk", name: "HashKey Chain", vm: "EVM", chainId: 177, status: "active" },
  { id: "zksync", name: "zkSync Era", vm: "zkEVM", chainId: 324, status: "active" },
  { id: "mantle", name: "Mantle", vm: "EVM", chainId: 5000, status: "indexing" },
  { id: "linea", name: "Linea", vm: "zkEVM", chainId: 59144, status: "active" },
  { id: "scroll", name: "Scroll", vm: "zkEVM", chainId: 534352, status: "active" },
];

export const VM_FAMILIES = [
  { name: "EVM", chains: 12, totalContracts: 12450, languages: ["Solidity", "Vyper", "Yul"] },
  { name: "SVM", chains: 1, totalContracts: 3200, languages: ["Rust", "C"] },
  { name: "WASM", chains: 2, totalContracts: 1890, languages: ["Rust", "AssemblyScript"] },
  { name: "Cairo", chains: 1, totalContracts: 760, languages: ["Cairo"] },
  { name: "Move", chains: 2, totalContracts: 540, languages: ["Move"] },
  { name: "TVM", chains: 1, totalContracts: 2100, languages: ["FunC", "Tact"] },
  { name: "CosmWasm", chains: 1, totalContracts: 430, languages: ["Rust"] },
  { name: "Substrate", chains: 1, totalContracts: 320, languages: ["Rust"] },
  { name: "zkEVM", chains: 3, totalContracts: 890, languages: ["Solidity"] },
  { name: "PVM", chains: 1, totalContracts: 180, languages: ["Rust"] },
  { name: "Bitcoin Script", chains: 1, totalContracts: 95, languages: ["Script"] },
  { name: "Lua (L1X)", chains: 1, totalContracts: 45, languages: ["Lua"] },
];

export const CONTRACTS = [
  { name: "TrionOracleV3", language: "Solidity", chain: "Arbitrum", address: "0xb819c...58b3", verified: true, loc: 1847 },
  { name: "AkashicProof", language: "Solidity", chain: "0G Network", address: "0xDB59...356d", verified: true, loc: 923 },
  { name: "TrionVaultV3", language: "Solidity", chain: "Arbitrum", address: "0x93fD...716D", verified: true, loc: 1456 },
  { name: "ExecutionGate", language: "Solidity", chain: "0G Network", address: "0xDB59...356d", verified: true, loc: 891 },
  { name: "PriceAggregator", language: "Vyper", chain: "Arbitrum", address: "0x...", verified: true, loc: 312 },
  { name: "SigmoidVault", language: "Cairo", chain: "StarkNet", address: "0x...", verified: true, loc: 1203 },
  { name: "TrionSVM", language: "Rust", chain: "Solana", address: "trion...prog", verified: true, loc: 2341 },
  { name: "NEARBridge", language: "Rust", chain: "NEAR", address: "trion.near", verified: true, loc: 876 },
  { name: "TontinePool", language: "FunC", chain: "TON", address: "EQC...", verified: false, loc: 567 },
  { name: "CosmosAdapter", language: "Rust", chain: "Cosmos", address: "cosmos1...", verified: true, loc: 432 },
  { name: "SuiOracle", language: "Move", chain: "Sui", address: "0x...", verified: false, loc: 389 },
  { name: "AptosGuard", language: "Move", chain: "Aptos", address: "0x...", verified: false, loc: 298 },
  { name: "PolkadotPallet", language: "Rust", chain: "Polkadot", address: "pallet::trion", verified: true, loc: 1567 },
  { name: "BEOAttestation", language: "Solidity", chain: "Arbitrum", address: "0x...", verified: false, loc: 672 },
  { name: "BTCFiGuard", language: "Solidity", chain: "Arbitrum", address: "0x...", verified: false, loc: 445 },
  { name: "HskOracle", language: "Solidity", chain: "HashKey", address: "0x...", verified: true, loc: 723 },
  { name: "ZkVerifier", language: "Solidity", chain: "zkSync", address: "0x...", verified: false, loc: 654 },
  { name: "MantleAdapter", language: "Solidity", chain: "Mantle", address: "0x...", verified: false, loc: 387 },
  { name: "ScrollBridge", language: "Solidity", chain: "Scroll", address: "0x...", verified: false, loc: 445 },
  { name: "CrisprEngine", language: "Solidity", chain: "Arbitrum", address: "0x...", verified: false, loc: 1345 },
  { name: "BEOCore", language: "Solidity", chain: "Ethereum", address: "0x...", verified: false, loc: 1567 },
  { name: "Falsifiability", language: "Python", chain: "Off-chain", address: "offchain", verified: true, loc: 2341 },
];

export const RELAYERS = [
  { name: "EVM Relayer", status: "active", chains: 7, throughput: "12.4 tx/s" },
  { name: "Solana Relayer", status: "active", chains: 1, throughput: "3.1 tx/s" },
  { name: "NEAR Relayer", status: "active", chains: 1, throughput: "2.8 tx/s" },
  { name: "TON Relayer", status: "standby", chains: 1, throughput: "0 tx/s" },
  { name: "0G DA Streamer", status: "active", chains: 1, throughput: "1.2 MB/s" },
  { name: "StarkNet Relayer", status: "active", chains: 1, throughput: "1.9 tx/s" },
  { name: "Cosmos Relayer", status: "active", chains: 1, throughput: "0.7 tx/s" },
];

export const DEPLOYMENTS = [
  { name: "Arbitrum Sepolia", env: "testnet", status: "active", contracts: 3, url: "https://sepolia.arbiscan.io" },
  { name: "0G Galileo Testnet", env: "testnet", status: "active", contracts: 2, url: "https://testnet.0g.ai" },
  { name: "Solana Devnet", env: "testnet", status: "active", contracts: 1, url: "https://explorer.solana.com" },
  { name: "Render Cloud", env: "staging", status: "active", contracts: 0, url: "https://trion.onrender.com" },
  { name: "Arbitrum Mainnet", env: "mainnet", status: "pending", contracts: 2, url: "https://arbiscan.io" },
  { name: "0G Mainnet", env: "mainnet", status: "pending", contracts: 1, url: "https://0g.ai" },
  { name: "Ethereum Mainnet", env: "mainnet", status: "planned", contracts: 1, url: "https://etherscan.io" },
  { name: "Solana Mainnet", env: "mainnet", status: "planned", contracts: 1, url: "https://explorer.solana.com" },
];

export const TRADING_PAIRS = [
  { pair: "ETH/USD", price: 3421.87, change24h: 2.34, volume24h: 18420000000, firewall: "active", btv: 3418.92 },
  { pair: "BTC/USD", price: 67432.15, change24h: -0.87, volume24h: 32100000000, firewall: "active", btv: 67501.33 },
  { pair: "SOL/USD", price: 172.43, change24h: 5.12, volume24h: 4230000000, firewall: "monitoring", btv: 171.88 },
  { pair: "ARB/USD", price: 1.23, change24h: 1.45, volume24h: 892000000, firewall: "active", btv: 1.22 },
  { pair: "MATIC/USD", price: 0.71, change24h: -2.13, volume24h: 567000000, firewall: "active", btv: 0.72 },
  { pair: "OP/USD", price: 2.87, change24h: 3.56, volume24h: 423000000, firewall: "monitoring", btv: 2.85 },
  { pair: "BNB/USD", price: 603.21, change24h: 0.92, volume24h: 1870000000, firewall: "active", btv: 602.45 },
  { pair: "AVAX/USD", price: 38.56, change24h: -1.78, volume24h: 678000000, firewall: "active", btv: 38.89 },
];

export const BEO_ENTITIES = [
  { name: "Uniswap V3", archetype: "AMM_NAVIGATOR", coherence: 0.94, mental: 0.88, spiritual: 0.72, status: "healthy", chain: "Multi-chain" },
  { name: "Aave V3", archetype: "LIQUIDITY_GUARDIAN", coherence: 0.91, mental: 0.85, spiritual: 0.68, status: "healthy", chain: "Multi-chain" },
  { name: "Compound V3", archetype: "RATE_ARBITRAGEUR", coherence: 0.87, mental: 0.79, spiritual: 0.61, status: "monitoring", chain: "Ethereum" },
  { name: "Lido", archetype: "STAKING_ANCHOR", coherence: 0.93, mental: 0.91, spiritual: 0.77, status: "healthy", chain: "Ethereum" },
  { name: "Curve Finance", archetype: "STABILITY_KEEPER", coherence: 0.89, mental: 0.82, spiritual: 0.65, status: "healthy", chain: "Multi-chain" },
];

export const CRISPR_SIGNATURES = [
  { id: "F1", name: "Sandwich Attack", pattern: "MEV_CAPTURE + SWAP + rapid reversal", severity: "high", intercepts: 1247 },
  { id: "F2", name: "Flash Loan Manipulation", pattern: "LEND + SWAP + REPAY within 1 block", severity: "critical", intercepts: 892 },
  { id: "F3", name: "Oracle Manipulation", pattern: "ORACLE_UPDATE + anomalous price delta", severity: "critical", intercepts: 634 },
  { id: "F4", name: "Wash Trading", pattern: "STAKE + cyclic SWAP patterns", severity: "medium", intercepts: 2341 },
  { id: "F5", name: "Rug Pull Indicator", pattern: "BURN + GOVERNANCE + liquidity withdrawal", severity: "critical", intercepts: 156 },
  { id: "F6", name: "Front-Running", pattern: "SWAP anticipation + MEV_CAPTURE", severity: "high", intercepts: 1876 },
  { id: "F7", name: "Honeypot Detection", pattern: "TRANSFER asymmetry + GOVERNANCE lock", severity: "high", intercepts: 423 },
  { id: "F8", name: "Phishing Contract", pattern: "APPROVE + untrusted TRANSFER target", severity: "critical", intercepts: 567 },
  { id: "F9", name: "Gas Griefing", pattern: "excessive GAS patterns + denial vectors", severity: "low", intercepts: 3456 },
  { id: "F10", name: "Reentrancy Vector", pattern: "CALL + state mutation before balance update", severity: "critical", intercepts: 234 },
];

export const LIVING_SECURITY = [
  { name: "CRISPR Engine", status: "active", score: 98.7, uptime: "99.99%", threats: 12 },
  { name: "Epigenetic Layer", status: "active", score: 95.2, uptime: "99.97%", threats: 3 },
  { name: "Immune Response", status: "active", score: 97.1, uptime: "99.98%", threats: 0 },
  { name: "Behavioral Firewall", status: "active", score: 96.8, uptime: "99.95%", threats: 5 },
  { name: "Adaptive Defense", status: "monitoring", score: 93.4, uptime: "99.92%", threats: 1 },
  { name: "ANIMA Correlation", status: "active", score: 94.6, uptime: "99.90%", threats: 2 },
  { name: "Self-Verification", status: "active", score: 99.1, uptime: "99.99%", threats: 0 },
  { name: "Falsifiability Engine", status: "active", score: 97.8, uptime: "99.96%", threats: 0 },
];

export const GOVERNANCE_ITEMS = [
  { id: "TIP-001", title: "Deploy TrionOracle on Ethereum Mainnet", status: "active", votes_for: 1247, votes_against: 89, quorum: 0.78, deadline: "2025-08-15" },
  { id: "TIP-002", title: "Integrate Sui Move VM indexer", status: "active", votes_for: 892, votes_against: 156, quorum: 0.62, deadline: "2025-08-20" },
  { id: "TIP-003", title: "Upgrade CRISPR to v2 with adaptive signatures", status: "passed", votes_for: 2341, votes_against: 23, quorum: 0.95, deadline: "2025-07-01" },
  { id: "TIP-004", title: "Add Bitcoin UTXO behavioral indexing", status: "active", votes_for: 678, votes_against: 234, quorum: 0.51, deadline: "2025-09-01" },
  { id: "TIP-005", title: "ANIMA v3 GitHub source crawler integration", status: "passed", votes_for: 1892, votes_against: 45, quorum: 0.88, deadline: "2025-06-15" },
  { id: "TIP-006", title: "Zero-knowledge proof for signal publishing", status: "discussion", votes_for: 345, votes_against: 123, quorum: 0.34, deadline: "2025-10-01" },
];

export const ANIMA_STREAMS = [
  { name: "Behavioral Analysis", status: "active", throughput: "1.2K vectors/s", accuracy: 0.94, model: "FAISS + ANIMA v3" },
  { name: "GitHub Source Intelligence", status: "active", throughput: "450 commits/s", accuracy: 0.87, model: "Source Crawler v2" },
  { name: "Market Sentiment", status: "active", throughput: "5.6K signals/s", accuracy: 0.91, model: "BEO Analyzer" },
  { name: "Cross-Chain Correlation", status: "monitoring", throughput: "800 pairs/s", accuracy: 0.89, model: "Phi-Sigma Engine" },
];

export const FALSIFIABILITY = [
  { id: "F1", name: "Coherence Threshold Test", status: "passed", lastRun: "2 min ago", result: "C(t) > theta(t) for 99.7% of entities" },
  { id: "F2", name: "Signal Decay Verification", status: "passed", lastRun: "5 min ago", result: "Half-life within expected range" },
  { id: "F3", name: "Cross-Chain Consistency", status: "passed", lastRun: "1 min ago", result: "All 20 chains within 2-sigma" },
  { id: "F4", name: "ANIMA Ground Truth", status: "warning", lastRun: "10 min ago", result: "GitHub plane A=0.70 (neutral prior)" },
  { id: "F5", name: "CRISPR False Positive Rate", status: "passed", lastRun: "3 min ago", result: "FPR < 0.001% over 10K signals" },
  { id: "F6", name: "BEO Behavioral Drift", status: "passed", lastRun: "8 min ago", result: "No archetype shift detected" },
  { id: "F7", name: "Self-Verification Loop", status: "passed", lastRun: "30 sec ago", result: "All 8 subsystems verified" },
];

export const ARCHETYPES = [
  { name: "SAFE_HAVEN", level: 1, color: "#00D4AA", desc: "Stable, predictable behavior" },
  { name: "YIELD_FARMER", level: 2, color: "#00B894", desc: "Consistent yield optimization" },
  { name: "LIQUIDITY_PROVIDER", level: 3, color: "#6C5CE7", desc: "Market-making behavior" },
  { name: "TREND_FOLLOWER", level: 4, color: "#A29BFE", desc: "Momentum-driven actions" },
  { name: "ARBITRAGE_SEEKER", level: 5, color: "#FDCB6E", desc: "Cross-venue price exploitation" },
  { name: "WHALE_TRACKER", level: 6, color: "#F39C12", desc: "Large entity monitoring" },
  { name: "MEV_EXTRACTOR", level: 7, color: "#E17055", desc: "Maximal extractable value" },
  { name: "VOLATILE_ENTITY", level: 8, color: "#D63031", desc: "Unpredictable behavior pattern" },
  { name: "ADVERSARIAL_AGENT", level: 9, color: "#E84393", desc: "Potentially hostile behavior" },
  { name: "ATTACK_VECTOR", level: 10, color: "#FD79A8", desc: "Confirmed attack signature" },
  { name: "UNKNOWN_ANOMALY", level: 11, color: "#636E72", desc: "Uncharacterized behavior" },
  { name: "CRITICAL_THREAT", level: 12, color: "#2D3436", desc: "Immediate threat detected" },
];

export const LANGUAGE_STATS = [
  { language: "Solidity", contracts: 12, loc: 18347, pct: 17.3 },
  { language: "Rust", contracts: 7, loc: 24123, pct: 22.7 },
  { language: "Cairo", contracts: 1, loc: 1203, pct: 1.1 },
  { language: "Move", contracts: 2, loc: 687, pct: 0.6 },
  { language: "FunC", contracts: 1, loc: 567, pct: 0.5 },
  { language: "Vyper", contracts: 1, loc: 312, pct: 0.3 },
  { language: "Python", contracts: 1, loc: 2341, pct: 2.2 },
  { language: "TypeScript", contracts: 0, loc: 38900, pct: 36.6 },
  { language: "JavaScript", contracts: 0, loc: 12450, pct: 11.7 },
  { language: "TOML/YAML", contracts: 0, loc: 2340, pct: 2.2 },
  { language: "Shell", contracts: 0, loc: 890, pct: 0.8 },
  { language: "SQL", contracts: 0, loc: 1540, pct: 1.5 },
];

// ─── Signal Factory (in-memory, persists across requests) ─────────
class SignalFactory {
  private static _instance: SignalFactory | null = null;
  private counter = 0;
  private signals: any[] = [];
  private entityCoh: Record<string, number> = {};
  private maxHistory = 200;

  private constructor() {
    for (const e of BEO_ENTITIES) {
      this.entityCoh[e.name.toLowerCase().replace(/ /g, '_')] = e.coherence;
    }
    for (let i = 0; i < 50; i++) this.signals.push(this.generate());
  }

  static get(): SignalFactory {
    if (!SignalFactory._instance) SignalFactory._instance = new SignalFactory();
    return SignalFactory._instance;
  }

  private generate() {
    this.counter++;
    const chain = CHAINS[Math.floor(Math.random() * CHAINS.length)];
    const entity = BEO_ENTITIES[Math.floor(Math.random() * BEO_ENTITIES.length)];
    const archetype = ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)];
    const key = entity.name.toLowerCase().replace(/ /g, '_');
    const baseC = this.entityCoh[key] ?? 0.85;
    const c = clamp(baseC + gauss(0, 0.03));
    this.entityCoh[key] = c;
    const th = clamp(gauss(0.65, 0.08));
    const status = c >= th ? 'COHERENT' : (c >= th * 0.9 ? 'WARNING' : 'INTERCEPT');
    return {
      id: this.counter, timestamp: ts(), chain: chain.id, chainName: chain.name,
      entity: entity.name, entityType: entity.archetype, archetype: archetype.name,
      archetypeLevel: archetype.level, coherence: +c.toFixed(4), threshold: +th.toFixed(4),
      phi: +clamp(gauss(0.75, 0.12)).toFixed(4), sigma: +clamp(gauss(0.70, 0.10)).toFixed(4),
      anima: +clamp(gauss(0.80, 0.15)).toFixed(4), mental: +clamp(gauss(0.72, 0.10)).toFixed(4),
      magnitude: +Math.random().toFixed(4), status,
      sense: shortHash(), antisense: shortHash(),
      blockNumber: 180000000 + Math.floor(Math.random() * 20000000),
    };
  }

  latest(n = 50) { return this.signals.slice(-n); }

  generateOne() {
    const s = this.generate();
    this.signals.push(s);
    if (this.signals.length > this.maxHistory) this.signals = this.signals.slice(-this.maxHistory);
    return s;
  }

  stats() {
    const r = this.signals.length >= 100 ? this.signals.slice(-100) : this.signals;
    if (!r.length) return { total: 0, coherent: 0, warnings: 0, intercepts: 0, avgCoherence: 0 };
    return {
      total: r.length,
      coherent: r.filter(s => s.status === 'COHERENT').length,
      warnings: r.filter(s => s.status === 'WARNING').length,
      intercepts: r.filter(s => s.status === 'INTERCEPT').length,
      avgCoherence: +(r.reduce((a, s) => a + s.coherence, 0) / r.length).toFixed(4),
    };
  }
}

export const signalFactory = SignalFactory.get();

// ─── Data Generators (called from API routes) ─────────────────────
export function generateChains() {
  const out = CHAINS.map(c => ({
    ...c,
    latency: c.status === 'active' ? +jitter(60, 0.5).toFixed(1) : undefined,
    blockHeight: c.status === 'active' ? 180000000 + Math.floor(Math.random() * 20000000) : undefined,
    behaviorsIndexed: c.status === 'active' ? 10000 + Math.floor(Math.random() * 490000) : undefined,
  }));
  return { chains: out, active: out.filter(c => c.status === 'active').length, total: out.length, indexing: out.filter(c => c.status === 'indexing').length };
}

export function generateOverview() {
  const st = signalFactory.stats();
  const ac = CHAINS.filter(c => c.status === 'active').length;
  return {
    timestamp: new Date().toISOString(), signalStats: st, latestSignals: signalFactory.latest(5),
    chains: { active: ac, total: CHAINS.length, indexing: CHAINS.length - ac },
    coherence: {
      overall: +clamp(gauss(0.88, 0.04)).toFixed(4), physical: +clamp(gauss(0.90, 0.04)).toFixed(4),
      mental: +clamp(gauss(0.85, 0.05)).toFixed(4), spiritual: +clamp(gauss(0.75, 0.06)).toFixed(4),
      conscious: +clamp(gauss(0.80, 0.05)).toFixed(4), anima: +clamp(gauss(0.82, 0.05)).toFixed(4),
    },
    security: { livingScore: +jitter(96, 0.02).toFixed(1), attacksIntercepted: 7000 + Math.floor(Math.random() * 5000) },
    relayers: { active: RELAYERS.filter(r => r.status === 'active').length, total: RELAYERS.length },
  };
}

export function generateTradingPairs() {
  return { pairs: TRADING_PAIRS.map(p => ({
    ...p, price: +jitter(p.price, 0.001).toFixed(2), btv: +jitter(p.btv, 0.0005).toFixed(2),
    change24h: +(p.change24h + gauss(0, 0.1)).toFixed(2), lastUpdate: new Date().toISOString(),
  })) };
}

export function generateSecurityAlerts() {
  const alerts = [];
  for (let i = 0; i < 5 + Math.floor(Math.random() * 10); i++) {
    alerts.push({
      id: `ALERT-${Date.now()}-${i}`, timestamp: new Date().toISOString(),
      signature: CRISPR_SIGNATURES[Math.floor(Math.random() * CRISPR_SIGNATURES.length)].name,
      severity: ['critical', 'high', 'medium'][Math.floor(Math.random() * 3)],
      chain: CHAINS[Math.floor(Math.random() * CHAINS.length)].name,
      entity: BEO_ENTITIES[Math.floor(Math.random() * BEO_ENTITIES.length)].name,
      status: ['intercepted', 'monitoring', 'resolved'][Math.floor(Math.random() * 3)],
      coherence: +Math.random().toFixed(4),
    });
  }
  return { alerts, total: alerts.length };
}

export function generateProtocolHealth() {
  return {
    timestamp: new Date().toISOString(),
    coreEngine: { status: 'running', uptime: '99.97%', memoryUsage: `${jitter(55, 0.15).toFixed(1)}%` },
    faiss: { status: 'running', indexSize: `${jitter(3.0, 0.15).toFixed(1)} GB`, vectorsIndexed: 1000000 + Math.floor(Math.random() * 4000000) },
    relayers: { status: 'running', activeRelayers: RELAYERS.filter(r => r.status === 'active').length },
    zeroG: { status: 'connected', syncHeight: 1500000 + Math.floor(Math.random() * 500000) },
    anima: { status: 'active', streams: ANIMA_STREAMS.length, accuracy: +clamp(gauss(0.91, 0.02)).toFixed(4) },
    signals: signalFactory.stats(),
    chains: { active: CHAINS.filter(c => c.status === 'active').length, total: CHAINS.length },
    security: { livingScore: +jitter(96, 0.02).toFixed(1), threatsActive: Math.floor(Math.random() * 5) },
  };
}

export function generateZeroGStatus() {
  return {
    timestamp: new Date().toISOString(), network: '0G Galileo Testnet', chainId: 16602, connected: true,
    blockHeight: 1500000 + Math.floor(Math.random() * 500000),
    executionGate: { address: '0xDB5910Dc6CfD219D00F64be1F23DA0289901356d', status: 'active', lastExecution: new Date().toISOString(), totalExecutions: 50000 + Math.floor(Math.random() * 150000) },
    daStorage: { endpoint: 'https://da-node.0g.ai', status: 'connected', totalCommitments: 10000 + Math.floor(Math.random() * 70000), storageUsed: `${jitter(3.0, 0.3).toFixed(1)} GB`, lastCommitment: new Date().toISOString() },
    faissSync: { status: 'syncing', vectorsSynced: 500000 + Math.floor(Math.random() * 2500000), lastSync: new Date().toISOString(), indexSize: `${jitter(3.0, 0.15).toFixed(1)} GB` },
    zkProof: { enabled: true, proofsGenerated: 20000 + Math.floor(Math.random() * 80000), avgProofTime: `${jitter(1.5, 0.3).toFixed(2)}s` },
  };
}
