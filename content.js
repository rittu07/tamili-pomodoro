// Listen for messages from background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "trigger_stretch_break") {
        showStretchPopup();
    } else if (request.action === "trigger_social_block") {
        showSocialBlock();
    } else if (request.action === "trigger_shorts_alert") {
        showShortsAlert();
    }
});

// SELF-CHECK on Load
// This ensures blocking happens immediately without waiting for Background script
function performSelfCheck() {
    // Check if unlocked for this session
    if (sessionStorage.getItem('podamo_social_unlocked') === 'true') return;

    const domain = window.location.hostname;
    const path = window.location.pathname;

    // Social Media Block
    const socialMedia = ['whatsapp.com', 'web.whatsapp.com', 'instagram.com', 'facebook.com', 'twitter.com', 'x.com'];
    if (socialMedia.some(site => domain.includes(site))) {
        showSocialBlock();
    }

    // YouTube Shorts Block
    if (domain.includes('youtube.com') && path.includes('/shorts/')) {
        showShortsAlert();
    }
}

// Run immediately
performSelfCheck();

// Run periodically for SPA navigation (like YouTube or WhatsApp web updates)
setInterval(performSelfCheck, 1000);

// --- UI Functions ---

function createOverlay(id) {
    if (document.getElementById(id)) return document.getElementById(id); // Avoid duplicates
    const overlay = document.createElement('div');
    overlay.id = id;
    overlay.className = 'podamo-overlay';
    document.body.appendChild(overlay);
    return overlay;
}

function showStretchPopup() {
    if (document.getElementById('podamo-stretch-overlay')) return;

    const overlay = createOverlay('podamo-stretch-overlay');

    // Tamil Memes Collection
    const memes = [
        { text: "Romba nerama vela pakringala?", sub: "Take a break, stretch your body!" },
        { text: "Ippudiye ukkanduruntha, mudhu odinjirum!", sub: "Stand up and walk for 5 mins." },
        { text: "Break edukala na, moola sudagirum!", sub: "Time for a Podamo break." },
        // New Tamil Messages
        { text: "Konjam relax pannunga boss!", sub: "Don't stress, relax now." },
        { text: "Kanna kanna moodi konjam rest edunga.", sub: "Your eyes are hurting, look away!" },
        // New English Memes
        { text: "One does not simply work 5 hours straight.", sub: "Walk around for a bit." },
        { text: "Keep Calm and Take a Break.", sub: "You earned it." },
        { text: "System needs a restart. So do you.", sub: "Breathe in, breathe out." }
    ];
    const randomMeme = memes[Math.floor(Math.random() * memes.length)];

    overlay.innerHTML = `
        <div class="podamo-card">
            <h1>🧘 Time to Stretch!</h1>
            <p class="meme-text">${randomMeme.text}</p>
            <p>${randomMeme.sub}</p>
             <button id="podamo-close-btn">Sari, I'll stretch</button>
        </div>
    `;

    document.getElementById('podamo-close-btn').addEventListener('click', () => {
        overlay.remove();
    });
}

function showSocialBlock() {
    // Avoid double overlay
    if (document.getElementById('podamo-social-overlay')) return;

    const overlay = createOverlay('podamo-social-overlay');
    overlay.style.backgroundColor = 'rgba(0,0,0,0.95)';
    overlay.style.zIndex = '999999';

    overlay.innerHTML = `
        <div class="podamo-danger-card">
            <h1 style="color:red; font-size: 3rem;">🤬 SHUT THE F*** UP AND LEAVE!</h1>
            <p>No social media during work hours. Poda dei!</p>
            <div style="margin-top: 20px;">
                <input type="password" id="podamo-password" placeholder="Enter Password" style="padding: 10px; font-size: 1rem; border-radius: 5px; border: none;">
                <button id="podamo-unlock-btn" style="padding: 10px 20px; font-size: 1rem; cursor: pointer; background-color: #ff4757; color: white; border: none; border-radius: 5px; margin-left: 10px;">Unlock</button>
            </div>
            <p id="podamo-error" style="color: red; display: none; margin-top: 10px; font-weight: bold;">Wrong Password! (Try rittu1234)</p>
        </div>
    `;

    // Prevent scrolling
    document.body.style.overflow = 'hidden';

    // Add event listener
    document.getElementById('podamo-unlock-btn').addEventListener('click', () => {
        const pass = document.getElementById('podamo-password').value;
        if (pass === 'rittu1234') {
            sessionStorage.setItem('podamo_social_unlocked', 'true');
            overlay.remove();
            document.body.style.overflow = 'auto'; // Restore scrolling
        } else {
            const errorMsg = document.getElementById('podamo-error');
            errorMsg.style.display = 'block';
        }
    });

    // Allow Enter key to submit
    document.getElementById('podamo-password').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            document.getElementById('podamo-unlock-btn').click();
        }
    });
}

function showShortsAlert() {
    if (document.getElementById('podamo-shorts-alert')) return;

    const alert = document.createElement('div');
    alert.id = 'podamo-shorts-alert';
    alert.innerHTML = `
        <h2 style="margin:0">🛑 STOP WATCHING SHORTS!</h2>
        <p style="margin:0">Don't rot your brain.</p>
    `;
    document.body.appendChild(alert);

    // Remove after 5s or assume user navigates away (checked by interval)
    setTimeout(() => {
        alert.remove();
    }, 5000);
}
