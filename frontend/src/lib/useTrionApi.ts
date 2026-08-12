"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from './api-client';

interface UseApiOpts<T> {
  initialData?: T;
  pollInterval?: number;
  enabled?: boolean;
}

interface UseApiResult<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTrionApi<T>(
  fetcher: () => Promise<T>,
  opts: UseApiOpts<T> = {}
): UseApiResult<T> {
  const { initialData, pollInterval = 0, enabled = true } = opts;
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const execute = useCallback(async () => {
    if (!enabled) return;
    try {
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    execute();
    if (pollInterval > 0) {
      const i = setInterval(execute, pollInterval);
      return () => clearInterval(i);
    }
  }, [execute, pollInterval]);

  return { data, loading, error, refetch: execute };
}

// ─── Hooks ───────────────────────────────────────────────────────

export const useOverview = () => useTrionApi(api.fetchOverview, { pollInterval: 5001 });
export const useEndpoints = () => useTrionApi(api.fetchEndpoints);

export const useSignals = (n = 50) => {
  const fetcher = useCallback(() => api.fetchSignalsLatest(n) as Promise<Record<string, unknown>>, [n]);
  return useTrionApi(fetcher, { pollInterval: 3000 });
};
export const useSignalStats = () => useTrionApi(api.fetchSignalStats, { pollInterval: 3000 });

export const useChains = () => useTrionApi(api.fetchChains, { pollInterval: 10000 });
export const useVmFamilies = () => useTrionApi(api.fetchVmFamilies, { pollInterval: 15001 });

export const useContracts = () => useTrionApi(api.fetchContracts);
export const useRelayers = () => useTrionApi(api.fetchRelayers, { pollInterval: 8000 });
export const useDeployments = () => useTrionApi(api.fetchDeployments);

export const useGovernance = () => useTrionApi(api.fetchGovernance);

export const useFalsifiability = () => useTrionApi(api.fetchFalsifiability, { pollInterval: 10000 });
export const useCrispr = () => useTrionApi(api.fetchCrispr, { pollInterval: 8000 });
export const useLivingSecurity = () => useTrionApi(api.fetchLivingSecurity, { pollInterval: 5001 });
export const useSecurityAlerts = () => useTrionApi(api.fetchSecurityAlerts, { pollInterval: 5001 });

export const useAnimaStreams = () => useTrionApi(api.fetchAnimaStreams, { pollInterval: 8000 });
export const useBeoEntities = () => useTrionApi(api.fetchBeoEntities, { pollInterval: 5001 });
export const useBeoLive = () => useTrionApi(api.fetchBeoLive, { pollInterval: 4000 });

export const useTradingPairs = () => useTrionApi(api.fetchTradingPairs, { pollInterval: 4000 });

export const useArchetypes = () => useTrionApi(api.fetchArchetypes);

export const useZeroGStatus = () => useTrionApi(api.fetchZeroGStatus, { pollInterval: 8000 });

export const useProtocolHealth = () => useTrionApi(api.fetchProtocolHealth, { pollInterval: 5001 });

export const useCratesStatus = () => useTrionApi(api.fetchCratesStatus, { pollInterval: 10000 });
export const useBotchainStatus = () => useTrionApi(api.fetchBotchainStatus, { pollInterval: 10000 });
export const useBotchainContracts = () => useTrionApi(api.fetchBotchainContracts);

export const useZeroBridgeRoutes = () => useTrionApi(api.fetchZeroBridgeRoutes, { pollInterval: 10000 });
export const useZeroBridgeStats = () => useTrionApi(api.fetchZeroBridgeStats, { pollInterval: 8000 });

export const useBhExplorer = () => useTrionApi(api.fetchBhExplorer, { pollInterval: 2000 });
export const useBhStream = () => useTrionApi(api.fetchBhStream, { pollInterval: 2000 });

export const useAkashicIndex = () => useTrionApi(api.fetchAkashicIndex, { pollInterval: 5001 });
export const useAkashicDepth = () => useTrionApi(api.fetchAkashicDepth, { pollInterval: 5001 });

export const useLivingSecurityGk = () => useTrionApi(api.fetchLivingSecurityGk, { pollInterval: 3000 });
export const useLivingSecurityEpigenetic = () => useTrionApi(api.fetchLivingSecurityEpigenetic, { pollInterval: 5001 });
export const useLivingSecurityImmune = () => useTrionApi(api.fetchLivingSecurityImmune, { pollInterval: 3000 });

export const useAnnotators = () => useTrionApi(api.fetchAnnotators, { pollInterval: 8000 });
export const useAnnotatorsReviews = () => useTrionApi(api.fetchAnnotatorsReviews, { pollInterval: 5001 });

export const useEvolutionaryFitness = () => useTrionApi(api.fetchEvolutionaryFitness, { pollInterval: 5001 });
export const useEvolutionaryLoveProtocol = () => useTrionApi(api.fetchEvolutionaryLoveProtocol, { pollInterval: 5001 });

export const useValidators = () => useTrionApi(api.fetchValidators, { pollInterval: 5001 });
export const useValidatorsConsensus = () => useTrionApi(api.fetchValidatorsConsensus, { pollInterval: 5001 });

export const useContinuumDex = () => useTrionApi(api.fetchContinuumDex, { pollInterval: 4000 });
export const useContinuumBidEngine = () => useTrionApi(api.fetchContinuumBidEngine, { pollInterval: 5001 });
export const useContinuumCmeEngine = () => useTrionApi(api.fetchContinuumCmeEngine, { pollInterval: 5001 });
export const useContinuumBdcCredit = () => useTrionApi(api.fetchContinuumBdcCredit, { pollInterval: 8000 });

export const useMarketplaceListings = () => useTrionApi(api.fetchMarketplaceListings, { pollInterval: 5001 });
export const useMarketplaceStats = () => useTrionApi(api.fetchMarketplaceStats, { pollInterval: 8000 });

export const useSbaAssessments = () => useTrionApi(api.fetchSbaAssessments, { pollInterval: 5001 });

export const useBiblAnalysis = () => useTrionApi(api.fetchBiblAnalysis, { pollInterval: 3000 });

export const useTimescaleMetrics = () => useTrionApi(api.fetchTimescaleMetrics, { pollInterval: 5001 });
export const useTimescaleEvents = () => useTrionApi(api.fetchTimescaleEvents, { pollInterval: 3000 });

export const useAiAgents = () => useTrionApi(api.fetchAiAgents, { pollInterval: 5001 });

export const useSettings = () => useTrionApi(api.fetchSettings);

export const useAkashicSearch = (q: string) => {
  const fetcher = useCallback(() => api.fetchAkashicSearch(q), [q]);
  return useTrionApi(fetcher, { enabled: q.length > 0 });
};
