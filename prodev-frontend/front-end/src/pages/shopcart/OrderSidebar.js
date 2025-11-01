"use client";

import { useState, useEffect } from "react";

export default function OrderTab() {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    // Fetch orders ของ user
    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch(`${BACKEND_URL}/api/orders/my`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to fetch orders");
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // รับ order และลบจาก database
    const handleReceive = async (id) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not logged in");

            // ลบ order จาก backend
            const res = await fetch(`${BACKEND_URL}/api/orders/${id}/receive`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to delete order");

            // ลบจาก frontend
            setOrders(prev => prev.filter(order => order.id !== id));
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    // กรองตาม search
    // กรอง order ที่ยังไม่รับ
    const filteredOrders = orders
        .filter(o => o.status !== "RECEIVED")  // เพิ่มบรรทัดนี้
        .filter(o => o.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div data-testid="order-tab" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">My Orders</h3>
                <input
                    type="text"
                    placeholder="Search orders..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded px-2 py-1"
                />
            </div>

            {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                    <div
                        key={order.id}
                        className="relative flex items-start space-x-4 pb-4 border-b"
                        data-testid={`order-row-${order.id}`}
                    >
                        <span className="absolute top-0 right-0 text-xs font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                            x{order.quantity}
                        </span>

                        <img
                            src={order.image ? `http://localhost:8080${order.image}` : "/no-image.png"}
                            alt={order.name}
                            className="w-16 h-16 border rounded object-cover"
                        />

                        <div className="flex-1 flex flex-col justify-between">
                            <p className="text-sm font-medium">{order.name}</p>
                            <p className="text-xs text-gray-500">Category: {order.category}</p>

                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center space-x-2">
                                    <p className="text-xs">
                                        Status:{" "}
                                        <span
                                            className={`font-medium px-2 py-1 rounded text-white ${
                                                order.status === "PENDING"
                                                    ? "bg-yellow-500"
                                                    : order.status === "FULFILLED"
                                                        ? "bg-blue-600"
                                                        : "bg-red-600"
                                            }`}
                                        >
                                            {order.status}
                                        </span>
                                    </p>

                                    {/* ปุ่ม Receive เฉพาะ FULFILLED */}
                                    {order.status === "FULFILLED" && (
                                        <button
                                            onClick={() => handleReceive(order.id)}
                                            className="px-3 py-1 text-xs bg-green-600 text-white rounded"
                                        >
                                            Receive
                                        </button>
                                    )}
                                </div>

                                <span className="text-sm font-semibold">
                                    ${order.price * order.quantity}
                                </span>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center text-gray-500 mt-10">
                    📦 You have no orders yet.
                </div>
            )}
        </div>
    );
}
