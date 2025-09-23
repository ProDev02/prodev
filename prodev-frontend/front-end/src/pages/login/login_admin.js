"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Shield } from "lucide-react";
import Footer from "../footer";
import { useNavigate } from "react-router-dom";

export default function SignInAdmin() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalText, setModalText] = useState("");
    const [modalType, setModalType] = useState("success"); // success / error
    const navigate = useNavigate();

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        // ตรวจสอบว่ามี admin login แล้วหรือยัง
        const token = localStorage.getItem("admin_token");
        const role = localStorage.getItem("admin_role");
        if (token && role === "ADMIN") {
            navigate("/admin-dashboard");
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                const data = await res.json();

                if (data.role === "ADMIN") {
                    // เก็บข้อมูล admin ใน localStorage
                    localStorage.setItem("admin_token", data.token);
                    localStorage.setItem("admin_email", data.email);
                    localStorage.setItem("admin_username", data.username);
                    localStorage.setItem("admin_role", data.role);

                    setModalType("success");
                    setModalText("🎉 Admin login successful! Redirecting...");
                    setShowModal(true);

                    setTimeout(() => {
                        setShowModal(false);
                        navigate("/admin-dashboard");
                    }, 1500);
                } else {
                    setModalType("error");
                    setModalText("❌ Only ADMIN can login here");
                    setShowModal(true);
                    setTimeout(() => setShowModal(false), 2000);
                }
            } else {
                const err = await res.text();
                setModalType("error");
                setModalText("❌ Login failed: " + err);
                setShowModal(true);
                setTimeout(() => setShowModal(false), 2000);
            }
        } catch (error) {
            setModalType("error");
            setModalText("❌ Error: " + error.message);
            setShowModal(true);
            setTimeout(() => setShowModal(false), 2000);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white font-sans relative">
            {/* Navbar */}
            <header className="w-full border-b py-4 px-6 flex justify-between items-center">
                <img src="/images/WholeCart_logo.png" alt="WholeCart" className="h-10 w-auto" />
                <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <a href="/signin-admin" className="text-green-600 font-semibold hover:underline">
                        Sign in
                    </a>
                </p>
            </header>

            {/* Content */}
            <main className="flex flex-1 justify-center items-center px-6 py-10">
                <div className="grid md:grid-cols-2 gap-10 max-w-5xl w-full items-center">
                    {/* Left illustration */}
                    <div className="flex justify-center">
                        <img src="/images/login.png" alt="Admin login illustration" className="max-h-96 object-contain" />
                    </div>

                    {/* Right form */}
                    <div className="w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                            <Shield className="text-gray-700" size={22} />
                            Sign in for admin to <span className="text-green-600">WholeCart</span>
                        </h2>
                        <p className="text-gray-600 text-sm mb-6">
                            Welcome back to WholeCart! Enter your email to get started.
                        </p>

                        {/* Form */}
                        <form className="space-y-4" onSubmit={handleLogin}>
                            <div>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                                />
                            </div>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-2.5 text-gray-500"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" className="rounded" />
                                    <span>Remember me</span>
                                </label>
                                <a href="#" className="text-green-600 hover:underline">
                                    Forgot password? <span className="font-medium">Reset it</span>
                                </a>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                            >
                                Sign in
                            </button>
                        </form>

                        <p className="mt-4 text-sm text-gray-600 text-center">
                            Don’t have an account?{" "}
                            <a href="/signup" className="text-green-600 font-semibold hover:underline">
                                Sign up
                            </a>
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />

            {/* Popup Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className={`bg-white rounded-lg shadow-lg p-6 w-80 text-center animate-fade-in
                        ${modalType === "success" ? "border-4 border-green-600" : "border-4 border-red-600"}`}>
                        <h3 className={`text-xl font-bold mb-4 ${modalType === "success" ? "text-green-600" : "text-red-600"}`}>
                            {modalText}
                        </h3>
                    </div>
                </div>
            )}
        </div>
    );
}
