// TRION Protocol — API Client
// Calls the backend at http://localhost:5001/api/v1/ through the Caddy gateway

const BACKEND_PORT = 5001;
const BASE = '/api/v1';

async function fetchApi<T>(path: string, fallback?: T): Promise<T> {
  try {
    const sep = path.includes('?') ? '&' : '?';
    const url = `${BASE}${path}${sep}XTransformPort=${BACKEND_PORT}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json() as T;
  } catch (e) {
    console.warn('[TRION API]', path, e);
    if (fallback !== undefined) return fallback;
    throw e;
  }
}

export const API_BASE = BASE;
export const BACKEND_WS = (): string => {
  if (typeof window === 'undefined') return '';
  return `ws://${window.location.host}/ws/signals?XTransformPort=${BACKEND_PORT}`;
};

// ─── Overview & Health ───────────────────────────────────────────
export const fetchOverview = () => fetchApi<Record<string, unknown>>('/overview', {});
export const fetchEndpoints = () => fetchApi<Record<string, unknown>>('/endpoints', { endpoints: [], total: 0 });

// ─── Signals ────────────────────────────────────────────────────
export const fetchSignalsLatest = (count = 50) => fetchApi<Record<string, unknown>>(`/signals/latest?count=${count}`, { signals: [], count: 0 });
export const fetchSignalStats = () => fetchApi<Record<string, unknown>>('/signals/stats', { total: 0, coherent: 0, warnings: 0, intercepts: 0 });

// ─── Chains & VM ────────────────────────────────────────────────
export const fetchChains = () => fetchApi<Record<string, unknown>>('/chains', { chains: [], active: 0, total: 0 });
export const fetchVmFamilies = () => fetchApi<Record<string, unknown>>('/vm-families', { families: [] });

// ─── Contracts & Relayers ────────────────────────────────────────
export const fetchContracts = () => fetchApi<Record<string, unknown>>('/contracts', { contracts: [], total: 0 });
export const fetchRelayers = () => fetchApi<Record<string, unknown>>('/relayers', { relayers: [], total: 0 });
export const fetchDeployments = () => fetchApi<Record<string, unknown>>('/deployments', { deployments: [] });

// ─── Governance ─────────────────────────────────────────────────
export const fetchGovernance = () => fetchApi<Record<string, unknown>>('/governance/proposals', { proposals: [], total: 0 });

// ─── Security ───────────────────────────────────────────────────
export const fetchFalsifiability = () => fetchApi<Record<string, unknown>>('/falsifiability', { tests: [] });
export const fetchCrispr = () => fetchApi<Record<string, unknown>>('/security/crispr', { signatures: [], totalIntercepts: 0 });
export const fetchLivingSecurity = () => fetchApi<Record<string, unknown>>('/security/living', { components: [] });
export const fetchSecurityAlerts = () => fetchApi<Record<string, unknown>>('/security/alerts', { alerts: [], total: 0 });

// ─── ANIMA & BEO ────────────────────────────────────────────────
export const fetchAnimaStreams = () => fetchApi<Record<string, unknown>>('/anima/streams', { streams: [] });
export const fetchBeoEntities = () => fetchApi<Record<string, unknown>>('/beo/entities', { entities: [] });
export const fetchBeoLive = () => fetchApi<Record<string, unknown>>('/beo/live', {});

// ─── Trading ────────────────────────────────────────────────────
export const fetchTradingPairs = () => fetchApi<Record<string, unknown>>('/trading/pairs', { pairs: [] });

// ─── Archetypes ─────────────────────────────────────────────────
export const fetchArchetypes = () => fetchApi<Record<string, unknown>>('/archetypes', { archetypes: [] });

// ─── 0G Network ────────────────────────────────────────────────
export const fetchZeroGStatus = () => fetchApi<Record<string, unknown>>('/0g/status', {});

// ─── Protocol Health ─────────────────────────────────────────────
export const fetchProtocolHealth = () => fetchApi<Record<string, unknown>>('/protocol/health', {});

// ─── Crates & BOT Chain ─────────────────────────────────────────
export const fetchCratesStatus = () => fetchApi<Record<string, unknown>>('/crates/status', {});
export const fetchBotchainStatus = () => fetchApi<Record<string, unknown>>('/botchain/status', {});
export const fetchBotchainContracts = () => fetchApi<Record<string, unknown>>('/botchain/contracts', {});

// ─── Zero Bridge ────────────────────────────────────────────────
export const fetchZeroBridgeRoutes = () => fetchApi<Record<string, unknown>>('/zero-bridge/routes', { routes: [] });
export const fetchZeroBridgeStats = () => fetchApi<Record<string, unknown>>('/zero-bridge/stats', {});

// ─── Behavioral Hash ────────────────────────────────────────────
export const fetchBhExplorer = () => fetchApi<Record<string, unknown>>('/bh/explorer', { hashes: [] });
export const fetchBhStream = () => fetchApi<Record<string, unknown>>('/bh/stream', { stream: [] });

// ─── Akashic Index ──────────────────────────────────────────────
export const fetchAkashicIndex = () => fetchApi<Record<string, unknown>>('/akashic/index', {});
export const fetchAkashicSearch = (q: string) => fetchApi<Record<string, unknown>>(`/akashic/search?q=${encodeURIComponent(q)}`, { results: [] });
export const fetchAkashicDepth = () => fetchApi<Record<string, unknown>>('/akashic/depth', {});

// ─── Living Security Extended ────────────────────────────────────
export const fetchLivingSecurityGk = () => fetchApi<Record<string, unknown>>('/living-security/gk', {});
export const fetchLivingSecurityEpigenetic = () => fetchApi<Record<string, unknown>>('/living-security/epigenetic', {});
export const fetchLivingSecurityImmune = () => fetchApi<Record<string, unknown>>('/living-security/immune', {});

// ─── Annotators ─────────────────────────────────────────────────
export const fetchAnnotators = () => fetchApi<Record<string, unknown>>('/annotators', { annotators: [] });
export const fetchAnnotatorsReviews = () => fetchApi<Record<string, unknown>>('/annotators/reviews', { reviews: [] });

// ─── Evolutionary ───────────────────────────────────────────────
export const fetchEvolutionaryFitness = () => fetchApi<Record<string, unknown>>('/evolutionary/fitness', { components: [] });
export const fetchEvolutionaryLoveProtocol = () => fetchApi<Record<string, unknown>>('/evolutionary/love-protocol', {});

// ─── Validators ─────────────────────────────────────────────────
export const fetchValidators = () => fetchApi<Record<string, unknown>>('/validators', { validators: [] });
export const fetchValidatorsConsensus = () => fetchApi<Record<string, unknown>>('/validators/consensus', {});

// ─── CONTINUUM DEX ─────────────────────────────────────────────
export const fetchContinuumDex = () => fetchApi<Record<string, unknown>>('/continuum/dex', { pairs: [] });
export const fetchContinuumBidEngine = () => fetchApi<Record<string, unknown>>('/continuum/bid-engine', {});
export const fetchContinuumCmeEngine = () => fetchApi<Record<string, unknown>>('/continuum/cme-engine', {});
export const fetchContinuumBdcCredit = () => fetchApi<Record<string, unknown>>('/continuum/bdc-credit', {});

// ─── Marketplace ────────────────────────────────────────────────
export const fetchMarketplaceListings = () => fetchApi<Record<string, unknown>>('/marketplace/listings', { listings: [] });
export const fetchMarketplaceStats = () => fetchApi<Record<string, unknown>>('/marketplace/stats', {});

// ─── SBA ────────────────────────────────────────────────────────
export const fetchSbaAssessments = () => fetchApi<Record<string, unknown>>('/sba/assessments', { nations: [] });

// ─── BIBL ───────────────────────────────────────────────────────
export const fetchBiblAnalysis = () => fetchApi<Record<string, unknown>>('/bibl/analysis', { analysis: [] });

// ─── TimescaleDB ─────────────────────────────────────────────────
export const fetchTimescaleMetrics = () => fetchApi<Record<string, unknown>>('/timescale/metrics', {});
export const fetchTimescaleEvents = () => fetchApi<Record<string, unknown>>('/timescale/events', { events: [] });

// ─── AI Agents ───────────────────────────────────────────────────
export const fetchAiAgents = () => fetchApi<Record<string, unknown>>('/ai-agents', { agents: [] });

// ─── Settings ────────────────────────────────────────────────────
export const fetchSettings = () => fetchApi<Record<string, unknown>>('/settings', {});
