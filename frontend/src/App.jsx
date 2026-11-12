import { BrowserRouter, Routes, Route } from "react-router";

import Search from "./pages/Search";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* トップページを検索画面として進める */}
                <Route path="/" element={<Search />} /> 
            </Routes>
        </BrowserRouter>
    )
}

export default App
