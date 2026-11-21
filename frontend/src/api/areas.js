const API_BASE = '/api/area/';

export const getLargeAreaMaster = async () => {
    const res = await fetch(`${API_BASE}/large`);

    if (!res.ok) {
        const body = await res.json().catch(() => {});
        const message = body.error ?? '不明なエラーが発生しました'
        throw Error(`ステータスコード: ${res.status}, メッセージ: ${message}`);
    }

    return await res.json();
}

export const getMiddleAreaMaster = async (code) => {
    const res = await fetch(`${API_BASE}/middle/${code}`);

    if (!res.ok) {
        const body = await res.json().catch(() => {});
        const message = body.error ?? '不明なエラーが発生しました'
        throw Error(`ステータスコード: ${res.status}, メッセージ: ${message}`);
    }

    return await res.json();
}