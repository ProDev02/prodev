"use client";

import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Heart } from "lucide-react";

export default function DetailProductPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const productFromState = location.state?.product;
    const products = location.state?.products || [];

    const [product] = useState(
        productFromState || {
            id: 999,
            name: "Mock Product",
            desc: "This is a demo description.",
            price: 199,
            image: "/images/products/showercream.png",
            category: "Demo",
        }
    );

    const [isFavorite, setIsFavorite] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const addToCart = (item) => {
        console.log("Add to cart:", item, quantity);
        setQuantity(1);
    };

    return (
        <main className="min-h-screen max-w-7xl mx-auto px-6 py-8">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500 mb-6">
                <span
                    className="cursor-pointer hover:text-green-600"
                    onClick={() => navigate("/")}
                >
                    Home
                </span>{" "}
                / {product.category} /{" "}
                <span className="text-gray-800">{product.name}</span>
            </div>

            {/* Product Section */}
            <div className="flex flex-col lg:flex-row gap-10">
                {/* Left images */}
                <div className="flex flex-col gap-3">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-96 h-96 object-contain border rounded"
                    />
                    <div className="flex gap-2">
                        <img src={product.image} alt="thumb1" className="w-24 h-24 object-contain border rounded" />
                        <img src={product.image} alt="thumb2" className="w-24 h-24 object-contain border rounded" />
                        <img src={product.image} alt="thumb3" className="w-24 h-24 object-contain border rounded" />
                    </div>
                </div>

                {/* Right details */}
                <div className="flex-1">
                    <p className="text-green-600 text-sm font-medium mb-1">{product.category}</p>
                    <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>

                    <hr className="my-4" />

                    <p className="text-2xl text-gray-800 mb-6">${product.price.toFixed(2)}</p>

                    {/* Quantity row */}
                    <div className="mb-4 flex items-center gap-4">
                        <button
                            onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-400 text-lg hover:bg-gray-100"
                        >
                            -
                        </button>
                        <span className="text-lg font-medium">{quantity}</span>
                        <button
                            onClick={() => setQuantity((q) => q + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-400 text-lg hover:bg-gray-100"
                        >
                            +
                        </button>
                    </div>

                    {/* Add to Cart & Favorite */}
                    <div className="flex items-center gap-3 mb-6">
                        <button
                            onClick={() => addToCart(product)}
                            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                        >
                            Add to cart
                        </button>

                        <button
                            onClick={() => setIsFavorite((prev) => !prev)}
                            className={`px-3 py-2 rounded transition-colors ${isFavorite ? "bg-green-600" : "border hover:bg-gray-100"}`}
                        >
                            <Heart className={`w-5 h-5 ${isFavorite ? "text-white" : "text-gray-600"}`} />
                        </button>
                    </div>

                    {/* Product info */}
                    <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Product code:</span> P{product.id.toString().padStart(5, "0")}</p>
                        <p className="text-green-600"><span className="font-medium">In stock:</span> 2500</p>
                        <p><span className="font-medium">Type:</span> {product.category}</p>
                        <p><span className="font-medium">Shipping:</span> 01/01/2025</p>
                    </div>

                    <hr className="my-6" />

                    {/* Product Details */}
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Product Details</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">Benefits: {product.desc}</p>
                        <p className="text-sm text-gray-700">Unit: 1 unit</p>
                        <p className="text-sm text-gray-700">Seller: Demo / Official retailers</p>
                        <p className="text-xs text-gray-500 mt-2">
                            Disclaimer: Images are for reference only. Please check packaging for exact details.
                        </p>
                    </div>
                </div>
            </div>

            {/* Related Items */}
            <div className="mt-12">
                <h3 className="text-xl font-semibold mb-6">Related Items</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {products
                        .filter((p) => p.category === product.category && p.id !== product.id)
                        .map((p) => (
                            <div
                                key={p.id}
                                className="border rounded-lg overflow-hidden flex flex-col transition hover:shadow-lg hover:border-green-600"
                                onClick={() => navigate(`/product/mock`, { state: { product: p, products } })}
                            >
                                <img src={p.image} alt={p.name} className="w-full h-40 object-contain p-4" />
                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="text-sm font-medium mb-2 line-clamp-2">{p.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{p.category}</p>
                                    <div className="mt-auto flex items-center justify-between">
                                        <p className="text-gray-800 font-semibold">${p.price.toFixed(2)}</p>
                                        <button className="bg-green-600 text-white px-3 py-1 rounded-md text-sm">+ Add</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </main>
    );
}
