const { expect } = require('@playwright/test');

class HomePage {

    constructor(page) {

        this.page = page;

        /* ==========================
            Sidebar
        ========================== */

        this.home = page.getByText('Home', { exact: true });
        this.homeIcon = page.locator("//button[contains(@class,'dashboard-nav-item--active')]//*[name()='svg']");

        this.workspace = page.getByRole('button', { name: 'Workspace' });
        this.myVideos = page.getByRole('button', { name: 'My videos' });
        this.library = page.getByRole('button', { name: 'Library' });
        this.avatars = page.getByRole('button', { name: 'Avatars' });
        this.voices = page.getByRole('button', { name: 'Voices' });
        this.settings = page.getByRole('button', { name: 'Settings' });

        /* ==========================
            Header
        ========================== */

        this.search = page.getByPlaceholder('Search dashboard...');
        this.searchShortcut = page.getByText('Ctrl+K');

        this.createBtn = page.getByRole('button', { name: 'Create' });

        // Update this locator if your application uses a different locator
        this.notificationBell = page.locator("button").last();

        this.notificationBell = page.getByRole('button', { name: /notification/i });
        this.notificationPanel = page.locator('div.notification-panel'); // update if needed
        
        this.creditsIcon = page.locator("//button[@aria-label='Cart, 2 items']//*[name()='svg']");
        this.creditsHeading = page.getByRole('heading', { name: 'Credits' });
        this.manageBillingBtn = page.getByRole('button', { name: 'Manage billing & history' });
        this.profileAvatar = page.locator('div.profile-avatar');
        this.profileOption = page.getByText('Profile', { exact: true });
        this.logoutBtn = page.getByRole('button', { name: 'Logout' });
        this.heading = page.getByText('Welcome back, user!', { exact: true });

        this.createNewVideoBtn = page.getByRole('button', { name: 'Create New Video' });
        this.nextBtn = page.locator('button:has-text("Next")');
        this.allBtn = page.locator('button:has-text("All")');
        this.corporateTab = page.getByText('Corporate', { exact: true });
        this.trainingTab = page.getByRole('tab', { name: 'Training' });
        this.marketingTab = page.getByRole('tab', { name: 'Marketing' });
        this.socialTab = page.getByRole('tab', { name: 'Social' });
        this.minimalTab = page.getByRole('tab', { name: 'Minimal' });
        this.videoProjectsCard = page.getByText('Video Projects', { exact: true });

        this.videoProjectsCard = page.getByText('Video Projects', { exact: true });

        this.videoProjectsCount = page.getByRole('listitem', {
        name: /Video Projects: 0/i
        });

        this.startYourFirstText = page.getByText('Start your first', { exact: true });

        this.acrossWorkspaceText = page.getByText('Across 1 workspace', { exact: true });

        this.openWorkspaceLink = page.getByText('Open workspace', { exact: true });
        this.videoProjectsCard = page.locator('div.home-billing-stat-inner')
        .filter({ hasText: 'VIDEO PROJECTS' });

        this.openWorkspace = this.videoProjectsCard.getByText('Open workspace', {
        exact: true
        });
        this.completedExportsCard = page.locator('div.home-billing-stat-inner')
        .filter({ hasText: 'COMPLETED EXPORTS' });

        this.completedExportsCount = this.completedExportsCard.getByText('0', {
        exact: true
        });

        this.completedExportsDescription = this.completedExportsCard.getByText(
        'None published yet',
        { exact: true }
        );

        /* =========================
        COMPLETED EXPORTS CARD
        ========================= */

        this.completedExportsCard = page.locator('div.home-billing-stat-inner')
        .filter({ hasText: 'COMPLETED EXPORTS' });

        this.viewExports = this.completedExportsCard.getByText('View exports', {
        exact: true
        });

        /* =========================
   CREDITS AVAILABLE CARD
========================= */

this.creditsAvailableCard = page.locator('div.home-billing-stat-inner')
    .filter({ hasText: 'CREDITS AVAILABLE' });

this.creditBalance = this.creditsAvailableCard.getByText('200,000', {
    exact: true
});

this.creditStatus = this.creditsAvailableCard.getByText('Healthy balance', {
    exact: true
});

this.creditDescription = this.creditsAvailableCard.getByText(
    'For exports & AI generation',
    { exact: true }
);

this.manageCredits = this.creditsAvailableCard.getByText('Manage credits', {
    exact: true
});

/* =========================
   CREDITS AVAILABLE CARD
========================= */

this.creditsAvailableCard = page.locator('div.home-billing-stat-inner')
    .filter({ hasText: 'CREDITS AVAILABLE' });

this.creditsProgressBar = this.creditsAvailableCard.locator(
    '[role="progressbar"], .progress-bar, .home-progress-bar'
);

/* =========================
   LOW CREDIT WARNING
========================= */

this.creditsAvailableCard = page.locator('div.home-billing-stat-inner')
    .filter({ hasText: 'CREDITS AVAILABLE' });

this.lowBalanceLabel = this.creditsAvailableCard.getByText('Low balance', {
    exact: true
});

/* =========================
   CREDITS AVAILABLE CARD
========================= */

this.manageCredits = page.getByText('Manage credits', {
    exact: true
});

/* =========================
   TEMPLATE TOGGLE
========================= */

this.exploreTemplates = page.getByText('Explore Templates', {
    exact: true
});

this.myRecent = page.getByRole('button', {
    name: 'My Recent'
});

/* =========================
   MY RECENT TAB
========================= */

this.myRecent = page.getByRole('button', {
    name: 'My Recent'
});

this.noRecentItems = page.getByText('No recent items', {
    exact: true
});

       
        /* ==========================
            Welcome Banner
        ========================== */

        this.heading = page.getByRole('heading', {
            name: 'Welcome back, user!'
        });

        this.description = page.locator(
            'p:has-text("Ready to create your next masterpiece? Jump right in and bring your ideas to life.")'
        );

        this.multiLanguageTag = page.locator(
            'span:has-text("Multi-language ready")'
        );

        this.aiToolsTag = page.locator(
            'span:has-text("AI tools available")'
        );

        /* ==========================
            Create Project Wizard
        ========================== */

        this.nextBtn = page.locator('button:has-text("Next")');

        this.allBtn = page.locator('button:hasText("All")');

        this.firstTemplate = page.locator('div.template-bundle-card').first();

        this.projectTitle = page.locator("//input[@placeholder='Enter project title...']");

        this.professionalTag = page.locator('button:has-text("Professional")');

        this.workspaceDropdown = page.locator("//label[2]//select[1]");

        this.newWorkspaceTextbox = page.locator("//input[@placeholder='New folder name']");

        this.createWorkspaceBtn = page.locator('button').filter({ hasText: 'Create' }).last();

        this.createProjectBtn = page.locator('button:has-text("Create Project")');

        this.exploreTemplates = page.getByText('Explore Templates', { exact: true });

        this.myRecent = page.getByRole('button', { name: /My Recent/i });

        this.nextBtn = page.getByRole('button', { name: 'Next' });

    }

