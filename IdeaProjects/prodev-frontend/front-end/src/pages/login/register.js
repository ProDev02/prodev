"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Footer from "../footer";

export default function SignUpPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [showModal, setShowModal] = useState(false);

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            if (res.ok) {
                const data = await res.json();
                // แสดง popup
                setShowModal(true);
            } else {
                const err = await res.text();
                setMessage("❌ Register failed: " + err);
            }
        } catch (error) {
            setMessage("❌ Error: " + error.message);
        }
    };

    const handleModalOk = () => {
        setShowModal(false);
        setUsername("");
        setEmail("");
        setPassword("");
        setMessage("");
    };

    return (
        <div className="min-h-screen flex flex-col bg-white font-sans relative">
            {/* Navbar */}
            <header className="w-full border-b py-4 px-6 flex justify-between items-center">
                <img src="/images/WholeCart_logo.png" alt="WholeCart" className="h-10 w-auto" />
                <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <a href="/signin" className="text-green-600 font-semibold hover:underline">
                        Sign in
                    </a>
                </p>
            </header>

            {/* Content */}
            <main className="flex flex-1 justify-center items-center px-6 py-10">
                <div className="grid md:grid-cols-2 gap-10 max-w-5xl w-full items-center">
                    {/* Left illustration */}
                    <div className="flex justify-center">
                        <img src="/images/register.png" alt="Register illustration" className="max-h-96 object-contain" />
                    </div>

                    {/* Right form */}
                    <div className="w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-2">
                            Get Start <span className="text-green-600">Shopping</span>
                        </h2>
                        <p className="text-gray-600 text-sm mb-6">
                            Welcome to WholeCart! Enter your details to create an account.
                        </p>

                        {/* Form */}
                        <form className="space-y-4" onSubmit={handleRegister}>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                                />
                            </div>

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

                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                            >
                                Register
                            </button>
                        </form>

                        {message && <p className="mt-4 text-sm text-center text-red-600">{message}</p>}

                        <p className="mt-4 text-sm text-gray-600 text-center">
                            By continuing, you agree to our{" "}
                            <a href="#" className="text-green-600 font-semibold hover:underline">
                                Terms of Service
                            </a>{" "}
                            &{" "}
                            <a href="#" className="text-green-600 font-semibold hover:underline">
                                Privacy Policy
                            </a>
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
                        <h3 className="text-xl font-bold mb-4 text-green-600">🎉 Registration Successful!</h3>
                        <p className="mb-6">Your account has been created successfully.</p>
                        <button
                            onClick={handleModalOk}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
