import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/home";
import SignInPage from "./pages/login/login";
import SignUpPage from "./pages/login/register";
import SignInAdmin from "./pages/login/login_admin";
import AppLayout from "./AppLayout";

import PaymentPage from "./pages/shopcart/Payment";
import FavoriteListPage from "./pages/favorite";
import SearchPage from "./pages/search/Search";
import DetailProductPage from "./pages/detail/DetailProduct";

// admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import OutOfStock from "./pages/admin/OutOfStock";
import OrderProduct from "./pages/admin/OrderProduct";
import AddNewProduct from "./pages/admin/addProduct/AddNewProduct";
import UpdateProduct from "./pages/admin/updateProduct/UpdateProduct";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Pages */}
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/signin-admin" element={<SignInAdmin />} />
                <Route path="/payment" element={<PaymentPage />} />

                {/* Pages with Navbar + Footer */}
                <Route element={<AppLayout />}>
                    <Route path="/" element={<HomePage />} />

                    <Route path="/favorite" element={<FavoriteListPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/product/detail/:id" element={<DetailProductPage />} />
                </Route>

                {/* Admin Pages */}
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/out-of-stock" element={<OutOfStock />} />
                <Route path="/order-product" element={<OrderProduct />} />
                <Route path="/add-product" element={<AddNewProduct />} />
                <Route path="/update/:id" element={<UpdateProduct />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
