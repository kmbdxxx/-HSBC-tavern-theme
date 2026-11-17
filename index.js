const STORAGE = 'hsbc-tavern.preferences.v3';
const INITIAL = { defaultPage: 0, orders: { extensions: [], custom: [] }, shortcuts: [], cards: {}, carousel: true, cardIndex: 0 };
let prefs;
try { prefs = { ...INITIAL, ...JSON.parse(localStorage.getItem(STORAGE) || '{}') }; } catch { prefs = structuredClone(INITIAL); }
prefs.orders = { ...INITIAL.orders, ...(prefs.orders || {}) }; prefs.shortcuts ||= []; prefs.cards ||= {};
const savePrefs = () => localStorage.setItem(STORAGE, JSON.stringify(prefs));
const svg = (body, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const ICON = {
  home: svg('<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>'),
  menu: svg('<path d="M3 6h18M3 12h18M3 18h18"/>'), close: svg('<path d="m6 6 12 12M18 6 6 18"/>'),
  person: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'), bell: svg('<path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>'),
  chat: svg('<path d="M4 4h16v13H9l-5 4zM8 8h8M8 12h6"/>'), mic: svg('<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8"/>'),
  left: svg('<path d="m15 18-6-6 6-6"/>'), right: svg('<path d="m9 18 6-6-6-6"/>'), arrow: svg('<path d="M4 12h15m-6-6 6 6-6 6"/>'),
  star: svg('<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'),
  card: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>'),
  save: svg('<path d="M4 4h16v16H4zM8 4v6h8V4M8 20v-6h8v6"/>'),
};
const make = (tag, cls, html = '') => { const node = document.createElement(tag); if (cls) node.className = cls; node.innerHTML = html; return node; };
const click = selector => { const node = document.querySelector(selector); if (node) { node.click(); return true; } return false; };
const PAGES = {
  home: { title: 'Presets', trigger: '#leftNavDrawerIcon', panel: '#left-nav-panel' },
  pay: { title: 'API Connections', trigger: '#API-status-top', panel: '#rm_api_block' },
  save: { title: 'Extensions', trigger: '#extensions-settings-button .drawer-toggle', panel: '#rm_extensions_block' },
  characters: { title: 'Products and services', trigger: '#rightNavDrawerIcon', panel: '#right-nav-panel', prepare: () => click('#rm_button_characters') },
  world: { title: 'Money trends', trigger: '#WI-SP-button .drawer-toggle', panel: '#WorldInfo' },
  backgrounds: { title: 'Insurance', trigger: '#backgrounds-drawer-toggle', panel: '#Backgrounds' },
  advanced: { title: 'Security and fraud', trigger: '#advanced-formatting-button .drawer-toggle', panel: '#AdvancedFormatting' },
  settings: { title: 'User Settings', trigger: '#user-settings-button .drawer-toggle', panel: '#user-settings-block' },
};
const origins = new Map();
let app, currentPage = '', currentPanel = null, currentTrigger = null, menuPage = 0, nativeTextarea, bridgeBusy = false;
const customStyleStates = new Map();
function disableCustomStyle(node) { if (!node || customStyleStates.has(node)) return; customStyleStates.set(node, { disabled: node.disabled, sheetDisabled: node.sheet?.disabled }); node.disabled = true; if (node.sheet) node.sheet.disabled = true; }
let masterStyleObserver;
function installMasterStylesheet() {
  const head = document.head;
  let master = head.querySelector('#hsbc-master-stylesheet');
  if (!master) { master = document.createElement('style'); master.id = 'hsbc-master-stylesheet'; master.dataset.extension = 'hsbc-tavern'; }
  const link = [...head.querySelectorAll('link[rel="stylesheet"]')].find(node => /hsbc-tavern[\/]style\.css/i.test(node.href) || /hsbc-tavern.*style\.css/i.test(node.href));
  const script = [...document.scripts].find(node => /hsbc-tavern.*index\.js/i.test(node.src));
  const cssUrl = link?.href || script?.src.replace(/index\.js(?:\?.*)?$/i, 'style.css');
  if (cssUrl && !master.dataset.loaded) {
    master.dataset.loaded = 'loading';
    fetch(cssUrl, { credentials: 'same-origin' }).then(response => { if (!response.ok) throw new Error('CSS fetch failed'); return response.text(); }).then(css => { master.textContent = css; master.dataset.loaded = 'true'; if (head.lastElementChild !== master) head.append(master); }).catch(() => { master.dataset.loaded = ''; });
  }
  if (head.lastElementChild !== master) head.append(master);
  masterStyleObserver?.disconnect();
  masterStyleObserver = new MutationObserver(() => { if (head.lastElementChild !== master) head.append(master); });
  masterStyleObserver.observe(head, { childList: true });
}

function button(label, icon, handler, cls = '') {
  const node = make('button', cls, `${icon || ''}<span class="hsbc-button-label"></span>`);
  node.type = 'button'; node.querySelector('.hsbc-button-label').textContent = label; if (handler) node.addEventListener('click', handler); return node;
}
function makeHeader() {
  const header = make('header', '', ''); header.id = 'hsbc-header';
  const home = button('Home', ICON.home, () => navigate('home'), 'hsbc-home-tab'); home.setAttribute('aria-label', 'Home · Presets'); home.classList.add('is-active'); header.append(home);
  [['Pay', 'pay'], ['Cards', 'cards'], ['Save & Invest', 'save']].forEach(([label, key]) => { const tab = button(label, '', () => navigate(key), 'hsbc-tab'); tab.dataset.page = key; header.append(tab); });
  const hamburger = button('Library', ICON.menu, openLibrary, 'hsbc-library-button'); hamburger.setAttribute('aria-label', 'Open Library'); hamburger.querySelector('.hsbc-button-label').remove(); header.append(hamburger); return header;
}
function setActiveTab(key) { document.querySelectorAll('#hsbc-header .hsbc-home-tab,#hsbc-header .hsbc-tab').forEach(node => node.classList.toggle('is-active', (node.dataset.page || 'home') === key)); }
function rememberOrigin(node) {
  if (origins.has(node)) return origins.get(node);
  const parent = node.parentNode; const marker = document.createComment(`hsbc origin ${node.id || node.className}`); parent.insertBefore(marker, node);
  const origin = { parent, marker, style: node.getAttribute('style'), className: node.className }; origins.set(node, origin); return origin;
}
function mountNode(node, target, className = '') {
  if (!node || !target) return false;
  rememberOrigin(node); if (className) node.classList.add(className); target.append(node); return true;
}
function restoreNode(node) {
  const origin = origins.get(node); if (!origin) return;
  if (origin.marker.parentNode) origin.marker.parentNode.insertBefore(node, origin.marker); else origin.parent.append(node);
  origin.marker.remove(); node.className = origin.className;
  if (origin.style === null) node.removeAttribute('style'); else node.setAttribute('style', origin.style);
  origins.delete(node);
}
function restoreCurrentPanel() {
  if (!currentPanel) return;
  const panel = currentPanel, trigger = currentTrigger; restoreNode(panel); currentPanel = null; currentTrigger = null;
  if (panel.classList.contains('openDrawer') && trigger?.isConnected) trigger.click();
}
function resetSubpage() { restoreCurrentPanel(); document.querySelector('#hsbc-native-host')?.replaceChildren(); document.querySelector('#hsbc-subpage')?.classList.remove('is-visible'); currentPage = ''; }
function returnToChat() { resetSubpage(); setActiveTab('home'); }
function showSubpage(title, key) {
  const page = document.querySelector('#hsbc-subpage'); const host = document.querySelector('#hsbc-native-host');
  page.querySelector('.hsbc-subpage-title').textContent = title; page.classList.add('is-visible'); currentPage = key;
  host.replaceChildren();
}
function openNativePage(key, { toggle = false } = {}) {
  if (toggle && currentPage === key) { returnToChat(); return; }
  resetSubpage(); const config = PAGES[key]; if (!config) return;
  showSubpage(config.title, key);
  const trigger = document.querySelector(config.trigger); if (trigger) trigger.click();
  config.prepare?.();
  window.setTimeout(() => {
    if (currentPage !== key) return;
    const panel = document.querySelector(config.panel); const host = document.querySelector('#hsbc-native-host');
    if (panel && host) {
      currentTrigger = trigger; currentPanel = panel; mountNode(panel, host, 'hsbc-native-panel');
      panel.classList.remove('closedDrawer'); panel.classList.add('openDrawer');
    } else host.append(make('p', 'hsbc-native-unavailable', 'This panel is not available in the current SillyTavern version.'));
  }, 0);
}
function navigate(key) {
  if (key === 'cards') {
    if (currentPage === 'cards') { returnToChat(); return; }
    resetSubpage(); setActiveTab('cards'); showCardsPage(); return;
  }
  if (PAGES[key]) { setActiveTab(key); openNativePage(key, { toggle: true }); }
}
function showCardsPage() {
  const page = document.querySelector('#hsbc-subpage'); const host = document.querySelector('#hsbc-native-host');
  page.querySelector('.hsbc-subpage-title').textContent = 'Cards'; page.classList.add('is-visible'); currentPage = 'cards';
  host.replaceChildren(makeCards()); renderCards();
}

function availableItems(kind) {
  const root = document.querySelector(kind === 'options' ? '#options .options-content' : '#extensionsMenu'); if (!root) return [];
  const query = kind === 'options' ? 'a,button,[role="menuitem"]' : '.extension_container > *, .extension_container .menu_button, .extension_container .interactable, .extension_container button, .extension_container a, .extension_container [role="button"]';
  const seen = new Set();
  return [...root.querySelectorAll(query)].filter(node => {
    if (seen.has(node) || node.closest('hr')) return false; seen.add(node);
    if (node.hidden || node.classList.contains('displayNone') || node.getAttribute('aria-hidden') === 'true' || node.style.display === 'none') return false;
    if (node.querySelectorAll('a,button,[role="button"],.menu_button,.interactable').length && !node.matches('a,button,[role="button"],.menu_button,.interactable')) return false;
    return Boolean((node.title || node.getAttribute('aria-label') || node.innerText || node.textContent || '').replace(/\s+/g, ' ').trim());
  }).map((node, index) => ({ node, kind, label: (node.title || node.getAttribute('aria-label') || node.innerText || node.textContent || `Tool ${index + 1}`).replace(/\s+/g, ' ').trim(), key: node.id || node.dataset.extensionId || node.dataset.id || `${kind}-${index}` }));
}
function customItems() {
  const all = [...availableItems('options'), ...availableItems('extensions')];
  return prefs.shortcuts.map(item => all.find(entry => entry.kind === item.kind && entry.key === item.key)).filter(Boolean);
}
function sorted(items, key) { const order = prefs.orders[key] || []; return [...items].sort((a, b) => { const ai = order.indexOf(a.key), bi = order.indexOf(b.key); return (ai < 0 ? 99999 : ai) - (bi < 0 ? 99999 : bi); }); }
function addToShortcuts(item) { if (!prefs.shortcuts.some(x => x.kind === item.kind && x.key === item.key)) prefs.shortcuts.push({ kind: item.kind, key: item.key }); savePrefs(); renderMenu(); }
function renderMenu() {
  const panel = document.querySelector('#hsbc-tools'); if (!panel) return;
  const list = panel.querySelector('.hsbc-tool-list'); list.replaceChildren();
  const items = menuPage === 0 ? availableItems('options') : menuPage === 1 ? sorted(availableItems('extensions'), 'extensions') : sorted(customItems(), 'custom');
  items.forEach(item => {
    const row = make('div', 'hsbc-tool-row'); row.dataset.key = item.key;
    const activate = button(item.label, '', () => { item.node.click(); closeTools(); }, 'hsbc-tool-activate'); row.append(activate);
    const fav = button(menuPage === 2 ? 'Remove' : '', menuPage === 2 ? '' : ICON.star, () => { if (menuPage === 2) { prefs.shortcuts = prefs.shortcuts.filter(x => !(x.kind === item.kind && x.key === item.key)); savePrefs(); renderMenu(); } else addToShortcuts(item); }, 'hsbc-tool-favorite');
    fav.setAttribute('aria-label', menuPage === 2 ? 'Remove shortcut' : 'Copy to shortcuts'); row.append(fav);
    if (menuPage > 0) { const handle = button('', ICON.menu, null, 'hsbc-tool-handle'); handle.title = 'Hold and drag to reorder'; handle.setAttribute('aria-label', 'Drag to reorder'); row.append(handle); attachReorder(handle, row, menuPage === 1 ? 'extensions' : 'custom'); }
    list.append(row);
  });
  if (!items.length) list.append(make('p', 'hsbc-tool-empty', menuPage === 2 ? 'Copy a favourite item from page 1 or 2.' : 'No available items.'));
  panel.querySelectorAll('[data-page]').forEach(b => b.setAttribute('aria-current', String(Number(b.dataset.page) === menuPage)));
  panel.querySelector('.hsbc-default input').checked = prefs.defaultPage === menuPage;
}
function attachReorder(handle, row, group) {
  handle.draggable = true;
  handle.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', row.dataset.key); row.classList.add('is-dragging'); });
  handle.addEventListener('dragend', () => row.classList.remove('is-dragging'));
  row.addEventListener('dragover', e => { e.preventDefault(); const moving = row.parentElement.querySelector('.is-dragging'); if (moving && moving !== row) { const r = row.getBoundingClientRect(); row.parentElement.insertBefore(moving, e.clientY < r.top + r.height / 2 ? row : row.nextSibling); } });
  row.addEventListener('drop', e => { e.preventDefault(); prefs.orders[group] = [...row.parentElement.querySelectorAll('.hsbc-tool-row')].map(x => x.dataset.key); savePrefs(); });
  let pointer = null;
  handle.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') return; pointer = e.pointerId; handle.setPointerCapture(pointer); row.classList.add('is-dragging'); e.preventDefault(); });
  handle.addEventListener('pointermove', e => { if (pointer !== e.pointerId) return; const target = document.elementFromPoint(e.clientX, e.clientY)?.closest('.hsbc-tool-row'); if (target && target !== row && target.parentElement === row.parentElement) { const r = target.getBoundingClientRect(); row.parentElement.insertBefore(row, e.clientY < r.top + r.height / 2 ? target : target.nextSibling); } });
  const finish = e => { if (pointer !== e.pointerId) return; pointer = null; row.classList.remove('is-dragging'); prefs.orders[group] = [...row.parentElement.querySelectorAll('.hsbc-tool-row')].map(x => x.dataset.key); savePrefs(); };
  handle.addEventListener('pointerup', finish); handle.addEventListener('pointercancel', finish);
}
function makeTools() {
  const panel = make('section', '', ''); panel.id = 'hsbc-tools'; panel.setAttribute('aria-label', 'Chat shortcuts');
  const head = make('header', 'hsbc-tool-head'); const prev = button('Previous', ICON.left, () => changeMenuPage(-1), 'hsbc-tool-page-arrow'); const next = button('Next', ICON.right, () => changeMenuPage(1), 'hsbc-tool-page-arrow');
  const pages = make('div', 'hsbc-tool-pages', [0, 1, 2].map(i => `<button type="button" data-page="${i}" aria-label="Page ${i + 1}">${i + 1}</button>`).join(''));
  pages.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { menuPage = Number(b.dataset.page); renderMenu(); }));
  const def = make('label', 'hsbc-default', '<input type="checkbox"><span>Default page</span>'); def.querySelector('input').addEventListener('change', e => { prefs.defaultPage = e.target.checked ? menuPage : -1; savePrefs(); });
  head.append(prev, pages, next, def); panel.append(head, make('div', 'hsbc-tool-list'));
  const trigger = button('Tools', ICON.chat, toggleTools, 'hsbc-tools-trigger'); trigger.setAttribute('aria-label', 'Chat tools'); return { panel, trigger };
}
function changeMenuPage(delta) { menuPage = (menuPage + delta + 3) % 3; renderMenu(); }
function openTools() { menuPage = prefs.defaultPage >= 0 && prefs.defaultPage < 3 ? prefs.defaultPage : 0; renderMenu(); document.querySelector('#hsbc-tools')?.classList.add('is-open'); }
function closeTools() { document.querySelector('#hsbc-tools')?.classList.remove('is-open'); }
function toggleTools() { document.querySelector('#hsbc-tools')?.classList.contains('is-open') ? closeTools() : openTools(); }

