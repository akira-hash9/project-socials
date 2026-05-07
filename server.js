const express = require('express');
const Groq = require('groq-sdk');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

let bioCache = '';

async function carregarBio() {
    try {
        const res = await fetch('https://gist.githubusercontent.com/akira-hash9/12352ae329ac19c7af393aab4bccbdc5/raw/gistfile1.txt');
        if (res.ok) {
            bioCache = await res.text();
            console.log("✅ Bio carregada do Gist");
        }
    } catch (e) {
        console.warn("⚠️ Erro ao carregar bio:", e.message);
    }
}

app.post('/ask', async (req, res) => {
    const { prompt, historico = [] } = req.body;
    if (!prompt) {
        return res.status(400).json({ text: "Prompt não enviado." });
    }
    try {
        const response = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: `Você é um assistente virtual do portfólio de Felipe. Responda de forma curta e direta, sem saudações repetidas.\n\nContexto:\n${bioCache}`
                },
                ...historico,
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 512,
        });
        const text = response.choices[0].message.content;
        console.log("✅ Resposta gerada!");
        res.json({ text });
    } catch (error) {
        console.error("❌ Erro:", error.message);
        res.status(500).json({ text: "Erro ao gerar resposta. Verifique o terminal." });
    }
});

const PORT = process.env.PORT || 3000;

carregarBio().then(() => {
    app.listen(PORT, () => {
        console.log(`\n🚀 SERVIDOR ONLINE`);
        console.log(`🔗 http://localhost:${PORT}\n`);
    });
});
