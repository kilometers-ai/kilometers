# Phase 2: Real API Integration - Implementation Guide

**Estimated Time:** 45 minutes  
**Goal:** Connect the v0.dev dashboard to your existing Kilometers.ai API endpoints

## Overview

Replace the mock/sample data in your v0.dev dashboard with real API calls to your deployed .NET API. This phase transforms the static dashboard into a live monitoring system.

## Prerequisites

- ✅ v0.dev dashboard completed and running locally
- ✅ .NET API deployed and accessible at `https://api.dev.kilometers.ai` or `https://app-kilometers-api-dev-[suffix].azurewebsites.net`
- ✅ API health endpoint responding: `/health`
- ✅ CLI generating events and sending to API

## API Endpoints Reference

Your existing API provides these endpoints:

```typescript
interface KilometersAPI {
  // Health check
  "GET /health": () => Promise<{ status: string, timestamp: string }>
  
  // Event ingestion (used by CLI)
  "POST /api/events": (event: MpcEventDto) => Promise<{ success: boolean, eventId: string }>
  "POST /api/events/batch": (batch: EventBatchDto) => Promise<{ success: boolean, eventsProcessed: number }>
  
  // Dashboard data endpoints
  "GET /api/activity": (customerId?: string, limit?: number) => Promise<ActivityEvent[]>
  "GET /api/stats": (customerId?: string) => Promise<ActivityStats>
  
  // Root endpoint
  "GET /": () => Promise<{ service: string, version: string, environment: string }>
}
```

## Implementation Steps

### Step 1: Create Real API Client (15 mins)

Replace the mock API client with a real HTTP client:

**File:** `lib/api-client.ts`

```typescript
// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5194' 
    : 'https://api.dev.kilometers.ai')

// API Response Types (matching your .NET API)
interface ActivityEvent {
  id: string
  timestamp: string
  direction: 'request' | 'response'
  method?: string
  payloadPreview: string
  size: number
  processedAt: string
  source: string
  riskScore?: number
  costEstimate?: number
}

interface ActivityStats {
  totalEvents: number
  totalCost: number
  alertsCount: number
  // Add other stats fields your API returns
}

interface ApiHealthResponse {
  status: string
  timestamp: string
  environment: string
}

// Real API Client Implementation
class KilometersApiClient {
  private baseUrl: string
  private defaultCustomerId: string = 'default' // For MVP, use default customer

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
  }

  // Generic fetch wrapper with error handling
  private async fetchApi<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Health check
  async getHealth(): Promise<ApiHealthResponse> {
    return this.fetchApi<ApiHealthResponse>('/health')
  }

  // Get recent activity events
  async getActivity(limit: number = 10): Promise<ActivityEvent[]> {
    const params = new URLSearchParams({
      customerId: this.defaultCustomerId,
      limit: limit.toString()
    })
    return this.fetchApi<ActivityEvent[]>(`/api/activity?${params}`)
  }

  // Get usage statistics
  async getStats(): Promise<ActivityStats> {
    const params = new URLSearchParams({
      customerId: this.defaultCustomerId
    })
    return this.fetchApi<ActivityStats>(`/api/stats?${params}`)
  }

  // Send test event (for testing purposes)
  async sendTestEvent(): Promise<{ success: boolean }> {
    const testEvent = {
      id: `test_${Date.now()}`,
      timestamp: new Date().toISOString(),
      customerId: this.defaultCustomerId,
      direction: 'request',
      method: 'tools/call',
      payload: btoa(JSON.stringify({ test: 'event from dashboard' })),
      size: 64
    }

    return this.fetchApi<{ success: boolean }>('/api/events', {
      method: 'POST',
      body: JSON.stringify(testEvent)
    })
  }
}

// Export singleton instance
export const apiClient = new KilometersApiClient()

// Export types
export type { ActivityEvent, ActivityStats, ApiHealthResponse }
```

### Step 2: Create Data Hooks (15 mins)

Create React hooks for data fetching with proper loading and error states:

**File:** `hooks/use-api-data.ts`

```typescript
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
      const data = await apiClient.getActivity(limit)
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

    // Set up auto-refresh
    const interval = setInterval(fetchEvents, refreshInterval)
    return () => clearInterval(interval)
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

    // Set up auto-refresh
    const interval = setInterval(fetchStats, refreshInterval)
    return () => clearInterval(interval)
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
```

### Step 3: Update Dashboard Components (10 mins)

Replace sample data with real API calls in your dashboard components:

**File:** `app/dashboard/page.tsx`

