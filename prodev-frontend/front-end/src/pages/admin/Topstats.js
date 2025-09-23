// components/TopStats.jsx
"use client";

export default function TopStats({ total, outOfStock, pending }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            {/* Total Products */}
            <div className="border rounded-lg shadow-sm p-4 flex flex-col items-center justify-center text-center">
                <span className="text-gray-600">จำนวนสินค้าทั้งหมด</span>
                <span className="text-3xl font-bold text-blue-600">{total}</span>
            </div>

            {/* Out of Stock */}
            <div className="border rounded-lg shadow-sm p-4 flex flex-col items-center justify-center text-center">
                <span className="text-gray-600">จำนวนสินค้าที่หมดสต็อก</span>
                <span className="text-3xl font-bold text-red-600">{outOfStock}</span>
            </div>

            {/* Pending Products */}
            <div className="border rounded-lg shadow-sm p-4 flex flex-col items-center justify-center text-center">
                <span className="text-gray-600">จำนวนสินค้ารออนุมัติ</span>
                <span className="text-3xl font-bold text-green-600">{pending}</span>
            </div>
        </div>
    );
}
