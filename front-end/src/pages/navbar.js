"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, User, Menu, ChevronDown } from "lucide-react";

export default function Navbar({ cartItems = [], onCartOpen, user, setUser }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const totalCartQty = cartItems.length;

    const handleLogout = () => {
        setUser(null); // ล้าง user state
        setDropdownOpen(false);
        navigate("/"); // กลับหน้าแรก
    };

    return (
        <header className="w-full border-b shadow-sm relative z-50 bg-white">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                    <img
                        src="/images/WholeCart_logo.png"
                        alt="WholeCart Logo"
                        className="h-12 md:h-14 w-auto cursor-pointer"
                        onClick={() => navigate("/")}
                    />
                </div>

                {/* Search */}
                <div className="flex flex-1 max-w-lg mx-6">
                    <input
                        type="text"
                        placeholder="Search for products"
                        className="w-full border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                    <button className="bg-green-600 text-white px-4 rounded-r-lg">
                        <Menu size={20} />
                    </button>
                </div>

                {/* Icons & User */}
                <div className="flex items-center space-x-4 relative">
                    {/* Favorites */}
                    <Heart
                        className="text-gray-600 cursor-pointer"
                        onClick={() => navigate("/favorite")}
                    />

                    {/* Cart */}
                    <div className="relative">
                        <ShoppingCart
                            className="text-gray-600 cursor-pointer"
                            onClick={onCartOpen}
                        />
                        {totalCartQty > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                {totalCartQty}
                            </span>
                        )}
                    </div>

                    {/* User Dropdown */}
                    <div className="relative">
                        {user ? (
                            <>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center space-x-1 px-3 py-1 rounded-lg hover:bg-gray-100 transition"
                                >
                                    <span className="text-gray-700 font-medium">{user.username}</span>
                                    <ChevronDown size={16} className="text-gray-600" />
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg py-2 z-50 transition-transform duration-200 origin-top scale-100">
                                        <p
                                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                            onClick={handleLogout}
                                        >
                                            🔓 Logout
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center cursor-pointer"
                                >
                                    <User className="text-gray-600" />
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg border border-gray-200 shadow-md py-2 z-50 transition-transform duration-200 origin-top scale-100">
                                        <p
                                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                            onClick={() => navigate("/signin")}
                                        >
                                            👤 Login
                                        </p>
                                        <p
                                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                            onClick={() => navigate("/signup")}
                                        >
                                            👥 Register
                                        </p>
                                        <p
                                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                            onClick={() => navigate("/signin-admin")}
                                        >
                                            🛠 Admin
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* All Categories */}
                    <button
                        className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg space-x-2"
                        onClick={() => navigate("/search", { state: { category: "All" } })}
                    >
                        <Menu size={18} />
                        <span>All categories</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
