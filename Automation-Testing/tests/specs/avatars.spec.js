const { test, expect } = require('@playwright/test');

const LoginPage = require('../pages/LoginPage');
const AvatarsPage = require('../pages/AvatarsPage');

const data = require('../utils/testData');

test.describe('Avatars Module', () => {

    test.beforeEach(async ({ page }) => {

        const login = new LoginPage(page);

        await login.navigate();

        await login.login(data.email, data.password);

    });

    test('TC_AVATARS_001 - Verify Avatars Page Navigation', async ({ page }) => {

        const avatars = new AvatarsPage(page);

        await avatars.openAvatars();

        await avatars.verifyAvatarsPage();

    });

    test('TC_AVATARS_002 - Verify Public Library Tab', async ({ page }) => {

        const avatars = new AvatarsPage(page);

        await avatars.openAvatars();

        await avatars.openPublicLibrary();

    });

    test('TC_AVATARS_003 - Verify My Avatars Tab', async ({ page }) => {

        const avatars = new AvatarsPage(page);

        await avatars.openAvatars();

        await avatars.openMyAvatars();

    });

    test('TC_AVATARS_004 - Verify Team Shared Tab', async ({ page }) => {

        const avatars = new AvatarsPage(page);

        await avatars.openAvatars();

        await avatars.openTeamShared();

    });

    test('TC_AVATARS_005 - Verify Avatar Tabs Navigation', async ({ page }) => {

        const avatars = new AvatarsPage(page);

        await avatars.openAvatars();

        await avatars.verifyTabs();

    });

    test('TC_AVATARS_006 - Verify Grid and List View Toggle', async ({ page }) => {

        const avatars = new AvatarsPage(page);

        await avatars.openAvatars();

        await avatars.verifyViewToggle();

    });

    test('TC_AVATARS_007 - Verify Complete Avatar Navigation Flow', async ({ page }) => {

        const avatars = new AvatarsPage(page);

        await avatars.openAvatars();

        await avatars.verifyTabs();

        await avatars.verifyViewToggle();

    });

    // TC_AVATARS_010
test('TC_AVATARS_010 - Verify All Avatars Filter', async ({ page }) => {

    const avatars = new AvatarsPage(page);

    await avatars.openAvatars();

    await avatars.openPublicLibrary();

    await avatars.filterAllAvatars();

});

// TC_AVATARS_011
test('TC_AVATARS_011 - Verify Female Filter', async ({ page }) => {

    const avatars = new AvatarsPage(page);

    await avatars.openAvatars();

    await avatars.openPublicLibrary();

    await avatars.filterFemale();

});

// TC_AVATARS_012
test('TC_AVATARS_012 - Verify Male Filter', async ({ page }) => {

    const avatars = new AvatarsPage(page);

    await avatars.openAvatars();

    await avatars.openPublicLibrary();

    await avatars.filterMale();

});

// TC_AVATARS_013
test('TC_AVATARS_013 - Verify Unknown Gender Filter', async ({ page }) => {

    const avatars = new AvatarsPage(page);

    await avatars.openAvatars();

    await avatars.openPublicLibrary();

    await avatars.filterUnknownGender();

});

});