import { BrowserRouter, Routes, Route } from "react-router";

import Search from "./pages/Search";
import Result from "./pages/Result";
import Detail from "./pages/Detail";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* トップページを検索画面として進める */}
                <Route path="/" element={<Search />} /> 

                <Route path="/result" element={<Result />} />
                <Route path="/detail" element={<Detail />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
