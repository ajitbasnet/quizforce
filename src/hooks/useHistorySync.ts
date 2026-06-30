import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { fetchHistory, getSyncUserId } from '../api/historyApi'
import { isSupabaseConfigured } from '../api/supabase'
import { useHistoryStore } from '../store/historyStore'

const STALE_TIME_MS = 5 * 60 * 1000

export function useHistorySync() {
  const mergeRemoteHistory = useHistoryStore((s) => s.mergeRemoteHistory)

  const { data: userId } = useQuery({
    queryKey: ['syncUserId'],
    queryFn: getSyncUserId,
    staleTime: Infinity,
  })

  const historyQuery = useQuery({
    queryKey: ['history', userId],
    queryFn: () => fetchHistory(userId!),
    enabled: isSupabaseConfigured() && !!userId,
    staleTime: STALE_TIME_MS,
  })

  useEffect(() => {
    if (historyQuery.data) {
      mergeRemoteHistory(historyQuery.data)
    }
  }, [historyQuery.data, mergeRemoteHistory])

  return {
    isFetching: historyQuery.isFetching,
    isLoading: historyQuery.isLoading,
    isError: historyQuery.isError,
  }
}
