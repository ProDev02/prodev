import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import OrderTab from "../pages/shopcart/OrderSidebar"; // ปรับ path ให้ตรง
import "@testing-library/jest-dom";

// ✅ Mock fetch
beforeEach(() => {
    global.fetch = jest.fn();
});

afterEach(() => {
    jest.clearAllMocks();
});

// ✅ Mock localStorage
const mockToken = "mock-token";
beforeEach(() => {
    Storage.prototype.getItem = jest.fn(() => mockToken);
});

// ✅ Suppress React Router warnings
beforeAll(() => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterAll(() => {
    console.warn.mockRestore();
});

describe("OrderTab", () => {
    const mockOrders = [
        {
            id: 1,
            name: "Product A",
            category: "Category 1",
            quantity: 2,
            price: 50,
            status: "PENDING",
            image: "/img1.png",
        },
        {
            id: 2,
            name: "Product B",
            category: "Category 2",
            quantity: 1,
            price: 100,
            status: "FULFILLED",
            image: "/img2.png",
        },
    ];

    test("renders orders fetched from API", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockOrders,
        });

        render(<OrderTab />);

        // รอ fetch และ render
        const productAContainer = await screen.findByText("Product A");
        const productBContainer = await screen.findByText("Product B");

        // ใช้ closest div ของแต่ละ order (หรือ parent element ที่เหมาะสม)
        const productAWrapper = productAContainer.closest("div");
        const productBWrapper = productBContainer.closest("div");

        expect(within(productAWrapper).getByText("Product A")).toBeInTheDocument();
        expect(within(productBWrapper).getByText("Product B")).toBeInTheDocument();

        // ตรวจราคาคูณ quantity โดย within container ของ order
        expect(within(productAWrapper).getByText("$100")).toBeInTheDocument(); // 50*2
        expect(within(productBWrapper).getByText("$100")).toBeInTheDocument(); // 100*1

        // ตรวจปุ่ม Receive เฉพาะ FULFILLED
        expect(within(productBWrapper).getByText("Receive")).toBeInTheDocument();
    });

    test("search filters orders by name", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockOrders,
        });

        render(<OrderTab />);

        await screen.findByText("Product A");

        const searchInput = screen.getByPlaceholderText("Search orders...");
        fireEvent.change(searchInput, { target: { value: "Product B" } });

        expect(screen.queryByText("Product A")).not.toBeInTheDocument();
        expect(screen.getByText("Product B")).toBeInTheDocument();
    });

    test("handles receiving fulfilled order", async () => {
        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockOrders,
            })
            .mockResolvedValueOnce({ ok: true }); // สำหรับ PATCH /receive

        render(<OrderTab />);
        await screen.findByText("Product B");

        const receiveButton = screen.getByText("Receive");
        fireEvent.click(receiveButton);

        await waitFor(() =>
            expect(screen.queryByText("Product B")).not.toBeInTheDocument()
        );

        // Product A ยังอยู่
        expect(screen.getByText("Product A")).toBeInTheDocument();
    });

    test("shows empty message when no orders", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        render(<OrderTab />);
        expect(await screen.findByText("📦 You have no orders yet.")).toBeInTheDocument();
    });

    test("handles fetch error gracefully", async () => {
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        fetch.mockResolvedValueOnce({ ok: false });

        render(<OrderTab />);
        await waitFor(() => expect(consoleErrorSpy).toHaveBeenCalled());
        consoleErrorSpy.mockRestore();
    });

    test("handles receive error gracefully", async () => {
        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockOrders,
            })
            .mockResolvedValueOnce({ ok: false }); // PATCH /receive ล้มเหลว

        window.alert = jest.fn();
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        render(<OrderTab />);
        await screen.findByText("Product B");

        fireEvent.click(screen.getByText("Receive"));
        await waitFor(() =>
            expect(window.alert).toHaveBeenCalledWith("Failed to delete order")
        );

        consoleErrorSpy.mockRestore();
    });
});
