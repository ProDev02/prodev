// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- Custom command for logging in via API --
Cypress.Commands.add('loginViaApi', (userType = 'CUSTOMER') => {
  const credentials = {
    email: userType === 'ADMIN' ? 'admin@admin.com' : 'customer@customer.com',
    password: userType.toLowerCase(), // Use lowercase password: 'customer' or 'admin'
  };

  return cy.request({
    method: 'POST',
    // cy.request does not use baseUrl, so we provide the full backend URL
    url: 'https://muict.app/burrrtongg-backend/api/auth/login',
    body: {
      username: credentials.email,
      password: credentials.password,
    },
  }).then(response => {
    // Cypress.env can store the token globally for the test run
    Cypress.env('authToken', response.body.token);
    return response.body; // Return the whole body for chaining
  });
});

// -- Custom command to create an order via API --
Cypress.Commands.add('createOrderViaApi', () => {
  // First, log in as a customer to get a valid token and customer ID
  cy.loginViaApi('CUSTOMER').then(customer => {
    const authToken = Cypress.env('authToken');
    const customerId = customer.id; // Use the actual ID from the login response

    // Then, create an order using the customer's token and ID
    cy.request({
      method: 'POST',
      // cy.request does not use baseUrl, so we provide the full backend URL
      url: 'https://muict.app/burrrtongg-backend/api/orders',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: {
        customerId: customerId, // Use the dynamic customerId
        items: [
          { productId: 1, quantity: 1 },
          { productId: 2, quantity: 2 },
        ],
      },
    });
  });
});