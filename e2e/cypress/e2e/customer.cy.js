describe("Customer Flow", () => {
    it("สมัครสมาชิกและเข้าสู่ระบบ", () => {
        cy.visit("/");
        cy.get("a[href='/register']").click();
        cy.get("input[name='email']").type("testuser@example.com");
        cy.get("input[name='password']").type("password123");
        cy.get("button[type='submit']").click();

        // login
        cy.get("a[href='/login']").click();
        cy.get("input[name='email']").type("testuser@example.com");
        cy.get("input[name='password']").type("password123");
        cy.get("button[type='submit']").click();
        cy.contains("Welcome").should("exist");
    });

    it("ค้นหาและเรียกดูสินค้า", () => {
        cy.visit("/");
        cy.get("input[placeholder='Search']").type("laptop{enter}");
        cy.contains("Laptop").should("exist");
    });

    it("เพิ่มสินค้าในตะกร้าและแก้ไขจำนวน", () => {
        cy.contains("Add to Cart").first().click();
        cy.get("a[href='/cart']").click();
        cy.get("input[name='quantity']").clear().type("2");
        cy.contains("Update").click();
        cy.contains("Total").should("contain", "2");
    });

    it("ทำ Checkout", () => {
        cy.get("a[href='/checkout']").click();
        cy.get("input[name='address']").type("123 Bangkok");
        cy.get("button[type='submit']").click();
        cy.contains("Order Confirmed").should("exist");
    });

    it("ติดตามสถานะคำสั่งซื้อ", () => {
        cy.get("a[href='/orders']").click();
        cy.contains("Processing").should("exist");
    });
});
