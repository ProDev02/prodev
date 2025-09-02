"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Minus, Plus, Trash2, List, CreditCard } from "lucide-react";
import OrderTab from "./OrderSidebar";

export default function CartSidebar({ isCartOpen, onClose, cartItems, increaseQty, decreaseQty, removeItem }) {
    const [activeTab, setActiveTab] = useState("shopcart");
    const navigate = useNavigate();
    const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className={`fixed top-0 right-0 w-96 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 flex flex-col ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold">Shop cart</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 px-6 py-2 border-b text-sm">
                    <button
                        onClick={() => setActiveTab("shopcart")}
                        className={`flex items-center space-x-1 ${activeTab === "shopcart" ? "text-green-600 font-medium" : "text-gray-500"}`}
                    >
                        <List size={16} />
                        <span>ShopCart</span>
                    </button>
                    <span>/</span>
                    <button
                        onClick={() => setActiveTab("order")}
                        className={`flex items-center space-x-1 ${activeTab === "order" ? "text-green-600 font-medium" : "text-gray-500"}`}
                    >
                        <List size={16} />
                        <span>Order</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                    {activeTab === "shopcart" &&
                        (cartItems.length > 0 ? (
                            cartItems.map(item => (
                                <div key={item.id} className="flex flex-col space-y-1 pb-4 border-b">
                                    <div className="flex items-start space-x-4">
                                        <img src={item.image} alt={item.name} className="w-16 h-16 border rounded object-cover" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{item.name}</p>
                                            <p className="text-xs text-gray-500">In stock : {item.stock}</p>
                                            <button onClick={() => removeItem(item.id)} className="text-red-500 text-xs flex items-center mt-1">
                                                <Trash2 size={12} className="mr-1" /> Remove
                                            </button>
                                        </div>
                                        <div className="flex flex-col items-end justify-between">
                                            <div className="flex items-center border rounded">
                                                <button onClick={() => decreaseQty(item.id)} className="px-2 py-1 hover:bg-gray-100"><Minus size={14} /></button>
                                                <span className="px-3">{item.qty}</span>
                                                <button onClick={() => increaseQty(item.id)} className="px-2 py-1 hover:bg-gray-100"><Plus size={14} /></button>
                                            </div>
                                            <span className="mt-2 font-semibold">฿{item.price * item.qty}</span>
                                        </div>
                                    </div>
                                    {item.warning && <div className="text-red-600 text-xs font-medium">⚠️ Quantity exceeds stock!</div>}
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 mt-10">🛒 Your cart is empty.</div>
                        ))
                    }

                    {activeTab === "order" &&
                        <OrderTab orders={[
                            { id: 1, name: "Be Nice Shower Cream, Perfect Elastic Formula, 450 ml.", qty: 1, price: 109, status: "pending", image: "/images/products/showercream.png" },
                            { id: 2, name: "KFC BamBam BOX Menu TheBox special", qty: 1, price: 159, status: "pending", image: "/images/products/kfc.png" },
                            { id: 3, name: "Protex Lavender Ice Freeze Soap Bar 60 g.", qty: 3, price: 57, status: "fulfilled", image: "/images/products/protex.png" },
                        ]}/>
                    }
                </div>

                {/* Footer */}
                {activeTab === "shopcart" && cartItems.length > 0 && (
                    <div className="p-4 border-t bg-white">
                        <button
                            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-base font-medium"
                            onClick={() => navigate("/payment")}
                        >
                            <CreditCard size={18} /> Payment ฿{total}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
