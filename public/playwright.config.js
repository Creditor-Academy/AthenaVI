const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({

  testDir: './specs',

  timeout: 60000,

  use: {
    baseURL: 'http://localhost:5173',
    headless: false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure'
  }

});