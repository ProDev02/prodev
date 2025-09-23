"use client";

import AdminNavbar from "./pages/admin/AdminNavbar";
import Sidebar from "./pages/admin/Sidebar";
import Topstats from "./pages/admin/Topstats";
import { useNavigate } from "react-router-dom";

export default function AdminLayout({ children, stats, showDashboardHeader = true }) {
    const navigate = useNavigate();
    // ดึง username จาก localStorage
    const username = localStorage.getItem("admin_username") || "Admin";

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Navbar */}
            <AdminNavbar />

            <main className="max-w-7xl mx-auto p-6">
                {/* Dashboard Header + View Website */}
                {showDashboardHeader && (
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-xl font-bold text-gray-800">Dashboard Admin</h1>
                        <button
                            className="text-green-600 hover:underline"
                            onClick={() => navigate("/")}
                        >
                            View website
                        </button>
                    </div>
                )}

                {/* Top Stats */}
                {stats && (
                    <Topstats
                        total={stats.total - stats.outOfStock}
                        outOfStock={stats.outOfStock}
                        pending={stats.pending}
                    />
                )}

                <div className="flex gap-6">
                    {/* Sidebar */}
                    <Sidebar />

                    {/* Content */}
                    <div className="flex-1">{children}</div>
                </div>
            </main>
        </div>
    );
}
