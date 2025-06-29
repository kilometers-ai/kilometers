import { useState, useEffect, useCallback } from 'react'
import { apiClient, ActivityEvent, ActivityStats, CustomerInfo } from '@/lib/api-client'

// Custom hook for activity events with API key authentication
export function useActivityEvents(apiKey?: string, limit: number = 10, refreshInterval: number = 30000) {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      setError(null)
      
      // Set API key if provided
      if (apiKey) {
        apiClient.setApiKey(apiKey)
      }
      
      // ✅ Updated to use new method signature (no customerId)
      const data = await apiClient.getActivity(limit)
      setEvents(data)
      setLastRefresh(new Date())
    } catch (err) {
      if (err instanceof Error && err.message.includes('Authentication failed')) {
        setError('Authentication failed - check your API key')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch events')
      }
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }, [apiKey, limit])

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

// Custom hook for statistics with API key authentication
export function useActivityStats(apiKey?: string, refreshInterval: number = 60000) {
  const [stats, setStats] = useState<ActivityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setError(null)
      
      // Set API key if provided
      if (apiKey) {
        apiClient.setApiKey(apiKey)
      }
      
      // ✅ Updated to use new method signature (no customerId)
      const data = await apiClient.getStats()
      setStats(data)
    } catch (err) {
      if (err instanceof Error && err.message.includes('Authentication failed')) {
        setError('Authentication failed - check your API key')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats')
      }
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }, [apiKey])

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

// ✅ NEW: Custom hook for customer information
export function useCustomerInfo(apiKey?: string) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomerInfo = useCallback(async () => {
    try {
      setError(null)
      
      // Set API key if provided
      if (apiKey) {
        apiClient.setApiKey(apiKey)
      }
      
      const data = await apiClient.getCustomerInfo()
      setCustomerInfo(data)
    } catch (err) {
      if (err instanceof Error && err.message.includes('Authentication failed')) {
        setError('Authentication failed - check your API key')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch customer info')
      }
      console.error('Error fetching customer info:', err)
    } finally {
      setLoading(false)
    }
  }, [apiKey])

  useEffect(() => {
    fetchCustomerInfo()
  }, [fetchCustomerInfo])

  return {
    customerInfo,
    loading,
    error,
    refresh: fetchCustomerInfo
  }
}

// Custom hook for API health monitoring with authentication test
export function useApiHealth(apiKey?: string) {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null)
  const [healthData, setHealthData] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // Test basic health (public endpoint)
        const health = await apiClient.getHealth()
        setHealthData(health)
        setIsHealthy(health.status === 'healthy' || health.status === 'Healthy')

        // Test authentication if API key is available
        if (apiKey) {
          apiClient.setApiKey(apiKey)
          const authResult = await apiClient.testAuthentication()
          setIsAuthenticated(authResult)
        } else {
          setIsAuthenticated(null)
        }
      } catch (error) {
        setIsHealthy(false)
        setIsAuthenticated(false)
        console.error('Health check failed:', error)
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [apiKey])

  return { 
    isHealthy, 
    healthData, 
    isAuthenticated 
  }
} 