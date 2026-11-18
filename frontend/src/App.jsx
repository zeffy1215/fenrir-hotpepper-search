import { BrowserRouter, Routes, Route } from "react-router";

import Search from "./pages/Search";
import Result from "./pages/Result"

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* トップページを検索画面として進める */}
                <Route path="/" element={<Search />} /> 

                <Route path="/result" element={<Result />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
