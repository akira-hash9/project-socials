# Felipe Prado - Social Links Hub

Uma página de perfil minimalista e moderna que centraliza todos os seus links de redes sociais e portfólio. Design responsivo com animações suaves e efeitos visuais sofisticados.

## ✨ Características

- **Design Minimalista**: Interface limpa e intuitiva
- **Animações Suaves**: Efeitos de entrada e transição elegantes
- **Responsivo**: Totalmente adaptável para dispositivos móveis
- **Efeitos Visuais**: 
  - Bordas girantes na foto de perfil com acrílico vermelho
  - Fundo com efeito de vidro sutil
  - Efeito magnético nos botões de redes sociais
  - Efeito ripple nos cards ao clicar
  - Cursor glow interativo

## 🛠 Tecnologias

- **HTML5**: Estrutura semântica
- **CSS3**: Animations, gradients, backdrop filters
- **JavaScript**: Interatividade e efeitos dinâmicos
- **Fontes**: Syne (títulos) e DM Sans (corpo)

## 📁 Estrutura do Projeto

```
project-socials/
├── index.html          # Estrutura HTML
├── style.css           # Estilos e animações
├── script.js           # Interatividade
├── assets/
│   └── images/
│       └── profile.jpeg    # Foto de perfil
└── README.md           # Documentação
```

## 🎨 Paleta de Cores

| Variável | Cor | Uso |
|----------|-----|-----|
| `--bg` | `#0a0a0f` | Fundo principal |
| `--surface` | `#111118` | Superfícies |
| `--text` | `#f0eff5` | Texto |
| `--accent` | `#c8b5ff` | Destaque primário |
| `--accent2` | `#85e3c8` | Destaque secundário |

## 🚀 Como Usar

### Instalação

1. Clone ou baixe o repositório
2. Adicione sua foto de perfil em `assets/images/profile.jpeg`
3. Customize o `index.html` com suas informações

### Personalização

#### Editar Perfil
```html
<h1 class="name">Seu Nome</h1>
<p class="handle">@seu_usuario</p>
<p class="bio">Sua descrição aqui</p>
```

#### Adicionar Links Sociais
```html
<a href="seu-link" target="_blank" class="social-btn" title="Rede Social">
  <svg><!-- seu ícone --></svg>
</a>
```

#### Alterar Cards de Links
```html
<a href="seu-link" class="link-card" style="--card-accent: #sua-cor;">
  <div class="link-icon">Ícone</div>
  <div class="link-info">
    <p class="link-title">Título</p>
    <p class="link-desc">Descrição</p>
  </div>
</a>
```

## 💻 Funcionalidades JavaScript

### Cursor Glow
Elemento visual que segue o cursor do mouse com animação suave.

### Efeito Magnético
Botões de redes sociais se movem levemente quando o mouse se aproxima.

### Efeito Ripple
Cards produzem um efeito de onda ao serem clicados.

## 📱 Responsividade

O projeto se adapta perfeitamente em:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (até 480px)

## 🎯 Performance

- Animações otimizadas com `requestAnimationFrame`
- CSS animations para máxima eficiência
- Sem dependências externas
- Arquivo CSS único para carregamento rápido

## 📄 Licença

Projeto autoral - Felipe Prado

---

**Desenvolvido por:** Felipe Prado (@fe_kl9)  
**Data:** Abril de 2026  
**Versão:** 1.0.0
