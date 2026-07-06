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
   TC_HOME_001
   Verify Sidebar Menu Items
========================================== */

test('TC_HOME_001 Verify Sidebar Menu Items', async ({ page }) => {

    const home = new HomePage(page);

    await home.verifySidebar();

});

/* ==========================================
   TC_HOME_002
   Verify Sidebar Navigation
========================================== */

test('TC_HOME_002 Verify Sidebar Navigation', async ({ page }) => {

    const home = new HomePage(page);

    await home.clickWorkspace();
    await home.verifyWorkspacePage();

    await home.clickMyVideos();
    await home.verifyMyVideosPage();

    await home.clickLibrary();
    await home.verifyLibraryPage();

    await home.clickAvatars();
    await home.verifyAvatarsPage();

    await home.clickVoices();
    await home.verifyVoicesPage();

    await home.clickSettings();
    await home.verifySettingsPage();

});

/* ==========================================
   TC_HOME_003
   Verify Active Home Menu
========================================== */

test('TC_HOME_003 Verify Active Home Menu', async ({ page }) => {

    const home = new HomePage(page);

    await home.verifyActiveHome();

});

/* ==========================================
   TC_HOME_004
   Verify Search Dashboard
========================================== */

test('TC_HOME_004 Verify Search Dashboard', async ({ page }) => {

    const home = new HomePage(page);

    await home.verifySearchBar();
    await home.verifySearchPlaceholder();
    await home.verifySearchShortcut();

});

/* ==========================================
   TC_HOME_005
   Verify Ctrl + K Shortcut
========================================== */

test('TC_HOME_005 Verify Ctrl + K Shortcut', async ({ page }) => {

    const home = new HomePage(page);

    await home.openSearchWithShortcut();

});

/* ==========================================
   TC_HOME_006
   Verify Search with Valid Keyword
========================================== */

test.only('Debug Ctrl + K', async ({ page }) => {

    const home = new HomePage(page);

    await page.pause();

    await home.openSearchWithShortcut();

});

/* ==========================================
   TC_HOME_007
   Verify Search with Invalid Keyword
========================================== */

test('TC_HOME_007 Verify Search with Invalid Keyword', async ({ page }) => {

    const home = new HomePage(page);

    await home.searchDashboard('zzzxyz123');

    await home.verifyNoSearchResults();

});

/* ==========================================
   TC_HOME_008
   Verify Search with Special Characters
========================================== */

test('TC_HOME_008 Verify Search with Special Characters', async ({ page }) => {

    const home = new HomePage(page);

    const longText = '!@#$%^&*()'.repeat(50);

    await home.searchSpecialCharacters(longText);

});

/* ==========================================
   TC_HOME_009
   Verify Create Button
========================================== */

test('TC_HOME_009 Verify Create Button', async ({ page }) => {

    const home = new HomePage(page);

    await home.verifyCreateButton();

    await home.clickCreateButton();

});

/* ==========================================
   TC_HOME_010
   Verify Notification Bell
========================================== */

test('TC_HOME_010 Verify Notification Bell', async ({ page }) => {

    const home = new HomePage(page);

    await home.verifyNotificationBell();

});
/* ==========================================
   TC_HOME_011
   Verify Notification Panel
========================================== */

test('TC_HOME_011 Verify Notification Panel', async ({ page }) => {

    const home = new HomePage(page);

    await home.verifyNotificationBell();

    await home.clickNotificationBell();

    await home.verifyNotificationPanel();

});

/* ==========================================
   TC_HOME_012
   Verify Credits Panel
========================================== */

test('TC_HOME_012 Verify Credits Panel', async ({ page }) => {

    const home = new HomePage(page);

    await home.verifyCreditsIcon();

    await home.clickCreditsIcon();

    await home.verifyCreditsPanel();

});

/* ==========================================
   TC_HOME_013
   Verify User Avatar Opens Profile Menu
========================================== */

test('TC_HOME_013 Verify User Avatar Opens Profile Menu', async ({ page }) => {

    const home = new HomePage(page);
    await home.verifyProfileAvatar();
    await home.clickProfileAvatar();

    await home.verifyProfileOption();
    await home.clickProfileOption();

});
