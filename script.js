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
    if (window.matchMedia('(hover: hover)').matches) {
        btn.addEventListener('mousemove', e => {
            const r = btn.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            btn.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25 - 4}px) scale(1.1)`;
        });
        btn.addEventListener('mouseleave', () => btn.style.transform = '');
    }
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

// Fix zoom no mobile
if (chatInput) chatInput.style.fontSize = '16px';

let historico = [];
let suggestionsContainer = null;
let carregandoSugestoes = false;

const perguntasPadrao = [
    'Como posso entrar em contato?',
    'Qual é sua formação?',
];

async function carregarSugestoes() {
    if (suggestionsContainer || carregandoSugestoes || historico.length > 0) return;
    carregandoSugestoes = true;

    let perguntas = perguntasPadrao;

    try {
        const res = await fetch('/faq');
        const faq = await res.json();
        if (faq.length >= 3) {
            perguntas = faq.map(f => f.texto);
        }
    } catch (e) {}

    if (historico.length > 0) { carregandoSugestoes = false; return; }

    suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = 'chat-suggestions';
    suggestionsContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 8px 12px 4px;
        transition: opacity 0.4s ease, transform 0.4s ease;
        opacity: 1;
        transform: translateY(0);
    `;

    const label = document.createElement('div');
    label.style.cssText = `
        font-size: 10px;
        color: rgba(200,181,255,0.5);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 2px;
    `;
    label.innerText = 'Perguntas frequentes';
    suggestionsContainer.appendChild(label);

    perguntas.slice(0, 5).forEach((pergunta, i) => {
        const btn = document.createElement('button');
        btn.innerText = pergunta;
        btn.style.cssText = `
            background: rgba(200,181,255,0.07);
            border: 1px solid rgba(200,181,255,0.15);
            border-radius: 20px;
            color: #f0eff5;
            font-size: 12px;
            padding: 6px 12px;
            text-align: left;
            cursor: pointer;
            transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
            opacity: 0;
            animation: fadeUp 0.3s ease forwards;
            animation-delay: ${i * 0.06}s;
        `;
        btn.onmouseenter = () => {
            btn.style.background = 'rgba(200,181,255,0.15)';
            btn.style.borderColor = 'rgba(200,181,255,0.35)';
            btn.style.transform = 'translateX(3px)';
        };
        btn.onmouseleave = () => {
            btn.style.background = 'rgba(200,181,255,0.07)';
            btn.style.borderColor = 'rgba(200,181,255,0.15)';
            btn.style.transform = 'translateX(0)';
        };
        btn.onclick = () => {
            chatInput.value = pergunta;
            esconderSugestoes();
            sendMessage();
        };
        suggestionsContainer.appendChild(btn);
    });

    chatMessages.parentNode.insertBefore(suggestionsContainer, chatMessages);
    carregandoSugestoes = false;
}

function esconderSugestoes() {
    if (!suggestionsContainer) return;
    suggestionsContainer.style.opacity = '0';
    suggestionsContainer.style.transform = 'translateY(-8px)';
    setTimeout(() => {
        if (suggestionsContainer) {
            suggestionsContainer.remove();
            suggestionsContainer = null;
        }
    }, 400);
}

if (chatToggle) {
    chatToggle.onclick = () => {
        chatWindow.classList.toggle('hidden');
        if (!chatWindow.classList.contains('hidden') && !suggestionsContainer && historico.length === 0) {
            carregarSugestoes();
        }
    };
}

if (chatClose) chatClose.onclick = () => chatWindow.classList.add('hidden');

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    esconderSugestoes();
    chatInput.value = '';

    chatMessages.innerHTML += `
        <div style="margin-bottom: 12px; text-align: right;">
            <span style="background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 12px; display: inline-block; font-size: 13px;">
                <b>Você:</b> ${text}
            </span>
        </div>`;

    const loadingId = "loading-" + Date.now();
    chatMessages.innerHTML += `<div id="${loadingId}" style="margin-bottom: 12px; font-size: 13px; color: var(--accent); opacity: 0.8;">Makima AI está pensando...</div>`;
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
                    <b>Makima AI:</b> ${data.text || "Não consegui processar isso agora."}
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
    chatInput.addEventListener('focus', esconderSugestoes);
}

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

