// Digitações do saxofone alto (nomenclatura escrita, Dó central = C4 / Dó4).
// Fontes: fingerchart.com e tunableapp.com (sistema Boehm padrão, igual para toda a família do sax).

// Chaves desenhadas no diagrama (coordenadas em um viewBox de 230 x 520).
export const KEYS = [
  { id: 'oct', label: '8', x: 62, y: 86, r: 11, hand: 'E' },
  { id: 'L1', label: '1', x: 112, y: 122, r: 16, hand: 'E' },
  { id: 'bis', label: '', x: 88, y: 146, r: 8, hand: 'E' },
  { id: 'L2', label: '2', x: 112, y: 166, r: 16, hand: 'E' },
  { id: 'L3', label: '3', x: 112, y: 210, r: 16, hand: 'E' },
  { id: 'F#s', label: 'F#', x: 172, y: 214, r: 9, hand: 'D' },
  { id: 'sideE', label: 'Mi', x: 172, y: 244, r: 9, hand: 'D' },
  { id: 'sideC', label: 'Dó', x: 172, y: 272, r: 9, hand: 'D' },
  { id: 'sideBb', label: 'Sib', x: 172, y: 300, r: 9, hand: 'D' },
  { id: 'R1', label: '4', x: 112, y: 258, r: 16, hand: 'D' },
  { id: 'R2', label: '5', x: 112, y: 300, r: 16, hand: 'D' },
  { id: 'R3', label: '6', x: 112, y: 342, r: 16, hand: 'D' },
  { id: 'G#', label: 'G#', x: 64, y: 268, r: 11, hand: 'E' },
  { id: 'C#l', label: 'Dó#', x: 64, y: 314, r: 11, hand: 'E' },
  { id: 'Bl', label: 'Si', x: 64, y: 358, r: 11, hand: 'E' },
  { id: 'Bbl', label: 'Sib', x: 64, y: 402, r: 11, hand: 'E' },
  { id: 'Cr', label: 'Dó', x: 160, y: 392, r: 11, hand: 'D' },
  { id: 'Ebr', label: 'Mib', x: 160, y: 430, r: 11, hand: 'D' },
];

const MAIN6 = ['L1', 'L2', 'L3', 'R1', 'R2', 'R3'];

// Nota (escrita) -> chaves pressionadas. Sustenidos como grafia canônica.
export const FINGERINGS = {
  'A#3': [...MAIN6, 'Bbl'],
  B3: [...MAIN6, 'Bl'],
  C4: [...MAIN6, 'Cr'],
  'C#4': [...MAIN6, 'C#l'],
  D4: [...MAIN6],
  'D#4': [...MAIN6, 'Ebr'],
  E4: ['L1', 'L2', 'L3', 'R1', 'R2'],
  F4: ['L1', 'L2', 'L3', 'R1'],
  'F#4': ['L1', 'L2', 'L3', 'R2'],
  G4: ['L1', 'L2', 'L3'],
  'G#4': ['L1', 'L2', 'L3', 'G#'],
  A4: ['L1', 'L2'],
  'A#4': ['L1', 'bis'],
  B4: ['L1'],
  C5: ['L2'],
  'C#5': [],
  D5: ['oct', ...MAIN6],
  'D#5': ['oct', ...MAIN6, 'Ebr'],
  E5: ['oct', 'L1', 'L2', 'L3', 'R1', 'R2'],
  F5: ['oct', 'L1', 'L2', 'L3', 'R1'],
  'F#5': ['oct', 'L1', 'L2', 'L3', 'R2'],
  G5: ['oct', 'L1', 'L2', 'L3'],
  'G#5': ['oct', 'L1', 'L2', 'L3', 'G#'],
  A5: ['oct', 'L1', 'L2'],
  'A#5': ['oct', 'L1', 'bis'],
  B5: ['oct', 'L1'],
  C6: ['oct', 'L2'],
  'C#6': ['oct'],
};

const ENHARMONIC = {
  Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#',
};

const NOTE_PT = { C: 'Dó', D: 'Ré', E: 'Mi', F: 'Fá', G: 'Sol', A: 'Lá', B: 'Si' };

