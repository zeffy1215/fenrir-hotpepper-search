const API_BASE = '/api/shops';

export const searchShops = async (obj) => {
    const params = new URLSearchParams(obj);
    const res = await fetch(`${API_BASE}/search?${params}`);

    if (!res.ok) {
        const body = await res.json().catch(() => {});
        const message = body.error ?? '不明なエラーが発生しました'
        throw Error(`ステータスコード: ${res.status}, メッセージ: ${message}`);
    }

    return await res.json();
}