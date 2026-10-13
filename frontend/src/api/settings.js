import { apiClient, USE_MOCKS, mockDelay } from './client';
import { mockStore } from '@/mocks/store';
export async function getSettings() {
    if (USE_MOCKS) {
        return mockDelay(mockStore.getSettings(), 150);
    }
    return apiClient('/settings');
}
export async function updateSettings(settings) {
    if (USE_MOCKS) {
        return mockDelay(mockStore.updateSettings(settings), 250);
    }
    return apiClient('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
    });
}
