import { sampleEvents, sampleStats } from './sample-data';
import type { ActivityEvent, ActivityStats, ServiceInfo, HealthResponse, EventSubmissionResponse, BatchSubmissionResponse, MpcEventDto, EventBatchDto } from './api-client';

const mockApiClient = {
  getServiceInfo: async (): Promise<ServiceInfo> => {
    console.log("Using mock API: getServiceInfo");
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      service: "Kilometers.Api",
      version: "1.0.0-mock",
      environment: "mock",
      timestamp: new Date().toISOString()
    };
  },

  getHealth: async (): Promise<HealthResponse> => {
    console.log("Using mock API: getHealth");
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      status: "Healthy",
      timestamp: new Date().toISOString(),
      environment: "mock"
    };
  },

  getActivity: async (customerId?: string, limit: number = 10): Promise<ActivityEvent[]> => {
    console.log(`Using mock API: getActivity (customerId: ${customerId}, limit: ${limit})`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return sampleEvents.slice(0, limit) as ActivityEvent[];
  },

  getStats: async (customerId?: string): Promise<ActivityStats> => {
    console.log(`Using mock API: getStats (customerId: ${customerId})`);
    await new Promise(resolve => setTimeout(resolve, 400));
    return sampleStats;
  },

  submitEvent: async (event: MpcEventDto): Promise<EventSubmissionResponse> => {
    console.log("Using mock API: submitEvent", event);
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, eventId: event.id };
  },

  submitEventBatch: async (batch: EventBatchDto): Promise<BatchSubmissionResponse> => {
    console.log("Using mock API: submitEventBatch", batch);
    await new Promise(resolve => setTimeout(resolve, 400));
    return { success: true, eventsProcessed: batch.events.length };
  },

  createTestEvent: (): MpcEventDto => {
    return {
      id: `mock_test_${Date.now()}`,
      timestamp: new Date().toISOString(),
      customerId: 'default',
      direction: 'request',
      method: 'tools/call',
      payload: btoa(JSON.stringify({ test: 'mock event from dashboard', timestamp: new Date().toISOString() })),
      size: 64
    };
  }
};

export default mockApiClient; 