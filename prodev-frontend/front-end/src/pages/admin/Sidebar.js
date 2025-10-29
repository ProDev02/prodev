import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { username } = location.state || {};
    const { pathname } = useLocation();

    const [showWeeklyReport, setShowWeeklyReport] = useState(false);
    const [weeklyReport, setWeeklyReport] = useState(null);
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    const token = localStorage.getItem("admin_token");

    const fetchWeeklyReport = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/products/reports/weekly-stock`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch weekly report");
            const data = await res.json();
            setWeeklyReport(data);
            setShowWeeklyReport(true);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="w-56 bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-4">Products</h3>
            <ul className="space-y-2 text-gray-700">
                <li
                    className={`cursor-pointer px-2 py-1 rounded ${pathname === "/admin-dashboard" ? "bg-gray-200" : ""}`}
                    onClick={() => navigate("/admin-dashboard", { state: { username } })}
                >
                    All Products
                </li>
                <li
                    className={`cursor-pointer px-2 py-1 rounded ${pathname === "/out-of-stock" ? "bg-gray-200" : ""}`}
                    onClick={() => navigate("/out-of-stock", { state: { username } })}
                >
                    Out of stocks
                </li>
                <li
                    className={`cursor-pointer px-2 py-1 rounded ${pathname === "/order-product" ? "bg-gray-200" : ""}`}
                    onClick={() => navigate("/order-product", { state: { username } })}
                >
                    Order product
                </li>
            </ul>

            <button
                className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                onClick={() => navigate("/add-product", { state: { username } })}
            >
                + Add Products
            </button>

            <button
                className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                onClick={fetchWeeklyReport}
            >
                Weekly Stock Report
            </button>

            {/* --- Modal --- */}
            {showWeeklyReport && weeklyReport && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-start pt-10 z-50 overflow-y-auto">
                    <div className="bg-white rounded-xl p-6 w-[90%] max-w-[1200px] shadow-lg relative">
                        <h2 className="text-2xl font-bold mb-4 flex justify-between items-center text-blue-700">
                            Weekly Stock Report
                            <button
                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                                onClick={() => setShowWeeklyReport(false)}
                            >
                                ✖
                            </button>
                        </h2>

                        <div className="mb-6 flex justify-between gap-6 text-gray-800">
                            <div className="flex-1 text-center">
                                <p className="text-gray-700 font-semibold mb-1">Total Products</p>
                                <p className="text-3xl font-bold text-blue-600">{weeklyReport.totalProducts}</p>
                            </div>
                            <div className="flex-1 text-center">
                                <p className="text-red-700 font-semibold mb-1">Out of Stock</p>
                                <p className="text-3xl font-bold text-red-600">{weeklyReport.outOfStock}</p>
                            </div>
                            <div className="flex-1 text-center">
                                <p className="text-yellow-800 font-semibold mb-1">Low Stock (≤10)</p>
                                <p className="text-3xl font-bold text-yellow-600">{weeklyReport.lowStock}</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="bg-blue-100 text-blue-800">
                                    <th className="p-3 border">ID</th>
                                    <th className="p-3 border">Name</th>
                                    <th className="p-3 border">Category</th>
                                    <th className="p-3 border">Quantity</th>
                                    <th className="p-3 border">Status</th>
                                    <th className="p-3 border">Price</th>
                                    <th className="p-3 border">Created At</th>
                                    <th className="p-3 border">Image</th>
                                </tr>
                                </thead>
                                <tbody>
                                {weeklyReport.products.map((p) => (
                                    <tr key={p.id} className="border-b hover:bg-blue-50">
                                        <td className="p-2 border">{p.id}</td>
                                        <td className="p-2 border font-medium">{p.name}</td>
                                        <td className="p-2 border">{p.category}</td>
                                        <td className="p-2 border">{p.quantity}</td>
                                        <td className={`p-2 border ${p.statusStock === "Out of stock" ? "text-red-600" : "text-green-600"}`}>{p.statusStock}</td>
                                        <td className="p-2 border">${p.price.toFixed(2)}</td>
                                        <td className="p-2 border">{new Date(p.createdAt).toLocaleString()}</td>
                                        <td className="p-2 border">
                                            {p.images && p.images.length > 0 ? (
                                                <img
                                                    src={`${BACKEND_URL}${p.images[0]}`}
                                                    alt={p.name}
                                                    className="w-20 h-20 object-cover rounded"
                                                />
                                            ) : (
                                                <span className="text-gray-400">No Image</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
