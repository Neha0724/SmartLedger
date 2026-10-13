import { apiClient, USE_MOCKS, mockDelay } from './client';
import { mockAnalytics } from '@/mocks/mockData';
export async function getAnalyticsMetrics() {
    if (USE_MOCKS) {
        return mockDelay(mockAnalytics, 250);
    }
    return apiClient('/analytics');
}
