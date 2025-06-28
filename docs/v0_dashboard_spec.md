# Kilometers.ai Dashboard - v0.dev Specification

## Project Overview

Create a real-time AI monitoring dashboard for **Kilometers.ai** that displays MCP (Model Context Protocol) events captured from AI tools. This is a modern SaaS dashboard with dark theme that shows AI agent interactions, costs, and security risks.

## Design System

### Color Palette
```css
/* Primary Colors */
--background: #0A0A0A;          /* Main background */
--surface: #18181B;             /* Card/surface background */
--text-primary: #FAFAFA;        /* Primary text */
--text-secondary: rgba(250, 250, 250, 0.7);  /* Secondary text */
--accent: #0EA5E9;              /* Primary accent/brand color */

/* Status Colors */
--success: #10B981;             /* Green for success states */
--warning: #F59E0B;             /* Orange for warnings */
--danger: #EF4444;              /* Red for errors/high risk */
--info: #3B82F6;                /* Blue for info */

/* UI Colors */
--border: rgba(14, 165, 233, 0.2);  /* Accent with 20% opacity */
--border-muted: rgba(250, 250, 250, 0.1);  /* Muted borders */
--hover: rgba(14, 165, 233, 0.1);   /* Hover states */
```

### Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Headings**: font-bold, various sizes (text-3xl, text-2xl, text-xl)
- **Body**: font-medium, text-sm and text-base
- **Code/Monospace**: font-mono for API keys, timestamps, JSON

### Layout Principles
- **Container**: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- **Spacing**: Consistent 4, 6, 8 spacing units
- **Cards**: Rounded corners (rounded-lg), subtle borders
- **Grid**: Responsive grid layouts (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)

## Application Structure

### Main Layout
```
┌─────────────────────────────────────────────────────────┐
│ Header: Kilometers Logo | Navigation | User Avatar      │
├─────────────────────────────────────────────────────────┤
│ Sidebar Navigation (Desktop) | Main Content Area        │
│ - Dashboard                  |                          │
│ - Events                     |                          │
│ - Analytics                  |                          │
│ - Settings                   |                          │
└─────────────────────────────────────────────────────────┘
```

### Navigation Structure
```typescript
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'Activity' },
  { name: 'Events', href: '/events', icon: 'Eye' },
  { name: 'Analytics', href: '/analytics', icon: 'BarChart3' },
  { name: 'Settings', href: '/settings', icon: 'Settings' },
]
```

## Page Specifications

### 1. Dashboard Home Page (`/dashboard`)

#### Layout
- Welcome message: "Welcome back! 👋 Here's what your AI agents have been up to."
- Time range selector: 1h, 24h, 7d, 30d (buttons)
- 2x2 grid of stats cards
- 2-column layout below: Services list + Recent Activity

#### Stats Cards (2x2 Grid)
```typescript
interface StatsCard {
  title: string
  value: string | number
  trend: string
  icon: string
  color: string
}

const statsCards = [
  {
    title: "Total Distance",
    value: "457 km",
    trend: "+12% from yesterday",
    icon: "Activity",
    color: "text-[#0EA5E9]"
  },
  {
    title: "Total Requests", 
    value: 1471,
    trend: "+8% from yesterday",
    icon: "Eye",
    color: "text-[#10B981]"
  },
  {
    title: "Total Cost",
    value: "$47.23",
    trend: "+15% from yesterday", 
    icon: "DollarSign",
    color: "text-[#F59E0B]"
  },
  {
    title: "Active Alerts",
    value: 3,
    trend: "2 new since yesterday",
    icon: "AlertTriangle", 
    color: "text-[#EF4444]"
  }
]
```

#### Active Services Card
```typescript
interface Service {
  name: string
  status: 'normal' | 'warning'
  requests: number
  distance: number
  cost: number
  trend: string
}

const services = [
  {
    name: "GitHub API",
    status: "normal",
    requests: 1337,
    distance: 234,
    cost: 23.45,
    trend: "+12%"
  },
  {
    name: "Database", 
    status: "warning",
    requests: 89,
    distance: 156,
    cost: 15.67,
    trend: "+340%"
  },
  {
    name: "Slack API",
    status: "normal", 
    requests: 45,
    distance: 67,
    cost: 8.11,
    trend: "+5%"
  }
]
```

#### Recent Activity Card
```typescript
interface RecentActivity {
  time: string
  action: string
  distance: string
  cost: string
}

const recentActivity = [
  {
    time: "2 min ago",
    action: "GitHub API call",
    distance: "2.3 km", 
    cost: "$0.02"
  },
  {
    time: "5 min ago",
    action: "Database query",
    distance: "1.8 km",
    cost: "$0.01"
  },
  {
    time: "12 min ago",
    action: "Slack message sent", 
    distance: "0.9 km",
    cost: "$0.01"
  }
]
```

#### Alert Banner
- Red/orange background with warning icon
- Text: "Unusual Activity Detected - Database queries increased 340% in the last hour."
- "Investigate →" button

### 2. Events Page (`/events`)

