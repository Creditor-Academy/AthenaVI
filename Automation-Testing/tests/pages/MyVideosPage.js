const { expect } = require('@playwright/test');

class MyVideosPage {
    constructor(page) {
        this.page = page;

        // Navigation
        this.myVideosBtn = page.getByRole('button', { name: 'My videos' });

        // Tabs
        this.allTab = page.getByRole('tab', { name: 'All' });
        this.personalTab = page.getByRole('tab', { name: 'Personal' });
        this.myWorkspaceTab = page.getByRole('tab', { name: 'My Workspace' });
        this.sharedWithMeTab = page.getByRole('tab', { name: 'Shared with Me' });

        // View
        this.gridViewBtn = page.getByRole('button', { name: 'Grid view' });
        this.listViewBtn = page.getByRole('button', { name: 'List view' });

        // Search
        this.searchBox = page.getByRole('searchbox', { name: 'Search videos' });

        // Filter
        this.filterBtn = page.getByRole('button', { name: 'Filter All exports' });

        // Sort
        this.sortBtn = page.getByRole('button', { name: 'Sort Newest first' });

        // Group
        this.groupBtn = page.getByRole('button', { name: 'Group by None' });
        this.createVideoBtn = page.getByRole('button', { name: 'Create Video' });
this.cancelBtn = page.getByText('Cancel', { exact: true });
    }

    async openMyVideos() {
        await this.myVideosBtn.click();
    }

    async verifyMyVideosPage() {
        await expect(this.myVideosBtn).toBeVisible();
    }

    async verifyTabs() {
        await this.allTab.click();
        await this.personalTab.click();
        await this.myWorkspaceTab.click();
        await this.sharedWithMeTab.click();
        await this.allTab.click();
    }

    async verifyViewToggle() {
        await this.gridViewBtn.click();
        await this.listViewBtn.click();
        await this.gridViewBtn.click();
        await this.listViewBtn.click();
    }

    async searchVideo(videoName) {
        await this.searchBox.fill(videoName);
    }

    async verifyFilters() {
        await this.filterBtn.click();
        await this.page.getByRole('option', { name: 'Large files (50MB+)' }).click();

        await this.page.getByRole('button', { name: 'Filter Large files (50MB+)' }).click();
        await this.page.getByRole('option', { name: 'Rendered by me' }).click();

        await this.page.getByRole('button', { name: 'Filter Rendered by me' }).click();
        await this.page.getByRole('option', { name: 'All exports' }).click();
    }

    async verifySorting() {
        await this.sortBtn.click();
        await this.page.getByRole('option', { name: 'Oldest first' }).click();

        await this.page.getByRole('button', { name: 'Sort Oldest first' }).click();
        await this.page.getByRole('option', { name: 'Name (A-Z)' }).click();

        await this.page.getByRole('button', { name: 'Sort Name (A-Z)' }).click();
        await this.page.getByRole('option', { name: 'Name (Z-A)' }).click();

        await this.page.getByRole('button', { name: 'Sort Name (Z-A)' }).click();
        await this.page.getByRole('option', { name: 'Largest first' }).click();

        await this.page.getByRole('button', { name: 'Sort Largest first' }).click();
        await this.page.getByRole('option', { name: 'Smallest first' }).click();
    }

    async verifyGrouping() {
        await this.groupBtn.click();
        await this.page.getByRole('option', { name: 'Workspace' }).click();

        await this.page.getByRole('button', { name: 'Group by Workspace' }).click();
        await this.page.getByRole('option', { name: 'Completed date' }).click();

        await this.page.getByRole('button', { name: 'Group by Completed date' }).click();
        await this.page.getByRole('option', { name: 'None' }).click();
    }

    async verifyCompleteFlow() {
        await this.verifyTabs();
        await this.verifyViewToggle();
        await this.searchVideo('Choose Avatar');
        await this.verifyFilters();
        await this.verifySorting();
        await this.verifyGrouping();
    }

    async verifyPageHeader() {
    await expect(
        this.page.getByRole('heading', { name: 'My Videos' })
    ).toBeVisible();

    await expect(
        this.page.getByText('Completed final exports across all your workspaces.')
    ).toBeVisible();
}

async openCreateVideo() {
    await this.page.getByRole('button', { name: 'Create Video' }).click();

    // Verify navigation
    await expect(this.page).toHaveURL(/create/i);
}

async verifyAllTab() {
    await this.allTab.click();

    await expect(this.allTab).toBeVisible();
}
async openCreateVideo() {
    await this.createVideoBtn.click();
}

async cancelCreateVideo() {
    await expect(this.cancelBtn).toBeVisible();
    await this.cancelBtn.click();
}
}

module.exports = MyVideosPage;