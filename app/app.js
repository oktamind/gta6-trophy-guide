// Leonida Legend — offline GTA VI trophy guide and tracker.
// Plain static app: it fetches only its own data/trophies.json, saves ticks to
// localStorage, and makes no network request at run time.
const KEY = 'leonida-legend-v1';
const KINDS = ['all', 'story', 'missable', 'collectibles', 'activities', 'robbery', 'exploration', 'money', 'combat', 'oddity', 'online'];
const KIND_LABELS = { all: 'All kinds', story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', robbery: 'Robbery', exploration: 'Exploration', money: 'Money', combat: 'Combat', oddity: 'Oddities', online: 'Online' };
const GRADE_RANK = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
const STAGE_NAMES = { 1: 'Stage 1', 2: 'Stage 2', 3: 'Stage 3', 4: 'Stage 4', 5: 'Stage 5' };

const params = new URLSearchParams(location.search);
const cardsEl = document.getElementById('cards');
const emptyEl = document.getElementById('empty');
const resultCountEl = document.getElementById('result-count');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const sortEl = document.getElementById('sort');
const spoilerEl = document.getElementById('spoiler');
const earnedOnlyEl = document.getElementById('earned-only');
const kindsEl = document.getElementById('kinds');
const statusEl = document.getElementById('tool-status');

let trophies = [];
let earned = new Set();
let kind = 'all';
let openGuides = new Set();

try {
  const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}');
  if (Array.isArray(saved.earned)) earned = new Set(saved.earned);
  if (typeof saved.spoiler === 'boolean') spoilerEl.checked = saved.spoiler;
} catch { /* a corrupt save starts fresh */ }

if (params.get('spoiler') === 'off') spoilerEl.checked = false;

function save() {
  localStorage.setItem(KEY, JSON.stringify({ earned: [...earned], spoiler: spoilerEl.checked }));
}

function isHidden(t) {
  return spoilerEl.checked && t.kind === 'story' && !earned.has(t.name);
}

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

function badge(text, cls) { return el('span', 'badge ' + cls, text); }

function renderKinds() {
  kindsEl.replaceChildren();
  for (const k of KINDS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'kind-btn';
    b.textContent = k === 'online' ? 'Online (0)' : KIND_LABELS[k];
    b.setAttribute('aria-pressed', String(k === kind));
    b.addEventListener('click', () => { kind = k; renderKinds(); render(); });
    kindsEl.append(b);
  }
}

function filtered() {
  const q = searchEl.value.trim().toLowerCase();
  let list = trophies.filter((t) => {
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (earnedOnlyEl.checked && !earned.has(t.name)) return false;
    if (kind === 'missable' && !t.missable) return false;
    if (kind === 'online') return false;
    if (kind !== 'all' && kind !== 'missable' && t.kind !== kind) return false;
    if (q) {
      const hay = [t.name, t.description, t.guide, t.kind, ...(t.tags || [])].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  if (sortEl.value === 'grade') list.sort((a, b) => GRADE_RANK[a.grade] - GRADE_RANK[b.grade] || a.id - b.id);
  else if (sortEl.value === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  else list.sort((a, b) => a.stage - b.stage || a.id - b.id);
  return list;
}

function renderCard(t) {
  const card = el('article', 'card' + (earned.has(t.name) ? ' earned' : ''));
  card.dataset.trophyId = String(t.id);
  const head = el('div', 'card-head');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.name);
  box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.name); else earned.delete(t.name);
    save();
    renderProgress();
    render();
  });
  head.append(box);
  const title = el('div', 'card-title');
  const h3 = el('h3');
  if (isHidden(t)) {
    h3.append(el('span', 'hidden-name', 'Hidden story trophy — earn it to reveal it'));
  } else {
    h3.textContent = t.name;
  }
  title.append(h3);
  const badges = el('div', 'badges');
  badges.append(badge(t.grade, t.grade));
  badges.append(badge(KIND_LABELS[t.kind] || t.kind, 'kind'));
  badges.append(badge(STAGE_NAMES[t.stage], 'stage'));
  if (t.missable) badges.append(badge('Missable', 'missable'));
  if (t.note) badges.append(badge('Unconfirmed at launch', 'unconfirmed'));
  if (earned.has(t.name)) badges.append(el('span', 'earned-tag', '✓ Earned'));
  title.append(badges);
  head.append(title);
  card.append(head);

  if (isHidden(t)) {
    const p = el('p', 'official', 'Hidden until earned. Switch spoiler-safe off above to see its name, description and guide.');
    card.append(p);
    return card;
  }
  card.append(el('p', 'official', t.description));

  const btn = el('button', 'guide-toggle', openGuides.has(t.id) ? 'Hide the guide' : 'Read the guide');
  btn.type = 'button';
  btn.setAttribute('aria-expanded', String(openGuides.has(t.id)));
  const body = el('div', 'guide-body');
  if (!openGuides.has(t.id)) body.hidden = true;
  body.append(el('p', null, t.guide));
  if (t.note) body.append(el('p', 'note-box', t.note));
  const steps = el('ol');
  for (const s of t.steps || []) steps.append(el('li', null, s));
  body.append(steps);
  const src = el('p', 'sources');
  src.append(el('strong', null, 'Sources: '));
  (t.sources || []).forEach((s, i) => {
    if (i > 0) src.append(document.createTextNode(' · '));
    if (s.url) {
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = s.name;
      src.append(a);
    } else {
      src.append(document.createTextNode(s.name));
    }
  });
  body.append(src);
  btn.addEventListener('click', () => {
    if (openGuides.has(t.id)) openGuides.delete(t.id); else openGuides.add(t.id);
    render();
  });
  card.append(btn, body);
  return card;
}

