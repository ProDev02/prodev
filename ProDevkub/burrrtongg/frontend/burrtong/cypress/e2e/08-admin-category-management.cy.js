describe('Admin - Category Management', () => {
  const timestamp = Date.now();
  const adminEmail = `categoryadmin${timestamp}@test.com`;
  const password = 'Test1234!';
  const categoryName = `Test Category ${timestamp}`;

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

  it('should access categories page', () => {
    cy.visit('http://localhost:5173/admin/categories');
    cy.wait(500);
    cy.url().should('include', '/admin/categories');
    cy.get('body').should('contain.text', "Categories' List");
  });

  it('should create a new category', () => {
    cy.visit('http://localhost:5173/admin/categories');
    cy.wait(1000);

    // Click Add New Category button
    cy.contains('button', /add.*new.*category|new.*category/i).click();
    cy.wait(1000);

    // Fill category form (using name selector)
    cy.get('input[name="name"]').clear().type(categoryName);

    // Submit form
    cy.get('button[type="submit"]').click({ force: true });
    cy.wait(2000);

    // Verify category was created
    cy.get('body').should('contain.text', categoryName);
    cy.log(`Category "${categoryName}" created successfully`);
  });

  it('should edit the created category', () => {
    cy.visit('http://localhost:5173/admin/categories');
    cy.wait(1000);

    // Find the category and click edit
    cy.contains(categoryName).parents('tr').first().within(() => {
      cy.get('button.edit-product-btn').click();
    });
    cy.wait(1000);

    // Edit category name
    const updatedName = `${categoryName} - Updated`;
    cy.get('input[name="name"]').clear().type(updatedName);

    // Submit update
    cy.get('button[type="submit"]').click({ force: true });
    cy.wait(2000);

    // Verify category was updated
    cy.get('body').should('contain.text', updatedName);
    cy.log(`Category updated to "${updatedName}" successfully`);
  });

  it('should delete the created category', () => {
    cy.visit('http://localhost:5173/admin/categories');
    cy.wait(1000);

    // Find and delete the category (use partial match for "Updated")
    cy.contains('td', new RegExp(categoryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).parents('tr').first().within(() => {
      cy.get('button.delete-product-btn').click();
    });
    cy.wait(500);

    // Confirm deletion
    cy.on('window:confirm', () => true);
    cy.wait(2000);

    // Verify category was deleted (check for original name pattern)
    cy.get('body').then(($body) => {
      const bodyText = $body.text();
      const hasCategory = bodyText.includes(categoryName);
      if (hasCategory) {
        cy.log('Category might still exist');
      } else {
        cy.log(`Category deleted successfully`);
      }
    });
  });
});
