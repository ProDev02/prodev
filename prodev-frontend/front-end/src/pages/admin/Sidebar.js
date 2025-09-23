import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { username } = location.state || {};
    const { pathname } = useLocation();

    return (
        <div className="w-56 bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-4">Products</h3>
            <ul className="space-y-2 text-gray-700">
                <li
                    className={`cursor-pointer px-2 py-1 rounded ${
                        pathname === "/admin-dashboard" ? "bg-gray-200" : ""
                    }`}
                    onClick={() =>
                        navigate("/admin-dashboard", { state: { username } })
                    }
                >
                    All Products
                </li>
                <li
                    className={`cursor-pointer px-2 py-1 rounded ${
                        pathname === "/out-of-stock" ? "bg-gray-200" : ""
                    }`}
                    onClick={() =>
                        navigate("/out-of-stock", { state: { username } })
                    }
                >
                    Out of stocks
                </li>
                <li
                    className={`cursor-pointer px-2 py-1 rounded ${
                        pathname === "/order-product" ? "bg-gray-200" : ""
                    }`}
                    onClick={() =>
                        navigate("/order-product", { state: { username }})
                    }
                >
                    Order product
                </li>
            </ul>
            <button className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                onClick={() =>
                    navigate("/add-product", { state: { username }})
                }
            >
                + Add Products
            </button>
        </div>
    );
}
