"use client";

import { useState, useEffect } from "react";
import {
    X,
    Minus,
    Plus,
    Trash2,
    List,
    CreditCard,
    AlertTriangle,
    Gift,
} from "lucide-react";
import OrderTab from "./OrderSidebar";
import OrderHistoryTab from "./OrderHistoryTab";
import { useNavigate } from "react-router-dom";

export default function CartSidebar({
                                        isCartOpen,
                                        onClose,
                                        cartItems,
                                        increaseQty,
                                        decreaseQty,
                                        removeItem,
                                        activeTab,
                                        setActiveTab,
                                        total,
                                        user,
                                    }) {
    const navigate = useNavigate();
    const [stockWarnings, setStockWarnings] = useState({});
    const [isCouponPopupOpen, setIsCouponPopupOpen] = useState(false);
    const [coupons, setCoupons] = useState([]);
    const [collectedCoupons, setCollectedCoupons] = useState([]);
    const [showCollectedCoupons, setShowCollectedCoupons] = useState(false);

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    // 🔹 สุ่มคูปองส่วนลด 3 ใบ (1% - 3% รวม .5 ได้)
    const generateCoupons = () => {
        const newCoupons = Array.from({ length: 3 }, (_, i) => {
            const discount = (Math.random() * 4 + 1).toFixed(1); // 1.0 - 5.0%
            return {
                id: Date.now() + i,
                code: `GIFT${discount.replace(".", "")}`,
                discount: parseFloat(discount),
                description: `ส่วนลด ${discount}%`,
            };
        });
        setCoupons(newCoupons);
    };

    useEffect(() => {
        generateCoupons();
    }, []);

    const handleCollectCoupon = async (coupon) => {
        try {
            const token = localStorage.getItem("token"); // หรือเปลี่ยนตามที่คุณเก็บ JWT ไว้
            if (!token) {
                alert("กรุณาเข้าสู่ระบบก่อนเก็บคูปอง");
                return;
            }

            const response = await fetch(`${BACKEND_URL}/api/coupons/collect`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    couponCode: coupon.code,
                    discount: coupon.discount,
                    description: coupon.description
                }),
            });

            const data = await response.text();

            if (response.ok) {
                setCollectedCoupons([...collectedCoupons, coupon]);
                setShowCollectedCoupons(true);

                setTimeout(() => setShowCollectedCoupons(false), 4000);

                alert("✅ เก็บคูปองเรียบร้อยแล้ว");
            } else {
                alert(`❌ ${data}`);
            }
        } catch (error) {
            console.error("Error collecting coupon:", error);
            alert("เกิดข้อผิดพลาดในการเก็บคูปอง");
        }
    };

    const handleRemoveCoupon = (coupon) => {
        setCollectedCoupons(collectedCoupons.filter((c) => c.code !== coupon.code));
    };

    const handleIncrease = (item) => {
        if (item.quantity + 1 > item.stock) {
            setStockWarnings((prev) => ({
                ...prev,
                [item.id]: `Cannot exceed available stock (${item.stock})`,
            }));
        } else {
            setStockWarnings((prev) => ({ ...prev, [item.id]: "" }));
            increaseQty(item.id);
        }
    };

    const handleDecrease = (item) => {
        setStockWarnings((prev) => ({ ...prev, [item.id]: "" }));
        decreaseQty(item.id);
    };

    return (
        <>
            {/* พื้นหลัง blur */}
            <div
                className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${
                    isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
                onClick={onClose}
            />

            {/* Sidebar หลัก */}
            <div
                data-testid="cart-sidebar"
                className={`fixed top-0 right-0 w-96 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 flex flex-col ${
                    isCartOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold">🛒 Shop Cart</h2>
                    <button onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 px-6 py-2 border-b text-sm">
                    <button
                        onClick={() => setActiveTab("shopcart")}
                        className={`flex items-center space-x-1 ${
                            activeTab === "shopcart"
                                ? "text-green-600 font-medium"
                                : "text-gray-500"
                        }`}
                    >
                        <List size={16} />
                        <span>ShopCart</span>
                    </button>
                    <span>/</span>
                    <button
                        onClick={() => setActiveTab("order")}
                        className={`flex items-center space-x-1 ${
                            activeTab === "order"
                                ? "text-green-600 font-medium"
                                : "text-gray-500"
                        }`}
                    >
                        <List size={16} />
                        <span>Order</span>
                    </button>
                    <span>/</span>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`flex items-center space-x-1 ${
                            activeTab === "history"
                                ? "text-green-600 font-medium"
                                : "text-gray-500"
                        }`}
                    >
                        <List size={16} />
                        <span>Order History</span>
                    </button>
                </div>

                {/* เนื้อหา */}
                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                    {/* ตะกร้าสินค้า */}
                    {activeTab === "shopcart" &&
                        (cartItems.length > 0 ? (
                            cartItems.map((item) => (
                                <div key={item.id} className="flex flex-col space-y-1 pb-4 border-b">
                                    <div className="flex items-start space-x-4">
                                        <img
                                            src={
                                                item.image.startsWith("http")
                                                    ? item.image
                                                    : `http://localhost:8080${item.image}`
                                            }
                                            alt={item.name}
                                            className="w-16 h-16 border rounded object-cover"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{item.productName}</p>
                                            <p className="text-xs text-gray-500">In stock: {item.stock}</p>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-red-500 text-xs flex items-center mt-1"
                                                data-testid="remove-item"
                                            >
                                                <Trash2 size={12} className="mr-1" /> Remove
                                            </button>
                                            {stockWarnings[item.id] && (
                                                <div className="flex items-center mt-1 text-red-600 text-xs">
                                                    <AlertTriangle size={14} className="mr-1" />{" "}
                                                    {stockWarnings[item.id]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end justify-between">
                                            <div className="flex items-center border rounded">
                                                <button
                                                    onClick={() => handleDecrease(item)}
                                                    className="px-2 py-1 hover:bg-gray-100"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="px-3">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleIncrease(item)}
                                                    className="px-2 py-1 hover:bg-gray-100"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <span className="mt-2 font-semibold">
                                                ฿{item.price * item.quantity}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 mt-10">
                                🛒 Your cart is empty.
                            </div>
                        ))}

                    {/* order tab */}
                    {activeTab === "order" && <OrderTab orders={[]} />}

                    {activeTab === "history" && <OrderHistoryTab userId={user?.userId} />}
                </div>

                {/* ปุ่มจ่ายเงิน */}
                {activeTab === "shopcart" && cartItems.length > 0 && (
                    <div className="p-4 border-t bg-white">
                        <button
                            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-base font-medium"
                            data-testid="cart-payment-btn"
                            onClick={() =>
                                navigate("/payment", { state: { cartItems, total } })
                            }
                        >
                            <CreditCard size={18} /> Payment ฿{total}
                        </button>
                    </div>
                )}
            </div>

            {/* 🎁 ปุ่มของขวัญ (มุมขวาล่าง) */}
            <button
                onClick={() => setIsCouponPopupOpen(true)}
                className="fixed bottom-6 right-6 p-6 bg-green-500 rounded-full shadow-xl flex items-center justify-center hover:bg-green-600 transition duration-300 z-[70]"
                title="สุ่มคูปอง"
            >
                <Gift size={32} color="white" />
            </button>

            {/* 🧾 คูปองที่เก็บไว้ */}
            {collectedCoupons.length > 0 && (
                <div className="fixed bottom-24 right-6 bg-white border shadow-xl rounded-lg p-3 w-72 z-[65]">
                    <h4 className="text-sm font-semibold text-green-700 mb-2">🎁 คูปองของคุณ</h4>
                    {collectedCoupons.map((coupon) => (
                        <div
                            key={coupon.code}
                            className="flex justify-between items-center border-b py-1 text-sm"
                        >
                            <span>{coupon.code}</span>
                            <button
                                className="text-red-500 text-xs"
                                onClick={() => handleRemoveCoupon(coupon)}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* 🎁 Popup คูปอง */}
            {isCouponPopupOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[80] flex justify-end p-4">
                    <div className="w-80 bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold text-green-600">🎁 สุ่มคูปองพิเศษ</h3>
                            <button onClick={() => setIsCouponPopupOpen(false)}>
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* ปุ่มสุ่มคูปองใหม่ */}
                        <button
                            onClick={generateCoupons} // สุ่มคูปองใหม่
                            className="w-full mb-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg
                  text-sm font-medium hover:scale-105 transition-all duration-300 shadow-md"
                        >
                            🎲 สุ่มคูปองใหม่
                        </button>

                        {/* แสดงคูปอง 3 ใบ */}
                        <div className="space-y-3">
                            {coupons.map((coupon) => (
                                <div
                                    key={coupon.id}
                                    className="flex justify-between items-center p-3 border rounded-lg bg-green-50 hover:bg-green-100 transition"
                                >
                                    <span className="text-sm">{coupon.description}</span>
                                    <button
                                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700"
                                        onClick={() => handleCollectCoupon(coupon)}
                                    >
                                        เก็บ
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
