//IdeaProjects/e2e/cypress.config.js
const { defineConfig } = require("cypress");

module.exports = defineConfig({
    e2e: {
        baseUrl: "http://localhost:3000",
        supportFile: "cypress/support/e2e.js",
        specPattern: "cypress/e2e/**/*.cy.js",
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
        experimentalMemoryManagement: true,
        video: false,
    },
    env: {
        API_BASE: "https://muict.app/prodev-backend"
    }
});
