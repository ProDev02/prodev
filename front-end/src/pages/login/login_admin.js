"use client";

import { useState } from "react";
import { Eye, EyeOff, Shield } from "lucide-react";
import Footer from "../footer";

export default function SignInAdmin() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-white font-sans">
            {/* Navbar */}
            <header className="w-full border-b py-4 px-6 flex justify-between items-center">
                <img
                    src="/images/WholeCart_logo.png"
                    alt="WholeCart"
                    className="h-10 w-auto"
                />
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
                        <img
                            src="/images/login.png"
                            alt="Admin login illustration"
                            className="max-h-96 object-contain"
                        />
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
                        <form className="space-y-4">
                            <div>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                                />
                            </div>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
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
        </div>
    );
}
