import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AddNewProduct from "../pages/admin/addProduct/AddNewProduct";

// ✅ Mock AdminNavbar แบบ default export
jest.mock("../pages/admin/AdminNavbar", () => ({
    __esModule: true,
    default: () => <div data-testid="mock-navbar">Mock Navbar</div>,
}));

// ✅ Mock useNavigate และ useLocation
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ state: { username: "test-admin" } }),
    };
});

// ✅ Mock fetch + alert
global.fetch = jest.fn();
window.alert = jest.fn();

// ✅ Mock URL.createObjectURL สำหรับ test image preview
beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => "mock-url");
});

describe("AddNewProduct Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    function setup() {
        return render(
            <MemoryRouter initialEntries={["/add-product"]}>
                <Routes>
                    <Route path="/add-product" element={<AddNewProduct />} />
                </Routes>
            </MemoryRouter>
        );
    }

    test("renders form fields correctly", () => {
        setup();

        expect(screen.getByTestId("mock-navbar")).toBeInTheDocument();
        expect(screen.getByText("Add New Product")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Product Name")).toBeInTheDocument();
        expect(screen.getByText("Product Images")).toBeInTheDocument();
        expect(screen.getByText("Create Product")).toBeInTheDocument();
    });

    test("can toggle stock status and show quantity input", () => {
        setup();

        const toggleButton = screen.getByText("Out of stock").previousSibling;
        fireEvent.click(toggleButton);

        expect(screen.getByText("In stock")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter quantity")).toBeInTheDocument();
    });

    test("can add and remove images", () => {
        setup();

        const fileInput = screen.getByLabelText("Product Images", { selector: "input" });

        const file = new File(["dummy"], "test.png", { type: "image/png" });
        fireEvent.change(fileInput, { target: { files: [file] } });

        // <img> จะ render ได้เพราะเรา mock createObjectURL
        expect(screen.getByAltText("product")).toBeInTheDocument();

        const removeButton = screen.getByText("ลบ");
        fireEvent.click(removeButton);

        expect(screen.queryByAltText("product")).not.toBeInTheDocument();
    });

    test("submits form successfully", async () => {
        setup();

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 1, name: "Test Product" }),
        });

        fireEvent.change(screen.getByPlaceholderText("Product Name"), { target: { value: "My Product" } });
        fireEvent.change(screen.getByPlaceholderText("$0.00"), { target: { value: "100" } });
        fireEvent.change(screen.getByRole("combobox", { name: "Categories" }), { target: { value: "Snack" } });
        fireEvent.change(screen.getByRole("textbox", { name: "Product Description" }), { target: { value: "Good product" } });

        fireEvent.click(screen.getByText("Create Product"));

        await waitFor(() =>
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/products/add"),
                expect.objectContaining({ method: "POST" })
            )
        );

        await waitFor(() =>
            expect(window.alert).toHaveBeenCalledWith("✅ Product created successfully!")
        );

        expect(mockNavigate).toHaveBeenCalledWith("/admin-dashboard", { state: { username: "test-admin" } });
    });

    test("shows error when API fails", async () => {
        setup();

        fetch.mockResolvedValueOnce({ ok: false });

        fireEvent.click(screen.getByText("Create Product"));

        await waitFor(() =>
            expect(window.alert).toHaveBeenCalledWith("❌ Error creating product")
        );
    });

    test("Back button navigates correctly", () => {
        setup();

        fireEvent.click(screen.getByText("Back to Product"));
        expect(mockNavigate).toHaveBeenCalledWith("/admin-dashboard", { state: { username: "test-admin" } });
    });
});
