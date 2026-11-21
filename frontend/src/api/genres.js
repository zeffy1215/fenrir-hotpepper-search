const API_BASE = '/api/genres';

export const getGenreMaster = async () => {
    const res = await fetch(`${API_BASE}/`);

    if (!res.ok) {
        const body = await res.json().catch(() => {});
        const message = body.error ?? '不明なエラーが発生しました'
        throw Error(`ステータスコード: ${res.status}, メッセージ: ${message}`);
    }

    return await res.json();
}
