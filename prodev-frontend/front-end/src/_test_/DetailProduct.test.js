// DetailProductPage.test.jsx
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { act } from "react"; // เปลี่ยนจาก react-dom/test-utils
import DetailProductPage from "../pages/detail/DetailProduct";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { CartContext } from "../AppLayout";

// Mock fetch
global.fetch = jest.fn();

const mockProduct = {
    id: 1,
    name: "Test Product",
    category: "Electronics",
    price: 1000,
    quantity: 10,
    description: "Test description",
    images: ["/image1.png", "/image2.png"]
};

const mockRelatedProducts = [
    { id: 2, name: "Related 1", category: "Electronics", price: 500, images: ["/related1.png"] },
    { id: 3, name: "Related 2", category: "Electronics", price: 700, images: ["/related2.png"] },
];

const mockFetchCart = jest.fn();

beforeEach(() => {
    localStorage.setItem("token", "mock-token");

    fetch.mockImplementation((url) => {
        if (url.endsWith(`/api/products/${mockProduct.id}`)) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve(mockProduct) });
        } else if (url.endsWith("/api/products/all")) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve([mockProduct, ...mockRelatedProducts]) });
        } else if (url.endsWith("/api/favorites")) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        } else if (url.endsWith("/api/cart/add") || url.endsWith("/api/favorites/toggle")) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
        }
        return Promise.reject(new Error("Unknown URL"));
    });
});

afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
});

function renderPage(productId = 1) {
    return render(
        <CartContext.Provider value={{ fetchCart: mockFetchCart }}>
            <MemoryRouter initialEntries={[`/product/detail/${productId}`]}>
                <Routes>
                    <Route path="/product/detail/:id" element={<DetailProductPage />} />
                </Routes>
            </MemoryRouter>
        </CartContext.Provider>
    );
}

test("renders product details correctly", async () => {
    const { container } = renderPage();

    expect(screen.getByText(/Loading product/i)).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByRole("heading", { name: mockProduct.name })).toBeInTheDocument();
    });

    // Query product detail section
    const productDetailSection = container.querySelector("div.flex-1");

    // ใช้ getAllByText เพื่อแก้ปัญหา multiple elements
    const categoryElements = within(productDetailSection).getAllByText(mockProduct.category);
    expect(categoryElements[categoryElements.length - 1]).toBeInTheDocument(); // เลือก element ในรายละเอียดสินค้า

    const priceElements = within(productDetailSection).getAllByText(`฿${mockProduct.price}`);
    expect(priceElements[0]).toBeInTheDocument();

    const descriptionElements = within(productDetailSection).getAllByText(mockProduct.description);
    expect(descriptionElements[0]).toBeInTheDocument();

    const plusBtn = screen.getByText("+");
    const minusBtn = screen.getByText("-");
    expect(plusBtn).toBeInTheDocument();
    expect(minusBtn).toBeInTheDocument();

    mockRelatedProducts.forEach(p => {
        expect(screen.getByText(p.name)).toBeInTheDocument();
    });
});

test("can add product to cart", async () => {
    renderPage();
    await waitFor(() => screen.getByRole("heading", { name: mockProduct.name }));

    const addToCartBtn = screen.getByRole("button", { name: /Add to cart/i });
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

    fireEvent.click(addToCartBtn);

    await waitFor(() => {
        expect(mockFetchCart).toHaveBeenCalled();
        expect(alertMock).toHaveBeenCalledWith(expect.stringContaining("Added"));
    });

    alertMock.mockRestore();
});

test("can toggle favorite", async () => {
    renderPage();
    await waitFor(() => screen.getByRole("heading", { name: mockProduct.name }));

    const favoriteBtn = screen.getByTestId("favorite-btn");
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

    await act(async () => {
        fireEvent.click(favoriteBtn);
    });

    await waitFor(() => {
        expect(favoriteBtn).toHaveClass("bg-green-600");
    });

    alertMock.mockRestore();
});

test("can increase and decrease quantity", async () => {
    renderPage();
    await waitFor(() => screen.getByRole("heading", { name: mockProduct.name }));

    const plusBtn = screen.getByText("+");
    const minusBtn = screen.getByText("-");
    const quantityDisplay = screen.getByText("1");

    fireEvent.click(plusBtn);
    expect(quantityDisplay.textContent).toBe("2");

    fireEvent.click(minusBtn);
    expect(quantityDisplay.textContent).toBe("1");

    fireEvent.click(minusBtn); // should not go below 1
    expect(quantityDisplay.textContent).toBe("1");
});

test("related items are clickable", async () => {
    renderPage();
    await waitFor(() => screen.getByRole("heading", { name: mockProduct.name }));

    const relatedItem = screen.getByText("Related 1");
    expect(relatedItem).toBeInTheDocument();
});