setTimeout(() => {
    const bubble = document.createElement('div');
    bubble.id = 'chat-hint';
    bubble.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 20px;
        background: rgba(15, 15, 20, 0.95);
        border: 1px solid rgba(200, 181, 255, 0.3);
        border-radius: 16px 16px 4px 16px;
        padding: 10px 14px;
        font-size: 13px;
        color: #f0eff5;
        z-index: 999;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        cursor: pointer;
        max-width: 220px;
    `;
    bubble.innerText = '💬 O que deseja saber sobre Felipe?';
    document.body.appendChild(bubble);

    bubble.onclick = () => {
        bubble.remove();
        chatWindow.classList.remove('hidden');
        carregarSugestoes();
    };

    setTimeout(() => {
        if (document.getElementById('chat-hint')) {
            bubble.style.opacity = '0';
            bubble.style.transition = 'opacity 0.5s';
            setTimeout(() => bubble.remove(), 500);
        }
    }, 6000);
}, 2000);

const avatar = document.querySelector('.avatar');
const avatarImg = document.querySelector('.avatar img');

if (avatar && avatarImg) {
    avatar.style.cursor = 'zoom-in';

    avatar.addEventListener('click', () => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; inset: 0; z-index: 9999;
            background: rgba(0,0,0,0); display: flex;
            align-items: center; justify-content: center;
            transition: background 0.3s ease;
            cursor: zoom-out;
        `;

        const img = document.createElement('img');
        img.src = avatarImg.src;
        img.style.cssText = `
            width: 100px; height: 100px;
            border-radius: 50%; object-fit: cover;
            transform: scale(1); opacity: 1;
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            box-shadow: 0 0 0 rgba(0,0,0,0);
        `;

        overlay.appendChild(img);
        document.body.appendChild(overlay);

        const rect = avatar.getBoundingClientRect();
        img.style.position = 'fixed';
        img.style.left = rect.left + 'px';
        img.style.top = rect.top + 'px';
        img.style.margin = '0';

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                overlay.style.background = 'rgba(0,0,0,0.85)';
                img.style.cssText = `
                    position: fixed;
                    width: min(85vw, 380px); height: min(85vw, 380px);
                    border-radius: 24px; object-fit: cover;
                    left: 50%; top: 50%;
                    transform: translate(-50%, -50%);
                    transition: all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
                    box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08);
                    cursor: zoom-out;
                `;
            });
        });

        const close = () => {
            overlay.style.background = 'rgba(0,0,0,0)';
            img.style.cssText = `
                position: fixed;
                width: 100px; height: 100px;
                border-radius: 50%; object-fit: cover;
                left: ${rect.left}px; top: ${rect.top}px;
                transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                box-shadow: none;
            `;
            setTimeout(() => overlay.remove(), 350);
        };

        overlay.addEventListener('click', close);
    });
}

