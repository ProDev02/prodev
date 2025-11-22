import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import CartSidebar from "../pages/shopcart/CartSidebar";
import { useNavigate } from "react-router-dom";

// Mock navigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => {
    const React = require("react");
    return {
        X: () => <span>X</span>,
        Minus: () => <span>-</span>,
        Plus: () => <span>+</span>,
        Trash2: () => <span>Remove</span>,
        List: () => <span>List</span>,
        CreditCard: () => <span>Card</span>,
        AlertTriangle: () => <span>!</span>,
        Gift: () => <span>Gift</span>,
    };
});

// Mock OrderTab
jest.mock("../pages/shopcart/OrderSidebar", () => () => <div>OrderTab Mock</div>);

// Mock OrderHistoryTab
jest.mock("../pages/shopcart/OrderHistoryTab", () => () => <div>OrderHistory Mock</div>);

describe("CartSidebar Component", () => {
    const cartItems = [
        { id: 1, productName: "Product 1", quantity: 2, price: 50, stock: 3, image: "/img1.png" },
        { id: 2, productName: "Product 2", quantity: 1, price: 100, stock: 1, image: "/img2.png" },
    ];

    const mockIncrease = jest.fn();
    const mockDecrease = jest.fn();
    const mockRemove = jest.fn();

    const setup = (customProps = {}) =>
        render(
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
                user={{ userId: 1 }}
                {...customProps}
            />
        );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renders cart items correctly", () => {
        setup();

        // เจาะแต่ละ cart item
        const product1Item = screen.getByText("Product 1").closest("div.flex.flex-col");
        const product2Item = screen.getByText("Product 2").closest("div.flex.flex-col");

        expect(product1Item).toBeInTheDocument();
        expect(product2Item).toBeInTheDocument();

        // ราคาสินค้าแต่ละชิ้น
        expect(within(product1Item).getByText("฿100")).toBeInTheDocument(); // 2*50
        expect(within(product2Item).getByText("฿100")).toBeInTheDocument(); // 1*100

        // ตรวจปุ่ม Payment
        expect(screen.getByText(/Payment ฿200/)).toBeInTheDocument();
    });

    test("increase quantity cannot exceed stock -> shows stock warning", () => {
        setup();

        const plusButtons = screen.getAllByText("+");
        fireEvent.click(plusButtons[1]); // Product 2 (stock = 1)

        expect(
            screen.getByText(/Cannot exceed available stock/)
        ).toBeInTheDocument();
    });

    test("decrease quantity calls decreaseQty", () => {
        setup();

        const minusButtons = screen.getAllByText("-");
        fireEvent.click(minusButtons[0]);

        expect(mockDecrease).toHaveBeenCalledWith(1);
    });

    test("remove item triggers removeItem", () => {
        setup();

        const removeButtons = screen.getAllByText("Remove");
        fireEvent.click(removeButtons[0]);

        expect(mockRemove).toHaveBeenCalledWith(1);
    });

    test("payment button navigates with correct state", () => {
        setup();

        const payBtn = screen.getByText(/Payment ฿200/);
        fireEvent.click(payBtn);

        expect(mockNavigate).toHaveBeenCalledWith("/payment", {
            state: { cartItems, total: 200 },
        });
    });

    test("shows empty cart message when cartItems = []", () => {
        setup({ cartItems: [] });

        expect(screen.getByText(/Your cart is empty/)).toBeInTheDocument();
    });

    test("renders Order tab", () => {
        setup({ activeTab: "order" });

        expect(screen.getByText("OrderTab Mock")).toBeInTheDocument();
    });

    test("renders Order History tab", () => {
        setup({ activeTab: "history" });

        expect(screen.getByText("OrderHistory Mock")).toBeInTheDocument();
    });

    test("coupon popup opens when clicking gift button", () => {
        setup();

        fireEvent.click(screen.getByText("Gift"));

        expect(screen.getByText("🎁 สุ่มคูปองพิเศษ")).toBeInTheDocument();
    });
});
