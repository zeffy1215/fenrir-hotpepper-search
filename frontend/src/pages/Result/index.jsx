import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import Select from 'react-select';
import { searchShops } from "../../api/shops";
import styles from "./Result.module.css";

const location_order_options = [
    { value: "1", label: "近い順" },
    { value: "4", label: "おすすめ順" },
]

function Result() {
    const [searchParams] = useSearchParams();
    const type = searchParams.get("type") ?? "other";

    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const range = searchParams.get("range");

    const [start, setStart] = useState(searchParams.get("start"));
    const count = searchParams.get("count");

    const [order, setOrder] = useState(searchParams.get("order"));

    const free_drink = searchParams.get("free_drink");
    const free_food = searchParams.get("free_food");
    const card = searchParams.get("card");
    const parking = searchParams.get("parking");
    const lunch = searchParams.get("lunch");
    const midnight = searchParams.get("midnight");

    const [results, setResults] = useState({});

    const [loading, setLoading] = useState(true);

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
                if (!ignore) setResults(res);

            } catch (err) {
                console.error(err);
            } finally {
                if (!ignore) setLoading(false);
            }
        }
        
        fetchShops();

        return () => {
            ignore = true;
        };
    }, [start, order]);

    const page = () => {
        return Math.ceil(results.start, results.count)
    }

    function handleOrderChange(e) {
        setOrder(e.value)
    }

    if (loading) {
        return (
            <main>
                <p>検索中...</p>
            </main>
        );
    }
    return (
        <main>
            <h2>検索結果</h2>
                <div className={styles.resultToolbar}>
                    <p className={styles.resultCount}>{results.start} ~ {results.start + results.count - 1} 件を表示 / 全 {results.available} 件</p>
                    <>
                        {type === "location" ? (
                            <div className={styles.orderSelectBox}>
                                <label htmlFor="orderSelect">表示順：</label>
                                <Select id="orderSelect" className={styles.orderSelect} options={location_order_options} value={location_order_options.find(e => e.value === order)} onChange={handleOrderChange}></Select>
                            </div>
                        ) : (
                            <p className={styles.otherOrderSelect}>おすすめ順で表示中</p>
                        )}
                    </>
                </div>

            <ul className={styles.shopList}>
                {results.shops.map((shop) => (
                    <li key={shop.id} className={styles.shopGrid}>
                        <div className={styles.photo}>
                            <img src={shop.photo.large} alt="店舗画像"></img>
                        </div>
                        <div className={styles.info}>
                            <p className={styles.shopName}>{shop.name}</p>
                            <p className={styles.shopGenre}>{shop.genre_name}
                                {shop.sub_genre ? (
                                    <> / {shop.sub_genre}</>
                                ): (<></>)}
                            </p>
                            <p className={styles.shopCatch}>{shop.catch}</p>
                            <p className={styles.shopOpen}>{shop.open}</p>
                            <p className={styles.shopClose}>{shop.close}</p>
                            <p className={styles.shopAccess}>{shop.access}</p>
                        </div>
                    </li>
                ))}
            </ul>
            <div>
                <p>{page()}ページ目</p>
            </div>
        </main>
    )
}

export default Result;