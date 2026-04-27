// === 1. ANIMAÇÕES VISUAIS (Glow, Parallax e Ripple) ===
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

// === 2. LÓGICA DO CHAT (INTEGRAÇÃO COM BACKEND) ===
const chatToggle = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const chatClose = document.getElementById('chat-close');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const chatMessages = document.getElementById('chat-messages');

// Abrir e fechar
if (chatToggle) chatToggle.onclick = () => chatWindow.classList.toggle('hidden');
if (chatClose) chatClose.onclick = () => chatWindow.classList.add('hidden');

// Função de Envio
async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Mostra mensagem do usuário
    chatInput.value = '';
    chatMessages.innerHTML += `
        <div style="margin-bottom: 12px; text-align: right;">
            <span style="background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 12px; display: inline-block; font-size: 13px;">
                <b>Você:</b> ${text}
            </span>
        </div>`;
    
    // Mostra "Digitando..."
    const loadingId = "loading-" + Date.now();
    chatMessages.innerHTML += `<div id="${loadingId}" style="margin-bottom: 12px; font-size: 13px; color: var(--accent); opacity: 0.8;">Felipe AI está pensando...</div>`;
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        // Mudei para http://localhost:3000/ask para garantir que acerte a porta do Node
        const res = await fetch('http://localhost:3000/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: text })
        });
        
        const data = await res.json();
        
        // Remove "pensando"
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();

        // Adiciona a resposta da IA (usando data.text que é o que o server envia)
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

let historico = [];

async function enviarMensagem(prompt) {
    const res = await fetch('/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, historico })
    });

    const data = await res.json();

    // atualiza histórico com a troca atual
    historico.push({ role: "user", content: prompt });
    historico.push({ role: "assistant", content: data.text });

    return data.text;
}