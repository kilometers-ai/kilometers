// API Configuration
const getApiBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (baseUrl) {
    return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }
  return "http://localhost:5194"; // Default for local dev
};

export const API_BASE_URL = getApiBaseUrl();

export const fetchFromApi = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed with status ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Types matching the .NET API exactly
export interface ActivityEvent {
  id: string;
  timestamp: string;
  direction: 'request' | 'response';
  method?: string;
  payloadPreview: string;
  size: number;
  processedAt: string;
  source: string;
  riskScore?: number;
  costEstimate?: number;
}

export interface ActivityStats {
  totalEvents: number;
  uniqueMethods: number;
  totalCost: number;
  averageResponseTime: number;
  startTime: string;
  endTime: string;
}

export interface ServiceInfo {
  service: string;
  version: string;
  environment: string;
  timestamp: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  environment: string;
}

export interface EventSubmissionResponse {
  success: boolean;
  eventId?: string;
  error?: string;
}

export interface BatchSubmissionResponse {
  success: boolean;
  eventsProcessed?: number;
  error?: string;
}

// MCP Event DTO for submissions (matches .NET API)
export interface MpcEventDto {
  id: string;
  timestamp: string;
  customerId?: string;
  direction: string;
  method?: string;
  payload: string; // Base64 encoded
  size: number;
}

export interface EventBatchDto {
  events: MpcEventDto[];
}

// API Client Implementation
class KilometersApiClient {
  private baseUrl: string;
  private defaultCustomerId: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    // Read customer ID from environment variable, fallback to 'default'
    this.defaultCustomerId = process.env.NEXT_PUBLIC_CUSTOMER_ID || 'default';
  }

  // GET / - Service info
  async getServiceInfo(): Promise<ServiceInfo> {
    return fetchFromApi<ServiceInfo>('/');
  }

  // GET /health - Health check
  async getHealth(): Promise<HealthResponse> {
    return fetchFromApi<HealthResponse>('/health');
  }

  // GET /api/activity - Get recent activity events
  async getActivity(customerId?: string, limit: number = 10): Promise<ActivityEvent[]> {
    const params = new URLSearchParams({
      customerId: customerId || this.defaultCustomerId,
      limit: limit.toString()
    });
    return fetchFromApi<ActivityEvent[]>(`/api/activity?${params}`);
  }

  // GET /api/stats - Get usage statistics
  async getStats(customerId?: string): Promise<ActivityStats> {
    const params = new URLSearchParams({
      customerId: customerId || this.defaultCustomerId
    });
    return fetchFromApi<ActivityStats>(`/api/stats?${params}`);
  }

  // POST /api/events - Submit single event
  async submitEvent(event: MpcEventDto): Promise<EventSubmissionResponse> {
    return fetchFromApi<EventSubmissionResponse>('/api/events', {
      method: 'POST',
      body: JSON.stringify(event)
    });
  }

  // POST /api/events/batch - Submit batch of events
  async submitEventBatch(batch: EventBatchDto): Promise<BatchSubmissionResponse> {
    return fetchFromApi<BatchSubmissionResponse>('/api/events/batch', {
      method: 'POST',
      body: JSON.stringify(batch)
    });
  }

  // Helper method to create a test event
  createTestEvent(): MpcEventDto {
    return {
      id: `test_${Date.now()}`,
      timestamp: new Date().toISOString(),
      customerId: this.defaultCustomerId,
      direction: 'request',
      method: 'tools/call',
      payload: btoa(JSON.stringify({ test: 'event from dashboard', timestamp: new Date().toISOString() })),
      size: 64
    };
  }

  // Getter for the current customer ID (useful for debugging)
  getCurrentCustomerId(): string {
    return this.defaultCustomerId;
  }
}

// Export singleton instance
export const apiClient = new KilometersApiClient(); 