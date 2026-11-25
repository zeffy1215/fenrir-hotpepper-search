import { useNavigate } from "react-router";
import styles from "./Header.module.css";

const STORAGE_KEY = "searchConditions";

function Header() {
    const navigate = useNavigate();

    function handlerTitleClick() {
        sessionStorage.removeItem(STORAGE_KEY);
        navigate("/");
    }

    return (
        <header className={styles.titleHeader}>
            <h1 className={styles.title}>
                <span onClick={handlerTitleClick}>
                    旅先めし
                </span>
            </h1>
        </header>
    );
}

export default Header;