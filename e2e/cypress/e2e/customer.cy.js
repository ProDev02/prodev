/// <reference types="cypress" />

describe("WholeCart E2E Flow (Real DB + Mocked Cart) - Complete", () => {
    const BASE_URL = Cypress.config("baseUrl");
    const API_BASE = Cypress.env("API_BASE");

    let createdUserIds = []; // เก็บ id ของ user ที่สร้างระหว่าง test

    // -------- Helper Functions --------
    const setUserToken = (token, user) => {
        cy.window().then((win) => {
            win.localStorage.setItem("token", token);
            win.localStorage.setItem("userId", user.id);
            win.localStorage.setItem("username", user.username);
            win.localStorage.setItem("email", user.email);
            win.localStorage.setItem("role", user.role);
        });
    };

    const loginUserOnce = (email, password) => {
        if (!Cypress.env('userToken')) {
            return cy.request({
                method: 'POST',
                url: `${API_BASE}/api/auth/login`,
                body: { email, password },
            }).then((res) => {
                expect(res.status).to.eq(200);
                const { token, id, username, email: userEmail, role } = res.body;
                Cypress.env('userToken', token);
                Cypress.env('userData', { id, username, email: userEmail, role });
            });
        }
        return cy.wrap(null);
    };

    const loginAdminOnce = () => {
        if (!Cypress.env('adminToken')) {
            return cy.request({
                method: 'POST',
                url: `${API_BASE}/api/auth/login`,
                body: { email: "admin@gmail.com", password: "111111" },
            }).then((res) => {
                expect(res.status).to.eq(200);
                const { token, id, username, email, role } = res.body;
                Cypress.env('adminToken', token);
                Cypress.env('adminUser', { id, username, email, role });
            });
        }
        return cy.wrap(null);
    };

    const registerAndLoginUser = (username, email, password) => {
        return cy.request({
            method: "POST",
            url: `${API_BASE}/api/auth/register`,
            body: { username, email, password },
            failOnStatusCode: false,
        }).then((res) => {
            expect(res.status).to.eq(200);
            const userId = res.body.id;
            createdUserIds.push(userId); // เก็บ id ของ user

            const { token, id, username: uname, email: userEmail, role } = res.body;

            setUserToken(token, { id, username: uname, email: userEmail, role });
        });
    };

    // -------- Before All: Login once --------
    before(() => {
        loginAdminOnce();
        loginUserOnce("test@gmail.com", "123456");
    });

    // -------- Before Each Test --------
    beforeEach(() => {
        cy.viewport(1280, 800);
        cy.clearLocalStorage();

        // set token จาก env
        if (Cypress.env('adminToken')) {
            const admin = Cypress.env('adminUser');
            cy.window().then(win => {
                win.localStorage.setItem("admin_token", Cypress.env('adminToken'));
                win.localStorage.setItem("admin_role", admin.role);
                win.localStorage.setItem("admin_username", admin.username);
                win.localStorage.setItem("admin_email", admin.email);
            });
        }

        if (Cypress.env('userToken')) {
            setUserToken(Cypress.env('userToken'), Cypress.env('userData'));
        }

        // Mock Products / Cart / Favorites
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

        cy.intercept("GET", "**/api/products/1", { statusCode: 200, body: mockProducts[0] }).as("getProduct1");

        cy.intercept("POST", "**/api/cart/add", { statusCode: 200, body: mockCartResponse }).as("addCart");
        cy.intercept("GET", "**/api/cart/list", { statusCode: 200, body: mockCartResponse }).as("getCart");

        cy.intercept("GET", "**/api/favorites", { statusCode: 200, body: mockFavorites }).as("getFavorites");
        cy.intercept("DELETE", /\/api\/favorites\/\d+/, { statusCode: 200, body: { success: true } }).as("deleteFavorite");

        cy.intercept("POST", "**/api/orders/checkout", { statusCode: 200, body: { success: true, message: "Payment Successful!" } }).as("checkout");
    });

    // -------- After Each Test: Cleanup created users --------
    afterEach(() => {
        if (createdUserIds.length > 0) {
            const token = Cypress.env('adminToken');
            createdUserIds.forEach((userId) => {
                cy.request({
                    method: "DELETE",
                    url: `${API_BASE}/api/auth/delete/${userId}`,
                    headers: { Authorization: `Bearer ${token}` },
                    failOnStatusCode: false,
                }).then((res) => {
                    cy.log(`Deleted user ${userId}, status: ${res.status}`);
                });
            });
            createdUserIds = [];
        }
    });

    // -------- Buyer Flows --------
    it("Shows homepage banners and categories with real products", () => {
        cy.visit(BASE_URL + "/");

        cy.request(`${API_BASE}/api/products/all`).then(res => {
            expect(res.status).to.eq(200);
            const products = res.body;

            cy.contains("Featured Categories").should("exist");
            cy.contains("Popular Products").should("exist");

            // ตรวจสอบเฉพาะสินค้าที่มี stock > 0
            const availableProducts = products.filter(p => p.quantity > 0);

            availableProducts.forEach(p => {
                cy.contains(p.name, { timeout: 10000 }).should("exist");
            });
        });
    });

    it("Search and filter products", () => {
        cy.visit(BASE_URL + "/search");
        cy.get('input[placeholder="Search for products"]').type("Shower");
        cy.request(`${API_BASE}/api/products/search?keyword=Shower`).then(res => {
            expect(res.status).to.eq(200);
            const items = res.body.items;
            items.forEach(p => {
                cy.contains(p.name).should("exist");
            });
        });
    });

    it("Register a new user", () => {
        const username = `testuser_${Date.now()}`;
        const email = `user_${Date.now()}@example.com`;
        const password = "123456";

        registerAndLoginUser(username, email, password).then(() => {
            cy.visit(BASE_URL + "/");
            cy.contains(username).should("exist");
        });
    });

    it("Login as USER", () => {
        cy.visit(BASE_URL + "/");
        cy.get("header").contains("test", { timeout: 10000 }).should("exist");
    });

    it("View product details and add to cart", () => {
        cy.visit(BASE_URL + "/product/detail/1");
        cy.wait("@getProduct1");
        cy.get("h1").should("contain", "Coffee");
        cy.get("button").contains("Add to cart").click();
        cy.wait("@addCart");
    });

    it("Opens CartSidebar", () => {
        cy.visit(BASE_URL + "/");
        cy.get("[data-testid='cart-button']").click();
        cy.get("[data-testid='cart-sidebar']").should("exist").should("be.visible");
        cy.get("[data-testid='cart-sidebar']").contains("Coffee");
        cy.get("[data-testid='cart-sidebar']").contains("Chocolate");
    });

    it("Checkout from CartSidebar", () => {
        cy.visit(BASE_URL + "/");
        cy.get("[data-testid='cart-button']").click();
        cy.get("[data-testid='cart-sidebar']").contains("Payment").click();
        cy.url().should("include", "/payment");
        cy.get("button").contains("Pay Now!!").click();
        cy.wait("@checkout");
        cy.contains("Payment Successful!").should("exist");
    });

    it("Favorites remove works", () => {
        cy.visit(BASE_URL + "/favorite");
        cy.get("[data-testid='favorites-table']").contains("Coffee").should("exist");
        cy.get("[data-testid='favorites-table'] button.text-red-500").first().click();
        cy.wait("@deleteFavorite");
    });

    // -------- Admin Flow --------
    it("Login as ADMIN", () => {
        cy.visit(BASE_URL + "/admin-dashboard");
        cy.get("h1", { timeout: 10000 }).should("contain.text", "Dashboard Admin");
    });
});
