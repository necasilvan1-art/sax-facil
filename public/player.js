import { parseNoteName, noteDisplayName, concertName, noteToFrequency, renderFingering, ensureSvgDefs } from './fingering.js';

// ---------- Parser ----------

// Aceita texto livre: "Dó4 Ré4 Mi4" ou "C4 D4 E4 F4:2 G4" ou "C4, E4 | G4:2 Pausa:1".
export function parseSong(text) {
  const tokens = text
    .replace(/\|/g, ' ')
    .split(/[\s,;]+/)
    .filter(Boolean);

  const notes = [];
  for (const token of tokens) {
    const [rawName, rawBeats] = token.split(':');
    const beats = Math.max(0.25, Math.min(8, Number(rawBeats) || 1));
    if (/^(p|r|pausa)$/i.test(rawName)) {
      notes.push({ rest: true, beats, label: 'Pausa' });
      continue;
    }
    const note = parseNoteName(rawName);
    if (!note) {
      if (notes.length === 0) continue; // ignora título/lixo no começo
      throw new Error(`Não entendi a nota "${rawName}". Use por exemplo: Dó4, Ré#4, C4, F#4.`);
    }
    if (!isPlayable(note.canon)) {
      throw new Error(`A nota "${rawName}" (${noteDisplayName(note.canon)}) está fora da faixa para iniciantes (Sib3 a Dó#6).`);
    }
    notes.push({
      rest: false,
      beats,
      canon: note.canon,
      label: noteDisplayName(note.canon),
      concert: concertName(note.canon),
      freq: noteToFrequency(note.canon),
    });
  }
  return notes;
}

const PLAYABLE = /^(A#3|B3|C4|C#4|D4|D#4|E4|F4|F#4|G4|G#4|A4|A#4|B4|C5|C#5|D5|D#5|E5|F5|F#5|G5|G#5|A5|A#5|B5|C6|C#6)$/;
function isPlayable(canon) {
  return PLAYABLE.test(canon);
}

// ---------- Áudio (tom sintetizado estilo sax) ----------

let audioCtx = null;
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

export function playTone(freq, start, beats, tempo) {
  const ctx = getCtx();
  const dur = (beats * 60) / tempo;

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = freq;

  const sub = ctx.createOscillator();
  sub.type = 'sine';
  sub.frequency.value = freq / 2;
  const subGain = ctx.createGain();
  subGain.gain.value = 0.25;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(900, start);
  filter.frequency.linearRampToValueAtTime(1600, start + 0.08);
  filter.frequency.linearRampToValueAtTime(1100, start + dur);
  filter.Q.value = 1.2;

  const vibrato = ctx.createOscillator();
  vibrato.frequency.value = 5.2;
  const vibratoGain = ctx.createGain();
  vibratoGain.gain.setValueAtTime(0, start);
  vibratoGain.gain.linearRampToValueAtTime(freq * 0.006, start + Math.min(0.4, dur / 2));
  vibrato.connect(vibratoGain).connect(osc.frequency);

  const gain = ctx.createGain();
  const peak = 0.22;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.06);
  gain.gain.setValueAtTime(peak, start + Math.max(0.06, dur - 0.08));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur + 0.05);

  osc.connect(filter);
  sub.connect(subGain).connect(filter);
  filter.connect(gain).connect(ctx.destination);

  osc.start(start);
  sub.start(start);
  vibrato.start(start);
  osc.stop(start + dur + 0.1);
  sub.stop(start + dur + 0.1);
  vibrato.stop(start + dur + 0.1);
}

export function clickTone(start) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 1800;
  gain.gain.setValueAtTime(0.08, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.03);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + 0.04);
}

// ---------- Estado do player ----------

let song = [];
let index = 0;
let tempo = 80;
let playing = false;
let schedulerTimer = null;
let activeVoices = [];

const listeners = { change: [] };
export function on(event, fn) {
  listeners[event]?.push(fn);
}
function emit() {
  for (const fn of listeners.change) fn({ song, index, playing, tempo });
}

export function setSong(notes) {
  stop();
  song = notes;
  index = 0;
  emit();
}

export function setTempo(bpm) {
  tempo = bpm;
  emit();
}

export function jumpTo(i) {
  if (playing) stop();
  index = Math.max(0, Math.min(song.length - 1, i));
  emit();
}

export function step(delta) {
  if (playing) stop();
  jumpTo(index + delta);
}

export function previewNote(canon) {
  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();
  playTone(noteToFrequency(canon), ctx.currentTime + 0.02, 0.75, 60);
}

export function isPlaying() {
  return playing;
}

