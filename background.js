let activeTabId = null;
let activeDomain = null;
const TRACKING_INTERVAL = 1000;

// Initialize Global Timer for Break
chrome.alarms.create('stretchTimer', { periodInMinutes: 30 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'stretchTimer') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "trigger_stretch_break" });
            }
        });
    }
});

// Track Active Tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    activeTabId = activeInfo.tabId;
    await updateStateAndCheck(activeTabId);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (tabId === activeTabId) {
        if (changeInfo.url || changeInfo.status === 'complete') {
            await updateStateAndCheck(tabId, tab.url);
        }
    }
});

async function updateStateAndCheck(tabId, urlOverride = null) {
    let url = urlOverride;

    if (!url) {
        try {
            const tab = await chrome.tabs.get(tabId);
            url = tab.url;
        } catch (e) {
            return;
        }
    }

    if (!url) return;

    try {
        const urlObj = new URL(url);
        activeDomain = urlObj.hostname;
        checkRestrictedSites(activeDomain, url, tabId);
    } catch (e) {
        activeDomain = null;
    }
}

function checkRestrictedSites(domain, fullUrl, tabId) {
    if (!domain) return;

    const socialMedia = ['whatsapp.com', 'web.whatsapp.com', 'instagram.com', 'facebook.com', 'twitter.com', 'x.com'];
    if (socialMedia.some(site => domain.includes(site))) {
        chrome.tabs.sendMessage(tabId, { action: "trigger_social_block" }).catch(() => { });
    }

    if (domain.includes('youtube.com') && fullUrl.includes('/shorts/')) {
        chrome.tabs.sendMessage(tabId, { action: "trigger_shorts_alert" }).catch(() => { });
    }
}

// Daily Reset Logic
function checkAndResetDailyStats() {
    const today = new Date().toLocaleDateString();

    chrome.storage.local.get(['lastResetDate'], (result) => {
        const lastDate = result.lastResetDate;

        if (lastDate !== today) {
            // New day detected, reset stats
            chrome.storage.local.set({
                screenTime: {},
                lastResetDate: today
            });
            console.log('Stats reset for new day:', today);
        }
    });
}

// Usage Tracking Loop
setInterval(() => {
    // Check for daily reset first
    checkAndResetDailyStats();

    if (activeDomain) {
        chrome.storage.local.get(['screenTime'], (result) => {
            const screenTime = result.screenTime || {};
            if (!screenTime[activeDomain]) screenTime[activeDomain] = 0;

            screenTime[activeDomain] += 1;
            chrome.storage.local.set({ screenTime });
        });
    }
}, TRACKING_INTERVAL);
