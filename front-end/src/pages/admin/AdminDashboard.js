"use client";

import { useState } from "react";
import { MoreVertical, Trash2, Edit2 } from "lucide-react";

const productsMock = [
    { id: 1, name: "Be Nice Shower Cream, Perfect Elastic Formula, 450 ml", category: "Shower", price: 109, status: "In stock", createdAt: "2024/08/27", image: "/images/products/showercream.png" },
    { id: 2, name: "Protex Lavender Ice Freeze Soap Bar 60 g", category: "Shower", price: 19, status: "In stock", createdAt: "2024/08/27", image: "/images/products/protex.png" },
    { id: 3, name: "Sample Product 3", category: "Bath", price: 50, status: "In stock", createdAt: "2024/08/28", image: "/images/products/showercream.png" },
    { id: 4, name: "Sample Product 4", category: "Shower", price: 75, status: "In stock", createdAt: "2024/08/29", image: "/images/products/protex.png" },
    { id: 5, name: "Sample Product 5", category: "Shower", price: 120, status: "In stock", createdAt: "2024/08/30", image: "/images/products/showercream.png" },
    { id: 6, name: "Sample Product 6", category: "Bath", price: 90, status: "In stock", createdAt: "2024/09/01", image: "/images/products/protex.png" },
    // สามารถเพิ่ม mock products เพิ่มเติม
];

export default function AdminDashboard() {
    const [products, setProducts] = useState(productsMock);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("lowToHigh");
    const [activeTab, setActiveTab] = useState("all");
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const ITEMS_PER_PAGE = 5;

    const filteredProducts = products
        .filter((p) => {
            if (activeTab === "outOfStock") return p.status !== "In stock";
            if (activeTab === "orderProduct") return p.status === "Order";
            return true;
        })
        .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sort === "lowToHigh") return a.price - b.price;
            if (sort === "highToLow") return b.price - a.price;
            return 0;
        });

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length);

    const handleDelete = (id) => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        if (paginatedProducts.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img src="/images/WholeCart_logo.png" alt="WholeCart" className="h-12 w-auto" />
                        <span className="ml-4 text-gray-600">Admin username</span>
                    </div>
                    <button className="text-gray-800 font-medium">Log out</button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6">
                {/* Dashboard summary */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 border rounded p-4 text-center">
                        <p className="text-gray-500">จำนวนสินค้าทั้งหมด</p>
                        <p className="text-blue-600 text-2xl font-bold">{products.length}</p>
                    </div>
                    <div className="flex-1 border rounded p-4 text-center">
                        <p className="text-gray-500">จำนวนสินค้าที่หมดสต็อก</p>
                        <p className="text-red-600 text-2xl font-bold">
                            {products.filter((p) => p.status !== "In stock").length}
                        </p>
                    </div>
                    <div className="flex-1 border rounded p-4 text-center">
                        <p className="text-gray-500">จำนวนสินค้ารออนุมัติ</p>
                        <p className="text-green-600 text-2xl font-bold">
                            {products.filter((p) => p.status === "Order").length}
                        </p>
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Sidebar */}
                    <div className="w-56 bg-white p-4 rounded shadow">
                        <h3 className="font-semibold mb-4">Products</h3>
                        <ul className="space-y-2 text-gray-700">
                            <li className={`cursor-pointer px-2 py-1 rounded ${activeTab === "all" ? "bg-gray-200" : ""}`} onClick={() => setActiveTab("all")}>All Products</li>
                            <li className={`cursor-pointer px-2 py-1 rounded ${activeTab === "outOfStock" ? "bg-gray-200" : ""}`} onClick={() => setActiveTab("outOfStock")}>Out of stocks</li>
                            <li className={`cursor-pointer px-2 py-1 rounded ${activeTab === "orderProduct" ? "bg-gray-200" : ""}`} onClick={() => setActiveTab("orderProduct")}>Order product</li>
                        </ul>
                        <button className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">+ Add Products</button>
                    </div>

                    {/* Product table */}
                    <div className="flex-1 bg-white p-4 rounded shadow">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg">All Product</h3>
                            <input type="text" placeholder="Search" className="border rounded px-2 py-1" value={search} onChange={(e) => setSearch(e.target.value)} />
                            <select value={sort} onChange={(e) => setSort(e.target.value)} className="border rounded px-2 py-1">
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
                                <th className="p-2">Status Stock</th>
                                <th className="p-2">Price</th>
                                <th className="p-2">Created at</th>
                                <th className="p-2">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedProducts.map((p) => (
                                <tr key={p.id} className="border-b hover:bg-gray-50">
                                    <td className="p-2"><img src={p.image} alt={p.name} className="w-12 h-12 object-contain" /></td>
                                    <td className="p-2">{p.name}</td>
                                    <td className="p-2">{p.category}</td>
                                    <td className="p-2"><span className={`px-2 py-1 rounded text-white ${p.status === "In stock" ? "bg-green-600" : "bg-red-600"}`}>{p.status}</span></td>
                                    <td className="p-2">${p.price}</td>
                                    <td className="p-2">{p.createdAt}</td>
                                    <td className="p-2 relative">
                                        <button className="p-1 rounded hover:bg-gray-100" onClick={() => setDropdownOpen(dropdownOpen === p.id ? null : p.id)}>
                                            <MoreVertical size={20} />
                                        </button>
                                        {dropdownOpen === p.id && (
                                            <div className="absolute right-0 mt-2 w-36 bg-white border rounded shadow z-10">
                                                <button className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-red-600 hover:text-white" onClick={() => handleDelete(p.id)}>
                                                    <Trash2 size={16} /> Delete
                                                </button>
                                                <button className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-gray-200">
                                                    <Edit2 size={16} /> Update
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        <div className="mt-2 text-sm text-gray-600">
                            Showing {startItem} to {endItem} from {filteredProducts.length}
                        </div>

                        {filteredProducts.length > ITEMS_PER_PAGE && (
                            <div className="mt-4 flex justify-end space-x-2 text-sm text-gray-600">
                                <button className="px-2 py-1 border rounded" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>Previous</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button key={page} className={`px-2 py-1 border rounded ${page === currentPage ? "bg-green-600 text-white" : ""}`} onClick={() => setCurrentPage(page)}>{page}</button>
                                ))}
                                <button className="px-2 py-1 border rounded" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
