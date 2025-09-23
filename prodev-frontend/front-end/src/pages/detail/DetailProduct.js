// DetailProductPage.jsx
"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { Heart } from "lucide-react";
import { CartContext } from "../../AppLayout"; // <-- import CartContext

export default function DetailProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchCart } = useContext(CartContext); // <-- ดึง fetchCart จาก context

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    const token = localStorage.getItem("token");

    // Fetch product by ID
    useEffect(() => {
        fetch(`${BACKEND_URL}/api/products/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Product not found");
                return res.json();
            })
            .then(data => {
                const fullImages = data.images?.map(img =>
                    img.startsWith("http") ? img : `${BACKEND_URL}${img}`
                );
                setProduct({ ...data, images: fullImages });
            })
            .catch(err => {
                console.error(err);
                navigate("/");
            });

        // Fetch all products for related items
        fetch(`${BACKEND_URL}/api/products/all`)
            .then(res => res.json())
            .then(data => {
                setRelatedProducts(
                    data.map(p => ({
                        ...p,
                        images: p.images?.map(img =>
                            img.startsWith("http") ? img : `${BACKEND_URL}${img}`
                        ),
                    }))
                );
            })
            .catch(err => console.error(err));
    }, [id, navigate]);

    // Fetch favorite status
    useEffect(() => {
        const fetchFavoriteStatus = async () => {
            if (!token || !product) return;
            try {
                const res = await fetch(`${BACKEND_URL}/api/favorites`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Failed to fetch favorites");
                const data = await res.json();
                setIsFavorite(data.some(fav => fav.id === product.id));
            } catch (err) {
                console.error(err);
            }
        };
        fetchFavoriteStatus();
    }, [product, token]);

    // Add to cart
    const addToCart = async (productId, qty) => {
        if (!token) {
            alert("❌ Please login first!");
            return;
        }
        try {
            const res = await fetch(`${BACKEND_URL}/api/cart/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ productId, qty }),
            });
            if (!res.ok) throw new Error("Failed to add to cart");
            const data = await res.json();
            console.log("Added to cart:", data);
            alert(`✅ Added ${qty} item(s) to cart!`);
            setQuantity(1);
            fetchCart(); // update cart realtime
        } catch (err) {
            console.error(err);
            alert("❌ Cannot add to cart: " + err.message);
        }
    };

    // Toggle favorite
    const toggleFavorite = async () => {
        if (!token) {
            alert("❌ Please login first!");
            return;
        }
        try {
            const res = await fetch(`${BACKEND_URL}/api/favorites/toggle`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ productId: product.id }),
            });
            if (!res.ok) throw new Error("Failed to toggle favorite");
            setIsFavorite(prev => !prev);
        } catch (err) {
            console.error(err);
            alert("❌ Cannot toggle favorite: " + err.message);
        }
    };

    if (!product) return <div className="text-center py-20">Loading product...</div>;

    return (
        <main className="min-h-screen max-w-7xl mx-auto px-6 py-8">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500 mb-6">
                <span className="cursor-pointer hover:text-green-600" onClick={() => navigate("/")}>
                    Home
                </span>{" "}
                / {product.category} /{" "}
                <span className="text-gray-800">{product.name}</span>
            </div>

            {/* Product Section */}
            <div className="flex flex-col lg:flex-row gap-10">
                <div className="flex flex-col gap-3">
                    <img
                        src={product.images?.[0] || "/images/no-image.png"}
                        alt={product.name}
                        className="w-96 h-96 object-contain border rounded"
                    />
                    <div className="flex gap-2">
                        {product.images?.slice(0, 3).map((img, i) => (
                            <img key={i} src={img} alt={`thumb-${i}`} className="w-24 h-24 object-contain border rounded" />
                        ))}
                    </div>
                </div>

                <div className="flex-1">
                    <p className="text-green-600 text-sm font-medium mb-1">{product.category}</p>
                    <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>

                    <hr className="my-4" />

                    <p className="text-2xl text-gray-800 mb-6">฿{product.price}</p>

                    {/* Quantity */}
                    <div className="mb-4 flex items-center gap-4">
                        <button onClick={() => setQuantity(q => (q > 1 ? q - 1 : 1))} className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-400 text-lg hover:bg-gray-100">-</button>
                        <span className="text-lg font-medium">{quantity}</span>
                        <button onClick={() => setQuantity(q => q + 1)} className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-400 text-lg hover:bg-gray-100">+</button>
                    </div>

                    {/* Add to Cart & Favorite */}
                    <div className="flex items-center gap-3 mb-6">
                        <button onClick={() => addToCart(product.id, quantity)} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Add to cart</button>

                        <button
                            onClick={toggleFavorite}
                            aria-label="Favorite"
                            data-testid="favorite-btn"
                            className={`px-3 py-2 rounded transition-colors ${isFavorite ? "bg-green-600" : "border hover:bg-gray-100"}`}>
                            <Heart className={`w-5 h-5 ${isFavorite ? "text-white" : "text-gray-600"}`} />
                        </button>
                    </div>

                    <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Product code:</span> P{product.id.toString().padStart(5, "0")}</p>
                        <p className="text-green-600"><span className="font-medium">In stock:</span> {product.quantity ?? 0}</p>
                        <p><span className="font-medium">Type:</span> {product.category}</p>
                        <p><span className="font-medium">Shipping:</span> 01/01/2025</p>
                    </div>

                    <hr className="my-6" />

                    <div>
                        <h3 className="font-semibold text-lg mb-2">Product Details</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
                    </div>
                </div>
            </div>

            {/* Related Items */}
            <div className="mt-12">
                <h3 className="text-xl font-semibold mb-6">Related Items</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {relatedProducts.filter(p => p.category === product.category && p.id !== product.id).map(p => (
                        <div key={p.id} className="border rounded-lg overflow-hidden flex flex-col transition hover:shadow-lg hover:border-green-600 cursor-pointer" onClick={() => navigate(`/product/detail/${p.id}`)}>
                            <img src={p.images?.[0] || "/images/no-image.png"} alt={p.name} className="w-full h-40 object-contain p-4" />
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="text-sm font-medium mb-2 line-clamp-2">{p.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">{p.category}</p>
                                <div className="mt-auto flex items-center justify-between">
                                    <p className="text-gray-800 font-semibold">฿{p.price}</p>
                                    <button className="bg-green-600 text-white px-3 py-1 rounded-md text-sm" onClick={(e) => { e.stopPropagation(); addToCart(p.id, 1); }}>+ Add</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
