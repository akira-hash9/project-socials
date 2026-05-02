const express = require('express');
const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const FAQ_PATH = path.join(__dirname, 'faq.json');

function carregarBio() {
    const pastaBio = path.join(__dirname, 'bio');
    if (!fs.existsSync(pastaBio)) {
        fs.mkdirSync(pastaBio);
        fs.writeFileSync(
            path.join(pastaBio, 'bio.txt'),
            'Felipe é um desenvolvedor e designer focado em experiências digitais.'
        );
    }
    
    // Carrega todos os arquivos .txt da pasta bio
    let bioPublica = fs.readdirSync(pastaBio)
        .filter(file => file.endsWith('.txt'))
        .map(file => fs.readFileSync(path.join(pastaBio, file), 'utf-8'))
        .join('\n\n');
    
    // Carrega secrets do .env (não commitados no GitHub)
    if (process.env.BIO_SECRETS) {
        bioPublica += '\n\n' + process.env.BIO_SECRETS;
    }
    
    return bioPublica;
}

function carregarFaq() {
    if (!fs.existsSync(FAQ_PATH)) {
        fs.writeFileSync(FAQ_PATH, JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(FAQ_PATH, 'utf-8'));
}

function salvarPergunta(pergunta) {
    const faq = carregarFaq();
    const existente = faq.find(f => f.texto.toLowerCase() === pergunta.toLowerCase());
    if (existente) {
        existente.count++;
    } else {
        faq.push({ texto: pergunta, count: 1 });
    }
    faq.sort((a, b) => b.count - a.count);
    fs.writeFileSync(FAQ_PATH, JSON.stringify(faq.slice(0, 20)));
}

app.get('/faq', (req, res) => {
    const faq = carregarFaq();
    res.json(faq.slice(0, 5));
});

app.post('/ask', async (req, res) => {
    const { prompt, historico = [] } = req.body;

    if (!prompt) {
        return res.status(400).json({ text: "Prompt não enviado." });
    }

    salvarPergunta(prompt);
    const contexto = carregarBio();

    try {
        const response = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: `Você é um assistente virtual do portfólio de Felipe. Responda de forma curta e direta, sem saudações repetidas.\n\nContexto:\n${contexto}`
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
app.listen(PORT, () => {
    console.log(`\n🚀 SERVIDOR ONLINE`);
    console.log(`📂 Bio: ${path.join(__dirname, 'bio')}`);
    console.log(`🔗 http://localhost:${PORT}\n`);
});