function renderProgress() {
  const n = earned.size;
  const pct = Math.round((n / trophies.length) * 100);
  document.getElementById('stat-earned').textContent = String(n);
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-text').textContent = `${n} of ${trophies.length} · ${pct}% to the platinum`;
  for (const stage of [1, 2, 3, 4, 5]) {
    const inStage = trophies.filter((t) => t.stage === stage);
    const done = inStage.filter((t) => earned.has(t.name)).length;
    const node = document.querySelector(`[data-stage-count="${stage}"]`);
    if (node) node.textContent = `${done} of ${inStage.length} earned in this stage`;
  }
}

function render() {
  const list = filtered();
  cardsEl.replaceChildren(...list.map(renderCard));
  emptyEl.hidden = list.length > 0;
  if (kind === 'online') {
    emptyEl.hidden = false;
    emptyEl.textContent = 'There are no online trophies: all 55 are single-player and offline, as every launch-week guide confirms.';
  } else {
    emptyEl.textContent = 'No trophies match these filters. Clear the search or pick another kind.';
  }
  const shown = list.length;
  resultCountEl.textContent = `Showing ${shown} of ${trophies.length} trophies · ${earned.size} earned`;
  renderProgress();
}

async function init() {
  const doc = await (await fetch('data/trophies.json')).json();
  trophies = doc.trophies;
  renderKinds();
  if (params.get('shot') === 'progress') {
    for (const id of [2, 3, 4, 8, 15, 16, 21, 22, 25, 35, 42, 46]) {
      const t = trophies.find((x) => x.id === id);
      if (t) earned.add(t.name);
    }
    spoilerEl.checked = false;
    save();
  }
  if (params.get('shot') === 'detail') openGuides.add(28);
  render();
  if (params.get('shot') === 'roadmap') document.body.classList.add('shot-roadmap');
  if (params.get('shot') === 'detail') document.body.classList.add('shot-detail');
  requestAnimationFrame(() => { window.__shotReady = true; });
}

for (const node of [searchEl, gradeEl, sortEl, spoilerEl, earnedOnlyEl]) {
  node.addEventListener('input', () => { save(); render(); });
  node.addEventListener('change', () => { save(); render(); });
}

document.getElementById('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', guide: 'Leonida Legend', exportedAt: new Date().toISOString(), earned: [...earned] }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-legend-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
  statusEl.textContent = `Exported ${earned.size} earned trophies.`;
});

document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = new Set(trophies.map((t) => t.name));
    const imported = (data.earned || []).filter((n) => names.has(n));
    earned = new Set(imported);
    save();
    render();
    statusEl.textContent = `Imported ${imported.length} earned trophies from ${file.name}.`;
  } catch {
    statusEl.textContent = 'That file could not be read as a progress export. Nothing changed.';
  }
  e.target.value = '';
});

document.getElementById('reset').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies in this browser?')) return;
  earned = new Set();
  save();
  render();
  statusEl.textContent = 'Progress reset.';
});

init();
