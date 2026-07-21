const { expect } = require('@playwright/test');

class SettingsPage {

    constructor(page) {
        this.page = page;

        /* ==========================
            Settings
        ========================== */

        // Settings Button
        this.settingsButton = page.getByRole('button', { name: 'Settings' });

        // Settings Tabs
        this.appearanceTab = page.getByRole('tab', { name: 'Appearance' });
        this.notificationsTab = page.getByRole('tab', { name: 'Notifications' });
        this.securityTab = page.getByRole('tab', { name: 'Security' });
        this.billingTab = page.getByRole('tab', { name: 'Billing' });
        /* ==========================
    Appearance Theme
========================== */

this.appearanceTab = page.getByRole('tab', { name: 'Appearance' });

this.darkTheme = page.getByRole('button', {
    name: 'Dark Easy on the eyes'
});

this.lightTheme = page.getByRole('button', {
    name: 'Light Classic bright look'
});

this.originalTheme = page.getByRole('button', {
    name: 'Original Indigo-Violet'
});

this.oceanTheme = page.getByRole('button', {
    name: 'Ocean Sky & Water'
});

this.forestTheme = page.getByRole('button', {
    name: 'Forest Nature'
});

this.sunsetTheme = page.getByRole('button', {
    name: 'Sunset Warm Sun'
});

this.customAccent = page.getByRole('button', {
    name: 'Custom Your Accent'
});

this.colorPreview = page.locator('.custom-color-preview');

this.blueAccent = page.getByRole('button', {
    name: 'Use accent #2563eb'
});

this.purpleAccent = page.getByRole('button', {
    name: 'Use accent #7c3aed'
});

this.skyAccent = page.getByRole('button', {
    name: 'Use accent #0ea5e9'
});

this.orangeAccent = page.getByRole('button', {
    name: 'Use accent #f59e0b'
});

this.pinkAccent = page.getByRole('button', {
    name: 'Use accent #ec4899'
});

this.applyChanges = page.getByRole('button', {
    name: 'Apply Changes'
});
 /* ==========================
            Settings
        ========================== */

        this.settingsButton = page.getByRole('button', { name: 'Settings' });
        this.notificationsTab = page.getByRole('tab', { name: 'Notifications' });

        /* ==========================
            Notification Toggles
        ========================== */

        // Push Notifications
        this.pushOn = page.getByRole('switch', { name: 'Push Notifications: on' });
        this.pushOff = page.getByRole('switch', { name: 'Push Notifications: off' });

        // Comments & Mentions
        this.commentsOn = page.getByRole('switch', { name: 'Comments and Mentions: on' });
        this.commentsOff = page.getByRole('switch', { name: 'Comments and Mentions: off' });

        // Weekly Digest
        this.weeklyOn = page.getByRole('switch', { name: 'Weekly Digest Email: on' });
        this.weeklyOff = page.getByRole('switch', { name: 'Weekly Digest Email: off' });

        // Product Emails
        this.productOn = page.getByRole('switch', { name: 'Product Emails: on' });
        this.productOff = page.getByRole('switch', { name: 'Product Emails: off' });

        // Video Export Alerts
        this.videoExportOn = page.getByRole('switch', {
            name: 'Video Export Alerts: on',
            exact: true
        });

        this.videoExportOff = page.getByRole('switch', {
            name: 'Video Export Alerts: off',
            exact: true
        });

        // Workspace Video Export Alerts
        this.workspaceVideoExport =
            page.getByRole('switch', { name: 'Workspace Video Export Alerts' });

        // Storage Alerts
        this.storageOn = page.getByRole('switch', { name: 'Storage Alerts: on' });
        this.storageOff = page.getByRole('switch', { name: 'Storage Alerts: off' });

        // Credits Alerts
        this.creditsOn = page.getByRole('switch', { name: 'Credits Alerts: on' });
        this.creditsOff = page.getByRole('switch', { name: 'Credits Alerts: off' });

        // Workspace Team Alerts
        this.teamOn = page.getByRole('switch', { name: 'Workspace Team Alerts: on' });
        this.teamOff = page.getByRole('switch', { name: 'Workspace Team Alerts: off' });

        // Platform Admin Alerts
        this.adminOn = page.getByRole('switch', { name: 'Platform Admin Alerts: on' });
        this.adminOff = page.getByRole('switch', { name: 'Platform Admin Alerts: off' });

        /* ==========================
    Security
========================== */

this.securityTab = page.getByRole('tab', { name: 'Security' });

this.currentPassword = page.getByRole('textbox', {
    name: 'Enter current password'
});

this.newPassword = page.getByRole('textbox', {
    name: 'Choose a stronger password'
});

this.confirmPassword = page.getByRole('textbox', {
    name: 'Re-enter new password'
});

this.updatePasswordBtn = page.getByRole('button', {
    name: 'Update Password'
});

this.loginAlerts = page.getByRole('switch', {
    name: 'Login Alerts: on'
});
// Login Alerts
this.loginAlertsOn = page.getByRole('switch', {
    name: 'Login Alerts: on'
});

this.loginAlertsOff = page.getByRole('switch', {
    name: 'Login Alerts: off'
});
// Locator
this.loginAlertsToggle = page.getByRole('switch', {
    name: /Login Alerts: (on|off)/
});
this.loginAlertsOff = page.getByRole('switch', {
    name: 'Login Alerts: off'
});
/* ==========================
    Billing
========================== */

this.billingTab = page.getByRole('tab', { name: 'Billing' });

// Workspace Radio Buttons
this.userTeamRadio = page.getByRole('radio', { name: 'User Team 1783747633178' });
this.khushiTeamRadio = page.getByRole('radio', { name: 'khushi1 Team' });
this.membersTeamRadio = page.getByRole('radio', { name: 'Members Team' });

// Buttons
this.refreshButton = page.getByRole('button', { name: 'Refresh' });
this.requestStorageButton = page.getByRole('button', { name: 'Request more storage' });
this.sendRequestButton = page.getByRole('button', { name: 'Send request' });
this.doneButton = page.getByRole('button', { name: 'Done' });

// Plan
this.freePlan = page.getByText('Free plan');

// Storage Request
this.storageDropdown = page.getByLabel('Additional storage needed');
this.reasonTextbox = page.getByRole('textbox', {
    name: 'How will you use the extra'
});

// Billing Tabs
this.creditHistoryTab = page.getByRole('tab', {
    name: 'Credit history'
});

this.storageLedgerTab = page.getByRole('tab', {
    name: 'Storage ledger'
});

this.upgradeRequestsTab = page.getByRole('tab', {
    name: 'Upgrade requests'
});
this.membersTeamRadio = page.getByRole('radio', {
    name: 'Members Team'
});

this.refreshButton = page.getByRole('button', {
    name: 'Refresh'
});

this.requestStorageButton = page.getByRole('button', {
    name: 'Request more storage'
});

    }