function messageDecoration() {
  const stream = document.querySelector('#hsbc-chat-viewport #chat'); if (!stream) return;
  if (!stream.querySelector('.hsbc-today') && !document.querySelector('#hsbc-chat-viewport .hsbc-chat-top .hsbc-today')) stream.prepend(make('span', 'hsbc-today', 'Today'));
  stream.querySelectorAll('.mes').forEach(message => {
    if (message.classList.contains('system') || message.dataset.hsbcDecorated) return;
    if (!message.classList.contains('user') && message.getAttribute('is_user') !== 'true') {
      const avatar = message.querySelector('.mesAvatarWrapper,.mesAvatar'); if (avatar) avatar.insertAdjacentHTML('afterbegin', '<svg class="hsbc-ai-hex" viewBox="0 0 24 24" aria-hidden="true"><path fill="#DB0011" d="m12 1 10 5.7v10.6L12 23 2 17.3V6.7z"/><path fill="#fff" d="m12 5 6 3.4v7.2L12 19l-6-3.4V8.4z"/></svg>');
    }
    const body = message.querySelector('.mes_block,.mes_text'); if (body) body.append(make('small', 'hsbc-now', 'Now'));
    message.dataset.hsbcDecorated = 'true';
  });
}

function personaNodes() { return [...document.querySelectorAll('#user_avatar_block .avatar-container[data-avatar-id]')]; }
function artFor(name, index) { const type = /premier|prime/i.test(name) ? 'premier' : /global|money/i.test(name) ? 'global' : ['debit', 'premier', 'global'][index % 3]; return type === 'premier' ? 'linear-gradient(135deg,#202529,#41474c 55%,#151719)' : type === 'global' ? 'linear-gradient(135deg,#123664,#2874ae 58%,#b89b52)' : 'linear-gradient(135deg,#d4d9dd,#fafbfc 50%,#bcc3c9)'; }
function renderCards() {
  const rail = document.querySelector('#hsbc-card-list'); if (!rail) return; const people = personaNodes(); rail.replaceChildren(); rail.classList.toggle('is-list', !prefs.carousel);
  if (!people.length) { rail.append(make('p', 'hsbc-card-empty', 'No user personas found.')); return; }
  prefs.cardIndex = (prefs.cardIndex + people.length) % people.length;
  people.forEach((persona, i) => {
    if (prefs.carousel && i !== prefs.cardIndex) return;
    const id = persona.dataset.avatarId; const name = persona.querySelector('.ch_name')?.textContent.trim() || id; const card = make('article', `hsbc-persona-card ${prefs.carousel ? 'is-carousel' : 'is-row'}`);
    card.style.setProperty('--card-art', prefs.cards[id] || artFor(name, i));
    card.innerHTML = `<div class="hsbc-card-brand">HSBC <span>${/premier|prime/i.test(name) ? 'PREMIER' : /global|money/i.test(name) ? 'GLOBAL MONEY' : 'DEBIT'}</span></div><div class="hsbc-card-main"><svg class="hsbc-card-diamond" viewBox="0 0 48 48" aria-hidden="true"><path fill="#DB0011" d="M24 1 47 13v22L24 47 1 35V13z"/><path fill="#fff" d="m24 9 15 8v14l-15 8-15-8V17z"/></svg><strong></strong><small>USER PERSONA · ${escapeHtml(id)}</small></div><div class="hsbc-card-foot"><span>•••• &nbsp; •••• &nbsp; ••••</span><span>VISA</span></div>`;
    card.querySelector('strong').textContent = name; card.addEventListener('click', event => { if (event.target.closest('.hsbc-card-upload')) return; persona.click(); });
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.hidden = true; input.addEventListener('change', () => storeCardImage(input.files?.[0], id));
    const upload = button('Upload image', '', () => input.click(), 'hsbc-card-upload'); card.append(upload, input); rail.append(card);
  });
  const dots = document.querySelector('#hsbc-card-dots'); dots.replaceChildren(...people.map((_, i) => { const dot = make('button', i === prefs.cardIndex ? 'is-active' : '', ''); dot.type = 'button'; dot.setAttribute('aria-label', `Persona ${i + 1}`); dot.onclick = () => { prefs.cardIndex = i; savePrefs(); renderCards(); }; return dot; }));
}
function storeCardImage(file, id) {
  if (!file) return; const reader = new FileReader(); reader.onload = () => { const image = new Image(); image.onload = () => {
    const ratio = Math.min(1, 1600 / image.width, 1000 / image.height); const canvas = document.createElement('canvas'); canvas.width = Math.max(1, image.width * ratio); canvas.height = Math.max(1, image.height * ratio); canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    prefs.cards[id] = `url("${canvas.toDataURL('image/jpeg', .84)}") center / cover`; try { savePrefs(); renderCards(); } catch { alert('Image storage limit reached. Please choose a smaller card image.'); }
  }; image.src = reader.result; }; reader.readAsDataURL(file);
}
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
function makeCards() {
  const page = make('section', 'hsbc-cards'); page.id = 'hsbc-cards-page';
  page.innerHTML = `<div class="hsbc-cards-kicker">YOUR PERSONAS</div><div class="hsbc-card-controls"><button class="hsbc-card-prev" aria-label="Previous">${ICON.left}</button><div id="hsbc-card-dots"></div><button class="hsbc-card-next" aria-label="Next">${ICON.right}</button></div><div id="hsbc-card-list"></div><label class="hsbc-carousel-toggle"><input type="checkbox" ${prefs.carousel ? 'checked' : ''}><span class="hsbc-switch"><i></i></span><span>Swipe between cards</span></label>`;
  page.querySelector('.hsbc-card-prev').onclick = () => { prefs.cardIndex--; savePrefs(); renderCards(); }; page.querySelector('.hsbc-card-next').onclick = () => { prefs.cardIndex++; savePrefs(); renderCards(); };
  page.querySelector('input').onchange = e => { prefs.carousel = e.target.checked; savePrefs(); renderCards(); };
  let x = 0; page.addEventListener('touchstart', e => { x = e.changedTouches[0].clientX; }, { passive: true }); page.addEventListener('touchend', e => { const delta = e.changedTouches[0].clientX - x; if (prefs.carousel && Math.abs(delta) > 45) { prefs.cardIndex += delta < 0 ? 1 : -1; savePrefs(); renderCards(); } }, { passive: true });
  return page;
}

