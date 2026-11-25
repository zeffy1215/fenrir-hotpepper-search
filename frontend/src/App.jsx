import { BrowserRouter, Routes, Route } from "react-router";

import Search from "./pages/Search";
import Result from "./pages/Result";
import Detail from "./pages/Detail";
import Error from "./pages/Error";

import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
    return (
        <BrowserRouter>
            <Header />

            <Routes>
                {/* トップページを検索画面として進める */}
                <Route path="/" element={<Search />} /> 

                <Route path="/result" element={<Result />} />
                <Route path="/detail" element={<Detail />} />
                <Route path="/error" element={<Error />} />
            </Routes>

            <Footer />
        </BrowserRouter>
    )
}

export default App
