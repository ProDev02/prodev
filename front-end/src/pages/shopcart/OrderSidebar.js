"use client";

import { useState } from "react";

export default function OrderTab({ orders }) {
    const [orderList, setOrderList] = useState(orders);

    const handleReceive = (id) => {
        setOrderList(prev => prev.filter(order => order.id !== id));
    };

    return (
        <div className="space-y-4">
            {orderList.length > 0 ? (
                orderList.map(order => (
                    <div
                        key={order.id}
                        className="relative flex items-start space-x-4 pb-4 border-b"
                    >
                        {/* จำนวนสินค้า (x1, x3) มุมขวาบน */}
                        <span className="absolute top-0 right-0 text-xs font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                            x{order.qty}
                        </span>

                        {/* รูปสินค้า */}
                        <img
                            src={order.image}
                            alt={order.name}
                            className="w-16 h-16 border rounded object-cover"
                        />

                        {/* รายละเอียดสินค้า */}
                        <div className="flex-1 flex flex-col justify-between">
                            <p className="text-sm font-medium">{order.name}</p>
                            <p className="text-xs text-gray-500">
                                TotalProduct: {order.qty}
                            </p>

                            {/* Status + ปุ่ม (ซ้าย) + ราคา (ขวา) */}
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center space-x-2">
                                    <p className="text-xs">
                                        Status:{" "}
                                        <span
                                            className={`font-medium ${
                                                order.status === "pending"
                                                    ? "text-green-600"
                                                    : "text-orange-500"
                                            }`}
                                        >
                                            {order.status}
                                        </span>
                                    </p>

                                    {/* ปุ่มเฉพาะ fulfilled */}
                                    {order.status === "fulfilled" && (
                                        <button
                                            onClick={() =>
                                                handleReceive(order.id)
                                            }
                                            className="px-3 py-1 text-xs bg-green-600 text-white rounded"
                                        >
                                            receive
                                        </button>
                                    )}
                                </div>

                                {/* ราคา */}
                                <span className="text-sm font-semibold">
                                    ${order.price}
                                </span>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center text-gray-500 mt-10">
                    📦 No orders yet.
                </div>
            )}
        </div>
    );
}
