export const getErrorMessage = (err) => {
    if (!err.status) return "通信できませんでした。ネットワークを確認してください。";
    if (err.status === 400) return "検索条件が正しくありません。条件を選び直してください。";
    if (err.status === 404) return "お店の情報が見つかりませんでした。";
    if (err.status === 504) return "時間がかかりすぎたため、検索できませんでした。もう一度お試しください。";
    return "システムにエラーが発生しました。時間をおいてもう一度お試しください。";
};