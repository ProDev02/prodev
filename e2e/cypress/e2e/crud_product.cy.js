/// <reference types="cypress" />
import 'cypress-file-upload';

const BACKEND_URL = Cypress.env("BACKEND_URL") || "https://muict.app/prodev-backend";

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

        cy.wait(2000);
        closePopupIfVisible();
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

        cy.wait(3000);

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
        closePopupIfVisible();

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
        closePopupIfVisible();

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







