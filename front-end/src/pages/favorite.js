"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FavoriteListPage() {
    const navigate = useNavigate();

    const [favorites, setFavorites] = useState([
        { id: 1, name: "Be Nice Shower Cream, Perfect Elastic Formula, 450 ml.", price: 109, image: "/images/products/showercream.png", inStock: true },
        { id: 2, name: "Protex Lavender Ice Freeze Soap Bar 60 g.", price: 57, image: "/images/products/protex.png", inStock: false },
        { id: 3, name: "KFC BamBam BOX Menu TheBox special", price: 159, image: "/images/products/kfc.png", inStock: true },
        { id: 4, name: "Chocolate Chip Cookie", price: 49, image: "/images/products/protex.png", inStock: true },
        { id: 5, name: "iPhone 15", price: 999, image: "/images/products/kfc.png", inStock: true },
        { id: 6, name: "Modern Sofa", price: 1200, image: "/images/products/showercream.png", inStock: true },
        { id: 7, name: "Shampoo Set", price: 89, image: "/images/products/protex.png", inStock: true },
    ]);

    const removeFavorite = (id) => setFavorites(prev => prev.filter(item => item.id !== id));
    const addToCart = (item) => alert(`${item.name} added to cart!`);

    // Pagination
    const itemsPerPage = 5;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(favorites.length / itemsPerPage);
    const paginatedFavorites = favorites.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <main className="min-h-screen max-w-7xl mx-auto px-6 py-10">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500 mb-4">
                <span
                    className="cursor-pointer hover:text-green-600"
                    onClick={() => navigate("/")}
                >
                    Home
                </span>{" "}
                / My Favorite List
            </div>

            {/* Title */}
            <h1 className="text-2xl font-semibold mb-1">My Favorite List</h1>
            <p className="text-gray-500 mb-6">
                There are {favorites.length} product{favorites.length > 1 ? "s" : ""} in my favorite list.
            </p>

            {/* Favorite Table */}
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
                            <td className="px-4 py-3 text-sm">${item.price.toFixed(2)}</td>
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        <button
                            className="px-3 py-1 border rounded"
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1">{currentPage} / {totalPages}</span>
                        <button
                            className="px-3 py-1 border rounded"
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
