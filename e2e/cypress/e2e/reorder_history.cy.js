/// <reference types="cypress" />
const BACKEND_URL = Cypress.env("BACKEND_URL") || "http://localhost:8080";

describe("Reorder Functionality from CartSidebar", () => {
    before(() => {
        // Login ด้วยบัญชี test@example.com
        cy.request("POST", `${BACKEND_URL}/api/auth/login`, {
            email: "test@example.com",
            password: "222222"
        }).then((res) => {
            expect(res.status).to.eq(200);
            Cypress.env('userToken', res.body.token);  // เก็บ token
            Cypress.env('userData', {
                id: res.body.id,
                username: res.body.username,
                email: res.body.email,
                role: res.body.role
            });

            // ตั้งค่า localStorage สำหรับการ login
            cy.window().then((win) => {
                win.localStorage.setItem("token", res.body.token);
                win.localStorage.setItem("userId", res.body.id);
                win.localStorage.setItem("username", res.body.username);
                win.localStorage.setItem("email", res.body.email);
                win.localStorage.setItem("role", res.body.role);
            });
        });
    });

    beforeEach(() => {
        const token = Cypress.env('userToken');
        const username = Cypress.env('userData').username;
        expect(token).to.exist;

        cy.visit("/", {
            onBeforeLoad(win) {
                win.localStorage.setItem("token", token);
                win.localStorage.setItem("username", username);
            }
        });

        cy.wait(2000); // รอให้หน้าโหลด
    });

    it("should reorder an item and then remove it from cart", () => {
        // เปิด Cart Sidebar
        cy.get("[data-testid='cart-button']", { timeout: 10000 }).click();

        // ไปที่ Order History
        cy.get('[data-testid="order-history-tab"]').click();
        cy.wait(1000);

        // คลิกสั่งซ้ำ
        cy.get('[data-testid="order-row"]').contains("สั่งซ้ำ").click();
        cy.wait(2000); // รอสินค้าเข้าตะกร้า

        // ไปที่ Shopcart Tab
        cy.get("[data-testid='shopcart-tab']").click();

        // ตรวจสอบสินค้าสั่งซ้ำในตะกร้า (ผ่าน API)
        cy.request({
            method: "GET",
            url: `${BACKEND_URL}/api/cart/list`,
            headers: { Authorization: `Bearer ${Cypress.env('userToken')}` },
        }).then(res => {
            expect(res.status).to.eq(200);
            const cartItems = res.body.items || [];
            const reorderedItem = cartItems.find(item => item.productName === "Lay's Classic Potato Chips");
            expect(reorderedItem).to.not.be.undefined;
        });

        // ลบสินค้าที่สั่งซ้ำจาก UI
        cy.get('[data-testid="remove-item"]').contains("Remove").click();

        // ตรวจสอบว่าตะกร้าว่าง (ผ่าน API)
        cy.request({
            method: "GET",
            url: `${BACKEND_URL}/api/cart/list`,
            headers: { Authorization: `Bearer ${Cypress.env('userToken')}` },
        }).then(res => {
            expect(res.status).to.eq(200);
            const cartItems = res.body.items || [];
            expect(cartItems.find(item => item.productName === "Lay's Classic Potato Chips")).to.be.undefined;
        });
    });
});
