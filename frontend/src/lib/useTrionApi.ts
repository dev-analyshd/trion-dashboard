"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from './api-client';

interface UseApiOpts<T> { initialData?: T; pollInterval?: number; enabled?: boolean; transform?: (raw: any) => T; }

export function useTrionApi<T>(fetcher: () => Promise<any>, opts: UseApiOpts<T> = {}) {
  const { initialData, pollInterval = 0, enabled = true, transform } = opts;
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState('MOCK');
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const execute = useCallback(async () => {
    if (!enabled) return;
    try {
      const raw = await fetcherRef.current();
      setData(transform ? transform(raw) : raw);
      setDataSource('LIVE');
      setError(null);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [enabled, transform]);

  useEffect(() => { execute(); if (pollInterval > 0) { const i = setInterval(execute, pollInterval); return () => clearInterval(i); } }, [execute, pollInterval]);
  return { data, loading, error, dataSource, refetch: execute };
}

export const useOverview = () => useTrionApi(api.fetchOverview, { pollInterval: 5000 });
export const useSignals = (n = 50) => { const f = useCallback(() => api.fetchLatestSignals(n), [n]); return useTrionApi(f, { pollInterval: 3000 }); };
export const useChains = () => useTrionApi(api.fetchChains, { pollInterval: 10000 });
export const useVmFamilies = () => useTrionApi(api.fetchVmFamilies);
export const useContracts = () => useTrionApi(api.fetchContracts);
export const useLanguages = () => useTrionApi(api.fetchLanguages);
export const useRelayers = () => useTrionApi(api.fetchRelayers, { pollInterval: 8000 });
export const useDeployments = () => useTrionApi(api.fetchDeployments);
export const useGovernance = () => useTrionApi(api.fetchGovernance);
export const useFalsifiability = () => useTrionApi(api.fetchFalsifiability, { pollInterval: 10000 });
export const useAnimaStreams = () => useTrionApi(api.fetchAnimaStreams, { pollInterval: 8000 });
export const useBeoEntities = () => useTrionApi(api.fetchBeoEntities, { pollInterval: 5000 });
export const useTradingPairs = () => useTrionApi(api.fetchTradingPairs, { pollInterval: 4000 });
export const useCrispr = () => useTrionApi(api.fetchCrispr, { pollInterval: 8000 });
export const useLivingSecurity = () => useTrionApi(api.fetchLivingSecurity, { pollInterval: 5000 });
export const useSecurityAlerts = () => useTrionApi(api.fetchSecurityAlerts, { pollInterval: 5000 });
export const useArchetypes = () => useTrionApi(api.fetchArchetypes);
export const useZeroGStatus = () => useTrionApi(api.fetchZeroGStatus, { pollInterval: 8000 });
export const useProtocolHealth = () => useTrionApi(api.fetchProtocolHealth, { pollInterval: 5000 });
export const useApiEndpoints = () => useTrionApi(api.fetchApiEndpoints);
export const useBackendHealth = () => useTrionApi(api.fetchBackendHealth, { pollInterval: 5000 });