#### Header Section
- Page title: "Event Stream"
- Real-time indicator: Green dot + "Live" (or "Paused")
- Filters row: Direction dropdown, Method search, Time range, Risk level

#### Filters Interface
```typescript
interface EventFilters {
  direction: 'all' | 'request' | 'response'
  method: string  // Search input
  timeRange: '1h' | '24h' | '7d' | '30d'
  riskLevel: 'all' | 'low' | 'medium' | 'high'
}
```

#### Events Table
**Columns:**
- Timestamp (relative + absolute on hover)
- Direction (request/response with color-coded badges)
- Method (tools/call, resources/read, etc.)
- Payload Preview (first 100 chars, truncated)
- Size (formatted bytes: 1.2 KB, 3.4 MB)
- Risk Score (color-coded badges: green <20, yellow 20-50, red >50)
- Cost (formatted currency: $0.02)

**Sample Data:**
```typescript
interface Event {
  id: string
  timestamp: string
  direction: 'request' | 'response'
  method: string
  payloadPreview: string
  payload: object
  size: number
  riskScore: number
  costEstimate: number
}

const sampleEvents = [
  {
    id: "evt_001",
    timestamp: "2025-06-28T20:15:30Z",
    direction: "request",
    method: "tools/call", 
    payloadPreview: '{"name": "github-search", "arguments": {"query": "kubernetes deployment"}}',
    payload: {
      "name": "github-search",
      "arguments": {
        "query": "kubernetes deployment",
        "sort": "stars",
        "order": "desc"
      }
    },
    size: 156,
    riskScore: 15,
    costEstimate: 0.02
  },
  {
    id: "evt_002",
    timestamp: "2025-06-28T20:15:32Z", 
    direction: "response",
    method: "tools/call",
    payloadPreview: '{"content": [{"type": "text", "text": "Found 1,234 repositories matching your query..."}]}',
    payload: {
      "content": [
        {
          "type": "text",
          "text": "Found 1,234 repositories matching your query for 'kubernetes deployment'. Top results include: kubernetes/kubernetes (98.2k stars), helm/helm (25.1k stars)..."
        }
      ]
    },
    size: 2048,
    riskScore: 5,
    costEstimate: 0.01
  },
  {
    id: "evt_003",
    timestamp: "2025-06-28T20:14:45Z",
    direction: "request", 
    method: "resources/read",
    payloadPreview: '{"uri": "file:///etc/passwd", "mimeType": "text/plain"}',
    payload: {
      "uri": "file:///etc/passwd",
      "mimeType": "text/plain"
    },
    size: 89,
    riskScore: 85,
    costEstimate: 0.01
  },
  {
    id: "evt_004",
    timestamp: "2025-06-28T20:14:20Z",
    direction: "request",
    method: "prompts/get", 
    payloadPreview: '{"name": "code-review", "arguments": {"language": "typescript", "complexity": "high"}}',
    payload: {
      "name": "code-review",
      "arguments": {
        "language": "typescript",
        "complexity": "high",
        "focus": ["security", "performance"]
      }
    },
    size: 234,
    riskScore: 25,
    costEstimate: 0.03
  }
]
```

#### Expandable Row Details
- Click any row to expand
- Shows formatted JSON payload with syntax highlighting
- Copy to clipboard button
- Full timestamp and metadata

#### Table Features
- Pagination: 50 events per page
- Sort by any column
- Search across all fields
- Export to CSV button
- Auto-refresh every 5 seconds (with pause button)

### 3. Settings Page (`/settings`)

#### API Key Management Section
```typescript
interface ApiKeyDisplay {
  keyPreview: string  // "km_live_abc...xyz"
  fullKey: string     // Only shown when copying
  createdAt: string
  lastUsed: string
  usageCount: number
}

const apiKeyExample = {
  keyPreview: "km_live_abc123...def789",
  fullKey: "km_live_abc123def456ghi789jkl012mno345pqr678stu901vwx234yzab567cd890",
  createdAt: "2025-06-20T10:30:00Z",
  lastUsed: "2025-06-28T20:15:30Z", 
  usageCount: 1471
}
```

#### CLI Setup Instructions
```typescript
const cliInstructions = {
  macos: `# Install Kilometers CLI
curl -sSL https://get.kilometers.ai | sh

# Set your API key
export KILOMETERS_API_KEY="${apiKey}"

# Wrap any MCP server
km npx @modelcontextprotocol/server-github`,

  windows: `# Install via PowerShell
iwr https://get.kilometers.ai/install.ps1 | iex

# Set your API key
$env:KILOMETERS_API_KEY="${apiKey}"

# Wrap any MCP server
km npx @modelcontextprotocol/server-github`,

  linux: `# Install Kilometers CLI
curl -sSL https://get.kilometers.ai | sh

# Set your API key
export KILOMETERS_API_KEY="${apiKey}"

# Wrap any MCP server  
km npx @modelcontextprotocol/server-github`
}
```

