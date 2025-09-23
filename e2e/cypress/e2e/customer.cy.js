/// <reference types="cypress" />

describe("WholeCart E2E Flow (Mocked) - Complete", () => {
    const BASE_URL = "http://localhost:3000";

    const mockProducts = [
        { id: 1, name: "Coffee", price: 100, image: "/images/product/coffee.png", category: "Food & Drink", quantity: 5, inStock: true },
        { id: 2, name: "Chocolate", price: 50, image: "/images/product/chocolate.png", category: "Snack", quantity: 3, inStock: true },
    ];

    // -------- Helper Functions --------
    const loginUserMock = () => {
        cy.window().then(win => {
            win.localStorage.setItem("token", "fake-user-jwt");
            win.localStorage.setItem("username", "testuser");
            win.localStorage.setItem("email", "testuser@example.com");
            win.localStorage.setItem("role", "USER");
            win.localStorage.setItem("userId", "1");
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

        cy.intercept("POST", "**/api/cart/add", { statusCode: 200, body: { success: true } }).as("addCart");
        cy.intercept("GET", "**/api/cart/list", { statusCode: 200, body: mockProducts }).as("getCart");
        cy.intercept("GET", "**/api/favorites", { statusCode: 200, body: mockProducts }).as("getFavorites");
        cy.intercept("DELETE", /\/api\/favorites\/\d+/, { statusCode: 200 }).as("deleteFavorite");
        cy.intercept("POST", "**/api/orders/checkout", { statusCode: 200, body: { success: true } }).as("checkout");

        cy.intercept("POST", "**/api/auth/register", { statusCode: 200, body: { success: true, message: "🎉 Registration Successful!" } }).as("register");
        cy.intercept("POST", "**/api/auth/login", { statusCode: 200, body: { success: true, token: "fake-user-jwt", role: "USER", username: "testuser", email: "testuser@example.com", id: 1 } }).as("loginUser");
        cy.intercept("POST", "**/api/auth/admin-login", { statusCode: 200, body: { success: true, token: "fake-admin-jwt", role: "ADMIN", username: "admin", email: "admin@example.com" } }).as("loginAdmin");
    });

    // -------- Buyer Flows --------
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
        cy.get("header").contains("testuser", { timeout: 6000 }).should("exist");
    });

    it("View product details and add to cart", () => {
        loginUserMock();
        cy.visit(BASE_URL + "/product/detail/1");
        cy.wait("@getProduct1");
        cy.get("h1").should("contain", "Coffee");
        cy.get("button").contains("Add to cart").click();
        cy.wait("@addCart").its("response.statusCode").should("eq", 200);
    });

    // -------- Cart Sidebar Flow --------
    it("Opens CartSidebar and shows products", () => {
        loginUserMock();
        cy.visit(BASE_URL + "/");
        cy.wait("@getProducts");

        cy.get("[data-testid='cart-button']").click({ force: true });
        cy.get("[data-testid='cart-sidebar']").should("be.visible");
        cy.wait("@getCart");

        cy.get("[data-testid='cart-sidebar']").contains("Coffee").should("exist");
        cy.get("[data-testid='cart-sidebar']").contains("Chocolate").should("exist");
    });

    // -------- Checkout Flow --------
    it("Performs checkout successfully from CartSidebar", () => {
        loginUserMock();
        cy.visit(BASE_URL + "/");
        cy.wait("@getProducts");

        cy.get("[data-testid='cart-button']").click({ force: true });
        cy.wait("@getCart");

        cy.get("[data-testid='cart-sidebar']").contains("Payment").click();
        cy.url().should("include", "/payment");

        cy.get("input[type='radio']").first().check({ force: true });
        cy.contains("Pay Now!!").click();
        cy.wait("@checkout").its("response.statusCode").should("eq", 200);
    });

    // -------- Favorites Flow --------
    it("Manages favorites page correctly", () => {
        loginUserMock();
        cy.visit(BASE_URL + "/favorite");
        cy.wait("@getFavorites");

        cy.get("[data-testid='favorites-table']").contains("Coffee").should("exist");

        cy.get("[data-testid='favorites-table'] button").contains("Add to cart").first().click();
        cy.wait("@addCart").its("response.statusCode").should("eq", 200);

        cy.get("[data-testid='favorites-table'] button").contains("Remove").first().click();
        cy.wait("@deleteFavorite").its("response.statusCode").should("eq", 200);
    });

    // -------- Admin Flow --------
    it("Login as ADMIN", () => {
        loginAdminMock();
        cy.visit(BASE_URL + "/admin-dashboard");
        cy.get("h1", { timeout: 6000 }).should("contain.text", "Dashboard Admin");
    });
});
