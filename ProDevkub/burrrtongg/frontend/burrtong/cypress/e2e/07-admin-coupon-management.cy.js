describe('Admin - Coupon Management', () => {
  const timestamp = Date.now();
  const adminEmail = `couponadmin${timestamp}@test.com`;
  const password = 'Test1234!';
  const couponCode = `TEST${timestamp}`;

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

  it('should access coupons page', () => {
    cy.visit('http://localhost:5173/admin/coupons');
    cy.wait(500);
    cy.url().should('include', '/admin/coupons');
    cy.get('body').should('contain.text', "Coupons' List");
  });

  it('should create a new coupon', () => {
    cy.visit('http://localhost:5173/admin/coupons');
    cy.wait(1000);

    // Click New Coupon button
    cy.contains('button', /new.*coupon|add.*coupon/i).click();
    cy.wait(1000);

    // Fill coupon form (using name selectors)
    cy.get('input[name="code"]').clear().type(couponCode);
    cy.get('select[name="discountType"]').select('FIXED');
    cy.get('input[name="discountValue"]').clear().type('100');
    cy.get('input[name="minPurchaseAmount"]').clear().type('500');
    cy.get('input[name="maxUses"]').clear().type('50');
    cy.get('input[name="expirationDate"]').clear().type('2025-12-31');
    
    // Set active status
    cy.get('body').then(($body) => {
      if ($body.find('input[name="isActive"], input[type="checkbox"]').length > 0) {
        cy.get('input[name="isActive"], input[type="checkbox"]').first().check();
      }
    });

    // Submit form
    cy.get('button[type="submit"]').click({ force: true });
    cy.wait(2000);

    // Verify coupon was created
    cy.get('body').should('contain.text', couponCode);
    cy.log(`Coupon "${couponCode}" created successfully`);
  });

  it('should edit the created coupon', () => {
    cy.visit('http://localhost:5173/admin/coupons');
    cy.wait(1000);

    // Find the coupon and click edit
    cy.contains(couponCode).parents('tr').first().within(() => {
      cy.get('button.edit-product-btn').click();
    });
    cy.wait(1000);

    // Edit coupon details
    cy.get('input[name="discountValue"]').clear().type('150');
    cy.get('input[name="maxUses"]').clear().type('75');

    // Submit update
    cy.get('button[type="submit"]').click({ force: true });
    cy.wait(2000);

    // Verify coupon still exists
    cy.get('body').should('contain.text', couponCode);
    cy.log(`Coupon "${couponCode}" updated successfully`);
  });

  it('should delete the created coupon', () => {
    cy.visit('http://localhost:5173/admin/coupons');
    cy.wait(1000);

    // Find and delete the coupon
    cy.contains(couponCode).parents('tr').first().within(() => {
      cy.get('button.delete-product-btn').click();
    });
    cy.wait(500);

    // Confirm deletion
    cy.on('window:confirm', () => true);
    cy.wait(2000);

    // Verify coupon was deleted
    cy.get('body').should('not.contain.text', couponCode);
    cy.log(`Coupon "${couponCode}" deleted successfully`);
  });
});
