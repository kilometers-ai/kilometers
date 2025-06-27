import { featureFlags } from './feature-flags';
import apiClient from './api-client';
import mockApiClient from './mock-api-client';

const api = featureFlags.USE_REAL_API_DATA ? apiClient : mockApiClient;

export default api; 