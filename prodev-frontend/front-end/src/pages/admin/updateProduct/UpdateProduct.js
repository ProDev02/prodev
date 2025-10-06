"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminNavbar from "../AdminNavbar";

// Modal Component
function Modal({ isOpen, title, message, type = "info", onClose }) {
    if (!isOpen) return null;

    const colors = {
        success: "bg-green-100 text-green-700",
        error: "bg-red-100 text-red-700",
        info: "bg-blue-100 text-blue-700",
    };

    const icons = {
        success: (
            <svg
                className="w-6 h-6 text-green-600 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        ),
        error: (
            <svg
                className="w-6 h-6 text-red-600 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        info: (
            <svg
                className="w-6 h-6 text-blue-600 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
        ),
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
                className="absolute inset-0 bg-black opacity-30"
                onClick={onClose}
            ></div>

            <div className={`relative w-96 p-6 rounded shadow-lg transform transition duration-300 scale-100 ${colors[type]} animate-fadeIn`}>
                <div className="flex items-center mb-2">
                    {icons[type]}
                    <h3 className="text-lg font-semibold">{title}</h3>
                </div>
                <p className="text-sm mb-4">{message}</p>
                <button
                    onClick={onClose}
                    className="bg-white text-gray-800 px-4 py-1 rounded hover:bg-gray-200"
                >
                    OK
                </button>
            </div>
        </div>
    );
}

// Add fade-in animation
const style = `
@keyframes fadeIn {
  from {opacity: 0; transform: translateY(-20px);}
  to {opacity: 1; transform: translateY(0);}
}
.animate-fadeIn { animation: fadeIn 0.3s ease-out; }
`;

export default function UpdateProduct() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const location = useLocation();
    const { productId, username } = location.state || {};

    const [product, setProduct] = useState({
        title: "",
        description: "",
        price: 0,
        inStock: true,
        quantity: 0,
        category: "",
        images: [],
    });

    const [loading, setLoading] = useState(false);

    const [modal, setModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
    });

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL.replace(/\/$/, '');

    useEffect(() => {
        if (!productId) return;

        fetch(`${BACKEND_URL}/api/products/${productId}`)
            .then((res) => {
                if (!res.ok) throw new Error("Product not found");
                return res.json();
            })
            .then((data) => {
                setProduct({
                    title: data.name || "",
                    description: data.description || "",
                    price: data.price || 0,
                    inStock: data.statusStock === "In stock",
                    quantity: data.statusStock === "In stock" ? data.quantity : 0, // ✅ แก้ตรงนี้
                    category: data.category || "",
                    images: (data.images || []).map((url) => ({
                        url: url.startsWith("http") ? url : `${BACKEND_URL}${url}`,
                        isNew: false,
                    })),
                });
            })
            .catch((err) => console.error("Error fetching product:", err));
    }, [productId]);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map((file) => {
            const imageUrl = URL.createObjectURL(file);
            return { file, url: imageUrl, isNew: true };
        });
        setProduct((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
    };

    const handleRemoveImage = (index) => {
        setProduct((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", product.title);
            formData.append("description", product.description);
            formData.append("price", product.price);
            formData.append("statusStock", product.inStock ? "In stock" : "Out of stock");

            // ✅ ส่ง quantity = 0 ถ้า out of stock
            formData.append(
                "quantity",
                product.inStock ? Number(product.quantity) : 0
            );

            formData.append("category", product.category);

            const existingImages = product.images
                .filter((img) => !img.isNew)
                .map((img) => img.url.replace(BACKEND_URL, "").replace(/^\/\//, "/"));
            formData.append("existingImages", JSON.stringify(existingImages));

            product.images.forEach((img) => {
                if (img.isNew && img.file) formData.append("images", img.file);
            });

            const res = await fetch(`${BACKEND_URL}/api/products/update/${productId}`, {
                method: "PUT",
                body: formData,
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
            }

            const updatedProduct = await res.json();
            console.log("Updated product:", updatedProduct);

            setModal({
                isOpen: true,
                title: "Success",
                message: "Product updated successfully!",
                type: "success",
            });

            setTimeout(() => {
                setModal({ ...modal, isOpen: false });
                navigate("/admin-dashboard", { state: { username } });
            }, 1500);

        } catch (err) {
            console.error("Error updating product:", err);
            setModal({
                isOpen: true,
                title: "Error",
                message: "Failed to update product. See console.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <style>{style}</style>
            <AdminNavbar username={username || "Admin"} />

            <main className="max-w-7xl mx-auto p-6">
                <h1 className="text-xl font-bold text-green-600 mb-4">Update Product</h1>

                <div className="flex justify-between items-center mb-6">
                    <p className="text-sm text-gray-500">Dashboard / Update Product</p>
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
                        <h2 className="text-md font-semibold text-gray-700 mb-4">Product Information</h2>

                        {/* Title + Categories */}
                        <div className="grid grid-cols-2 gap-6 mb-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={product.title}
                                    onChange={(e) => setProduct({ ...product, title: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Categories</label>
                                <select
                                    value={product.category || ""}
                                    onChange={(e) => setProduct({ ...product, category: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="">Select Category</option>
                                    <option value="Snack">Snack</option>
                                    <option value="Food & Drink">Food & Drink</option>
                                    <option value="SmartPhone">SmartPhone</option>
                                    <option value="Furniture">Furniture</option>
                                    <option value="Shower">Shower</option>
                                    <option value="Clothing">Clothing</option>
                                    <option value="Electronics">Electronics</option>
                                </select>
                            </div>
                        </div>

                        {/* Stock status and quantity */}
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-sm text-gray-600">Status Stock</span>
                            <button
                                onClick={() =>
                                    setProduct((prev) => ({
                                        ...prev,
                                        inStock: !prev.inStock,
                                        quantity: prev.inStock ? 0 : prev.quantity, // quantity = 0 ถ้า out of stock
                                    }))
                                }
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

                        {/* Quantity input */}
                        {product.inStock && (
                            <div className="mb-4">
                                <label className="block text-sm text-gray-600 mb-1">Quantity</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={product.quantity}
                                    onChange={(e) =>
                                        setProduct({ ...product, quantity: Number(e.target.value) })
                                    }
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
                        />
                    </div>

                    {/* Right Section */}
                    <div className="w-80">
                        <div className="bg-white border rounded p-6">
                            <h2 className="text-md font-semibold text-gray-700 mb-4">Product Price</h2>
                            <label className="block text-sm text-gray-600 mb-1">Sale Price</label>
                            <input
                                type="number"
                                name="price"
                                value={product.price}
                                onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                                className="w-full border rounded px-3 py-2 mb-4"
                            />
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className={`bg-green-600 text-white w-full py-2 rounded hover:bg-green-700 ${
                                    loading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal */}
            <Modal
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                onClose={() => setModal({ ...modal, isOpen: false })}
            />
        </div>
    );
}