    /* ==========================
        Actions
    ========================== */

    async openSettings() {
        await this.settingsButton.click();
    }

    async openAppearance() {
        await this.appearanceTab.click();
    }

    async openNotifications() {
        await this.notificationsTab.click();
    }

    async openSecurity() {
        await this.securityTab.click();
    }

    async openBilling() {
        await this.billingTab.click();
    }

    async openAppearance() {
    await this.appearanceTab.click();
}

async selectDarkTheme() {
    await this.darkTheme.click();
}

async selectLightTheme() {
    await this.lightTheme.click();
}

async selectOriginalTheme() {
    await this.originalTheme.click();
}

async selectOceanTheme() {
    await this.oceanTheme.click();
}

async selectForestTheme() {
    await this.forestTheme.click();
}

async selectSunsetTheme() {
    await this.sunsetTheme.click();
}

async openCustomAccent() {
    await this.customAccent.click();
}

async clickColorPreview() {
    await this.colorPreview.click();
}

async selectBlueAccent() {
    await this.blueAccent.click();
}

async selectPurpleAccent() {
    await this.purpleAccent.click();
}

async selectSkyAccent() {
    await this.skyAccent.click();
}

async selectOrangeAccent() {
    await this.orangeAccent.click();
}

async selectPinkAccent() {
    await this.pinkAccent.click();
}

async applyThemeChanges() {
    await this.applyChanges.click();
}
/* ==========================
        Navigation
    ========================== */

