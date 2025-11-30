import React, { useEffect, useState } from "react";
import { getAllProducts } from "../api/productApi.js";
import ProductCard from './ProductCard.jsx'; // Add this line
import "../css/App.css"; // ใช้ไฟล์เดิม เพิ่มคลาสด้านล่างในข้อ 3

// const API_BASE_URL = 'https://muict.app/burrrtongg-backend'; // Removed as it's now in ProductCard

const HotProducts = ({ limit = 3 }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const list = await getAllProducts();
        // เลือก top-N เป็น hot ชั่วคราว (ปรับ logic ได้ภายหลัง เช่นตามยอดขาย/สถานะ)
        setProducts(list.slice(0, limit));
      } catch (e) {
        console.error("Failed to fetch hot products:", e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [limit]);

  if (loading) return null; // หรือจะใส่ skeleton ก็ได้

  return (
    <section className="hot-products">
      <h2>Hot Products</h2>
      <div className="hot-products-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} /> // Use ProductCard component
        ))}
      </div>
    </section>
  );
};

export default HotProducts;
