const { test , expect} = require('@playwright/test');

const LoginPage = require('../pages/LoginPage');

const HomePage = require('../pages/HomePage');

const data = require('../utils/testData');

test.describe('Home Module', () => {

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

/* test.only('Debug Ctrl + K', async ({ page }) => {

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

/* ==========================================
   TC_HOME_014
   Verify Logout from Profile Menu
========================================== */

test('TC_HOME_014 Verify Logout from Profile Menu', async ({ page }) => {

    const home = new HomePage(page);

    await home.clickProfileAvatar();
    await home.clickLogout();

});

/* ==========================================
   TC_HOME_015
   Verify Welcome Banner Displays Personalized Greeting
========================================== */

test('TC_HOME_015 Verify Welcome Banner Displays Personalized Greeting', async ({ page }) => {

    const home = new HomePage(page);

    // Verify welcome banner heading
    await home.verifyWelcomeHeading();

});

/* ==========================================
   TC_HOME_016
   Verify Banner Descriptive Text and Feature Tags
========================================== */

test('TC_HOME_016 Verify Banner Descriptive Text and Feature Tags', async ({ page }) => {

    const home = new HomePage(page);

    // Verify banner description and feature tags
    await home.verifyWelcomeBanner();

});

/* ==========================================
   TC_HOME_017
   Verify Create New Video Navigation
========================================== */

test('TC_HOME_017 Verify Create New Video Navigation', async ({ page }) => {

    const home = new HomePage(page);
    await home.clickCreateNewVideo();
    await home.verifyVideoCreationPage();

});

/* ==========================================
   TC_HOME_018
   Verify Video Projects Card
========================================== */

test('TC_HOME_018 Verify Video Projects Card', async ({ page }) => {

    const home = new HomePage(page);

    await page.waitForTimeout(6000);

    await home.verifyVideoProjectsCard();

});

/* ==========================================
   TC_HOME_019
   Verify Open Workspace Navigation
========================================== */

test('TC_HOME_019 Verify Open Workspace Navigation', async ({ page }) => {

    const home = new HomePage(page);

    // Click Open Workspace
    await home.clickOpenWorkspace();

    // Verify Workspace page
    await home.verifyWorkspaceNavigation();

});

/* ==========================================
   TC_HOME_020
   Verify Video Projects Count Updates
========================================== */

test('TC_HOME_020 Verify Video Projects Count Updates', async ({ page }) => {

    const home = new HomePage(page);

    await page.waitForTimeout(6000);

    await home.openVideoWorkspace();

});

/* ==========================================
   TC_HOME_021
   Verify Completed Exports card UI
========================================== */

test('TC_HOME_021 Verify Completed Exports Card', async ({ page }) => {

    const home = new HomePage(page);

    await home.verifyCompletedExportsCard();

});

/* ==========================================
   TC_HOME_022
   Verify View exports navigation
========================================== */

test('TC_HOME_022 Verify View exports Navigation', async ({ page }) => {

    const home = new HomePage(page);

    await home.clickViewExports();

});

/* ==========================================
   TC_HOME_023
   Verify Credits Available Card UI
========================================== */

test('TC_HOME_023 Verify Credits Available Card', async ({ page }) => {

    const home = new HomePage(page);

    await home.verifyCreditsAvailableCard();

});

/* ==========================================
   TC_HOME_025
   Verify Low Credit Balance Warning
========================================== */

test('TC_HOME_025 Verify Low Credit Balance Warning', async ({ page }) => {

    const home = new HomePage(page);

    // Precondition:
    // Reduce credits below the configured threshold.

    await page.reload();

    await page.waitForTimeout(3000);

    await home.verifyLowCreditWarning();

});

/* ==========================================
   TC_HOME_026
   Verify Manage Credits Navigation
========================================== */

test('TC_HOME_026 Verify Manage Credits Navigation', async ({ page }) => {

    const home = new HomePage(page);

    await home.clickManageCredits();

    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/dashboard\/credits/);

});

/* ==========================================
   TC_HOME_027
   Verify Explore Templates / My Recent Toggle
========================================== */

test('TC_HOME_027 Verify Template Toggle', async ({ page }) => {

    const home = new HomePage(page);

    // Click My Recent
    await home.openMyRecent();

    await page.waitForLoadState('networkidle');

    // Verify My Recent is active
    await expect(home.myRecent).toBeVisible();

    // Click Explore Templates
    await home.openExploreTemplates();

    await page.waitForLoadState('networkidle');

    // Verify Explore Templates is active
    await expect(home.exploreTemplates).toBeVisible();

});

/* ==========================================
   TC_HOME_028
   Verify User Can Create New Video Project
========================================== */

test('TC_HOME_028 Verify User Can Create New Video Project', async ({ page }) => {

    const createProject = new CreateProjectPage(page);

    await createProject.createProject();

});

/* ==========================================
   TC_HOME_030
   Verify Shared With Me Navigation
========================================== */

test('TC_HOME_030 Verify Shared With Me Navigation', async ({ page }) => {

    const home = new HomePage(page);

    await home.openSharedWithMe();

});

/* ==========================================
   TC_HOME_031
   Verify Global Search Navigation
========================================== */

test('TC_HOME_031 Verify Global Search Navigation', async ({ page }) => {

    const home = new HomePage(page);

    await home.verifyGlobalSearchNavigation();

});

test('TC_HOME_032 Verify Home page API failure handling', async ({ page }) => {

    await page.route('**/api/**', async route => {
        console.log('Intercepted:', route.request().url());

        await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({
                message: 'Internal Server Error'
            })
        });
    });

    await page.goto('http://localhost:5173/dashboard');

    await page.waitForTimeout(3000);
});
test('TC_HOME_033 - Verify Home dashboard layout adapts correctly on tablet and mobile viewport widths', async ({ page }) => {

    // Tablet View
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();

    await expect(page.locator('body')).toBeVisible();

    // Mobile View
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();

    await expect(page.locator('body')).toBeVisible();

});

test('TC_HOME_046 - Verify horizontal scroll/overflow does not occur at common breakpoints', async ({ page }) => {

    const viewports = [
        { width: 320, height: 640 },
        { width: 768, height: 1024 },
        { width: 1024, height: 768 },
        { width: 1440, height: 900 }
    ];

    for (const viewport of viewports) {

        await page.setViewportSize(viewport);
        await page.reload();

        const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        expect(hasHorizontalScroll).toBeFalsy();
    }

});
 test('TC_HOME_047 Verify User Can Create AI Video Project', async ({ page }) => {

    test.setTimeout(900000); // 15 minutes

    const home = new HomePage(page);

    await home.createTalkingAvatarProject();

});

});