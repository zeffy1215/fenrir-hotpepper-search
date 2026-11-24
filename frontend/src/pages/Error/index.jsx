// import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router";
import styles from "./Error.module.css";

function Error() {
    const location = useLocation();
    const error = location.state?.error;

    return (
        <main>
            <h1>エラーが発生しました</h1>
            <p>{error}</p>
            <Link to={"/"} className={styles.toTopButton}>トップページに戻る</Link>
        </main>
    )
}

export default  Error;
