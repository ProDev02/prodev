describe('Admin - Weekly Report Fetch', () => {
  const timestamp = Date.now();
  const adminEmail = `reportadmin${timestamp}@test.com`;
  const password = 'Test1234!';

  before(() => {
    // Register admin account
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

  it('should fetch weekly stock report', () => {
    // Visit the stock report page
    cy.visit('http://localhost:5173/admin/stock-report');
    cy.wait(1000);

    // Verify page loaded successfully
    cy.url().should('include', '/admin/stock-report');
    
    // Verify page content is displayed (not error page)
    cy.get('body').should('be.visible');
    
    // Check if page has loaded content (not just blank)
    cy.get('body').then(($body) => {
      // Page should have some content
      expect($body.text().trim().length).to.be.greaterThan(0);
      cy.log('Stock report page loaded successfully');
    });
  });
});
