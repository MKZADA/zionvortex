# Zion Signal — Portal de Membros

Site estático (HTML/CSS/JS puro, sem build, sem dependências) do portal de membros do Zion Signal: conteúdo educacional sobre Bitcoin/cripto organizado em 3 frequências de acesso, com gamificação e uma calculadora de DCA.

## Estrutura

```
.
├── index.html
├── css/
│   └── style.css
└── js/
    └── app.js
```

## Rodando localmente

Não precisa de build nem servidor. Basta abrir `index.html` no navegador, ou, pra evitar bloqueios de alguns navegadores com `file://`, rodar um servidor simples:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Publicando

### GitHub Pages (mais simples, grátis)
1. Suba este repositório no GitHub.
2. Em **Settings → Pages**, escolha a branch `main` e a pasta raiz (`/`).
3. O site fica no ar em `https://seu-usuario.github.io/nome-do-repo/`.

### Vercel / Netlify
Importe o repositório direto — nenhuma configuração de build é necessária (é site estático).

## Códigos de acesso (demonstração)

| Código | Libera |
|---|---|
| `ZION-F1-DEMO` | Frequência 01 — Iniciante |
| `ZION-F2-DEMO` | Frequência 01 + 02 — Intermediário |
| `ZION-F3-DEMO` | Frequência 01 + 02 + 03 — Avançado |
| `ZION-ADMIN-DEMO` | Acesso total + painel |

Estão hardcoded em `js/app.js`, na constante `ACCESS_CODES`.

## ⚠️ Limitações importantes (leia antes de divulgar isso pra clientes pagantes)

Este site funciona, mas **não é uma infraestrutura de produção pronta pra cobrar de estranhos**. Três pontos específicos:

1. **Persistência é por navegador.** Os dados (progresso, cadastro, badges) ficam em `localStorage` do navegador da pessoa. Isso significa: não sincroniza entre o celular e o computador do mesmo cliente, e some se a pessoa limpar os dados do navegador. O painel "Admin" só lista quem se cadastrou *naquele mesmo navegador* — não é uma lista real de assinantes.

2. **Códigos de acesso são estáticos e compartilhados.** Qualquer pessoa que descobrir `ZION-F3-DEMO` tem acesso ao tier avançado de graça. Não há verificação de pagamento nenhuma.

3. **Nenhuma conexão com a Cakto.** Não existe verificação automática de que a pessoa realmente comprou algo.

### Caminho recomendado pra produção real

1. Configurar um webhook da Cakto disparando para um workflow n8n na confirmação de pagamento.
2. O n8n gera um código único por venda (vinculado ao tier comprado) e grava num Baserow (ou outro banco), e envia por e-mail pro comprador.
3. Trocar a validação de código em `js/app.js` (hoje hardcoded em `ACCESS_CODES`) por uma chamada a um endpoint de backend (ex: função serverless na Vercel) que consulta esse banco e marca o código como usado.
4. Aí sim o painel admin pode consultar a mesma fonte de dados e mostrar assinantes reais, de qualquer dispositivo.

Sem o passo 3, este site é uma demonstração de UX/conteúdo — não um SaaS de recorrência funcional.

## Stack

HTML5, CSS3 (variáveis CSS, sem framework), JavaScript vanilla (sem dependências, sem build step). Fontes via Google Fonts (`Space Grotesk`, `Inter`, `IBM Plex Mono`).