function illustration(kind) {
  const art = {
    wallet: '<path fill="#DB0011" d="M12 20h38v31H12z"/><path fill="#333E48" d="m15 19 7-12 25 7-3 7z"/><path fill="#D0D5DD" d="m22 19 8-15 24 10-4 8z"/><path fill="#fff" d="M12 25h38v5H12z"/><path fill="#A8000E" d="M43 31h10v8H43z"/><circle cx="48" cy="35" r="1.3" fill="#D0D5DD"/>',
    chart: '<path fill="#333E48" d="M27 10a19 19 0 1 0 19 19H27z"/><path fill="#DB0011" d="M31 6v19h19A19 19 0 0 0 31 6z"/><path fill="#D0D5DD" d="M7 39h24v5H7zm3 7h22v5H10zm3 7h18v4H13z"/><ellipse cx="19" cy="39" rx="12" ry="3" fill="#E7EAED"/><ellipse cx="20" cy="46" rx="11" ry="3" fill="#C4CBD1"/><ellipse cx="22" cy="53" rx="9" ry="2.5" fill="#AEB7BE"/>',
    umbrella: '<path fill="#DB0011" d="M6 29a22 22 0 0 1 44 0H6z"/><path fill="#B0000D" d="M28 7a22 22 0 0 1 22 22H28z"/><path fill="none" stroke="#333E48" stroke-width="3" stroke-linecap="round" d="M28 28v21a6 6 0 0 0 12 0v-2"/><path fill="#D0D5DD" d="M28 8v20H7A22 22 0 0 1 28 8z" opacity=".34"/>',
    shield: '<path fill="#333E48" d="M28 5 49 13v16c0 13-9 22-21 28C16 51 7 42 7 29V13z"/><path fill="#D0D5DD" d="m28 9 17 6v14c0 10-7 18-17 24-10-6-17-14-17-24V15z"/><path fill="#DB0011" d="m28 13 13 5v11c0 8-5 14-13 19-8-5-13-11-13-19V18z"/><path fill="none" stroke="#fff" stroke-width="2" d="m21 29 5 5 10-11"/>',
    pay: '<circle cx="28" cy="28" r="23" fill="#DB0011"/><path fill="#fff" d="M9 24h25l-7-7 3-3 13 12-13 12-3-3 7-7H9zm38 8H22l7 7-3 3-13-12 13-12 3 3-7 7h25z"/>',
    cards: '<rect x="7" y="15" width="34" height="24" rx="3" fill="#D0D5DD"/><path fill="#333E48" d="M7 21h34v5H7z"/><rect x="17" y="9" width="34" height="25" rx="3" fill="#DB0011"/><path fill="#A8000E" d="M17 15h34v5H17z"/><path fill="#fff" d="M22 27h10v2H22zm0 4h17v2H22z"/>',
    plant: '<ellipse cx="28" cy="48" rx="20" ry="6" fill="#333E48"/><path fill="#D0D5DD" d="M8 42h40v6H8zm4-9h32v6H12zm4-8h24v5H16z"/><path fill="#DB0011" d="M27 26V9h3v17z"/><path fill="#DB0011" d="M28 12C15 12 14 4 15 3c10 0 14 4 13 9zm1 5C29 6 39 3 43 5c0 9-6 12-14 12z"/><path fill="#A8000E" d="M28 13c-2-7-7-8-13-10 0 6 4 10 13 10z"/>',
  }[kind] || '';
  return `<svg class="hsbc-illustration" viewBox="0 0 56 60" aria-hidden="true">${art}</svg>`;
}
function openLibrary() { closeTools(); document.querySelector('#hsbc-library-overlay').classList.add('is-open'); }
function closeLibrary() { document.querySelector('#hsbc-library-overlay')?.classList.remove('is-open'); }
function libraryNavigate(key) { closeLibrary(); if (key === 'cards') { navigate('cards'); return; } navigate(key); }
function makeLibrary() {
  const overlay = make('div', '', ''); overlay.id = 'hsbc-library-overlay';
  const shade = make('button', 'hsbc-library-shade', ''); shade.type = 'button'; shade.setAttribute('aria-label', 'Close Library'); shade.onclick = closeLibrary;
  const drawer = make('aside', 'hsbc-library-drawer');
  const head = make('header', 'hsbc-library-head', `<button class="hsbc-library-home" aria-label="Home">${ICON.home}</button><i></i><strong>Library</strong><span></span><button aria-label="Notifications">${ICON.bell}</button><button class="hsbc-library-user" aria-label="User settings">${ICON.person}</button><button class="hsbc-library-close" aria-label="Close">${ICON.close}</button>`);
  head.querySelector('.hsbc-library-home').onclick = closeLibrary; head.querySelector('.hsbc-library-close').onclick = closeLibrary; head.querySelector('.hsbc-library-user').onclick = () => libraryNavigate('settings');
  const content = make('div', 'hsbc-library-content'); const hero = button('Products and services', illustration('wallet'), () => libraryNavigate('characters'), 'hsbc-library-hero');
  const grid = make('div', 'hsbc-library-grid'); [['Money trends', 'chart', 'world'], ['Insurance', 'umbrella', 'backgrounds'], ['Security and fraud', 'shield', 'advanced']].forEach(([label, art, target]) => grid.append(button(label, illustration(art), () => libraryNavigate(target), 'hsbc-library-tile')));
  const quick = make('div', 'hsbc-library-quick'); [['Pay', 'pay'], ['Cards', 'cards'], ['Save & Invest', 'plant']].forEach(([label, art]) => { const item = button(label, illustration(art), null, 'hsbc-library-quick-item'); item.disabled = true; quick.append(item); });
  const itemArt = {
    cheque: '<rect x="8" y="11" width="32" height="25" rx="2"/><path d="M12 17h14m-14 5h9m11 9 4 4 7-8"/>', cash: '<rect x="7" y="13" width="34" height="24" rx="3"/><circle cx="24" cy="25" r="6"/><path d="M11 18h3m20 14h3"/>',
    report: '<rect x="10" y="8" width="28" height="34" rx="3"/><path d="M17 16h14m-14 6h10"/><path d="m24 27-6 11h12z"/>', security: '<path d="M24 5 39 11v11c0 9-6 15-15 21C15 37 9 31 9 22V11z"/><path d="m17 24 5 5 10-11"/>', fraud: '<circle cx="24" cy="24" r="17"/><path d="M24 14v12m0 7h.1"/>',
    faq: '<circle cx="24" cy="24" r="17"/><path d="M18 19a6 6 0 1 1 9 5c-3 2-3 3-3 5m0 5h.1"/>', application: '<path d="M14 7h19l7 7v27H14z"/><path d="M32 7v9h8M20 23h14m-14 7h14m-14 7h9"/>', support: '<circle cx="24" cy="17" r="7"/><path d="M10 41a14 14 0 0 1 28 0M8 21v7m32-7v7"/>', messages: '<path d="M8 11h32v23H22l-10 7v-7H8z"/><path d="M15 19h18m-18 6h12"/>', chat: '<path d="M8 11h32v23H22l-10 7v-7H8z"/><path d="M17 22h.1m7 0h.1m7 0h.1"/>',
  };
  const section = (title, entries) => {
    const group = make('section', 'hsbc-library-section'); const heading = document.createElement('h2'); heading.textContent = title; group.append(heading);
    const gridItems = make('div', 'hsbc-service-grid');
    entries.forEach(([name, kind]) => { const item = make('div', 'hsbc-service-item'); item.innerHTML = `<span class="hsbc-service-icon"><svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="#DB0011" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${itemArt[kind]}</svg></span><span class="hsbc-service-label"></span>`; item.querySelector('.hsbc-service-label').textContent = name; gridItems.append(item); });
    group.append(gridItems); return group;
  };
  content.append(hero, grid, quick,
    section('Your banking', [['Deposit a cheque', 'cheque'], ['Deposit cash', 'cash']]),
    section('Keeping you safe', [['Report a card issue', 'report'], ['Manage security', 'security'], ['Fraud and security tips', 'fraud']]),
    section('Help', [['FAQs', 'faq'], ['Applications and requests', 'application'], ['Your support needs', 'support'], ['Secure messages', 'messages'], ['Chat with us', 'chat']]));
  const footer = make('footer', 'hsbc-library-footer', '<small>Version 3.76.0 (26102606)</small><i></i><button type="button"><span aria-hidden="true">←</span> Log off</button>'); footer.querySelector('button').onclick = () => { closeLibrary(); startSplash(); };
  drawer.append(head, content, footer); overlay.append(shade, drawer); return overlay;
}
function makeSplash() {
  const screen = make('section', ''); screen.id = 'hsbc-splash-screen'; screen.setAttribute('aria-label', 'HSBC UK welcome screen');
  screen.className = 'hsbc-splash';
  screen.innerHTML = `<div class="hsbc-splash-art"><svg viewBox="0 0 720 620" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="hsbc-splash-sky" x2="0" y2="1"><stop stop-color="#ECEAF1"/><stop offset=".42" stop-color="#F2C5B4"/><stop offset="1" stop-color="#E8D9D8"/></linearGradient><linearGradient id="hsbc-splash-water" x2="0" y2="1"><stop stop-color="#D5D5E2"/><stop offset="1" stop-color="#BCC3D0"/></linearGradient><linearGradient id="hsbc-splash-mountain" x2="0" y2="1"><stop stop-color="#E9A28E"/><stop offset="1" stop-color="#BD7979"/></linearGradient></defs><path fill="url(#hsbc-splash-sky)" d="M0 0h720v620H0z"/><path fill="url(#hsbc-splash-mountain)" d="m0 208 84-32 58-13 73-32 55 23 50-34 45 20 53-18 68 33 41-16 77 30 57 21 59-5v131H0z"/><path fill="#9B777F" opacity=".42" d="m0 238 84-28 83-13 66-34 72 23 77-33 52 20 64-13 87 30 55-9 80 30v119H0z"/><path fill="url(#hsbc-splash-water)" d="M0 277h720v343H0z"/><path fill="#F4D2C6" opacity=".65" d="M0 276c121 10 188-3 280 4s182 11 255 0 121-3 185 5v18H0z"/><g fill="none" stroke="#F7F4F5" stroke-opacity=".62"><path stroke-width="3" d="M0 333c120 17 192 16 292 6s244-12 428 7M0 407c109 10 197 27 314 12s258-20 406 8M0 500c137 12 225 30 348 15s241-12 372 8"/><path stroke-width="2" d="M0 369c122 9 216 20 321 7s263-12 399 1M0 454c137 8 217 26 335 10s238-11 385 7"/></g><ellipse cx="491" cy="471" rx="22" ry="92" fill="#DB0011" opacity=".12"/><path fill="#20262D" d="M481 354a10 10 0 1 1 20 0 10 10 0 0 1-20 0z"/><path fill="#DB0011" d="M475 369q16-11 32 0l13 56-8 4-10-29 4 48h-30l3-48-10 29-8-4z"/><path fill="#20262D" d="m480 443-6 37h9l8-36m10 0 7 36h9l-5-37z"/><path fill="#DB0011" d="M481 476q10 3 14 0l3 99h-7l-7-73-4 73h-7z" opacity=".12"/><path fill="#fff" d="M0 574h515l205 46H0z"/></svg></div><div class="hsbc-splash-content"><div class="hsbc-splash-greeting"><span class="hsbc-greeting-time"></span><span>User</span></div><div class="hsbc-logon-label">Log on with</div><button class="hsbc-biometrics" type="button">Biometrics</button><button class="hsbc-pin" type="button">${svg('<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h.1M12 8h.1M16 8h.1M8 12h.1M12 12h.1M16 12h.1M8 16h.1M12 16h.1M16 16h.1')}<span>Mobile Banking PIN</span></button><div class="hsbc-fscs"><svg viewBox="0 0 60 76" role="img" aria-label="FSCS Protected"><path fill="#4B237C" d="M30 1C13 1 3 13 3 29v43h54V29C57 13 47 1 30 1z"/><path fill="#fff" d="M18 30v-7a12 12 0 0 1 24 0v7h-5v-7a7 7 0 0 0-14 0v7zM13 29h34v26H13z"/><circle cx="30" cy="40" r="4" fill="#4B237C"/><path fill="#4B237C" d="M28 43h4v6h-4z"/><text x="30" y="67" text-anchor="middle" fill="#fff" font-size="7" font-family="Arial" font-weight="700">FSCS PROTECTED</text></svg></div></div>`;
  const hour = new Date().getHours(); screen.querySelector('.hsbc-greeting-time').textContent = hour < 5 || hour >= 18 ? 'Good evening' : hour < 12 ? 'Good morning' : 'Good afternoon';
  const dismiss = () => { screen.classList.add('is-leaving'); window.setTimeout(() => screen.remove(), 360); };
  screen.querySelector('.hsbc-biometrics').onclick = dismiss; screen.querySelector('.hsbc-pin').onclick = dismiss; return screen;
}
function startSplash() {
  if (document.querySelector('#hsbc-splash-screen')) return;
  app?.append(makeSplash());
}

