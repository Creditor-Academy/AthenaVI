const { test, expect } = require('@playwright/test');

const LoginPage = require('../pages/LoginPage');
const SettingsPage = require('../pages/SettingsPage');

const data = require('../utils/testData');

test.describe('Settings - Billing Module', () => {

    test.beforeEach(async ({ page }) => {

        const login = new LoginPage(page);

        await login.navigate();
        await login.login(data.email, data.password);

    });

    // TC_SETTINGS_032
    test('TC_SETTINGS_032 - Verify Billing Tab Navigation', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openBilling();

    });

    // TC_SETTINGS_033
    test('TC_SETTINGS_033 - Verify Team Selection', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openBilling();

        await settings.selectUserTeam();
        await settings.selectKhushiTeam();

        if (await settings.membersTeamRadio.isEnabled()) {

            await settings.selectMembersTeam();

        } else {

            console.log('Members Team is disabled');
            await expect(settings.membersTeamRadio).toBeDisabled();

        }

    });

    // TC_SETTINGS_034
    test('TC_SETTINGS_034 - Verify Refresh Button', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openBilling();

        if (await settings.refreshButton.isEnabled()) {

            await settings.refreshBilling();
            await settings.refreshBilling();
            await settings.refreshBilling();

        } else {

            console.log('Refresh button is disabled');
            await expect(settings.refreshButton).toBeDisabled();

        }

    });

    // TC_SETTINGS_035
    test('TC_SETTINGS_035 - Verify Request More Storage', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openBilling();

        await settings.openFreePlan();

        if (await settings.requestStorageButton.isEnabled()) {

            await settings.clickRequestStorage();
            await settings.selectStorage('5');
            await settings.enterStorageReason('To store the data');
            await settings.sendStorageRequest();
            await settings.clickDone();

        } else {

            console.log('Request More Storage button is disabled');
            await expect(settings.requestStorageButton).toBeDisabled();

        }

    });

    // TC_SETTINGS_036
    test('TC_SETTINGS_036 - Verify Billing Sub Tabs', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openBilling();

        await settings.openCreditHistory();
        await settings.openStorageLedger();
        await settings.openUpgradeRequests();

    });

});