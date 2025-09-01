"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Footer from "../footer";

export default function SignUpPage() {
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
                        <img
                            src="/images/register.png"
                            alt="Register illustration"
                            className="max-h-96 object-contain"
                        />
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
                        <form className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                                />
                            </div>

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

                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                            >
                                Register
                            </button>
                        </form>

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
        </div>
    );
}
