import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Select from 'react-select';
import { getLargeAreaMaster, getMiddleAreaMaster, getSmallAreaMaster } from "../../api/areas";
import styles from "./Search.module.css";

const STORAGE_KEY = "searchConditions";

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

// セレクトで選ぶ値がvalueに含まれる値かをチェックする
const validateSearchTypeOption = (value) => {
    return SEARCH_TYPE_OPTIONS.map((option) => option.value.includes(value));
}
const validateRangeOption = (value) => {
    return RANGE_OPTIONS.map((option) => option.value.includes(value));
}

// チェックボックスで選ぶ値が[0,1]のどちらかチェックする
const validateFlag = (value) => {
    return (value === 1 || value === 0);
}

// 文字列であり、値があるかをチェックする
const validateStr = (value) => {
    return (typeof value === "string" && value.trim() !== "")
}



function SearchShops() {
    // 検索方法
    const [searchType, setSearchType] = useState(null);

    // 現在地検索の必須パラメータ
    const [lat, setLat] = useState(null);
    const [lng, setLng] = useState(null);
    const [range, setRange] = useState("3");

    // エリア検索のパラメータ(大エリアは必須)
    // 大エリア
    const [largeArea, setLargeArea] = useState(null);
    const [largeAreaList, setLargeAreaList] = useState([]);

    // 中エリア
    const [middleArea, setMiddleArea] = useState(null);
    const [middleAreaList, setMiddleAreaList] = useState([]);

    // 小エリア
    const [smallArea, setSmallArea] = useState(null);
    const [smallAreaList, setSmallAreaList] = useState([]);

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

    const searchConditions = [
        { key: "searchType", value: searchType, set: setSearchType, validate: validateSearchTypeOption },
        { key: "range", value: range, set: setRange, validate: validateRangeOption },
        { key: "largeArea", value: largeArea, set: setLargeArea, validate: validateStr },
        { key: "middleArea", value: middleArea, set: setMiddleArea, validate: validateStr },
        { key: "smallArea", value: smallArea, set: setSmallArea, validate: validateStr },
        { key: "genre", value: genre, set: setGenre, validate: validateStr },
        { key: "freeDrink", value: freeDrink, set: setFreeDrink, validate: validateFlag },
        { key: "freeFood", value: freeFood, set: setFreeFood, validate: validateFlag },
        { key: "card", value: card, set: setCard, validate: validateFlag },
        { key: "parking", value: parking, set: setParking, validate: validateFlag },
        { key: "lunch", value: lunch, set: setLunch, validate: validateFlag },
        { key: "midnight", value: midnight, set: setMidnight, validate: validateFlag },
    ];

    const [loading, setLoading] = useState(false);
    // const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect (() => {
        try {
            const data = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
            if (data === null || typeof data !== 'object' || Array.isArray(data)) return;
            for (const searchCondition of searchConditions) {
                if (searchCondition.validate(data[searchCondition.key])) {
                    searchCondition.set(data[searchCondition.key]);
                }
            }
            sessionStorage.removeItem(STORAGE_KEY);
        } catch (_) {}
    }, [])

    // 検索方法変更に関するuseEffect
    useEffect (() => {
        const fetchLargeArea = async () => {
            setLoading(true);
            try {
                const res = await getLargeAreaMaster();
                setLargeAreaList(res["areas"]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (searchType === "location") {
            if (!("geolocation" in navigator)) {
                alert("位置情報が取得できませんでした。\n(エリア検索に切り替えます)");
                setSearchType("area");
                setLoading(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLat(position.coords.latitude);
                    setLng(position.coords.longitude);
                    
                    setLoading(false);
                },
                (error) => {
                    console.error(`エラー: ${error.code} - ${error.message}`);
                    alert("ブラウザの設定で位置情報を許可してください\n(エリア検索に切り替えます)");
                    setSearchType("area");
                    setLoading(false);
                },
                {
                    enableHighAccuracy: true,   // 高精度モード：ON
                    timeout: 10000,             // タイムアウト時間(10秒)
                    maximumAge: 0               // キャッシュの有効時間
                }
            )
        } else if (searchType === "area") {
            if (largeAreaList.length === 0) fetchLargeArea();
        }
    }, [searchType]);

    // 大エリア変更時に関するuseEffect
    useEffect (() => {
        let ignore = false;
        if (!validateStr(largeArea)) return;

        const fetchMiddleArea = async () => {
            try {
                const res = await getMiddleAreaMaster(largeArea);
                if (!ignore) setMiddleAreaList(res["areas"]);
            } catch (err) {
                console.error(err);
            }
        };

        fetchMiddleArea();

        return () => {
            ignore = true;
        }
    }, [largeArea])

    // 中エリア変更に関するuseEffect
    useEffect (() => {
        let ignore = false;
        if (!validateStr(middleArea)) return;

        const fetchMiddleArea = async () => {
            try {
                const res = await getSmallAreaMaster(middleArea);
                if (!ignore) setSmallAreaList(res["areas"]);
            } catch (err) {
                console.error(err);
            }
        };

        fetchMiddleArea();

        return () => {
            ignore = true;
        }
    }, [middleArea])

    function handleLargeAreaChange(e) {
        const value = e.value;
        if (!validateStr(value)) return;

        setLargeArea(value);
        setMiddleArea(null);
        setSmallArea(null);

        setMiddleAreaList([]);
        setSmallAreaList([]);
    }

    function handleMiddleAreaChange(e) {
        const value = e.value;
        if (!validateStr(value)) return;

        setMiddleArea(value);
        setSmallArea(null);
        setSmallAreaList([]);
    }

    function handleSearchClick() {
        const obj = {
            "type": searchType,

            ...(searchType === "location" ? {
                "lat": lat,
                "lng": lng,
                "range": range,
            } : {
                "large": largeArea,
                "middle": middleArea,
                "small": smallArea,
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

        const data = Object.fromEntries(
            searchConditions.map(({key, value}) => {
                return [key, value];
            })
        );
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));

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
            <fieldset>
                <legend>検索方法を選択してください</legend>
                {SEARCH_TYPE_OPTIONS.map((option) => (
                    <label key={option.value}>
                        <input
                            type="radio"
                            name="search-type"
                            value={option.value}
                            checked={searchType === option.value}
                            onChange={(e) => setSearchType(e.target.value)}
                        />
                            {option.label}
                    </label>
                ))}
            </fieldset>

            {searchType && (
                <>
                {searchType === "location" ? (
                    <div className={styles.rangeBox}>
                        <span>現在地からの距離：</span>
                        <Select
                            defaultValue={RANGE_OPTIONS.find((option) => option.value === "3")}
                            value={RANGE_OPTIONS.find((option) => option.value === range)}
                            onChange={(e) => setRange(e.value)}
                            options={RANGE_OPTIONS}
                        ></Select>
                    </div>
                ) : (
                    <div>
                        <div className={styles.largeAreaBox}>
                            <Select
                                value={largeAreaList.find((o) => o.value === largeArea) ?? null}
                                onChange={handleLargeAreaChange}
                                options={largeAreaList}
                                placeholder="都道府県を選択"
                                isDisabled={largeAreaList.length === 0}
                            ></Select>
                        </div>
                        <div className={styles.middleAreaBox}>
                            <Select
                                value={middleAreaList.find((o) => o.value === middleArea) ?? null}
                                onChange={handleMiddleAreaChange}
                                options={middleAreaList}
                                placeholder="エリアを選択"
                                isDisabled={middleAreaList.length === 0}
                            ></Select>
                        </div>
                        <div className={styles.smallAreaBox}>
                            <Select
                                value={smallAreaList.find((o) => o.value === smallArea) ?? null}
                                onChange={(e) => setSmallArea(e.value)}
                                options={smallAreaList}
                                placeholder="エリアを選択"
                                isDisabled={smallAreaList.length === 0}
                            ></Select>
                        </div>
                    </div>
                )}
                </>
            )}

            <fieldset>
                <legend>絞り込み条件</legend>
                {customSearchList.map((item, index) => (
                    <label key={index}>
                        <input 
                            type="checkbox"
                            checked={flagToBool(item.value)}
                            onChange={(e) => item.set(boolToFlag(e.target.checked))}
                        />
                        {item.label}
                    </label>
                ))}
            </fieldset>

            <button onClick={handleSearchClick} disabled={!canSearch}>検索</button>
        </main>
    );

}

export default SearchShops;
