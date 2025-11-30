const BACKEND_URL = Cypress.env("BACKEND_URL") || "https://muict.app/prodev-backend";

describe("Admin Dashboard - Weekly Stock Report", () => {
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

        cy.wait(2000); // รอให้หน้าโหลดเสร็จ
    });

    function closePopupIfVisible() {
        cy.wait(1000); // รอให้ popup แสดงทัน (ปรับตาม UI จริงได้)
        cy.get("body").then(($body) => {
            const closeBtn = $body.find('button:contains("✖")');
            if (closeBtn.length) {
                cy.wrap(closeBtn).click({ force: true });
                cy.log("✅ Popup closed before test starts");
            } else {
                cy.log("ℹ️ No popup found");
            }
        });
    }

    // -------- 1️⃣ Weekly Stock Report --------
    it("should open Weekly Stock Report modal and display data", () => {
        closePopupIfVisible();
        // กดปุ่ม Weekly Stock Report
        cy.contains("Weekly Stock Report").click();

        // ตรวจสอบว่า modal ปรากฏ
        cy.get("div.fixed.inset-0").should("be.visible");

        // ตรวจสอบข้อมูลสรุปด้านบน
        cy.get("p").contains("Total Products").next().should("exist").and(($el) => {
            expect(parseInt($el.text())).to.be.greaterThan(0);
        });

        cy.get("p").contains("Out of Stock").next().should("exist");
        cy.get("p").contains("Low Stock").next().should("exist");

        // ตรวจสอบตารางรายการสินค้า
        cy.get("table tbody tr").its("length").should("be.gte", 1); // ต้องมีแถวอย่างน้อย 1

        // ปิด modal
        cy.get("button").contains("✖").click();
        cy.get("div.fixed.inset-0").should("not.exist");
    });
});