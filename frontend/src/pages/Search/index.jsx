import { useState, useEffect } from "react";
import Select from 'react-select';
import { searchShops } from "../../api/shops";

const range_options = [
    { value: "1", label: "300m" },
    { value: "2", label: "500m" },
    { value: "3", label: "1km" },
    { value: "4", label: "2km" },
    { value: "5", label: "3km" },
];

function SearchShops() {
    const [lat, setLat] = useState(null);
    const [lng, setLng] = useState(null);
    const [range, setRange] = useState("3");

    const [loading, setLoading] = useState(true)
    // const [error, setError] = useState(null);

    useEffect (() => {
        if (!("geolocation" in navigator)) {
            console.log("geolocation が使用不可になっています");
            // setError("geolocation が使用不可になっています")
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLat(position.coords.latitude);
                setLng(position.coords.longitude);
                setLoading(false);
            },
            (error) => {
                console.error(`エラー: ${error.code} - ${error.message}`);
                // setError(`エラー: ${error.code} - ${error.message}`);
                setLoading(false);
            },
            {
                enableHighAccuracy: true,   // 高精度モード：ON
                timeout: 10000,             // タイムアウト時間(10秒)
                maximumAge: 0               // キャッシュの有効時間
            }
        )  
    }, []);

    function handleRangeChange(e) {
        setRange(e.value);
    }

    async function handleSearchClick() {
        const params = {
            "lat": lat,
            "lng": lng,
            "range": Number(range)
        };
        // テスト用にどうページに出力
        // TODO: ページ遷移(検索結果画面)
        const res = await searchShops(params);
        console.log(res);
    }

    if (loading) return (
        <main>
            <p>現在地を取得中...</p>
        </main>
    )

    return (
        <main>
            <div>
                <Select id="range" defaultValue={range_options[2]} onChange={handleRangeChange} options={range_options}>
                </Select>
                <button id="search-button" onClick={handleSearchClick}>検索</button>
            </div>
        </main>
    );

}

export default SearchShops;