    /* ==========================
        Sidebar
    ========================== */

    async verifySidebar() {

        await expect(this.home).toBeVisible();
        await expect(this.homeIcon).toBeVisible();
        await expect(this.workspace).toBeVisible();
        await expect(this.myVideos).toBeVisible();
        await expect(this.library).toBeVisible();
        await expect(this.avatars).toBeVisible();
        await expect(this.voices).toBeVisible();
        await expect(this.settings).toBeVisible();

    }

    async clickHome() {

        await this.home.click();

    }

    async clickWorkspace() {

        await this.workspace.click();

    }

    async clickMyVideos() {

        await this.myVideos.click();

    }

    async clickLibrary() {

        await this.library.click();

    }

    async clickAvatars() {

        await this.avatars.click();

    }

    async clickVoices() {

        await this.voices.click();

    }

    async clickSettings() {

        await this.settings.click();

    }

    async verifyWorkspacePage() {

        await expect(this.page).toHaveURL(/workspace/i);

    }

    async verifyMyVideosPage() {

        await expect(this.page).toHaveURL(/videos/i);

    }

    async verifyLibraryPage() {

        await expect(this.page).toHaveURL(/library/i);

    }

    async verifyAvatarsPage() {

        await expect(this.page).toHaveURL(/avatars/i);

    }

    async verifyVoicesPage() {

        await expect(this.page).toHaveURL(/voices/i);

    }

