// FavoriteListPage.jsx
"use client";

import { useState, useEffect, useContext } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../AppLayout";

export default function FavoriteListPage() {
    const navigate = useNavigate();
    const { fetchCart } = useContext(CartContext);
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    const token = localStorage.getItem("token");

    const [favorites, setFavorites] = useState([]);

    // Fetch favorites from API
    // Fetch favorites from API
    useEffect(() => {
        if (!token) return;

        fetch(`${BACKEND_URL}/api/favorites`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                const updated = data.map(item => ({
                    ...item,
                    image: item.image
                        ? (item.image.startsWith('http') ? item.image : `${BACKEND_URL}${item.image}`)
                        : "/images/no-image.png" // placeholder
                }));
                setFavorites(updated);
            })
            .catch(err => console.error(err));
    }, [token]);


    // Add to cart
    const addToCart = async (item) => {
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
                body: JSON.stringify({ productId: item.id, qty: 1 }),
            });
            if (!res.ok) throw new Error("Failed to add to cart");
            fetchCart();
            alert(`✅ ${item.name} added to cart!`);
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    // Remove favorite
    const removeFavorite = async (id) => {
        if (!token) return;
        try {
            const res = await fetch(`${BACKEND_URL}/api/favorites/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error("Failed to remove favorite");
            setFavorites(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    // Pagination
    const itemsPerPage = 5;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(favorites.length / itemsPerPage);
    const paginatedFavorites = favorites.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <main className="min-h-screen max-w-7xl mx-auto px-6 py-10">
            <div className="text-sm text-gray-500 mb-4">
                <span className="cursor-pointer hover:text-green-600" onClick={() => navigate("/")}>Home</span> / My Favorite List
            </div>

            <h1 className="text-2xl font-semibold mb-1">My Favorite List</h1>
            <p className="text-gray-500 mb-6">
                There are {favorites.length} product{favorites.length > 1 ? "s" : ""} in my favorite list.
            </p>

            <div className="overflow-x-auto bg-white shadow rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-200">
                    <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Product</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Amount</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {paginatedFavorites.map(item => (
                        <tr key={item.id}>
                            <td className="px-4 py-3 flex items-center space-x-3">
                                <input type="checkbox" className="h-4 w-4 text-green-600" />
                                <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                                <span className="text-sm font-medium">{item.name}</span>
                            </td>
                            <td className="px-4 py-3 text-sm">฿{item.price}</td>
                            <td className="px-4 py-3">
                                {item.inStock
                                    ? <span className="px-2 py-1 text-xs font-medium text-white bg-green-600 rounded-full">In stock</span>
                                    : <span className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded-full">Out of stock</span>
                                }
                            </td>
                            <td className="px-4 py-3 flex items-center space-x-2">
                                {item.inStock
                                    ? <button onClick={() => addToCart(item)} className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">Add to cart</button>
                                    : <button className="px-3 py-1 bg-black text-white text-xs rounded cursor-not-allowed">Contact us</button>
                                }
                                <button onClick={() => removeFavorite(item.id)} className="text-red-500"><Trash2 size={16} /></button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        <button className="px-3 py-1 border rounded" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Previous</button>
                        <span className="px-3 py-1">{currentPage} / {totalPages}</span>
                        <button className="px-3 py-1 border rounded" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
                    </div>
                )}
            </div>
        </main>
    );
}
