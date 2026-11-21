import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Select from 'react-select';
import styles from "./Search.module.css"

const DEFAULT_SEARCH_VALUE = {
    start: 1,
    count: 10,
    order: {
        location: 1,
        area: 4
    }
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
    // 検索方法
    const [searchType, setSearchType] = useState(null);

    // 現在地検索の必須パラメータ
    const [lat, setLat] = useState(null);
    const [lng, setLng] = useState(null);
    const [range, setRange] = useState("3");

    // エリア検索の必須パラメータ
    const [area, setArea] = useState(null);

    // 任意パラメータ
    const [genre, setGenre] = useState(null);

    const [freeDrink, setFreeDrink] = useState(0);
    const [freeFood, setFreeFood] = useState(0);
    const [card, setCard] = useState(0);
    const [parking, setParking] = useState(0);
    const [lunch, setLunch] = useState(0);
    const [midnight, setMidnight] = useState(0);

    const customSearchList = [
        { value: freeDrink, label: "飲み放題", set: setFreeDrink },
        { value: freeFood, label: "食べ放題", set: setFreeFood },
        { value: card, label: "カード利用可", set: setCard },
        { value: parking, label: "駐車場", set: setParking },
        { value: lunch, label: "ランチメニュー", set: setLunch },
        { value: midnight, label: "23時以降の営業", set: setMidnight },
    ];

    const [loading, setLoading] = useState(false);
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

    function handleSearchClick() {
        const obj = {
            "type": searchType,

            ...(searchType === "location" ? {
                "lat": lat,
                "lng": lng,
                "range": range,
            } : {
                "area": area,
            }),

            "genre": genre,
            "free_drink": freeDrink,
            "free_food": freeFood,
            "card": card,
            "parking": parking,
            "lunch": lunch,
            "midnight": midnight,
            "start": DEFAULT_SEARCH_VALUE.start,
            "count": DEFAULT_SEARCH_VALUE.count,
            "order": DEFAULT_SEARCH_VALUE.order[searchType],
        };

        const filteredObject = Object.fromEntries(
            Object.entries(obj).filter(([k, v]) => v)
        );
        const params = new URLSearchParams(filteredObject);
        navigate(`/result?${params}`);
    }

    if (loading) return (
        <main>
            <p>現在地を取得中...</p>
        </main>
    )

    // 現在地検索の必須パラメータ
    const hasLat = Number.isFinite(lat);
    const hasLng = Number.isFinite(lng);
    const hasRange = RANGE_OPTIONS.map((option) => option.value).includes(range);
    
    const hasLocation = [hasLat, hasLng, hasRange].every(Boolean);

    // エリア検索の必須パラメータ
    const hasArea = (typeof area === "string" && area.trim() !== ""); 

    const canSearch = searchType === "location" ? hasLocation : hasArea;

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
