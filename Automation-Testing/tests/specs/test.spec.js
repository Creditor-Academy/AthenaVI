const { test ,expect } = require('@playwright/test');

const LoginPage = require('../pages/LoginPage');
const HomePage = require('../pages/HomePage');
const data = require('../utils/testData');

test.beforeEach(async ({ page }) => {

    const login = new LoginPage(page);

    await login.navigate();

    await login.login(data.email, data.password);

});

/* ==========================================
   TC_HOME_028
   Verify My Recent Empty State
========================================== */

test('TC_HOME_028 Verify My Recent Empty State', async ({ page }) => {

    const home = new HomePage(page);

    await home.openMyRecent();

    await home.verifyNoRecentItems();

});