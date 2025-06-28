import { useState, useEffect, useCallback } from 'react'
import { apiClient, ActivityEvent, ActivityStats } from '@/lib/api-client'

// Custom hook for activity events
export function useActivityEvents(limit: number = 10, refreshInterval: number = 30000) {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      setError(null)
      const data = await apiClient.getActivity(undefined, limit)
      setEvents(data)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events')
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchEvents()

    // Set up auto-refresh if interval is provided
    if (refreshInterval > 0) {
      const interval = setInterval(fetchEvents, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchEvents, refreshInterval])

  return {
    events,
    loading,
    error,
    lastRefresh,
    refresh: fetchEvents
  }
}

// Custom hook for statistics
export function useActivityStats(refreshInterval: number = 60000) {
  const [stats, setStats] = useState<ActivityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setError(null)
      const data = await apiClient.getStats()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()

    // Set up auto-refresh if interval is provided
    if (refreshInterval > 0) {
      const interval = setInterval(fetchStats, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchStats, refreshInterval])

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  }
}

// Custom hook for API health monitoring
export function useApiHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null)
  const [healthData, setHealthData] = useState<any>(null)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await apiClient.getHealth()
        setHealthData(health)
        setIsHealthy(health.status === 'healthy' || health.status === 'Healthy')
      } catch (error) {
        setIsHealthy(false)
        console.error('Health check failed:', error)
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  return { isHealthy, healthData }
} 