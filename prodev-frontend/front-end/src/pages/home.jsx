"use client";

import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Utensils,
    Smartphone,
    Sofa,
    ShowerHead,
    Shirt,
    Tv,
    Cookie
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// Import context จาก AppLayout
import { CartContext } from "../AppLayout";

export default function HomePage() {
    const [user, setUser] = useState(null);
    const [popularProducts, setPopularProducts] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    // ดึง context ของ cart
    const { fetchCart } = useContext(CartContext);

    const categories = [
        { name: "Snack", icon: <Cookie size={32} className="mx-auto text-gray-700" /> },
        { name: "Food & Drink", icon: <Utensils size={32} className="mx-auto text-gray-700" /> },
        { name: "Smartphone", icon: <Smartphone size={32} className="mx-auto text-gray-700" /> },
        { name: "Furniture", icon: <Sofa size={32} className="mx-auto text-gray-700" /> },
        { name: "Shower", icon: <ShowerHead size={32} className="mx-auto text-gray-700" /> },
        { name: "Clothing", icon: <Shirt size={32} className="mx-auto text-gray-700" /> },
        { name: "Electronics", icon: <Tv size={32} className="mx-auto text-gray-700" /> },
    ];

    useEffect(() => {
        // ดึงข้อมูล user จาก location.state
        if (location.state?.username) {
            const newUser = {
                username: location.state.username,
                email: location.state.email,
                role: location.state.role,
                token: location.state.token
            };
            setUser(newUser);
            localStorage.setItem("token", newUser.token); // เก็บ token ไว้ localStorage
        }

        // ดึงสินค้า
        fetch(`${BACKEND_URL}/api/products/all`)
            .then(res => res.json())
            .then(data => {
                const inStockProducts = data
                    .filter(p => p.quantity > 0) // <-- ไม่เอาสินค้า stock <= 0
                    .map(p => ({
                        id: p.id,
                        name: p.name,
                        price: p.price ? `฿${p.price}` : "฿0",
                        image: p.images?.[0] ? `${BACKEND_URL}${p.images[0]}` : "/images/no-image.png",
                        category: p.category
                    }));

                setPopularProducts(inStockProducts.slice(0, 6));
                setBestSellers(inStockProducts.slice(-10));
            })
            .catch(err => console.error(err));
    }, [location.state]);

    // เพิ่มสินค้าเข้าตะกร้า
    const addToCart = (productId) => {
        const tokenToUse = user?.token || localStorage.getItem("token");
        if (!tokenToUse) {
            alert("❌ Please login first!");
            return;
        }

        fetch(`${BACKEND_URL}/api/cart/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tokenToUse}`
            },
            body: JSON.stringify({ productId, qty: 1 })
        })
            .then(res => {
                if (!res.ok) throw new Error(`Failed to add cart: ${res.status}`);
                return res.json();
            })
            .then(data => {
                alert("✅ Product added to cart!");
                console.log("Product added to cart:", data);

                // รีเฟรช cart sidebar ทันที
                if (fetchCart) fetchCart();
            })
            .catch(err => {
                console.error(err);
                alert("❌ Error adding to cart: " + err.message);
            });
    };

    return (
        <main className="font-sans bg-white relative">
            {/* Banner */}
            <section className="max-w-7xl mx-auto px-6 py-10">
                <Swiper
                    spaceBetween={0}
                    slidesPerView={1}
                    modules={[Autoplay, Pagination]}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    loop={true}
                    pagination={{ clickable: true }}
                >
                    <SwiperSlide>
                        <img src="/images/banner/banner.png" alt="Banner" className="w-full rounded-lg cursor-pointer" />
                    </SwiperSlide>
                    <SwiperSlide>
                        <img src="/images/banner/banner2.jpeg" alt="Banner 2" className="w-full rounded-lg cursor-pointer" />
                    </SwiperSlide>
                    <SwiperSlide>
                        <img src="/images/banner/banner3.jpeg" alt="Banner 3" className="w-full rounded-lg cursor-pointer" />
                    </SwiperSlide>
                </Swiper>
            </section>

            {/* Featured Categories */}
            <section className="max-w-7xl mx-auto px-6 py-10">
                <h2 className="text-xl font-semibold mb-6">Featured Categories</h2>
                <Swiper spaceBetween={20} slidesPerView={6}>
                    {categories.map((cat) => (
                        <SwiperSlide key={cat.name}>
                            <div
                                className="border rounded-lg p-4 cursor-pointer flex flex-col items-center text-center hover:shadow-lg hover:border-green-600 transition"
                                onClick={() => navigate(`/search?category=${encodeURIComponent(cat.name)}`)}
                            >
                                {cat.icon}
                                <p className="mt-2 text-gray-700">{cat.name}</p>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </section>

            {/* Popular Products */}
            <section className="max-w-7xl mx-auto px-6 py-10">
                <h2 className="text-xl font-semibold mb-6">Popular Products</h2>
                <Swiper
                    spaceBetween={20}
                    slidesPerView={5}
                    modules={[Pagination]}
                    pagination={{ clickable: true }}
                    loop={false}
                    autoplay={false}
                >
                    {popularProducts.map((p) => (
                        <SwiperSlide key={p.id}>
                            <div
                                className="border rounded-lg overflow-hidden flex flex-col transition hover:shadow-lg hover:border-green-600"
                                onClick={() => navigate(`/product/detail/${p.id}`)}
                            >
                                <img src={p.image} alt={p.name} className="w-full h-40 object-contain p-4" />
                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="text-sm font-medium mb-2">{p.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{p.category}</p>
                                    <div className="mt-auto flex items-center justify-between">
                                        <p className="text-gray-800 font-semibold">{p.price}</p>
                                        <button
                                            className="bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                                            onClick={(e) => { e.stopPropagation(); addToCart(p.id); }}
                                        >
                                            + Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </section>

            {/* Fruits & Vegetable */}
            <section className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-2 gap-6">
                    <div className="relative rounded-lg overflow-hidden cursor-pointer">
                        <img src="/images/banner/banner4.png" alt="Fresh Fruits" className="w-full h-48 object-cover hover:scale-105 transition" />
                        <div className="absolute top-4 left-4 text-white">
                            <h3 className="text-lg font-bold text-black">Fresh Fruits</h3>
                            <p className="text-sm text-gray-600">Get up to 25% off</p>
                            <button className="mt-2 bg-black text-white px-3 py-1 text-sm rounded">Shop now</button>
                        </div>
                    </div>
                    <div className="relative rounded-lg overflow-hidden cursor-pointer">
                        <img src="/images/banner/banner5.png" alt="Foods & Vegetables" className="w-full h-48 object-cover hover:scale-105 transition" />
                        <div className="absolute top-4 left-4 text-white">
                            <h3 className="text-lg font-bold text-black">Foods & Vegetables</h3>
                            <p className="text-sm text-gray-600">Get up to 30% off</p>
                            <button className="mt-2 bg-black text-white px-3 py-1 text-sm rounded">Shop now</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Best Selling Products */}
            <section className="max-w-7xl mx-auto px-6 py-10">
                <h2 className="text-xl font-semibold mb-6">Best Selling Products</h2>
                <div className="grid grid-cols-5 gap-6">
                    {bestSellers.map((p) => (
                        <div
                            key={p.id}
                            className="border rounded-lg overflow-hidden flex flex-col transition hover:shadow-lg hover:border-green-600"
                            onClick={() => navigate(`/product/detail/${p.id}`)}
                        >
                            <img src={p.image} alt={p.name} className="w-full h-40 object-contain p-4" />
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="text-sm font-medium">{p.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">{p.category}</p>
                                <div className="mt-2 flex items-center justify-between">
                                    <p className="text-green-600 font-semibold">{p.price}</p>
                                    <span className="text-xs text-green-600 font-medium">In stock</span>
                                </div>
                                <button
                                    className="mt-3 w-full bg-green-600 text-white py-1 rounded-lg text-sm"
                                    onClick={(e) => { e.stopPropagation(); addToCart(p.id); }}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 text-center">
                    <button
                        className="bg-black text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                        onClick={() => navigate("/search", { state: { category: "All" } })}
                    >
                        View More
                    </button>
                </div>
            </section>
        </main>
    );
}
