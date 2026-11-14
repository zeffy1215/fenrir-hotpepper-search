import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { searchShops } from "../../api/shops";
import styles from "./Result.module.css";

function Result() {
    const [searchParams] = useSearchParams();
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const range = searchParams.get("range");

    const [results, setResults] = useState({});

    const [loading, setLoading] = useState(true);

    
    
    useEffect (() => {
        let ignore = false;

        const fetchShops = async () => {
            try {
                const params = {
                    "lat": lat,
                    "lng": lng,
                    "range": range
                }
                const res = await searchShops(params);
                console.log(res.results);
                if (!ignore) setResults(res.results);

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
    }, [lat, lng, range]);

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
            <ul className={styles.shopList}>
                {results.shop.map((shop) => (
                    <li key={shop.id} className={styles.shopGrid}>
                        <div className={styles.photo}>
                            <img src={shop.photo.pc.l} alt="店舗画像"></img>
                        </div>
                        <div>
                            <a href={shop.urls.pc}>{shop.name}</a>
                            <p>{shop.access}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </main>
    )
}

export default Result;