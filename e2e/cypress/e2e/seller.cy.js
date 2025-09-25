/// <reference types="cypress" />

describe("Admin Dashboard (Mocked) - Products", () => {
    beforeEach(() => {
        // Mock GET all products
        cy.intercept("GET", "/api/products/all", {
            statusCode: 200,
            body: [
                {
                    id: "1",
                    name: "Existing Product",
                    description: "Existing description",
                    price: 50,
                    quantity: 20,
                    statusStock: "In stock",
                    category: "Snack",
                    images: ["/images/existing-image.jpg"],
                },
            ],
        }).as("getProducts");

        // Mock DELETE product
        cy.intercept("DELETE", "/api/products/delete/*", {
            statusCode: 200,
            body: { success: true },
        }).as("deleteProduct");

        // Mock GET product by ID
        cy.intercept("GET", "/api/products/1", {
            statusCode: 200,
            body: {
                id: "1",
                name: "Existing Product",
                description: "Existing description",
                price: 50,
                quantity: 20,
                statusStock: "In stock",
                category: "Snack",
                images: ["/images/existing-image.jpg"],
            },
        }).as("getProduct");

        // Mock PUT update product
        cy.intercept("PUT", "/api/products/update/1", {
            statusCode: 200,
            body: { id: "1", name: "Updated Product" },
        }).as("updateProduct");

        // Mock POST add product
        cy.intercept("POST", "/api/products/add", {
            statusCode: 200,
            body: { id: "2", name: "New Product" },
        }).as("addProduct");

        // Visit admin dashboard
        cy.visit("/admin-dashboard", {
            onBeforeLoad(win) {
                win.localStorage.setItem("admin_token", "mock-token");
                win.localStorage.setItem("admin_username", "Admin");
            },
        });

        // Wait for GET all products
        cy.wait("@getProducts", { timeout: 10000 });
    });

    it("should delete a product", () => {
        cy.get('[data-cy="product-actions-1"]').click();
        cy.get('[data-cy="delete-product-1"]').click();

        cy.wait("@deleteProduct", { timeout: 10000 }).its("response.statusCode").should("eq", 200);
        cy.get("table tbody tr").should("have.length", 0);
    });

    it("should navigate to update product page and update product", () => {
        cy.get('[data-cy="product-actions-1"]').click();
        cy.get('[data-cy="update-product-1"]').click();

        cy.window().then((win) => {
            win.history.replaceState({ productId: "1", username: "Admin" }, "");
        });

        cy.wait("@getProduct", { timeout: 10000 });

        cy.get('input[type="text"]').clear().type("Updated Product");
        cy.get('textarea').clear().type("Updated description");
        cy.get('input[type="number"]').eq(0).clear().type("25");
        cy.get('input[type="number"]').eq(1).clear().type("150");

        const base64Image =
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
        cy.get('input[type="file"]').attachFile({
            fileContent: base64Image,
            fileName: "updated-image.png",
            mimeType: "image/png",
            encoding: "base64",
        });

        cy.contains("Save Changes").click();
        cy.wait("@updateProduct", { timeout: 10000 }).its("response.statusCode").should("eq", 200);
        cy.get(".animate-fadeIn").should("contain", "Product updated successfully!");
    });

    it("should add a new product (mocked)", () => {
        cy.visit("/add-product", {
            onBeforeLoad(win) {
                win.localStorage.setItem("admin_token", "mock-token");
                win.localStorage.setItem("admin_username", "Admin");
            },
        });

        cy.get('input[placeholder="Product Name"]').type("New Product");
        cy.get('select#category').select("Snack");
        cy.get('button[aria-label="Status Stock"]').click();
        cy.get('input[type="number"]').eq(0).clear().type("10");
        cy.get('input[type="number"]').eq(1).clear().type("99");
        cy.get('textarea#description').type("This is a new mocked product");

        const base64Image =
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
        cy.get('input[type="file"]').attachFile({
            fileContent: base64Image,
            fileName: "mocked-image.png",
            mimeType: "image/png",
            encoding: "base64",
        });

        cy.contains("Create Product").click();
        cy.wait("@addProduct", { timeout: 10000 }).its("response.statusCode").should("eq", 200);

        cy.on("window:alert", (txt) => {
            expect(txt).to.contains("✅ Product created successfully!");
        });
    });
});

