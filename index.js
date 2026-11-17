index.js
const STORE_KEY = 'hsbc-tavern.preferences.v2';
const BASE = { defaultPage: 0, orders: { options: [], extensions: [], custom: [] }, custom: [], cards: {}, carousel: true, cardIndex: 0 };
let state;
try { state = { ...BASE, ...JSON.parse(localStorage.getItem(STORE_KEY) || '{}') }; } catch { state = structuredClone(BASE); }
state.orders = { ...BASE.orders, ...(state.orders || {}) };
state.cards ||= {}; state.custom ||= [];
const persist = () => localStorage.setItem(STORE_KEY, JSON.stringify(state));
const svg = (content, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${content}</svg>`;
const I = {
  home: svg('<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>'),
  menu: svg('<path d="M3 6h18M3 12h18M3 18h18"/>'), close: svg('<path d="m6 6 12 12M18 6 6 18"/>'),
  person: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'), bell: svg('<path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>'),
  chat: svg('<path d="M4 4h16v13H9l-5 4zM8 8h8M8 12h6"/>'), left: svg('<path d="m15 18-6-6 6-6"/>'), right: svg('<path d="m9 18 6-6-6-6"/>'),
  arrow: svg('<path d="M4 12h15m-6-6 6 6-6 6"/>'), wallet: svg('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 8h15m-4 6h5"/><circle cx="16" cy="14" r=".6"/>'),
  chart: svg('<path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M14 3v7h7"/><circle cx="8" cy="15" r="1"/>'), umbrella: svg('<path d="M3 12a9 9 0 0 1 18 0zM12 12v7a2 2 0 0 0 4 0"/>'),
  shield: svg('<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="m9 12 2 2 4-4"/>'), card: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>'),
};
const el = (tag, cls, html = '') => { const n = document.createElement(tag); if (cls) n.className = cls; n.innerHTML = html; return n; };
const click = (...selectors) => { for (const s of selectors) { const n = document.querySelector(s); if (n) { n.click(); return true; } } return false; };
const actions = {
  home: () => click('#leftNavDrawerIcon'), pay: () => click('#API-status-top'),
  save: () => click('#extensions-settings-button .drawer-toggle, #extensions-settings-button .drawer-header'),
  cardsManage: () => click('#persona-management-button .drawer-toggle'),
  characters: () => click('#rm_button_characters', '#rightNavDrawerIcon'),
  world: () => click('#WI-SP-button .drawer-toggle', '#WIDrawerIcon'),
  backgrounds: () => click('#backgrounds-drawer-toggle'),
  advanced: () => click('#advanced-formatting-button .drawer-toggle, #advanced-formatting-button .drawer-header'),
  settings: () => click('#user-settings-button .drawer-toggle, #user-settings-button .drawer-header'),
};
function button(label, icon, fn, cls = '') { const b = el('button', cls, `${icon || ''}<span class="hsbc-label"></span>`); b.type = 'button'; b.querySelector('.hsbc-label').textContent = label; if (fn) b.addEventListener('click', fn); return b; }
function nav() {
  const n = el('nav', 'hsbc-nav'); n.setAttribute('aria-label', 'Main navigation');
  const brand = button('Home', I.home, () => { setActiveTab('home'); showChat(); actions.home(); }, 'hsbc-nav-home'); brand.setAttribute('aria-label', 'Home · Presets'); brand.classList.add('is-active'); n.append(brand);
  [['Pay', 'pay'], ['Cards', 'cards'], ['Save & Invest', 'save']].forEach(([label, key]) => { const b = button(label, '', () => { setActiveTab(key); key === 'cards' ? showCards() : (showChat(), actions[key]()); }, 'hsbc-nav-tab'); b.dataset.tab = key; n.append(b); });
  const lib = button('Library', I.menu, openLibrary, 'hsbc-nav-library'); lib.setAttribute('aria-label', 'Open Library'); n.append(lib); return n;
}
function setActiveTab(key) { document.querySelectorAll('.hsbc-nav-home,.hsbc-nav-tab').forEach(b => b.classList.toggle('is-active', (b.dataset.tab || 'home') === key)); }
function sourceItems(kind) {
  const root = document.querySelector(kind === 'options' ? '#options .options-content' : '#extensionsMenu'); if (!root) return [];
  const selectors = kind === 'options' ? 'a,button,[role="menuitem"]' : '.extension_container > *, .extension_container button, .extension_container a, .extension_container [role="button"]';
  const candidates = [...root.querySelectorAll(selectors)]; const seen = new Set();
  return candidates.filter(x => {
    if (seen.has(x) || x.closest('hr')) return false; seen.add(x);
    if (x.classList.contains('displayNone') || x.getAttribute('aria-hidden') === 'true' || x.hidden) return false;
    const label = (x.getAttribute('title') || x.getAttribute('aria-label') || x.innerText || x.textContent || '').replace(/\s+/g, ' ').trim();
    if (!label || x.querySelectorAll('a,button,[role="button"]').length && !x.matches('a,button,[role="button"]')) return false;
    return true;
  }).map((node, index) => {
    const label = (node.getAttribute('title') || node.getAttribute('aria-label') || node.innerText || node.textContent || `Tool ${index + 1}`).replace(/\s+/g, ' ').trim();
    const key = node.id || node.dataset.extensionId || node.dataset.id || `${kind}-${label.toLowerCase()}`;
    return { key, label, node, kind };
  });
}
function ordered(list, kind) { const order = state.orders[kind] || []; return [...list].sort((a, b) => { const ai = order.indexOf(a.key), bi = order.indexOf(b.key); return (ai < 0 ? 99999 : ai) - (bi < 0 ? 99999 : bi); }); }
function customResolved() {
  const all = [...sourceItems('options'), ...sourceItems('extensions')];
  return (state.custom || []).map(c => { const item = all.find(x => x.kind === c.kind && x.key === c.key); return item ? { ...item, customKey: `${item.kind}:${item.key}` } : null; }).filter(Boolean);
}
let menuPage = 0;
function renderMenu() {
  const box = document.querySelector('.hsbc-tools'); if (!box) return;
  const list = box.querySelector('.hsbc-tools-list'); list.replaceChildren();
  const items = menuPage === 0 ? ordered(sourceItems('options'), 'options') : menuPage === 1 ? ordered(sourceItems('extensions'), 'extensions') : ordered(customResolved(), 'custom');
  if (!items.length) { const empty = el('p', 'hsbc-empty', menuPage === 2 ? 'Add frequently used items with ☆ from pages 1 or 2.' : 'No available items'); list.append(empty); }
  items.forEach(item => {
    const row = el('div', 'hsbc-tool-row'); row.dataset.key = item.key; row.dataset.kind = item.kind;
    const open = button(item.label, '', () => { item.node.click(); closeTools(); }, 'hsbc-tool-open');
    const copy = button(menuPage === 2 ? 'Remove' : '☆', '', () => {
      if (menuPage === 2) state.custom = state.custom.filter(c => !(c.kind === item.kind && c.key === item.key));
      else if (!state.custom.some(c => c.kind === item.kind && c.key === item.key)) state.custom.push({ kind: item.kind, key: item.key });
      persist(); renderMenu();
    }, 'hsbc-tool-copy'); copy.setAttribute('aria-label', menuPage === 2 ? 'Remove shortcut' : 'Copy to shortcuts');
    row.append(open, copy);
    if (menuPage > 0) { const handle = el('button', 'hsbc-drag-handle', '☰'); handle.type = 'button'; handle.title = 'Hold and drag to reorder'; handle.setAttribute('aria-label', 'Drag to reorder'); row.append(handle); attachReorder(handle, row, menuPage === 1 ? 'extensions' : 'custom'); }
    list.append(row);
  });
  box.querySelectorAll('[data-page]').forEach(b => b.setAttribute('aria-current', String(Number(b.dataset.page) === menuPage)));
  box.querySelector('.hsbc-default-check').checked = state.defaultPage === menuPage;
}
function attachReorder(handle, row, orderKey) {
  row.draggable = false; handle.draggable = true;
  handle.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', row.dataset.key); row.classList.add('is-dragging'); });
  handle.addEventListener('dragend', () => row.classList.remove('is-dragging'));
  row.addEventListener('dragover', e => { e.preventDefault(); const moving = document.querySelector('.hsbc-tool-row.is-dragging'); if (moving && moving !== row) { const r = row.getBoundingClientRect(); row.parentElement.insertBefore(moving, e.clientY < r.top + r.height / 2 ? row : row.nextSibling); } });
  row.addEventListener('drop', e => { e.preventDefault(); saveOrder(row.closest('.hsbc-tools-list'), orderKey); });
  let pointer = null;
  handle.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') return; pointer = e.pointerId; handle.setPointerCapture(pointer); row.classList.add('is-dragging'); e.preventDefault(); });
  handle.addEventListener('pointermove', e => { if (pointer !== e.pointerId) return; const target = document.elementFromPoint(e.clientX, e.clientY)?.closest('.hsbc-tool-row'); if (target && target !== row && target.parentElement === row.parentElement) { const r = target.getBoundingClientRect(); row.parentElement.insertBefore(row, e.clientY < r.top + r.height / 2 ? target : target.nextSibling); } });
  const finish = e => { if (pointer !== e.pointerId) return; pointer = null; row.classList.remove('is-dragging'); saveOrder(row.closest('.hsbc-tools-list'), orderKey); };
  handle.addEventListener('pointerup', finish); handle.addEventListener('pointercancel', finish);
}
function saveOrder(list, key) { state.orders[key] = [...list.querySelectorAll('.hsbc-tool-row')].map(r => r.dataset.key); persist(); }
function makeTools() {
  const panel = el('section', 'hsbc-tools'); panel.setAttribute('aria-label', 'Chat tools');
  const head = el('header', 'hsbc-tools-head'); const prev = button('Previous', I.left, () => { menuPage = (menuPage + 2) % 3; renderMenu(); }, 'hsbc-tools-arrow'); const next = button('Next', I.right, () => { menuPage = (menuPage + 1) % 3; renderMenu(); }, 'hsbc-tools-arrow');
  const pages = el('div', 'hsbc-tools-pages', [0, 1, 2].map(i => `<button type="button" data-page="${i}" aria-label="Page ${i + 1}">${i + 1}</button>`).join(''));
  pages.querySelectorAll('[data-page]').forEach(b => b.addEventListener('click', () => { menuPage = Number(b.dataset.page); renderMenu(); }));
  const def = el('label', 'hsbc-tools-default', '<input class="hsbc-default-check" type="checkbox"><span>Set as default page</span>');
  def.querySelector('input').addEventListener('change', e => { state.defaultPage = e.target.checked ? menuPage : -1; persist(); });
  head.append(prev, pages, next, def); panel.append(head, el('div', 'hsbc-tools-list'));
  const trigger = button('Chat tools', I.chat, () => toggleTools(), 'hsbc-tools-trigger'); trigger.setAttribute('aria-label', 'Open chat tools');
  return { panel, trigger };
}
function openTools() { const p = document.querySelector('.hsbc-tools'); if (!p) return; menuPage = state.defaultPage >= 0 && state.defaultPage < 3 ? state.defaultPage : 0; renderMenu(); p.classList.add('is-open'); }
function closeTools() { document.querySelector('.hsbc-tools')?.classList.remove('is-open'); }
function toggleTools() { document.querySelector('.hsbc-tools')?.classList.contains('is-open') ? closeTools() : openTools(); }
function messageDecor() {
  const chat = document.querySelector('#chat'); if (!chat) return;
  if (!chat.querySelector('.hsbc-today')) { const today = el('div', 'hsbc-today', 'Today'); chat.prepend(today); }
  chat.querySelectorAll('.mes').forEach(message => {
    if (message.classList.contains('system') || message.querySelector('.hsbc-now')) return;
    if (!message.classList.contains('user')) { const avatar = message.querySelector('.mesAvatarWrapper, .mesAvatar'); if (avatar && !avatar.querySelector('.hsbc-hex')) avatar.insertAdjacentHTML('afterbegin', '<span class="hsbc-hex" aria-hidden="true"><svg viewBox="0 0 24 24"><path fill="#db0011" d="m12 1 10 5.7v10.6L12 23 2 17.3V6.7z"/><path fill="#fff" d="m12 5 6 3.4v7.2L12 19l-6-3.4V8.4z"/></svg></span>'); }
    const body = message.querySelector('.mes_block, .mes_text'); if (body && !body.querySelector(':scope > .hsbc-now')) body.append(el('small', 'hsbc-now', 'Now'));
  });
}
function showChat() { document.body.classList.remove('hsbc-cards-open'); document.querySelector('.hsbc-nav-tab[data-tab="cards"]')?.classList.remove('is-active'); }
function showCards() { closeTools(); closeLibrary(); document.body.classList.add('hsbc-cards-open'); document.querySelectorAll('.hsbc-nav-tab').forEach(b => b.classList.toggle('is-active', b.dataset.tab === 'cards')); paintCards(); }
function personas() { return [...document.querySelectorAll('#user_avatar_block .avatar-container[data-avatar-id]')]; }
function cardArtwork(index, name) {
  const key = /premier|prime/i.test(name) ? 'premier' : /global|money/i.test(name) ? 'global' : ['debit', 'premier', 'global'][index % 3];
  if (key === 'premier') return 'linear-gradient(135deg,#252a2e,#41464b 55%,#17191b)';
  if (key === 'global') return 'linear-gradient(135deg,#173b72,#1f67a4 58%,#bc9a48)';
  return 'linear-gradient(135deg,#d9dde1,#f6f7f8 48%,#c5cbd0)';
}
function paintCards() {
  const rail = document.querySelector('.hsbc-card-list'); if (!rail) return;
  const people = personas(); const carousel = state.carousel;
  rail.classList.toggle('is-list', !carousel); rail.replaceChildren();
  if (!people.length) { rail.append(el('p', 'hsbc-card-empty', 'No user personas found.')); return; }
  state.cardIndex = ((state.cardIndex % people.length) + people.length) % people.length;
  people.forEach((persona, index) => {
    if (carousel && index !== state.cardIndex) return;
    const id = persona.dataset.avatarId; const name = persona.querySelector('.ch_name')?.textContent?.trim() || id;
    const card = el('article', `hsbc-persona-card ${carousel ? 'is-carousel' : 'is-row'}`); card.style.setProperty('--card-art', state.cards[id] || cardArtwork(index, name));
    card.innerHTML = `<div class="hsbc-card-brand">HSBC <span>${/premier|prime/i.test(name) ? 'PREMIER' : /global|money/i.test(name) ? 'GLOBAL MONEY' : 'DEBIT'}</span></div><div class="hsbc-card-center"><span class="hsbc-card-mark">◆</span><strong></strong><small>USER PERSONA · ${safeText(id)}</small></div><div class="hsbc-card-foot"><span>•••• &nbsp; •••• &nbsp; ••••</span><span>VISA</span></div>`;
    card.querySelector('.hsbc-card-center strong').textContent = name;
    card.addEventListener('click', e => { if (e.target.closest('.hsbc-card-upload-button')) return; persona.click(); document.querySelectorAll('.hsbc-persona-card').forEach(x => x.classList.remove('is-selected')); card.classList.add('is-selected'); });
    const file = document.createElement('input'); file.type = 'file'; file.accept = 'image/*'; file.className = 'hsbc-card-file'; file.addEventListener('change', () => {
      const f = file.files?.[0]; if (!f) return; const reader = new FileReader();
      reader.onload = () => { const image = new Image(); image.onload = () => { const scale = Math.min(1, 1600 / image.width, 1000 / image.height); const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale)); canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height); state.cards[id] = `url("${canvas.toDataURL('image/jpeg', .84)}") center / cover`; try { persist(); paintCards(); } catch { window.alert('This card image is too large for browser storage. Try a smaller image.'); } }; image.src = reader.result; };
      reader.readAsDataURL(f);
    });
    const upload = button('Upload card art', '', () => file.click(), 'hsbc-card-upload-button'); card.append(upload, file); rail.append(card);
  });
  const dots = document.querySelector('.hsbc-card-dots'); dots?.replaceChildren(...people.map((_, i) => { const d = el('button', i === state.cardIndex ? 'is-active' : '', ''); d.type = 'button'; d.setAttribute('aria-label', `Persona ${i + 1}`); d.addEventListener('click', () => { state.cardIndex = i; persist(); paintCards(); }); return d; }));
}
function safeText(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
function makeCards() {
  const panel = el('main', 'hsbc-cards-screen'); panel.innerHTML = `<header class="hsbc-cards-head"><div><small>YOUR PERSONAS</small><h1>Cards</h1></div><button class="hsbc-card-manage" type="button">Manage personas ${I.arrow}</button></header><div class="hsbc-card-carousel-controls"><button class="hsbc-card-prev" aria-label="Previous">${I.left}</button><div class="hsbc-card-dots"></div><button class="hsbc-card-next" aria-label="Next">${I.right}</button></div><div class="hsbc-card-list"></div><label class="hsbc-carousel-switch"><input type="checkbox" ${state.carousel ? 'checked' : ''}><span class="hsbc-switch-track"><i></i></span><span>Swipe between persona cards</span></label>`;
  panel.querySelector('.hsbc-card-manage').addEventListener('click', actions.cardsManage);
  panel.querySelector('.hsbc-card-prev').addEventListener('click', () => { state.cardIndex--; persist(); paintCards(); }); panel.querySelector('.hsbc-card-next').addEventListener('click', () => { state.cardIndex++; persist(); paintCards(); });
  panel.querySelector('input').addEventListener('change', e => { state.carousel = e.target.checked; persist(); paintCards(); });
  let x = 0; panel.addEventListener('touchstart', e => { x = e.changedTouches[0].clientX; }, { passive: true }); panel.addEventListener('touchend', e => { const delta = e.changedTouches[0].clientX - x; if (Math.abs(delta) > 48 && state.carousel) { state.cardIndex += delta < 0 ? 1 : -1; persist(); paintCards(); } }, { passive: true });
  return panel;
}
function art(kind) {
  const paths = {
    wallet: '<rect x="8" y="5" width="26" height="29" rx="3"/><path d="M8 11h26M26 23h8v7h-8a3.5 3.5 0 0 1 0-7z"/><circle cx="28" cy="26.5" r=".8"/>',
    chart: '<path d="M23 6a17 17 0 1 0 17 17H23z"/><path d="M27 5v14h14A17 17 0 0 0 27 5z"/><circle cx="15" cy="28" r="2"/>',
    umbrella: '<path d="M5 23a18 18 0 0 1 36 0z"/><path d="M23 23v16a4 4 0 0 0 8 0"/>',
    shield: '<path d="M23 43S8 36 8 23V11l15-6 15 6v12c0 13-15 20-15 20z"/><path d="m16 23 5 5 10-11"/>',
  };
  const extras = kind === 'chart' ? '<circle cx="12" cy="36" r="5" fill="#d7b55e"/><path d="M7 36h10" stroke="#fff" stroke-width="1"/>' : '';
  return `<svg class="hsbc-illustration" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="25" r="22" fill="#f3f4f6"/><g fill="none" stroke="#db0011" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">${paths[kind]}</g>${extras}<path d="M5 38h14v6H5z" fill="#db0011"/></svg>`;
}
function openLibrary() { closeTools(); const host = document.querySelector('.hsbc-library-host'); host.classList.add('is-open'); document.body.classList.add('hsbc-library-open'); host.querySelector('.hsbc-library-close').focus(); }
function closeLibrary() { document.querySelector('.hsbc-library-host')?.classList.remove('is-open'); document.body.classList.remove('hsbc-library-open'); }
function makeLibrary() {
  const host = el('div', 'hsbc-library-host'); const shade = el('div', 'hsbc-library-shade'); shade.addEventListener('click', closeLibrary);
  const drawer = el('aside', 'hsbc-library'); drawer.setAttribute('aria-label', 'Library');
  const head = el('header', 'hsbc-library-head', `<button class="hsbc-library-home" aria-label="Home">${I.home}</button><i></i><strong>Library</strong><span></span><button aria-label="Notifications">${I.bell}</button><button class="hsbc-library-user" aria-label="User settings">${I.person}</button><button class="hsbc-library-close" aria-label="Close">${I.close}</button>`);
  head.querySelector('.hsbc-library-home').onclick = closeLibrary; head.querySelector('.hsbc-library-close').onclick = closeLibrary; head.querySelector('.hsbc-library-user').onclick = () => { closeLibrary(); actions.settings(); };
  const content = el('div', 'hsbc-library-content');
  const hero = button('Products and services', art('wallet'), () => { closeLibrary(); actions.characters(); }, 'hsbc-library-hero');
  const grid = el('div', 'hsbc-library-grid'); [['Money trends', 'chart', actions.world], ['Insurance', 'umbrella', actions.backgrounds], ['Security and fraud', 'shield', actions.advanced]].forEach(([label, kind, fn]) => grid.append(button(label, art(kind), () => { closeLibrary(); fn(); }, 'hsbc-library-tile')));
  const secondary = el('div', 'hsbc-library-shortcuts'); [['Pay', actions.pay], ['Cards', showCards], ['Save & Invest', actions.save]].forEach(([label, fn]) => secondary.append(button(label, '', fn, 'hsbc-library-shortcut')));
  const section = (title, labels) => { const s = el('section', 'hsbc-library-section'); const h = document.createElement('h2'); h.textContent = title; s.append(h); labels.forEach(label => { const row = button(label, I.arrow, null, 'hsbc-library-row'); row.disabled = true; s.append(row); }); return s; };
  content.append(hero, grid, secondary, section('Your banking', ['Deposit a cheque', 'Deposit cash']), section('Keeping you safe', ['Online security', 'Protect your account', 'Fraud awareness']), section('Help', ['FAQs', 'Applications and requests', 'Your support needs', 'Secure messages', 'Chat with us']));
  const footer = el('footer', 'hsbc-library-footer', '<small>Version 0.4.0</small><button type="button" disabled>Log off</button>'); drawer.append(head, content, footer); host.append(shade, drawer); return host;
}
function splash() {
  const s = el('div', 'hsbc-splash', `<div class="hsbc-splash-art"><svg viewBox="0 0 720 680" aria-hidden="true"><defs><linearGradient id="hsbc-sky" x2="0" y2="1"><stop stop-color="#f8e8e5"/><stop offset=".55" stop-color="#eab6a8"/><stop offset="1" stop-color="#d5d7dc"/></linearGradient><linearGradient id="hsbc-lake" x2="0" y2="1"><stop stop-color="#c9cbd4"/><stop offset="1" stop-color="#aeb5c0"/></linearGradient></defs><path fill="url(#hsbc-sky)" d="M0 0h720v350H0z"/><path fill="#8d6970" d="m0 310 115-92 80 37 135-142 114 92 70-51 206 126v38H0z"/><path fill="url(#hsbc-lake)" d="M0 335h720v345H0z"/><path d="M0 354c108 10 159 16 265 5s181-9 275 0 118 13 180 6M0 410c95 7 164 18 276 9s182-12 276 1 109 12 168 8" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3"/><circle cx="490" cy="366" r="13" fill="#29292c"/><path fill="#db0011" d="M473 382q17-13 34 0l15 76-13 6-9-43 3 68h-27l2-68-10 43-13-6z"/></svg></div><div class="hsbc-splash-copy"><div class="hsbc-splash-brand"><i></i> HSBC UK</div><small class="hsbc-greeting"></small><h1></h1><p>Your conversations, thoughtfully arranged.</p><button type="button">Continue ${I.arrow}</button></div>`);
  const hour = new Date().getHours(); s.querySelector('.hsbc-greeting').textContent = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const persona = document.querySelector('#your_name')?.textContent?.trim(); s.querySelector('h1').textContent = persona && !persona.startsWith('[') ? persona : 'Welcome back';
  const dismiss = () => { s.classList.add('is-leaving'); setTimeout(() => s.remove(), 450); }; s.querySelector('button').onclick = dismiss; setTimeout(dismiss, 2100); return s;
}
let skinObserver;
function pinSkinLast() { const link = [...document.querySelectorAll('link[rel="stylesheet"]')].find(x => /hsbc-tavern\/style\.css/.test(x.href)); if (link && document.head.lastElementChild !== link) document.head.append(link); }
function mount() {
  if (!document.body || document.querySelector('.hsbc-nav')) return;
  document.body.classList.add('hsbc-tavern'); document.getElementById('preloader')?.remove();
  const navbar = nav(); const shell = document.querySelector('#sheld'); if (shell) { shell.prepend(navbar); const menu = makeTools(); const form = document.querySelector('#nonQRFormItems'); if (form) { document.querySelector('#leftSendForm')?.prepend(menu.trigger); form.append(menu.panel); } }
  const chat = document.querySelector('#chat'); if (chat) chat.before(makeCards()); document.body.append(makeLibrary());
  const area = document.querySelector('#send_textarea'); if (area) { area.placeholder = 'Start chat'; area.setAttribute('aria-label', 'Start chat'); }
  document.body.append(splash());
  document.addEventListener('click', e => { const panel = document.querySelector('.hsbc-tools'); if (panel?.classList.contains('is-open') && !e.target.closest('.hsbc-tools,.hsbc-tools-trigger')) closeTools(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeLibrary(); closeTools(); } });
  const observer = new MutationObserver(() => { const a = document.querySelector('#send_textarea'); if (a && a.placeholder !== 'Start chat') a.placeholder = 'Start chat'; messageDecor(); if (document.querySelector('.hsbc-tools.is-open')) renderMenu(); if (document.body.classList.contains('hsbc-cards-open')) paintCards(); });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['placeholder', 'class', 'style'] });
  pinSkinLast(); if (!skinObserver) { skinObserver = new MutationObserver(pinSkinLast); skinObserver.observe(document.head, { childList: true, subtree: true }); }
  messageDecor();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true }); else mount();
