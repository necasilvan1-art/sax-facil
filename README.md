# 🎷 Sax Fácil

App web para **iniciantes no saxofone alto** que não sabem ler partitura: você importa a música
(escrevendo as notas), o app mostra **o diagrama das teclas do sax** para cada nota — no estilo
Tomplay — e toca o som para você acompanhar. Inclui um **Professor de chat** com a API da Mistral
(modelo `mistral-small-latest`, via SDK oficial em TypeScript).

## O que tem

- **🎵 Tocar**: importe a música (colando as notas ou subindo um `.txt`) e veja, para cada nota,
  o diagrama das teclas do sax alto (teclas rosa = pressionadas), com som sintetizado,
  controle de velocidade (40–160 BPM), nota anterior/próxima e pausa.
- **📖 Todas as digitações**: tabela interativa de Sib3 a Dó#6 (clique para ouvir e ver a explicação dos dedos).
- **💬 Professor**: chat em português com `mistral-small-latest` — a chave da API fica **somente no servidor**.

## Requisitos

- Node.js 18 ou superior
- Uma chave de API da Mistral (crie em [console.mistral.ai](https://console.mistral.ai))

## Como instalar e rodar

```bash
# 1. Instalar as dependências
npm install

# 2. Configurar a chave da API (fica apenas no servidor)
cp .env.example .env
#    edite o .env e coloque sua chave:
#    MISTRAL_API_KEY=...

# 3. Rodar localmente
npm start          # ou: npm run dev (reinicia sozinho ao salvar o código)

# 4. Abrir no navegador
#    http://localhost:3000
```

> Sem a chave no `.env`, o player e a tabela de digitações funcionam normalmente;
> só o chat do Professor responde com um aviso para configurar a chave.

## Como escrever as notas

Use nomes em português ou letras internacionais, com a oitava (Dó central = `Dó4` / `C4`):

| Exemplo | Significado |
| --- | --- |
| `Dó4 Ré4 Mi4` | notas seguidas, 1 batida cada |
| `Sol4:2` | nota com 2 batidas |
| `Pausa:1` | pausa de 1 batida |
| `Sib4`, `Fá#4`, `Bb4`, `F#4` | bemóis e sustenidos (aceitos nos dois formatos) |

Faixa suportada (iniciante): **Sib3 a Dó#6**. O app mostra o som real (concerto) de cada nota,
pois o sax alto é transpositor em Mi bemol.

## Estrutura

```
server.ts            # Express + SDK oficial @mistralai/mistralai (rota /api/chat)
public/
  index.html         # interface (abas: Tocar, Digitações, Professor)
  fingering.js       # digitações do sax alto + renderizador SVG do diagrama
  player.js          # parser das notas, síntese de áudio e transporte
  app.js             # chat, abas, tabela e músicas de demonstração
```
