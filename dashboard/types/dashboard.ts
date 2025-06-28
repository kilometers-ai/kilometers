export interface StatsCard {
  title: string
  value: string | number
  trend: string
  icon: string
  color: string
}

export interface Service {
  name: string
  icon: string
  status: "normal" | "warning"
  requests: number
  distance: number
  cost: number
  trend: string
}

export interface RecentActivity {
  id: string
  time: string
  action: string
  distance: string
  cost: string
}

export interface Event {
  id: string
  timestamp: string
  direction: "request" | "response"
  method: string
  payloadPreview: string
  payload?: object
  size: number
  riskScore: number
  costEstimate: number
  processedAt?: string
  source?: string
}

export interface Alert {
  id: string
  type: "warning" | "danger" | "info"
  title: string
  message: string
  timestamp: string
  action: string
}

export interface UserAccount {
  name: string
  email: string
  avatar: string
  subscription: "free" | "pro" | "enterprise"
  joinedAt: string
  monthlyUsage: {
    events: number
    cost: number
    limit: number
  }
}

export interface EventFilters {
  direction: "all" | "request" | "response"
  method: string
  timeRange: "1h" | "24h" | "7d" | "30d"
  riskLevel: "all" | "low" | "medium" | "high"
}

export interface ApiActivityStats {
  totalEvents: number
  uniqueMethods: number
  totalCost: number
  averageResponseTime: number
  startTime: string
  endTime: string
}