    async verifySettingsPage() {

        await expect(this.page).toHaveURL(/settings/i);

    }

    async verifyActiveHome() {

        await expect(this.homeIcon).toBeVisible();

    }

    /* ==========================
        Search
    ========================== */

    async verifySearchBar() {

        await expect(this.search).toBeVisible();

    }

    async verifySearchPlaceholder() {

        await expect(this.search).toHaveAttribute(
            'placeholder',
            'Search dashboard...'
        );

    }

    async verifySearchShortcut() {

        await expect(this.searchShortcut).toBeVisible();

    }

    async openSearchWithShortcut() {

        await this.page.keyboard.press('Control+K');

        await expect(this.search).toBeFocused();

    }

    async searchDashboard(keyword) {

        await this.search.click();

        await this.search.fill(keyword);

        await this.search.press('Enter');

    }

    async verifySearchResults(text) {

        await expect(this.page.getByText(text)).toBeVisible();

    }

    async verifyNoSearchResults() {

        await expect(this.page.getByText(/No results/i)).toBeVisible();

    }

    async searchSpecialCharacters(text) {

        await this.search.fill(text);

        await this.search.press('Enter');

    }

    /* ==========================
        Header
    ========================== */

    async verifyCreateButton() {

        await expect(this.createBtn).toBeVisible();

    }

    async clickCreateButton() {

        await this.createBtn.click();

    }

    async verifyNotificationBell() {

        await expect(this.notificationBell).toBeVisible();

    }

    async clickNotificationBell() {
    await this.notificationBell.click();
    }

    async verifyNotificationPanel() {
    await expect(this.page.getByRole('dialog')).toBeVisible();
    }
      async verifyCreditsIcon() {
    await expect(this.creditsIcon).toBeVisible();
    }

    async clickCreditsIcon() {
    await this.creditsIcon.click();
    }

    async verifyCreditsPanel() {
    await expect(this.creditsHeading).toBeVisible();
    await expect(this.manageBillingBtn).toBeVisible();
    }

    async verifyProfileAvatar() {

    await expect(this.profileAvatar).toBeVisible();

    }

    async clickProfileAvatar() {

    await this.profileAvatar.click();

    }

    async verifyProfileOption() {

    await expect(this.profileOption).toBeVisible();

    }

    async clickProfileOption() {

    await this.profileOption.click();

    }

    async verifyLogoutOption() {
    await expect(this.logoutBtn).toBeVisible();
    }

    async clickLogout() {
    await this.logoutBtn.click();
    }

    async verifyLoginPage() {
    await expect(this.page).toHaveURL(/login/i);

    }

