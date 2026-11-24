const API_BASE = '/api/shops';

export const searchShops = async (obj) => {
    const params = new URLSearchParams(obj);
    const res = await fetch(`${API_BASE}/search?${params}`);

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const error = new Error(body.error ?? "不明なエラーが発生しました");
        error.status = res.status;
        throw error;
    }

    return await res.json();
}

export const detailShop = async (id) => {
    const res = await fetch(`${API_BASE}/${id}`);

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const error = new Error(body.error ?? "不明なエラーが発生しました");
        error.status = res.status;
        throw error;
    }

    return await res.json();
}