// README Panel
const readmeContent = `
<div style="margin-bottom:16px;">
  <div style="color:#f0eff5;font-size:15px;font-weight:bold;margin-bottom:4px;">Felipe — @fe_kl9</div>
  <div style="color:rgba(200,181,255,0.5);font-size:11px;">git: akira-hash9 · Social Links Hub</div>
  <div style="color:#c8c8d8;font-size:12px;margin-top:8px;line-height:1.6;">Portfólio pessoal com chat inteligente integrado, powered by Groq + LLaMA.</div>
</div>

<hr style="border:none;border-top:1px solid rgba(200,181,255,0.1);margin:12px 0;">

<div style="color:#c8b5ff;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">📁 Estrutura</div>
<pre style="background:rgba(200,181,255,0.05);border:1px solid rgba(200,181,255,0.1);border-radius:8px;padding:10px;overflow-x:auto;font-size:11px;line-height:1.6;color:#85e3c8;">project-socials/
├── index.html
├── style.css
├── script.js
├── server.js
├── .env
├── package.json
├── assets/
│   └── images/
│       └── profile.jpeg
└── bio/
    └── sobre mim.txt</pre>

<hr style="border:none;border-top:1px solid rgba(200,181,255,0.1);margin:12px 0;">

<div style="color:#c8b5ff;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">🎨 Paleta de Cores</div>
<div style="display:flex;flex-direction:column;gap:6px;font-size:11px;">
  <div style="display:flex;align-items:center;gap:8px;"><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:#0a0a0f;border:1px solid rgba(255,255,255,0.1);"></span><code style="color:#85e3c8;">--bg</code><span style="color:#c8c8d8;">#0a0a0f — Fundo principal</span></div>
  <div style="display:flex;align-items:center;gap:8px;"><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:#111118;border:1px solid rgba(255,255,255,0.1);"></span><code style="color:#85e3c8;">--surface</code><span style="color:#c8c8d8;">#111118 — Superfícies</span></div>
  <div style="display:flex;align-items:center;gap:8px;"><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:#f0eff5;"></span><code style="color:#85e3c8;">--text</code><span style="color:#c8c8d8;">#f0eff5 — Texto</span></div>
  <div style="display:flex;align-items:center;gap:8px;"><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:#c8b5ff;"></span><code style="color:#85e3c8;">--accent</code><span style="color:#c8c8d8;">#c8b5ff — Destaque primário</span></div>
  <div style="display:flex;align-items:center;gap:8px;"><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:#85e3c8;"></span><code style="color:#85e3c8;">--accent2</code><span style="color:#c8c8d8;">#85e3c8 — Destaque secundário</span></div>
</div>

<hr style="border:none;border-top:1px solid rgba(200,181,255,0.1);margin:12px 0;">

<div style="color:#c8b5ff;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">🤖 Makima AI</div>
<div style="color:#c8c8d8;font-size:12px;line-height:1.7;">
  O chat usa a API do Groq com o modelo <code style="background:rgba(200,181,255,0.1);padding:1px 5px;border-radius:4px;color:#85e3c8;">llama-3.1-8b-instant</code> para responder perguntas sobre Felipe em tempo real.<br><br>
  O comportamento da IA é definido pelos arquivos <code style="background:rgba(200,181,255,0.1);padding:1px 5px;border-radius:4px;color:#85e3c8;">.txt</code> dentro da pasta <code style="background:rgba(200,181,255,0.1);padding:1px 5px;border-radius:4px;color:#85e3c8;">bio/</code>. Para atualizar o que ela sabe, basta editar esses arquivos — sem mexer no código.
</div>
<div style="margin-top:10px;background:rgba(200,181,255,0.05);border:1px solid rgba(200,181,255,0.1);border-radius:8px;padding:10px;font-size:11px;color:#85e3c8;line-height:1.8;">
  Você digita → script.js → POST /ask → server.js → Groq → resposta no chat
</div>

<hr style="border:none;border-top:1px solid rgba(200,181,255,0.1);margin:12px 0;">

<div style="color:#c8b5ff;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">🚀 Como Usar</div>
<div style="color:#c8c8d8;font-size:12px;margin-bottom:8px;">Node.js 18+ e conta gratuita no <a href="https://console.groq.com" target="_blank" style="color:#c8b5ff;text-decoration:none;border-bottom:1px solid rgba(200,181,255,0.3);">Groq Console</a>.</div>
<pre style="background:rgba(200,181,255,0.05);border:1px solid rgba(200,181,255,0.1);border-radius:8px;padding:10px;font-size:11px;color:#85e3c8;overflow-x:auto;line-height:1.8;">git clone https://github.com/akira-hash9/project-socials
cd project-socials
npm install</pre>
<div style="color:#c8c8d8;font-size:12px;margin:8px 0 4px;">Crie o arquivo <code style="background:rgba(200,181,255,0.1);padding:1px 5px;border-radius:4px;color:#85e3c8;">.env</code>:</div>
<pre style="background:rgba(200,181,255,0.05);border:1px solid rgba(200,181,255,0.1);border-radius:8px;padding:10px;font-size:11px;color:#85e3c8;overflow-x:auto;">GROQ_API_KEY=sua_chave_aqui</pre>
<pre style="background:rgba(200,181,255,0.05);border:1px solid rgba(200,181,255,0.1);border-radius:8px;padding:10px;font-size:11px;color:#85e3c8;overflow-x:auto;">node server.js</pre>

<hr style="border:none;border-top:1px solid rgba(200,181,255,0.1);margin:12px 0;">

<div style="color:#c8b5ff;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">📦 Dependências</div>
<div style="display:flex;flex-direction:column;gap:6px;font-size:11px;color:#c8c8d8;">
  <div><code style="color:#85e3c8;">express</code> — Servidor HTTP</div>
  <div><code style="color:#85e3c8;">groq-sdk</code> — Integração com o Groq</div>
  <div><code style="color:#85e3c8;">cors</code> — Requisições cross-origin</div>
  <div><code style="color:#85e3c8;">dotenv</code> — Leitura do .env</div>
</div>

<hr style="border:none;border-top:1px solid rgba(200,181,255,0.1);margin:12px 0;">

<div style="color:#c8b5ff;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">🔒 Segurança</div>
<div style="color:#c8c8d8;font-size:12px;line-height:1.7;">Nunca suba o <code style="background:rgba(200,181,255,0.1);padding:1px 5px;border-radius:4px;color:#85e3c8;">.env</code> para o repositório. Confirma que seu <code style="background:rgba(200,181,255,0.1);padding:1px 5px;border-radius:4px;color:#85e3c8;">.gitignore</code> contém:</div>
<pre style="background:rgba(200,181,255,0.05);border:1px solid rgba(200,181,255,0.1);border-radius:8px;padding:10px;font-size:11px;color:#85e3c8;overflow-x:auto;">.env
node_modules/</pre>

<hr style="border:none;border-top:1px solid rgba(200,181,255,0.1);margin:12px 0;">

<div style="color:rgba(200,181,255,0.4);font-size:11px;">MIT — feito por <a href="https://github.com/akira-hash9" target="_blank" style="color:#c8b5ff;text-decoration:none;">@fe_kl9</a></div>
`;

