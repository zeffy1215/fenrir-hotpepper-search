import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Select from 'react-select';
import styles from "./Search.module.css"

const DEFAULT_SEARCH_VALUE = {
    start: 1,
    count: 10,
    order: 1
}

const SEARCH_TYPE_OPTIONS = [
    { value: "location", label: "現在地" },
    { value: "area", label: "エリア" },
]

const RANGE_OPTIONS = [
    { value: "1", label: "300m以内" },
    { value: "2", label: "500m以内" },
    { value: "3", label: "1km以内" },
    { value: "4", label: "2km以内" },
    { value: "5", label: "3km以内" },
];

// true/false を 1/0 に変換する
const boolToFlag = (value) => {
    if (value === true) return 1;
    return 0;
}
// 1/0 を true/false に変換する
const flagToBool = (value) => {
    return value === 1;
}

function SearchShops() {
    const [lat, setLat] = useState(null);
    const [lng, setLng] = useState(null);
    const [range, setRange] = useState("3");

    const [loading, setLoading] = useState(true)
    // const [error, setError] = useState(null);

    const navigate = useNavigate();

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
        const params = new URLSearchParams({
            "lat": lat,
            "lng": lng,
            "range": Number(range),
            "start": 1,
            "count": 10,
            "order": 1,
            "type": "location"
        });
        
        navigate(`/result?${params}`);
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