    async verifyWelcomeHeading() {

    await expect(this.heading).toBeVisible();

}

async verifyBannerDescription() {

    await expect(this.description).toBeVisible();

}

async verifyFeatureTags() {

    await expect(this.multiLanguageTag).toBeVisible();

    await expect(this.aiToolsTag).toBeVisible();

}


async verifyWelcomeBanner() {

    await expect(this.heading).toBeVisible();

    await expect(this.description).toBeVisible();

    await expect(this.multiLanguageTag).toBeVisible();

    await expect(this.aiToolsTag).toBeVisible();

}

async clickCreateNewVideo() {

    await this.createNewVideoBtn.click();
    await this.nextBtn.click();
}
async verifyVideoCreationPage() {
    await this.page.waitForTimeout(3000);
    await expect(this.page).toHaveURL(/dashboard/i);
    await expect(this.nextBtn).toBeVisible();

}
async clickOpenWorkspace() {

    await this.openWorkspaceLink.click();

}

async verifyWorkspaceNavigation() {

    await expect(this.page).toHaveURL(/workspace/i);

}

/* =========================
   CLICK VIEW EXPORTS
========================= */

async clickViewExports() {

    await this.viewExports.click();

}

/* =========================
   VERIFY CREDITS CARD
========================= */

async verifyCreditsAvailableCard() {

    await this.creditsAvailableCard.waitFor({ state: 'visible' });

    await expect(this.creditBalance).toBeVisible();

    await expect(this.creditStatus).toBeVisible();

    await expect(this.creditDescription).toBeVisible();

    await expect(this.manageCredits).toBeVisible();

}

/* =========================
   VERIFY COMPLETED EXPORTS CARD
========================= */

async verifyCompletedExportsCard() {

    await this.completedExportsCard.waitFor({ state: 'visible' });

    await expect(this.completedExportsCount).toBeVisible();

    await expect(this.completedExportsDescription).toBeVisible();

    await expect(this.completedExportsText).toBeVisible();

    await expect(this.viewExports).toBeVisible();

}

/* =========================
   OPEN VIDEO WORKSPACE
========================= */

async openVideoWorkspace() {

    await this.videoProjectsCard.waitFor({ state: 'visible' });

    await this.openWorkspace.waitFor({ state: 'visible' });

    await this.openWorkspace.click();

}

/* =========================
   VERIFY CREDITS PROGRESS BAR
========================= */

async verifyCreditsProgressBar() {

    await this.creditsAvailableCard.waitFor({ state: 'visible' });

    await expect(this.creditsProgressBar).toBeVisible();

}


/* ==========================
    Video Projects Card
========================== */

async verifyVideoProjectsCard() {

    await expect(this.videoProjectsCard).toBeVisible();

    await expect(this.videoProjectsCount).toBeVisible();

    await expect(this.startYourFirstText).toBeVisible();

    await expect(this.acrossWorkspaceText).toBeVisible();

    await expect(this.openWorkspaceLink).toBeVisible();

}
/* =========================
   VERIFY LOW CREDIT WARNING
========================= */

async verifyLowCreditWarning() {

    await this.creditsAvailableCard.waitFor({ state: 'visible' });

    await this.page.waitForTimeout(2000);

    await this.lowBalanceLabel.waitFor({ state: 'visible' });

    await expect(this.lowBalanceLabel).toBeVisible();

}

/* =========================
   CLICK MANAGE CREDITS
========================= */

async clickManageCredits() {

    await this.manageCredits.waitFor({ state: 'visible' });

    await this.manageCredits.click();

}

/* =========================
   OPEN MY RECENT
========================= */

async openMyRecent() {

    await this.myRecent.waitFor({ state: 'visible' });

    await this.myRecent.click();

}
/* =========================
   OPEN EXPLORE TEMPLATES
========================= */

async openExploreTemplates() {

    await this.exploreTemplates.waitFor({ state: 'visible' });

    await this.exploreTemplates.click();

}
 /* =========================
   OPEN MY RECENT
========================= */

async openMyRecent() {

    await this.myRecent.waitFor({ state: 'visible' });

    await this.myRecent.click();

}


/* =========================
   VERIFY EMPTY STATE
========================= */

async verifyNoRecentItems() {

    await this.page.waitForLoadState('networkidle');

    await this.page.waitForTimeout(2000);

    await this.noRecentItems.waitFor({ state: 'visible' });

    await expect(this.noRecentItems).toBeVisible();

}

    /* ==========================
        Welcome Banner
    ========================== */

    async verifyWelcomeBanner() {

        await expect(this.heading).toBeVisible();

        await expect(this.description).toBeVisible();

        await expect(this.multiLanguageTag).toBeVisible();

        await expect(this.aiToolsTag).toBeVisible();

    }

    async clickCreateNewVideo() {

        await this.createNewVideoBtn.click();

    }

    /* ==========================
        Create Project
    ========================== */

    async selectTemplate() {

        await this.allBtn.click();

        await this.firstTemplate.click();

        await this.nextBtn.click();

    }

    async enterProjectTitle(title) {

        await this.projectTitle.fill(title);

    }

    async selectProfessionalTag() {

        await this.professionalTag.click();

    }

    async createWorkspace(name) {

        await this.workspaceDropdown.click();

        await this.page.getByText('Create New Workspace').click();

        await this.newWorkspaceTextbox.fill(name);

        await this.createWorkspaceBtn.click();

    }

    async clickCreateProject() {

        await this.createProjectBtn.click();

    }

    async verifyExploreTemplates() {

        await expect(this.exploreTemplates).toBeVisible();

    }

    async verifyMyRecent() {

        await expect(this.myRecent).toBeVisible();

    }

    async openSearchWithShortcut() {

    await this.page.keyboard.press('Control+K');

    await this.page.waitForTimeout(2000);

    console.log(
        await this.page.evaluate(() => document.activeElement?.id)
    );

    }

    }

module.exports = HomePage;