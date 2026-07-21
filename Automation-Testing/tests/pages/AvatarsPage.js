const { expect } = require('@playwright/test');

class AvatarsPage {

    constructor(page) {
        this.page = page;

        /* ==========================
            Avatars
        ========================== */

        // Sidebar
        this.avatars = page.getByRole('button', { name: 'Avatars' });

        // Tabs
        this.publicLibraryTab = page.getByRole('tab', { name: 'Public Library' });
        this.myAvatarsTab = page.getByRole('tab', { name: 'My Avatars' });
        this.teamSharedTab = page.getByRole('tab', { name: 'Team Shared' });

        // View Toggle
        this.gridView = page.getByRole('button', { name: 'Grid view' });
        this.listView = page.getByRole('button', { name: 'List view' });
        // View Toggle
this.listView = page.getByRole('button', { name: 'List view' });
this.gridView = page.getByRole('button', { name: 'Grid view' });

// Filter
this.filterButton = page.getByRole('button', { name: 'Filter All avatars' });

// Filter Button
this.filterButton = page.getByRole('button', { name: 'Filter All avatars' });

// Options
this.femaleOption = page.getByRole('option', { name: 'Female' });
this.maleOption = page.getByRole('option', { name: 'Male', exact: true });
this.unknownGenderOption = page.getByRole('option', { name: 'Unknown gender' });
this.filterButton = page.getByRole('button', { name: 'Filter All avatars' });

this.filterFemaleBtn = page.getByRole('button', { name: 'Filter Female' });

this.filterMaleBtn = page.getByRole('button', { name: 'Filter Male' });
// Public Library
this.publicLibraryTab = page.getByRole('tab', { name: 'Public Library' });

// Filter Buttons
this.filterAllBtn = page.getByRole('button', { name: 'Filter All avatars' });
this.filterFemaleBtn = page.getByRole('button', { name: 'Filter Female' });
this.filterMaleBtn = page.getByRole('button', { name: 'Filter Male' });
this.filterUnknownBtn = page.getByRole('button', { name: 'Filter Unknown gender' });

// Filter Options
this.allAvatarsOption = page.getByRole('option', { name: 'All avatars' });
this.femaleOption = page.getByRole('option', { name: 'Female' });
this.maleOption = page.getByRole('option', { name: 'Male', exact: true });
this.unknownGenderOption = page.getByRole('option', { name: 'Unknown gender' });
    }

    /* ==========================
        Methods
    ========================== */

    async openAvatars() {
        await this.avatars.click();
    }

    async openPublicLibrary() {
        await this.publicLibraryTab.click();
    }

    async openMyAvatars() {
        await this.myAvatarsTab.click();
    }

    async openTeamShared() {
        await this.teamSharedTab.click();
    }

    async openGridView() {
        await this.gridView.click();
    }

    async openListView() {
        await this.listView.click();
    }

    async verifyAvatarsPage() {
        await expect(this.publicLibraryTab).toBeVisible();
    }

    async verifyTabs() {
        await this.openPublicLibrary();
        await expect(this.publicLibraryTab).toBeVisible();

        await this.openMyAvatars();
        await expect(this.myAvatarsTab).toBeVisible();

        await this.openTeamShared();
        await expect(this.teamSharedTab).toBeVisible();

        await this.openPublicLibrary();
    }

    async verifyViewToggle() {
        await this.openGridView();
        await expect(this.gridView).toBeVisible();

        await this.openListView();
        await expect(this.listView).toBeVisible();
    }

    async verifyCompleteFlow() {
        await this.verifyTabs();
        await this.verifyViewToggle();
    }
  async openGridView() {
    await this.gridView.click();
}

async openListView() {
    await this.listView.click();
}

async openFilter() {
    await this.filterButton.click();
}

async filterFemale() {
    await this.filterAllBtn.click();
    await this.femaleOption.click();
}

async filterMale() {
    await this.filterFemaleBtn.click();
    await this.maleOption.click();
}

async filterUnknownGender() {
    await this.filterMaleBtn.click();
    await this.unknownGenderOption.click();
}
async verifyViewToggle() {
    await this.openListView();
    await this.openGridView();
}

async verifyCompleteFlow() {
    await this.verifyTabs();
    await this.verifyViewToggle();
    await this.verifyFilters();
}
async verifyFilters() {

    await this.publicLibraryTab.click();

    // All Avatars
    await this.filterAllBtn.click();
    await this.allAvatarsOption.click();

    // Female
    await this.filterAllBtn.click();
    await this.femaleOption.click();

    // Male
    await this.filterFemaleBtn.click();
    await this.maleOption.click();

    // Unknown Gender
    await this.filterMaleBtn.click();
    await this.unknownGenderOption.click();

    // Back to Female (optional, as in your recording)
    await this.filterUnknownBtn.click();
    await this.femaleOption.click();
}



}

module.exports = AvatarsPage;