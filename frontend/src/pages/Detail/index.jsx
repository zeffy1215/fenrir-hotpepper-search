import { useState, useEffect, Fragment } from "react";
import { useSearchParams } from "react-router";
import { detailShop } from "../../api/shops";
import styles from "./Detail.module.css";

function Detail() {
    const [searchParams] = useSearchParams();

    const id = searchParams.get("id");

    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect (() => {
        let ignore = false;

        const fetchShop = async () => {
            setLoading(true);

            try {
                const res = await detailShop(id);
                if (!ignore) setResults(res);
                console.log(res);
            } catch (err) {
                console.error(err);
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        fetchShop();

        return () => {
            ignore = true;
        }
    }, []);

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

    return (
        <main>
            <p>{results.name}</p>
        </main>
    );
}

export default Detail;