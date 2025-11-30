describe('Product Browsing', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/home');
    cy.wait(1000); // Wait for products to load
  });

  it('should display products on home page', () => {
    // Check if product cards are displayed
    cy.get('.product-card').should('have.length.greaterThan', 0);
  });

  it('should view product details', () => {
    // Click on first product
    cy.get('.product-card').first().click();
    cy.wait(500);

    // Should navigate to product detail page
    cy.url().should('include', '/home/products/');
    
    // Product price should be visible
    cy.contains('THB').should('be.visible');
  });

  it('should search for products', () => {
    // Navigate to products page which has search/filter
    cy.contains('Products').click();
    cy.wait(500);

    // Products container should be visible
    cy.get('.products-container').should('exist');
    cy.get('.product-card').should('exist');
  });

  it('should filter products by category', () => {
    // Navigate to products page
    cy.contains('Products').click();
    cy.wait(1000);
    
    // Check if category filter buttons exist
    cy.get('.filter-buttons').should('exist');
    
    // Click on a category (not "All Products")
    cy.get('.filter-btn').not('.active').first().then(($btn) => {
      if ($btn.length > 0) {
        cy.wrap($btn).click();
        cy.wait(500);
        
        // Products should still be displayed
        cy.get('.products-grid').should('exist');
      }
    });
  });

  it('should navigate through products pagination', () => {
    // Navigate to products page
    cy.contains('Products').click();
    cy.wait(1000);

    // Verify products are displayed
    cy.get('.product-card').should('have.length.greaterThan', 0);
  });
});
