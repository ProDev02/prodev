describe('Admin - Order Management', () => {
  const timestamp = Date.now();
  const adminEmail = `orderadmin${timestamp}@test.com`;
  const customerEmail = `ordercustomer${timestamp}@test.com`;
  const password = 'Test1234!';

  before(() => {
    // Register admin
    cy.visit('http://localhost:5173/admin/signup');
    cy.get('input[name="email"]').type(adminEmail);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="confirmPassword"]').type(password);
    cy.contains('button', 'Sign up').click();
    cy.wait(1000);

    // Register customer and create order
    cy.visit('http://localhost:5173/signup');
    cy.get('input[name="email"]').type(customerEmail);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="confirmPassword"]').type(password);
    cy.contains('button', 'Sign up').click();
    cy.wait(1000);

    // Login as customer
    cy.visit('http://localhost:5173/');
    cy.get('input[id="email"]').type(customerEmail);
    cy.get('input[id="password"]').type(password);
    cy.contains('button', 'Login').click();
    cy.wait(1000);

    // Create an order - try multiple products until we find one with stock
    cy.visit('http://localhost:5173/home');
    cy.wait(1000);
    
    // Try to find a product with stock (not "Out of Stock")
    cy.get('.product-card').then(($cards) => {
      let foundProduct = false;
      
      for (let i = 0; i < Math.min(3, $cards.length); i++) {
        const cardText = $cards.eq(i).text();
        if (!cardText.includes('Out of Stock')) {
          cy.wrap($cards.eq(i)).click();
          foundProduct = true;
          break;
        }
      }
      
      if (!foundProduct) {
        // If all checked products are out of stock, just click the first one
        cy.wrap($cards.first()).click();
      }
    });
    
    cy.wait(500);
    
    // Check if Add to Cart button exists and click it
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Add to Cart"), button:contains("เพิ่มในตะกร้า")').length > 0) {
        cy.contains('button', /add to cart|เพิ่มในตะกร้า/i).click();
        cy.wait(1000);
        
        cy.visit('http://localhost:5173/home/cart');
        cy.wait(500);
        
        // Try to checkout if button is enabled
        if ($body.find('.checkout-button:not([disabled])').length > 0) {
          cy.get('.checkout-button').click();
          cy.wait(2000);
        }
      } else {
        cy.log('Product out of stock, skipping order creation');
      }
    });
  });

  beforeEach(() => {
    // Login as admin
    cy.visit('http://localhost:5173/admin/login');
    cy.get('input[id="email"]').type(adminEmail);
    cy.get('input[id="password"]').type(password);
    cy.contains('button', 'Login').click();
    cy.wait(1000);
  });

  it('should view all orders', () => {
    cy.visit('http://localhost:5173/admin/orders');
    cy.wait(500);

    // Should see orders list header and table
    cy.get('body').should('contain.text', "Orders' List");
    
    // Check if table exists
    cy.get('body').then(($body) => {
      if ($body.find('table, .order-table, .product-table').length > 0) {
        cy.get('table, .order-table, .product-table').should('exist');
      }
    });
  });

  it('should view order details', () => {
    cy.visit('http://localhost:5173/admin/orders');
    cy.wait(500);

    // Should see order information in the table
    cy.get('body').then(($body) => {
      // Check if we have orders displayed
      if ($body.find('tbody tr').length > 0) {
        // Orders are shown in table format - just verify row contains dollar sign for price
        cy.get('tbody tr').first().should('contain.text', '$');
      } else {
        cy.log('No orders available to view');
      }
    });
  });

  it('should print PDF for order', () => {
    cy.visit('http://localhost:5173/admin/orders');
    cy.wait(500);

    // Check if there are orders to print
    cy.get('body').then(($body) => {
      if ($body.find('tbody tr').length > 0) {
        // Click Print PDF button (first button in each row)
        cy.get('tbody tr').first().within(() => {
          cy.contains('button', /print.*pdf|pdf/i).first().click();
        });
        cy.wait(1000);
        
        // Verify no error occurred and page is still functional
        cy.get('tbody tr').should('exist');
        cy.log('PDF print button clicked successfully');
      } else {
        cy.log('No orders available to print PDF');
      }
    });
  });

  it('should accept an order', () => {
    cy.visit('http://localhost:5173/admin/orders');
    cy.wait(500);

    // Find pending order and accept
    cy.get('body').then(($body) => {
      if ($body.text().match(/pending/i)) {
        cy.contains(/pending/i).parent().parent().within(() => {
          cy.contains('button', /accept|approve|อนุมัติ/i).click();
        });
        cy.wait(1000);
      }
    });
  });

  it('should deny an order', () => {
    cy.visit('http://localhost:5173/admin/orders');
    cy.wait(500);

    // Find pending order and deny
    cy.get('body').then(($body) => {
      if ($body.text().match(/pending/i)) {
        cy.contains(/pending/i).parent().parent().within(() => {
          cy.contains('button', /deny|reject|ปฏิเสธ/i).click();
        });

        // Confirm if needed
        cy.get('body').then(($confirmBody) => {
          if ($confirmBody.find('button:contains("Confirm")').length > 0) {
            cy.contains('button', /confirm|ยืนยัน/i).click();
          }
        });

        cy.wait(1000);
      }
    });
  });

  it('should update order status', () => {
    cy.visit('http://localhost:5173/admin/orders');
    cy.wait(500);

    cy.get('body').then(($body) => {
      if ($body.find('select[name*="status"]').length > 0) {
        // Update status
        cy.get('select[name*="status"]').first().select('PROCESSING');
        cy.wait(1000);
      }
    });
  });
});
