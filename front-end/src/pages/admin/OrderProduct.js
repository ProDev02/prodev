"use client";

import { useState } from "react";
import AdminLayout from "../../AdminLayout"; // import layout ใหม่
import { MoreVertical } from "lucide-react";

const productsMock = [
    { id: 1, name: "Be Nice Shower Cream, Perfect Elastic Formula, 450 ml", category: "Shower", price: 109, status: "In stock", createdAt: "2024/08/27", image: "/images/products/showercream.png" },
    { id: 2, name: "Protex Lavender Ice Freeze Soap Bar 60 g", category: "Shower", price: 19, status: "Out of stock", createdAt: "2024/08/27", image: "/images/products/protex.png" },
    { id: 3, name: "Sample Product 3", category: "Bath", price: 50, status: "In stock", createdAt: "2024/08/28", image: "/images/products/showercream.png" },
    { id: 4, name: "Sample Product 4", category: "Shower", price: 75, status: "Out of stock", createdAt: "2024/08/29", image: "/images/products/protex.png" },
    { id: 5, name: "Sample Product 5", category: "Shower", price: 120, status: "In stock", createdAt: "2024/08/30", image: "/images/products/showercream.png" },
    { id: 6, name: "Sample Product 6", category: "Bath", price: 90, status: "Out of stock", createdAt: "2024/09/01", image: "/images/products/protex.png" },
];

const ordersMock = [
    { id: 1, name: "Be Nice Shower Cream", category: "Shower", price: 109, quantity: 1, statusOrder: "Pending", image: "/images/products/showercream.png" },
    { id: 2, name: "KFC BamBam BOX Menu", category: "Food & Drink", price: 150, quantity: 1, statusOrder: "Pending", image: "/images/products/kfc.png" },
    { id: 3, name: "Protex Lavender Ice Freeze Soap Bar 60 g", category: "Shower", price: 19, quantity: 3, statusOrder: "Fulfilled", image: "/images/products/protex.png" },
];

export default function OrderProduct() {
    const [orders, setOrders] = useState(ordersMock);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("lowToHigh");
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const ITEMS_PER_PAGE = 5;

    const filteredOrders = orders
        .filter((o) => o.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => (sort === "lowToHigh" ? a.price - b.price : b.price - a.price));

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length);

    const handleStatusChange = (id, newStatus) => {
        setOrders((prev) =>
            prev.map((o) => (o.id === id ? { ...o, statusOrder: newStatus } : o))
        );
        setDropdownOpen(null);
    };

    return (
        <AdminLayout
            title="Dashboard Admin - Order Product"
            viewWebsiteLink="/"
            stats={{
                total: orders.length,
                outOfStock: orders.filter(o => o.statusOrder === "Pending").length,
                pending: orders.filter(o => o.statusOrder === "Pending").length,
            }}
        >
            {/* Order table */}
            <div className="bg-white p-4 rounded shadow">
                <div className="flex justify-between items-center mb-4">
                    <input
                        type="text"
                        placeholder="Search"
                        className="border rounded px-2 py-1"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="border rounded px-2 py-1"
                    >
                        <option value="lowToHigh">Price: Low to High</option>
                        <option value="highToLow">Price: High to Low</option>
                    </select>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-green-600 text-white">
                        <th className="p-2">Order ID</th>
                        <th className="p-2">Image</th>
                        <th className="p-2">Product Name</th>
                        <th className="p-2">Categories</th>
                        <th className="p-2">Quantity</th>
                        <th className="p-2">Status Order</th>
                        <th className="p-2">Price</th>
                        <th className="p-2">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedOrders.map((o) => (
                        <tr key={o.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">ORD{String(o.id).padStart(2, "0")}</td>
                            <td className="p-2">
                                <img src={o.image} alt={o.name} className="w-12 h-12 object-contain" />
                            </td>
                            <td className="p-2">{o.name}</td>
                            <td className="p-2">{o.category}</td>
                            <td className="p-2">{o.quantity}</td>
                            <td className="p-2">
                                    <span
                                        className={`px-2 py-1 rounded text-white ${
                                            o.statusOrder === "Pending"
                                                ? "bg-yellow-500"
                                                : o.statusOrder === "Fulfilled"
                                                    ? "bg-green-600"
                                                    : "bg-red-600"
                                        }`}
                                    >
                                        {o.statusOrder}
                                    </span>
                            </td>
                            <td className="p-2">${o.price * o.quantity}</td>
                            <td className="p-2 relative">
                                {o.statusOrder === "Pending" && (
                                    <>
                                        <button
                                            className="p-1 rounded hover:bg-gray-100"
                                            onClick={() => setDropdownOpen(dropdownOpen === o.id ? null : o.id)}
                                        >
                                            <MoreVertical size={20} />
                                        </button>
                                        {dropdownOpen === o.id && (
                                            <div className="absolute right-0 mt-2 w-36 bg-white border rounded shadow z-10">
                                                <button
                                                    className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-green-600 hover:text-white"
                                                    onClick={() => handleStatusChange(o.id, "Fulfilled")}
                                                >
                                                    ✅ Fulfilled
                                                </button>
                                                <button
                                                    className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-red-600 hover:text-white"
                                                    onClick={() => handleStatusChange(o.id, "Cancel")}
                                                >
                                                    ❌ Cancel
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <div className="mt-2 text-sm text-gray-600">
                    Showing {startItem} - {endItem} of {filteredOrders.length}
                </div>

                {filteredOrders.length > ITEMS_PER_PAGE && (
                    <div className="mt-4 flex justify-end space-x-2 text-sm text-gray-600">
                        <button
                            className="px-2 py-1 border rounded"
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                className={`px-2 py-1 border rounded ${
                                    page === currentPage ? "bg-green-600 text-white" : ""
                                }`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            className="px-2 py-1 border rounded"
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
