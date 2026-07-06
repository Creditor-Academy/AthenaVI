const { test } = require('@playwright/test');

const LoginPage = require('../pages/LoginPage');
const HomePage = require('../pages/HomePage');
const data = require('../utils/testData');

test.beforeEach(async ({ page }) => {

    const login = new LoginPage(page);

    await login.navigate();

    await login.login(data.email, data.password);

});

/* ==========================================
   TC_HOME_014
   Verify Logout from Profile Menu
========================================== */

test('TC_HOME_014 Verify Logout from Profile Menu', async ({ page }) => {

    const home = new HomePage(page);

    // Click Profile Avatar
    await home.clickProfileAvatar();

    // Verify Logout option is visible
    await home.verifyLogoutOption();

    // Click Logout
    await home.clickLogout();

    // Verify Login page
    await home.verifyLoginPage();

});