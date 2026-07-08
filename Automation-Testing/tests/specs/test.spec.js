const { test, expect } = require('@playwright/test');

const LoginPage = require('../pages/LoginPage');
const HomePage = require('../pages/HomePage');
const data = require('../utils/testData');

test.describe('Home Module', () => {

    test.beforeEach(async ({ page }) => {
        const login = new LoginPage(page);

        await login.navigate();
        await login.login(data.email, data.password);
    });
});
   