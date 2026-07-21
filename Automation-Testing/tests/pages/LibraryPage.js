const { expect } = require('@playwright/test');

class LibraryPage {

    constructor(page) {
        this.page = page;

        /* ==========================
            Library
        ========================== */

        this.library = page.getByRole('button', { name: 'Library' });

        // Workspace Dropdown
        this.workspaceDropdown = page.getByLabel('WorkspaceUser');

        // Media
        this.media = page.getByRole('button', { name: 'Media' });

        // Tabs
        this.photosVideos = page.getByText('PhotosVideos Upload');
        this.videosTab = page.getByRole('button', { name: 'Videos', exact: true });
        // Search
this.searchAssets = page.getByRole('textbox', { name: 'Search assets' });

// Upload
this.uploadMore = page.getByRole('button', { name: 'Upload more' });

// Close
this.closeButton = page.getByRole('button', { name: 'Close' });
// Search Assets
this.searchAssets = page.getByRole('textbox', { name: 'Search assets' });
// Library Sections
this.music = page.getByRole('button', { name: 'Music' });
this.fonts = page.getByRole('button', { name: 'Fonts' });
this.templates = page.getByRole('button', { name: 'Templates' });

// Storage Icon
this.storageIcon = page.locator('.library-storage-compact > svg > path:nth-child(2)');
this.photosTab = page.getByRole('button', { name: 'Photos', exact: true });
this.searchAssets = page.getByRole('textbox', { name: 'Search assets' });
this.noResults = page.getByText('No results found');
this.uploadSuccessToast = page.getByText(/uploaded successfully/i);
this.errorMessage = page.locator('.error-message');
// Asset Actions
this.assetCard = page.locator('.asset-card').first();
this.deleteButton = page.getByRole('button', { name: 'Delete' });
this.confirmDeleteButton = page.getByRole('button', { name: 'Confirm' });
this.renameButton = page.getByRole('button', { name: 'Rename' });
this.assetNameTextbox = page.getByRole('textbox');
this.saveButton = page.getByRole('button', { name: 'Save' });
this.assetName = page.locator('.asset-name');

// View Toggle
this.listView = page.getByRole('button', { name: 'List view' });
this.gridView = page.getByRole('button', { name: 'Grid view' });

// Empty State
this.noPhotosText = page.getByText('No photos yet');
this.uploadAssetsButton = page.getByRole('button', { name: 'Upload assets' });

// Loader
this.loader = page.locator('.loading-spinner');

// Messages
this.deleteSuccessToast = page.locator('.toast-success');
this.errorMessage = page.locator('.error-message');

// Grid
this.assetGrid = page.locator('.asset-grid');
// Loading Spinner
this.loader = page.locator('.loading-spinner');

// Asset Grid
this.assetGrid = page.locator('.asset-grid');
    }

    /* ==========================
        Methods
    ========================== */

    async openLibrary() {
        await this.library.click();
    }

    async selectWorkspace(workspaceId) {
        await this.workspaceDropdown.selectOption(workspaceId);
    }

    async openMedia() {
        await this.media.click();
    }

    async openPhotosVideos() {
        await this.photosVideos.click();
    }

    async openVideosTab() {
        await this.videosTab.click();
    }

    async navigateToVideos(workspaceId) {
        await this.openLibrary();
        await this.selectWorkspace(workspaceId);
        await this.openMedia();
        await this.openPhotosVideos();
        await this.openVideosTab();
    }

    async searchAsset(assetName) {
    await this.searchAssets.click();
    await this.searchAssets.fill(assetName);
}

async clickUploadMore() {
    await this.uploadMore.click();
}

async closeUploadPopup() {
    await this.closeButton.click();
}
async searchAsset(assetName) {
    await this.searchAssets.click();
    await this.searchAssets.fill(assetName);
}
async openMusic() {
    await this.music.click();
}

async openFonts() {
    await this.fonts.click();
}

async openTemplates() {
    await this.templates.click();
}

async clickStorageIcon() {
    await this.storageIcon.click();
}
async selectAsset() {
    await this.assetCard.click();
}

async deleteAsset() {
    await this.deleteButton.click();
}

async confirmDelete() {
    await this.confirmDeleteButton.click();
}

async renameAsset(name) {
    await this.renameButton.click();
    await this.assetNameTextbox.fill(name);
}

async saveAssetName() {
    await this.saveButton.click();
}

async openListView() {
    await this.listView.click();
}

async openGridView() {
    await this.gridView.click();
}
}

module.exports = LibraryPage;