import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { Mistral } from '@mistralai/mistralai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT ?? 3000);
const MODEL = 'mistral-small-latest';

const SYSTEM_PROMPT = [
  'Você é o "Professor Sax", um professor de saxofone alto para iniciantes absolutos no Brasil.',
  'O aluno NÃO sabe ler partitura: ele aprende vendo diagramas com as teclas do sax.',
  'Regras:',
  '- Responda sempre em português do Brasil, com frases curtas e simples.',
  '- Ao citar uma nota, escreva o nome dela (Dó, Ré, Mi, Fá, Sol, Lá, Si) e, quando útil, a digitação, por exemplo: "Sol = dedos 1, 2 e 3 da mão esquerda".',
  '- Explique embocadura, respiração, ritmo e postura com paciência e incentivo.',
  '- Se pedirem uma música, escreva a melodia como uma lista de notas no formato "Nota:batidas",',
  '  usando nomes como Dó4, Ré4, Mi4... (Dó central = Dó4), pausa = Pausa. Exemplo: "Dó4:1 Ré4:1 Mi4:1 Fá4:1".',
  '- Lembre que o sax alto é transpositor em Mi bemol: o Dó escrito soa Mi bemol.',
  '- Nunca invente digitações: o app mostra os diagramas corretos.',
].join('\n');

type ChatMessage = { role: 'user' | 'assistant'; content: string };

function sanitizeMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];
  const out: ChatMessage[] = [];
  for (const m of input) {
    const role = (m as any)?.role;
    const content = (m as any)?.content;
    if ((role === 'user' || role === 'assistant') && typeof content === 'string') {
      out.push({ role, content: content.slice(0, 4000) });
    }
  }
  return out.slice(-12);
}

const app = express();
app.use(express.json({ limit: '256kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, model: MODEL, apiKey: Boolean(process.env.MISTRAL_API_KEY) });
});

app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error:
        'Chave da API não configurada. Copie .env.example para .env e coloque sua MISTRAL_API_KEY (console.mistral.ai).',
    });
    return;
  }

  const history = sanitizeMessages(req.body?.messages);
  if (history.length === 0) {
    res.status(400).json({ error: 'Envie "messages" com pelo menos uma mensagem do usuário.' });
    return;
  }

  try {
    const client = new Mistral({ apiKey });
    const result = await client.chat.complete({
      model: MODEL,
      messages: [{ role: 'system' as const, content: SYSTEM_PROMPT }, ...history],
    });

    const raw = result.choices?.[0]?.message?.content ?? '';
    const reply =
      typeof raw === 'string'
        ? raw
        : raw.map((chunk) => ('text' in chunk ? chunk.text : '')).join('');

    res.json({ reply });
  } catch (err: any) {
    const status = err?.statusCode ?? 502;
    const detail =
      status === 401
        ? 'Chave da API inválida (verifique o .env).'
        : 'Falha ao falar com a API da Mistral. Tente novamente.';
    console.error('[chat] erro:', status, err?.message ?? err);
    res.status(status >= 400 && status < 600 ? status : 502).json({ error: detail });
  }
});

app.listen(PORT, () => {
  console.log(`Sax Fácil rodando em http://localhost:${PORT}`);
});
