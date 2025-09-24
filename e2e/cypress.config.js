const { defineConfig } = require("cypress");

module.exports = defineConfig({
    e2e: {
        baseUrl: "http://localhost:3000",
        supportFile: "cypress/support/e2e.js",
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
    },
    env: {
        API_BASE: "http://localhost:8080"
    }
});
