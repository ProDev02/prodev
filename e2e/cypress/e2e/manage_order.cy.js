/// <reference types="cypress" />

describe("WholeCart E2E Flow (Real DB + Mocked Cart) - Complete", () => {
    const BASE_URL = Cypress.config("baseUrl");
    const API_BASE = Cypress.env("API_BASE");
    let createdUserIds = [];

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

    before(() => {
        loginUserOnce("test@gmail.com", "123456");
    });

    beforeEach(() => {
        cy.viewport(1280, 800);
        cy.clearLocalStorage();
        if (Cypress.env('userToken')) {
            setUserToken(Cypress.env('userToken'), Cypress.env('userData'));
        }
    });

    // -------- ✅ ใช้ฐานข้อมูลจริง --------
    it("View 2 product details and add to cart (real DB)", () => {
        cy.request(`${API_BASE}/api/products/all`).then(res => {
            expect(res.status).to.eq(200);
            const products = res.body.filter(p => p.quantity > 0).slice(0, 2);
            expect(products.length).to.eq(2);
            products.forEach((product) => {
                cy.visit(`${BASE_URL}/product/detail/${product.id}`);
                cy.get("h1", { timeout: 10000 }).should("contain", product.name);
                cy.get("button")
                    .contains(/Add to cart/i, { timeout: 10000 })
                    .should("be.visible")
                    .click();
                cy.wait(1000);
            });
            cy.get("[data-testid='cart-button']", { timeout: 10000 }).click();
            cy.get("[data-testid='cart-sidebar']", { timeout: 10000 }).should("be.visible")
                .and(($sidebar) => {
                    products.forEach((product) => {
                        expect($sidebar).to.contain(product.name);
                    });
                });
        });
    });

    it("Opens CartSidebar and verifies real DB cart items", () => {
        cy.visit(BASE_URL + "/");
        cy.get("[data-testid='cart-button']", { timeout: 10000 }).click();
        cy.request({
            method: "GET",
            url: `${API_BASE}/api/cart/list`,
            headers: { Authorization: `Bearer ${Cypress.env('userToken')}` },
        }).then(res => {
            expect(res.status).to.eq(200);
            const items = res.body.items || [];
            if (items.length === 0) {
                cy.log("Cart is empty, please ensure add-to-cart works.");
            } else {
                items.forEach(item => {
                    cy.get("[data-testid='cart-sidebar']").contains(item.productName);
                });
            }
            cy.get("[data-testid='cart-sidebar']").should("be.visible");
        });
    });

    it("Checkout from CartSidebar (real DB order creation)", () => {
        cy.intercept("POST", "**/api/orders/checkout").as("checkoutReal");
        cy.visit(BASE_URL + "/");
        cy.get("[data-testid='cart-button']").click();
        cy.get("[data-testid='cart-sidebar']").contains("Payment").click();
        cy.url().should("include", "/payment");
        cy.get("button").contains("Pay Now!!").should("be.visible").click();
        cy.wait("@checkoutReal").its("response.statusCode").should("eq", 200);
        cy.wait(1000);
        cy.request({
            method: "GET",
            url: `${API_BASE}/api/orders/my`,
            headers: { Authorization: `Bearer ${Cypress.env("userToken")}` },
        }).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body.length, "order count").to.be.greaterThan(0);
            const lastOrder = res.body[res.body.length - 1];
            cy.log(`✅ Order created successfully: ${lastOrder.name}`);
        });
        cy.contains("Payment Successful!").should("exist");
    });

    // -------- Admin Flow --------
    describe("Admin Dashboard - Orders (Real Backend)", () => {
        const BACKEND_URL = Cypress.env("BACKEND_URL") || "http://localhost:8080";

        before(() => {
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
            cy.intercept("GET", `${BACKEND_URL}/api/orders*`).as("fetchOrders");
            cy.wait("@fetchOrders");
        });

        it("should display all orders", () => {
            cy.get("table tbody tr").should("have.length.greaterThan", 0); // ต้องมี order จริง
        });

        it("should fulfill a pending order", () => {
            cy.get("table tbody tr").then(($rows) => {
                const pendingRow = $rows.toArray().find(row => row.cells[5].innerText === "PENDING");
                if (!pendingRow) return;
                cy.wrap(pendingRow).within(() => {
                    cy.get("button").click();
                });
                cy.contains("✅ Fulfilled").click();
                cy.wrap(pendingRow).within(() => {
                    cy.get("td").eq(5).should("contain", "FULFILLED");
                });
            });
        });

        it("should cancel a pending order", () => {
            cy.get("table tbody tr").then(($rows) => {
                const pendingRow = $rows.toArray().find(row => row.cells[5].innerText === "PENDING");
                if (!pendingRow) return;
                const orderIdText = pendingRow.cells[0].innerText;
                cy.wrap(pendingRow).within(() => {
                    cy.get("button").click();
                });
                cy.contains("❌ Cancel").click();
                cy.get("table tbody tr").should("not.contain", orderIdText);
            });
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
