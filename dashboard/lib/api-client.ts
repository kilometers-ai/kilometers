// Updated Dashboard API Client - API Key Authentication, NO CustomerId

// API Configuration
const getApiBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (baseUrl) {
    return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }
  return "http://localhost:5194"; // Default for local dev
};

export const API_BASE_URL = getApiBaseUrl();

// ✅ Updated fetchFromApi to use API key authentication
export const fetchFromApi = async <T>(
  path: string,
  apiKey?: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // Add API key authentication if provided
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication failed - invalid API key');
    }
    throw new Error(`API call failed with status ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Types matching the updated .NET API
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

export interface CustomerInfo {
  apiKeyPrefix: string;
  email?: string;
  organization?: string;
  authenticatedAt: string;
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

// ✅ Updated MCP Event DTO - REMOVED customerId field
export interface MpcEventDto {
  id: string;
  timestamp: string;
  // ✅ Removed customerId field entirely
  direction: string;
  method?: string;
  payload: string; // Base64 encoded
  size: number;
  riskScore?: number;
}

export interface EventBatchDto {
  events: MpcEventDto[];
  cliVersion?: string;
  batchTimestamp?: string;
}

// ✅ Updated API Client - API Key based authentication
class KilometersApiClient {
  private baseUrl: string;
  private apiKey: string | null;

  constructor(apiKey?: string, baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    // ✅ API key is now the primary identifier - no more defaultCustomerId
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_KILOMETERS_API_KEY || null;
  }

  // ✅ Set API key for authentication
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  // ✅ Get current API key (useful for debugging)
  getApiKey(): string | null {
    return this.apiKey;
  }

  // GET / - Service info (public endpoint)
  async getServiceInfo(): Promise<ServiceInfo> {
    return fetchFromApi<ServiceInfo>('/');
  }

  // GET /health - Health check (public endpoint)
  async getHealth(): Promise<HealthResponse> {
    return fetchFromApi<HealthResponse>('/health');
  }

  // ✅ GET /api/customer - Get authenticated customer info (NEW)
  async getCustomerInfo(): Promise<CustomerInfo> {
    if (!this.apiKey) {
      throw new Error('API key is required for customer info');
    }
    return fetchFromApi<CustomerInfo>('/api/customer', this.apiKey);
  }

  // ✅ GET /api/activity - Get recent activity (NO customerId parameter)
  async getActivity(limit: number = 10): Promise<ActivityEvent[]> {
    if (!this.apiKey) {
      throw new Error('API key is required for activity data');
    }
    
    const params = new URLSearchParams({
      limit: limit.toString()
    });
    
    return fetchFromApi<ActivityEvent[]>(`/api/activity?${params}`, this.apiKey);
  }

  // ✅ GET /api/stats - Get usage statistics (NO customerId parameter)
  async getStats(): Promise<ActivityStats> {
    if (!this.apiKey) {
      throw new Error('API key is required for stats data');
    }
    
    return fetchFromApi<ActivityStats>('/api/stats', this.apiKey);
  }

  // POST /api/events - Submit single event
  async submitEvent(event: MpcEventDto): Promise<EventSubmissionResponse> {
    if (!this.apiKey) {
      throw new Error('API key is required for event submission');
    }
    
    return fetchFromApi<EventSubmissionResponse>('/api/events', this.apiKey, {
      method: 'POST',
      body: JSON.stringify(event)
    });
  }

  // POST /api/events/batch - Submit batch of events
  async submitEventBatch(batch: EventBatchDto): Promise<BatchSubmissionResponse> {
    if (!this.apiKey) {
      throw new Error('API key is required for batch submission');
    }
    
    return fetchFromApi<BatchSubmissionResponse>('/api/events/batch', this.apiKey, {
      method: 'POST',
      body: JSON.stringify(batch)
    });
  }

  // ✅ Helper method to create a test event (REMOVED customerId)
  createTestEvent(): MpcEventDto {
    return {
      id: `test_${Date.now()}`,
      timestamp: new Date().toISOString(),
      // ✅ No customerId field - API gets customer from Bearer token
      direction: 'request',
      method: 'tools/call',
      payload: btoa(JSON.stringify({ 
        test: 'event from dashboard', 
        timestamp: new Date().toISOString() 
      })),
      size: 64,
      riskScore: 0
    };
  }

  // ✅ Test API key authentication
  async testAuthentication(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }
    
    try {
      await this.getCustomerInfo();
      return true;
    } catch (error) {
      console.error('Authentication test failed:', error);
      return false;
    }
  }

  // ✅ Validate API key format (basic client-side validation)
  static isValidApiKeyFormat(apiKey: string): boolean {
    // Basic validation - should be a non-empty string
    // You can make this more sophisticated based on your API key format
    return typeof apiKey === 'string' && apiKey.length >= 16;
  }
}

// ✅ Export factory function for creating authenticated clients
export const createApiClient = (apiKey?: string): KilometersApiClient => {
  return new KilometersApiClient(apiKey);
};

// ✅ Export default instance (will use env var if available)
export const apiClient = new KilometersApiClient();

// ✅ Export the client class for type checking
export { KilometersApiClient }; 