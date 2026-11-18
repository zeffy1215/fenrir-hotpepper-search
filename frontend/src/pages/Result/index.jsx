import { useState, useEffect, Fragment } from "react";
import { useSearchParams, Link } from "react-router";
import Select from 'react-select';
import { searchShops } from "../../api/shops";
import styles from "./Result.module.css";

const location_order_options = [
    { value: "1", label: "近い順" },
    { value: "4", label: "おすすめ順" },
];

const search_count_options = [
    { value: 10, label: "10件"},
    { value: 30, label: "30件"},
    { value: 50, label: "50件"},
    { value: 100, label: "100件"},
];

const selectStyles = {
    control: (base) => ({...base, cursor: "pointer", paddingLeft: "10px"}),
    option: (base) => ({...base, cursor: "pointer"}),
    singleValue: (base) => ({...base, textAlign: "start"}),
};

function Result() {
    const [searchParams, setSearchParams] = useSearchParams();
    const type = searchParams.get("type") ?? "other";

    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const range = searchParams.get("range");

    const start = searchParams.get("start") ?? 1;
    const count = Number(searchParams.get("count") ?? 10);

    const order = searchParams.get("order");

    const free_drink = Number(searchParams.get("free_drink") ?? 0);
    const free_food = Number(searchParams.get("free_food") ?? 0);
    const card = Number(searchParams.get("card") ?? 0);
    const parking = Number(searchParams.get("parking")?? 0);
    const lunch = Number(searchParams.get("lunch")?? 0);
    const midnight = Number(searchParams.get("midnight")?? 0);

    const [results, setResults] = useState({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentPage = Math.ceil(start / count);

    const [inputPageValue, setInputPageValue] = useState(String(currentPage));

    useEffect (() => {
        let ignore = false;

        const fetchShops = async () => {
            setLoading(true);
            try {
                const obj = {
                    "lat": lat,
                    "lng": lng,
                    "range": range,
                    "start": start,
                    "count": count,
                    "order": order,
                    "free_drink": free_drink,
                    "free_food": free_food,
                    "card": card,
                    "parking": parking,
                    "lunch": lunch,
                    "midnight": midnight,
                }
                const params = Object.fromEntries(
                    Object.entries(obj).filter(([k, v]) => v !== null)
                );
                const res = await searchShops(params);
                if (!ignore) {
                    setResults(res);
                }

            } catch (err) {
                console.error(err);
            } finally {
                if (!ignore) setLoading(false);
            }
        }
        
        fetchShops();
        setInputPageValue(currentPage);

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
    
    function handleOrderChange(e) {
        setSearchParams((s) => {
            s.set("start", 1);
            s.set("order", e.value);
            return s;
        });
    }

    function handleCountChange(e) {
        setSearchParams((s) => {
            s.set("start", 1);
            s.set("count", e.value);
            return s;
        });
    }

    function handlePageChange(value) {
        let page;
        page = Number(value);
        if (!Number.isInteger(page)) {
            alert(`数値以外が入力されました。\n（半角数字で入力してください）`);
            setInputPageValue(String(currentPage));
            return;
        }
        if (page === currentPage) return;
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

    const maxPage = Math.ceil(results.available / count)
    const preButton = !(currentPage > 1);
    const nextButton = !(currentPage < maxPage);

    return (
        <main>
            <h2>検索結果</h2>
                <div className={styles.resultToolbar}>
                    <p className={styles.resultCount}>{results.start} ~ {results.start + results.count - 1} 件を表示 / 全 {results.available} 件</p>
                    <span className={styles.orderLabel}>表示順：</span>
                    {type === "location" ? (
                        <Select 
                            className={styles.orderSelect}
                            styles={selectStyles}
                            options={location_order_options}
                            value={location_order_options.find(e => e.value === order)}
                            onChange={handleOrderChange}
                            isSearchable={false}
                        ></Select>
                    ) : (
                        <span className={styles.otherOrderSelect}>おすすめ順</span>
                    )}
                    <span className={styles.countLabel}>表示件数：</span>
                    <Select
                        className={styles.countSelect}
                        styles={selectStyles}
                        options={search_count_options}
                        value={search_count_options.find(e => e.value === count)}
                        onChange={handleCountChange}
                        isSearchable={false}
                    ></Select>
                </div>

            <ul className={styles.shopList}>
                {results.shops.map((shop) => (
                    <li key={shop.id} className={styles.shopGrid}>
                        <div className={styles.photo}>
                            <img src={shop.photo.large} alt="店舗画像"></img>
                        </div>
                        <div className={styles.info}>
                            <Link to={`/detail?id=${shop.id}`} className={styles.shopName}>{shop.name}</Link>
                            <p className={styles.shopGenre}>{shop.genre_name}
                                {shop.sub_genre ? (
                                    <> / {shop.sub_genre} </>
                                ): (<></>)}
                                <span className={styles.shopCatch}>| {shop.catch}</span>
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
                                    <span className={styles.shopCloseHours}>{shop.close}</span>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
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