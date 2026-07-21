const { test, expect } = require('@playwright/test');

const LoginPage = require('../pages/LoginPage');
const MyVideosPage = require('../pages/MyVideosPage');

const data = require('../utils/testData');

test.describe('My Videos Module', () => {

    test.beforeEach(async ({ page }) => {

        const login = new LoginPage(page);

        await login.navigate();

        await login.login(data.email, data.password);

    });

    test('TC_MYVIDEOS_001 - Verify My Videos Dashboard', async ({ page }) => {

        const myVideos = new MyVideosPage(page);

        await myVideos.openMyVideos();

        await myVideos.verifyMyVideosPage();

    });

    test('TC_MYVIDEOS_002 - Verify Video Tabs', async ({ page }) => {

        const myVideos = new MyVideosPage(page);

        await myVideos.openMyVideos();

        await myVideos.verifyTabs();

    });

    test('TC_MYVIDEOS_003 - Verify Grid and List View', async ({ page }) => {

        const myVideos = new MyVideosPage(page);

        await myVideos.openMyVideos();

        await myVideos.verifyViewToggle();

    });

    test('TC_MYVIDEOS_004 - Verify Search Video', async ({ page }) => {

        const myVideos = new MyVideosPage(page);

        await myVideos.openMyVideos();

        await myVideos.searchVideo('Choose Avatar');

    });

    test('TC_MYVIDEOS_005 - Verify Filter Options', async ({ page }) => {

        const myVideos = new MyVideosPage(page);

        await myVideos.openMyVideos();

        await myVideos.verifyFilters();

    });

    test('TC_MYVIDEOS_006 - Verify Sort Options', async ({ page }) => {

        const myVideos = new MyVideosPage(page);

        await myVideos.openMyVideos();

        await myVideos.verifySorting();

    });

    test('TC_MYVIDEOS_007 - Verify Group By Options', async ({ page }) => {

        const myVideos = new MyVideosPage(page);

        await myVideos.openMyVideos();

        await myVideos.verifyGrouping();

    });

    test('TC_MYVIDEOS_008 - Verify Complete My Videos Flow', async ({ page }) => {

        const myVideos = new MyVideosPage(page);

        await myVideos.openMyVideos();

        await myVideos.verifyCompleteFlow();

    });

    test('TC_MYVIDEOS_009 - Verify Search with No Results', async ({ page }) => {

    const myVideos = new MyVideosPage(page);

    await myVideos.openMyVideos();

    await myVideos.searchVideo('InvalidVideoName12345');

    // Add verification for "No videos found" if available
    // await expect(page.getByText('No videos found')).toBeVisible();

});
test('TC_MYVIDEOS_011 - Verify My Videos Page Header', async ({ page }) => {

        const myVideos = new MyVideosPage(page);

        await myVideos.openMyVideos();

        await myVideos.verifyPageHeader();

    });

    // TC_MYVIDEOS_012
    test('TC_MYVIDEOS_012 - Verify Grid and List View Toggle', async ({ page }) => {

        const myVideos = new MyVideosPage(page);

        await myVideos.openMyVideos();

        await myVideos.verifyViewToggle();

    });

    // TC_MYVIDEOS_013
    test('TC_MYVIDEOS_013 - Verify Create Video Button Navigation', async ({ page }) => {

    const myVideos = new MyVideosPage(page);

    await myVideos.openMyVideos();

    await myVideos.openCreateVideo();

    await myVideos.cancelCreateVideo();

});
    // TC_MYVIDEOS_014
    test('TC_MYVIDEOS_014 - Verify All Filter Tab', async ({ page }) => {

        const myVideos = new MyVideosPage(page);

        await myVideos.openMyVideos();

        await myVideos.verifyAllTab();

    });

});