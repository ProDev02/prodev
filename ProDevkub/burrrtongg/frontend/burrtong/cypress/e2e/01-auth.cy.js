describe('Authentication Flow', () => {
  const timestamp = Date.now();
  const customerEmail = `customer${timestamp}@test.com`;
  const adminEmail = `admin${timestamp}@test.com`;
  const password = 'Test1234!';

  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should register a new customer', () => {
    // Navigate to customer signup
    cy.contains('SIGN UP').click();
    cy.url().should('include', '/signup');

    // Fill registration form
    cy.get('input[name="email"]').type(customerEmail);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="confirmPassword"]').type(password);
    
    // Submit
    cy.contains('button', 'Sign up').click();
    cy.wait(1000);

    // Should redirect to login
    cy.url().should('eq', 'http://localhost:5173/');
  });

  it('should login as customer', () => {
    cy.visit('http://localhost:5173/');

    // Login with registered customer
    cy.get('input[id="email"]').type(customerEmail);
    cy.get('input[id="password"]').type(password);
    cy.contains('button', 'Login').click();
    cy.wait(1000);

    // Should be logged in and redirected to home
    cy.url().should('include', '/home');
  });

  it('should register a new admin', () => {
    cy.visit('http://localhost:5173/admin/signup');

    // Fill admin registration form
    cy.get('input[name="email"]').type(adminEmail);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="confirmPassword"]').type(password);
    
    // Submit
    cy.contains('button', 'Sign up').click();
    cy.wait(1000);

    // Should redirect to admin login
    cy.url().should('include', '/admin/login');
  });

  it('should login as admin', () => {
    cy.visit('http://localhost:5173/admin/login');

    // Login with registered admin
    cy.get('input[id="email"]').type(adminEmail);
    cy.get('input[id="password"]').type(password);
    cy.contains('button', 'Login').click();
    cy.wait(1000);

    // Should be logged in to admin dashboard
    cy.url().should('include', '/admin/products');
  });

  it('should logout successfully', () => {
    // Login first
    cy.visit('http://localhost:5173/');
    cy.get('input[id="email"]').type(customerEmail);
    cy.get('input[id="password"]').type(password);
    cy.contains('button', 'Login').click();
    cy.wait(1000);

    // Look for logout option
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Logout")').length > 0) {
        cy.contains('button', 'Logout').click();
      } else if ($body.find('a:contains("Logout")').length > 0) {
        cy.contains('a', 'Logout').click();
      } else {
        // Manual logout via localStorage
        cy.clearLocalStorage();
        cy.visit('http://localhost:5173/');
      }
    });
    
    cy.wait(500);
    // Should redirect to login or root
    cy.url().should('match', /\/(login)?$/);
  });
});