```typescript
'use client'

import { useActivityEvents, useActivityStats, useApiHealth } from '@/hooks/use-api-data'
import { StatsCard } from '@/components/dashboard/stats-card'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { ServicesOverview } from '@/components/dashboard/services-overview'
import { ApiHealthIndicator } from '@/components/dashboard/api-health-indicator'

export default function DashboardPage() {
  const { events, loading: eventsLoading, error: eventsError } = useActivityEvents(10)
  const { stats, loading: statsLoading, error: statsError } = useActivityStats()
  const { isHealthy } = useApiHealth()

  if (statsLoading && eventsLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA]">
      {/* Header with API health indicator */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome back! 👋</h2>
            <p className="text-[#FAFAFA]/70">
              Here's what your AI agents have been up to.
            </p>
          </div>
          <ApiHealthIndicator isHealthy={isHealthy} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Requests"
            value={stats?.totalEvents || 0}
            trend="+8% from yesterday"
            icon="Eye"
            color="text-[#10B981]"
            loading={statsLoading}
            error={statsError}
          />
          <StatsCard
            title="Total Cost"
            value={`$${stats?.totalCost?.toFixed(2) || '0.00'}`}
            trend="+15% from yesterday"
            icon="DollarSign"
            color="text-[#F59E0B]"
            loading={statsLoading}
            error={statsError}
          />
          <StatsCard
            title="Active Alerts"
            value={stats?.alertsCount || 0}
            trend="2 new since yesterday"
            icon="AlertTriangle"
            color="text-[#EF4444]"
            loading={statsLoading}
            error={statsError}
          />
          <StatsCard
            title="Distance Traveled"
            value="457 km" // Calculate from events if needed
            trend="+12% from yesterday"
            icon="Activity"
            color="text-[#0EA5E9]"
            loading={statsLoading}
            error={statsError}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          <RecentActivity 
            events={events} 
            loading={eventsLoading} 
            error={eventsError} 
          />
          <ServicesOverview 
            events={events} 
            loading={eventsLoading} 
            error={eventsError} 
          />
        </div>
      </div>
    </div>
  )
}
```

### Step 4: Update Events Page (5 mins)

Connect the events table to real data:

**File:** `app/events/page.tsx`

```typescript
'use client'

import { useActivityEvents } from '@/hooks/use-api-data'
import { EventsTable } from '@/components/events/events-table'
import { EventsFilters } from '@/components/events/events-filters'
import { useState } from 'react'

export default function EventsPage() {
  const [limit, setLimit] = useState(50)
  const [filters, setFilters] = useState({
    direction: 'all',
    method: '',
    timeRange: '24h'
  })

  const { events, loading, error, lastRefresh, refresh } = useActivityEvents(limit, 5000) // Refresh every 5 seconds

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Event Stream</h2>
            <p className="text-[#FAFAFA]/70">
              Real-time monitoring of AI agent interactions
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
            <span className="text-sm text-[#FAFAFA]/70">
              Live {lastRefresh && `• Last update: ${lastRefresh.toLocaleTimeString()}`}
            </span>
          </div>
        </div>

        <EventsFilters filters={filters} onFiltersChange={setFilters} />
        
        <EventsTable 
          events={events} 
          loading={loading} 
          error={error}
          onRefresh={refresh}
        />
      </div>
    </div>
  )
}
```

## Environment Configuration

### Development Environment

**File:** `.env.local`

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5194

# For production, this will be:
# NEXT_PUBLIC_API_URL=https://api.dev.kilometers.ai
```

### Production Environment Variables

Add these to your Azure Static Web App configuration:

```bash
NEXT_PUBLIC_API_URL=https://api.dev.kilometers.ai
```

## Error Handling & User Experience

### Loading States
- Show skeleton components while data loads
- Use consistent loading indicators
- Provide feedback for user actions

### Error States
- Display user-friendly error messages
- Provide retry buttons for failed requests
- Show API health status prominently

### Empty States
- Handle cases when no events exist
- Provide helpful guidance for new users
- Show setup instructions if no data

## Testing & Validation

### Manual Testing Checklist

1. **API Connectivity**
   - [ ] Dashboard loads without errors
   - [ ] Health check indicator shows correct status
   - [ ] All API endpoints respond correctly

2. **Data Display**
   - [ ] Stats cards show real numbers from API
   - [ ] Events table displays actual MCP events
   - [ ] Timestamps are formatted correctly
   - [ ] JSON payloads expand properly

3. **Real-time Updates**
   - [ ] Events page refreshes automatically
   - [ ] New events appear without page reload
   - [ ] Stats update periodically

4. **Error Scenarios**
   - [ ] Dashboard handles API downtime gracefully
   - [ ] Error messages are user-friendly
   - [ ] Retry functionality works

### CLI Integration Test

Generate real events using your CLI to validate end-to-end flow:

```bash
# Run your demo script to generate events
cd /projects/kilometers.ai/kilometers
./demo.sh

# Or manually test CLI
cd cli
export KILOMETERS_API_URL="http://localhost:5194"  # Point to local API
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | ./km python3 -c "import sys, json; print(json.dumps({'jsonrpc': '2.0', 'id': 1, 'result': []}))"
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your API CORS settings include your dashboard domain
   - Check browser dev tools for specific CORS errors

2. **API URL Issues**
   - Verify `NEXT_PUBLIC_API_URL` is correctly set
   - Test API endpoints directly in browser/Postman

3. **Empty Data**
   - Check that CLI is sending events to API
   - Verify API is storing events in database
   - Check API logs for any errors

4. **Performance Issues**
   - Implement pagination for large event lists
   - Add debouncing to search/filter inputs
   - Consider implementing virtual scrolling for tables

## Success Criteria

By the end of this phase, you should have:

- ✅ Dashboard connected to real API endpoints
- ✅ Live event data displaying in real-time
- ✅ Stats cards showing actual usage metrics
- ✅ Error handling for API failures
- ✅ Loading states for better UX
- ✅ End-to-end data flow: CLI → API → Dashboard

## Next Steps

After completing this phase:
- **Phase 3:** Implement OAuth authentication
- **Phase 4:** Set up CI/CD for automated deployment
- **Future:** Add WebSocket connections for true real-time updates