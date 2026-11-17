const SPLASH_ID = 'hsbc-safe-splash';
const STYLE_ID = 'hsbc-safe-splash-style';

function greetingForCurrentTime() {
    const hour = new Date().getHours();
    if (hour < 5 || hour >= 18) return 'Good evening';
    if (hour < 12) return 'Good morning';
    return 'Good afternoon';
}

function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        #${SPLASH_ID} { position:fixed; inset:0; z-index:2147483646; display:flex; flex-direction:column; overflow:hidden; background:#fff; color:#222; font-family:Arial,"Noto Sans",sans-serif; transition:opacity .2s ease,visibility .2s ease; }
        #${SPLASH_ID}.is-leaving { opacity:0; visibility:hidden; pointer-events:none; }
        #${SPLASH_ID} .hsbc-safe-red { display:grid; place-items:center; flex:1 1 54%; min-height:210px; padding:32px; background:#db0011; }
        #${SPLASH_ID} .hsbc-safe-logo { display:block; width:min(42vw,250px); min-width:150px; }
        #${SPLASH_ID} .hsbc-safe-logo svg { display:block; width:100%; height:auto; }
        #${SPLASH_ID} .hsbc-safe-content { box-sizing:border-box; flex:1 1 46%; width:min(100%,620px); align-self:center; padding:30px clamp(24px,7vw,72px); background:#fff; }
        #${SPLASH_ID} .hsbc-safe-greeting { font-size:clamp(34px,5vw,52px); line-height:1.18; }
        #${SPLASH_ID} .hsbc-safe-greeting span { display:block; }
        #${SPLASH_ID} .hsbc-safe-label { margin:28px 0 14px; color:#5c6670; font-size:15px; }
        #${SPLASH_ID} .hsbc-safe-actions { display:grid; gap:14px; }
        #${SPLASH_ID} button { width:100%; min-height:52px; border:1px solid #44515c; background:#fff; color:#25313b; cursor:pointer; font:600 16px/1 Arial,"Noto Sans",sans-serif; }
        #${SPLASH_ID} button.hsbc-safe-primary { border-color:#db0011; background:#db0011; color:#fff; }
        #${SPLASH_ID} button.hsbc-safe-pin::before { content:'\\25A6'; display:inline-block; margin-right:12px; font-size:20px; line-height:0; vertical-align:-1px; }
        #${SPLASH_ID} button:focus-visible { outline:3px solid #222; outline-offset:3px; }
        @media (max-width:600px) { #${SPLASH_ID} .hsbc-safe-red { min-height:42vh; } #${SPLASH_ID} .hsbc-safe-logo { width:min(58vw,230px); min-width:0; } }
    `;
    document.head.append(style);
}

function dismissEmptyBlockingDialogs() {
    for (const dialog of document.querySelectorAll('dialog[open].popup.transparent_dialogue_popup')) {
        const hasContent = dialog.textContent.trim().length > 0
            || Boolean(dialog.querySelector('button,input,textarea,select,[contenteditable="true"],img,iframe,video,canvas'));
        if (!hasContent) dialog.close();
    }
}

function guardAgainstEmptyBlockingDialogs() {
    dismissEmptyBlockingDialogs();
    const observer = new MutationObserver(() => dismissEmptyBlockingDialogs());
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] });
}

function mountSplash() {
    if (!document.body || document.getElementById(SPLASH_ID)) return;
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.setProperty('display', 'none', 'important');
        loader.style.setProperty('visibility', 'hidden', 'important');
        loader.style.setProperty('pointer-events', 'none', 'important');
    }
    guardAgainstEmptyBlockingDialogs();
    installStyle();
    const screen = document.createElement('section');
    screen.id = SPLASH_ID;
    screen.tabIndex = -1;
    screen.setAttribute('aria-label', 'Welcome screen');
    screen.innerHTML = `
        <div class="hsbc-safe-red"><div class="hsbc-safe-logo" role="img" aria-label="HSBC"><svg viewBox="0 0 200 100" aria-hidden="true" focusable="false"><path fill="#fff" d="M48 0H152L200 50 152 100H48L0 50Z"/><path fill="#db0011" d="M48 0L100 50 48 100Z"/><path fill="#db0011" d="M152 0L100 50 152 100Z"/></svg></div></div>
        <div class="hsbc-safe-content"><div class="hsbc-safe-greeting"><span>${greetingForCurrentTime()}</span><span>User</span></div><div class="hsbc-safe-label">Log on with</div><div class="hsbc-safe-actions"><button class="hsbc-safe-primary" type="button">Biometrics</button><button class="hsbc-safe-pin" type="button">Mobile Banking PIN</button></div></div>
    `;
    let closed = false;
    const close = () => {
        if (closed) return;
        closed = true;
        screen.classList.add('is-leaving');
        window.setTimeout(() => screen.remove(), 220);
    };
    for (const button of screen.querySelectorAll('button')) button.addEventListener('click', close, { once: true });
    screen.addEventListener('pointerdown', close, { once: true });
    screen.addEventListener('keydown', event => {
        if (event.key === 'Escape' || event.key === 'Enter') close();
    });
    document.body.append(screen);
    screen.focus({ preventScroll: true });
    window.setTimeout(close, 5000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountSplash, { once: true });
} else {
    mountSplash();
}