describe("Admin Dashboard (Mocked) - Orders", () => {
    beforeEach(() => {
        // Mock GET all orders
        cy.intercept("GET", "/api/orders", {
            statusCode: 200,
            body: [
                { id: "101", name: "Order Product 1", category: "Snack", quantity: 2, price: 50, status: "PENDING", image: "/images/order1.png" },
                { id: "102", name: "Order Product 2", category: "Drink", quantity: 1, price: 30, status: "FULFILLED", image: "/images/order2.png" },
            ],
        }).as("getOrders");

        cy.visit("/order-product", {
            onBeforeLoad(win) {
                win.localStorage.setItem("admin_token", "mock-token");
            },
        });

        cy.wait("@getOrders", { timeout: 10000 });
    });

    it("should display all orders", () => {
        cy.get("table tbody tr").should("have.length", 2);
        cy.contains("ORD101").should("exist");
        cy.contains("ORD102").should("exist");
    });

    it("should mark a PENDING order as FULFILLED", () => {
        cy.intercept("PATCH", "/api/orders/101*", { statusCode: 200, body: { id: "101", status: "FULFILLED" } }).as("updateOrder");

        cy.get("table tbody tr").contains("ORD101").parent().within(() => {
            cy.get("button").click();
        });

        cy.contains("✅ Fulfilled").click();
        cy.wait("@updateOrder", { timeout: 10000 });

        cy.get("table tbody tr").contains("ORD101").parent().within(() => {
            cy.get("td").eq(5).should("contain", "FULFILLED");
        });
    });

    it("should cancel a PENDING order", () => {
        cy.intercept("DELETE", "/api/orders/101", { statusCode: 200 }).as("deleteOrder");

        cy.get("table tbody tr").contains("ORD101").parent().within(() => {
            cy.get("button").click();
        });

        cy.contains("❌ Cancel").click();
        cy.wait("@deleteOrder", { timeout: 10000 });

        cy.get("table tbody tr").should("have.length", 1);
        cy.contains("ORD101").should("not.exist");
    });
});

describe("User (Mocked) - Orders > CartSidebar OrderTab", () => {
    beforeEach(() => {
        window.localStorage.setItem("token", "mocked-token");

        cy.intercept("GET", "/api/orders/my", {
            statusCode: 200,
            body: [
                { id: 1, name: "Product A", quantity: 2, price: 100, status: "FULFILLED", category: "Category 1", image: "/images/product-a.png" },
                { id: 2, name: "Product B", quantity: 1, price: 50, status: "PENDING", category: "Category 2", image: "/images/product-b.png" },
            ],
        }).as("getOrders");

        cy.visit("/");
    });

    it("should display orders in Order tab", () => {
        cy.get("[data-testid=cart-button]").click();
        cy.contains("Order").click();
        cy.wait("@getOrders", { timeout: 10000 });

        cy.contains("Product A").should("exist");
        cy.contains("Product B").should("exist");

        cy.contains("Product A").parent().within(() => {
            cy.contains("FULFILLED").should("exist");
            cy.contains("Receive").should("exist");
        });

        cy.contains("Product B").parent().within(() => {
            cy.contains("PENDING").should("exist");
            cy.contains("Receive").should("not.exist");
        });
    });

    it("should allow receiving FULFILLED orders", () => {
        cy.intercept("PATCH", "/api/orders/1/receive", { statusCode: 200 }).as("receiveOrder");

        cy.get("[data-testid=cart-button]").click();
        cy.contains("Order").click();

        cy.contains("Product A").parent().within(() => {
            cy.contains("Receive").click();
        });

        cy.wait("@receiveOrder", { timeout: 10000 });
        cy.contains("Product A").should("not.exist");
    });
});
