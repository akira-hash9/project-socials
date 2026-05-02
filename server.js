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

function carregarBio() {
    const pastaBio = path.join(__dirname, 'bio');
    if (!fs.existsSync(pastaBio)) {
        fs.mkdirSync(pastaBio);
        fs.writeFileSync(
            path.join(pastaBio, 'bio.txt'),
            'Felipe é um desenvolvedor e designer focado em experiências digitais.'
        );
    }
    return fs.readdirSync(pastaBio)
        .filter(file => file.endsWith('.txt'))
        .map(file => fs.readFileSync(path.join(pastaBio, file), 'utf-8'))
        .join('\n\n');
}

app.post('/ask', async (req, res) => {
    const { prompt, historico = [] } = req.body; // recebe histórico do front

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
                ...historico,  // mensagens anteriores
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 512, // reduzido para forçar respostas menores
        });
