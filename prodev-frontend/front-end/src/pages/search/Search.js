"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Utensils, Smartphone, Sofa, ShowerHead, Shirt, Tv, Cookie } from "lucide-react";
import Fuse from "fuse.js"; // นำเข้า Fuse.js สำหรับการค้นหาแบบ fuzzy

export default function SearchPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // รองรับทั้ง state และ query params
    const queryParams = new URLSearchParams(location.search);
    const defaultCategory = queryParams.get("category") || location.state?.category || "All";
    const defaultKeyword = queryParams.get("keyword") || location.state?.search || "";

    const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
    const [selectedPrices, setSelectedPrices] = useState([]);
    const [keyword, setKeyword] = useState(defaultKeyword);
    const [currentPage, setCurrentPage] = useState(1);
    const [products, setProducts] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0);

    const itemsPerPage = 8;
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    const categories = [
        { name: "All", icon: null },
        { name: "Snack", icon: <Cookie size={18} /> },
        { name: "Food & Drink", icon: <Utensils size={18} /> },
        { name: "Smartphone", icon: <Smartphone size={18} /> },
        { name: "Furniture", icon: <Sofa size={18} /> },
        { name: "Shower", icon: <ShowerHead size={18} /> },
        { name: "Clothing", icon: <Shirt size={18} /> },
        { name: "Electronics", icon: <Tv size={18} /> },
    ];

    const priceRanges = [
        { label: "$1–$249", min: 1, max: 249 },
        { label: "$250–$1,049", min: 250, max: 1049 },
        { label: "$1,050–$2,999", min: 1050, max: 2999 },
        { label: "$3,000–$5,000", min: 3000, max: 5000 },
        { label: "$5,000–$10,000", min: 5000, max: 10000 },
        { label: "$10001 ขึ้นไป", min: 10001, max: Infinity },
    ];

    useEffect(() => {
        setSelectedCategory(defaultCategory);
        setKeyword(defaultKeyword);
        setCurrentPage(1);
    }, [defaultCategory, defaultKeyword]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // กำหนดราคาให้ถูกต้อง
                const minPrice = selectedPrices.length
                    ? Math.min(...selectedPrices.map(label => priceRanges.find(r => r.label === label).min))
                    : undefined;
                const maxPrice = selectedPrices.length
                    ? Math.max(...selectedPrices.map(label => priceRanges.find(r => r.label === label).max))
                    : undefined;

                // สร้าง URLSearchParams สำหรับส่งข้อมูลไปยัง backend
                const params = new URLSearchParams();
                if (selectedCategory && selectedCategory !== "All") params.append("category", selectedCategory);
                if (minPrice !== undefined) params.append("minPrice", minPrice);
                if (maxPrice !== undefined) params.append("maxPrice", maxPrice);
                if (keyword) params.append("keyword", keyword);  // ส่ง keyword ไปพร้อมกับการค้นหา
                params.append("page", currentPage);
                params.append("limit", itemsPerPage);

                // ส่งคำขอไปยัง API เพื่อดึงข้อมูลสินค้าตามคำค้นหานี้
                const res = await fetch(`${BACKEND_URL}/api/products/search?${params.toString()}`);
                const data = await res.json();

                // เก็บข้อมูลสินค้าที่กรองจาก backend
                setProducts(
                    data.items
                        .filter(p => p.quantity > 0) // กรองเฉพาะสินค้าที่มี stock
                        .map(p => ({
                            ...p,
                            images: p.images.map(img => img.startsWith("http") ? img : `${BACKEND_URL}${img}`)
                        }))
                );

                // เก็บจำนวนสินค้าทั้งหมด
                setTotalProducts(data.total);
            } catch (err) {
                console.error(err);
            }
        };

        fetchProducts();
    }, [selectedCategory, selectedPrices, currentPage, keyword]);


    const handleCategoryClick = (name) => {
        setSelectedCategory(name);
        setCurrentPage(1);
    };

    const handlePriceChange = (label) => {
        setCurrentPage(1);
        setSelectedPrices(prev =>
            prev.includes(label) ? prev.filter(p => p !== label) : [...prev, label]
        );
    };

    const totalPages = Math.ceil(totalProducts / itemsPerPage);

    const handleSearch = (e) => {
        const searchTerm = e.target.value;
        setKeyword(searchTerm);
        setCurrentPage(1);
    };

    return (
        <main className="min-h-screen max-w-7xl mx-auto px-6 py-10 flex gap-8">
            <aside className="w-1/4">
                <div className="text-sm text-gray-500 mb-4">
                    <span className="cursor-pointer hover:text-green-600" onClick={() => navigate("/")}>Home</span> / {selectedCategory}
                </div>

                <h3 className="text-gray-600 text-sm mb-2 font-semibold">Search</h3>
                <input
                    type="text"
                    placeholder="Search products..."
                    value={keyword}
                    onChange={handleSearch} // เรียกฟังก์ชัน handleSearch
                    className="w-full mb-4 px-3 py-2 border rounded"
                />

                <h3 className="text-gray-600 text-sm mb-2 font-semibold">Categories</h3>
                <ul className="mb-6">
                    {categories.map(c => (
                        <li
                            key={c.name}
                            className={`px-3 py-2 rounded-md mb-1 cursor-pointer ${selectedCategory === c.name ? "bg-green-500 text-white" : "hover:bg-gray-100"}`}
                            onClick={() => handleCategoryClick(c.name)}
                        >
                            <div className="flex items-center gap-2">
                                {c.icon}
                                <span>{c.name}</span>
                            </div>
                        </li>
                    ))}
                </ul>

                <h3 className="text-gray-600 text-sm mb-2">Price</h3>
                <div className="flex flex-col gap-2 text-sm">
                    {priceRanges.map(p => (
                        <label key={p.label}>
                            <input
                                type="checkbox"
                                className="mr-2"
                                checked={selectedPrices.includes(p.label)}
                                onChange={() => handlePriceChange(p.label)}
                            />
                            {p.label}
                        </label>
                    ))}
                </div>
            </aside>

            <section className="flex-1">
                <h2 className="text-2xl font-semibold mb-6">
                    {selectedCategory === "All" ? "All Products" : selectedCategory}
                </h2>

                {products.length > 0 ? (
                    <div className="grid grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map(p => (
                            <div
                                key={p.id}
                                className="border rounded-lg overflow-hidden flex flex-col transition hover:shadow-lg hover:border-green-600 cursor-pointer"
                                onClick={() => navigate(`/product/detail/${p.id}`)}
                            >
                                <img src={p.images?.[0] || "/images/no-image.png"} alt={p.name} className="w-full h-40 object-contain p-4" />
                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="text-sm font-medium mb-2">{p.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{p.category}</p>
                                    <div className="mt-auto flex items-center justify-between">
                                        <p className="text-gray-800 font-semibold">฿{p.price}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No products found.</p>
                )}

                {totalPages > 1 && (
                    <div className="flex justify-center mt-8 gap-2">
                        <button
                            className="px-3 py-1 border rounded"
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        >
                            &lt;
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-green-600 text-white" : ""}`}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            className="px-3 py-1 border rounded"
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        >
                            &gt;
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}
