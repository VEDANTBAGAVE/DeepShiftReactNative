import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseQueryOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Generic hook for Supabase queries with loading and error states
 */
export function useSupabaseQuery<T>(
  queryFn: () => Promise<T>,
  dependencies: any[] = [],
  options: UseQueryOptions<T> = {},
): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { onSuccess, onError, enabled = true } = options;

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [queryFn, enabled, onSuccess, onError]);

  useEffect(() => {
    fetchData();
  }, [...dependencies, enabled]);

  return { data, isLoading, error, refetch: fetchData };
}

interface UseMutationOptions<T, V> {
  onSuccess?: (data: T, variables: V) => void;
  onError?: (error: Error, variables: V) => void;
}

interface UseMutationResult<T, V> {
  mutate: (variables: V) => Promise<T | null>;
  mutateAsync: (variables: V) => Promise<T>;
  isLoading: boolean;
  error: Error | null;
  data: T | null;
  reset: () => void;
}

/**
 * Generic hook for Supabase mutations
 */
export function useSupabaseMutation<T, V = void>(
  mutationFn: (variables: V) => Promise<T>,
  options: UseMutationOptions<T, V> = {},
): UseMutationResult<T, V> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { onSuccess, onError } = options;

  const mutateAsync = async (variables: V): Promise<T> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await mutationFn(variables);
      setData(result);
      onSuccess?.(result, variables);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      onError?.(error, variables);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const mutate = async (variables: V): Promise<T | null> => {
    try {
      return await mutateAsync(variables);
    } catch {
      return null;
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setIsLoading(false);
  };

  return { mutate, mutateAsync, isLoading, error, data, reset };
}

interface UseRealtimeOptions {
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
}

/**
 * Hook for subscribing to real-time changes
 */
export function useSupabaseRealtime<T>(
  table: string,
  callback: (payload: { new: T; old: T; eventType: string }) => void,
  options: UseRealtimeOptions = {},
): { channel: RealtimeChannel | null; unsubscribe: () => void } {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const { event = '*', filter } = options;

    const channelName = filter ? `${table}:${filter}` : table;

    const realtimeChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          filter,
        },
        payload => {
          callback({
            new: payload.new as T,
            old: payload.old as T,
            eventType: payload.eventType,
          });
        },
      )
      .subscribe();

    setChannel(realtimeChannel);

    return () => {
      realtimeChannel.unsubscribe();
    };
  }, [table, options.event, options.filter]);

  const unsubscribe = useCallback(() => {
    channel?.unsubscribe();
  }, [channel]);

  return { channel, unsubscribe };
}

/**
 * Hook for paginated queries
 */
export function useSupabasePagination<T>(
  queryFn: (
    page: number,
    pageSize: number,
  ) => Promise<{ data: T[]; count: number }>,
  pageSize: number = 20,
  dependencies: any[] = [],
) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = useCallback(
    async (pageNum: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await queryFn(pageNum, pageSize);

        if (pageNum === 1) {
          setData(result.data);
        } else {
          setData(prev => [...prev, ...result.data]);
        }

        setTotalCount(result.count);
        setHasMore(result.data.length === pageSize);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setIsLoading(false);
      }
    },
    [queryFn, pageSize],
  );

  useEffect(() => {
    setPage(1);
    fetchPage(1);
  }, dependencies);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPage(nextPage);
    }
  }, [isLoading, hasMore, page, fetchPage]);

  const refresh = useCallback(() => {
    setPage(1);
    fetchPage(1);
  }, [fetchPage]);

  return {
    data,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
    totalCount,
    page,
  };
}
