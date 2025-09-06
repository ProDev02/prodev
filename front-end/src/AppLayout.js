import { useState, useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Navbar from "./pages/navbar";
import Footer from "./pages/footer";
import CartSidebarWrapper from "./pages/shopcart/CartSidebarWrapper";

export default function AppLayout() {
    const [user, setUser] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState([
        { id: 1, name: "Be Nice Shower Cream", price: 109, qty: 1, stock: 5, image: "/images/products/showercream.png", warning: false },
        { id: 2, name: "Protex Soap Bar", price: 19, qty: 3, stock: 3, image: "/images/products/protex.png", warning: false },
        { id: 3, name: "KFC BamBam BOX", price: 159, qty: 1, stock: 20, image: "/images/products/kfc.png", warning: false },
    ]);

    const location = useLocation();

    useEffect(() => {
        if (location.state?.username) {
            setUser({
                username: location.state.username,
                email: location.state.email,
                role: location.state.role,
                token: location.state.token,
            });
        }
    }, [location.state]);

    // Cart functions
    const increaseQty = (id) => {
        setCartItems(prev =>
            prev.map(item => {
                if (item.id === id) {
                    if (item.qty + 1 > item.stock) return { ...item, warning: true };
                    return { ...item, qty: item.qty + 1, warning: false };
                }
                return item;
            })
        );
    };

    const decreaseQty = (id) => {
        setCartItems(prev =>
            prev.map(item => item.id === id ? { ...item, qty: Math.max(item.qty - 1, 1), warning: false } : item)
        );
    };

    const removeItem = (id) => setCartItems(prev => prev.filter(item => item.id !== id));

    return (
        <div className="font-sans bg-white relative">


            <div className={`${isCartOpen ? "blur-sm pointer-events-none" : ""} transition-all duration-300`}>
                <Navbar cartItems={cartItems} onCartOpen={() => setIsCartOpen(true)} user={user} setUser={setUser} />
                <Outlet /> {/* หน้าเพจต่าง ๆ จะ render ตรงนี้ */}
                <Footer />
            </div>

            <CartSidebarWrapper
                isCartOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cartItems}
                increaseQty={increaseQty}
                decreaseQty={decreaseQty}
                removeItem={removeItem}
            />
        </div>
    );
}
