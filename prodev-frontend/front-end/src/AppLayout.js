"use client";

import { useState, useEffect, createContext } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./pages/navbar";
import Footer from "./pages/footer";
import CartSidebarWrapper from "./pages/shopcart/CartSidebarWrapper";

export const CartContext = createContext(); // <-- export ออกมาที่นี่

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function AppLayout() {
    const [user, setUser] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cart, setCart] = useState({ items: [], total: 0 });

    // ดึง user จาก localStorage ตอนเริ่มต้น
    useEffect(() => {
        const token = localStorage.getItem("token");
        const username = localStorage.getItem("username");
        const email = localStorage.getItem("email");
        const role = localStorage.getItem("role");
        const userId = localStorage.getItem("userId")

        if (token && username && email && role && userId) {
            setUser({ token, username, email, role, userId });
        }
    }, []);

    // fetch cart
    const fetchCart = () => {
        if (user?.token) {
            fetch(`${BACKEND_URL}/api/cart/list`, {
                headers: { Authorization: `Bearer ${user.token}` },
            })
                .then(res => res.json())
                .then(data => setCart({ items: data.items || [], total: data.total || 0 }))
                .catch(err => console.error(err));
        }
    };

    useEffect(() => {
        if (user) fetchCart();
    }, [user]);

    const updateCartItem = (itemId, newQty) => {
        if (!user?.token) return;
        fetch(`${BACKEND_URL}/api/cart/update/${itemId}?qty=${newQty}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${user.token}` },
        })
            .then(res => res.json())
            .then(updatedCart => setCart({ items: updatedCart.items, total: updatedCart.total }))
            .catch(err => console.error(err));
    };

    const increaseQty = (id) => {
        const item = cart.items.find(i => i.id === id);
        if (!item) return;
        if (item.quantity + 1 > item.stock) return;
        updateCartItem(id, item.quantity + 1);
    };

    const decreaseQty = (id) => {
        const item = cart.items.find(i => i.id === id);
        if (!item) return;
        const newQty = Math.max(item.quantity - 1, 1);
        updateCartItem(id, newQty);
    };

    const removeItem = (id) => {
        updateCartItem(id, 0);
    };

    return (
        <CartContext.Provider value={{ cart, fetchCart }}>
            <div className="font-sans bg-white relative">
                <div className={`${isCartOpen ? "blur-sm pointer-events-none" : ""} transition-all duration-300`}>
                    <Navbar
                        cartItems={cart.items}
                        onCartOpen={() => setIsCartOpen(true)}
                        user={user}
                        setUser={setUser}
                    />
                    <Outlet />
                    <Footer />
                </div>

                <CartSidebarWrapper
                    isCartOpen={isCartOpen}
                    onClose={() => setIsCartOpen(false)}
                    cartItems={cart.items}
                    increaseQty={increaseQty}
                    decreaseQty={decreaseQty}
                    removeItem={removeItem}
                    total={cart.total}
                    user={user}
                    refreshCart={fetchCart}
                />
            </div>
        </CartContext.Provider>
    );
}
