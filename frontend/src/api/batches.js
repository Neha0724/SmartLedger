import { apiClient, USE_MOCKS, mockDelay } from './client';
import { mockStore } from '@/mocks/store';
export async function uploadBatch(payload) {
    if (USE_MOCKS) {
        const rowCount = payload.rowCount || 50;
        const batch = mockStore.createBatch({
            filename: payload.file.name,
            totalRows: rowCount,
            runQwenReasoning: payload.runQwenReasoning,
            autoRouteToReview: payload.autoRouteToReview,
        });
        return mockDelay(batch, 400);
    }
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('run_qwen_reasoning', String(payload.runQwenReasoning));
    formData.append('auto_route_to_review', String(payload.autoRouteToReview));
    return apiClient('/batches', {
        method: 'POST',
        body: formData,
    });
}
export async function getBatches() {
    if (USE_MOCKS) {
        return mockDelay(mockStore.getBatches(), 200);
    }
    return apiClient('/batches');
}
export async function getBatch(batchId) {
    if (USE_MOCKS) {
        const b = mockStore.getBatchById(batchId);
        if (!b)
            throw new Error('Batch not found');
        return mockDelay(b, 200);
    }
    return apiClient(`/batches/${batchId}`);
}
export async function pollBatchProgress(batchId) {
    if (USE_MOCKS) {
        const progress = mockStore.progressBatch(batchId);
        if (!progress)
            throw new Error('Batch not found');
        return mockDelay(progress, 300);
    }
    return apiClient(`/batches/${batchId}/status`);
}
