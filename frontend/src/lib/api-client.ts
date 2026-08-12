// TRION Protocol — API Client for Next.js API routes
// All calls go to /api/trion/... which are served by the live-engine

const BASE = '/api/trion';

async function fetchApi<T>(path: string, fallback?: T): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn('[TRION API]', path, e);
    if (fallback !== undefined) return fallback;
    throw e;
  }
}

export const API_BASE = BASE;

export const fetchOverview = () => fetchApi<any>('/overview');
export const fetchLatestSignals = (count = 50) => fetchApi<any>(`/v1/signals/latest?count=${count}`, { signals: [], count: 0 });
export const fetchSignalStats = () => fetchApi<any>('/v1/signals/stats');
export const fetchChains = () => fetchApi<any>('/v1/chains', { chains: [], active: 0, total: 0 });
export const fetchVmFamilies = () => fetchApi<any>('/v1/vm-families', { families: [] });
export const fetchContracts = () => fetchApi<any>('/v1/contracts', { contracts: [], total: 0 });
export const fetchLanguages = () => fetchApi<any>('/v1/languages', { languages: [], totalLoc: 0 });
export const fetchRelayers = () => fetchApi<any>('/v1/relayers', { relayers: [], total: 0 });
export const fetchDeployments = () => fetchApi<any>('/v1/deployments', { deployments: [] });
export const fetchGovernance = () => fetchApi<any>('/v1/governance/proposals', { proposals: [], total: 0 });
export const fetchFalsifiability = () => fetchApi<any>('/v1/falsifiability', { tests: [] });
export const fetchAnimaStreams = () => fetchApi<any>('/v1/anima/streams', { streams: [] });
export const fetchBeoEntities = () => fetchApi<any>('/v1/beo/entities', { entities: [] });
export const fetchTradingPairs = () => fetchApi<any>('/v1/trading/pairs', { pairs: [] });
export const fetchCrispr = () => fetchApi<any>('/v1/security/crispr', { signatures: [], totalIntercepts: 0 });
export const fetchLivingSecurity = () => fetchApi<any>('/v1/security/living', { components: [] });
export const fetchSecurityAlerts = () => fetchApi<any>('/v1/security/alerts', { alerts: [], total: 0 });
export const fetchArchetypes = () => fetchApi<any>('/v1/archetypes', { archetypes: [] });
export const fetchZeroGStatus = () => fetchApi<any>('/v1/0g/status', {});
export const fetchProtocolHealth = () => fetchApi<any>('/v1/protocol/health', {});
export const fetchApiEndpoints = () => fetchApi<any>('/v1/endpoints', { endpoints: [], total: 0 });
export const fetchBackendHealth = () => fetchApi<{ status: string; signalsGenerated: number }>('/health', { status: 'unknown', signalsGenerated: 0 });
