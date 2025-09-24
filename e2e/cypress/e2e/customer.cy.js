/// <reference types="cypress" />

describe("WholeCart E2E Flow (Mocked) - Complete", () => {
    const BASE_URL = "http://localhost:3000";

    // -------- Mock Data --------
    const mockProducts = [
        { id: 1, name: "Coffee", productName: "Coffee", price: 100, image: "/images/product/coffee.png", category: "Food & Drink", stock: 5, inStock: true },
        { id: 2, name: "Chocolate", productName: "Chocolate", price: 50, image: "/images/product/chocolate.png", category: "Snack", stock: 3, inStock: true },
    ];

    const mockCartResponse = {
        items: [
            { id: 1, productId: 1, productName: "Coffee", image: "/images/product/coffee.png", price: 100, quantity: 2, stock: 5, inStock: true },
            { id: 2, productId: 2, productName: "Chocolate", image: "/images/product/chocolate.png", price: 50, quantity: 1, stock: 3, inStock: true },
        ],
        total: 250,
    };

    const mockFavorites = [
        { id: 1, name: "Coffee", price: 100, image: "http://localhost:8080/images/product/coffee.png", category: "Food & Drink", inStock: true },
        { id: 2, name: "Chocolate", price: 50, image: "http://localhost:8080/images/product/chocolate.png", category: "Snack", inStock: true },
    ];

    // -------- Helper Functions --------
    const loginUserMock = () => {
        cy.window().then(win => {
            win.localStorage.setItem("token", "fake-user-jwt");
            win.localStorage.setItem("username", "testuser");
            win.localStorage.setItem("email", "testuser@example.com");
            win.localStorage.setItem("role", "USER");
            win.localStorage.setItem("userId", "1");

            // simulate cart context for Cypress
            win.__cartState = mockCartResponse;
        });
    };

    const loginAdminMock = () => {
        cy.window().then(win => {
            win.localStorage.setItem("admin_token", "fake-admin-jwt");
            win.localStorage.setItem("admin_role", "ADMIN");
            win.localStorage.setItem("admin_username", "admin");
            win.localStorage.setItem("admin_email", "admin@example.com");
        });
    };

    beforeEach(() => {
        cy.viewport(1280, 800);
        cy.clearLocalStorage();

        // -------- Mock Backend --------
        cy.intercept("GET", "**/api/products/all", { statusCode: 200, body: mockProducts }).as("getProducts");
        cy.intercept("GET", "**/api/products/1", { statusCode: 200, body: mockProducts[0] }).as("getProduct1");
        cy.intercept("GET", /\/api\/products\/search.*/, { statusCode: 200, body: mockProducts }).as("searchProducts");

        cy.intercept("POST", "**/api/cart/add", { statusCode: 200, body: mockCartResponse }).as("addCart");
        cy.intercept("GET", "**/api/cart/list", { statusCode: 200, body: mockCartResponse }).as("getCart");

        cy.intercept("GET", "**/api/favorites", { statusCode: 200, body: mockFavorites }).as("getFavorites");
        cy.intercept("DELETE", /\/api\/favorites\/\d+/, { statusCode: 200, body: { success: true } }).as("deleteFavorite");

        cy.intercept("POST", "**/api/orders/checkout", { statusCode: 200, body: { success: true, message: "Payment Successful!" } }).as("checkout");

        cy.intercept("POST", "**/api/auth/register", { statusCode: 200, body: { success: true, message: "🎉 Registration Successful!" } }).as("register");
        cy.intercept("POST", "**/api/auth/login", {
            statusCode: 200,
            body: { success: true, token: "fake-user-jwt", role: "USER", username: "testuser", email: "testuser@example.com", id: 1 }
        }).as("loginUser");
        cy.intercept("POST", "**/api/auth/admin-login", {
            statusCode: 200,
            body: { success: true, token: "fake-admin-jwt", role: "ADMIN", username: "admin", email: "admin@example.com" }
        }).as("loginAdmin");
    });

    // -------- Buyer Flows (unchanged) --------
    it("Shows homepage banners and categories", () => {
        cy.visit(BASE_URL + "/");
        cy.wait("@getProducts");
        cy.contains("Featured Categories").should("exist");
        cy.contains("Popular Products").should("exist");
    });

    it("Search and filter products", () => {
        cy.visit(BASE_URL + "/search");
        cy.get('input[placeholder="Search for products"]').type("Coffee");
        cy.wait("@searchProducts");
        cy.get(".grid > div").should("have.length.at.least", 1);
    });

    it("Register a new user", () => {
        cy.visit(BASE_URL + "/signup");
        cy.get('input[placeholder="Username"]').type("testuser");
        cy.get('input[placeholder="Email"]').type("testuser@example.com");
        cy.get('input[placeholder="Password"]').type("123456");
        cy.contains("Register").click();
        cy.wait("@register").its("response.statusCode").should("eq", 200);
    });

    it("Login as USER", () => {
        loginUserMock();
        cy.visit(BASE_URL + "/");
        cy.get("header").contains("testuser", { timeout: 10000 }).should("exist");
    });

    it("View product details and add to cart", () => {
        loginUserMock();
        cy.visit(BASE_URL + "/product/detail/1");
        cy.wait("@getProduct1");
        cy.get("h1").should("contain", "Coffee");
        cy.get("button").contains("Add to cart").click();
        cy.wait("@addCart").its("response.statusCode").should("eq", 200);
    });

    // -------- CartSidebar (simplified) --------
    it("Opens CartSidebar", () => {
        loginUserMock();
        cy.visit(BASE_URL + "/");
        cy.wait("@getCart");

        cy.get("[data-testid='cart-button']").click();
        cy.get("[data-testid='cart-sidebar']", { timeout: 15000 })
            .should("exist")
            .should("be.visible")
            .contains("Coffee");
        cy.get("[data-testid='cart-sidebar']").contains("Chocolate");
    });

    // -------- Checkout (simplified) --------
    it("Checkout from CartSidebar", () => {
        loginUserMock();
        cy.visit(BASE_URL + "/");
        cy.wait("@getCart");
        cy.get("[data-testid='cart-button']").click();
        cy.get("[data-testid='cart-sidebar']").contains("Payment").click();
        cy.url().should("include", "/payment");
        cy.get("button").contains("Pay Now!!").click();
        cy.wait("@checkout");
        cy.contains("Payment Successful!").should("exist"); });

    // -------- Favorites (simplified) --------
    it("Favorites remove works", () => {
        loginUserMock();
        cy.visit(BASE_URL + "/favorite");
        cy.wait("@getFavorites");

        cy.get("[data-testid='favorites-table']").contains("Coffee").should("exist");
        cy.get("[data-testid='favorites-table'] button.text-red-500").first().click();
        cy.wait("@deleteFavorite");
    });

    // -------- Admin Flow (unchanged) --------
    it("Login as ADMIN", () => {
        loginAdminMock();
        cy.visit(BASE_URL + "/admin-dashboard");
        cy.get("h1", { timeout: 10000 }).should("contain.text", "Dashboard Admin");
    });
});
