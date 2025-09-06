// AdminNavbar.jsx
"use client";

import { useNavigate } from "react-router-dom";

export default function AdminNavbar({ username = "Admin username" }) {
    const navigate = useNavigate();

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
                    onClick={() => navigate("/")}
                >
                    Log out
                </button>
            </div>
        </header>
    );
}
