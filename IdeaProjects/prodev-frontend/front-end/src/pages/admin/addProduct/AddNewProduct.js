"use client";

import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminNavbar from "../AdminNavbar";

export default function AddNewProduct() {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [inStock, setInStock] = useState(false);
    const [quantity, setQuantity] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState([]); // ✅ เก็บไฟล์รูป
    const fileInputRef = useRef(null);
    const location = useLocation();
    const { username } = location.state || {};
    const navigate = useNavigate();

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    // handle เลือกรูป
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));
        setImages((prev) => [...prev, ...newImages]);
    };

    // handle ลบ
    const handleRemoveImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    // ✅ handle submit
    const handleSubmit = async () => {
        try {
            const formData = new FormData();
            formData.append("name", title);
            formData.append("statusStock", inStock ? "In stock" : "Out of stock");
            if (inStock) {
                formData.append("quantity", quantity);
            }
            formData.append("price", price);
            formData.append("description", description);
            formData.append("category", category);
            images.forEach((img) => {
                formData.append("images", img.file);
            });

            const res = await fetch(`${BACKEND_URL}/api/products/add`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Failed to create product");
            }

            const data = await res.json();
            alert("✅ Product created successfully!");
            console.log("Created product:", data);

            navigate("/admin-dashboard", { state: { username } });
        } catch (err) {
            console.error(err);
            alert("❌ Error creating product");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Navbar */}
            <AdminNavbar username="Admin username" />

            {/* Main */}
            <main className="max-w-7xl mx-auto p-6">
                <h1 className="text-xl font-bold text-green-600 mb-4">Add New Product</h1>

                {/* Breadcrumb + Back Button */}
                <div className="flex justify-between items-center mb-6">
                    <p className="text-sm text-gray-500">
                        Dashboard / Add Products
                    </p>
                    <button
                        className="bg-gray-500 text-white px-4 py-1 rounded"
                        onClick={() => navigate("/admin-dashboard", { state: { username } })}
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

                        {/* Title + Categories in one row */}
                        <div className="grid grid-cols-2 gap-6 mb-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Product Name"
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>

                            {/* Categories */}
                            <div>
                                <label htmlFor="category" className="block text-sm text-gray-600 mb-1">Categories</label>
                                <select
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="">Product Categories</option>
                                    <option>Snack</option>
                                    <option>Food & Drink</option>
                                    <option>SmartPhone</option>
                                    <option>Furniture</option>
                                    <option>Shower</option>
                                    <option>Clothing</option>
                                    <option>Electronics</option>
                                </select>
                            </div>
                        </div>

                        {/* Status Stock Toggle */}
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-sm text-gray-600">Status Stock</span>
                            <button
                                aria-label="Status Stock"
                                onClick={() => setInStock(!inStock)}
                                className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                                    inStock ? "bg-green-500" : "bg-red-500"
                                }`}
                            >
                                <div
                                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                                        inStock ? "translate-x-6" : ""
                                    }`}
                                />
                            </button>
                            <span
                                className={`text-sm font-medium ${
                                    inStock ? "text-green-600" : "text-red-600"
                                }`}
                            >
                                {inStock ? "In stock" : "Out of stock"}
                            </span>
                        </div>

                        {/* Quantity Input (show only if in stock) */}
                        {inStock && (
                            <div className="mb-4">
                                <label className="block text-sm text-gray-600 mb-1">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="Enter quantity"
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                        )}

                        {/* Product Images */}
                        <div className="mb-4">
                            <label htmlFor="images" className="block text-sm text-gray-600 mb-1">
                                Product Images
                            </label>

                            {/* input ซ่อน */}
                            <input
                                id="images"
                                type="file"
                                multiple
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                            />

                            {/* กรอบ Drop zone + แสดงรูป */}
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className="cursor-pointer border-dashed border-2 border-gray-300 rounded h-32 flex items-center justify-center text-gray-400 hover:bg-gray-100 relative"
                            >
                                {images.length === 0 ? (
                                    "Drop files here"
                                ) : (
                                    <div className="flex flex-wrap gap-2 p-2 overflow-auto w-full h-full">
                                        {images.map((img, index) => (
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
                        <label htmlFor="description" className="block text-sm text-gray-600 mb-1">
                            Product Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            rows="3"
                        ></textarea>
                    </div>

                    {/* Right Section */}
                    <div className="w-80">
                        <div className="bg-white border rounded p-6">
                            <h2 className="text-md font-semibold text-gray-700 mb-4">
                                Product Price
                            </h2>
                            <label className="block text-sm text-gray-600 mb-1">
                                Sale Price
                            </label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="$0.00"
                                className="w-full border rounded px-3 py-2 mb-4"
                            />
                            <button
                                onClick={handleSubmit}
                                className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
                            >
                                Create Product
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
