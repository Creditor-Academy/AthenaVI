const { expect } = require('@playwright/test');

class VoicesPage {

    constructor(page) {
        this.page = page;

        /* ==========================
            Voices
        ========================== */

        this.voices = page.getByRole('button', { name: 'Voices' });

        // Tabs
        this.publicLibraryTab = page.getByRole('tab', { name: 'Public Library' });
        this.myVoicesTab = page.getByRole('tab', { name: 'My Voices' });

        // Search
        this.searchVoice = page.getByRole('searchbox', {
            name: 'Search voices'
        });

        // Filter
        this.filterDropdown = page.getByRole('button', {
            name: /Filter/i
        });

        this.femaleOption = page.getByRole('option', {
            name: 'Female'
        });

        this.maleOption = page.getByRole('option', {
            name: 'Male',
            exact: true
        });

        this.processingOption = page.getByRole('option', {
            name: 'Processing'
        });

        // Group By
        this.groupByDropdown = page.getByRole('button', {
            name: /Group by/i
        });

        this.languageOption = page.getByRole('option', {
            name: 'Language'
        });

        this.genderOption = page.getByRole('option', {
            name: 'Gender'
        });
        this.voiceCards = page.locator('[data-testid="voice-card"]'); // Replace with actual locator
this.voiceGender = page.locator('[data-testid="voice-gender"]'); // Replace with actual locator
    }

    /* ==========================
        Navigation
    ========================== */

    async openVoices() {
        await this.voices.click();
        await expect(this.page).toHaveURL(/voices/i);
    }

    /* ==========================
        Tabs
    ========================== */

    async openPublicLibrary() {
        await this.publicLibraryTab.click();
    }

    async openMyVoices() {
        await this.myVoicesTab.click();
    }

    /* ==========================
        Search
    ========================== */

    async searchVoiceByName(name) {
        await this.searchVoice.fill(name);
    }

    async clearSearch() {
        await this.searchVoice.clear();
    }

    /* ==========================
        Filter
    ========================== */

    async filterFemale() {
        await this.filterDropdown.click();
        await this.femaleOption.click();
    }

    async filterMale() {
        await this.filterDropdown.click();
        await this.maleOption.click();
    }

    async filterProcessing() {
        await this.filterDropdown.click();
        await this.processingOption.click();
    }

    /* ==========================
        Group By
    ========================== */

    async groupByLanguage() {
        await this.groupByDropdown.click();
        await this.languageOption.click();
    }

    async groupByGender() {
        await this.groupByDropdown.click();
        await this.genderOption.click();
    }
    async verifyOnlyFemaleVoices() {

    // Update this locator to match the gender text in each voice card
    const genders = this.page.locator('p');

    const count = await genders.count();

    for (let i = 0; i < count; i++) {

        const text = (await genders.nth(i).textContent()).trim().toLowerCase();

        if (text === 'male' || text === 'female') {
            expect(text).toBe('female');
        }
    }
}
async verifyOnlyMaleVoices() {

    await this.page.waitForLoadState('networkidle');

    const genders = this.page.locator('text=/^(male|female)$/i');

    const count = await genders.count();

    for (let i = 0; i < count; i++) {

        const gender = (await genders.nth(i).textContent()).trim().toLowerCase();

        expect(gender).toBe('male');
    }
}


}

module.exports = VoicesPage;