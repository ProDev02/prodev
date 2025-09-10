"use client";

import { useNavigate } from "react-router-dom";

export default function AdminNavbar() {
    const navigate = useNavigate();
    // ดึง username จาก localStorage
    const username = localStorage.getItem("admin_username") || "Admin";

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_email");
        localStorage.removeItem("admin_username");
        localStorage.removeItem("admin_role");
        navigate("/");
    };

    return (
        <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <img
                        src="/images/WholeCart_logo.png"
                        alt="WholeCart"
                        className="h-12 w-auto"
                    />
                    <span className="ml-4 text-gray-600">{username}</span>
                </div>
                <button
                    className="text-gray-800 font-medium"
                    onClick={handleLogout}
                >
                    Log out
                </button>
            </div>
        </header>
    );
}
