/// <reference types="cypress" />
import 'cypress-file-upload';

const BACKEND_URL = Cypress.env("BACKEND_URL") || "http://localhost:8080";

// ---------- helper function ----------
function findProductById(productId) {
    const productSelector = `P${String(productId).padStart(5, "0")}`;

    return cy.get("table tbody").then($tbody => {
        const found = $tbody.find(`td:contains("${productSelector}")`);
        if (found.length) return cy.wrap(found);

        return cy.get('[data-cy="pagination-next"]').then($btn => {
            if (!$btn.is(':disabled')) {
                return cy.wrap($btn)
                    .scrollIntoView()
                    .click({ force: true })
                    .then(() => findProductById(productId));
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
        // Login admin จริงและเก็บ token
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

        findProductById(createdProductId).then(() => {
            cy.get(`[data-cy="product-actions-${createdProductId}"]`).click();
            cy.get(`[data-cy="update-product-${createdProductId}"]`).click();

            // Title (input แรกของ form)
            cy.get('input').first().clear().type("Updated Product Name", { delay: 20 });

            // Description (textarea แรก)
            cy.get('textarea').first().clear().type("Updated description");

            // Quantity
            cy.get('input[name="quantity"]').clear().type("25");

            // Price
            cy.get('input[name="price"]').clear().type("150");

            // Upload image
            const base64Image =
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
            cy.get('input[type="file"]').attachFile({
                fileContent: base64Image,
                fileName: "updated-image.png",
                mimeType: "image/png",
                encoding: "base64"
            });

            // Save changes
            cy.get("button").contains("Save Changes").click();

            // Modal check
            cy.get(".animate-fadeIn").should("exist");
            cy.contains("Product updated successfully!").should("exist");
            cy.wait(1600);

            // ดึงข้อมูลจริงจาก backend
            cy.request({
                method: "GET",
                url: `${BACKEND_URL}/api/products/${createdProductId}`,
                headers: { Authorization: `Bearer ${Cypress.env('adminToken')}` }
            }).then((res) => {
                expect(res.body.name).to.include("Updated Product Name");
                expect(res.body.description).to.eq("Updated description");
                expect(res.body.price).to.eq(1500);
                expect(res.body.quantity).to.eq(250);
            });
        });
    });

    // -------- 3️⃣ ลบ Product --------
    it("should delete the created product", () => {
        expect(createdProductId).to.exist;

        findProductById(createdProductId).then(() => {
            cy.get(`[data-cy="product-actions-${createdProductId}"]`).click();
            cy.get(`[data-cy="delete-product-${createdProductId}"]`).click();

            // เพิ่ม wait ให้ backend commit การลบ
            cy.wait(500);

            cy.request({
                method: "GET",
                url: `${BACKEND_URL}/api/products/${createdProductId}`,
                headers: { Authorization: `Bearer ${Cypress.env('adminToken')}` },
                failOnStatusCode: false
            }).then((res) => {
                // ถ้า backend hard delete จะเป็น 404
                if(res.status === 200 && res.body.deleted !== undefined) {
                    expect(res.body.deleted).to.be.true; // สำหรับ soft delete
                } else {
                    expect(res.status).to.eq(404); // hard delete
                }
            });
        });
    });
});

describe("Admin Dashboard - Orders (Real Backend)", () => {
    before(() => {
        // Login admin จริง
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
        expect(token).to.exist;

        cy.visit("/order-product", {
            onBeforeLoad(win) {
                win.localStorage.setItem("admin_token", token);
            }
        });

        // รอให้ fetch data จริง
        cy.intercept("GET", `${BACKEND_URL}/api/orders*`).as("fetchOrders");
        cy.wait("@fetchOrders");
    });

    it("should display all orders", () => {
        cy.get("table tbody tr").should("have.length.greaterThan", 0); // ต้องมี order จริง
    });

    it("should fulfill a pending order", () => {
        // หา order ที่ status = PENDING
        cy.get("table tbody tr").then(($rows) => {
            const pendingRow = $rows.toArray().find(row => row.cells[5].innerText === "PENDING");
            if (!pendingRow) return;

            cy.wrap(pendingRow).within(() => {
                cy.get("button").click();
            });

            cy.contains("✅ Fulfilled").click();

            // เช็คจาก UI table แทน GET backend
            cy.wrap(pendingRow).within(() => {
                cy.get("td").eq(5).should("contain", "FULFILLED");
            });
        });
    });

    it("should cancel a pending order", () => {
        // หา order ที่ status = PENDING
        cy.get("table tbody tr").then(($rows) => {
            const pendingRow = $rows.toArray().find(row => row.cells[5].innerText === "PENDING");
            if (!pendingRow) return;

            const orderIdText = pendingRow.cells[0].innerText;

            cy.wrap(pendingRow).within(() => {
                cy.get("button").click();
            });

            cy.contains("❌ Cancel").click();

            // ตรวจสอบว่า row หายไปจาก table
            cy.get("table tbody tr").should("not.contain", orderIdText);
        });
    });
});


describe("User - Orders > CartSidebar (Real Backend)", () => {
    const BASE_URL = Cypress.config("baseUrl");
    const API_BASE = Cypress.env("API_BASE");

    const loginUser = (email, password) => {
        return cy.request({
            method: "POST",
            url: `${API_BASE}/api/auth/login`,
            body: { email, password },
        }).then((res) => {
            expect(res.status).to.eq(200);
            const { token, id, username, email: userEmail, role } = res.body;
            window.localStorage.setItem("token", token);
            window.localStorage.setItem("userId", id);
            window.localStorage.setItem("username", username);
            window.localStorage.setItem("email", userEmail);
            window.localStorage.setItem("role", role);
            Cypress.env("userToken", token);
        });
    };

    beforeEach(() => {
        // login ด้วยบัญชีจริง
        loginUser("test@gmail.com", "123456");
        cy.visit(BASE_URL);
        cy.wait(1000); // รอให้ cart sidebar โหลด
        cy.get("[data-testid='cart-button']").click();
        cy.contains("Order").click();
        cy.wait(1000); // รอ backend GET /api/orders/my
    });

    it("should display orders in Order tab", () => {
        cy.request({
            method: "GET",
            url: `${API_BASE}/api/orders/my`,
            headers: { Authorization: `Bearer ${Cypress.env("userToken")}` },
        }).then((res) => {
            expect(res.status).to.eq(200);
            const orders = res.body;

            orders.forEach(order => {
                // หา div ของ order
                cy.get("div.relative.flex.items-start").contains(order.name).parents("div.relative.flex.items-start").within(() => {
                    cy.contains(order.status).should("exist");
                    if (order.status === "FULFILLED") {
                        cy.contains("Receive").should("exist");
                    } else {
                        cy.contains("Receive").should("not.exist");
                    }
                });
            });
        });
    });

    it("should allow receiving FULFILLED orders", () => {
        cy.request({
            method: "GET",
            url: `${API_BASE}/api/orders/my`,
            headers: { Authorization: `Bearer ${Cypress.env("userToken")}` },
        }).then((res) => {
            expect(res.status).to.eq(200);
            const fulfilledOrder = res.body.find(o => o.status === "FULFILLED");
            if (!fulfilledOrder) {
                cy.log("No FULFILLED orders to receive");
                return;
            }

            // ใช้ data-testid หา row โดยตรง
            cy.get(`[data-testid="order-row-${fulfilledOrder.id}"]`)
                .should("be.visible")
                .within(() => {
                    cy.contains("Receive").click();
                });

            // รอ React update state → order หายจาก DOM
            cy.get(`[data-testid="order-row-${fulfilledOrder.id}"]`, { timeout: 10000 })
                .should("not.exist");

            // ตรวจสอบ backend ว่า order ถูกลบจริง
            cy.request({
                method: "GET",
                url: `${API_BASE}/api/orders/my`,
                headers: { Authorization: `Bearer ${Cypress.env("userToken")}` },
            }).then((res2) => {
                const orderExists = res2.body.some(o => o.id === fulfilledOrder.id);
                expect(orderExists).to.be.false;
            });
        });
    });
});


