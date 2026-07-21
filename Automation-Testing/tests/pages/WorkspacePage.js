const { expect } = require('@playwright/test');

class WorkspacePage {

    constructor(page) {

        this.page = page;

        /* ==========================
            Sidebar
        ========================== */

        this.workspace = page.getByRole('button', { name: 'Workspace' });

        /* ==========================
            Workspace Dashboard
        ========================== */

        this.creditText = page.getByText('151,026');

        this.gridView = page.getByRole('button', { name: 'Grid view' });
        this.listView = page.getByRole('button', { name: 'List view' });

        /* ==========================
            Sorting
        ========================== */

        this.sortNameAZ = page.getByRole('button', { name: 'Sort Name (A-Z)' });
        this.sortNameZA = page.getByRole('button', { name: 'Sort Name (Z-A)' });
        this.sortDateCreated = page.getByRole('button', { name: 'Sort Date Created' });
        this.sortLastModified = page.getByRole('button', { name: 'Sort Last Modified' });

        this.nameAZ = page.getByRole('option', { name: 'Name (A-Z)' });
        this.nameZA = page.getByRole('option', { name: 'Name (Z-A)' });
        this.dateCreated = page.getByRole('option', { name: 'Date Created' });
        this.lastModified = page.getByRole('option', { name: 'Last Modified' });

        /* ==========================
            Invitations
        ========================== */

        this.invitations = page.getByRole('button', { name: 'Invitations' });
        this.closeInvitations = page.getByRole('button', { name: 'Close invitations' });

        /* ==========================
            Create Video
        ========================== */

        this.createNewVideo = page.getByRole('button', { name: 'Create New Video' });
        this.cancel = page.getByRole('button', { name: 'Cancel' });
        this.discard = page.getByRole('button', { name: 'Discard' });

        /* ==========================
            Workspace Actions
        ========================== */

        this.moreOption = page.getByRole('button').filter({ hasText: /^$/ });

this.renameBtn = page.getByRole('button', { name: 'Rename' });

this.workspaceName = page.getByRole('textbox', {
    name: 'Workspace Name'
});

this.detailsBtn = page.getByRole('button', {
    name: 'Details'
});

this.closeBtn = page.getByRole('button', {
    name: 'Close'
});
/* ==========================
    Workspace View
========================== */

this.listView = page.getByRole('button', { name: 'List view' });

this.gridView = page.getByRole('button', { name: 'Grid view' });

/* ==========================
    Workspace Actions
========================== */

this.gridView = page.locator("button[title='Grid View']");

this.moreOption = page.locator("button.context-menu-btn").first();

this.renameBtn = page.getByRole('button', { name: 'Rename' });
// OR
// this.renameBtn = page.locator('button:has-text("Rename")').last();

this.workspaceName = page.locator('#rename-input:visible');
// OR
// this.workspaceName = page.getByRole('textbox', { name: 'Workspace Name' });

this.detailsBtn = page.getByRole('button', { name: 'Details' });
// OR
// this.detailsBtn = page.locator('button').filter({ hasText: 'Details' });
/* ==========================
    Workspace
========================== */

this.workspace = page.getByRole('button', { name: 'Workspace' });

this.gridView = page.getByRole('button', { name: 'Grid view' });

this.moreOption = page.getByRole('button').filter({ hasText: /^$/ });

this.renameBtn = page.getByRole('button', { name: 'Rename' });

this.workspaceName = page.getByRole('textbox', {
    name: 'Workspace Name'
});

this.detailsBtn = page.getByRole('button', {
    name: 'Details'
});

this.closeBtn = page.getByRole('button', {
    name: 'Close'
});

this.sharedWithMe = page.getByRole('button', {
    name: 'Shared with Me'
});

this.myWorkspaces = page.getByRole('button', {
    name: 'My Workspaces'
});
/* ==========================
    Personal Workspace
========================== */

this.personalWorkspace = page.locator('div').filter({
    hasText: 'Open Workspace'
}).first();

this.projectTitle = page.getByText('project', { exact: true });
// OR
// this.projectTitle = page.locator('h4:has-text("project")');
// this.projectTitle = page.locator(':text-is("project")');

this.moreOption = page.getByRole('button').filter({ hasText: /^$/ });

this.renameBtn = page.getByRole('button', { name: 'Rename' });

// Context menu "Rename"
this.renameMenu = page.getByText('Rename', { exact: true });
// OR
// this.renameMenu = page.locator(':text-is("Rename")');

// Rename button inside the popup
this.renameConfirmBtn = page.locator('button.astryd-btn-primary');
// OR
// this.renameConfirmBtn = page.locator('button:has-text("Rename")').last();

// Workspace name input
this.workspaceName = page.locator('#rename-input:visible');

this.moreOption = page.locator("//button[contains(@class,'context-menu-btn')]//*[name()='svg']");

this.detailsBtn = page.getByText('Details', { exact: true });
// OR
// this.detailsBtn = page.locator('button:has-text("Details")');
// this.detailsBtn = page.locator(':text-is("Details")');

this.closeBtn = page.getByText('Close');
// OR
// this.closeBtn = page.locator('button:has-text("Close")');

this.settingsBtn = page.getByRole('button', { name: 'Settings' });

this.deleteBtn = page.getByRole('button', { name: 'Delete' });
this.personalWorkspace = page.locator('div').filter({
    hasText: 'Open Workspace'
}).first();

this.myWorkspaces = page.getByRole('button', { name: 'My Workspaces' });

this.newWorkspace = page.getByRole('button', { name: 'New Workspace' });

this.workspaceName = page.getByRole('textbox', {
    name: 'Workspace Name'
});

this.memberEmail = page.getByRole('textbox', {
    name: 'colleague@example.com'
});

this.addMemberBtn = page.getByRole('button', {
    name: 'Add member'
});

this.createWorkspaceBtn = page.getByRole('button', {
    name: 'Create Workspace'
});
this.workspaceCard = page.locator('div').filter({
    hasText: /^User/
}).first();

this.backToWorkspaces = page.getByRole('button', {
    name: 'Back to workspaces'
});

this.moreOption = page.locator('button.context-menu-btn');

this.renameMenu = page.getByRole('button', {
    name: 'Rename'
}).first();

this.workspaceName = page.getByRole('textbox', {
    name: 'Workspace Name'
});

this.renameConfirmBtn = page.locator('button.astryd-btn-primary');

this.moreOption = page.locator('button.context-menu-btn');

this.membersBtn = page.getByRole('button', {
    name: 'Members'
});

this.addMemberBtn = page.getByRole('button', {
    name: 'Add'
});

this.emailAddress = page.getByRole('textbox', {
    name: 'Email address'
});

this.inviteBtn = page.getByRole('button', {
    name: 'Invite'
});

this.closeBtn = page.getByRole('button', {
    name: 'Close'
});
this.moreOption = page.locator('button.context-menu-btn');

this.creditsBtn = page.getByRole('button', {
    name: 'Credits'
});

this.transferCreditBtn = page.getByRole('button', {
    name: 'Transfer credit'
});

this.creditInput = page.getByRole('spinbutton', {
    name: 'Credits to transfer'
});

this.allocateWorkspaceBtn = page.getByRole('button', {
    name: 'Allocate to workspace'
});
this.moreOption = page.locator('button.context-menu-btn');

this.detailsBtn = page.getByRole('button', {
    name: 'Details'
});

this.closeBtn = page.getByRole('button', {
    name: 'Close'
});
this.allocateWorkspaceBtn = page.getByRole('button', {
    name: 'Allocate to workspace'
});

this.moreOption = page.locator('button.context-menu-btn');

this.detailsBtn = page.getByRole('button', {
    name: 'Details'
});

this.closeBtn = page.getByRole('button', {
    name: 'Close'
});
this.moreOption = page.locator('button.context-menu-btn');

this.detailsBtn = page.getByRole('button', {
    name: 'Details'
});

this.closeBtn = page.getByRole('button', {
    name: 'Close'
});
}

