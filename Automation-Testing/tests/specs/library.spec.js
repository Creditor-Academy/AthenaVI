const { test, expect } = require('@playwright/test');

const LoginPage = require('../pages/LoginPage');
const LibraryPage = require('../pages/LibraryPage');

const data = require('../utils/testData');
const AxeBuilder = require('@axe-core/playwright').default;


test.describe('Library Module', () => {

    let library;

    test.beforeEach(async ({ page }) => {

        const login = new LoginPage(page);

        await login.navigate();
        await login.login(data.email, data.password);

        library = new LibraryPage(page);

    });

    test('TC_LIBRARY_001 - Verify Library Navigation', async () => {

        await library.openLibrary();

        await expect(library.library).toBeVisible();

    });

    test('TC_LIBRARY_002 - Verify Workspace Selection - Workspace 1', async () => {

        await library.openLibrary();

        await library.selectWorkspace('892852e8-1920-433e-a631-1deb71513c88');

        await expect(library.workspaceDropdown).toBeVisible();

    });

    test('TC_LIBRARY_003 - Verify Workspace Selection - Workspace 2', async () => {

        await library.openLibrary();

        await library.selectWorkspace('3ee14e23-7267-45a7-a51f-d95c1c725751');

        await expect(library.workspaceDropdown).toBeVisible();

    });

    test('TC_LIBRARY_004 - Verify Workspace Selection - Workspace 3', async () => {

        await library.openLibrary();

        await library.selectWorkspace('5134fed3-b7d6-42aa-9e8f-771b35d39355');

        await expect(library.workspaceDropdown).toBeVisible();

    });

    test('TC_LIBRARY_005 - Verify Workspace Selection - Workspace 4', async () => {

        await library.openLibrary();

        await library.selectWorkspace('2c910308-52de-4886-9e1b-96d361d843e5');

        await expect(library.workspaceDropdown).toBeVisible();

    });

    test('TC_LIBRARY_006 - Verify Workspace Selection - Workspace 5', async () => {

        await library.openLibrary();

        await library.selectWorkspace('3a50c6fa-e44b-47cd-b8a3-2b0d64365f35');

        await expect(library.workspaceDropdown).toBeVisible();

    });

    test('TC_LIBRARY_007 - Verify Media Navigation', async () => {

        await library.openLibrary();

        await library.selectWorkspace('892852e8-1920-433e-a631-1deb71513c88');

        await library.openMedia();

        await expect(library.media).toBeVisible();

    });

    test('TC_LIBRARY_008 - Verify Photos & Videos Section', async () => {

        await library.openLibrary();

        await library.selectWorkspace('892852e8-1920-433e-a631-1deb71513c88');

        await library.openMedia();

        await library.openPhotosVideos();

        await expect(library.photosVideos).toBeVisible();

    });

    test('TC_LIBRARY_009 - Verify Videos Tab', async () => {

        await library.openLibrary();

        await library.selectWorkspace('892852e8-1920-433e-a631-1deb71513c88');

        await library.openMedia();

        await library.openPhotosVideos();

        await library.openVideosTab();

        await expect(library.videosTab).toBeVisible();

    });

    test('TC_LIBRARY_010 - Verify Complete Library Media Videos Flow', async () => {

        await library.openLibrary();

        await library.selectWorkspace('892852e8-1920-433e-a631-1deb71513c88');

        await library.openMedia();

        await library.openPhotosVideos();

        await library.openVideosTab();

        await expect(library.videosTab).toBeVisible();

    });

    test('TC_LIBRARY_011 - Verify Search Assets Textbox', async () => {

    await library.navigateToVideos('892852e8-1920-433e-a631-1deb71513c88');

    await library.searchAsset('avatar');

    await expect(library.searchAssets).toHaveValue('avatar');

});

test('TC_LIBRARY_012 - Verify Search Asset Functionality', async () => {

    await library.navigateToVideos('892852e8-1920-433e-a631-1deb71513c88');

    await library.searchAsset('avatar');

    await expect(library.searchAssets).toHaveValue('avatar');

});
test('TC_LIBRARY_020 - Verify Fonts Tab Navigation', async () => {

    await library.openLibrary();

    await library.openFonts();

    await expect(library.fonts).toBeVisible();

});

test('TC_LIBRARY_021 - Verify Templates Tab Navigation', async () => {

    await library.openLibrary();

    await library.openTemplates();

    await expect(library.templates).toBeVisible();

});

test('TC_LIBRARY_022 - Verify Storage Icon Click', async () => {

    await library.openLibrary();

    await library.clickStorageIcon();

    await expect(library.storageIcon).toBeVisible();

});

test('TC_LIBRARY_023 - Verify Library Sections Navigation', async () => {

    await library.openLibrary();

    await library.openMusic();

    await library.openFonts();

    await library.openTemplates();

    await library.clickStorageIcon();

    await expect(library.templates).toBeVisible();

});
test('TC_LIB_024 - Verify Grid and List View Toggle', async () => {

    await library.openLibrary();

    await library.openListView();
    await expect(library.listView).toBeVisible();

    await library.openGridView();
    await expect(library.gridView).toBeVisible();

});
test('TC_LIB_025 - Verify Library Responsive Layout', async ({ page }) => {

    // Open Library first on desktop
    await library.openLibrary();

    // Mobile
    await page.setViewportSize({
        width:320,
        height:640
    });

    await expect(library.media).toBeVisible();

    // Tablet
    await page.setViewportSize({
        width:768,
        height:1024
    });

    await expect(library.media).toBeVisible();

    // Desktop
    await page.setViewportSize({
        width:1440,
        height:900
    });

    await expect(library.media).toBeVisible();

});

});