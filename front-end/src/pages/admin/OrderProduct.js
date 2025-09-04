"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import Sidebar from "./Sidebar";
import TopStats from "./Topstats";

const productsMock = [
    { id: 1, name: "Be Nice Shower Cream, Perfect Elastic Formula, 450 ml", category: "Shower", price: 109, status: "In stock", createdAt: "2024/08/27", image: "/images/products/showercream.png" },
    { id: 2, name: "Protex Lavender Ice Freeze Soap Bar 60 g", category: "Shower", price: 19, status: "Out of stock", createdAt: "2024/08/27", image: "/images/products/protex.png" },
    { id: 3, name: "Sample Product 3", category: "Bath", price: 50, status: "In stock", createdAt: "2024/08/28", image: "/images/products/showercream.png" },
    { id: 4, name: "Sample Product 4", category: "Shower", price: 75, status: "Out of stock", createdAt: "2024/08/29", image: "/images/products/protex.png" },
    { id: 5, name: "Sample Product 5", category: "Shower", price: 120, status: "In stock", createdAt: "2024/08/30", image: "/images/products/showercream.png" },
    { id: 6, name: "Sample Product 6", category: "Bath", price: 90, status: "Out of stock", createdAt: "2024/09/01", image: "/images/products/protex.png" },
];

const ordersMock = [
    {
        id: 1,
        name: "Be Nice Shower Cream, Perfect Elastic Formula, 450 ml",
        category: "Shower",
        price: 109,
        statusOrder: "Pending",
        createdAt: "2024/08/27",
        image: "/images/products/showercream.png",
    },
    {
        id: 2,
        name: "KFC BamBam BOX Menu TheBox special",
        category: "Food & Drink",
        price: 150,
        statusOrder: "Pending",
        createdAt: "2024/08/27",
        image: "/images/products/kfc.png",
    },
    {
        id: 3,
        name: "Protex Lavender Ice Freeze Soap Bar 60 g",
        category: "Shower",
        price: 19,
        statusOrder: "Fulfilled",
        createdAt: "2024/08/27",
        image: "/images/products/protex.png",
    },
];

export default function OrderProduct() {
    const [products, setProducts] = useState(productsMock);
    const [orders, setOrders] = useState(ordersMock);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("lowToHigh");
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 5;

    const totalProducts = products.length;
    const outOfStockCount = products.filter((p) => p.status === "Out of stock").length;
    const pendingCount = products.filter((p) => p.status === "Pending").length;

    const filteredOrders = orders
        .filter((o) => o.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sort === "lowToHigh") return a.price - b.price;
            if (sort === "highToLow") return b.price - a.price;
            return 0;
        });

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length);

    const handleStatusChange = (id, newStatus) => {
        setOrders((prev) =>
            prev.map((o) =>
                o.id === id ? { ...o, statusOrder: newStatus } : o
            )
        );
        setDropdownOpen(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img
                            src="/images/WholeCart_logo.png"
                            alt="WholeCart"
                            className="h-12 w-auto"
                        />
                        <span className="ml-4 text-gray-600">Admin username</span>
                    </div>
                    <button className="text-gray-800 font-medium">Log out</button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6">
                {/* Dashboard title + view website */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-bold text-gray-800">
                        Dashboard Admin - Order Place Product
                    </h1>
                    <button
                        className="text-green-600 hover:underline"
                        onClick={() => navigate("/")}
                    >
                        View website
                    </button>
                </div>

                {/* ✅ Top Stats */}
                <TopStats total={totalProducts} outOfStock={outOfStockCount} pending={pendingCount} />

                <div className="flex gap-6">
                    {/* Sidebar */}
                    <Sidebar />

                    {/* Order table */}
                    <div className="flex-1 bg-white p-4 rounded shadow">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg">Order Place Product</h3>
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
                                <th className="p-2">Image</th>
                                <th className="p-2">Product Name</th>
                                <th className="p-2">Categories</th>
                                <th className="p-2">Status Order</th>
                                <th className="p-2">Price</th>
                                <th className="p-2">Created at</th>
                                <th className="p-2">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedOrders.map((o) => (
                                <tr key={o.id} className="border-b hover:bg-gray-50">
                                    <td className="p-2">
                                        <img
                                            src={o.image}
                                            alt={o.name}
                                            className="w-12 h-12 object-contain"
                                        />
                                    </td>
                                    <td className="p-2">{o.name}</td>
                                    <td className="p-2">{o.category}</td>
                                    <td className="p-2">
                                        {o.statusOrder === "Pending" && (
                                            <span className="px-2 py-1 rounded text-white bg-yellow-500">
                          Pending
                        </span>
                                        )}
                                        {o.statusOrder === "Fulfilled" && (
                                            <span className="px-2 py-1 rounded text-white bg-green-600">
                          Fulfilled
                        </span>
                                        )}
                                        {o.statusOrder === "Cancel" && (
                                            <span className="px-2 py-1 rounded text-white bg-red-600">
                          Cancel
                        </span>
                                        )}
                                    </td>
                                    <td className="p-2">${o.price}</td>
                                    <td className="p-2">{o.createdAt}</td>
                                    <td className="p-2 relative">
                                        {o.statusOrder === "Pending" && (
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
                            Showing {endItem} from {filteredOrders.length}
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
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                    (page) => (
                                        <button
                                            key={page}
                                            className={`px-2 py-1 border rounded ${
                                                page === currentPage ? "bg-green-600 text-white" : ""
                                            }`}
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}
                                <button
                                    className="px-2 py-1 border rounded"
                                    onClick={() =>
                                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                                    }
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
