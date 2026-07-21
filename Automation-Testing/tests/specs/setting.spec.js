const { test } = require('@playwright/test');

const LoginPage = require('../pages/LoginPage');
const SettingsPage = require('../pages/SettingsPage');

const data = require('../utils/testData');

test.describe('Settings Module', () => {

    test.beforeEach(async ({ page }) => {

        const login = new LoginPage(page);

        await login.navigate();
        await login.login(data.email, data.password);

    });

    // TC_SETTINGS_001
    test('TC_SETTINGS_001 - Verify Settings Tabs Navigation', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openAppearance();
        await settings.openNotifications();
        await settings.openSecurity();
        await settings.openBilling();
        await settings.openAppearance();

    });
    // TC_SETTINGS_002
    test('TC_SETTINGS_002 - Verify Appearance Tab Navigation', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openAppearance();

    });

    // TC_SETTINGS_003
    test('TC_SETTINGS_003 - Verify Dark Theme Selection', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openAppearance();
        await settings.selectDarkTheme();

    });

    // TC_SETTINGS_004
    test('TC_SETTINGS_004 - Verify Light Theme Selection', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openAppearance();
        await settings.selectLightTheme();

    });

    // TC_SETTINGS_005
    test('TC_SETTINGS_005 - Verify Original Theme Selection', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openAppearance();
        await settings.selectOriginalTheme();

    });

    // TC_SETTINGS_006
    test('TC_SETTINGS_006 - Verify Ocean Theme Selection', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openAppearance();
        await settings.selectOceanTheme();

    });

    // TC_SETTINGS_007
    test('TC_SETTINGS_007 - Verify Forest Theme Selection', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openAppearance();
        await settings.selectForestTheme();

    });

    // TC_SETTINGS_008
    test('TC_SETTINGS_008 - Verify Sunset Theme Selection', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openAppearance();
        await settings.selectSunsetTheme();

    });

    // TC_SETTINGS_009
    test('TC_SETTINGS_009 - Verify Custom Accent Color Picker', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openAppearance();
        await settings.openCustomAccent();
        await settings.clickColorPreview();

    });

    // TC_SETTINGS_010
    test('TC_SETTINGS_010 - Verify Accent Color Selection', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openAppearance();
        await settings.openCustomAccent();

        await settings.selectBlueAccent();
        await settings.selectPurpleAccent();
        await settings.selectSkyAccent();
        await settings.selectOrangeAccent();
        await settings.selectPinkAccent();

    });

    // TC_SETTINGS_011
    test('TC_SETTINGS_011 - Verify Apply Changes Button', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openAppearance();

        await settings.selectDarkTheme();
        await settings.applyThemeChanges();

    });

    // TC_SETTINGS_012
    test('TC_SETTINGS_012 - Verify Notifications Tab Navigation', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openNotifications();

    });

    // TC_SETTINGS_013
    test('TC_SETTINGS_013 - Verify Push Notifications Toggle', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openNotifications();

        await settings.enablePushNotifications();
        await settings.disablePushNotifications();

    });

    // TC_SETTINGS_014
    test('TC_SETTINGS_014 - Verify Comments and Mentions Toggle', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openNotifications();

        await settings.enableCommentsMentions();
        await settings.disableCommentsMentions();

    });

    // TC_SETTINGS_015
    test('TC_SETTINGS_015 - Verify Weekly Digest Email Toggle', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openNotifications();

        await settings.enableWeeklyDigest();
        await settings.disableWeeklyDigest();

    });

    // TC_SETTINGS_016
    test('TC_SETTINGS_016 - Verify Product Emails Toggle', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openNotifications();

        await settings.enableProductEmails();
        await settings.disableProductEmails();

    });

    // TC_SETTINGS_017
    test('TC_SETTINGS_017 - Verify Video Export Alerts Toggle', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openNotifications();

        await settings.enableVideoExportAlerts();
        await settings.disableVideoExportAlerts();

    });

    // TC_SETTINGS_018
    test('TC_SETTINGS_018 - Verify Workspace Video Export Alerts Toggle', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openNotifications();

        await settings.toggleWorkspaceVideoExportAlerts();

    });

    // TC_SETTINGS_019
    test('TC_SETTINGS_019 - Verify Storage Alerts Toggle', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openNotifications();

        await settings.enableStorageAlerts();
        await settings.disableStorageAlerts();

    });

    // TC_SETTINGS_020
    test('TC_SETTINGS_020 - Verify Credits Alerts Toggle', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openNotifications();

        await settings.enableCreditsAlerts();
        await settings.disableCreditsAlerts();

    });

    // TC_SETTINGS_021
    test('TC_SETTINGS_021 - Verify Team & Platform Admin Alerts Toggle', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openNotifications();

        await settings.enableWorkspaceTeamAlerts();
        await settings.disableWorkspaceTeamAlerts();

        await settings.enablePlatformAdminAlerts();
        await settings.disablePlatformAdminAlerts();

    });

    // TC_SETTINGS_022
    test('TC_SETTINGS_022 - Verify Security Tab Navigation', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openSecurity();

    });

    // TC_SETTINGS_023
    test('TC_SETTINGS_023 - Verify Current Password Field', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openSecurity();

        await settings.enterCurrentPassword('Khushi@123');

    });

    // TC_SETTINGS_024
    test('TC_SETTINGS_024 - Verify New Password Field', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openSecurity();

        await settings.enterNewPassword('khushi@123');

    });

    // TC_SETTINGS_025
    test('TC_SETTINGS_025 - Verify Confirm Password Field', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openSecurity();

        await settings.enterConfirmPassword('khushi@123');

    });

    // TC_SETTINGS_026
    test('TC_SETTINGS_026 - Verify Password Update', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openSecurity();

        await settings.enterCurrentPassword('Khushi@123');
        await settings.enterNewPassword('khushi@123');
        await settings.enterConfirmPassword('khushi@123');

        await settings.clickUpdatePassword();

    });

    // TC_SETTINGS_027
    test('TC_SETTINGS_027 - Verify Empty Current Password', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openSecurity();

        await settings.clearCurrentPassword();

    });

    // TC_SETTINGS_028
    test('TC_SETTINGS_028 - Verify Login Alerts Toggle ON/OFF', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openSecurity();

        await settings.toggleLoginAlerts();
        await settings.toggleLoginAlerts();

    });

    // TC_SETTINGS_029
    test('TC_SETTINGS_029 - Verify Multiple Login Alerts Toggle', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openSecurity();

        await settings.toggleLoginAlerts();
        await settings.toggleLoginAlerts();
        await settings.toggleLoginAlerts();
        await settings.toggleLoginAlerts();

    });

    // TC_SETTINGS_030
    test('TC_SETTINGS_030 - Verify Password Fields', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openSecurity();

        await settings.enterCurrentPassword('Khushi@123');
        await settings.enterNewPassword('khushi@123');
        await settings.enterConfirmPassword('khushi@123');

    });

    // TC_SETTINGS_031
    test('TC_SETTINGS_031 - Verify Complete Security Workflow', async ({ page }) => {

        const settings = new SettingsPage(page);

        await settings.openSettings();
        await settings.openSecurity();

        await settings.enterCurrentPassword('Khushi@123');
        await settings.enterNewPassword('khushi@123');
        await settings.enterConfirmPassword('khushi@123');

        await settings.clickUpdatePassword();

        await settings.toggleLoginAlerts();
        await settings.toggleLoginAlerts();

    });

    test('TC_SETTINGS_032- Verify Login Alerts ON to OFF', async ({ page }) => {

    const settings = new SettingsPage(page);

    await settings.openSettings();
    await settings.openSecurity();

    await page.waitForTimeout(2000);

    // ON -> OFF
    await settings.toggleLoginAlerts();

    // Verify OFF state is visible
    await expect(settings.loginAlertsOff).toBeVisible({ timeout: 5000 });

    await page.waitForTimeout(2000);

});

// TC_SETTINGS_029
test('TC_SETTINGS_033 - Verify Login Alerts OFF to ON', async ({ page }) => {

    const settings = new SettingsPage(page);

    await settings.openSettings();
    await settings.openSecurity();

    // Wait before toggling
    await page.waitForTimeout(2000);

    // OFF -> ON
    await settings.toggleLoginAlerts();

    // Wait after toggling
    await page.waitForTimeout(2000);

});

// TC_SETTINGS_030
test('TC_SETTINGS_034 - Verify Login Alerts Toggle Multiple Times', async ({ page }) => {

    const settings = new SettingsPage(page);

    await settings.openSettings();
    await settings.openSecurity();

    // ON -> OFF
    await settings.toggleLoginAlerts();

    // OFF -> ON
    await settings.toggleLoginAlerts();

    // ON -> OFF
    await settings.toggleLoginAlerts();

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