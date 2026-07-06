const { expect } = require('@playwright/test');

class LoginPage {

    constructor(page) {
        this.page = page;

        this.email = page.locator('#signin-email');
        this.password = page.locator('#signin-password');
        this.loginBtn = page.getByRole('button', { name: 'Log in' });

        // Dashboard locator
        this.dashboardLogo = page.locator('.dashboard-sidebar-brand-name');
        // OR
         // this.dashboardLogo = page.getByText('Virtual Studio');
    }

    async navigate() {
        await this.page.goto('http://localhost:5173/login');
    }

    async login(email, password) {
        await this.email.fill(email);
        await this.password.fill(password);
        await this.loginBtn.click();
    }

      async verifyDashboardLoaded() {
        await expect(this.dashboardLogo).toBeVisible({ timeout: 10000 });
        await expect(this.dashboardLogo).toHaveText('Virtual Studio');
    }
}

module.exports = LoginPage;