import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import HomePage from "./HomePage.jsx";
import Products from "./Products.jsx";
import ProductDetail from "./ProductDetail.jsx";
import Cart from "./Cart.jsx";
import OrderHistory from "./OrderHistory.jsx";
import SearchResults from "./SearchResults.jsx";

// สไตล์: ให้ Navbar.css มาทีหลังสุดเพื่อครอบสไตล์
import "../css/index.css";   // base reset
import "../css/App.css";     // layout/section
import "../css/Navbar.css";  // ควรมาทีหลัง

function App() {
  return (
    <>
      {/* Navbar อยู่นอก container เพื่อคงที่ทุกหน้าใน /home */}
      <Navbar />

      <div className="container">
        <Routes>
          {/* /home */}
          <Route path="" element={<HomePage />} />
          {/* /home/products */}
          <Route path="products" element={<Products />} />
          {/* /home/products/:productId */}
          <Route
            path="products/:productId"
            element={<ProductDetail />}
          />
          {/* /home/cart */}
          <Route
            path="cart"
            element={<Cart />}
          />
          {/* /home/orders */}
          <Route path="orders" element={<OrderHistory />} />
          {/* /home/search */}
          <Route path="search" element={<SearchResults />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
