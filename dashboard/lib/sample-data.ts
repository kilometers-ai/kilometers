import type { StatsCard, Service, RecentActivity, Event, Alert, UserAccount } from "@/types/dashboard"

export const statsCards: StatsCard[] = [
  {
    title: "Total Distance",
    value: "457 km",
    trend: "+12% from yesterday",
    icon: "Activity",
    color: "text-[#0EA5E9]",
  },
  {
    title: "Total Requests",
    value: 1471,
    trend: "+8% from yesterday",
    icon: "Eye",
    color: "text-[#10B981]",
  },
  {
    title: "Total Cost",
    value: "$47.23",
    trend: "+15% from yesterday",
    icon: "DollarSign",
    color: "text-[#F59E0B]",
  },
  {
    title: "Active Alerts",
    value: 3,
    trend: "2 new since yesterday",
    icon: "AlertTriangle",
    color: "text-[#EF4444]",
  },
]

export const services: Service[] = [
  {
    name: "GitHub API",
    icon: "github",
    status: "normal",
    requests: 1337,
    distance: 234,
    cost: 23.45,
    trend: "+12%",
  },
  {
    name: "Database",
    icon: "database",
    status: "warning",
    requests: 89,
    distance: 156,
    cost: 15.67,
    trend: "+340%",
  },
  {
    name: "Slack API",
    icon: "slack",
    status: "normal",
    requests: 45,
    distance: 67,
    cost: 8.11,
    trend: "+5%",
  },
]

export const recentActivity: RecentActivity[] = [
  {
    id: "act_001",
    time: "2 min ago",
    action: "GitHub repository search",
    distance: "2.3 km",
    cost: "$0.02",
  },
  {
    id: "act_002",
    time: "5 min ago",
    action: "Database user query",
    distance: "1.8 km",
    cost: "$0.01",
  },
  {
    id: "act_003",
    time: "12 min ago",
    action: "Slack message sent",
    distance: "0.9 km",
    cost: "$0.01",
  },
  {
    id: "act_004",
    time: "18 min ago",
    action: "File system access",
    distance: "0.5 km",
    cost: "$0.01",
  },
  {
    id: "act_005",
    time: "25 min ago",
    action: "API authentication",
    distance: "0.2 km",
    cost: "$0.00",
  },
]

export const sampleEvents: Event[] = [
  {
    id: "evt_001",
    timestamp: "2025-06-28T20:15:30Z",
    direction: "request",
    method: "tools/call",
    payloadPreview: '{"name": "github-search", "arguments": {"query": "kubernetes deployment"}}',
    payload: {
      name: "github-search",
      arguments: {
        query: "kubernetes deployment",
        sort: "stars",
        order: "desc",
      },
    },
    size: 156,
    processedAt: "2025-06-28T20:15:31Z",
    riskScore: 15,
    costEstimate: 0.02,
  },
  {
    id: "evt_002",
    timestamp: "2025-06-28T20:15:32Z",
    direction: "response",
    method: "tools/call",
    payloadPreview: '{"content": [{"type": "text", "text": "Found 1,234 repositories matching your query..."}]}',
    payload: {
      content: [
        {
          type: "text",
          text: "Found 1,234 repositories matching your query for 'kubernetes deployment'. Top results include: kubernetes/kubernetes (98.2k stars), helm/helm (25.1k stars)...",
        },
      ],
    },
    size: 2048,
    processedAt: "2025-06-28T20:15:33Z",
    riskScore: 5,
    costEstimate: 0.01,
  },
  {
    id: "evt_003",
    timestamp: "2025-06-28T20:14:45Z",
    direction: "request",
    method: "resources/read",
    payloadPreview: '{"uri": "file:///etc/passwd", "mimeType": "text/plain"}',
    payload: {
      uri: "file:///etc/passwd",
      mimeType: "text/plain",
    },
    size: 89,
    processedAt: "2025-06-28T20:14:46Z",
    riskScore: 85,
    costEstimate: 0.01,
  },
  {
    id: "evt_004",
    timestamp: "2025-06-28T20:14:20Z",
    direction: "request",
    method: "prompts/get",
    payloadPreview: '{"name": "code-review", "arguments": {"language": "typescript", "complexity": "high"}}',
    payload: {
      name: "code-review",
      arguments: {
        language: "typescript",
        complexity: "high",
        focus: ["security", "performance"],
      },
    },
    size: 234,
    processedAt: "2025-06-28T20:14:21Z",
    riskScore: 25,
    costEstimate: 0.03,
  },
  {
    id: "evt_005",
    timestamp: "2025-06-28T20:13:15Z",
    direction: "response",
    method: "resources/read",
    payloadPreview:
      '{"content": "root:x:0:0:root:/root:/bin/bash\\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin..."}',
    payload: {
      content:
        "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin",
    },
    size: 1024,
    processedAt: "2025-06-28T20:13:16Z",
    riskScore: 95,
    costEstimate: 0.01,
  },
]

export const sampleStats = {
  totalEvents: 1471,
  uniqueMethods: 12,
  totalCost: 47.23,
  averageResponseTime: 120,
  startTime: "2025-06-27T00:00:00Z",
  endTime: "2025-06-28T00:00:00Z",
}

export const alerts: Alert[] = [
  {
    id: "alert_001",
    type: "warning",
    title: "Unusual Activity Detected",
    message: "Database queries increased 340% in the last hour",
    timestamp: "2025-06-28T20:10:00Z",
    action: "investigate",
  },
]

export const sampleUser: UserAccount = {
  name: "John Developer",
  email: "john@company.com",
  avatar: "/placeholder.svg?height=40&width=40",
  subscription: "pro",
  joinedAt: "2025-06-01",
  monthlyUsage: {
    events: 12450,
    cost: 47.23,
    limit: 50000,
  },
}
