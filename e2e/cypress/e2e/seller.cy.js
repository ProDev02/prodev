describe("Seller/Admin Flow", () => {
    beforeEach(() => {
        cy.visit("/admin/login");
        cy.get("input[name='email']").type("admin@example.com");
        cy.get("input[name='password']").type("admin123");
        cy.get("button[type='submit']").click();
    });

    it("จัดการสินค้า (เพิ่ม/แก้ไข/ลบ)", () => {
        cy.visit("/admin/products");
        cy.contains("Add Product").click();
        cy.get("input[name='name']").type("Test Product");
        cy.get("input[name='price']").type("1000");
        cy.get("button[type='submit']").click();
        cy.contains("Test Product").should("exist");

        // edit
        cy.contains("Edit").click();
        cy.get("input[name='price']").clear().type("1200");
        cy.get("button[type='submit']").click();
        cy.contains("1200").should("exist");

        // delete
        cy.contains("Delete").click();
        cy.contains("Test Product").should("not.exist");
    });

    it("ตรวจสอบออเดอร์", () => {
        cy.visit("/admin/orders");
        cy.contains("Order #").should("exist");
    });

    it("จัดการสต็อก", () => {
        cy.visit("/admin/products");
        cy.contains("Update Stock").click();
        cy.get("input[name='stock']").clear().type("50");
        cy.get("button[type='submit']").click();
        cy.contains("Stock: 50").should("exist");
    });

    it("เปลี่ยนสถานะคำสั่งซื้อ", () => {
        cy.visit("/admin/orders");
        cy.contains("Pending").click();
        cy.get("select[name='status']").select("Cancelled");
        cy.contains("Cancelled").should("exist");
    });
});
