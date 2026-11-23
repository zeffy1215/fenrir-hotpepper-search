import { useState, useEffect, Fragment } from "react";
import { useSearchParams, Link } from "react-router";
import Select from 'react-select';
import { searchShops } from "../../api/shops";
import styles from "./Result.module.css";

// 表示順
const LOCATION_ORDER_OPTIONS = [
    { value: "1", label: "近い順" },
    { value: "4", label: "おすすめ順" },
];

// 表示件数
const SEARCH_COUNT_OPTIONS = [
    { value: 10, label: "10件"},
    { value: 30, label: "30件"},
    { value: 50, label: "50件"},
    { value: 100, label: "100件"},
];

// セレクトボックスのスタイル
const selectStyles = {
    control: (base) => ({...base, cursor: "pointer", paddingLeft: "10px"}),
    option: (base) => ({...base, cursor: "pointer"}),
    singleValue: (base) => ({...base, textAlign: "start"}),
};

// 分割取得数
const getChunkSize = (total) => {
    if (total <= 10) return 10;
    if (total <= 30) return 15;
    return 25;
};

function Result() {
    const [searchParams, setSearchParams] = useSearchParams();
    const type = searchParams.get("type") ?? "other";

    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const range = searchParams.get("range");

    const largeArea = searchParams.get("large");
    const middleArea = searchParams.get("middle");
    const smallArea = searchParams.get("small");

    const genre = searchParams.get("genre");

    const start = Number(searchParams.get("start") ?? 1);
    const count = Number(searchParams.get("count") ?? 10);

    const order = searchParams.get("order");

    const free_drink = Number(searchParams.get("free_drink") ?? 0);
    const free_food = Number(searchParams.get("free_food") ?? 0);
    const card = Number(searchParams.get("card") ?? 0);
    const parking = Number(searchParams.get("parking")?? 0);
    const lunch = Number(searchParams.get("lunch")?? 0);
    const midnight = Number(searchParams.get("midnight")?? 0);

    const [results, setResults] = useState({});

    // 初回取得終了フラグ
    const [loading, setLoading] = useState(true);

    // 分割取得終了フラグ
    const [isFetchingMore, setIsFetchingMore] = useState(true);

    const [error, setError] = useState(null);

    const currentPage = Math.ceil(start / count);

    const [inputPageValue, setInputPageValue] = useState(String(currentPage));

    // クエリパラメータの変更に伴うuseEffect
    useEffect (() => {
        let ignore = false;

        const fetchShops = async () => {
            setLoading(true);
            setIsFetchingMore(true);

            const end = start + count;
            const chunkSize = getChunkSize(count);

            let mergedResults = null;
            for (let currentStart = start; currentStart < end; currentStart+= chunkSize) {
                if (ignore) break;

                // 最後の取得で残りの件数より多く取らないようにする
                // 例：count = 100, chunkSize = 30
                // 30 → 30 → 30 → 10 で取得する
                // getChunkSizeを変更しても大丈夫なように
                const fetchCount = Math.min(chunkSize, end - currentStart);

                try {
                    const obj = {
                        "lat": lat,
                        "lng": lng,
                        "range": range,
                        "large_area": largeArea,
                        "middle_area": middleArea,
                        "small_area": smallArea,
                        "genre": genre,
                        "start": currentStart,
                        "count": fetchCount,
                        "order": order,
                        "free_drink": free_drink,
                        "free_food": free_food,
                        "card": card,
                        "parking": parking,
                        "lunch": lunch,
                        "midnight": midnight,
                    }

                    const params = Object.fromEntries(
                        // 送るパラメータに0が意味のある数字として使うときはフィルター条件を変更する
                        Object.entries(obj).filter(([k, v]) => v)
                    );
                    const res = await searchShops(params);
                    if (ignore) break;

                    // レスポンスを結合 (初回はコピー)
                    mergedResults = mergedResults === null
                        ? {...res}
                        : {
                            ...mergedResults,
                            count: mergedResults.count + res.count,
                            shops: [...mergedResults.shops, ...res.shops],
                        };
                    
                    setResults(mergedResults);
                    setLoading(false);

                    // 件数の都合上、これ以上取得するものがなくなったらbreak
                    if (res.available <= currentStart + fetchCount) break;
                } catch (err) {
                    console.error(err);
                    break;
                } 
            } 
            setIsFetchingMore(false);
        }
        
        fetchShops();
        setInputPageValue(String(currentPage));

        return () => {
            ignore = true;
        };
    }, [searchParams]);

    const pageList = () => {
        if (maxPage <= 14) {
            return Array.from({ length: maxPage }, (_, i) => i + 1);
        }

        if (currentPage <= 7) {
            return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, "...", maxPage-1, maxPage];
        }

        if (maxPage - currentPage <= 7) {
            return [...[1, 2, "..."], ...Array.from({ length: 10 }, (_, i) => maxPage - 9 + i)];
        }

        return [1, 2, "...", currentPage-3, currentPage-2, currentPage-1, currentPage, currentPage+1, currentPage+2, currentPage+3, "...", maxPage-1, maxPage];
    };
    
    // 表示順変更ハンドラー (1ページ目戻す)
    function handleOrderChange(e) {
        setSearchParams((s) => {
            s.set("start", 1);
            s.set("order", e.value);
            return s;
        });
    }

    // 表示件数変更ハンドラー (1ページ目戻す)
    function handleCountChange(e) {
        setSearchParams((s) => {
            s.set("start", 1);
            s.set("count", e.value);
            return s;
        });
    }

    // ページ変更ハンドラー
    function handlePageChange(value) {
        const page = Number(value);

        // ページのinputに数値以外は入力された時
        if (!Number.isInteger(page)) {
            alert(`数値以外が入力されました。\n（半角数字で入力してください）`);
            setInputPageValue(String(currentPage));
            return;
        }

        // ページのinputに現在のページが入力されても何もしない
        if (page === currentPage) return;

        // ページのinputに入力された値が範囲外
        if (page < 1 || maxPage < page) {
            alert(`範囲外の数値が入力されました。\n（入力可能範囲：1〜${maxPage}）`);
            setInputPageValue(String(currentPage));
            return;
        }

        const transitionPage = count * (page - 1) + 1
        setSearchParams((s) => {
            s.set("start", transitionPage);
            return s;
        })
    }

    if (loading) {
        return (
            <main>
                <div className={styles.loading}>
                    <svg viewBox="-60, -60, 120, 120">
                        <circle r="50"/>
                    </svg>
                </div>
                <p>検索中...</p>
            </main>
        );
    }

    if (error) {
        return (
            <p>{error}</p>
        )
    }

    const maxPage = Math.ceil(results.available / count);

    // ページの矢印ボタン(「<」「>」)のdisable用
    const preButton = !(currentPage > 1);
    const nextButton = !(currentPage < maxPage);

    return (
        <main>
            <h2>検索結果</h2>

            {/* ツールバー(表示形式) */}
            <div className={styles.resultToolbar}>
                <p className={styles.resultCount}>{start} ~ {Math.min(start + count - 1, results.available)} 件を表示 / 全 {results.available} 件</p>
                <span className={styles.orderLabel}>表示順：</span>
                {type === "location" ? (
                    <Select 
                        className={styles.orderSelect}
                        styles={selectStyles}
                        options={LOCATION_ORDER_OPTIONS}
                        value={LOCATION_ORDER_OPTIONS.find(e => e.value === order)}
                        onChange={handleOrderChange}
                        isSearchable={false}
                    ></Select>
                ) : (
                    // 位置情報以外の検索の際は、おすすめ順で表示
                    <span className={styles.otherOrderSelect}>おすすめ順</span>
                )}
                <span className={styles.countLabel}>表示件数：</span>
                <Select
                    className={styles.countSelect}
                    styles={selectStyles}
                    options={SEARCH_COUNT_OPTIONS}
                    value={SEARCH_COUNT_OPTIONS.find(e => e.value === count)}
                    onChange={handleCountChange}
                    isSearchable={false}
                ></Select>
            </div>

            {/* 店舗情報リスト */}
            <ul className={styles.shopList}>
                {results.shops.map((shop) => (
                    <li key={shop.id} className={styles.shopGrid}>
                        <div className={styles.photo}>
                            <img src={shop.photo.large} alt="店舗画像"></img>
                        </div>
                        <div className={styles.info}>
                            <Link to={`/detail?id=${shop.id}`} className={styles.shopName}>{shop.name}</Link>
                            <p className={styles.shopGenre}>
                                {shop.genre.map((genre) => genre.name).join(" / ")}
                                {shop.catch && (
                                    <span className={styles.shopCatch}>{shop.catch}</span>
                                )}
                            </p>

                            <p className={styles.shopAccess}>📍{shop.access}</p>

                            <div className={styles.shopOpenBox}>
                                <p className={styles.shopOpenTitle}>営業時間</p>
                                <div className={styles.shopOpenGrid}>
                                    {Array.isArray(shop.open) ? (
                                        <>
                                            {shop.open.map((o, index) => (
                                                <Fragment key={index}>
                                                    <span className={styles.shopOpenDays}>{o.days}</span>
                                                    <span className={styles.shopOpenMark}>:</span>
                                                    <span className={styles.shopOpenHours}>{o.hours}</span>
                                                </Fragment>
                                            ))}
                                        </>
                                    ) : (
                                        <p className={styles.shopOpen}>{shop.open}</p>
                                    )}
                                    <span className={styles.shopCloseDays}>定休日</span>
                                    <span className={styles.shopCloseMark}>:</span>
                                    <span className={styles.shopCloseHours}>{shop.close ? shop.close.replace(/定休[日]?[:：]?/, "") : "掲載なし"}</span>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
            {isFetchingMore === true && (
                // 分割取得中 (初回取得は終了している)
                <>
                    <div className={styles.loading}>
                        <svg viewBox="-60, -60, 120, 120">
                            <circle r="50"/>
                        </svg>
                    </div>
                    <p>{results.count} / {Math.min(count, results.available - start + 1)} 件を読み込みました</p>
                    <p>続きを読み込み中...</p>
                </>
            )}

            {/* ページ遷移 */}
            <div className={styles.pageBox}>
                <button className={styles.pageButton} onClick={() => handlePageChange(currentPage-1)} disabled={preButton}>{"<"}</button>
                <div className={styles.pageList}>
                    {pageList().map((page, index) => (
                        <Fragment key={index}>
                            {(Number.isInteger(page) && page !== currentPage) ? (
                                <button
                                    className={styles.pageButton}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            ) : (
                                <span
                                    className={styles.pageButton}
                                    data-current={typeof page === 'number' ? true : undefined}
                                >
                                    {page}
                                </span>
                            )}
                        </Fragment>
                    ))}
                </div>
                <button className={styles.pageButton} onClick={() => handlePageChange(currentPage+1)} disabled={nextButton}>{">"}</button>
            </div>
            <div className={styles.pageInputBox}>
                <input
                    type="number"
                    value={inputPageValue}
                    className={styles.pageInput}
                    min={1}
                    max={maxPage}
                    onChange={(e) => setInputPageValue(Number(e.target.value))}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handlePageChange(e.target.value);
                        }
                    }}
                />
                <span> / <span className={styles.inputMaxValue}>{maxPage}</span></span>
            </div>
        </main>
    )
}

export default Result;