// "Bb4", "D#4", "Fá#4", "dó4" -> { step: 'A'|'B'|..., accidental: -1|0|1, octave: 4, canon: 'A#4' }
export function parseNoteName(name) {
  const s = String(name).trim();
  // Aceita nomes em português: "Dó4", "Fá#4", "Sib4", "Si4"...
  const pt = s.match(/^(d[oó]#?|d[oó]b|r[eé]|mi|f[aá]#?|f[aá]b|sol#?|l[aá]#?|l[aá]b|si#?|sib)(-?\d)$/i);
  if (pt) {
    const base = pt[1].toLowerCase();
    const oct = Number(pt[2]);
    const table = {
      'dó': ['C', 0], 'do': ['C', 0], 'dó#': ['C', 1], 'do#': ['C', 1], 'dób': ['C', -1],
      'ré': ['D', 0], 're': ['D', 0], 'ré#': ['D', 1], 'réb': ['D', -1],
      'mi': ['E', 0], 'mi#': ['E', 1], 'mib': ['E', -1],
      'fá': ['F', 0], 'fa': ['F', 0], 'fá#': ['F', 1], 'fa#': ['F', 1], 'fáb': ['F', -1],
      'sol': ['G', 0], 'sol#': ['G', 1], 'solb': ['G', -1],
      'lá': ['A', 0], 'la': ['A', 0], 'lá#': ['A', 1], 'la#': ['A', 1], 'láb': ['A', -1],
      'si': ['B', 0], 'si#': ['B', 1], 'sib': ['B', -1],
    };
    const hit = table[base];
    if (!hit) return null;
    return canon(hit[0], hit[1], oct);
  }
  const m = s.match(/^([A-Ga-g])([#b♯♭]?)(-?\d)$/);
  if (!m) return null;
  const step = m[1].toUpperCase();
  const acc = m[2].replace('♯', '#').replace('♭', 'b');
  if (acc === 'b') {
    const flat = ENHARMONIC[step + 'b'];
    if (!flat) return null;
    return canon(flat[0], 1, Number(m[3]));
  }
  return canon(step, acc === '#' ? 1 : 0, Number(m[3]));
}

function canon(step, accidental, octave) {
  return {
    step,
    accidental,
    octave,
    canon: step + (accidental === 1 ? '#' : '') + octave,
  };
}

export function noteDisplayName(canonName) {
  const m = canonName.match(/^([A-G])(#?)(-?\d)$/);
  if (!m) return canonName;
  const base = NOTE_PT[m[1]] + (m[2] ? '♯' : '');
  const oct = Number(m[3]);
  const suffix = oct >= 5 ? ' (agudo)' : oct <= 3 ? ' (grave)' : '';
  return base + suffix;
}

export function concertName(canonName) {
  const m = canonName.match(/^([A-G])(#?)(-?\d)$/);
  if (!m) return '';
  const idx = ['C', 'D', 'E', 'F', 'G', 'A', 'B'].indexOf(m[1]);
  let midi = (Number(m[3]) + 1) * 12 + idx + (m[2] ? 1 : 0) - 9; // 6ª maior abaixo (9 semitons)
  const names = ['Dó', 'Dó♯', 'Ré', 'Mi♭', 'Mi', 'Fá', 'Fá♯', 'Sol', 'Sol♯', 'Lá', 'Si♭', 'Si'];
  const oct = Math.floor(midi / 12) - 1;
  return names[((midi % 12) + 12) % 12] + oct;
}

export function noteToFrequency(canonName) {
  const m = canonName.match(/^([A-G])(#?)(-?\d)$/);
  if (!m) return 0;
  const idx = ['C', 'D', 'E', 'F', 'G', 'A', 'B'].indexOf(m[1]);
  const midi = (Number(m[3]) + 1) * 12 + idx + (m[2] ? 1 : 0);
  return 440 * Math.pow(2, (midi - 69) / 12);
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const SILHOUETTE = {
  neck: 'M 118 44 C 92 48 70 62 62 84',
  body: 'M 90 52 h 44 v 340 h -44 z',
  bell: 'M 90 386 C 90 462 130 486 168 492 L 168 492 C 128 478 134 430 134 386 Z',
  bellRim: 'M 152 496 a 22 9 0 1 0 44 0 a 22 9 0 1 0 -44 0',
};

// Retorna um elemento SVG do instrumento com as teclas da nota destacadas.
export function renderFingering(canonName, { width = 150 } = {}) {
  const pressed = new Set(FINGERINGS[canonName] ?? []);
  const height = Math.round((width / 230) * 520);

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 230 520');
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  svg.classList.add('fingering-svg');

  const mk = (tag, attrs) => {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
  };

  svg.appendChild(
    mk('path', {
      d: SILHOUETTE.neck,
      fill: 'none',
      stroke: '#8a6d1d',
      'stroke-width': 14,
      'stroke-linecap': 'round',
    })
  );
  svg.appendChild(mk('rect', { x: 90, y: 40, width: 44, height: 352, rx: 21, fill: 'url(#saxBody)' }));
  svg.appendChild(mk('path', { d: SILHOUETTE.bell, fill: 'url(#saxBody)', stroke: '#8a6d1d', 'stroke-width': 2 }));
  svg.appendChild(mk('ellipse', { cx: 174, cy: 496, rx: 22, ry: 9, fill: '#b98f14' }));

  for (const key of KEYS) {
    const on = pressed.has(key.id);
    const g = mk('g', { class: 'key' + (on ? ' pressed' : ''), 'data-key': key.id });
    g.appendChild(mk('circle', { cx: key.x, cy: key.y, r: key.r, class: 'key-circle' }));
    if (key.label) {
      const t = mk('text', {
        x: key.x,
        y: key.y,
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        class: 'key-label',
      });
      t.textContent = key.label;
      g.appendChild(t);
    }
    svg.appendChild(g);
  }

  return svg;
}

// Definição de gradiente compartilhada (injetada uma vez por página).
export function ensureSvgDefs() {
  if (document.getElementById('saxBody-defs')) return;
  const wrap = document.createElement('div');
  wrap.style.display = 'none';
  wrap.innerHTML = `
    <svg id="saxBody-defs" width="0" height="0">
      <defs>
        <linearGradient id="saxBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#6b5310"/>
          <stop offset="0.5" stop-color="#d9ac2b"/>
          <stop offset="1" stop-color="#7a5e12"/>
        </linearGradient>
      </defs>
    </svg>`;
  document.body.appendChild(wrap);
}
