"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Trash2, Edit2 } from "lucide-react";
import AdminLayout from "../../AdminLayout";

export default function AdminDashboard() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("lowToHigh");
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 5;
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    // --- Get token / username from localStorage ---
    const token = localStorage.getItem("admin_token");
    const username = localStorage.getItem("admin_username");

    // --- Redirect to login if no token ---
    useEffect(() => {
        if (!token) navigate("/signup");
    }, [token, navigate]);

    // --- Fetch products ---
    useEffect(() => {
        if (!token) return;
        (async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/products/all`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Failed to fetch products");
                const data = await res.json();

                // --- map images to full URL ---
                const dataWithFullImages = data.map((p) => ({
                    ...p,
                    images: p.images?.map((img) =>
                        img.startsWith("http") ? img : `${BACKEND_URL}${img}`
                    ),
                }));

                setProducts(dataWithFullImages);
            } catch (err) {
                console.error(err);
                navigate("/signup");
            }
        })();
    }, [token, navigate]);

    // --- Stats ---
    const totalProducts = products.length;
    const outOfStockCount = products.filter((p) => p.statusStock === "Out of stock").length;
    const pendingCount = products.filter((p) => p.statusStock === "Pending").length;

    // --- Filter + Sort + Pagination ---
    const filteredProducts = products
        .filter((p) => p.statusStock === "In stock")
        .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => (sort === "lowToHigh" ? a.price - b.price : b.price - a.price));

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length);

    // --- Delete product ---
    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/products/delete/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Delete failed");

            setProducts((prev) => prev.filter((p) => p.id !== id));
            if (paginatedProducts.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <AdminLayout stats={{ total: totalProducts, outOfStock: outOfStockCount, pending: pendingCount }}>
            <div className="bg-white p-4 rounded shadow">
                <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg">All Products</h3>
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
                        <th className="p-2">Product ID</th>
                        <th className="p-2">Image</th>
                        <th className="p-2">Product Name</th>
                        <th className="p-2">Category</th>
                        <th className="p-2">Quantity</th>
                        <th className="p-2">Status Stock</th>
                        <th className="p-2">Price</th>
                        <th className="p-2">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedProducts.map((p) => (
                        <tr key={p.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">P{String(p.id).padStart(5, "0")}</td>
                            <td className="p-2">
                                {p.images?.[0] && (
                                    <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-contain" />
                                )}
                            </td>
                            <td className="p-2">{p.name}</td>
                            <td className="p-2">{p.category}</td>
                            <td className="p-2">{p.quantity ?? "-"}</td>
                            <td className="p-2">
                                    <span
                                        className={`px-2 py-1 rounded text-white ${
                                            p.statusStock === "In stock" ? "bg-green-600" : "bg-red-600"
                                        }`}
                                    >
                                        {p.statusStock}
                                    </span>
                            </td>
                            <td className="p-2">${p.price}</td>
                            <td className="p-2 relative">
                                <button
                                    data-cy={`product-actions-${p.id}`}
                                    className="p-1 rounded hover:bg-gray-100"
                                    onClick={() => setDropdownOpen(dropdownOpen === p.id ? null : p.id)}
                                >
                                    <MoreVertical size={20} />
                                </button>
                                {dropdownOpen === p.id && (
                                    <div className="absolute right-0 mt-2 w-36 bg-white border rounded shadow z-10">
                                        <button
                                            data-cy={`delete-product-${p.id}`}
                                            className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-red-600 hover:text-white"
                                            onClick={() => handleDelete(p.id)}
                                        >
                                            <Trash2 size={16} /> Delete
                                        </button>
                                        <button
                                            data-cy={`update-product-${p.id}`}
                                            className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-gray-200"
                                            onClick={() => navigate("/update/" + p.id, { state: { productId: p.id, username } })}
                                        >
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
                    Showing {startItem} - {endItem} of {filteredProducts.length}
                </div>

                {filteredProducts.length > ITEMS_PER_PAGE && (
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
                            data-cy="pagination-next"
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
