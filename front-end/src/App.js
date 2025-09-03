import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/home";
import SignInPage from "./pages/login/login";
import SignUpPage from "./pages/login/register";
import SignInAdmin from "./pages/login/login_admin";

import PaymentPage from "./pages/shopcart/Payment"
import FavoriteListPage from "./pages/favorite";
import SearchPage from "./pages/search/Search";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/signin-admin" element={<SignInAdmin />} />

                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/favorite" element={<FavoriteListPage />} />
                <Route path="/search" element={<SearchPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