const readmePanel = document.createElement('div');
readmePanel.id = 'readme-panel';
readmePanel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 12px;
    transform: translateY(-50%);
    z-index: 998;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const readmeToggle = document.createElement('button');
readmeToggle.id = 'readme-toggle';
readmeToggle.style.cssText = `
    background: rgba(15, 15, 20, 0.95);
    border: 1px solid rgba(200, 181, 255, 0.2);
    border-radius: 8px;
    color: rgba(200,181,255,0.7);
    font-size: 11px;
    font-family: 'Courier New', monospace;
    padding: 6px 10px;
    cursor: pointer;
    backdrop-filter: blur(10px);
    letter-spacing: 0.05em;
    transition: all 0.2s ease;
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
`;
readmeToggle.innerText = '📄 README.md';
readmeToggle.onmouseenter = () => {
    readmeToggle.style.borderColor = 'rgba(200,181,255,0.5)';
    readmeToggle.style.color = '#f0eff5';
};
readmeToggle.onmouseleave = () => {
    readmeToggle.style.borderColor = 'rgba(200,181,255,0.2)';
    readmeToggle.style.color = 'rgba(200,181,255,0.7)';
};

const readmeBox = document.createElement('div');
readmeBox.id = 'readme-box';
let readmeOpen = false;
readmeBox.style.cssText = `
    background: rgba(10, 10, 15, 0.97);
    border: 1px solid rgba(200, 181, 255, 0.15);
    border-radius: 12px;
    padding: 16px;
    margin-top: 8px;
    width: min(300px, 80vw);
    max-height: 65vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    font-family: 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.7;
    color: #c8c8d8;
    opacity: 0;
    transform: translateY(-8px) scaleY(0.95);
    transform-origin: top;
    transition: opacity 0.3s ease, transform 0.3s ease;
    pointer-events: none;
    display: block;
`;

readmeBox.innerHTML = readmeContent;

readmeToggle.onclick = () => {
    readmeOpen = !readmeOpen;
    if (readmeOpen) {
        readmeBox.style.opacity = '1';
        readmeBox.style.transform = 'translateY(0) scaleY(1)';
        readmeBox.style.pointerEvents = 'auto';
        readmeToggle.innerText = '✕ README.md';
    } else {
        readmeBox.style.opacity = '0';
        readmeBox.style.transform = 'translateY(-8px) scaleY(0.95)';
        readmeBox.style.pointerEvents = 'none';
        readmeToggle.innerText = '📄 README.md';
    }
};

readmePanel.appendChild(readmeToggle);
readmePanel.appendChild(readmeBox);
document.body.appendChild(readmePanel);
readmePanel.appendChild(readmeToggle);
readmePanel.appendChild(readmeBox);
document.body.appendChild(readmePanel);
