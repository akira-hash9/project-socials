const glow = document.getElementById('cursorGlow');
let mx = window.innerWidth / 2, my = window.innerHeight / 2;
let cx = mx, cy = my;

document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
});

function animateGlow() {
    cx += (mx - cx) * 0.08;
    cy += (my - cy) * 0.08;
    if (glow) {
        glow.style.left = cx + 'px';
        glow.style.top = cy + 'px';
    }
    requestAnimationFrame(animateGlow);
}
animateGlow();

document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25 - 4}px) scale(1.1)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = '');
});

document.querySelectorAll('.link-card').forEach(card => {
    card.addEventListener('click', function(e) {
        const r = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(r.width, r.height) * 2;
        ripple.style.cssText = `
            position:absolute; border-radius:50%; background:rgba(255,255,255,0.06);
            width:${size}px; height:${size}px;
            left:${e.clientX - r.left - size / 2}px; top:${e.clientY - r.top - size / 2}px;
            transform:scale(0); animation:ripple 0.6s ease-out forwards; pointer-events:none; z-index:0;
        `;
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    });
});

const chatToggle = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const chatClose = document.getElementById('chat-close');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const chatMessages = document.getElementById('chat-messages');

let historico = [];

if (chatToggle) chatToggle.onclick = () => chatWindow.classList.toggle('hidden');
if (chatClose) chatClose.onclick = () => chatWindow.classList.add('hidden');

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = '';
    chatMessages.innerHTML += `
        <div style="margin-bottom: 12px; text-align: right;">
            <span style="background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 12px; display: inline-block; font-size: 13px;">
                <b>Você:</b> ${text}
            </span>
        </div>`;

    const loadingId = "loading-" + Date.now();
    chatMessages.innerHTML += `<div id="${loadingId}" style="margin-bottom: 12px; font-size: 13px; color: var(--accent); opacity: 0.8;">Felipe AI está pensando...</div>`;
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const res = await fetch('https://project-socials-production.up.railway.app/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: text, historico })
        });

        const data = await res.json();

        historico.push({ role: "user", content: text });
        historico.push({ role: "assistant", content: data.text });

        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();

        chatMessages.innerHTML += `
            <div style="margin-bottom: 12px; text-align: left;">
                <span style="background: rgba(200,181,255,0.15); padding: 8px 12px; border-radius: 12px; display: inline-block; font-size: 13px; border: 1px solid rgba(200,181,255,0.2);">
                    <b>Felipe AI:</b> ${data.text || "Não consegui processar isso agora."}
                </span>
            </div>`;
    } catch (err) {
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.innerText = "Erro: O servidor Node está offline.";
        console.error("Erro no chat:", err);
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

if (chatSend) chatSend.onclick = sendMessage;
if (chatInput) {
    chatInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
}

/* === AGE WARNING FOR PINTEREST === */
const pinterestLink = document.getElementById('pinterest-link');
const ageWarningModal = document.getElementById('age-warning-modal');
const ageWarningOverlay = document.getElementById('age-warning-overlay');
const ageCancelBtn = document.getElementById('age-cancel');
const ageConfirmBtn = document.getElementById('age-confirm');
let pinterestUrl = '';

if (pinterestLink) {
    pinterestLink.addEventListener('click', (e) => {
        e.preventDefault();
        pinterestUrl = pinterestLink.getAttribute('href');
        ageWarningModal.classList.remove('hidden');
        ageWarningOverlay.classList.remove('hidden');
    });
}

if (ageCancelBtn) {
    ageCancelBtn.addEventListener('click', () => {
        ageWarningModal.classList.add('hidden');
        ageWarningOverlay.classList.add('hidden');
        pinterestUrl = '';
    });
}

if (ageConfirmBtn) {
    ageConfirmBtn.addEventListener('click', () => {
        if (pinterestUrl) {
            window.open(pinterestUrl, '_blank');
        }
        ageWarningModal.classList.add('hidden');
        ageWarningOverlay.classList.add('hidden');
        pinterestUrl = '';
    });
}

if (ageWarningOverlay) {
    ageWarningOverlay.addEventListener('click', () => {
        ageWarningModal.classList.add('hidden');
        ageWarningOverlay.classList.add('hidden');
        pinterestUrl = '';
    });
}