export function play() {
  if (playing || song.length === 0) return;
  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();

  playing = true;
  emit();

  const beat = 60 / tempo;
  let t = ctx.currentTime + 0.15;
  const startIndex = index;

  for (let i = index; i < song.length; i++) {
    const n = song[i];
    const dur = n.beats * beat;
    if (!n.rest) {
      playTone(n.freq, t, n.beats, tempo);
      activeVoices.push({ time: t, noteIndex: i });
    }
    t += dur;
  }
  const endTime = t;

  schedulerTimer = setInterval(() => {
    const now = ctx.currentTime;
    while (activeVoices.length && activeVoices[0].time <= now + 0.03) {
      index = activeVoices.shift().noteIndex;
      emit();
    }
    if (now > endTime + 0.2) {
      stop();
      index = 0;
      emit();
    }
  }, 40);
}

export function pause() {
  if (!playing) return;
  const ctx = getCtx();
  ctx.suspend();
  playing = 'paused';
  emit();
}

export function resume() {
  if (playing !== 'paused') return;
  getCtx().resume();
  playing = true;
  emit();
}

export function stop() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
  activeVoices = [];
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  playing = false;
  emit();
}

export function getState() {
  return { song, index, playing, tempo };
}

// ---------- UI ----------

export function initPlayer() {
  ensureSvgDefs();

  const els = {
    textarea: document.getElementById('song-input'),
    file: document.getElementById('song-file'),
    load: document.getElementById('btn-load'),
    strip: document.getElementById('note-strip'),
    big: document.getElementById('big-diagram'),
    bigName: document.getElementById('big-note-name'),
    bigConcert: document.getElementById('big-note-concert'),
    play: document.getElementById('btn-play'),
    prev: document.getElementById('btn-prev'),
    next: document.getElementById('btn-next'),
    tempo: document.getElementById('tempo'),
    tempoLabel: document.getElementById('tempo-label'),
    status: document.getElementById('player-status'),
    error: document.getElementById('player-error'),
  };

  els.tempo.addEventListener('input', () => {
    els.tempoLabel.textContent = els.tempo.value + ' BPM';
    setTempo(Number(els.tempo.value));
  });

  els.load.addEventListener('click', () => {
    els.error.hidden = true;
    try {
      const notes = parseSong(els.textarea.value);
      if (notes.length === 0) throw new Error('Escreva pelo menos uma nota, por exemplo: Dó4 Ré4 Mi4');
      setSong(notes);
      els.status.textContent = `${notes.length} notas carregadas. Aperte ▶ Tocar!`;
    } catch (err) {
      els.error.textContent = err.message;
      els.error.hidden = false;
    }
  });

  els.file.addEventListener('change', async () => {
    const file = els.file.files?.[0];
    if (!file) return;
    els.textarea.value = (await file.text()).trim();
    els.load.click();
    els.file.value = '';
  });

  els.play.addEventListener('click', () => {
    if (playing === true) {
      pause();
    } else if (playing === 'paused') {
      resume();
    } else {
      play();
    }
  });

  els.prev.addEventListener('click', () => step(-1));
  els.next.addEventListener('click', () => step(1));

  on('change', ({ song: s, index: i, playing: p }) => {
    els.play.textContent = p === true ? '⏸ Pausar' : p === 'paused' ? '▶ Continuar' : '▶ Tocar';
    renderStrip(els, s, i);
    renderBig(els, s, i);
  });

  setSong(parseSong('C4 C4 D4 C4 F4 E4:2'));
}

function renderStrip(els, s, current) {
  els.strip.innerHTML = '';
  if (!s.length) return;
  const windowStart = Math.max(0, Math.min(current - 2, s.length - 8));
  const windowEnd = Math.min(s.length, windowStart + 8);

  for (let i = windowStart; i < windowEnd; i++) {
    const n = s[i];
    const card = document.createElement('div');
    card.className = 'note-card' + (i === current ? ' current' : '') + (i < current ? ' done' : '');
    card.innerHTML = `<span class="note-name">${n.label}</span>`;
    if (!n.rest) {
      card.appendChild(renderFingering(n.canon, { width: 46 }));
      card.addEventListener('click', () => {
        jumpTo(i);
        previewNote(n.canon);
      });
    } else {
      card.classList.add('rest');
      card.innerHTML += '<span class="note-rest-icon">💤</span>';
    }
    els.strip.appendChild(card);
  }
}

function renderBig(els, s, current) {
  const n = s[current];
  els.big.innerHTML = '';
  if (!n || n.rest) {
    els.bigName.textContent = n ? 'Pausa' : '—';
    els.bigConcert.textContent = n ? 'descanse por ' + n.beats + ' batida(s)' : '';
    return;
  }
  els.bigName.textContent = n.label;
  els.bigConcert.textContent = 'soa ' + n.concert + ' no sax alto';
  els.big.appendChild(renderFingering(n.canon, { width: 210 }));
}
