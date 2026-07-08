const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const data = require('../utils/testData');

test.describe('Login Module', () => {

    test('TC_LOGIN_001 - Verify login with empty email and password', async ({ page }) => {
        const login = new LoginPage(page);

        await login.navigate();
        await login.login('', '');

        await expect(page).toHaveURL(/login/);
    });

    test('TC_LOGIN_002 - Verify login with invalid email format', async ({ page }) => {
        const login = new LoginPage(page);

        await login.navigate();
        await login.login('khushi', 'Password123');

        await expect(page).toHaveURL(/login/);
    });

    test('TC_LOGIN_003 - Verify login with valid email and incorrect password', async ({ page }) => {
        const login = new LoginPage(page);

        await login.navigate();
        await login.login(data.email, 'WrongPassword');

        await expect(page).toHaveURL(/login/);
    });

    test('TC_LOGIN_004 - Verify login with incorrect email and valid password', async ({ page }) => {
        const login = new LoginPage(page);

        await login.navigate();
        await login.login('wronguser@gmail.com', data.password);

        await expect(page).toHaveURL(/login/);
    });

    test('TC_LOGIN_005 - Verify login with valid email and valid password', async ({ page }) => {
        const login = new LoginPage(page);

        await login.navigate();
        await login.login(data.email, data.password);

        await page.waitForLoadState('networkidle');

        await expect(page).not.toHaveURL(/login/);
        await expect(page.getByText('Home', { exact: true })).toBeVisible();
    });

});