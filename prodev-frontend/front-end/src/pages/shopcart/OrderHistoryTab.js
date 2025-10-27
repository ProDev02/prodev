"use client";

import { useEffect, useState, useContext } from "react";
import { Trash2, Repeat } from "lucide-react";
import { CartContext } from "../../AppLayout"; // <-- ดึง context มา
import { useNavigate } from "react-router-dom";

export default function OrderHistoryTab() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const { fetchCart } = useContext(CartContext); // <-- ใช้ fetchCart จาก context
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    const navigate = useNavigate();

    // โหลด order history
    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${BACKEND_URL}/api/orders/history`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch orders");
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Reorder → ส่งไปที่ cart โดยตรง
    const handleReorder = async (orderId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${BACKEND_URL}/api/orders/${orderId}/reorder`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (!res.ok) throw new Error("Failed to reorder");

            const cartData = await res.json();
            console.log("Added to cart:", cartData);

            // อัปเดต cart sidebar แบบ realtime
            fetchCart();

            alert("✅ Added items to cart!");
        } catch (err) {
            console.error(err);
            alert("❌ Cannot reorder: " + err.message);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!orders.length) return <p className="text-gray-500">ไม่มีคำสั่งซื้อที่ผ่านมา</p>;

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center space-x-3">
                        <img
                            src={
                                order.image?.startsWith("http")
                                    ? order.image
                                    : `${BACKEND_URL}${order.image}`
                            }
                            alt={order.name}
                            className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                            <p className="text-sm font-medium">{order.name}</p>
                            <p className="text-xs text-gray-500">Qty: {order.quantity}</p>
                            <p className="text-xs text-gray-500">฿{order.price}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleReorder(order.id)}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                        <Repeat size={14} /> สั่งซ้ำ
                    </button>
                </div>
            ))}
        </div>
    );
}
