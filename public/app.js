import { FINGERINGS, noteDisplayName, concertName, renderFingering, ensureSvgDefs } from './fingering.js';
import { initPlayer, previewNote } from './player.js';

// ---------- Abas ----------
const tabs = document.querySelectorAll('.tab');
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});

// ---------- Player ----------
initPlayer();

// ---------- Tabela de digitações ----------
ensureSvgDefs();
const chartGrid = document.getElementById('chart-grid');
const chartBig = document.getElementById('chart-big');
const chartName = document.getElementById('chart-name');
const chartConcert = document.getElementById('chart-concert');
const chartHelp = document.getElementById('chart-help');

for (const note of Object.keys(FINGERINGS)) {
  const cell = document.createElement('div');
  cell.className = 'chart-cell';
  cell.innerHTML = `<span class="note-name">${noteDisplayName(note)}</span>`;
  cell.appendChild(renderFingering(note, { width: 64 }));
  cell.addEventListener('click', () => {
    previewNote(note);
    chartBig.innerHTML = '';
    chartBig.appendChild(renderFingering(note, { width: 190 }));
    chartName.textContent = noteDisplayName(note);
    chartConcert.textContent = 'soa ' + concertName(note) + ' no sax alto';
    chartHelp.textContent = helpText(note);
  });
  chartGrid.appendChild(cell);
}

function helpText(note) {
  const keys = FINGERINGS[note];
  if (keys.length === 0) return 'Todas as chaves abertas: nenhum dedo pressionado.';
  const parts = [];
  const oct = keys.includes('oct');
  if (oct) parts.push('chave de oitava (polegar esquerdo)');
  const lh = keys.filter((k) => ['L1', 'L2', 'L3', 'bis', 'G#', 'C#l', 'Bl', 'Bbl'].includes(k));
  const rh = keys.filter((k) => ['R1', 'R2', 'R3', 'Cr', 'Ebr', 'sideBb', 'sideC', 'sideE', 'F#s'].includes(k));
  if (lh.length) parts.push('mão esquerda: ' + lh.join(', '));
  if (rh.length) parts.push('mão direita: ' + rh.join(', '));
  return parts.join(' · ');
}

// ---------- Músicas de demonstração ----------
const DEMOS = {
  parabens:
    'Dó4 Dó4 Ré4 Dó4 Fá4 Mi4:2 Dó4 Dó4 Ré4 Dó4 Sol4 Fá4:2 Dó4 Dó4 Dó5 Lá4 Fá4 Mi4 Ré4 Sib4 Sib4 Lá4 Fá4 Sol4 Fá4:2',
  estrela:
    'Dó4 Dó4 Sol4 Sol4 Lá4 Lá4 Sol4:2 Fá4 Fá4 Mi4 Mi4 Ré4 Ré4 Dó4:2 Sol4 Sol4 Fá4 Fá4 Mi4 Mi4 Ré4:2 Sol4 Sol4 Fá4 Fá4 Mi4 Mi4 Ré4:2 Dó4 Dó4 Sol4 Sol4 Lá4 Lá4 Sol4:2 Fá4 Fá4 Mi4 Mi4 Ré4 Ré4 Dó4:2',
  escala: 'Dó4 Ré4 Mi4 Fá4 Sol4 Lá4 Si4 Dó5 Si4 Lá4 Sol4 Fá4 Mi4 Ré4 Dó4:2',
};

document.querySelectorAll('.demo').forEach((btn) => {
  btn.addEventListener('click', () => {
    const input = document.getElementById('song-input');
    input.value = DEMOS[btn.dataset.demo] ?? '';
    document.getElementById('btn-load').click();
  });
});

// ---------- Chat ----------
const chatLog = document.getElementById('chat-log');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const history = [];

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  chatInput.value = '';
  addMsg('user', text);
  history.push({ role: 'user', content: text });

  const typing = addMsg('bot', 'Pensando... 🎷');
  typing.classList.add('typing');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history.slice(-12) }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao falar com o professor.');
    typing.remove();
    addMsg('bot', data.reply);
    history.push({ role: 'assistant', content: data.reply });
  } catch (err) {
    typing.remove();
    addMsg('bot', '⚠️ ' + err.message);
  }
});

function addMsg(role, text) {
  const div = document.createElement('div');
  div.className = 'msg ' + (role === 'user' ? 'user' : 'bot');
  div.textContent = text;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
  return div;
}
