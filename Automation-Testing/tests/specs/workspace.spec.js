const { test, expect } = require('@playwright/test');

const LoginPage = require('../pages/LoginPage');
const WorkspacePage = require('../pages/WorkspacePage');

const data = require('../utils/testData');

test.describe('Workspace Module', () => {

    test.beforeEach(async ({ page }) => {

        const login = new LoginPage(page);

        await login.navigate();

        await login.login(data.email, data.password);

    });

    test('TC_WORKSPACE_001 - Verify Workspace Dashboard', async ({ page }) => {

        const workspace = new WorkspacePage(page);

        await workspace.openWorkspace();

        await workspace.verifyWorkspacePage();

    });

    test('TC_WORKSPACE_002 - Verify Grid/List View', async ({ page }) => {

        const workspace = new WorkspacePage(page);

        await workspace.openWorkspace();

        await workspace.changeView();

    });

    test('TC_WORKSPACE_003 - Verify Sorting Options', async ({ page }) => {

        const workspace = new WorkspacePage(page);

        await workspace.openWorkspace();

        await workspace.verifySorting();

    });

    test('TC_WORKSPACE_004 - Verify Invitations Popup', async ({ page }) => {

        const workspace = new WorkspacePage(page);

        await workspace.openWorkspace();

        await workspace.verifyInvitations();

    });

    test('TC_005- Verify Grid/List View Toggle', async ({ page }) => {

    const workspace = new WorkspacePage(page);

    await workspace.openWorkspace();
    await workspace.verifyViewToggle();

});

test('TC_007 - Verify Default Sort Order', async ({ page }) => {

    const workspace = new WorkspacePage(page);

    await workspace.openWorkspace();
    await workspace.verifyDefaultSorting();

});

test('TC_008 - Verify Invites Inbox', async ({ page }) => {

    const workspace = new WorkspacePage(page);

    await workspace.openWorkspace();
    await workspace.verifyInvitesInbox();

});
test('TC_009 - Verify Invites Inbox Navigation', async ({ page }) => {

    const workspace = new WorkspacePage(page);

    await workspace.openWorkspace();

    await workspace.openInvitesInbox();

});
test('TC_010 - Verify Create New Video', async ({ page }) => {

    const workspace = new WorkspacePage(page);

    await workspace.openWorkspace();

    await workspace.openCreateNewVideo();

});
test('TC_WS_011- Verify Personal Workspace Options', async ({ page }) => {

    const workspace = new WorkspacePage(page);

    await workspace.openWorkspace();

    await workspace.verifyWorkspaceOptions();

});
test('TC_WS_012 - Verify Rename Workspace and Workspace Details', async ({ page }) => {

        const workspace = new WorkspacePage(page);

        await workspace.openWorkspace();

        await workspace.renameWorkspace();

        await workspace.verifyWorkspaceDetails();

    });
    test('TC_WS_013 - Verify Workspace Details', async ({ page }) => {

    const workspace = new WorkspacePage(page);

    await workspace.openWorkspace();

    await workspace.verifyWorkspacePage();

    await workspace.verifyWorkspaceDetails();

});
test('TC_WS_014 - Verify Create New Workspace', async ({ page }) => {

    const workspace = new WorkspacePage(page);

    await workspace.openWorkspace();

    await workspace.verifyWorkspacePage();

    await this.page.waitForTimeout(6000);

    await workspace.createNewWorkspace();

});
test('TC_WS_015 - Verify Open Workspace and Rename Workspace', async ({ page }) => {

        const workspace = new WorkspacePage(page);
        await workspace.openWorkspace();
        await workspace.verifyWorkspacePage();
        await workspace.openAndRenameWorkspace();

    });

    test('TC_WS_016 - Verify Open Workspace and Rename Workspace', async ({ page }) => {

        const workspace = new WorkspacePage(page);

        // Open Workspace page
        await workspace.openWorkspace();

        // Verify Workspace page
        await workspace.verifyWorkspacePage();

        // Open a workspace and rename it
        await workspace.openAndRenameWorkspace();

    });
     test('TC_WS_017 - Verify Invite Member to Workspace', async ({ page }) => {

    const workspace = new WorkspacePage(page);

    await workspace.openWorkspace();

    await workspace.verifyWorkspacePage();

    await workspace.inviteMemberToWorkspace();

});
 test('TC_WS_018 - Verify Transfer Credits to Workspace', async ({ page }) => {

    const workspace = new WorkspacePage(page);

    await workspace.openWorkspace();

    await workspace.verifyWorkspacePage();

    await workspace.transferCreditsToWorkspace();

});
test('TC_WS_019 - Verify Workspace Details', async ({ page }) => {

    const workspace = new WorkspacePage(page);

    await workspace.openWorkspace();

    await workspace.verifyWorkspacePage();

    await workspace.verifyWorkspaceDetails();

});

});