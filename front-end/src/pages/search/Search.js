"use client";

import { useState, useEffect  } from "react";
import { useLocation } from "react-router-dom";
import { Utensils, Smartphone, Sofa, ShowerHead, Shirt, Tv, Cookie } from "lucide-react";
import Navbar from "../navbar";
import Footer from "../footer";
import CartSidebarWrapper from "../shopcart/CartSidebarWrapper";

export default function SearchPage() {
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Cart items
    const [cartItems, setCartItems] = useState([
        { id: 1, name: "Be Nice Shower Cream, Perfect Elastic Formula, 450 ml.", price: 109, qty: 1, stock: 5, image: "/images/products/showercream.png", warning: false },
        { id: 2, name: "Protex Lavender Ice Freeze Soap Bar 60 g.", price: 19, qty: 3, stock: 3, image: "/images/products/protex.png", warning: false },
        { id: 3, name: "KFC BamBam BOX Menu TheBox special", price: 159, qty: 1, stock: 20, image: "/images/products/kfc.png", warning: false },
    ]);

    // Cart functions
    const increaseQty = (id) => {
        setCartItems(prev =>
            prev.map(item => {
                if (item.id === id) {
                    if (item.qty + 1 > item.stock) return { ...item, warning: true };
                    return { ...item, qty: item.qty + 1, warning: false };
                }
                return item;
            })
        );
    };

    const decreaseQty = (id) => {
        setCartItems(prev =>
            prev.map(item => {
                if (item.id === id) {
                    const newQty = Math.max(item.qty - 1, 1);
                    return { ...item, qty: newQty, warning: false };
                }
                return item;
            })
        );
    };

    const removeItem = (id) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    // Categories
    const categories = [
        { name: "All", icon: null },
        { name: "Snack", icon: <Cookie size={18} /> },
        { name: "Food & Drinks", icon: <Utensils size={18} /> },
        { name: "Smartphones", icon: <Smartphone size={18} /> },
        { name: "Furniture", icon: <Sofa size={18} /> },
        { name: "Shower", icon: <ShowerHead size={18} /> },
        { name: "Clothing", icon: <Shirt size={18} /> },
        { name: "Electronics", icon: <Tv size={18} /> },
    ];

    // Price ranges
    const priceRanges = [
        { label: "$1–$249", min: 1, max: 249 },
        { label: "$250–$1,049", min: 250, max: 1049 },
        { label: "$1,050–$2,999", min: 1050, max: 2999 },
        { label: "$3,000–$5,000", min: 3000, max: 5000 },
        { label: "$5,000–$10,000", min: 5000, max: 10000 },
    ];

    // Sample products
    const products = [
        { id: 1, name: "Be Nice Shower Cream", desc: "Perfect Elastic Formula, 450 ml", price: 109, image: "/images/products/showercream.png", category: "Shower" },
        { id: 2, name: "Protex Soap Bar", desc: "Lavender Ice Freeze 60 g", price: 19, image: "/images/products/protex.png", category: "Shower" },
        { id: 3, name: "KFC BamBam BOX", desc: "Menu TheBox special", price: 159, image: "/images/products/kfc.png", category: "Food & Drinks" },
        { id: 4, name: "Chocolate Chip Cookie", desc: "Delicious snack", price: 49, image: "/images/products/protex.png", category: "Snack" },
        { id: 5, name: "iPhone 15", desc: "Latest smartphone", price: 999, image: "/images/products/kfc.png", category: "Smartphones" },
        { id: 6, name: "Modern Sofa", desc: "Comfortable 3-seater", price: 1200, image: "/images/products/showercream.png", category: "Furniture" },
        { id: 7, name: "Shampoo Set", desc: "For smooth hair", price: 89, image: "/images/products/protex.png", category: "Shower" },
        { id: 8, name: "T-shirt", desc: "Cotton casual", price: 29, image: "/images/products/kfc.png", category: "Clothing" },
        { id: 9, name: "Samsung TV", desc: "55-inch 4K", price: 799, image: "/images/products/showercream.png", category: "Electronics" },
        { id: 10, name: "Protein Bar", desc: "Healthy snack", price: 39, image: "/images/products/protex.png", category: "Snack" },
        { id: 11, name: "Laptop", desc: "High performance", price: 1500, image: "/images/products/kfc.png", category: "Electronics" },
        { id: 12, name: "Coffee Maker", desc: "Automatic drip", price: 199, image: "/images/products/showercream.png", category: "Food & Drinks" },
    ];

    // Filter states
    const location = useLocation();
    const defaultCategory = location.state?.category || "All";
    const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
    const [selectedPrices, setSelectedPrices] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

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

    const filteredProducts = products.filter(p => {
        const matchCategory = selectedCategory === "All" ? true : p.category === selectedCategory;
        const matchPrice = selectedPrices.length
            ? selectedPrices.some(label => {
                const range = priceRanges.find(r => r.label === label);
                return p.price >= range.min && p.price <= range.max;
            })
            : true;
        return matchCategory && matchPrice;
    });

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setSelectedCategory(defaultCategory);
        setCurrentPage(1);
    }, [defaultCategory]);

    return (
        <div className="font-sans bg-white relative">
            <div className={`${isCartOpen ? "blur-sm pointer-events-none" : ""} transition-all duration-300`}>
                <Navbar cartItems={cartItems} onCartOpen={() => setIsCartOpen(true)} />

                <main className="max-w-7xl mx-auto px-6 py-6 flex gap-8">
                    {/* Sidebar */}
                    <aside className="w-1/4">
                        <h3 className="text-gray-600 text-sm mb-2">Categories</h3>
                        <ul className="mb-6">
                            {categories.map(c => (
                                <li
                                    key={c.name}
                                    className={`px-3 py-2 rounded-md mb-1 cursor-pointer ${
                                        selectedCategory === c.name ? "bg-green-500 text-white" : "hover:bg-gray-100"
                                    }`}
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

                    {/* Products */}
                    <section className="flex-1">
                        <h2 className="text-2xl font-semibold mb-6">
                            {selectedCategory === "All" ? "All Products" : selectedCategory}
                        </h2>

                        {paginatedProducts.length > 0 ? (
                            <div className="grid grid-cols-3 lg:grid-cols-4 gap-6">
                                {paginatedProducts.map(p => (
                                    <div
                                        key={p.id}
                                        className="border rounded-lg overflow-hidden flex flex-col transition hover:shadow-lg hover:border-green-600"
                                    >
                                        <img
                                            src={p.image}
                                            alt={p.name}
                                            className="w-full h-40 object-contain p-4"
                                        />
                                        <div className="p-4 flex flex-col flex-grow">
                                            <h3 className="text-sm font-medium mb-2">{p.name}</h3>
                                            <p className="text-xs text-gray-500 mt-1">{p.category}</p>
                                            <div className="mt-auto flex items-center justify-between">
                                                <p className="text-gray-800 font-semibold">${p.price.toFixed(2)}</p>
                                                <button className="bg-green-600 text-white px-3 py-1 rounded-md text-sm">
                                                    + Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No products found.</p>
                        )}

                        {/* Pagination */}
                        {paginatedProducts.length > 0 && (
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
                                        className={`px-3 py-1 border rounded ${
                                            currentPage === i + 1 ? "bg-green-600 text-white" : ""
                                        }`}
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

                <Footer />
            </div>

            <CartSidebarWrapper
                isCartOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cartItems}
                increaseQty={increaseQty}
                decreaseQty={decreaseQty}
                removeItem={removeItem}
            />
        </div>
    );
}
