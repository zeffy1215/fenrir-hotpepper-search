import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Select from 'react-select';
import { getLargeAreaMaster, getMiddleAreaMaster, getSmallAreaMaster } from "../../api/areas";
import { getGenreMaster  } from "../../api/genres";
import { getErrorMessage } from "../../untils/errorMessage";
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
    { value: "location", label: "現在地から" },
    { value: "area", label: "エリアから" },
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
// 緯度と経度に数値が入っているかをチェックする
const validateCoordinate = (lat, lng) => {
    return (Number.isFinite(lat) && Number.isFinite(lng));
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

// 配列であり、要素が存在するかをチェックする
const validateArray = (value) => {
    return (Array.isArray(value) && value.length !== 0);
}

// セレクトボックスのスタイル
const selectStyles = {
    control: (base, state) => ({
        ...base,
        cursor: state.isDisabled ? "not-allowed" : "pointer",
    }),
    option: (base, state) => ({
        ...base,
        cursor: state.isDisabled ? "not-allowed" : "pointer",
    }),
    container: (base) => ({
        ...base,
        pointerEvents: "auto",
    }),
};

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
    const [largeAreaMessage, setLargeAreaMessage] = useState("選択してください");
    const [largeAreaLoading, setLargeAreaLoading] = useState(false);

    // 中エリア
    const [middleArea, setMiddleArea] = useState(null);
    const [middleAreaList, setMiddleAreaList] = useState([]);
    const [middleAreaMessage, setMiddleAreaMessage] = useState("都道府県を指定してください");
    const [middleAreaLoading, setMiddleAreaLoading] = useState(false);

    // 小エリア
    const [smallArea, setSmallArea] = useState(null);
    const [smallAreaList, setSmallAreaList] = useState([]);
    const [smallAreaMessage, setSmallAreaMessage] = useState("エリアを選択してください");
    const [smallAreaLoading, setSmallAreaLoading] = useState(false);

    // 任意パラメータ
    const [genres, setGenres] = useState([]);
    const [genreList, setGenreList] = useState([]);

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
        { key: "genre", value: genres, set: setGenres, validate: validateArray },
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

    useEffect (() => {
        let ignore = false;
        const fetchGenreMaster = async () => {
            try {
                const res = await getGenreMaster();
                if (!ignore) setGenreList(res["genres"]);
            } catch (err) {
                toErrorPage(err);
            } 
        }

        fetchGenreMaster();
        return () => {
            ignore = true;
        }
    }, [])

    // 検索方法変更に関するuseEffect
    useEffect (() => {
        let ignore = false;
        const fetchLargeArea = async () => {
            setLargeAreaLoading(true);
            setLargeAreaMessage("読み込み中...");
            try {
                const res = await getLargeAreaMaster();
                if (!ignore) setLargeAreaList(res["areas"]);
                setLargeAreaMessage("選択してください");
            } catch (err) {
                toErrorPage(err);
            } finally {
                setLargeAreaLoading(false);
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

        return () => {
            ignore = true;
        }
    }, [searchType]);

    // 大エリア変更時に関するuseEffect
    useEffect (() => {
        let ignore = false;
        if (!validateStr(largeArea)) return;

        const fetchMiddleArea = async () => {
            setMiddleAreaLoading(true);
            setMiddleAreaMessage("読み込み中...");
            try {
                const res = await getMiddleAreaMaster(largeArea);
                if (!ignore) {
                    setMiddleAreaList([{ value: null, label: "指定しない" }, ...res["areas"]]);
                    setMiddleAreaMessage("指定しない");
                }
            } catch (err) {
                toErrorPage(err);
            } finally {
                setMiddleAreaLoading(false);
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
            setSmallAreaLoading(true);
            setSmallAreaMessage("読み込み中...");
            try {
                const res = await getSmallAreaMaster(middleArea);
                if (!ignore) {
                    setSmallAreaList([{ value: null, label: "指定しない" }, ...res["areas"]]);
                    setSmallAreaMessage("指定しない");
                }
            } catch (err) {
                toErrorPage(err);
            } finally {
                setSmallAreaLoading(false);
            }
        };

        fetchMiddleArea();

        return () => {
            ignore = true;
        }
    }, [middleArea])

    function handleLargeAreaChange(e) {
        const value = e.value;
        setSmallAreaMessage("エリアを選択してください");
        if (!validateStr(value)) { 
            setMiddleAreaMessage("都道府県を指定してください");
            return;
        }

        setLargeArea(value);
        setMiddleArea(null);
        setSmallArea(null);

        setMiddleAreaList([]);
        setSmallAreaList([]);
    }

    function handleMiddleAreaChange(e) {
        setSmallAreaMessage("エリアを選択してください");

        setMiddleArea(e.value);
        setSmallArea(null);
        setSmallAreaList([]);
    }

    function handleGenreChange(value, checked) {
        if (checked) {
            if (!genres.includes(value)) {
                setGenres([...genres, value]);
            }
        } else {
            setGenres(genres.filter((v) => v !== value));
        }
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

            "genre": genres.join(","),
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

    function toErrorPage(err) {
        navigate("/error", { state: {  error: getErrorMessage(err) } });
    }

    if (loading) return (
        <main>
            <p>現在地を取得中...</p>
        </main>
    )

    // 現在地検索の必須パラメータ
    const hasLat = Number.isFinite(lat);
    const hasLng = Number.isFinite(lng);
    const hasRange = validateRangeOption(range, RANGE_OPTIONS);
    
    const hasLocation = [hasLat, hasLng, hasRange].every(Boolean);

    // エリア検索の必須パラメータ
    const hasLargeArea = validateStr(largeArea); 

    const canSearch = searchType === "location" ? hasLocation : hasLargeArea;

    return (
        <main>
            <h1>近くのお店を探す</h1>
            <h2>探し方を選んで、条件を指定してください</h2>

            <div className={styles.fieldBox}>
                <fieldset className={styles.searchField}>
                    <legend className={styles.searchLegend}><span>1</span>探し方</legend>
                    <div className={styles.searchTypeBox}>
                        {SEARCH_TYPE_OPTIONS.map((option) => (
                            <label className={styles.searchTypeLabel} key={option.value}>
                                <input
                                    type="radio"
                                    name="search-type"
                                    className={styles.searchTypeRadio}
                                    value={option.value}
                                    checked={searchType === option.value}
                                    onChange={(e) => setSearchType(e.target.value)}
                                />
                                {option.label}
                            </label>
                        ))}
                    </div>
                </fieldset>
            </div>

            {searchType ? (
                <>
                {searchType === "location" ? (
                    <div className={styles.fieldBox}>
                        <fieldset className={styles.rangeBox}>
                            <legend className={styles.searchLegend}><span>2</span>範囲</legend>
                            {validateCoordinate(lat, lng) ? (
                                <p className={styles.coordinateSuccess}>✔︎ 現在地を取得しました</p>
                            ) : (
                                <p className={styles.coordinateError}>× 現在地の取得に失敗しました。</p>
                            )}
                            <p>現在地からの距離</p>
                            <div className={styles.rangeSelectBox}>
                                {RANGE_OPTIONS.map((option) => (
                                    <label className={styles.rangeLabel} key={option.value}>
                                        <input
                                            type="radio"
                                            name="range"
                                            className={styles.rangeRadio}
                                            value={option.value}
                                            checked={range === option.value}
                                            onChange={(e) => setRange(e.target.value)}
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                    </div>
                ) : (
                    <div className={styles.fieldBox}>
                        <fieldset className={styles.areaBox}>
                            <legend className={styles.searchLegend}><span>2</span>エリア</legend>
                            <div className={styles.areaSelectBox}>
                                <div className={styles.largeAreaBox}>
                                    <label htmlFor="largeArea">1. 都道府県（必須）</label>
                                    <Select
                                        inputId="largeArea"
                                        isLoading={largeAreaLoading}
                                        styles={selectStyles}
                                        className={styles.areaSelect}
                                        value={largeAreaList.find((o) => o.value === largeArea) ?? null}
                                        onChange={handleLargeAreaChange}
                                        options={largeAreaList}
                                        placeholder={largeAreaMessage}
                                        isDisabled={largeAreaList.length === 0}
                                    ></Select>
                                </div>
                                <div className={styles.middleAreaBox}>
                                    <label htmlFor="middleArea">2. エリア（任意）</label>
                                    <Select
                                        inputId="middleArea"
                                        styles={selectStyles}
                                        isLoading={middleAreaLoading}
                                        className={styles.areaSelect}
                                        value={middleAreaList.find((o) => o.value === middleArea) ?? null}
                                        onChange={handleMiddleAreaChange}
                                        options={middleAreaList}
                                        placeholder={middleAreaMessage}
                                        isDisabled={middleAreaList.length === 0}
                                    ></Select>
                                </div>
                                <div className={styles.smallAreaBox}>
                                    <label htmlFor="smallArea">3. 詳しいエリア（任意）</label>
                                    <Select
                                        inputId="smallArea"
                                        styles={selectStyles}
                                        isLoading={smallAreaLoading}
                                        className={styles.areaSelect}
                                        value={smallAreaList.find((o) => o.value === smallArea) ?? null}
                                        onChange={(e) => setSmallArea(e.value)}
                                        options={smallAreaList}
                                        placeholder={smallAreaMessage}
                                        isDisabled={smallAreaList.length === 0}
                                    ></Select>
                                </div>
                            </div>
                        </fieldset>
                    </div>
                )}
                </>
            ) : (
                <div className={styles.fieldBox}>
                    <fieldset>
                        <legend className={styles.searchLegend}><span>2</span>範囲 / エリア</legend>
                        <p className={styles.message}>まず、①で探し方を選択してください</p>
                    </fieldset>
                </div>
            )}

            <div className={styles.fieldBox}>
                <fieldset className={styles.conditionsBox}>
                    <legend className={styles.searchLegend}><span>3</span>絞り込み条件<span className={styles.legendMessage}>任意</span></legend>
                    <div className={styles.conditionsSelectBox}>
                        <fieldset className={styles.genreField}>
                            <legend className={styles.genreLegend}>ジャンル（複数選択可）</legend>
                            {genreList.length !== 0 ? (
                                <div className={styles.genreBox}>
                                    {genreList.map((item) => (
                                        <label key={item.value} className={styles.genreLabel}>
                                            <input 
                                                type="checkbox"
                                                checked={genres.includes(item.value)}
                                                value={item.value}
                                                onChange={(e) =>handleGenreChange(e.target.value, e.target.checked)}
                                            />
                                            {item.label}
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.genreBox}>
                                    <p className={styles.message}>ジャンル一覧を読み込み中...</p>
                                </div>
                            )}
                        </fieldset>
                        <fieldset className={styles.specificConditionField}>
                            <legend className={styles.specificConditionLegend}>こだわり条件</legend>
                            <div className={styles.specificConditionBox}>
                                {customSearchList.map((item, index) => (
                                    <label className={styles.specificConditionLabel} key={index}>
                                        <input 
                                            type="checkbox"
                                            checked={flagToBool(item.value)}
                                            onChange={(e) => item.set(boolToFlag(e.target.checked))}
                                            />
                                        {item.label}
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                    </div>
                </fieldset>
            </div>
            
            <div className={styles.searchButtonBox}>
                <button className={styles.searchButton} onClick={handleSearchClick} disabled={!canSearch}>この条件で探す</button>
            </div>
        </main>
    );
}

export default SearchShops;
