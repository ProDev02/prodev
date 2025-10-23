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

    it("Add favorite from product detail (item 4) and remove in FavoriteListPage (real backend)", () => {
        // ดึงสินค้าจริงจาก backend
        cy.request({
            method: "GET",
            url: `${API_BASE}/api/products/all`,
        }).then((res) => {
            expect(res.status).to.eq(200);
            const products = res.body.filter(p => p.quantity > 0);
            expect(products.length).to.be.gte(4);

            const product = products[3]; // เลือกสินค้าลำดับที่ 4

            cy.visit(`${BASE_URL}/product/detail/${product.id}`);

            // เช็คว่าหน้าโหลดสินค้าถูกต้อง
            cy.get("h1", { timeout: 10000 }).should("contain", product.name);

            // กดหัวใจเพิ่ม favorite
            cy.get("[aria-label='Favorite']").click();

            // รอให้ backend update (เล็กน้อย)
            cy.wait(500);

            // เข้า favorite list page
            cy.visit(BASE_URL + "/favorite");

            // หารายการ favorite ที่เพิ่งกด
            cy.get("[data-testid='favorites-table']")
                .contains(product.name)
                .should("exist")
                .parents("tr")
                .find("button.text-red-500")
                .click();

            // รอ backend ลบ favorite จริง
            cy.wait(500);

            // ตรวจสอบว่าหายไปแล้ว
            cy.get("[data-testid='favorites-table']")
                .contains(product.name)
                .should("not.exist");
        });
    });


    // -------- Admin Flow --------
    it("Login as ADMIN", () => {
        cy.visit(BASE_URL + "/admin-dashboard");
        cy.get("h1", { timeout: 10000 }).should("contain.text", "Dashboard Admin");
    });
});
