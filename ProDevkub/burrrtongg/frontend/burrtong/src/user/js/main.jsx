import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Page Components
import App from "./App.jsx";
import LoginPage from "./LoginPage.jsx";
import SignupPage from "./SignupPage.jsx";
import ProductList from "../../admin/js/ProductList.jsx";
import OrderList from "../../admin/js/OrderList.jsx";
import CouponList from "../../admin/js/CouponList.jsx"; // Import CouponList
import CategoryList from "../../admin/js/CategoryList.jsx"; // Import CategoryList
import AdminLoginPage from "../../admin/js/AdminLoginPage.jsx";
import AdminSignupPage from "../../admin/js/AdminSignupPage.jsx";
import WeeklyStockReport from "../../admin/js/WeeklyStockReport.jsx";


// CSS
import "../css/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename="/burrrtongg-frontend">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* User Protected Routes */}
        <Route path="/home/*" element={<App />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/signup" element={<AdminSignupPage />} />
        <Route path="/admin/products" element={<ProductList />} />
        <Route path="/admin/orders" element={<OrderList />} />
        <Route path="/admin/coupons" element={<CouponList />} />
        <Route path="/admin/categories" element={<CategoryList />} />
        <Route path="/admin/stock-report" element={<WeeklyStockReport />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
