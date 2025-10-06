/// <reference types="cypress" />
import 'cypress-file-upload';

const BACKEND_URL = Cypress.env("BACKEND_URL") || "http://localhost:8080";

// ---------- helper function ----------
function findProductById(productId) {
    const productSelector = `P${String(productId).padStart(5, "0")}`;

    // หา product ใน table ปัจจุบัน
    return cy.get("table tbody").then($tbody => {
        const found = $tbody.find(`td:contains("${productSelector}")`);
        if (found.length) return cy.wrap(found);

        // ถ้าไม่เจอ ให้กด next ถ้ามี
        return cy.get('[data-cy="pagination-next"]').then($btn => {
            if (!$btn.is(':disabled')) {
                return cy.wrap($btn)
                    .scrollIntoView()
                    .click({ force: true })
                    .then(() => {
                        return findProductById(productId); // recursive retry
                    });
            } else {
                throw new Error(`${productSelector} not found`);
            }
        });
    });
}

// ---------- test suite ----------
describe("Admin Dashboard - Products (Real Backend)", () => {
    let createdProductId;

    before(() => {
        // Login admin จริงและเก็บ token ใน Cypress.env
        cy.request("POST", `${BACKEND_URL}/api/auth/login`, {
            email: "admin@gmail.com",
            password: "111111"
        }).then((res) => {
            expect(res.status).to.eq(200);
            Cypress.env('adminToken', res.body.token);
            Cypress.env('adminUser', { username: res.body.username });
        });
    });

    beforeEach(() => {
        const token = Cypress.env('adminToken');
        const username = Cypress.env('adminUser').username;
        expect(token).to.exist;

        cy.visit("/admin-dashboard", {
            onBeforeLoad(win) {
                win.localStorage.setItem("admin_token", token);
                win.localStorage.setItem("admin_username", username);
            }
        });
    });

    // -------- 1️⃣ เพิ่ม Product --------
    it("should add a new product", () => {
        cy.visit("/add-product");

        const productName = `Real Product ${Date.now()}`;
        const base64Image =
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

        cy.get('input[placeholder="Product Name"]').type(productName);
        cy.get('select#category').select("Snack");
        cy.get('textarea#description').type("Created in real backend test");
        cy.get('[aria-label="Status Stock"]').click();

        cy.get('input[name="quantity"]').clear().type("10");
        cy.get('input[name="price"]').clear().type("99");
        cy.get('input[type="file"]').attachFile({
            fileContent: base64Image,
            fileName: "product.png",
            mimeType: "image/png",
            encoding: "base64"
        });

        cy.contains("Create Product").click();
        cy.on("window:alert", (txt) => {
            expect(txt).to.contains("✅ Product created successfully!");
        });

        cy.request({
            method: "GET",
            url: `${BACKEND_URL}/api/products/all`,
            headers: { Authorization: `Bearer ${Cypress.env('adminToken')}` }
        }).then((res) => {
            const created = res.body.find(p => p.name === productName);
            expect(created).to.exist;
            createdProductId = created.id;
        });
    });

    // -------- 2️⃣ แก้ไข Product --------
    it("should update the created product", () => {
        expect(createdProductId).to.exist;

        // search product across pagination
        findProductById(createdProductId).then(() => {
            cy.get(`[data-cy="product-actions-${createdProductId}"]`).click();
            cy.get(`[data-cy="update-product-${createdProductId}"]`).click();

            cy.get('input[type="text"]').clear().type("Updated Product Name");
            cy.get('textarea').clear().type("Updated description");
            cy.get('input[name="quantity"]').clear().type("25");
            cy.get('input[name="price"]').clear().type("150");

            const base64Image =
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
            cy.get('input[type="file"]').attachFile({
                fileContent: base64Image,
                fileName: "updated-image.png",
                mimeType: "image/png",
                encoding: "base64"
            });

            cy.get("button").contains("Save Changes").click();
            cy.get(".animate-fadeIn").should("exist");
            cy.contains("Product updated successfully!").should("exist");
            cy.wait(1600);

            cy.request({
                method: "GET",
                url: `${BACKEND_URL}/api/products/${createdProductId}`,
                headers: { Authorization: `Bearer ${Cypress.env('adminToken')}` }
            }).then((res) => {
                expect(res.body.name).to.eq("Updated Product Name");
                expect(res.body.description).to.eq("Updated description");
                expect(res.body.quantity).to.eq(25);
                expect(res.body.price).to.eq(150);
            });
        });
    });

    // -------- 3️⃣ ลบ Product --------
    it("should delete the created product", () => {
        expect(createdProductId).to.exist;

        findProductById(createdProductId).then(() => {
            cy.get(`[data-cy="product-actions-${createdProductId}"]`).click();
            cy.get(`[data-cy="delete-product-${createdProductId}"]`).click();

            cy.request({
                method: "GET",
                url: `${BACKEND_URL}/api/products/${createdProductId}`,
                headers: { Authorization: `Bearer ${Cypress.env('adminToken')}` },
                failOnStatusCode: false
            }).then((res) => {
                expect(res.status).to.eq(404);
            });
        });
    });
});

