const API_BASE = '/api/genres';

export const getGenreMaster = async () => {
    const res = await fetch(`${API_BASE}/`);

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const error = new Error(body.error ?? "不明なエラーが発生しました");
        error.status = res.status;
        throw error;
    }

    return await res.json();
}
