const API_BASE = '/api/areas';

export const getLargeAreaMaster = async () => {
    const res = await fetch(`${API_BASE}/large`);

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const error = new Error(body.error ?? "不明なエラーが発生しました");
        error.status = res.status;
        throw error;
    }

    return await res.json();
}

export const getMiddleAreaMaster = async (code) => {
    const res = await fetch(`${API_BASE}/middle/${code}`);

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const error = new Error(body.error ?? "不明なエラーが発生しました");
        error.status = res.status;
        throw error;
    }

    return await res.json();
}

export const getSmallAreaMaster = async (code) => {
    const res = await fetch(`${API_BASE}/small/${code}`);

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const error = new Error(body.error ?? "不明なエラーが発生しました");
        error.status = res.status;
        throw error;
    }

    return await res.json();
}