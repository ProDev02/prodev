"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../AdminLayout";
import { MoreVertical } from "lucide-react";

export default function OrderProduct() {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("lowToHigh");
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const ITEMS_PER_PAGE = 5;

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("admin_token");
            if (!token) throw new Error("Admin not logged in");

            const res = await fetch(`${BACKEND_URL}/api/orders`, {
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

    const handleStatusChange = async (id, newStatus) => {
        try {
            const token = localStorage.getItem("admin_token");

            if (newStatus === "CANCEL") {
                // DELETE order
                const res = await fetch(`${BACKEND_URL}/api/orders/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Failed to cancel order");

                setOrders(prev => prev.filter(o => o.id !== id));
            } else {
                // PATCH status
                const res = await fetch(`${BACKEND_URL}/api/orders/${id}?status=${newStatus}`, {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Failed to update status");

                setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
            }
        } catch (err) {
            console.error(err);
        }
        setDropdownOpen(null);
    };

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

    return (
        <AdminLayout
            title="All Orders"
            stats={{
                total: orders.length,
                outOfStock: 0,
                pending: orders.filter((o) => o.status === "PENDING").length,
            }}
        >
            <div className="bg-white p-4 rounded shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">All Orders</h3>
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

                {paginatedOrders.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-green-600 text-white">
                            <th className="p-2">Order ID</th>
                            <th className="p-2">User email</th>
                            <th className="p-2">Image</th>
                            <th className="p-2">Product Name</th>
                            <th className="p-2">Category</th>
                            <th className="p-2">Quantity</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Price</th>
                            <th className="p-2">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedOrders.map((o) => (
                            <tr key={o.id} className="border-b hover:bg-gray-50">
                                <td className="p-2">ORD{o.id}</td>
                                <td className="p-2">{o.user?.email}</td>
                                <td className="p-2">
                                    <img
                                        src={`https://muict.app/prodev-backend${o.image}`}
                                        alt={o.name}
                                        className="w-12 h-12 object-contain"
                                    />
                                </td>
                                <td className="p-2">{o.name}</td>
                                <td className="p-2">{o.category}</td>
                                <td className="p-2">{o.quantity}</td>
                                <td className="p-2">
                                    <span
                                        className={`px-2 py-1 rounded text-white ${
                                            o.status === "PENDING"
                                                ? "bg-yellow-500"
                                                : o.status === "FULFILLED"
                                                    ? "bg-green-600"
                                                    : "bg-red-600"
                                        }`}
                                    >
                                        {o.status}
                                    </span>
                                </td>
                                <td className="p-2">${o.price * o.quantity}</td>
                                <td className="p-2 relative">
                                    {o.status === "PENDING" && (
                                        <>
                                            <button
                                                className="p-1 rounded hover:bg-gray-100"
                                                onClick={() =>
                                                    setDropdownOpen(dropdownOpen === o.id ? null : o.id)
                                                }
                                            >
                                                <MoreVertical size={20} />
                                            </button>
                                            {dropdownOpen === o.id && (
                                                <div className="absolute right-0 mt-2 w-36 bg-white border rounded shadow z-10">
                                                    <button
                                                        className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-green-600 hover:text-white"
                                                        onClick={() => handleStatusChange(o.id, "FULFILLED")}
                                                    >
                                                        ✅ Fulfilled
                                                    </button>
                                                    <button
                                                        className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-red-600 hover:text-white"
                                                        onClick={() => handleStatusChange(o.id, "CANCEL")}
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
                ) : (
                    <div className="text-center text-gray-500 mt-10">
                        📦 No orders yet.
                    </div>
                )}

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
                                className={`px-2 py-1 border rounded ${page === currentPage ? "bg-green-600 text-white" : ""}`}
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