describe("Admin Dashboard (Mocked) - Orders", () => {
    beforeEach(() => {
        cy.intercept("GET", `${BACKEND_URL}/api/orders`, {
            statusCode: 200,
            body: [
                { id: "101", name: "Order Product 1", category: "Snack", quantity: 2, price: 50, status: "PENDING", image: "/images/order1.png" },
                { id: "102", name: "Order Product 2", category: "Drink", quantity: 1, price: 30, status: "FULFILLED", image: "/images/order2.png" },
            ],
        }).as("getOrders");

        cy.visit("/order-product", { onBeforeLoad(win) { win.localStorage.setItem("admin_token", "mock-token"); } });
        cy.wait("@getOrders");
    });

    it("should display all orders", () => {
        cy.get("table tbody tr").should("have.length", 2);
        cy.contains("ORD101").should("exist");
        cy.contains("ORD102").should("exist");
    });

    it("should fulfill a pending order", () => {
        cy.intercept("PATCH", `${BACKEND_URL}/api/orders/101*`, { statusCode: 200, body: { id: "101", status: "FULFILLED" } }).as("updateOrder");
        cy.get("table tbody tr").contains("ORD101").parent().within(() => cy.get("button").click());
        cy.contains("✅ Fulfilled").click();
        cy.wait("@updateOrder");
        cy.get("table tbody tr").contains("ORD101").parent().within(() => cy.get("td").eq(5).should("contain", "FULFILLED"));
    });

    it("should cancel a pending order", () => {
        cy.intercept("DELETE", `${BACKEND_URL}/api/orders/101`, { statusCode: 200 }).as("deleteOrder");
        cy.get("table tbody tr").contains("ORD101").parent().within(() => cy.get("button").click());
        cy.contains("❌ Cancel").click();
        cy.wait("@deleteOrder");
        cy.get("table tbody tr").should("have.length", 1);
        cy.contains("ORD101").should("not.exist");
    });
});

describe("User (Mocked) - Orders > CartSidebar", () => {
    beforeEach(() => {
        window.localStorage.setItem("token", "mocked-token");
        cy.intercept("GET", `${BACKEND_URL}/api/orders/my`, {
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
        cy.wait("@getOrders");

        cy.contains("Product A").should("exist");
        cy.contains("Product B").should("exist");
        cy.contains("Product A").parent().within(() => { cy.contains("FULFILLED").should("exist"); cy.contains("Receive").should("exist"); });
        cy.contains("Product B").parent().within(() => { cy.contains("PENDING").should("exist"); cy.contains("Receive").should("not.exist"); });
    });

    it("should allow receiving FULFILLED orders", () => {
        cy.intercept("PATCH", `${BACKEND_URL}/api/orders/1/receive`, { statusCode: 200 }).as("receiveOrder");
        cy.get("[data-testid=cart-button]").click();
        cy.contains("Order").click();
        cy.contains("Product A").parent().within(() => cy.contains("Receive").click());
        cy.wait("@receiveOrder");
        cy.contains("Product A").should("not.exist");
    });
});