  /* ==========================
    Open Workspace
========================== */

async openWorkspace() {
    await this.workspace.click();
}

/* ==========================
    Verify Workspace Page
========================== */

async verifyWorkspacePage() {
    await expect(this.page).toHaveURL(/workspace/i);
}

/* ==========================
    Verify Workspace Header
========================== */

async verifyWorkspaceHeader() {
    await expect(this.workspacesHeading).toBeVisible();
}

/* ==========================
    Verify Credits Badge
========================== */

async verifyCreditsBadge() {
    await expect(this.creditsBadge).toBeVisible();
}

/* ==========================
    Change View
========================== */

async changeView() {
    await this.creditText.click();
    await this.gridView.click();
    await this.listView.click();
}

/* ==========================
    Verify View Toggle
========================== */

async verifyViewToggle() {
    await this.listView.click();
    await expect(this.listView).toBeVisible();

    await this.gridView.click();
    await expect(this.gridView).toBeVisible();
}

/* ==========================
    Verify Sorting
========================== */

async verifySorting() {
    await this.sortNameAZ.click();
    await this.nameZA.click();

    await this.sortNameZA.click();
    await this.dateCreated.click();

    await this.sortDateCreated.click();
    await this.lastModified.click();

    await this.sortLastModified.click();
    await this.nameAZ.click();
}

/* ==========================
    Verify Default Sorting
========================== */

async verifyDefaultSorting() {
    await expect(this.sortNameAZ).toBeVisible();
}

/* ==========================
    Verify Invitations
========================== */

async verifyInvitations() {
    await this.invitations.click();
    await this.closeInvitations.click();
}

/* ==========================
    Verify Invites Inbox
========================== */

async verifyInvitesInbox() {
    await expect(this.invitations).toBeVisible();

    await this.invitations.click();

    await expect(this.closeInvitations).toBeVisible();

    await this.closeInvitations.click();
}

/* ==========================
    TC_WS_006 - Open Invites Inbox
========================== */

async openInvitesInbox() {
    await this.invitations.click();
    await expect(this.closeInvitations).toBeVisible();
}

/* ==========================
    TC_WS_007 - Accept Invite
========================== */

async acceptInvite() {
    await this.invitations.click();
    await this.acceptBtn.first().click();
}

/* ==========================
    TC_WS_008 - Decline Invite
========================== */

async declineInvite() {
    await this.invitations.click();
    await this.declineBtn.first().click();
}

/* ==========================
    TC_WS_009 - Create New Video
========================== */

async openCreateNewVideo() {
    await this.createNewVideo.click();
}

/* ==========================
    Verify Create New Video Popup
========================== */

async verifyCreateNewVideoPopup() {
    await this.createNewVideo.click();
    await this.cancel.click();
    await this.discard.click();
}

/* ==========================
    TC_WS_010 - Verify Personal Workspace
========================== */

async verifyPersonalWorkspace() {
    await expect(this.personalWorkspace).toBeVisible();
    await expect(this.personalWorkspaceCard).toBeVisible();
    await expect(this.avatarIcon).toBeVisible();
}

/* ==========================
    Rename Workspace
========================== */

async renameWorkspace() {
    const newName = `User Team ${Date.now()}`;
    await this.gridView.click();
    await this.gridView.click();

    await this.moreOption.nth(3).click();

    await this.renameBtn.click();

    await this.workspaceName.click();
    await this.workspaceName.press('Control+A');
    await this.workspaceName.press('Backspace');
    await this.workspaceName.fill(newName);


    await expect(this.renameBtn).toBeEnabled();

    await this.renameBtn.click(); // Confirms rename
}

/* ==========================
    Verify Workspace Details
========================== */

async verifyWorkspaceDetails() {

     await this.moreOption.nth(3).click();

    await this.detailsBtn.click();

    await expect(this.closeBtn).toBeVisible();

    await this.closeBtn.click();

}
/* ==========================
    TC_WS_011
    Open Personal Workspace
========================== */

async openPersonalWorkspace() {

    await this.personalWorkspace.click();

    await expect(this.projectTitle).toBeVisible();

    await expect(this.page).toHaveURL(/project/i);

}
/* ==========================
    TC_WS_012
    Verify Workspace Options
========================== */

async verifyWorkspaceOptions() {

    await this.moreOption.nth(3).click();

    await expect(this.renameBtn).toBeVisible();

    await expect(this.settingsBtn).toBeVisible();

    await expect(this.deleteBtn).toHaveCount(1);

}
/* ==========================
    TC_WS_016
    Create New Workspace
========================== */

async createNewWorkspace() {

    const workspaceName = `Project Team ${Date.now()}`;

    await this.myWorkspaces.click();

    await this.newWorkspace.click();

    await this.workspaceName.fill(workspaceName);

    await this.memberEmail.fill('khushi.sharma@lmsathena.com');

    await this.addMemberBtn.click();

    await this.createWorkspaceBtn.click();

}
/* ==========================
   TC_WS_017
   Open Workspace and Rename
========================== */

async openAndRenameWorkspace() {

    const workspaceName = `User ${Date.now()}`;

    await this.workspaceCard.click();

    await expect(this.backToWorkspaces).toBeVisible();

    await this.backToWorkspaces.click();

    await this.moreOption.nth(4).click();

    await this.renameMenu.click();

    await this.workspaceName.waitFor({
        state: 'visible'
    });

    await this.workspaceName.click();

    await this.workspaceName.press('Control+A');

    await this.workspaceName.press('Delete');

    await this.workspaceName.fill(workspaceName);

    await expect(this.renameConfirmBtn).toBeEnabled();

    await this.renameConfirmBtn.click();

}

/* ==========================
   TC_WS_018
   Invite Member to Workspace
========================== */

async inviteMemberToWorkspace() {

    await this.moreOption.nth(2).click();

    await this.membersBtn.click();

    await this.addMemberBtn.click();

    await this.emailAddress.waitFor({
        state: 'visible'
    });

    await this.emailAddress.fill('raza@lmsathena.com');

    await expect(this.inviteBtn).toBeEnabled();

    await this.inviteBtn.click();

    await this.closeBtn.click();

}
/* ==========================
   TC_WS_019
   Transfer Credits to Workspace
========================== */

async transferCreditsToWorkspace() {

    await this.moreOption.nth(4).click();

    await this.creditsBtn.click();

    await this.transferCreditBtn.click();

    await this.creditInput.waitFor({
        state: 'visible'
    });

    await this.creditInput.clear();

    await this.creditInput.fill('100');

    await expect(this.allocateWorkspaceBtn).toBeEnabled();

    await this.allocateWorkspaceBtn.click();

}
/* ==========================
   TC_WS_020
   Verify Workspace Details
========================== */

async verifyWorkspaceDetails() {

    await this.moreOption.nth(2).click();

    await this.detailsBtn.click();

}

}

module.exports = WorkspacePage;