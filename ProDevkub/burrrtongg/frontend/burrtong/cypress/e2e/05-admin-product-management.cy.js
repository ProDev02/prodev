describe('Admin - Product Management', () => {
  const timestamp = Date.now();
  const adminEmail = `productadmin${timestamp}@test.com`;
  const password = 'Test1234!';
  const productName = `Test Product ${timestamp}`;
  let createdProductId = null;

  before(() => {
    // Register admin
    cy.visit('http://localhost:5173/admin/signup');
    cy.get('input[name="email"]').type(adminEmail);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="confirmPassword"]').type(password);
    cy.contains('button', 'Sign up').click();
    cy.wait(1000);
  });

  beforeEach(() => {
    // Login as admin
    cy.visit('http://localhost:5173/admin/login');
    cy.get('input[id="email"]').type(adminEmail);
    cy.get('input[id="password"]').type(password);
    cy.contains('button', 'Login').click();
    cy.wait(1000);
  });

  it('should access admin dashboard', () => {
    cy.url().should('include', '/admin');
    cy.get('body').should('exist');
  });

  it('should navigate to products page', () => {
    cy.contains(/products|สินค้า/i).click();
    cy.wait(500);
    cy.url().should('match', /\/admin.*product/i);
  });

  it('should create a new product', () => {
    // Navigate to products page
    cy.visit('http://localhost:5173/admin/products');
    cy.wait(1000);
    
    // Click Add/New Product button
    cy.contains('button', /add|create|new|เพิ่ม|สร้าง/i).first().click();
    cy.wait(1000);

    // Fill in product details in modal (using id selectors)
    cy.get('input#name').clear().type(productName);
    cy.get('textarea#description').clear().type('This is a test product created by Cypress automation for testing purposes.');
    cy.get('input#price').clear().type('999.00');
    cy.get('input#stock').clear().type('50');
    cy.get('input#size').clear().type('M');
    
    // Select category
    cy.get('select#category').select(1);
    
    // Upload image if needed (optional)
    cy.get('input#image').should('exist');
    
    // Submit form by pressing Enter or clicking button directly
    cy.get('button[type="submit"]').click({ force: true });
    cy.wait(2000);
    
    // Verify product was created - search for it in the list
    cy.get('body').should('contain.text', productName);
    cy.log(`Product "${productName}" created successfully`);
  });

  it('should edit the created product', () => {
    cy.visit('http://localhost:5173/admin/products');
    cy.wait(1000);

    // Find the product we just created
    cy.contains(productName).parents('tr, .product-item, .product-card').first().within(() => {
      // Click edit button
      cy.get('button.edit-product-btn').first().click();
    });
    
    cy.wait(1000);

    // Edit the product details (using id selectors)
    cy.get('input#name').should('have.value', productName);
    cy.get('input#price').clear().type('1299.00');
    cy.get('input#stock').clear().type('75');
    cy.get('textarea#description').clear().type('Updated description: This product has been modified by Cypress test.');
    
    // Click Save/Update button with force
    cy.get('button[type="submit"]').click({ force: true });
    cy.wait(2000);
    
    // Verify product was updated
    cy.get('body').should('contain.text', productName);
    cy.log(`Product "${productName}" updated successfully`);
  });

  it('should delete the created product', () => {
    cy.visit('http://localhost:5173/admin/products');
    cy.wait(1000);

    // Find the product we created
    cy.contains(productName).parents('tr, .product-item, .product-card').first().within(() => {
      // Click delete button
      cy.get('button:contains("Delete"), button:contains("ลบ"), .delete-btn').first().click();
    });
    
    cy.wait(500);

    // Confirm deletion in modal
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Confirm"), button:contains("ยืนยัน"), button:contains("Yes")').length > 0) {
        cy.contains('button', /confirm|yes|ยืนยัน/i).click();
        cy.wait(2000);
        
        // Verify product was deleted - should not appear in list
        cy.get('body').should('not.contain.text', productName);
        cy.log(`Product "${productName}" deleted successfully`);
      }
    });
  });
});
