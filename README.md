# Felipe — @fe_kl9 · Social Links Hub

Portfólio pessoal com chat inteligente integrado, powered by **Groq + LLaMA 3.3**.

---

## 📁 Estrutura do Projeto

```
project-socials/
├── index.html          # Estrutura da página (perfil, links, chat)
├── style.css           # Estilos, animações e tema dark
├── script.js           # Lógica do front-end e integração com o chat
├── server.js           # Servidor Node.js + API Groq
├── .env                # Variáveis de ambiente (não versionar)
├── package.json        # Dependências do projeto
├── README.md           # Este arquivo
├── assets/
│   └── images/
│       └── profile.jpeg    # Foto de perfil
└── bio/
    └── sobre mim.txt        # Contexto da IA sobre Felipe
```

---

## 🎨 Paleta de Cores

| Variável      | Cor        | Uso               |
|---------------|------------|-------------------|
| `--bg`        | `#0a0a0f`  | Fundo principal   |
| `--surface`   | `#111118`  | Superfícies       |
| `--text`      | `#f0eff5`  | Texto             |
| `--accent`    | `#c8b5ff`  | Destaque primário |
| `--accent2`   | `#85e3c8`  | Destaque secundário |

---

## 🤖 Felipe AI — Chat Inteligente

O chat usa **Groq API** com o modelo `llama-3.3-70b-versatile` para responder perguntas sobre Felipe em tempo real.

O comportamento da IA é definido pelos arquivos `.txt` dentro da pasta `bio/`. Para atualizar o que a IA sabe sobre Felipe, basta editar esses arquivos — sem mexer no código.

**Fluxo:**
```
Usuário digita → script.js envia POST /ask com histórico →
server.js consulta Groq → IA responde com contexto da bio →
resposta exibida no chat
```

---

## 🚀 Como Usar

### Pré-requisitos

- Node.js 18+
- Conta no [Groq Console](https://console.groq.com) (gratuito)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/fe_kl9/project-socials
cd project-socials

# Instale as dependências
npm install
```

### Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
GROQ_API_KEY=sua_chave_aqui
```

Pegue sua chave gratuita em: [console.groq.com](https://console.groq.com) → API Keys → Create API Key

### Rodando

```bash
node server.js
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 📦 Dependências

| Pacote       | Uso                              |
|--------------|----------------------------------|
| `express`    | Servidor HTTP                    |
| `groq-sdk`   | Integração com a API do Groq     |
| `cors`       | Permitir requisições cross-origin|
| `dotenv`     | Leitura do `.env`                |

---

## ⚙️ API

### `POST /ask`

Envia uma pergunta para a IA e recebe uma resposta baseada no contexto da bio.

**Body:**
```json
{
  "prompt": "Quais são as habilidades do Felipe?",
  "historico": [
    { "role": "user", "content": "Olá" },
    { "role": "assistant", "content": "Olá! O que deseja saber?" }
  ]
}
```

**Response:**
```json
{
  "text": "Felipe tem experiência em Python, Node.js, automações e cibersegurança."
}
```

---

## 🔒 Segurança

- Nunca suba o `.env` para o repositório
- Adicione `.env` ao `.gitignore`:

```
.env
node_modules/
```

---

## 📄 Licença

MIT — feito por [@fe_kl9](https://instagram.com/fe_kl9)