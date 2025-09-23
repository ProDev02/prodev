// CartSidebarWrapper.js
"use client";

import { useState } from "react";
import CartSidebar from "./CartSidebar";

export default function CartSidebarWrapper(props) {
    const [activeTab, setActiveTab] = useState("shopcart");

    return <CartSidebar {...props} activeTab={activeTab} setActiveTab={setActiveTab} />;
}