    async openSettings() {
        await this.settingsButton.click();
    }

    async openNotifications() {
        await this.notificationsTab.click();
    }

    /* ==========================
        Push Notifications
    ========================== */

    async enablePushNotifications() {
        await this.pushOn.click();
    }

    async disablePushNotifications() {
        await this.pushOff.click();
    }

    /* ==========================
        Comments & Mentions
    ========================== */

    async enableCommentsMentions() {
        await this.commentsOn.click();
    }

    async disableCommentsMentions() {
        await this.commentsOff.click();
    }

    /* ==========================
        Weekly Digest
    ========================== */

    async enableWeeklyDigest() {
        await this.weeklyOn.click();
    }

    async disableWeeklyDigest() {
        await this.weeklyOff.click();
    }

    /* ==========================
        Product Emails
    ========================== */

    async enableProductEmails() {
        await this.productOn.click();
    }

    async disableProductEmails() {
        await this.productOff.click();
    }

    /* ==========================
        Video Export Alerts
    ========================== */

    async enableVideoExportAlerts() {
        await this.videoExportOn.click();
    }

    async disableVideoExportAlerts() {
        await this.videoExportOff.click();
    }

    async toggleWorkspaceVideoExportAlerts() {
        await this.workspaceVideoExport.click();
    }

    /* ==========================
        Storage Alerts
    ========================== */

    async enableStorageAlerts() {
        await this.storageOn.click();
    }

    async disableStorageAlerts() {
        await this.storageOff.click();
    }

    /* ==========================
        Credits Alerts
    ========================== */

    async enableCreditsAlerts() {
        await this.creditsOn.click();
    }

    async disableCreditsAlerts() {
        await this.creditsOff.click();
    }

    /* ==========================
        Workspace Team Alerts
    ========================== */

    async enableWorkspaceTeamAlerts() {
        await this.teamOn.click();
    }

    async disableWorkspaceTeamAlerts() {
        await this.teamOff.click();
    }

    /* ==========================
        Platform Admin Alerts
    ========================== */

    async enablePlatformAdminAlerts() {
        await this.adminOn.click();
    }

    async disablePlatformAdminAlerts() {
        await this.adminOff.click();
    }

    async openSecurity() {
    await this.securityTab.click();
}

async enterCurrentPassword(password) {
    await this.currentPassword.fill(password);
}

async clearCurrentPassword() {
    await this.currentPassword.fill('');
}

async enterNewPassword(password) {
    await this.newPassword.fill(password);
}

async enterConfirmPassword(password) {
    await this.confirmPassword.fill(password);
}

async clickUpdatePassword() {
    await this.updatePasswordBtn.click();
}

async toggleLoginAlerts() {
    await this.loginAlerts.click();
}
async enableLoginAlerts() {
    await this.loginAlertsOff.click();
}

async disableLoginAlerts() {
    await this.loginAlertsOn.click();
}
// Method
async toggleLoginAlerts() {
    await this.loginAlertsToggle.click();
}
async openBilling() {
    await this.billingTab.click();
}

async selectUserTeam() {
    await this.userTeamRadio.click();
}

async selectKhushiTeam() {
    await this.khushiTeamRadio.click();
}

async selectMembersTeam() {
    await this.membersTeamRadio.click();
}

async refreshBilling() {
    await this.refreshButton.click();
}

async openFreePlan() {
    await this.freePlan.click();
}

async clickRequestStorage() {
    await this.requestStorageButton.click();
}

async selectStorage(size) {
    await this.storageDropdown.selectOption(size);
}

async enterStorageReason(reason) {
    await this.reasonTextbox.fill(reason);
}

async sendStorageRequest() {
    await this.sendRequestButton.click();
}

async clickDone() {
    await this.doneButton.click();
}

async openCreditHistory() {
    await this.creditHistoryTab.click();
}

async openStorageLedger() {
    await this.storageLedgerTab.click();
}

async openUpgradeRequests() {
    await this.upgradeRequestsTab.click();
}

}

module.exports = SettingsPage;