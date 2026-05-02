const express = require('express');
const Groq = require('groq-sdk');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

function carregarBio() {
    if (process.env.SYSTEM_PROMPT) {
        return process.env.SYSTEM_PROMPT;
    }
    return 'Felipe é um desenvolvedor e designer focado em experiências digitais.';
}

app.post('/ask', async (req, res) => {
    const { prompt, historico = [] } = req.body;
    if (!prompt) {
        return res.status(400).json({ text: "Prompt não enviado." });
    }
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
        console.log("Resposta gerada!");
        res.json({ text });
    } catch (error) {
        console.error("Erro:", error.message);
        res.status(500).json({ text: "Erro ao gerar resposta. Verifique o terminal." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor online na porta ${PORT}`);
});
