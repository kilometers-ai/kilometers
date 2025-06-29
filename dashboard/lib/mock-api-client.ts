import { ActivityEvent, ActivityStats, ServiceInfo, HealthResponse, CustomerInfo, MpcEventDto, EventBatchDto, EventSubmissionResponse, BatchSubmissionResponse } from './api-client';

// ✅ Updated Mock API Client - Removed customer ID, added API key auth
const mockApiClient = {
  // GET / - Service info (public endpoint)
  getServiceInfo: async (): Promise<ServiceInfo> => {
    console.log('Using mock API: getServiceInfo');
    return {
      service: 'Kilometers API (Mock)',
      version: '1.0.0-mock',
      environment: 'development',
      timestamp: new Date().toISOString()
    };
  },

  // GET /health - Health check (public endpoint)
  getHealth: async (): Promise<HealthResponse> => {
    console.log('Using mock API: getHealth');
    return {
      status: 'Healthy',
      timestamp: new Date().toISOString(),
      environment: 'development'
    };
  },

  // ✅ GET /api/customer - Get authenticated customer info (NEW)
  getCustomerInfo: async (): Promise<CustomerInfo> => {
    console.log('Using mock API: getCustomerInfo');
    return {
      apiKeyPrefix: 'km_live_abc123',
      email: 'demo@kilometers.ai',
      organization: 'Demo Organization',
      authenticatedAt: new Date().toISOString()
    };
  },

  // ✅ GET /api/activity - Get recent activity (NO customerId parameter)
  getActivity: async (limit: number = 10): Promise<ActivityEvent[]> => {
    console.log(`Using mock API: getActivity (limit: ${limit})`);
    return Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
      id: `mock_${Date.now()}_${i}`,
      timestamp: new Date(Date.now() - i * 60000).toISOString(),
      direction: i % 2 === 0 ? 'request' : 'response' as 'request' | 'response',
      method: 'tools/call',
      payloadPreview: `Mock event ${i + 1}`,
      size: 64 + i * 10,
      processedAt: new Date().toISOString(),
      source: 'mock-mcp-server',
      riskScore: Math.floor(Math.random() * 100),
      costEstimate: Math.random() * 0.1
    }));
  },

  // ✅ GET /api/stats - Get usage statistics (NO customerId parameter)
  getStats: async (): Promise<ActivityStats> => {
    console.log('Using mock API: getStats');
    return {
      totalEvents: 1471,
      uniqueMethods: 12,
      totalCost: 23.45,
      averageResponseTime: 150,
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date().toISOString()
    };
  },

  // POST /api/events - Submit single event
  submitEvent: async (event: MpcEventDto): Promise<EventSubmissionResponse> => {
    console.log('Using mock API: submitEvent', event);
    return {
      success: true,
      eventId: event.id
    };
  },

  // POST /api/events/batch - Submit batch of events
  submitEventBatch: async (batch: EventBatchDto): Promise<BatchSubmissionResponse> => {
    console.log('Using mock API: submitEventBatch', batch);
    return {
      success: true,
      eventsProcessed: batch.events.length
    };
  },

  // ✅ Helper method to create a test event (REMOVED customerId)
  createTestEvent: (): MpcEventDto => {
    return {
      id: `mock_test_${Date.now()}`,
      timestamp: new Date().toISOString(),
      // ✅ No customerId field - API gets customer from Bearer token
      direction: 'request',
      method: 'tools/call',
      payload: btoa(JSON.stringify({ test: 'mock event from dashboard', timestamp: new Date().toISOString() })),
      size: 64,
      riskScore: 0
    };
  },

  // ✅ Test API key authentication (mock implementation)
  testAuthentication: async (): Promise<boolean> => {
    console.log('Using mock API: testAuthentication');
    return true;
  },

  // ✅ Mock implementations for new methods
  setApiKey: (apiKey: string): void => {
    console.log('Using mock API: setApiKey', apiKey.substring(0, 10) + '...');
  },

  getApiKey: (): string | null => {
    return 'km_mock_123456789';
  }
};

export default mockApiClient; 