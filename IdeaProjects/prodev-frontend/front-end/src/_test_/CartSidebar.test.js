import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CartSidebar from "../pages/shopcart/CartSidebar"; // ปรับ path ตามจริง
import { useNavigate } from "react-router-dom";

// ✅ Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}));

// ✅ Mock lucide-react icons (ไม่ต้อง render จริง)
jest.mock("lucide-react", () => {
    const React = require("react");
    return {
        X: (props) => <span>X</span>,
        Minus: (props) => <span>-</span>,
        Plus: (props) => <span>+</span>,
        Trash2: (props) => <span>Trash</span>,
        List: (props) => <span>List</span>,
        CreditCard: (props) => <span>Card</span>,
        AlertTriangle: (props) => <span>!</span>,
    };
});

// Mock OrderTab
jest.mock("../pages/shopcart/OrderSidebar", () => () => <div>OrderTab Mock</div>);

describe("CartSidebar", () => {
    const cartItems = [
        { id: 1, productName: "Product 1", quantity: 2, price: 50, stock: 3, image: "/img1.png" },
        { id: 2, productName: "Product 2", quantity: 1, price: 100, stock: 1, image: "/img2.png" },
    ];

    // ✅ Mock functions
    const mockIncrease = jest.fn((productId) => {
        const item = cartItems.find((c) => c.id === productId);
        if (!item) return;
        if (item.quantity >= item.stock) {
            // แทน alert ด้วยการ append div ลง DOM
            const warning = document.createElement("div");
            warning.textContent = "Cannot exceed available stock";
            document.body.appendChild(warning);
            return;
        }
        item.quantity += 1;
    });
    const mockDecrease = jest.fn();
    const mockRemove = jest.fn();

    const setup = (props = {}) => {
        return render(
            <CartSidebar
                isCartOpen={true}
                onClose={jest.fn()}
                cartItems={cartItems}
                increaseQty={mockIncrease}
                decreaseQty={mockDecrease}
                removeItem={mockRemove}
                activeTab="shopcart"
                setActiveTab={jest.fn()}
                total={200}
                {...props}
            />
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // เคลียร์ warning DOM
        document.body.querySelectorAll("div").forEach((el) => {
            if (el.textContent === "Cannot exceed available stock") el.remove();
        });
    });

    test("renders cart items and total", () => {
        setup();
        expect(screen.getByText("Product 1")).toBeInTheDocument();
        expect(screen.getByText("Product 2")).toBeInTheDocument();

        // ใช้ getAllByText สำหรับราคาที่ซ้ำ
        const prices = screen.getAllByText(/฿\d+/);
        expect(prices.length).toBeGreaterThanOrEqual(2);
        expect(prices[0]).toHaveTextContent("฿100");
        expect(prices[1]).toHaveTextContent("฿100");

        expect(screen.getByText(/Payment ฿200/)).toBeInTheDocument();
    });

    test("increase quantity with stock warning", () => {
        setup();

        const product2Plus = screen.getAllByText("+")[1];
        fireEvent.click(product2Plus);

        expect(screen.getByText(/Cannot exceed available stock/)).toBeInTheDocument();
    });

    test("decrease quantity calls decreaseQty", () => {
        setup();

        const product1Minus = screen.getAllByText("-")[0];
        fireEvent.click(product1Minus);
        expect(mockDecrease).toHaveBeenCalledWith(1);
    });

    test("remove item calls removeItem", () => {
        setup();

        const removeButtons = screen.getAllByText("Remove");
        fireEvent.click(removeButtons[0]);
        expect(mockRemove).toHaveBeenCalledWith(1);
    });

    test("payment button navigates with state", () => {
        setup();

        const paymentButton = screen.getByText(/Payment ฿200/);
        fireEvent.click(paymentButton);
        expect(mockNavigate).toHaveBeenCalledWith("/payment", { state: { cartItems, total: 200 } });
    });

    test("shows empty cart message", () => {
        setup({ cartItems: [] });
        expect(screen.getByText(/Your cart is empty/)).toBeInTheDocument();
    });

    test("renders Order tab correctly", () => {
        setup({ activeTab: "order" });
        expect(screen.getByText("OrderTab Mock")).toBeInTheDocument();
    });
});