function buildShell() {
  app = make('div', ''); app.id = 'hsbc-uk-app';
  app.append(makeHeader());
  const viewport = make('main', ''); viewport.id = 'hsbc-chat-viewport';
  const today = make('div', 'hsbc-chat-top'); today.append(make('span', 'hsbc-today', 'Today')); viewport.append(today);
  const chat = document.querySelector('#chat'); if (chat) mountNode(chat, viewport, 'hsbc-native-chat');
  app.append(viewport);
  const footer = make('footer', ''); footer.id = 'hsbc-footer';
  const tools = makeTools(); const left = make('div', 'hsbc-footer-left'); left.append(tools.trigger);
  const composer = make('div', 'hsbc-composer'); nativeTextarea = document.querySelector('#send_textarea');
  const input = document.createElement('textarea'); input.id = 'hsbc-chat-input'; input.rows = 1; input.placeholder = 'Start chat'; input.setAttribute('aria-label', 'Start chat');
  const mic = button('Microphone', ICON.mic, null, 'hsbc-mic'); mic.disabled = true;
  composer.append(input, mic);
  const send = button('Send', ICON.arrow, () => sendMessage(input), 'hsbc-send'); send.setAttribute('aria-label', 'Send message');
  footer.append(left, composer, send, tools.panel); app.append(footer);
  const subpage = make('section', ''); subpage.id = 'hsbc-subpage';
  const subhead = make('header', 'hsbc-subpage-head', `<button class="hsbc-back-chat" type="button">${ICON.left}<span>Back to chat</span></button><strong class="hsbc-subpage-title"></strong>`);
  subhead.querySelector('button').onclick = returnToChat;
  const nativeHost = make('div', ''); nativeHost.id = 'hsbc-native-host'; subpage.append(subhead, nativeHost); app.append(subpage);
  app.append(makeLibrary()); app.append(makeSplash()); document.body.append(app);
  input.addEventListener('input', () => syncToNative(input)); input.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); sendMessage(input); } });
  document.addEventListener('input', event => { if (event.target === nativeTextarea && !bridgeBusy && input.value !== nativeTextarea.value) input.value = nativeTextarea.value; });
  return {};
}
function syncToNative(input) {
  if (!nativeTextarea) return; bridgeBusy = true; nativeTextarea.value = input.value; nativeTextarea.dispatchEvent(new Event('input', { bubbles: true })); bridgeBusy = false;
  input.style.height = 'auto'; input.style.height = `${Math.min(input.scrollHeight, window.innerHeight * .28)}px`;
}
function sendMessage(input) {
  if (!nativeTextarea) return; syncToNative(input); click('#send_but');
  window.setTimeout(() => { input.value = nativeTextarea.value; input.style.height = 'auto'; input.focus(); }, 80);
}
function restoreApp() {
  resetSubpage(); for (const node of [...origins.keys()]) restoreNode(node);
  for (const [node, state] of customStyleStates) { node.disabled = state.disabled; if (node.sheet && state.sheetDisabled !== undefined) node.sheet.disabled = state.sheetDisabled; }
  customStyleStates.clear();
  app?.remove();
}
function mount() {
  if (!document.body || document.querySelector('#hsbc-uk-app')) return;
  document.querySelectorAll('#custom-style').forEach(disableCustomStyle);
  installMasterStylesheet();
  buildShell(); messageDecoration();
  const tools = document.querySelector('#hsbc-tools');
  document.addEventListener('click', event => { if (tools?.classList.contains('is-open') && !event.target.closest('#hsbc-tools,.hsbc-tools-trigger')) closeTools(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeLibrary(); closeTools(); returnToChat(); } });
  const observer = new MutationObserver(records => {
    const has = selector => records.some(record => { const target = record.target.nodeType === Node.ELEMENT_NODE ? record.target : record.target.parentElement; return target?.closest(selector); });
    if (has('#hsbc-chat-viewport #chat')) messageDecoration();
    if (has('#options,#extensionsMenu') && tools?.classList.contains('is-open')) renderMenu();
    if (has('#user_avatar_block') && currentPage === 'cards') renderCards();
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
  const styleObserver = new MutationObserver(records => records.forEach(record => {
    if (record.type === 'attributes' && record.target.matches?.('#custom-style') && !record.target.disabled) { record.target.disabled = true; if (record.target.sheet) record.target.sheet.disabled = true; }
    record.addedNodes.forEach(node => { if (node.nodeType === Node.ELEMENT_NODE) { if (node.matches?.('#custom-style')) disableCustomStyle(node); node.querySelectorAll?.('#custom-style').forEach(disableCustomStyle); } });
  }));
  styleObserver.observe(document.head, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled'] }); window.addEventListener('beforeunload', () => { styleObserver.disconnect(); masterStyleObserver?.disconnect(); }, { once: true });
  window.addEventListener('beforeunload', restoreApp, { once: true });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true }); else mount();

