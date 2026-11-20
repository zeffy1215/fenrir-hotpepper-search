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

    // Googleマップの表示
    // 参考：https://zenn.dev/tkr923/articles/daaf10976cdc03
    const mapUrl = `https://maps.google.com/maps?output=embed&q=${results.lat},${results.lng}&ll=${results.lat},${results.lng}&t=m&hl=ja&z=18`;

    return (
        <main>
            <p>{results.name}</p>

            <table className={styles.basicInfoTable}>
                <caption>店舗基本情報</caption>
                <tbody>
                    <tr>
                        <th scope="row">店名</th>
                        <td>
                            <p>{results.name}</p>
                            <p className={styles.kana}>({results.name_kana})</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">ジャンル</th>
                        {results.sub_genre ? (
                            <td>{results.genre_name} / {results.sub_genre}</td>
                        ) : (
                            <td>{results.genre_name}</td>
                        )}
                    </tr>
                    <tr>
                        <th scope="row">住所</th>
                        <td>
                            <p className={styles.address}>{results.address}</p>
                            <iframe
                                src={mapUrl}
                                title="店舗の地図"
                                allowfullscreen=""
                                loading="lazy"
                                referrerpolicy="no-referrer-when-downgrade"
                                className={styles.map}
                            ></iframe>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">アクセス</th>
                        <td>{results.access}</td>
                    </tr>
                    <tr>
                        <th scope="row">営業時間</th>
                        <td>
                            {Array.isArray(results.open) ? (
                                <>
                                    {results.open.map((o, index) => (
                                        <div key={index} className={styles.shopOpen}>
                                            <p className={styles.shopOpenDays}>{o.days}</p>
                                            <p className={styles.shopOpenHours}>{o.hours}</p>
                                        </div>
                                    ))}
                                </>
                            ) : (
                               <td>{results.open ? results.open : "掲載なし"}</td>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">定休日</th>
                        <td>{results.close ? results.close.replace(/定休[日]?[:：]?/, "") : "掲載なし"}</td>
                    </tr>
                    <tr>
                        <th scope="row">ディナー予算</th>
                        <td>{results.budget}</td>
                    </tr>
                </tbody>
            </table>
        </main>
    );
}

export default Detail;