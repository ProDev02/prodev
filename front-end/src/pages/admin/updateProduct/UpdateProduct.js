"use client";

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function UpdateProduct() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // mock product data ตรง ๆ
    const [product, setProduct] = useState({
        title: "Be Nice Shower Cream",
        description: "Perfect Elastic Formula 450ml",
        price: 109,
        inStock: true,
        quantity: 20,
        images: [{ url: "/images/products/showercream.png" }],
    });

    // handle อัปโหลดรูปใหม่
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));
        setProduct((prev) => ({
            ...prev,
            images: [...prev.images, ...newImages],
        }));
    };

    // handle ลบรูป
    const handleRemoveImage = (index) => {
        setProduct((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    // handle บันทึก (mock)
    const handleSave = () => {
        console.log("Updated product:", product);
        navigate("/admin-dashboard"); // กลับไปหน้า dashboard
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img
                            src="/images/WholeCart_logo.png"
                            alt="WholeCart"
                            className="h-12 w-auto"
                        />
                        <span className="ml-4 text-gray-600">Admin username</span>
                    </div>
                    <button className="text-gray-800 font-medium">Log out</button>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-7xl mx-auto p-6">
                <h1 className="text-xl font-bold text-green-600 mb-4">Update Product</h1>

                {/* Breadcrumb + Back Button */}
                <div className="flex justify-between items-center mb-6">
                    <p className="text-sm text-gray-500">Dashboard / Update Product / Mock</p>
                    <button
                        className="bg-gray-500 text-white px-4 py-1 rounded"
                        onClick={() => navigate("/admin-dashboard")}
                    >
                        Back to Product
                    </button>
                </div>

                <div className="flex gap-6">
                    {/* Left Section */}
                    <div className="flex-1 bg-white border rounded p-6">
                        <h2 className="text-md font-semibold text-gray-700 mb-4">
                            Product Information
                        </h2>

                        {/* Title */}
                        <label className="block text-sm text-gray-600 mb-1">Title</label>
                        <input
                            type="text"
                            value={product.title}
                            onChange={(e) => setProduct({ ...product, title: e.target.value })}
                            className="w-full border rounded px-3 py-2 mb-4"
                        />

                        {/* Status Stock Toggle */}
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-sm text-gray-600">Status Stock</span>
                            <button
                                onClick={() => setProduct({ ...product, inStock: !product.inStock })}
                                className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                                    product.inStock ? "bg-green-500" : "bg-red-500"
                                }`}
                            >
                                <div
                                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                                        product.inStock ? "translate-x-6" : ""
                                    }`}
                                />
                            </button>
                            <span
                                className={`text-sm font-medium ${
                                    product.inStock ? "text-green-600" : "text-red-600"
                                }`}
                            >
                {product.inStock ? "In stock" : "Out of stock"}
              </span>
                        </div>

                        {/* Quantity */}
                        {product.inStock && (
                            <div className="mb-4">
                                <label className="block text-sm text-gray-600 mb-1">Quantity</label>
                                <input
                                    type="number"
                                    value={product.quantity}
                                    onChange={(e) => setProduct({ ...product, quantity: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                        )}

                        {/* Product Images */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-1">Product Images</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className="cursor-pointer border-dashed border-2 border-gray-300 rounded h-32 flex items-center justify-center text-gray-400 hover:bg-gray-100 relative"
                            >
                                {product.images.length === 0 ? (
                                    "Drop files here"
                                ) : (
                                    <div className="flex flex-wrap gap-2 p-2 overflow-auto w-full h-full">
                                        {product.images.map((img, index) => (
                                            <div
                                                key={index}
                                                className="relative w-24 h-24 rounded-lg overflow-hidden border shadow"
                                            >
                                                <img
                                                    src={img.url}
                                                    alt="product"
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveImage(index);
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-600 text-white px-2 py-0.5 rounded text-xs"
                                                >
                                                    ลบ
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <label className="block text-sm text-gray-600 mb-1">Product Description</label>
                        <textarea
                            value={product.description}
                            onChange={(e) => setProduct({ ...product, description: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                            rows="3"
                        ></textarea>
                    </div>

                    {/* Right Section */}
                    <div className="w-80">
                        <div className="bg-white border rounded p-6">
                            <h2 className="text-md font-semibold text-gray-700 mb-4">Product Price</h2>
                            <label className="block text-sm text-gray-600 mb-1">Sale Price</label>
                            <input
                                type="number"
                                value={product.price}
                                onChange={(e) => setProduct({ ...product, price: e.target.value })}
                                className="w-full border rounded px-3 py-2 mb-4"
                            />
                            <button
                                onClick={handleSave}
                                className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
