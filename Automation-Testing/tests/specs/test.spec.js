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

   test('TC_HOME_047 Verify User Can Create AI Video Project', async ({ page }) => {

    test.setTimeout(900000); // 15 minutes

    const home = new HomePage(page);

    await home.createTalkingAvatarProject();

});
});
   