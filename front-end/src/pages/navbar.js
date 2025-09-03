"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, User, Search, Menu } from "lucide-react";

export default function Navbar({ cartItems = [], onCartOpen }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const totalCartQty = cartItems.length;

    return (
        <header className="w-full border-b shadow-sm relative z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-2">
                    <img src="/images/WholeCart_logo.png" alt="WholeCart Logo" className="h-12 md:h-14 w-auto cursor-pointer" />
                </div>

                <div className="flex flex-1 max-w-lg mx-6">
                    <input
                        type="text"
                        placeholder="Search for products"
                        className="w-full border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                    <button className="bg-green-600 text-white px-4 rounded-r-lg">
                        <Search size={20} />
                    </button>
                </div>

                <div className="flex items-center space-x-4 relative">
                    <Heart className="text-gray-600 cursor-pointer" onClick={() => navigate("/favorite")}/>
                    <div className="relative">
                        <ShoppingCart className="text-gray-600 cursor-pointer" onClick={onCartOpen} />
                        {totalCartQty > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">{totalCartQty}</span>
                        )}
                    </div>

                    <div className="relative">
                        <button onClick={() => setDropdownOpen(!dropdownOpen)}>
                            <User className="text-gray-600 cursor-pointer" />
                        </button>
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg py-2 z-50">
                                <p className="px-4 py-2 cursor-pointer hover:bg-gray-100" onClick={() => navigate("/signin")}>👤 login</p>
                                <p className="px-4 py-2 cursor-pointer hover:bg-gray-100" onClick={() => navigate("/signup")}>👥 register</p>
                                <p className="px-4 py-2 cursor-pointer hover:bg-gray-100" onClick={() => navigate("/signin-admin")}>🛠 login admin</p>
                            </div>
                        )}
                    </div>

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
