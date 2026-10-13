import { API_BASE_URL } from './client';

export async function classifyFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/predict/file`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `Classification failed (${response.status})`);
    }

    const blob = await response.blob();
    const filename = 'smartledger_classified_results.csv';
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    return {
        total: Number(response.headers.get('X-Total-Rows') || 0),
        successful: Number(response.headers.get('X-Successful-Rows') || 0),
        failed: Number(response.headers.get('X-Failed-Rows') || 0),
        filename,
    };
}
