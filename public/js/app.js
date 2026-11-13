/* Sonnseite – ein sanfter Begleiter für Zuversicht und Resilienz.
   Alle Daten bleiben lokal auf dem Gerät (localStorage). Keine Server, kein Tracking. */
(function () {
  'use strict';

  const VERSION = '1.2.0';
  const I18N = window.I18N;
  const CONTENT = window.CONTENT;
  const LANGS = ['de', 'en', 'cs'];
  const LOCALES = { de: 'de-AT', en: 'en-GB', cs: 'cs-CZ' };

  /* ---------- kleine Helfer ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nl2br = (s) => esc(s).replace(/\n/g, '<br>');
  const pad = (n) => String(n).padStart(2, '0');
  const dkey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const daysBetween = (a, b) => Math.round((fromKey(b) - fromKey(a)) / 864e5);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const pickIdx = (len, k, salt) => hashStr(k + salt) % len;

  /* ---------- Speicher ---------- */
  const KEY = 'sonnseite.v1';
  function detectLang() { const l = (navigator.language || 'de').slice(0, 2).toLowerCase(); return LANGS.includes(l) ? l : 'de'; }
  function defaults() {
    return {
      v: 1,
      settings: { lang: detectLang(), name: '', themes: [], fontScale: 1, theme: 'evening', morningTime: '07:30', eveningTime: '20:30', hints: true, onboarded: false, startDate: dkey(), programShift: 0, audio: audioDefaults() },
      days: {}, journal: [], weekly: [], exercises: [], favs: []
    };
  }
  function audioDefaults() { return { voice: true, voiceURI: {}, pitch: null, rate: 0.85, voiceVol: 1, music: true, musicVol: 0.5 }; }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const d = JSON.parse(raw); const def = defaults(); const st = Object.assign(def.settings, d.settings || {}); st.audio = Object.assign(audioDefaults(), st.audio || {}); return Object.assign(def, d, { settings: st }); }
    } catch (e) { /* ignore */ }
    return defaults();
  }
  let S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast(t('saveError')); } }
  const dayData = (k) => S.days[k] || {};
  function setDay(k, part, val) { S.days[k] = S.days[k] || {}; S.days[k][part] = val; save(); }

  /* ---------- Sprache ---------- */
  const L = () => S.settings.lang;
  function t(k, vars) {
    let s = (I18N[L()] && I18N[L()][k]) != null ? I18N[L()][k] : (I18N.de[k] != null ? I18N.de[k] : k);
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, v) => (vars[v] != null ? vars[v] : ''));
    return s;
  }
  const C = () => CONTENT[L()] || CONTENT.de;
  const fmtDate = (d, opt) => new Intl.DateTimeFormat(LOCALES[L()], opt || { weekday: 'long', day: 'numeric', month: 'long' }).format(d);

  /* ---------- Icons (feine, abgerundete Linien) ---------- */
  const P = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    moon: '<path d="M19.5 14.5A7.5 7.5 0 1 1 9.5 4.5a6 6 0 0 0 10 10z"/>',
    leaf: '<path d="M5 19c0-8.5 5.5-13.5 14-14 0 9-5.5 14-13.5 14"/><path d="M5 19l7.5-7.5"/>',
    sprout: '<path d="M12 21v-8.5"/><path d="M12 12.5C12 9 9.8 7 5.5 7c0 3.4 2.2 5.5 6.5 5.5z"/><path d="M12 10.5c0-3.5 2.2-5.5 6.5-5.5 0 3.4-2.2 5.5-6.5 5.5z"/>',
    feather: '<path d="M19.5 4.5c-6.5 0-12 5-12 12v3"/><path d="M7.5 16.5h6.5c3.5-3 5.5-7 5.5-12"/><path d="M9.5 12.5h7"/>',
    path: '<path d="M5 20.5c0-4 3.5-4.5 7-6.5s3-6 7-6.5"/><circle cx="19" cy="5" r="1.6"/><circle cx="5" cy="20.5" r="1.1"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>',
    sliders: '<path d="M4 7.5h9M17 7.5h3M4 16.5h3M11 16.5h9"/><circle cx="15" cy="7.5" r="2"/><circle cx="9" cy="16.5" r="2"/>',
    wind: '<path d="M3 9h11a3 3 0 1 0-3-3"/><path d="M3 15h15a3 3 0 1 1-3 3"/><path d="M3 12h7"/>',
    compass: '<circle cx="12" cy="12" r="8.5"/><path d="M15.2 8.8l-2 4.4-4.4 2 2-4.4z"/>',
    flower: '<circle cx="12" cy="11" r="2"/><path d="M12 9c-1.8-2.8-.8-5.5 0-5.5s1.8 2.7 0 5.5zM14 11c2.8-1.8 5.5-.8 5.5 0s-2.7 1.8-5.5 0zM12 13c1.8 2.8.8 5.5 0 5.5s-1.8-2.7 0-5.5zM10 11c-2.8 1.8-5.5.8-5.5 0s2.7-1.8 5.5 0z"/><path d="M12 18.5V21"/>',
    arrowLeft: '<path d="M14.5 5.5L8 12l6.5 6.5"/>',
    arrowRight: '<path d="M9.5 5.5L16 12l-6.5 6.5"/>',
    close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/>',
    download: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14"/>',
    upload: '<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 20h14"/>',
    calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="3"/><path d="M4 10h16M9 3.5v4M15 3.5v4"/>',
    play: '<path d="M8.5 6v12l9.5-6z"/>',
    pause: '<path d="M9 6v12M15 6v12"/>',
    phone: '<path d="M7 3.5h2.5l1.5 4.5-2 1.3a11 11 0 0 0 5.7 5.7l1.3-2 4.5 1.5V17a2.5 2.5 0 0 1-2.5 2.5A15 15 0 0 1 4.5 6 2.5 2.5 0 0 1 7 3.5z"/>',
    star: '<path d="M12 4l2.3 4.8 5.2.7-3.8 3.6.9 5.2L12 15.8l-4.6 2.5.9-5.2-3.8-3.6 5.2-.7z"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5s1-5.9 3.5-8.5z"/>',
    sun_cloud: '<path d="M8 3v1.5M3 8h1.5M4.6 4.6l1 1M11.4 4.6l-1 1"/><path d="M5.3 10.5a3 3 0 0 1 5.3-3"/><path d="M9 19.5h8a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.4 1.3A2.9 2.9 0 0 0 9 19.5z"/>',
    cloud: '<path d="M7 18.5h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.4 1.5A3.4 3.4 0 0 0 7 18.5z"/>',
    rain: '<path d="M7 15h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.4 1.5A3.4 3.4 0 0 0 7 15z"/><path d="M9 18l-.8 2M13 18l-.8 2M17 18l-.8 2"/>',
    speaker: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    speakerOff: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
    music: '<path d="M9 17.5V6l10-2v11.5"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="15.5" r="2.5"/>',
    musicOff: '<path d="M9 17.5V6l10-2v11.5"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="15.5" r="2.5"/><path d="M3.5 3.5l17 17"/>',
    storm: '<path d="M7 15h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.4 1.5A3.4 3.4 0 0 0 7 15z"/><path d="M12.5 15.5l-2 3h3l-2 3"/>'
  };
  const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${P[n] || ''}</svg>`;
  const MOODI = ['storm', 'rain', 'cloud', 'sun_cloud', 'sun'];
  const TYPEI = { breath: 'wind', guided: 'leaf', write: 'feather' };

  /* ---------- Ansicht, Navigation, Aktionen ---------- */
  let actions = {};
  let cleanups = [];
  const act = (m) => { actions = m; };
  const onCleanup = (f) => cleanups.push(f);
  function cleanup() { cleanups.forEach((f) => { try { f(); } catch (e) { /* */ } }); cleanups = []; }
  function later(fn, ms) { const id = setTimeout(fn, ms); onCleanup(() => clearTimeout(id)); return id; }

  function view(html, opt = {}) {
    document.body.classList.toggle('in-flow', !!opt.flow);
    const v = $('#view');
    v.innerHTML = html;
    $$('.tabbar a').forEach((a) => a.classList.toggle('on', a.dataset.tab === opt.tab));
    window.scrollTo(0, 0);
    const h = $('h1', v);
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }
  function go(p) { if (location.hash === '#' + p) route(); else location.hash = '#' + p; }

  let toastT;
  function toast(msg) {
    const el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2600);
  }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act],[data-go]');
    if (!el) return;
    if (el.dataset.go) { e.preventDefault(); go(el.dataset.go); return; }
    const a = el.dataset.act;
    if (a === 'pick') {
      const g = el.closest('[data-pick-group]');
      $$('[data-act="pick"]', g).forEach((b) => { b.classList.toggle('on', b === el); b.setAttribute('aria-checked', String(b === el)); });
      g.dataset.value = el.dataset.v;
      g.dispatchEvent(new CustomEvent('picked', { detail: el.dataset.v }));
      return;
    }
    if (a === 'chip') { el.classList.toggle('on'); el.setAttribute('aria-pressed', String(el.classList.contains('on'))); return; }
    if (a === 'fav') { toggleFav(+el.dataset.i, el); return; }
    if (actions[a]) { e.preventDefault(); actions[a](el, e); }
  });

  /* ---------- Darstellung ---------- */
  function applyTheme() {
    const s = S.settings;
    const sys = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
    const h = new Date().getHours();
    let dark;
    if (s.theme === 'light') dark = false;
    else if (s.theme === 'dark') dark = true;
    else if (s.theme === 'auto') dark = sys;
    else dark = sys || h >= 20 || h < 6; // "evening": abends automatisch warm-dunkel
    const r = document.documentElement;
    r.dataset.theme = dark ? 'dark' : 'light';
    r.style.fontSize = (s.fontScale * 100) + '%';
    r.lang = L();
    const m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', dark ? '#221b17' : '#faf5ee');
  }

  /* ---------- Stimme & Klang ---------- */
  const AU = window.SonnAudio;
  const AS = () => S.settings.audio;
  function syncAudio() { const a = AS(); AU.configure({ lang: L(), voice: a.voice, voiceURI: (a.voiceURI || {})[L()] || '', pitch: a.pitch, rate: a.rate, voiceVol: a.voiceVol, music: a.music, musicVol: a.musicVol }); }
  const waitMs = (ms) => new Promise((r) => later(r, ms));
  function audioBar() {
    const a = AS();
    return `<div class="audio-bar" role="group" aria-label="${esc(t('audioTitle'))}">
      <button class="pill ${a.voice ? 'on' : ''}" data-act="tvoice" aria-pressed="${a.voice}">${ic(a.voice ? 'speaker' : 'speakerOff')} ${esc(t('voiceShort'))}</button>
      <button class="pill ${a.music ? 'on' : ''}" data-act="tmusic" aria-pressed="${a.music}">${ic(a.music ? 'music' : 'musicOff')} ${esc(t('musicShort'))}</button></div>`;
  }
  function audioToggles(onChange) {
    const upd = (key, el) => {
      AS()[key] = !AS()[key]; save(); syncAudio();
      el.classList.toggle('on', AS()[key]); el.setAttribute('aria-pressed', String(AS()[key]));
      el.innerHTML = key === 'voice' ? ic(AS().voice ? 'speaker' : 'speakerOff') + ' ' + esc(t('voiceShort')) : ic(AS().music ? 'music' : 'musicOff') + ' ' + esc(t('musicShort'));
      if (key === 'voice' && !AS().voice) AU.stopSpeech();
      if (onChange) onChange(key);
    };
    return { tvoice: (el) => upd('voice', el), tmusic: (el) => upd('music', el) };
  }

  function renderChrome() {
    $('#brand-name').textContent = 'Sonnseite';
    const tabs = { home: ['/', 'sun', t('tabToday')], ex: ['/exercises', 'leaf', t('tabExercises')], journal: ['/journal', 'feather', t('tabJournal')], path: ['/path', 'path', t('tabPath')] };
    $('#tabbar').innerHTML = Object.entries(tabs).map(([k, [h, i, l]]) => `<a href="#${h}" data-tab="${k}">${ic(i)}<span>${esc(l)}</span></a>`).join('');
    $('#btn-help').setAttribute('aria-label', t('help'));
    $('#btn-help').innerHTML = ic('heart') + `<span>${esc(t('helpShort'))}</span>`;
    $('#btn-settings').setAttribute('aria-label', t('settings'));
    $('#btn-settings').innerHTML = ic('sliders');
  }

  /* ---------- Inhalte des Tages ---------- */
  function programIndex(k = dkey()) {
    const w = Math.floor(Math.max(0, daysBetween(S.settings.startDate, k)) / 7);
    return (((w + S.settings.programShift) % 8) + 8) % 8;
  }
  /* Impulse wechseln: täglich (Morgen/Abend), wöchentlich (Check-up), alle 8 Wochen (Wochenthema) */
  const dayNum = (k = dkey()) => Math.round(fromKey(k).getTime() / 864e5);
  const weekIdx = () => Math.floor(Math.max(0, daysBetween(S.settings.startDate, dkey())) / 7);
  const hint = (arr, n) => (arr && arr.length ? arr[((n % arr.length) + arr.length) % arr.length] : '');
  const weekNumber = () => Math.floor(Math.max(0, daysBetween(S.settings.startDate, dkey())) / 7) + 1;

  function dailyAffIndex(k = dkey()) {
    const list = C().affirmations;
    const r = rng(hashStr(k + 'aff'));
    const tagged = [], general = [];
    list.forEach((a, i) => { if (!a.tag) general.push(i); else if (S.settings.themes.includes(a.tag)) tagged.push(i); });
    const pool = tagged.length && r() < 0.4 ? tagged : general;
    return pool[Math.floor(r() * pool.length)];
  }
  function greeting() {
    const h = new Date().getHours();
    const g = h < 11 ? t('goodMorning') : h < 17 ? t('goodDay') : t('goodEvening');
    return S.settings.name ? `${g}, ${S.settings.name}` : g;
  }
  function growth() {
    let n = 0;
    Object.values(S.days).forEach((d) => { if (d.morning && d.morning.done) n++; if (d.evening && d.evening.done) n++; });
    return n + S.journal.length + S.exercises.length + S.weekly.length * 2;
  }
  function weeklyDue() {
    const last = S.weekly[S.weekly.length - 1];
    if (!last) return daysBetween(S.settings.startDate, dkey()) >= 5;
    return (Date.now() - last.ts) / 864e5 >= 6;
  }

  function toggleFav(i, el) {
    const f = S.favs; const at = f.indexOf(i);
    if (at >= 0) f.splice(at, 1); else f.push(i);
    save();
    const on = at < 0;
    if (el) { el.classList.toggle('on', on); el.setAttribute('aria-pressed', String(on)); }
    toast(on ? t('favAdded') : t('favRemoved'));
  }
  function affCard(i, big) {
    const a = C().affirmations[i]; if (!a) return '';
    const on = S.favs.includes(i);
    return `<figure class="aff ${big ? 'big' : ''}"><span class="aff-mark" aria-hidden="true">${ic('sprout')}</span><blockquote>${esc(a.t)}</blockquote>
      <button class="fav ${on ? 'on' : ''}" data-act="fav" data-i="${i}" aria-pressed="${on}" aria-label="${esc(t('favToggle'))}">${ic('heart')}</button></figure>`;
  }

  /* ---------- Bausteine ---------- */
  function moodPicker(v, label) {
    return `<div class="moods" data-pick-group="mood" data-value="${v || ''}" role="radiogroup" aria-label="${esc(label || t('moodQ'))}">${[1, 2, 3, 4, 5].map((i) => `
      <button type="button" class="mood ${v == i ? 'on' : ''}" data-act="pick" data-v="${i}" role="radio" aria-checked="${v == i}">${ic(MOODI[i - 1])}<span>${esc(C().moods[i - 1])}</span></button>`).join('')}</div>`;
  }
  const readPick = (el) => { const g = $('[data-pick-group]', el); return g && g.dataset.value ? +g.dataset.value : null; };

  /* Sonnenauf- und -untergang für Wien (NOAA-Näherung, ±2 Min.), in Minuten nach lokaler Mitternacht */
  function sunTimes(d = new Date(), lat = 48.21, lon = 16.37) {
    const rad = Math.PI / 180;
    const N = Math.floor((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(d.getFullYear(), 0, 0)) / 864e5);
    const g = 2 * Math.PI / 365 * (N - 0.5);
    const eqt = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
    const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
    const ha = Math.acos(Math.cos(90.833 * rad) / (Math.cos(lat * rad) * Math.cos(decl)) - Math.tan(lat * rad) * Math.tan(decl)) / rad;
    const tz = -d.getTimezoneOffset();
    return { rise: 720 - 4 * (lon + ha) - eqt + tz, set: 720 - 4 * (lon - ha) - eqt + tz };
  }
  /* Tageszeit für den Garten-Himmel: Morgenröte, Tag, Abendrot, Nacht */
  function dayPhase(d = new Date()) {
    const m = d.getHours() * 60 + d.getMinutes(); const { rise, set } = sunTimes(d);
    if (m >= rise - 30 && m < rise + 75) return 'dawn';
    if (m >= rise + 75 && m < set - 60) return 'day';
    if (m >= set - 60 && m < set + 35) return 'dusk';
    return 'night';
  }
  const SKY = {
    dawn: { s1: '#f6d9c8', s2: '#fbeee2', hill1: '#c3cfb2', hill2: '#dde2cb', stem: '#8aa07c' },
    day: { s1: '#bfdcec', s2: '#e9f3f3', hill1: '#b9cfa4', hill2: '#d6e2c4', stem: '#7f9a6f' },
    dusk: { s1: '#e8b9a8', s2: '#f6dcc4', hill1: '#a9b994', hill2: '#c9d0b2', stem: '#7f9470' },
    night: { s1: '#2c3150', s2: '#4a4560', hill1: '#46543f', hill2: '#3a4535', stem: '#7d9370' }
  };
  let gid = 0;
  /* Der Garten wächst mit jedem Moment der Selbstfürsorge – und welkt nie. Der Himmel folgt der Tageszeit. */
  function garden(n, H = 150) {
    const W = 360; const r = rng(7); const phase = dayPhase(); const c = SKY[phase]; const id = 'gs' + (++gid);
    const cols = ['#e0aea6', '#ddb064', '#c3b2cf', '#c98467', '#f4e4c8'];
    const plants = [];
    const max = Math.min(n, 60);
    for (let i = 0; i < max; i++) {
      const x = 16 + r() * (W - 32); const y = H - 14 - r() * 26; const type = Math.floor(r() * 5); const col = cols[Math.floor(r() * cols.length)]; const sz = 0.75 + r() * 0.45;
      plants.push({ x, y, type, col, sz });
    }
    plants.sort((a, b) => a.y - b.y);
    const stem = c.stem; const dim = phase === 'night' ? ' opacity=".82"' : '';
    const draw = (p) => {
      const s = p.sz; const h = 22 * s;
      const g = `<g transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})"${dim}>`;
      switch (p.type) {
        case 0: return g + `<path d="M0 0v${-h}" stroke="${stem}" stroke-width="1.6" stroke-linecap="round"/><path d="M0 ${-h * .45}c-5-1-8-4-8-8 4 0 7 3 8 8z" fill="${stem}" opacity=".8"/>` + [0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="${-4 * s}" rx="${2.6 * s}" ry="${4.4 * s}" fill="${p.col}" transform="translate(0 ${-h}) rotate(${a})"/>`).join('') + `<circle cy="${-h}" r="${2.2 * s}" fill="#ddb064"/></g>`;
        case 1: return g + `<path d="M0 0v${-h}" stroke="${stem}" stroke-width="1.6" stroke-linecap="round"/><path d="M0 ${-h * .3}c4-2 8-2 10-6-4-1-8 1-10 6z" fill="${stem}" opacity=".8"/><path d="M${-5 * s} ${-h}c0 ${-8 * s} ${10 * s} ${-8 * s} ${10 * s} 0 0 ${4 * s}-${2.5 * s} ${6 * s}-${5 * s} ${6 * s}s-${5 * s}-${2 * s}-${5 * s}-${6 * s}z" fill="${p.col}"/></g>`;
        case 2: return g + `<path d="M0 0c-1-6-6-10-9-11M0 0c0-8 1-13 0-17M0 0c1-6 6-10 9-12" stroke="${stem}" stroke-width="1.5" fill="none" stroke-linecap="round" transform="scale(${s})"/></g>`;
        case 3: return g + `<path d="M0 0v${-h * .9}" stroke="${stem}" stroke-width="1.5" stroke-linecap="round"/>` + [0.35, 0.55, 0.75].map((f, j) => `<circle cx="${(j % 2 ? 3 : -3) * s}" cy="${-h * f}" r="${2.4 * s}" fill="${p.col}"/>`).join('') + `<circle cy="${-h * .92}" r="${2.2 * s}" fill="${p.col}"/></g>`;
        default: return g + `<path d="M0 0v${-h * .6}" stroke="${stem}" stroke-width="1.6" stroke-linecap="round"/><path d="M0 ${-h * .6}c-7-1-9-7-8-11 5 1 8 5 8 11zM0 ${-h * .6}c6-2 8-8 7-12-5 2-7 6-7 12z" fill="${stem}" opacity=".9"/></g>`;
      }
    };
    let sky = '';
    if (phase === 'day') {
      sky = `<circle cx="${W - 58}" cy="38" r="30" fill="#fbe3a6" opacity=".35"/><circle cx="${W - 58}" cy="38" r="15" fill="#f6c76e"/>` +
        [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path d="M0 -22v-7" stroke="#f0b95c" stroke-width="2" stroke-linecap="round" transform="translate(${W - 58} 38) rotate(${a})"/>`).join('') +
        `<g fill="#fff" opacity=".85"><ellipse cx="70" cy="34" rx="26" ry="9"/><ellipse cx="88" cy="28" rx="16" ry="9"/><ellipse cx="190" cy="50" rx="20" ry="6"/></g>`;
    } else if (phase === 'dawn') {
      sky = `<circle cx="70" cy="${H - 58}" r="34" fill="#f8cf9a" opacity=".3"/><circle cx="70" cy="${H - 58}" r="17" fill="#f3b77c"/>`;
    } else if (phase === 'dusk') {
      sky = `<circle cx="${W - 80}" cy="${H - 56}" r="38" fill="#f2a98a" opacity=".3"/><circle cx="${W - 80}" cy="${H - 56}" r="18" fill="#ec9a72"/>`;
    } else {
      const rs = rng(3);
      sky = Array.from({ length: 22 }, () => `<circle cx="${(rs() * W).toFixed(0)}" cy="${(8 + rs() * (H - 80)).toFixed(0)}" r="${(0.6 + rs() * 1.1).toFixed(1)}" fill="#fff" opacity="${(0.4 + rs() * 0.5).toFixed(2)}"/>`).join('') +
        `<circle cx="${W - 58}" cy="38" r="26" fill="#f1e3c0" opacity=".12"/><path d="M${W - 52} 22a16 16 0 1 0 10 28a13 13 0 1 1 -10 -28z" fill="#f1e3c0"/>`;
    }
    const seed = n === 0 ? `<g transform="translate(${W / 2} ${H - 22})"><ellipse rx="5" ry="3.5" fill="#c98467" opacity=".7"/><path d="M0 -3c0-5 3-7 6-8" stroke="${stem}" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>` : '';
    return `<svg class="garden" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t('gardenAria', { n }))}">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.s1}"/><stop offset="1" stop-color="${c.s2}"/></linearGradient></defs>
      <rect width="${W}" height="${H}" rx="20" fill="url(#${id})"/>${sky}
      <path d="M0 ${H - 44}Q90 ${H - 66} 180 ${H - 48}T360 ${H - 52}V${H}H0Z" fill="${c.hill2}"/>
      <path d="M0 ${H - 28}Q120 ${H - 46} 230 ${H - 30}T360 ${H - 32}V${H}H0Z" fill="${c.hill1}"/>
      ${plants.map(draw).join('')}${seed}</svg>`;
  }
  const gardenCaption = (n) => t(n === 1 ? 'gardenCaption1' : 'gardenCaption', { n });

  function closeScreen(msg, mood) {
    return `<div class="close-screen">${garden(growth(), 140)}<h1>${esc(t('thanks'))}</h1><p class="lead">${esc(msg)}</p>
      ${mood && mood <= 1 ? `<p class="note soft">${esc(t('lowMoodClose'))} <a href="#/help">${esc(t('helpLink'))}</a></p>` : ''}</div>`;
  }

  /* ---------- Rückmeldungen (regelbasiert, lokal) ---------- */
  function analyze(text, mood) {
    const fb = C().feedback;
    const norm = ' ' + String(text || '').toLowerCase() + ' ';
    const scores = {};
    Object.entries(fb.cats).forEach(([cat, def]) => {
      let n = 0;
      def.keys.forEach((k) => {
        const hit = fb.wordStart ? new RegExp('(^|[^\\p{L}])' + escRe(k), 'u').test(norm) : norm.includes(k);
        if (hit) n++;
      });
      if (n) scores[cat] = n;
    });
    if (scores.crisis) return { cat: 'crisis', ri: 0, qi: 0 };
    let best = null;
    fb.order.forEach((c) => { if (scores[c] && (!best || scores[c] > scores[best])) best = c; });
    const cat = best || (!mood ? 'mid' : mood <= 2 ? 'low' : mood >= 4 ? 'high' : 'mid');
    const r = Math.floor(Math.random() * 1e6);
    return { cat, ri: r % 7, qi: (r >> 4) % 7 };
  }
  function crisisCard() {
    const h = C().help;
    return `<div class="card crisis" role="alert"><h2>${ic('heart')} ${esc(t('crisisTitle'))}</h2><p>${esc(C().feedback.crisisText)}</p>
      <div class="call-row"><a class="btn primary" href="tel:142">${ic('phone')} 142 · ${esc(h.ts)}</a><a class="btn soft" href="tel:+43131330">${ic('phone')} 01 31330 · PSD</a><a class="btn soft" href="tel:144">${ic('phone')} 144 · ${esc(h.rescue)}</a></div>
      <a class="link" href="#/help">${esc(t('allHelp'))} ${ic('arrowRight')}</a></div>`;
  }
  function feedbackCard(f, opt = {}) {
    if (!f) return '';
    if (f.cat === 'crisis') return crisisCard();
    const fb = C().feedback; const d = fb.cats[f.cat] || fb.mood[f.cat]; if (!d) return '';
    const reply = d.replies[f.ri % d.replies.length]; const q = d.questions[f.qi % d.questions.length]; const ex = C().exercises[d.ex];
    return `<div class="card feedback"><p class="eyebrow">${ic('sprout')} ${esc(t('feedbackTitle'))}</p><p>${esc(reply)}</p>
      <p class="q">${esc(q)}</p>
      ${opt.answer ? `<textarea id="f-follow" rows="3" placeholder="${esc(t('followPh'))}">${esc(opt.value || '')}</textarea>${opt.saveBtn ? `<button class="btn soft" data-act="saveFollow">${esc(t('saveAnswer'))}</button>` : ''}` : ''}
      ${ex ? `<a class="link" href="#/ex/${d.ex}">${ic(TYPEI[ex.type])} ${esc(t('tryExercise'))}: ${esc(ex.title)}</a>` : ''}
      <p class="tiny">${esc(t('feedbackNote'))}</p></div>`;
  }

  /* ---------- Geführte Abläufe (Morgen, Abend, Woche) ---------- */
  function flow(cfg) {
    let i = 0;
    const data = cfg.data;
    const ok = (j) => !cfg.steps[j].when || cfg.steps[j].when(data);
    function draw() {
      cleanup();
      const st = cfg.steps[i];
      const vis = cfg.steps.filter((s, j) => ok(j));
      const pos = vis.indexOf(st);
      const last = i === cfg.steps.length - 1;
      view(`<section class="flow ${cfg.cls || ''}">
        <div class="flow-top">
          <button class="icon-btn" data-act="fback" aria-label="${esc(t('back'))}" ${i === 0 ? 'hidden' : ''}>${ic('arrowLeft')}</button>
          <div class="dots" aria-label="${esc(t('stepOf', { a: pos + 1, b: vis.length }))}">${vis.map((s, j) => `<span class="${j <= pos ? 'on' : ''}"></span>`).join('')}</div>
          <button class="icon-btn" data-act="fclose" aria-label="${esc(t('close'))}">${ic('close')}</button>
        </div>
        <div class="flow-body">${st.render(data)}</div>
        <div class="flow-actions">${st.skip ? `<button class="btn ghost" data-act="fskip">${esc(t('skip'))}</button>` : ''}${st.noNext ? '' : `<button class="btn primary" data-act="fnext">${esc(st.next || (last ? t('toHome') : t('next')))}</button>`}</div>
      </section>`, { flow: true });
      act({
        fback: () => { collect(); let j = i - 1; while (j > 0 && !ok(j)) j--; if (j >= 0) { i = j; draw(); } },
        fclose: () => { collect(); cleanup(); cfg.exit ? cfg.exit(data) : go('/'); },
        fnext: () => { collect(); if (st.validate && !st.validate(data)) return; if (st.onNext) st.onNext(data); next(); },
        fskip: () => { if (st.onNext) st.onNext(data); next(); }
      });
      if (st.mount) st.mount($('#view'), data);
    }
    function collect() { const st = cfg.steps[i]; if (st.collect) st.collect($('#view'), data); }
    function next() {
      let j = i + 1; while (j < cfg.steps.length && !ok(j)) j++;
      if (j < cfg.steps.length) { i = j; draw(); } else { cleanup(); cfg.done ? cfg.done(data) : go('/'); }
    }
    cfg.api = { next: () => actions.fnext && actions.fnext() };
    draw();
    return cfg.api;
  }

  /* Mini-Atemübung für den Morgen: drei ruhige Atemzüge (4 ein, 6 aus) */
  function miniBreath() {
    return `<div class="breath mini"><div class="breath-wrap"><div class="breath-circle" id="bc"></div><div class="breath-label" id="bl">${esc(t('ready'))}</div></div>
      <button class="btn soft" data-act="mbstart">${ic('play')} ${esc(t('threeBreaths'))}</button></div>`;
  }
  function runBreath(pattern, cycles, onPhase, onEnd) {
    const names = ['inhale', 'hold', 'exhale', 'hold'];
    let c = 0, ph = 0, stopped = false;
    const step = () => {
      if (stopped) return;
      while (pattern[ph] === 0) { ph = (ph + 1) % 4; if (ph === 0) c++; }
      if (c >= cycles) { onEnd && onEnd(); return; }
      onPhase(names[ph], pattern[ph], ph, c);
      later(() => { ph = (ph + 1) % 4; if (ph === 0) c++; step(); }, pattern[ph] * 1000);
    };
    step();
    return () => { stopped = true; };
  }
  function setCircle(phase, secs, ph) {
    const bc = $('#bc'), bl = $('#bl'); if (!bc) return;
    bc.style.transitionDuration = secs + 's';
    if (ph === 0) bc.classList.add('grow'); else if (ph === 2) bc.classList.remove('grow');
    bl.textContent = t(phase);
  }
  /* Atem-Hinweise: in den ersten Zyklen gesprochen, danach nur noch leise Töne */
  function cueBreath(spokenCycles) {
    return (phase, secs, ph, c) => {
      setCircle(phase, secs, ph);
      if (AS().voice && c < spokenCycles) AU.speak(t(phase), { rate: 0.8 });
      else if (ph === 0) AU.bell('in'); else if (ph === 2) AU.bell('out');
    };
  }

  /* ---------- Startseite ---------- */
  function viewHome() {
    const k = dkey(); const d = dayData(k); const h = new Date().getHours();
    const m = d.morning || {}, e = d.evening || {};
    const pi = programIndex(k); const prog = C().program[pi];
    const exId = prog.exercises[pickIdx(prog.exercises.length, k, 'pex')]; const ex = C().exercises[exId];
    const eveningFirst = h >= 16;
    const mCard = `<a class="card ritual ${!m.done && !eveningFirst ? 'now' : ''} ${m.done ? 'done' : ''}" href="#/morning">
        <span class="ritual-ic sun">${ic('sun')}</span><span class="ritual-tx"><strong>${esc(t('morningTitle'))}</strong>
        <small>${m.done ? esc(t('doneToday')) + (m.intention ? ' · „' + esc(m.intention.slice(0, 60)) + (m.intention.length > 60 ? '…' : '') + '“' : '') : esc(t('morningSub'))}</small></span>
        <span class="ritual-go">${m.done ? ic('check') : ic('arrowRight')}</span></a>`;
    const eCard = `<a class="card ritual ${!e.done && eveningFirst ? 'now' : ''} ${e.done ? 'done' : ''}" href="#/evening">
        <span class="ritual-ic moon">${ic('moon')}</span><span class="ritual-tx"><strong>${esc(t('eveningTitle'))}</strong>
        <small>${e.done ? esc(t('doneToday')) : esc(t('eveningSub'))}</small></span>
        <span class="ritual-go">${e.done ? ic('check') : ic('arrowRight')}</span></a>`;
    let hint = '';
    if (S.settings.hints) {
      if (!m.done && h >= 5 && h < 12) hint = t('hintMorning');
      else if (!e.done && h >= 18) hint = t('hintEvening');
    }
    view(`<section class="page home">
      <p class="date">${esc(fmtDate(new Date()))}</p>
      <h1>${esc(greeting())}</h1>
      ${hint ? `<p class="hint">${ic('sprout')} ${esc(hint)}</p>` : ''}
      <p class="section-label">${esc(t('thoughtOfDay'))}</p>
      ${affCard(dailyAffIndex(k))}
      <div class="rituals">${eveningFirst ? eCard + mCard : mCard + eCard}</div>
      ${weeklyDue() ? `<a class="card weekly-cta" href="#/weekly"><span class="ritual-ic">${ic('compass')}</span><span class="ritual-tx"><strong>${esc(t('weeklyTitle'))}</strong><small>${esc(t('weeklyDue'))}</small></span><span class="ritual-go">${ic('arrowRight')}</span></a>` : ''}
      <div class="card program">
        <p class="eyebrow">${esc(t('weekTheme', { n: weekNumber() }))}</p>
        <h2>${esc(prog.title)}</h2><p>${esc(prog.intro)}</p>
        <a class="mini-ex" href="#/ex/${exId}">${ic(TYPEI[ex.type])}<span><strong>${esc(t('exToday'))}: ${esc(ex.title)}</strong><small>${esc(ex.short)} · ${ex.minutes} ${esc(t('min'))}</small></span>${ic('arrowRight')}</a>
      </div>
      <a class="garden-link" href="#/path">${garden(growth(), 120)}<span>${esc(gardenCaption(growth()))}</span></a>
    </section>`, { tab: 'home' });
    act({});
  }

  /* ---------- Morgenmoment ---------- */
  function viewMorning() {
    const k = dkey(); const prev = dayData(k).morning || {};
    const qi = pickIdx(C().morningQuestions.length, k, 'mq'); const ai = dailyAffIndex(k);
    const data = { mood: prev.mood, intention: prev.intention || '', lookForward: prev.lookForward || '' };
    const store = (done) => setDay(k, 'morning', Object.assign({}, dayData(k).morning, data, { qi, ai, done, ts: Date.now() }));
    let stopB = null;
    flow({
      data,
      steps: [
        { render: (d) => `<p class="eyebrow">${ic('sun')} ${esc(t('morningTitle'))}</p><h1>${esc(greeting())}</h1><p class="lead">${esc(t('moodQ'))}</p>${moodPicker(d.mood)}<p class="tiny center">${esc(t('moodHint'))}</p>`,
          collect: (el, d) => { d.mood = readPick(el) || d.mood; } },
        { skip: true, render: (d) => `${d.mood && d.mood <= 2 ? `<p class="note soft">${esc(t('lowMoodMorning'))}</p>` : ''}<h1>${esc(t('arriveTitle'))}</h1><p class="lead">${esc(t('arriveText'))}</p>${miniBreath()}`,
          mount: () => { onCleanup(() => AU.stopSpeech()); actions.mbstart = (btn) => { btn.disabled = true; AU.unlock(); syncAudio(); if (stopB) stopB(); stopB = runBreath([4, 0, 6, 0], 3, cueBreath(3), () => { $('#bl').textContent = t('wellDone'); AU.bell('end'); AU.speak(t('wellDone')); btn.disabled = false; }); }; } },
        { render: () => `<h1>${esc(t('thoughtTitle'))}</h1>${affCard(ai, true)}<p class="muted">${esc(t('thoughtText'))}</p>` },
        { render: (d) => `<p class="eyebrow">${esc(t('intentionLabel'))}</p><h1>${esc(C().morningQuestions[qi])}</h1><textarea id="f-int" rows="4" placeholder="${esc(hint((C().morningHints || [])[qi], dayNum(k)) || t('intentionPh'))}">${esc(d.intention)}</textarea>`,
          collect: (el, d) => { d.intention = $('#f-int', el).value.trim(); } },
        { render: (d) => `<h1>${esc(t('lookForwardQ'))}</h1><textarea id="f-lf" rows="3" placeholder="${esc(t('lookForwardPh'))}">${esc(d.lookForward)}</textarea>`,
          collect: (el, d) => { d.lookForward = $('#f-lf', el).value.trim(); }, onNext: () => store(true) },
        { render: (d) => closeScreen(C().morningClose[pickIdx(C().morningClose.length, k, 'mc')], d.mood) }
      ],
      exit: () => { if (data.mood || data.intention || data.lookForward) store(!!(dayData(k).morning || {}).done); go('/'); }
    });
  }

  /* ---------- Abendmoment ---------- */
  function viewEvening() {
    const k = dkey(); const prev = dayData(k).evening || {}; const morning = dayData(k).morning || {};
    const qi = pickIdx(C().eveningQuestions.length, k, 'eq');
    const data = { mood: prev.mood, good: (prev.good || ['', '', '']).slice(), why: prev.why || '', reflection: prev.reflection || '', kind: prev.kind || '', followUp: prev.followUp || '', fb: prev.fb };
    const store = (done) => setDay(k, 'evening', Object.assign({}, dayData(k).evening, data, { qi, done, ts: Date.now() }));
    const finalize = (d) => { d.fb = analyze([d.good.join(' \n '), d.why, d.reflection, d.kind].join(' \n '), d.mood); store(true); };
    const low = (d) => d.mood && d.mood <= 2;
    flow({
      data,
      steps: [
        { render: (d) => `<p class="eyebrow">${ic('moon')} ${esc(t('eveningTitle'))}</p><h1>${esc(t('eveningHello'))}</h1><p class="lead">${esc(t('eveningMoodQ'))}</p>${moodPicker(d.mood)}`,
          collect: (el, d) => { d.mood = readPick(el) || d.mood; } },
        { render: (d) => `<h1>${esc(t('goodTitle'))}</h1><p class="lead">${esc(t('goodText'))}</p>
            ${[0, 1, 2].map((j) => `<label class="num-input"><span>${j + 1}</span><input type="text" id="g${j}" value="${esc(d.good[j])}" placeholder="${esc(t('goodPh' + j))}"></label>`).join('')}
            <label class="field"><span>${esc(t('goodWhy'))}</span><textarea id="g-why" rows="2" placeholder="${esc(hint(C().goodWhyHints, dayNum(k)))}">${esc(d.why)}</textarea></label>
            <p class="tiny">${esc(t('goodEvidence'))}</p>`,
          collect: (el, d) => { d.good = [0, 1, 2].map((j) => $('#g' + j, el).value.trim()); d.why = $('#g-why', el).value.trim(); } },
        { render: (d) => `${morning.intention ? `<div class="recall"><span>${esc(t('morningRecall'))}</span><q>${esc(morning.intention)}</q></div>` : ''}
            <p class="eyebrow">${esc(t('reflectionLabel'))}</p><h1>${esc(C().eveningQuestions[qi])}</h1><textarea id="f-ref" rows="5" placeholder="${esc(hint((C().eveningHints || [])[qi], dayNum(k)) || t('reflectionPh'))}">${esc(d.reflection)}</textarea>`,
          collect: (el, d) => { d.reflection = $('#f-ref', el).value.trim(); }, onNext: (d) => { if (!low(d)) finalize(d); } },
        { when: low, render: (d) => `<h1>${esc(t('kindTitle'))}</h1><p class="lead">${esc(t('kindText'))}</p><textarea id="f-kind" rows="4" placeholder="${esc(t('kindPh'))}">${esc(d.kind)}</textarea>`,
          collect: (el, d) => { d.kind = $('#f-kind', el).value.trim(); }, onNext: finalize },
        { render: (d) => `${feedbackCard(d.fb, { answer: true, value: d.followUp })}${closeScreen(C().eveningClose[low(d) ? 'low' : d.mood >= 4 ? 'high' : 'mid'][pickIdx(3, k, 'ec')], d.mood)}`,
          collect: (el, d) => { const f = $('#f-follow', el); if (f) d.followUp = f.value.trim(); }, onNext: () => store(true) }
      ],
      exit: () => { if (data.mood || data.reflection || data.good.some(Boolean)) store(!!(dayData(k).evening || {}).done); go('/'); }
    });
  }

  /* ---------- Übungen ---------- */
  function exCard(id) {
    const ex = C().exercises[id];
    return `<a class="card ex-card" href="#/ex/${id}"><span class="ex-ic ${ex.type}">${ic(TYPEI[ex.type])}</span><span class="ritual-tx"><strong>${esc(ex.title)}</strong><small>${esc(ex.short)}</small><small class="meta">${esc(ex.method)} · ${ex.minutes} ${esc(t('min'))}</small></span></a>`;
  }
  function viewExercises() {
    const pi = programIndex(); const prog = C().program[pi]; const all = Object.keys(C().exercises);
    view(`<section class="page">
      <h1>${esc(t('tabExercises'))}</h1>
      <div class="card program">
        <p class="eyebrow">${esc(t('weekTheme', { n: weekNumber() }))}</p><h2>${esc(prog.title)}</h2><p>${esc(prog.intro)}</p>
        <details><summary>${esc(t('whyHelps'))}</summary><p>${esc(prog.why)}</p></details>
        <details><summary>${esc(t('changeTheme'))}</summary><div class="theme-list">${C().program.map((p, j) => `<button class="theme-opt ${j === pi ? 'on' : ''}" data-act="theme" data-i="${j}"><span>${j + 1}</span>${esc(p.title)}</button>`).join('')}</div><p class="tiny">${esc(t('changeThemeHint'))}</p></details>
      </div>
      <p class="section-label">${esc(t('forThisWeek'))}</p>
      ${prog.exercises.map(exCard).join('')}
      <p class="section-label">${esc(t('allExercises'))}</p>
      ${all.filter((id) => !prog.exercises.includes(id)).map(exCard).join('')}
    </section>`, { tab: 'ex' });
    act({
      theme: (el) => {
        const want = +el.dataset.i; const base = Math.floor(Math.max(0, daysBetween(S.settings.startDate, dkey())) / 7) % 8;
        S.settings.programShift = (((want - base) % 8) + 8) % 8; save(); toast(t('themeChanged')); viewExercises();
      }
    });
  }

  function viewExercise(id) {
    const ex = C().exercises[id]; if (!ex) return go('/exercises');
    let body = '';
    if (ex.type === 'breath') {
      body = `<div class="breath"><div class="breath-wrap big"><div class="breath-circle" id="bc"></div><div class="breath-label" id="bl">${esc(t('ready'))}</div></div>
        <p class="timer" id="btime"></p>
        <div class="seg" data-pick-group="min" data-value="${ex.minutes}">${[1, 3, 5].map((m) => `<button class="${m === ex.minutes ? 'on' : ''}" data-act="pick" data-v="${m}" role="radio" aria-checked="${m === ex.minutes}">${m} ${esc(t('min'))}</button>`).join('')}</div>
        <button class="btn primary wide" data-act="bstart">${ic('play')} ${esc(t('start'))}</button></div>`;
    } else if (ex.type === 'guided') {
      body = `<div class="guided"><div class="g-step" id="gs"><p class="g-count" id="gc"></p><p class="g-text" id="gt">${esc(t('guidedReady'))}</p><div class="g-bar"><span id="gb"></span></div></div>
        <div class="g-ctrl"><button class="icon-btn" data-act="gprev" aria-label="${esc(t('back'))}">${ic('arrowLeft')}</button><button class="btn primary" data-act="gplay" id="gplay">${ic('play')} ${esc(t('start'))}</button><button class="icon-btn" data-act="gnext" aria-label="${esc(t('next'))}">${ic('arrowRight')}</button></div></div>`;
    } else {
      body = `<div class="write">${ex.minutes >= 10 ? `<button class="btn soft" data-act="wtimer" id="wt">${ic('play')} ${esc(t('timerStart', { n: ex.minutes }))}</button>` : ''}
        <div class="audio-bar"><button class="pill" data-act="wmusic" aria-pressed="false">${ic('music')} ${esc(t('writeMusic'))}</button></div>
        ${ex.fields.map((f, j) => `<label class="field"><span>${esc(f.l)}</span><textarea id="w${j}" rows="${f.rows || 3}" placeholder="${esc(f.p || ((C().exerciseHints || {})[id] || [])[j] || '')}"></textarea></label>`).join('')}
        <button class="btn primary wide" data-act="wsave">${esc(t('saveEntry'))}</button></div>`;
    }
    onCleanup(() => AU.stopAll());
    view(`<section class="page exercise">
      <button class="back" data-go="/exercises">${ic('arrowLeft')} ${esc(t('tabExercises'))}</button>
      <p class="eyebrow">${ic(TYPEI[ex.type])} ${esc(ex.method)} · ${ex.minutes} ${esc(t('min'))}</p>
      <h1>${esc(ex.title)}</h1>
      <p class="lead">${esc(ex.intro)}</p>
      ${ex.list ? `<div class="tags">${ex.list.map((x) => `<span>${esc(x)}</span>`).join('')}</div>` : ''}
      ${ex.note ? `<p class="note soft">${esc(ex.note)}</p>` : ''}
      ${ex.type !== 'write' ? audioBar() + `<p class="tiny">${esc(t('eyesClosedHint'))}</p>` : ''}
      <div id="engine">${body}</div>
      <details class="evidence"><summary>${esc(t('whyHelps'))}</summary><p>${esc(ex.evidence)}</p></details>
    </section>`, { tab: 'ex' });

    const finish = (extra) => {
      S.exercises.push({ id, ts: Date.now() }); save();
      if (ex.type !== 'write') { AU.bell('end'); AU.speak(t('voiceEnd')).then(() => { AU.stopPad(); AU.awake(false); }); later(() => AU.stopPad(), 20000); }
      $('#engine').innerHTML = `${extra || ''}<div class="close-screen">${garden(growth(), 120)}<h2>${esc(t('exDone'))}</h2><p class="lead">${esc(t('exDoneText'))}</p>
        <div class="row"><a class="btn soft" href="#/exercises">${esc(t('moreExercises'))}</a><a class="btn primary" href="#/">${esc(t('toHome'))}</a></div></div>`;
      window.scrollTo({ top: $('#engine').offsetTop - 80, behavior: 'smooth' });
    };

    if (ex.type === 'breath') {
      let stop = null, end = 0, tick = null, running = false;
      const reset = () => { running = false; if (stop) stop(); stop = null; clearInterval(tick); AU.stopSpeech(); AU.stopPad(); AU.awake(false); };
      onCleanup(reset);
      act(Object.assign(audioToggles(), {
        bstart: async (btn) => {
          if (running) { reset(); btn.innerHTML = ic('play') + ' ' + esc(t('start')); $('#bl').textContent = t('ready'); $('#btime').textContent = ''; $('#bc').classList.remove('grow'); return; }
          running = true;
          AU.unlock(); syncAudio(); AU.startPad(); AU.awake(true);
          btn.innerHTML = ic('pause') + ' ' + esc(t('stop'));
          const mins = +$('[data-pick-group="min"]').dataset.value || ex.minutes;
          const per = ex.pattern.reduce((x, y) => x + y, 0);
          const cyc = Math.max(1, Math.round(mins * 60 / per));
          await AU.speak(t('breathStartVoice'));
          if (!running) return;
          end = Date.now() + cyc * per * 1000;
          const upd = () => { const sec = Math.max(0, Math.round((end - Date.now()) / 1000)); const el = $('#btime'); if (el) el.textContent = `${Math.floor(sec / 60)}:${pad(sec % 60)}`; };
          upd(); tick = setInterval(upd, 500);
          stop = runBreath(ex.pattern, cyc, cueBreath(3), () => { stop = null; clearInterval(tick); running = false; finish(); });
        }
      }));
    } else if (ex.type === 'guided') {
      /* Mit Stimme: Klangschale → Satz wird gesprochen → Stille zum Nachspüren (mind. 5 Sek.) → nächster Schritt */
      let i = 0, playing = false, run = 0, introDone = false;
      const steps = ex.steps;
      const bar = (secs) => { const gb = $('#gb'); if (!gb) return; gb.style.transition = 'none'; gb.style.width = '0%'; if (secs > 0) requestAnimationFrame(() => requestAnimationFrame(() => { gb.style.transition = `width ${secs}s linear`; gb.style.width = '100%'; })); };
      const freeze = () => { const gb = $('#gb'); if (!gb) return; const w = getComputedStyle(gb).width; gb.style.transition = 'none'; gb.style.width = w; };
      const show = () => { const st = steps[i]; $('#gt').textContent = st.t; $('#gc').textContent = `${i + 1} / ${steps.length}`; bar(0); };
      const setBtn = () => { const b2 = $('#gplay'); if (!b2) return; b2.innerHTML = playing ? ic('pause') + ' ' + esc(t('pause')) : ic('play') + ' ' + esc(!introDone && i === 0 ? t('start') : t('resume')); };
      const stopRun = () => { run++; AU.stopSpeech(); };
      async function play() {
        const my = ++run;
        if (!introDone) {
          $('#gt').textContent = ex.intro; $('#gc').textContent = '';
          await AU.speak(ex.intro); if (my !== run) return;
          introDone = true; await waitMs(AS().voice ? 1500 : 300); if (my !== run) return;
        }
        while (i < steps.length) {
          const st = steps[i]; show(); AU.bell('step');
          await waitMs(AS().music ? 900 : 100); if (my !== run) return;
          const t0 = Date.now();
          await AU.speak(st.t); if (my !== run) return;
          const rest = AS().voice ? Math.max(st.s * 1000 - (Date.now() - t0), 5000) : st.s * 1000;
          bar(rest / 1000);
          await waitMs(rest); if (my !== run) return;
          i++;
        }
        playing = false; i = steps.length - 1; setBtn(); finish();
      }
      onCleanup(() => { run++; });
      act(Object.assign(audioToggles(), {
        gplay: () => {
          if (playing) { playing = false; stopRun(); freeze(); AU.stopPad(); AU.awake(false); }
          else { playing = true; AU.unlock(); syncAudio(); AU.startPad(); AU.awake(true); play(); }
          setBtn();
        },
        gnext: () => {
          stopRun(); if (!introDone) introDone = true; else i++;
          if (i >= steps.length) { playing = false; i = steps.length - 1; finish(); return; }
          if (playing) play(); else show();
          setBtn();
        },
        gprev: () => { stopRun(); introDone = true; if (i > 0) i--; if (playing) play(); else show(); setBtn(); }
      }));
    } else {
      let wt = null;
      onCleanup(() => clearInterval(wt));
      let wm = false;
      act({
        wmusic: (btn) => {
          wm = !wm; AU.unlock();
          if (wm) { if (!AS().music) { AS().music = true; save(); } syncAudio(); AU.startPad(); } else AU.stopPad();
          btn.classList.toggle('on', wm); btn.setAttribute('aria-pressed', String(wm));
        },
        wtimer: (btn) => {
          if (wt) { clearInterval(wt); wt = null; btn.innerHTML = ic('play') + ' ' + esc(t('timerStart', { n: ex.minutes })); return; }
          let s = ex.minutes * 60;
          const upd = () => { btn.innerHTML = ic('pause') + ` ${Math.floor(s / 60)}:${pad(s % 60)}`; };
          upd(); wt = setInterval(() => { s--; upd(); if (s <= 0) { clearInterval(wt); wt = null; btn.innerHTML = ic('check') + ' ' + esc(t('timeUp')); } }, 1000);
        },
        wsave: () => {
          const fields = ex.fields.map((f, j) => ({ l: f.l, v: $('#w' + j).value.trim() }));
          if (!fields.some((f) => f.v)) { toast(t('emptyEntry')); return; }
          const text = fields.map((f) => f.v).join(' \n ');
          const fbk = analyze(text, null);
          const e = { id: uid(), type: 'exercise', exId: id, ts: Date.now(), title: ex.title, fields, text };
          if (fbk.cat === 'crisis') e.fb = fbk;
          S.journal.unshift(e); save();
          finish(fbk.cat === 'crisis' ? crisisCard() : '');
        }
      });
    }
  }

  /* ---------- Journal ---------- */
  function entryExcerpt(e) {
    const txt = e.type === 'exercise' ? e.fields.filter((f) => f.v).map((f) => f.v).join(' · ') : e.text;
    return txt.length > 140 ? txt.slice(0, 140) + '…' : txt;
  }
  function viewJournal() {
    const list = S.journal;
    const k = dkey(); const prompt = C().journalPrompts[pickIdx(C().journalPrompts.length, k, 'jp')];
    view(`<section class="page">
      <h1>${esc(t('tabJournal'))}</h1>
      <p class="lead">${esc(t('journalIntro'))}</p>
      <a class="card prompt-card" href="#/journal/new"><p class="eyebrow">${ic('feather')} ${esc(t('promptOfDay'))}</p><p class="prompt">${esc(prompt)}</p><span class="btn primary">${ic('plus')} ${esc(t('newEntry'))}</span></a>
      ${list.length ? `<p class="section-label">${esc(t('yourEntries'))}</p>` + list.map((e) => `
        <a class="card entry" href="#/journal/${e.id}"><span class="entry-ic">${e.mood ? ic(MOODI[e.mood - 1]) : ic(e.type === 'exercise' ? 'leaf' : 'feather')}</span>
        <span class="ritual-tx"><small class="meta">${esc(fmtDate(new Date(e.ts), { weekday: 'short', day: 'numeric', month: 'short' }))}${e.type === 'exercise' ? ' · ' + esc((C().exercises[e.exId] || {}).title || e.title) : e.prompt ? ' · ' + esc(e.prompt) : ''}</small>
        <span>${esc(entryExcerpt(e))}</span></span></a>`).join('') : `<p class="empty">${ic('sprout')} ${esc(t('noEntries'))}</p>`}
    </section>`, { tab: 'journal' });
    act({});
  }
  function viewJournalNew() {
    const ps = C().journalPrompts.slice(); const r = rng(Date.now() & 0xffff);
    for (let i = ps.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [ps[i], ps[j]] = [ps[j], ps[i]]; }
    const dayP = C().journalPrompts[pickIdx(C().journalPrompts.length, dkey(), 'jp')];
    const prompts = [dayP].concat(ps.filter((p) => p !== dayP).slice(0, 3));
    let prompt = '';
    view(`<section class="page">
      <button class="back" data-go="/journal">${ic('arrowLeft')} ${esc(t('tabJournal'))}</button>
      <h1>${esc(t('newEntry'))}</h1>
      <p class="label">${esc(t('moodQShort'))}</p>${moodPicker(null, t('moodQShort'))}
      <p class="label">${esc(t('promptPick'))}</p>
      <div class="chips" id="prompts">${prompts.map((p) => `<button class="chip" data-act="prompt" data-p="${esc(p)}">${esc(p)}</button>`).join('')}<button class="chip" data-act="prompt" data-p="">${esc(t('freeWrite'))}</button></div>
      <p class="prompt-show" id="pshow" hidden></p>
      <textarea id="j-text" rows="9" placeholder="${esc(t('journalPh'))}"></textarea>
      <p class="tiny">${ic('heart')} ${esc(t('privateNote'))}</p>
      <button class="btn primary wide" data-act="save">${esc(t('saveEntry'))}</button>
    </section>`, { tab: 'journal' });
    act({
      prompt: (el) => { prompt = el.dataset.p; $$('#prompts .chip').forEach((c) => c.classList.toggle('on', c === el)); const p = $('#pshow'); p.hidden = !prompt; p.textContent = prompt; $('#j-text').focus(); },
      save: () => {
        const text = $('#j-text').value.trim(); if (!text) { toast(t('emptyEntry')); return; }
        const mood = readPick($('#view'));
        const e = { id: uid(), type: 'journal', ts: Date.now(), mood, prompt, text };
        e.fb = analyze(text, mood);
        S.journal.unshift(e); save(); go('/journal/' + e.id);
      }
    });
  }
  function viewJournalEntry(id) {
    const e = S.journal.find((x) => x.id === id); if (!e) return go('/journal');
    const ex = e.type === 'exercise' ? C().exercises[e.exId] : null;
    view(`<section class="page">
      <button class="back" data-go="/journal">${ic('arrowLeft')} ${esc(t('tabJournal'))}</button>
      <p class="date">${esc(fmtDate(new Date(e.ts), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }))}</p>
      <h1>${esc(ex ? ex.title : e.prompt || t('journalEntry'))}</h1>
      ${e.mood ? `<p class="mood-line">${ic(MOODI[e.mood - 1])} ${esc(C().moods[e.mood - 1])}</p>` : ''}
      ${e.type === 'exercise' ? e.fields.filter((f) => f.v).map((f) => `<p class="label">${esc(f.l)}</p><p class="entry-text">${nl2br(f.v)}</p>`).join('') : `<p class="entry-text">${nl2br(e.text)}</p>`}
      ${feedbackCard(e.fb, { answer: e.type === 'journal', value: e.followUp, saveBtn: true })}
      <button class="btn ghost danger" data-act="del">${esc(t('deleteEntry'))}</button>
    </section>`, { tab: 'journal' });
    act({
      saveFollow: () => { e.followUp = $('#f-follow').value.trim(); save(); toast(t('saved')); },
      del: () => { if (confirm(t('confirmDelete'))) { S.journal = S.journal.filter((x) => x.id !== id); save(); go('/journal'); } }
    });
  }

  /* ---------- Wochen-Check-up (WHO-5 + Reflexion) ---------- */
  function viewWeekly() {
    const c = C(); const w = c.who5; const pi = programIndex(); const prog = c.program[pi];
    const data = { who: [null, null, null, null, null], a: {} };
    const qs = c.weeklyQuestions;
    const tq = (q) => `<label class="field"><span>${esc(q.q)}</span><textarea data-q="${q.id}" rows="3" placeholder="${esc(hint((c.weeklyHints || {})[q.id], weekIdx()) || q.p || '')}"></textarea></label>`;
    const collectQ = (el, d) => { $$('textarea[data-q]', el).forEach((ta) => { d.a[ta.dataset.q] = ta.value.trim(); }); };
    const fillQ = (el, d) => { $$('textarea[data-q]', el).forEach((ta) => { ta.value = d.a[ta.dataset.q] || ''; }); };
    let api;
    const whoStep = (j) => ({
      render: (d) => `<p class="eyebrow">${esc(t('who5Label'))} · ${j + 1}/5</p><p class="muted">${esc(w.stem)}</p><h1>… ${esc(w.items[j])}</h1>
        <div class="scale" data-pick-group="who" data-value="${d.who[j] == null ? '' : d.who[j]}" role="radiogroup">${w.scale.map((s, v) => { const val = 5 - v; return `<button class="${d.who[j] === val ? 'on' : ''}" data-act="pick" data-v="${val}" role="radio" aria-checked="${d.who[j] === val}">${esc(s)}</button>`; }).join('')}</div>`,
      collect: (el, d) => { const g = $('[data-pick-group]', el); if (g.dataset.value !== '') d.who[j] = +g.dataset.value; },
      validate: (d) => { if (d.who[j] == null) { toast(t('pickOne')); return false; } return true; },
      mount: (el) => { $('[data-pick-group]', el).addEventListener('picked', () => later(() => api.next(), 280)); }
    });
    api = flow({
      data,
      steps: [
        { render: () => `<p class="eyebrow">${ic('compass')} ${esc(t('weeklyTitle'))}</p><h1>${esc(t('weeklyHello'))}</h1><p class="lead">${esc(t('weeklyIntro'))}</p>
            <div class="card soft"><p class="eyebrow">${esc(t('weekTheme', { n: weekNumber() }))}</p><h2>${esc(prog.title)}</h2><p>${esc(prog.intro)}</p></div>`, next: t('begin') },
        whoStep(0), whoStep(1), whoStep(2), whoStep(3), whoStep(4),
        { skip: true, render: () => `<h1>${esc(t('weekLookBack'))}</h1>${tq(qs[0])}${tq(qs[1])}`, mount: fillQ, collect: collectQ },
        { skip: true, render: () => `<h1>${esc(t('weekDeeper'))}</h1>${tq({ id: 'theme', q: prog.weekQuestion, p: hint((c.themeHints || [])[pi], Math.floor(weekIdx() / 8)) })}${tq(qs[2])}`, mount: fillQ, collect: collectQ },
        { skip: true, render: () => `<h1>${esc(t('weekAhead'))}</h1>${tq(qs[3])}${tq(qs[4])}`, mount: fillQ, collect: collectQ,
          onNext: (d) => {
            const raw = d.who.reduce((a, b) => a + (b || 0), 0);
            const txt = Object.values(d.a).join(' \n ');
            const crisis = analyze(txt, null).cat === 'crisis';
            S.weekly.push({ id: uid(), ts: Date.now(), theme: pi, who: d.who.slice(), score: raw * 4, answers: Object.assign({}, d.a), themeQ: prog.weekQuestion, crisis });
            save();
          } },
        { render: () => weeklyResult() }
      ]
    });
  }
  /* Rückmeldung in drei Stufen, immer mit Bezug auf die eigenen Antworten (WHO-5: 0–100) */
  function weeklyResult() {
    const W = S.weekly; const cur = W[W.length - 1]; const prev = W[W.length - 2]; const m = C().weeklyMessages; const tr = C().weeklyTiers; const sh = C().who5Short;
    const cmp = !prev ? m.first : cur.score - prev.score >= 8 ? m.up : prev.score - cur.score >= 8 ? m.down : m.steady;
    const who = (cur.who || []).map((v) => (v == null ? 0 : v));
    const best = who.indexOf(Math.max(...who)); const low = who.indexOf(Math.min(...who));
    const prevLow = prev && prev.score < 50 && (cur.ts - prev.ts) <= 15 * 864e5;
    let tier = '', note = '';
    if (cur.score >= 50) tier = tr.high.replace('{best}', sh[best]);
    else if (cur.score > 28) {
      tier = tr.mid.replace('{low}', sh[low]);
      note = prevLow ? `<div class="note soft">${esc(tr.midRepeat)} <a href="#/help">${esc(t('helpLink'))}</a></div>`
        : `<p class="note soft">${esc(tr.midEx)} <a href="#/ex/selfcompassion">${esc(C().exercises.selfcompassion.title)} ${ic('arrowRight')}</a></p>`;
    } else {
      note = `<div class="note soft">${esc(tr.low)} <a href="#/help">${esc(t('helpLink'))}</a></div>`;
    }
    const nextTheme = C().program[(programIndex() + 1) % 8];
    return `<h1>${esc(t('weeklyThanks'))}</h1>
      ${cur.crisis ? crisisCard() : ''}
      <div class="card"><p class="eyebrow">${esc(t('wellbeingCurve'))}</p>${who5Chart(W.slice(-12))}${tier ? `<p>${esc(tier)}</p>` : ''}<p class="muted">${esc(cmp)}</p>
        <details><summary>${esc(tr.howTitle)}</summary><p class="tiny">${esc(tr.how)}</p></details></div>
      ${note}
      <div class="card soft"><p class="eyebrow">${esc(t('nextWeekTheme'))}</p><h2>${esc(nextTheme.title)}</h2><p>${esc(nextTheme.intro)}</p></div>
      ${garden(growth(), 110)}`;
  }

  /* ---------- Diagramme (sanft, ohne Bewertung) ---------- */
  function who5Chart(list) {
    if (!list.length) return `<p class="muted">${esc(t('noWeekly'))}</p>`;
    const Wd = 320, H = 120, px = 18, py = 16;
    const x = (i) => list.length === 1 ? Wd / 2 : px + i * (Wd - 2 * px) / (list.length - 1);
    const y = (s) => H - py - (s / 100) * (H - 2 * py);
    const pts = list.map((w, i) => [x(i), y(w.score)]);
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; const cx = (x0 + x1) / 2; d += ` C${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`; }
    const area = d + ` L${pts[pts.length - 1][0]} ${H - py} L${pts[0][0]} ${H - py} Z`;
    return `<svg class="chart" viewBox="0 0 ${Wd} ${H + 18}" role="img" aria-label="${esc(t('wellbeingCurve'))}">
      <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sage)" stop-opacity=".35"/><stop offset="1" stop-color="var(--sage)" stop-opacity="0"/></linearGradient></defs>
      <line x1="${px}" x2="${Wd - px}" y1="${H - py}" y2="${H - py}" stroke="var(--line)"/>
      ${list.length > 1 ? `<path d="${area}" fill="url(#wg)"/><path d="${d}" fill="none" stroke="var(--sage-d)" stroke-width="2.2" stroke-linecap="round"/>` : ''}
      ${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="${i === pts.length - 1 ? 5 : 3.5}" fill="${i === pts.length - 1 ? 'var(--terra)' : 'var(--sage-d)'}"/>`).join('')}
      ${list.map((w, i) => (i === 0 || i === list.length - 1) ? `<text x="${x(i)}" y="${H + 12}" text-anchor="middle" class="ax">${esc(fmtDate(new Date(w.ts), { day: 'numeric', month: 'short' }))}</text>` : '').join('')}
    </svg>`;
  }
  function moodChart() {
    const days = []; const now = new Date();
    for (let i = 13; i >= 0; i--) { const d = new Date(now); d.setDate(now.getDate() - i); days.push(d); }
    const Wd = 320, H = 110, px = 14, py = 12;
    const x = (i) => px + i * (Wd - 2 * px) / 13; const y = (m) => H - py - ((m - 1) / 4) * (H - 2 * py);
    let any = false;
    const dots = days.map((d, i) => {
      const dd = dayData(dkey(d)); let s = '';
      if (dd.morning && dd.morning.mood) { any = true; s += `<circle cx="${x(i) - 2.5}" cy="${y(dd.morning.mood)}" r="4" fill="var(--ochre)"/>`; }
      if (dd.evening && dd.evening.mood) { any = true; s += `<circle cx="${x(i) + 2.5}" cy="${y(dd.evening.mood)}" r="4" fill="var(--lav-d)"/>`; }
      return s;
    }).join('');
    if (!any) return `<p class="muted">${esc(t('noMood'))}</p>`;
    return `<svg class="chart" viewBox="0 0 ${Wd} ${H + 18}" role="img" aria-label="${esc(t('moodChart'))}">
      ${[1, 3, 5].map((m) => `<line x1="${px}" x2="${Wd - px}" y1="${y(m)}" y2="${y(m)}" stroke="var(--line)" stroke-dasharray="${m === 3 ? '3 4' : ''}"/>`).join('')}
      ${dots}
      <text x="${px}" y="${H + 12}" class="ax">${esc(fmtDate(days[0], { day: 'numeric', month: 'short' }))}</text><text x="${Wd - px}" y="${H + 12}" text-anchor="end" class="ax">${esc(t('today'))}</text>
    </svg><p class="legend"><span class="lg m"></span>${esc(t('morningTitle'))} <span class="lg e"></span>${esc(t('eveningTitle'))} · ${ic('sun')} ${esc(t('moodTop'))} ${ic('storm')} ${esc(t('moodBottom'))}</p>`;
  }

  /* ---------- Alle Einträge (Suche & Export) ---------- */
  function allItems() {
    const c = C(); const items = [];
    Object.entries(S.days).forEach(([k, d]) => {
      if (d.morning && (d.morning.intention || d.morning.lookForward)) {
        items.push({ ts: d.morning.ts || fromKey(k).getTime(), kind: t('morningTitle'), mood: d.morning.mood, parts: [[c.morningQuestions[d.morning.qi] || t('intentionLabel'), d.morning.intention], [t('lookForwardQ'), d.morning.lookForward]] });
      }
      if (d.evening && (d.evening.reflection || (d.evening.good || []).some(Boolean) || d.evening.kind)) {
        const e = d.evening;
        items.push({ ts: e.ts || fromKey(k).getTime(), kind: t('eveningTitle'), mood: e.mood, parts: [[t('goodTitle'), (e.good || []).filter(Boolean).map((g) => '• ' + g).join('\n')], [t('goodWhy'), e.why], [c.eveningQuestions[e.qi] || t('reflectionLabel'), e.reflection], [t('kindTitle'), e.kind], [t('followAnswer'), e.followUp]] });
      }
    });
    S.journal.forEach((e) => {
      if (e.type === 'exercise') items.push({ ts: e.ts, kind: (c.exercises[e.exId] || {}).title || e.title, parts: e.fields.map((f) => [f.l, f.v]), id: e.id });
      else items.push({ ts: e.ts, kind: t('journalEntry'), mood: e.mood, parts: [[e.prompt || '', e.text], [t('followAnswer'), e.followUp]], id: e.id });
    });
    S.weekly.forEach((w) => {
      const qs = c.weeklyQuestions;
      items.push({ ts: w.ts, kind: t('weeklyTitle'), parts: qs.map((q) => [q.q, w.answers[q.id]]).concat([[w.themeQ || '', w.answers.theme]]) });
    });
    items.forEach((it) => { it.parts = it.parts.filter((p) => p[1]); it.text = it.parts.map((p) => p.join(' ')).join(' ').toLowerCase(); });
    return items.filter((it) => it.parts.length).sort((a, b) => b.ts - a.ts);
  }
  function itemHtml(it) {
    return `<article class="card item"><p class="meta">${esc(fmtDate(new Date(it.ts), { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }))} · ${esc(it.kind)}${it.mood ? ' · ' + esc(C().moods[it.mood - 1]) : ''}</p>
      ${it.parts.map((p) => `${p[0] ? `<p class="label">${esc(p[0])}</p>` : ''}<p>${nl2br(p[1])}</p>`).join('')}
      ${it.id ? `<a class="link" href="#/journal/${it.id}">${esc(t('open'))} ${ic('arrowRight')}</a>` : ''}</article>`;
  }

  /* ---------- Mein Weg ---------- */
  function viewPath() {
    const n = growth(); const favs = S.favs;
    view(`<section class="page">
      <h1>${esc(t('tabPath'))}</h1>
      <div class="card garden-card">${garden(n, 170)}<p>${esc(gardenCaption(n))}</p><p class="tiny">${esc(t('gardenNote'))}</p></div>
      <div class="card"><p class="eyebrow">${esc(t('moodChart'))}</p>${moodChart()}</div>
      <div class="card"><p class="eyebrow">${esc(t('wellbeingCurve'))}</p>${who5Chart(S.weekly.slice(-12))}
        <a class="btn soft" href="#/weekly">${ic('compass')} ${esc(t('startWeekly'))}</a></div>
      ${favs.length ? `<p class="section-label">${esc(t('favThoughts'))}</p>${favs.map((i) => affCard(i)).join('')}` : ''}
      <p class="section-label">${esc(t('searchEntries'))}</p>
      <label class="search">${ic('search')}<input type="search" id="q" placeholder="${esc(t('searchPh'))}" aria-label="${esc(t('searchEntries'))}"></label>
      <div id="results"></div>
      <div class="row wrap"><button class="btn soft" data-act="pdf">${ic('download')} ${esc(t('exportPdf'))}</button></div>
    </section>`, { tab: 'path' });
    const items = allItems();
    const renderRes = (q) => {
      const list = q ? items.filter((it) => it.text.includes(q.toLowerCase())) : items.slice(0, 5);
      $('#results').innerHTML = list.length ? list.map(itemHtml).join('') + (!q && items.length > 5 ? `<p class="tiny center">${esc(t('showingLatest', { n: items.length }))}</p>` : '') : `<p class="empty">${esc(q ? t('noResults') : t('noEntries'))}</p>`;
    };
    renderRes('');
    $('#q').addEventListener('input', (e) => renderRes(e.target.value.trim()));
    act({ pdf: exportPdf });
  }
  function exportPdf() {
    const items = allItems().reverse();
    if (!items.length) { toast(t('noEntries')); return; }
    $('#print').innerHTML = `<h1>Sonnseite – ${esc(t('myJournal'))}${S.settings.name ? ' · ' + esc(S.settings.name) : ''}</h1><p class="meta">${esc(t('exportedOn'))} ${esc(fmtDate(new Date(), { day: 'numeric', month: 'long', year: 'numeric' }))}</p>` + items.map(itemHtml).join('');
    setTimeout(() => window.print(), 50);
  }

  /* ---------- Einstellungen ---------- */
  function viewSettings() {
    const s = S.settings; const th = C().themes; const au = s.audio;
    const seg = (key, opts) => `<div class="seg" data-pick-group="${key}" data-value="${s[key]}">${opts.map(([v, l]) => `<button class="${String(s[key]) === String(v) ? 'on' : ''}" data-act="pick" data-v="${v}" role="radio" aria-checked="${String(s[key]) === String(v)}">${esc(l)}</button>`).join('')}</div>`;
    view(`<section class="page settings">
      <button class="back" data-go="/">${ic('arrowLeft')} ${esc(t('tabToday'))}</button>
      <h1>${esc(t('settings'))}</h1>
      <div class="card"><label class="field"><span>${esc(t('yourName'))}</span><input type="text" id="s-name" value="${esc(s.name)}" placeholder="${esc(t('namePh'))}" autocomplete="given-name"></label>
        <p class="label">${esc(t('language'))}</p>${seg('lang', [['de', 'Deutsch'], ['en', 'English'], ['cs', 'Čeština']])}</div>
      <div class="card"><p class="label">${esc(t('lifeThemes'))}</p><p class="tiny">${esc(t('lifeThemesHint'))}</p>
        <div class="chips" id="s-themes">${Object.entries(th).map(([k, l]) => `<button class="chip ${s.themes.includes(k) ? 'on' : ''}" data-act="chip" data-k="${k}" aria-pressed="${s.themes.includes(k)}">${esc(l)}</button>`).join('')}</div></div>
      <div class="card"><p class="label">${esc(t('fontSize'))}</p>${seg('fontScale', [[1, 'A'], [1.12, 'A+'], [1.25, 'A++']])}
        <p class="label">${esc(t('appearance'))}</p>${seg('theme', [['evening', t('themeEvening')], ['light', t('themeLight')], ['dark', t('themeDark')], ['auto', t('themeAuto')]])}</div>
      <div class="card"><p class="label">${esc(t('reminders'))}</p>
        <div class="row"><label class="field small"><span>${ic('sun')} ${esc(t('morningTitle'))}</span><input type="time" id="s-mt" value="${esc(s.morningTime)}"></label>
        <label class="field small"><span>${ic('moon')} ${esc(t('eveningTitle'))}</span><input type="time" id="s-et" value="${esc(s.eveningTime)}"></label></div>
        <label class="toggle"><input type="checkbox" id="s-hints" ${s.hints ? 'checked' : ''}><span>${esc(t('hintsToggle'))}</span></label>
        <button class="btn soft" data-act="ics">${ic('calendar')} ${esc(t('icsButton'))}</button><p class="tiny">${esc(t('icsHint'))}</p></div>
      <div class="card" id="audio-card"><p class="label">${esc(t('audioTitle'))}</p>
        ${AU.speechAvailable() ? '' : `<p class="note soft">${esc(t('noSpeech'))}</p>`}
        <label class="toggle"><input type="checkbox" id="a-voice" ${au.voice ? 'checked' : ''}><span>${esc(t('voiceToggle'))}</span></label>
        <label class="field"><span>${esc(t('voiceLabel'))}</span><select id="a-uri"></select></label>
        <label class="field"><span>${esc(t('pitchLabel'))}</span><input type="range" id="a-pitch" min="0.7" max="1.3" step="0.02"><span class="range-ends"><small>${esc(t('lower'))}</small><button class="link-btn" data-act="pitchauto">${esc(t('pitchAuto'))}</button><small>${esc(t('higher'))}</small></span></label>
        <p class="label">${esc(t('rateLabel'))}</p>
        <div class="seg" data-pick-group="rate" data-value="${au.rate}">${[[0.75, t('rateSlow')], [0.85, t('rateCalm')], [0.95, t('rateNormal')]].map(([v, l]) => `<button class="${au.rate === v ? 'on' : ''}" data-act="pick" data-v="${v}" role="radio" aria-checked="${au.rate === v}">${esc(l)}</button>`).join('')}</div>
        <label class="field"><span>${esc(t('voiceVol'))}</span><input type="range" id="a-vv" min="0.2" max="1" step="0.05" value="${au.voiceVol}"></label>
        <label class="toggle"><input type="checkbox" id="a-music" ${au.music ? 'checked' : ''}><span>${esc(t('musicToggle'))}</span></label>
        <label class="field"><span>${esc(t('musicVol'))}</span><input type="range" id="a-mv" min="0.05" max="1" step="0.05" value="${au.musicVol}"></label>
        <button class="btn soft" data-act="listen">${ic('play')} ${esc(t('listen'))}</button>
        <p class="tiny">${esc(t('audioHint'))}</p><p class="tiny">${esc(t('music432'))}</p></div>
      <div class="card"><p class="label">${esc(t('installTitle'))}</p><p class="tiny">${esc(t('installHint'))}</p></div>
      <div class="card"><p class="label">${esc(t('yourData'))}</p><p class="tiny">${esc(t('dataHint'))}</p>
        <div class="row wrap"><button class="btn soft" data-act="backup">${ic('download')} ${esc(t('backupExport'))}</button>
        <label class="btn soft">${ic('upload')} ${esc(t('backupImport'))}<input type="file" id="s-import" accept="application/json,.json" hidden></label>
        <button class="btn soft" data-act="pdf">${ic('download')} ${esc(t('exportPdf'))}</button></div>
        <button class="btn ghost danger" data-act="wipe">${esc(t('deleteAll'))}</button></div>
      <div class="card about"><p class="label">${esc(t('about'))}</p>${C().about.map((p) => `<p>${esc(p)}</p>`).join('')}<p class="tiny">${esc(C().who5.attribution)}</p><p class="tiny">Sonnseite ${VERSION}</p></div>
      <button class="btn primary wide" data-act="save">${esc(t('saveSettings'))}</button>
    </section>`, {});
    const persist = () => {
      s.name = $('#s-name').value.trim().slice(0, 40);
      s.themes = $$('#s-themes .chip.on').map((c) => c.dataset.k);
      s.fontScale = +$('[data-pick-group="fontScale"]').dataset.value;
      s.theme = $('[data-pick-group="theme"]').dataset.value;
      s.morningTime = $('#s-mt').value || s.morningTime; s.eveningTime = $('#s-et').value || s.eveningTime;
      s.hints = $('#s-hints').checked;
      persistAudio();
      save(); applyTheme();
    };
    function persistAudio() {
      au.voice = $('#a-voice').checked; au.music = $('#a-music').checked;
      au.voiceURI = au.voiceURI || {}; au.voiceURI[L()] = $('#a-uri').value;
      au.rate = +$('[data-pick-group="rate"]').dataset.value || 0.85;
      au.voiceVol = +$('#a-vv').value; au.musicVol = +$('#a-mv').value;
      save(); syncAudio();
    }
    const pitchEl = $('#a-pitch');
    const showPitch = () => { pitchEl.value = au.pitch != null ? au.pitch : AU.autoPitch(AU.pickVoice(L(), $('#a-uri').value)); };
    const fillVoices = () => {
      const sel = $('#a-uri'); if (!sel) return;
      const list = AU.voicesFor(L()); const cur = (au.voiceURI || {})[L()] || '';
      sel.innerHTML = `<option value="">${esc(t('voiceAuto'))}${list[0] ? ' – ' + esc(list[0].name) : ''}</option>` + list.map((v) => `<option value="${esc(v.voiceURI)}" ${v.voiceURI === cur ? 'selected' : ''}>${esc(v.name)} · ${esc(v.lang)}</option>`).join('');
      showPitch();
    };
    fillVoices(); later(fillVoices, 800); later(fillVoices, 2500);
    $('#a-uri').addEventListener('change', () => { persistAudio(); showPitch(); });
    pitchEl.addEventListener('input', () => { au.pitch = +pitchEl.value; save(); syncAudio(); });
    pitchEl.addEventListener('change', () => { AU.unlock(); AU.speak(t('sampleShort')); });
    $('#a-mv').addEventListener('input', () => { persistAudio(); });
    $('[data-pick-group="lang"]').addEventListener('picked', (e) => { persist(); s.lang = e.detail; save(); applyTheme(); renderChrome(); viewSettings(); });
    $('[data-pick-group="fontScale"]').addEventListener('picked', (e) => { document.documentElement.style.fontSize = (+e.detail * 100) + '%'; });
    $('[data-pick-group="theme"]').addEventListener('picked', () => { persist(); });
    $('#s-import').addEventListener('change', (e) => {
      const f = e.target.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        try {
          const d = JSON.parse(rd.result);
          if (!d || !d.settings || !d.days) throw new Error('format');
          if (!confirm(t('confirmImport'))) return;
          const def = defaults();
          S = Object.assign(def, d, { settings: Object.assign(def.settings, d.settings) }); save(); applyTheme(); renderChrome(); toast(t('imported')); go('/');
        } catch (err) { toast(t('importError')); }
      };
      rd.readAsText(f);
    });
    act({
      save: () => { persist(); toast(t('saved')); go('/'); },
      ics: () => { persist(); downloadIcs(); },
      pitchauto: () => { au.pitch = null; save(); syncAudio(); showPitch(); toast(t('pitchAutoDone')); },
      listen: () => { persistAudio(); AU.unlock(); syncAudio(); AU.startPad(); AU.bell('step'); AU.speak(t('sampleText')).then(() => later(() => AU.stopPad(), 1200)); },
      backup: () => { download(`sonnseite-backup-${dkey()}.json`, JSON.stringify(S, null, 1), 'application/json'); },
      pdf: exportPdf,
      wipe: () => { if (confirm(t('confirmWipe')) && confirm(t('confirmWipe2'))) { localStorage.removeItem(KEY); S = defaults(); applyTheme(); renderChrome(); go('/'); } }
    });
  }
  function download(name, content, type) {
    const b = new Blob([content], { type }); const a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function downloadIcs() {
    const s = S.settings; const d = dkey().replace(/-/g, '');
    const now = new Date(); const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;
    const ie = (x) => String(x).replace(/\\/g, '\\\\').replace(/[,;]/g, (m) => '\\' + m).replace(/\n/g, '\\n');
    const url = location.origin + location.pathname;
    const ev = (id, time, title, desc, hash) => {
      const [h, m] = time.split(':');
      return ['BEGIN:VEVENT', `UID:sonnseite-${id}-${d}@sonnseite.app`, `DTSTAMP:${stamp}`, `DTSTART:${d}T${h}${m}00`, 'DURATION:PT10M', 'RRULE:FREQ=DAILY', `SUMMARY:${ie(title)}`, `DESCRIPTION:${ie(desc + '\n' + url + '#' + hash)}`, `URL:${url}#${hash}`, 'TRANSP:TRANSPARENT',
        'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${ie(title)}`, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT'].join('\r\n');
    };
    const cal = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sonnseite//DE', 'CALSCALE:GREGORIAN',
      ev('morning', s.morningTime, '☀ ' + t('morningTitle'), t('icsMorningDesc'), '/morning'),
      ev('evening', s.eveningTime, '☾ ' + t('eveningTitle'), t('icsEveningDesc'), '/evening'), 'END:VCALENDAR'].join('\r\n');
    download('sonnseite-erinnerungen.ics', cal, 'text/calendar');
    toast(t('icsDone'));
  }

  /* ---------- Hilfe in Krisen ---------- */
  function viewHelp() {
    const h = C().help;
    const line = (r) => `<a class="card help-line" href="tel:${r.tel}"><span class="help-num">${esc(r.num)}</span><span class="ritual-tx"><strong>${esc(r.name)}</strong><small>${esc(r.info)}</small></span>${ic('phone')}</a>`;
    view(`<section class="page help">
      <button class="back" data-go="/">${ic('arrowLeft')} ${esc(t('tabToday'))}</button>
      <h1>${esc(h.title)}</h1>
      <p class="lead">${esc(h.intro)}</p>
      <div class="card crisis"><h2>${esc(h.acuteTitle)}</h2><p>${esc(h.acuteText)}</p>
        <div class="call-row"><a class="btn primary" href="tel:144">${ic('phone')} 144 · ${esc(h.rescue)}</a><a class="btn soft" href="tel:112">${ic('phone')} 112</a></div></div>
      <p class="section-label">${esc(h.alwaysTitle)}</p>${h.always.map(line).join('')}
      <p class="section-label">${esc(h.moreTitle)}</p>${h.more.map(line).join('')}
      <p class="section-label">${esc(h.onlineTitle)}</p>
      <div class="card">${h.online.map((o) => `<p><a href="${esc(o.url)}" target="_blank" rel="noopener">${esc(o.name)}</a><br><small>${esc(o.info)}</small></p>`).join('')}</div>
      <p class="section-label">${esc(h.nowTitle)}</p>
      ${['atem46', 'ground54321', 'selfcompassion'].map(exCard).join('')}
      <p class="tiny">${esc(h.disclaimer)}</p>
    </section>`, {});
    act({});
  }

  /* ---------- Erster Start ---------- */
  function viewOnboarding() {
    const s = S.settings; const data = { name: s.name, themes: s.themes.slice() };
    flow({
      data, cls: 'onboarding',
      steps: [
        { render: () => `<div class="ob-hero">${garden(9, 150)}</div><h1>${esc(t('obWelcome'))}</h1><p class="lead">${esc(t('obWelcomeText'))}</p>
            <p class="label">${ic('globe')} ${esc(t('language'))}</p>
            <div class="seg" data-pick-group="lang" data-value="${s.lang}">${[['de', 'Deutsch'], ['en', 'English'], ['cs', 'Čeština']].map(([v, l]) => `<button class="${s.lang === v ? 'on' : ''}" data-act="pick" data-v="${v}" role="radio" aria-checked="${s.lang === v}">${l}</button>`).join('')}</div>`,
          mount: (el) => { $('[data-pick-group="lang"]', el).addEventListener('picked', (e) => { s.lang = e.detail; save(); applyTheme(); renderChrome(); viewOnboarding(); }); } },
        { render: (d) => `<h1>${esc(t('obName'))}</h1><p class="lead">${esc(t('obNameText'))}</p><input type="text" id="o-name" value="${esc(d.name)}" placeholder="${esc(t('namePh'))}" autocomplete="given-name">`,
          collect: (el, d) => { d.name = $('#o-name', el).value.trim().slice(0, 40); } },
        { render: (d) => `<h1>${esc(t('obThemes'))}</h1><p class="lead">${esc(t('obThemesText'))}</p>
            <div class="chips" id="o-themes">${Object.entries(C().themes).map(([k, l]) => `<button class="chip ${d.themes.includes(k) ? 'on' : ''}" data-act="chip" data-k="${k}" aria-pressed="${d.themes.includes(k)}">${esc(l)}</button>`).join('')}</div>
            <p class="tiny">${ic('heart')} ${esc(t('privateNote'))}</p>`,
          collect: (el, d) => { d.themes = $$('#o-themes .chip.on', el).map((c) => c.dataset.k); } },
        { render: () => `<h1>${esc(t('obHow'))}</h1>
            <div class="how"><div>${ic('sun')}<p><strong>${esc(t('morningTitle'))}</strong><br>${esc(t('obHowMorning'))}</p></div>
            <div>${ic('moon')}<p><strong>${esc(t('eveningTitle'))}</strong><br>${esc(t('obHowEvening'))}</p></div>
            <div>${ic('compass')}<p><strong>${esc(t('weeklyTitle'))}</strong><br>${esc(t('obHowWeekly'))}</p></div>
            <div>${ic('feather')}<p><strong>${esc(t('tabJournal'))}</strong><br>${esc(t('obHowJournal'))}</p></div></div>
            <p class="note soft">${esc(t('obNoPressure'))}</p>` },
        { render: () => `<h1>${esc(t('obImportant'))}</h1><ul class="ob-list"><li>${esc(t('obImp1'))}</li><li>${esc(t('obImp2'))}</li><li>${esc(t('obImp3'))}</li><li>${esc(t('obImp4'))}</li></ul>`, next: t('obStart'),
          onNext: (d) => {
            s.name = d.name; s.themes = d.themes; s.onboarded = true; s.startDate = dkey(); save();
            if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
          } }
      ],
      exit: () => {},
      done: () => go('/')
    });
    $('[data-act="fclose"]') && ($('[data-act="fclose"]').hidden = true);
  }

  /* ---------- Router ---------- */
  function route() {
    cleanup(); applyTheme(); AU.stopAll(); syncAudio();
    const h = (location.hash || '#/').slice(1) || '/';
    if (!S.settings.onboarded && h !== '/help') return viewOnboarding();
    let m;
    if (h === '/' || h === '') return viewHome();
    if (h === '/morning') return viewMorning();
    if (h === '/evening') return viewEvening();
    if (h === '/weekly') return viewWeekly();
    if (h === '/exercises') return viewExercises();
    if ((m = h.match(/^\/ex\/([\w-]+)$/))) return viewExercise(m[1]);
    if (h === '/journal') return viewJournal();
    if (h === '/journal/new') return viewJournalNew();
    if ((m = h.match(/^\/journal\/([\w-]+)$/))) return viewJournalEntry(m[1]);
    if (h === '/path') return viewPath();
    if (h === '/settings') return viewSettings();
    if (h === '/help') return viewHelp();
    go('/');
  }

  window.addEventListener('hashchange', route);
  window.addEventListener('storage', (e) => { if (e.key === KEY) { S = load(); } });
  setInterval(applyTheme, 10 * 60 * 1000);
  renderChrome();
  route();

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
