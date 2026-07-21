const { test } = require('@playwright/test');

const LoginPage = require('../pages/LoginPage');
const VoicesPage = require('../pages/VoicesPage');

const data = require('../utils/testData');

test.describe('Voices Module', () => {

    test.beforeEach(async ({ page }) => {

        const login = new LoginPage(page);

        await login.navigate();

        await login.login(data.email, data.password);

    });

    // TC_VOICES_001
    test('TC_VOICES_001 - Verify Voices Page Navigation', async ({ page }) => {

        const voices = new VoicesPage(page);

        await voices.openVoices();

    });

    // TC_VOICES_002
    test('TC_VOICES_002 - Verify Public Library Tab', async ({ page }) => {

        const voices = new VoicesPage(page);

        await voices.openVoices();

        await voices.openPublicLibrary();

    });

    // TC_VOICES_003
    test('TC_VOICES_003 - Verify My Voices Tab', async ({ page }) => {

        const voices = new VoicesPage(page);

        await voices.openVoices();

        await voices.openMyVoices();

    });

    // TC_VOICES_004
    test('TC_VOICES_004 - Verify Voice Search', async ({ page }) => {

        const voices = new VoicesPage(page);

        await voices.openVoices();

        await voices.openPublicLibrary();

        await voices.searchVoiceByName('Alex');

    });

    // TC_VOICES_005
    test('TC_VOICES_005 - Verify Clear Search', async ({ page }) => {

        const voices = new VoicesPage(page);

        await voices.openVoices();

        await voices.openPublicLibrary();

        await voices.searchVoiceByName('Alex');

        await voices.clearSearch();

    });

    // TC_VOICES_006
    // TC_VOICES_006
test('TC_VOICES_006 - Verify Female Filter', async ({ page }) => {

    const voices = new VoicesPage(page);

    await voices.openVoices();

    await voices.filterFemale();

    await voices.verifyOnlyFemaleVoices();

});

    // TC_VOICES_007
    test('TC_VOICES_007 - Verify Male Filter', async ({ page }) => {

    const voices = new VoicesPage(page);

    await voices.openVoices();

    await voices.filterMale();

    await voices.verifyOnlyMaleVoices();

});

    // TC_VOICES_008
    test('TC_VOICES_008 - Verify Processing Filter', async ({ page }) => {

        const voices = new VoicesPage(page);

        await voices.openVoices();

        await voices.filterProcessing();

    });

    // TC_VOICES_009
    test('TC_VOICES_009 - Verify Group By Language', async ({ page }) => {

        const voices = new VoicesPage(page);

        await voices.openVoices();

        await voices.groupByLanguage();

    });

    // TC_VOICES_010
    test('TC_VOICES_010 - Verify Group By Gender', async ({ page }) => {

        const voices = new VoicesPage(page);

        await voices.openVoices();

        await voices.groupByGender();

    });

});