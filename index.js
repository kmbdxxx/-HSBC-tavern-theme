const KEY = 'hsbc-tavern.preferences.v1';
const DEFAULTS = { defaultPage: 0, activePage: 0, cardCarousel: true, cardImages: {}, shortcuts: [] };
let prefs;
try { prefs = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { prefs = { ...DEFAULTS }; }
if (prefs.defaultPage >= 0 && prefs.defaultPage < 3) prefs.activePage = prefs.defaultPage;
const save = () => localStorage.setItem(KEY, JSON.stringify(prefs));
const svg = (body, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const icons = {
  home: svg('<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/><path d="M3 21h18"/>'),
  pay: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>'),
  cards: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/>'),
  save: svg('<path d="M4 5h16v15H4zM8 5v5h8V5M8 20v-6h8v6"/>'),
  menu: svg('<path d="M4 6h16M4 12h16M4 18h16"/>'),
  back: svg('<path d="m15 18-6-6 6-6M9 12h12"/>'),
  close: svg('<path d="m6 6 12 12M18 6 6 18"/>'),
  person: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  bell: svg('<path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>'),
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  sliders: svg('<path d="M4 6h16M4 12h16M4 18h16M8 4v4M15 10v4M10 16v4"/>'),
  world: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>'),
  umbrella: svg('<path d="M3 12a9 9 0 0 1 18 0zM12 12v7a2 2 0 0 0 4 0"/>'),
  shield: svg('<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="m9 12 2 2 4-4"/>'),
  chart: svg('<path d="M4 19h16M6 16l4-5 3 2 5-7"/><circle cx="18" cy="6" r="2"/>'),
  wallet: svg('<path d="M4 6h15a2 2 0 0 1 2 2v11H5a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h12"/><path d="M16 12h5v4h-5a2 2 0 0 1 0-4z"/>'),
  chat: svg('<path d="M4 5h16v12H9l-5 4zM8 9h8M8 13h5"/>'),
  spark: svg('<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>'),
};
const create = (tag, cls, html = '') => { const el = document.createElement(tag); if (cls) el.className = cls; el.innerHTML = html; return el; };
const clickFirst = (selectors) => { for (const selector of selectors) { const el = document.querySelector(selector); if (el) { el.click(); return true; } } return false; };
const actions = {
  home: () => clickFirst(['#leftNavDrawerIcon']),
  // Never click a provider's Connect button here: that can start a live request.
  pay: () => {
    if (clickFirst(['#api-connections-button', '#api_connection_button', '#api-settings-button .drawer-toggle', '[data-target="api-settings-button"]', '[data-target="api_connection"]'])) return true;
    const opener = [...document.querySelectorAll('button, .menu_button, .drawer-toggle, .drawer-icon')].find((el) => {
      const label = `${el.getAttribute('title') || ''} ${el.getAttribute('aria-label') || ''} ${el.textContent || ''}`.trim();
      return /^(API connections?|API settings|Connections)$/i.test(label) && !/connect$/i.test(label);
    });
    opener?.click(); return Boolean(opener);
  },
  cards: () => clickFirst(['#persona-management-button .drawer-toggle', '#persona-management-button .drawer-header']),
  save: () => clickFirst(['#extensions-settings-button .drawer-toggle', '#extensions-settings-button .drawer-header']),
  characters: () => clickFirst(['#rm_button_characters']), world: () => clickFirst(['#world_info_button', '#world-info-button', '#world_info']),
  backgrounds: () => clickFirst(['#backgrounds-drawer-toggle']), advanced: () => clickFirst(['#advanced-formatting-button .drawer-toggle', '#advanced_formatting_button']),
  settings: () => clickFirst(['#user-settings-button .drawer-toggle', '#user-settings-button .drawer-header']),
  options: () => clickFirst(['#options_button']),
};

function makeButton(label, icon, handler, cls = '') {
  const b = create('button', `hsbc-action ${cls}`, `${icon}<span>${label}</span>`); b.type = 'button'; b.addEventListener('click', handler); return b;
}
function makeNavigation() {
  const bar = create('nav', 'hsbc-nav', `<div class="hsbc-nav-brand">${icons.home}<i></i></div>`);
  bar.setAttribute('aria-label', 'Main navigation');
  [['Home', 'home'], ['Pay', 'pay'], ['Cards', 'cards'], ['Save & Invest', 'save']].forEach(([label, key]) => {
    bar.appendChild(makeButton(label, icons[key], () => key === 'cards' ? openCards() : actions[key](), key === 'home' ? 'is-active' : ''));
  });
  const library = create('button', 'hsbc-nav-menu', icons.menu); library.type = 'button'; library.setAttribute('aria-label', 'Open Library'); library.addEventListener('click', openLibrary); bar.appendChild(library);
  return bar;
}

function makeChatTools() {
  const wrap = create('section', 'hsbc-chat-tools'); wrap.setAttribute('aria-label', 'Chat shortcuts');
  const row = create('div', 'hsbc-page-switch');
  const pages = [
    { title: 'Chat', icon: icons.chat, buttons: [['Presets', actions.home], ['API connection', actions.pay], ['Extensions', actions.save]] },
    { title: 'Tools', icon: icons.spark, buttons: [['Characters', actions.characters], ['World Info', actions.world], ['Backgrounds', actions.backgrounds], ['Advanced formatting', actions.advanced]] },
    { title: 'My shortcuts', icon: icons.sliders, buttons: [] },
  ];
  const pageContent = create('div', 'hsbc-shortcut-content');
  const renderPage = () => {
    const page = pages[prefs.activePage] || pages[0]; pageContent.replaceChildren();
    for (const [label, fn] of page.buttons) pageContent.appendChild(makeButton(label, icons.arrow, fn));
    if (prefs.activePage === 2) {
      const add = makeButton('＋ Add shortcut', icons.spark, () => {
        const label = window.prompt('Shortcut name'); if (!label) return;
        const choices = [['Presets', actions.home], ['API connection', actions.pay], ['Characters', actions.characters], ['World Info', actions.world], ['Backgrounds', actions.backgrounds], ['Extensions', actions.save], ['User settings', actions.settings]];
        const choice = choices.find(([name]) => name.toLowerCase() === label.toLowerCase());
        if (choice) { prefs.shortcuts.push(choice[0]); save(); renderPage(); }
      }); pageContent.appendChild(add);
      prefs.shortcuts.forEach((label, index) => {
        const choice = { Presets: actions.home, 'API connection': actions.pay, Characters: actions.characters, 'World Info': actions.world, Backgrounds: actions.backgrounds, Extensions: actions.save, 'User settings': actions.settings }[label];
        const b = makeButton(`${label}  ×`, icons.arrow, () => choice?.());
        b.draggable = true; b.title = '拖动排序；右键移除此快捷入口'; b.addEventListener('contextmenu', (e) => { e.preventDefault(); prefs.shortcuts.splice(index, 1); save(); renderPage(); });
        b.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', String(index)));
        b.addEventListener('dragover', (e) => e.preventDefault());
        b.addEventListener('drop', (e) => { e.preventDefault(); const from = Number(e.dataTransfer.getData('text/plain')); const [moved] = prefs.shortcuts.splice(from, 1); prefs.shortcuts.splice(index, 0, moved); save(); renderPage(); });
        pageContent.appendChild(b);
      });
    }
    wrap.dataset.page = String(prefs.activePage);
    const defaultInput = wrap.querySelector('.hsbc-default-page input');
    if (defaultInput) defaultInput.checked = prefs.defaultPage === prefs.activePage;
    row.querySelectorAll('[data-page]').forEach((button) => { button.setAttribute('aria-current', String(Number(button.dataset.page) === prefs.activePage)); });
  };
  [['‹', -1], ['1', 0], ['2', 1], ['3', 2], ['›', 1]].forEach(([label, delta]) => {
    const b = create('button', 'hsbc-page-button', label); b.type = 'button';
    if (label === '‹' || label === '›') b.setAttribute('aria-label', label === '‹' ? 'Previous shortcut page' : 'Next shortcut page');
    else { b.dataset.page = String(delta); b.title = pages[delta].title; }
    b.addEventListener('click', () => { prefs.activePage = label === '‹' || label === '›' ? (prefs.activePage + delta + 3) % 3 : delta; save(); renderPage(); }); row.appendChild(b);
  });
  const defaultLabel = create('label', 'hsbc-default-page', `<input type="checkbox"><span>设为默认页</span>`);
  defaultLabel.querySelector('input').addEventListener('change', (e) => { prefs.defaultPage = e.target.checked ? prefs.activePage : -1; save(); });
  wrap.append(row, defaultLabel, pageContent); renderPage(); return wrap;
}

function illustration(kind) {
  const shapes = {
    wallet: '<path d="M17 8V5H5v14h14v-3"/><path d="M4 8h14a2 2 0 0 1 2 2v6H9a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h11"/><circle cx="10" cy="13" r=".7"/>',
    chart: '<path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M14 3v7h7a9 9 0 0 0-7-7z"/><circle cx="8" cy="15" r="1"/>',
    umbrella: '<path d="M3 12a9 9 0 0 1 18 0z"/><path d="M12 12v7a2 2 0 0 0 4 0"/>',
    shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="m9 12 2 2 4-4"/>',
  };
  return `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#f3f4f6"/><g fill="none" stroke="#db0011" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${shapes[kind]}</g><path d="M5 34h14v7H5z" fill="#db0011" opacity=".9"/></svg>`;
}
function openLibrary() { const drawer = document.querySelector('.hsbc-library'); drawer?.classList.add('is-open'); document.body.classList.add('hsbc-library-open'); drawer?.querySelector('.hsbc-library-close')?.focus(); }
function closeLibrary() { document.querySelector('.hsbc-library')?.classList.remove('is-open'); document.body.classList.remove('hsbc-library-open'); }
function openCards() {
  actions.cards();
  const panel = document.querySelector('.hsbc-card-panel');
  panel?.classList.add('is-visible');
  window.setTimeout(renderPersonaCards, 180);
}
function renderPersonaCards() {
  const panel = document.querySelector('.hsbc-card-panel'); if (!panel?.classList.contains('is-visible')) return;
  const rail = panel.querySelector('.hsbc-card-rail');
  const personas = [...document.querySelectorAll('#user_avatar_block .avatar-container[data-avatar-id]')];
  if (!personas.length) { rail.innerHTML = '<div class="hsbc-card-empty">打开 Cards 后，此处会展示酒馆已有的 User 面具。</div>'; return; }
  rail.replaceChildren();
  const carousel = prefs.cardCarousel;
  personas.forEach((persona, index) => {
    if (carousel && index !== (Number(panel.dataset.index) || 0) % personas.length) return;
    const id = persona.dataset.avatarId;
    const name = persona.querySelector('.ch_name')?.textContent?.trim() || id;
    const image = prefs.cardImages[id] || persona.querySelector('img')?.src || '';
    const card = create('button', `hsbc-persona-card ${carousel ? 'hsbc-card-landscape' : 'hsbc-card-row'}`, `<img alt=""><span class="hsbc-card-type">${carousel ? 'HSBC DEBIT' : 'USER PERSONA'}</span><strong></strong><small></small>`);
    card.querySelector('img').src = image;
    card.type = 'button'; card.querySelector('strong').textContent = name; card.querySelector('small').textContent = `User persona · ${id}`;
    card.addEventListener('click', () => persona.click()); rail.appendChild(card);
  });
  const input = panel.querySelector('input[type=file]');
  input.onchange = () => {
    const file = input.files?.[0]; const id = personas[Number(panel.dataset.index) || 0]?.dataset.avatarId;
    if (!file || !id) return;
    const reader = new FileReader(); reader.onload = () => { prefs.cardImages[id] = reader.result; save(); renderPersonaCards(); }; reader.readAsDataURL(file);
    input.value = '';
  };
}
function makeCardPanel() {
  const panel = create('section', 'hsbc-card-panel'); panel.dataset.index = '0';
  panel.innerHTML = `<div class="hsbc-card-controls"><strong>Cards · User personas</strong><label><input class="hsbc-card-toggle" type="checkbox" ${prefs.cardCarousel ? 'checked' : ''}><span>卡片滑动</span></label><button class="hsbc-card-prev" type="button" aria-label="Previous persona">‹</button><button class="hsbc-card-next" type="button" aria-label="Next persona">›</button><label class="hsbc-card-upload">上传卡面<input type="file" accept="image/*" hidden></label></div><div class="hsbc-card-rail"></div>`;
  panel.querySelector('.hsbc-card-toggle').addEventListener('change', (e) => { prefs.cardCarousel = e.target.checked; save(); renderPersonaCards(); });
  const cycle = (step) => { const count = document.querySelectorAll('#user_avatar_block .avatar-container[data-avatar-id]').length || 1; panel.dataset.index = String((Number(panel.dataset.index) + step + count) % count); renderPersonaCards(); };
  panel.querySelector('.hsbc-card-prev').addEventListener('click', () => cycle(-1)); panel.querySelector('.hsbc-card-next').addEventListener('click', () => cycle(1));
  return panel;
}
function makeLibrary() {
  const shade = create('div', 'hsbc-library-shade'); shade.addEventListener('click', closeLibrary);
  const panel = create('aside', 'hsbc-library'); panel.setAttribute('aria-label', 'Library');
  const head = create('header', 'hsbc-library-head', `<button class="hsbc-library-back" aria-label="Home">${icons.back}</button><strong>Library</strong><span class="hsbc-head-spacer"></span><button aria-label="Notifications">${icons.bell}</button><button class="hsbc-library-user" aria-label="User settings">${icons.person}</button><button class="hsbc-library-close" aria-label="Close">${icons.close}</button>`);
  head.querySelector('.hsbc-library-back').addEventListener('click', closeLibrary); head.querySelector('.hsbc-library-user').addEventListener('click', actions.settings); head.querySelector('.hsbc-library-close').addEventListener('click', closeLibrary);
  const content = create('div', 'hsbc-library-content');
  const hero = makeButton('Products and services', `${icons.wallet}<span class="hsbc-illustration">${illustration('wallet')}</span>`, actions.characters, 'hsbc-library-hero');
  const grid = create('div', 'hsbc-library-grid');
  [['Money trends', 'chart', actions.world], ['Insurance', 'umbrella', actions.backgrounds], ['Security and fraud', 'shield', actions.advanced]].forEach(([title, icon, fn]) => grid.appendChild(makeButton(title, `${icons[icon]}<span class="hsbc-illustration">${illustration(icon)}</span>`, fn, 'hsbc-library-tile')));
  const more = create('div', 'hsbc-library-grid hsbc-library-grid-more');
  [['Pay', 'pay'], ['Cards', 'cards'], ['Save & Invest', 'save']].forEach(([title, icon]) => more.appendChild(makeButton(title, icons[icon], actions[icon], 'hsbc-library-mini')));
  const section = (title, labels) => { const s = create('section', 'hsbc-library-section'); s.innerHTML = `<h3>${title}</h3>`; labels.forEach((label) => { const b = create('button', 'hsbc-library-row', `<span>${label}</span>${icons.arrow}`); b.type = 'button'; s.appendChild(b); }); return s; };
  content.append(hero, grid, more, section('Your banking', ['Deposit a cheque', 'Deposit cash']), section('Keeping you safe', ['Online security', 'Protect your account', 'Fraud awareness']), section('Help', ['FAQs', 'Applications and requests', 'Your support needs', 'Secure messages', 'Chat with us']));
  const footer = create('footer', 'hsbc-library-footer', '<small>Version 1.0.0</small><button type="button">Log off</button>');
  panel.append(head, content, footer);
  const host = create('div', 'hsbc-library-host'); host.append(shade, panel); return host;
}

function mount() {
  if (!document.body || document.querySelector('.hsbc-nav')) return;
  document.body.classList.add('hsbc-tavern');
  const nav = makeNavigation(); document.body.prepend(nav);
  const chat = document.querySelector('#chat'); if (chat) { chat.before(makeChatTools()); chat.before(makeCardPanel()); }
  document.body.append(makeLibrary());
  const textarea = document.querySelector('#send_textarea'); if (textarea) { textarea.placeholder = 'Start chat'; textarea.setAttribute('aria-label', 'Start chat'); }
  const observer = new MutationObserver(() => { const area = document.querySelector('#send_textarea'); if (area && area.placeholder !== 'Start chat') area.placeholder = 'Start chat'; });
  observer.observe(document.body, { childList: true, subtree: true });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLibrary(); });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true }); else mount();
