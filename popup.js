document.addEventListener('DOMContentLoaded', () => {
    loadStats();

    document.getElementById('reset-btn').addEventListener('click', () => {
        chrome.storage.local.set({ screenTime: {} }, () => {
            loadStats();
        });
    });
});

function loadStats() {
    chrome.storage.local.get(['screenTime'], (result) => {
        const screenTime = result.screenTime || {};
        const list = document.getElementById('stats-list');
        list.innerHTML = '';

        const sorted = Object.entries(screenTime)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        if (sorted.length === 0) {
            list.innerHTML = '<p style="color:#888; text-align:center;">No data yet.</p>';
            return;
        }

        sorted.forEach(([domain, seconds]) => {
            const div = document.createElement('div');
            div.className = 'stat-item';
            div.innerHTML = `
                <span class="domain">${domain}</span>
                <span class="time">${formatTime(seconds)}</span>
            `;
            list.appendChild(div);
        });
    });
}

function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
}
