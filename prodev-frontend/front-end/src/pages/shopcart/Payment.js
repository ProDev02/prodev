"use client";

import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, ShoppingCart } from "lucide-react";
import { CartContext } from "../../AppLayout";

export default function CheckoutPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const cartContext = useContext(CartContext) || {};
    const fetchCart = cartContext.fetchCart || (() => {});

    const cartItems = state?.cartItems || [];

    const [selectedDelivery, setSelectedDelivery] = useState("Standard");
    const [selectedCoupon, setSelectedCoupon] = useState(null); // ตัวแปรเลือกคูปอง
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [couponError, setCouponError] = useState(""); // สถานะข้อผิดพลาดของคูปอง

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    // คำนวณ subtotal
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const deliveryOptions = [
        { id: "Standard", label: "Standard", desc: "Receive : Thu, 31 Aug - Mon 1 Sep.", price: 0 },
        { id: "Fast", label: "Fast", desc: "Receive : Thu, 28 Aug - Thu 30 Aug.", price: 6 },
        { id: "VeryFast", label: "Very Fast", desc: "Receive : Thu, 28 Aug - Thu 29 Aug.", price: 12 },
        { id: "Fastest", label: "Fastest", desc: "Receive : Thu, 27 Aug - Thu 28 Aug.", price: 20 },
    ];

    const selectedOption = deliveryOptions.find((opt) => opt.id === selectedDelivery);

    const handlePayNow = async () => {
        if (loading) return;
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("You must login first!");

            const response = await fetch(`${BACKEND_URL}/api/orders/checkout`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const txt = await response.text();
                throw new Error(txt || "Checkout failed");
            }

            const data = await response.json();
            console.log("Checkout success:", data);

            // รีโหลด cart ใหม่
            fetchCart();

            // แสดง modal success
            setShowModal(true);

            // โหลด PDF ทันทีจาก backend
            if (data.pdfBytes) {
                const byteCharacters = atob(data.pdfBytes); // decode base64
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: "application/pdf" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "order_summary.pdf";
                a.click();
                window.URL.revokeObjectURL(url);
            }

        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    // คูปอง
    const coupons = [
        { code: "GIFT1", discount: 5, description: "5% Discount" },
        { code: "GIFT2", discount: 10, description: "10% Discount" },
        { code: "GIFT3", discount: 15, description: "15% Discount" }
    ];

    const handleCouponSelect = (event) => {
        const selectedCouponCode = event.target.value;
        const coupon = coupons.find(coupon => coupon.code === selectedCouponCode);

        if (subtotal < 299) {
            setCouponError("You need to spend at least ฿299 to use a coupon.");
            setSelectedCoupon(null); // รีเซ็ทคูปอง
        } else {
            setCouponError(""); // ไม่มีข้อผิดพลาด
            setSelectedCoupon(coupon || null); // เลือกคูปอง
        }
    };

    // คำนวณราคาหลังหักส่วนลด
    const discountedSubtotal = selectedCoupon
        ? subtotal - (subtotal * (selectedCoupon.discount / 100))
        : subtotal;

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-0">
                    <div className="flex items-center space-x-2">
                        <img src="/images/WholeCart_logo.png" alt="WholeCart" className="h-10" />
                    </div>
                    <nav className="flex items-center space-x-12 text-gray-600 font-medium">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span>Login</span>
                        </div>
                        <div className="flex items-center space-x-2 text-green-600 font-bold">
                            <span className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs">2</span>
                            <span>Delivery</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs">3</span>
                            <span>Payment</span>
                        </div>
                    </nav>
                    <div className="flex items-center space-x-2 text-gray-700 font-medium">
                        <ShoppingCart className="w-5 h-5" />
                        <span>Checkout</span>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
                <div className="lg:col-span-2 space-y-8">
                    {/* 1. Login */}
                    <div>
                        <h2 className="text-lg font-bold mb-2">1. Login</h2>
                        <div className="border rounded p-4">
                            <input type="email" placeholder="Email" className="w-full p-2 border rounded" />
                            <label className="flex items-center text-sm mt-2 text-gray-600">
                                <input type="checkbox" className="mr-2" /> Yes, I would like to receive personalized news...
                            </label>
                        </div>
                    </div>

                    {/* 2. Delivery */}
                    <div>
                        <h2 className="text-lg font-bold mb-2">2. Delivery</h2>
                        <div className="border rounded p-4 space-y-6">
                            <div>
                                <h3 className="font-medium mb-2">Delivery Options</h3>
                                <div className="space-y-3">
                                    {deliveryOptions.map((opt) => (
                                        <label
                                            key={opt.id}
                                            className={`flex justify-between items-center p-3 border rounded cursor-pointer transition ${selectedDelivery === opt.id ? "border-green-600 bg-green-50" : "border-gray-300"}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="delivery"
                                                    checked={selectedDelivery === opt.id}
                                                    onChange={() => setSelectedDelivery(opt.id)}
                                                    className="w-4 h-4 accent-green-600"
                                                />
                                                <div>
                                                    <span className="font-medium">{opt.label}</span>
                                                    <small className="block text-gray-500">{opt.desc}</small>
                                                </div>
                                            </div>
                                            <span className="font-medium">
                                                {opt.price === 0 ? "FREE" : `฿${opt.price.toFixed(2)}`}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    *Estimated delivery times exclude bank holidays and weekends.
                                </p>
                            </div>

                            {/* Delivery Address */}
                            <div>
                                <h3 className="font-medium mb-2">Delivery Address</h3>
                                <input type="text" placeholder="Username" className="w-full p-2 border rounded mb-3" />
                                <div className="flex gap-2 mb-3">
                                    <select className="p-2 border rounded">
                                        <option>+66</option>
                                        <option>+44</option>
                                        <option>+1</option>
                                    </select>
                                    <input type="text" placeholder="81-234-5678" className="flex-1 p-2 border rounded" />
                                </div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <select className="w-full p-2 border rounded">
                                    <option>Thailand</option>
                                    <option>United Kingdom</option>
                                    <option>USA</option>
                                </select>
                            </div>

                            {/* Billing Address */}
                            <div>
                                <h3 className="font-medium mb-2">BILLING ADDRESS:</h3>
                                <label className="flex items-center text-sm text-gray-700">
                                    <input type="checkbox" className="mr-2" /> Use the delivery address as a billing address
                                </label>
                            </div>

                            {/* Pay Now Button */}
                            <button
                                onClick={handlePayNow}
                                disabled={loading}
                                className={`w-full py-3 rounded-lg font-semibold mt-4 ${loading ? "bg-gray-400" : "bg-green-600 text-white hover:bg-green-700"}`}
                            >
                                {loading ? "Processing..." : "Pay Now!!"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right side - Summary */}
                <div className="bg-white border rounded p-6 h-fit">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Summary Order</h2>
                        <button
                            className="text-sm text-gray-500 underline"
                            onClick={() => navigate("/")}
                        >
                            Back to Order
                        </button>
                    </div>

                    <div className="space-y-4">
                        {cartItems.map((item, index) => (
                            <div key={index} className="flex gap-3 border-b pb-3">
                                <img
                                    src={item.image.startsWith("http") ? item.image : `${BACKEND_URL}${item.image}`}
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded"
                                />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-sm">{item.productName}</h3>
                                    <p className="text-gray-500 text-xs">Quantity: {item.quantity}</p>
                                </div>
                                <p className="font-semibold">฿{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    {/* คูปอง - Dropdown */}
                    <div className="mt-4">
                        <h3 className="font-medium mb-2">Choose a Coupon</h3>
                        <select
                            className="w-full p-2 border rounded"
                            value={selectedCoupon?.code || ""}
                            onChange={handleCouponSelect}
                        >
                            <option value="">Select a coupon</option>
                            {coupons.map((coupon) => (
                                <option key={coupon.code} value={coupon.code}>
                                    {coupon.description} - {coupon.discount}% off
                                </option>
                            ))}
                        </select>
                        {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
                    </div>

                    <div className="mt-4 border-t pt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>SubTotal({cartItems.length} Products)</span>
                            <span>฿{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Delivery ({selectedOption?.label})</span>
                            <span>{selectedOption?.price === 0 ? "Free" : `฿${selectedOption?.price.toFixed(2)}`}</span>
                        </div>

                        {/* การแสดงราคาหลังหักส่วนลด */}
                        {selectedCoupon && (
                            <div className="flex justify-between text-red-600">
                                <span>Discount ({selectedCoupon.discount}%)</span>
                                <span>-฿{(subtotal * (selectedCoupon.discount / 100)).toFixed(2)}</span>
                            </div>
                        )}

                        <div className="flex justify-between font-bold text-lg">
                            <span>Total (SubTotal + Delivery)</span>
                            <span>฿{(discountedSubtotal + (selectedOption?.price || 0)).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-80 flex flex-col items-center space-y-4">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                        <h2 className="text-lg font-bold text-center">Payment Successful!</h2>
                        <button
                            onClick={() => {
                                setShowModal(false);
                                navigate("/");
                            }}
                            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