#### Account Information Section
```typescript
interface UserAccount {
  name: string
  email: string
  avatar: string
  subscription: 'free' | 'pro' | 'enterprise'
  joinedAt: string
  monthlyUsage: {
    events: number
    cost: number
    limit: number
  }
}

const sampleUser = {
  name: "John Developer",
  email: "john@company.com", 
  avatar: "https://github.com/johndoe.png",
  subscription: "pro",
  joinedAt: "2025-06-01",
  monthlyUsage: {
    events: 12450,
    cost: 47.23,
    limit: 50000
  }
}
```

## Component Requirements

### UI Components Needed
1. **Stats Card**: Icon, title, value, trend indicator
2. **Data Table**: Sortable columns, expandable rows, pagination
3. **Event Badge**: Color-coded by direction/risk level
4. **JSON Viewer**: Syntax highlighted, collapsible
5. **Filter Bar**: Dropdowns, search inputs, date pickers
6. **API Key Display**: Masked text with copy functionality
7. **Code Block**: Syntax highlighted installation instructions
8. **Real-time Indicator**: Animated dot with status text
9. **Navigation Sidebar**: Collapsible on mobile
10. **User Menu**: Dropdown with avatar and account options

### Interactive Features
- **Hover States**: All clickable elements
- **Loading States**: Skeleton screens for data loading
- **Empty States**: When no data is available
- **Error States**: When API calls fail
- **Copy to Clipboard**: For API keys and code snippets
- **Expandable Rows**: Click to show full JSON payload
- **Real-time Updates**: Visual indicators for live data
- **Responsive Design**: Mobile-first approach

### Accessibility Requirements
- **Keyboard Navigation**: All interactive elements
- **Screen Reader Support**: Proper ARIA labels
- **Color Contrast**: WCAG AA compliance
- **Focus Indicators**: Visible focus states
- **Alt Text**: For all icons and images

## Sample JSON Data

### Complete Sample Dataset
```json
{
  "stats": {
    "totalEvents": 1471,
    "totalDistance": 457,
    "totalCost": 47.23,
    "alertsCount": 3,
    "trends": {
      "events": "+8%",
      "distance": "+12%", 
      "cost": "+15%",
      "alerts": "+2 new"
    }
  },
  "services": [
    {
      "name": "GitHub API",
      "icon": "github",
      "status": "normal",
      "requests": 1337,
      "distance": 234,
      "cost": 23.45,
      "trend": "+12%"
    },
    {
      "name": "Database",
      "icon": "database", 
      "status": "warning",
      "requests": 89,
      "distance": 156,
      "cost": 15.67,
      "trend": "+340%"
    },
    {
      "name": "Slack API",
      "icon": "slack",
      "status": "normal",
      "requests": 45, 
      "distance": 67,
      "cost": 8.11,
      "trend": "+5%"
    }
  ],
  "recentActivity": [
    {
      "id": "act_001",
      "time": "2 min ago",
      "action": "GitHub repository search",
      "distance": "2.3 km",
      "cost": "$0.02"
    },
    {
      "id": "act_002", 
      "time": "5 min ago",
      "action": "Database user query",
      "distance": "1.8 km",
      "cost": "$0.01"
    },
    {
      "id": "act_003",
      "time": "12 min ago",
      "action": "Slack message sent",
      "distance": "0.9 km", 
      "cost": "$0.01"
    }
  ],
  "alerts": [
    {
      "id": "alert_001",
      "type": "warning",
      "title": "Unusual Activity Detected",
      "message": "Database queries increased 340% in the last hour",
      "timestamp": "2025-06-28T20:10:00Z",
      "action": "investigate"
    }
  ]
}
```

## Technical Implementation Notes

### Framework Preferences
- **React** with functional components and hooks
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Recharts** for any charts/graphs (if needed)

### State Management
- Use React useState and useEffect for component state
- Mock API calls with setTimeout to simulate loading
- Implement optimistic updates for better UX

### Responsive Breakpoints
```css
/* Mobile First */
sm: 640px   /* Small tablets */
md: 768px   /* Large tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large desktops */
```

### Performance Considerations
- Virtualized tables for large datasets
- Debounced search inputs
- Memoized expensive calculations
- Lazy loading for expandable content

## Deliverables

### Phase 1 (v0.dev Output)
1. **Complete dashboard application** with all 3 pages
2. **Responsive design** that works on mobile and desktop
3. **Interactive components** with hover states and animations
4. **Sample data integration** showing realistic AI monitoring data
5. **Dark theme implementation** matching brand colors
6. **Navigation system** with proper routing
7. **TypeScript interfaces** for all data structures
8. **Tailwind CSS styling** with consistent design system

### Success Criteria
- ✅ Visually matches modern SaaS dashboards
- ✅ All interactive elements work properly
- ✅ Responsive design functions on all screen sizes
- ✅ Sample data displays correctly in all components
- ✅ Color scheme matches Kilometers.ai brand
- ✅ Code is clean, well-structured, and documented
- ✅ Ready for real API integration in next phase

This specification should provide v0.dev with everything needed to create a production-quality dashboard UI that perfectly matches your Kilometers.ai brand and requirements.