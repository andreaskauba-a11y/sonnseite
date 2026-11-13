/* Sonnseite – Stimme & Klang
   Stimme: vorab aufgenommene, natürliche Stimmen (MP3 unter audio/<stimme>/<sprache>/, erzeugt mit tools/vertonen.js).
   Fehlt eine Aufnahme oder lässt sie sich nicht laden, spricht die eingebaute Sprachausgabe des Geräts (Web Speech API).
   Klang: wird live mit der Web Audio API erzeugt und ist auf A = 432 Hz gestimmt (als warme Klangfarbe;
   eine besondere Wirkung dieser Stimmung ist wissenschaftlich nicht belegt). */
(function () {
  'use strict';

  const LOCALES = { de: ['de-AT', 'de-DE', 'de-CH', 'de'], en: ['en-GB', 'en-IE', 'en-AU', 'en-US', 'en'], cs: ['cs-CZ', 'cs', 'sk-SK'] };
  /* Grobe Zuordnung bekannter Systemstimmen – nur um die Tonhöhe Richtung neutraler Mitte zu verschieben. */
  const HIGHER = /anna|petra|helena|katja|marlene|vicki|hedda|zuzana|samantha|karen|moira|tessa|serena|kate|martha|susan|victoria|allison|ava|hilda|ellen|sara|zira|hazel|libby|sonia|amala|jenny|aria|ingrid|female|frau|žena|iveta|vlasta|klara|seraphina|katja|elke|louisa|gisela|google uk english female/i;
  const LOWER = /markus|yannick|hans|stefan|conrad|daniel|alex|fred|tom|oliver|thomas|jakub|rishi|aaron|arthur|viktor|george|ryan|guy|david|mark|james|male|mann|muž|antonin|vlastimil|killian|florian|kasper|ralf|bernd|google uk english male/i;
  const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|deranged|hysterical|pipe organ|junior|ralph|princess|grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley/i;

  const synth = window.speechSynthesis || null;
  let voices = [];
  function loadVoices() { if (synth) voices = synth.getVoices() || []; }
  if (synth) { loadVoices(); synth.addEventListener && synth.addEventListener('voiceschanged', loadVoices); }

  function voicesFor(lang) {
    loadVoices();
    const pre = LOCALES[lang] || [lang];
    const base = pre[pre.length - 1];
    const list = voices.filter((v) => v.lang && v.lang.replace('_', '-').toLowerCase().startsWith(base.toLowerCase()) && !NOVELTY.test(v.name));
    const score = (v) => {
      let s = 0; const l = v.lang.replace('_', '-');
      const i = pre.findIndex((p) => p.toLowerCase() === l.toLowerCase()); s += i >= 0 ? (10 - i) : 0;
      if (/premium|enhanced|neural|natural|online/i.test(v.name)) s += 8;
      if (v.localService) s += 1;
      return s;
    };
    return list.sort((a, b) => score(b) - score(a));
  }
  function pickVoice(lang, uri) {
    const list = voicesFor(lang);
    return (uri && list.find((v) => v.voiceURI === uri)) || list[0] || null;
  }
  /* Automatische Tonhöhe: hohe Stimmen etwas tiefer, tiefe etwas höher → neutralere Mitte */
  function autoPitch(v) { if (!v) return 1; if (HIGHER.test(v.name)) return 0.88; if (LOWER.test(v.name)) return 1.14; return 1; }

  let cfg = { lang: 'de', voice: true, natural: 'ruhig', voiceURI: '', pitch: null, rate: 0.85, voiceVol: 1, music: true, musicVol: 0.5 };
  function configure(c) {
    cfg = Object.assign(cfg, c);
    if (master) master.gain.setTargetAtTime(musicLevel(), ctx.currentTime, 0.3);
    if (voiceGain) voiceGain.gain.setTargetAtTime(cfg.voiceVol, ctx.currentTime, 0.05);
  }
  const musicLevel = () => (cfg.music ? cfg.musicVol * 0.5 : 0);

  /* ---------- Sprechen ---------- */
  let speakToken = 0;
  function splitSentences(text) {
    const clean = String(text).replace(/[„“”"«»]/g, '').replace(/\s+[–—]\s+/g, ', ');
    return (clean.match(/[^.!?…:]+[.!?…:]*/g) || [clean]).map((s) => s.trim()).filter((s) => /[\p{L}\d]/u.test(s));
  }
  /* Gerätestimme: spricht Satz für Satz mit kleinen Pausen. */
  function speakDevice(text, opt, token) {
    if (!synth) return Promise.resolve(false);
    synth.cancel();
    const v = pickVoice(cfg.lang, cfg.voiceURI);
    const parts = splitSentences(text);
    const pitch = cfg.pitch != null ? cfg.pitch : autoPitch(v);
    return parts.reduce((p, part, i) => p.then((ok) => {
      if (token !== speakToken) return false;
      return new Promise((res) => {
        const u = new SpeechSynthesisUtterance(part);
        if (v) { u.voice = v; u.lang = v.lang; } else u.lang = (LOCALES[cfg.lang] || ['de-DE'])[0];
        u.rate = opt.rate || cfg.rate; u.pitch = pitch; u.volume = cfg.voiceVol;
        const est = 1500 + part.length * 95 / u.rate; let done = false;
        const fin = () => { if (done) return; done = true; clearTimeout(guard); setTimeout(() => res(token === speakToken), i < parts.length - 1 ? 550 : 0); };
        const guard = setTimeout(fin, est + 4000); // Sicherheitsnetz, falls ein Browser "onend" verschluckt
        u.onend = fin; u.onerror = fin;
        synth.speak(u);
      });
    }), Promise.resolve(true));
  }

  /* ---------- Natürliche Stimmen (Aufnahmen) ---------- */
  const NAT = window.SONN_VOICES || { voices: [], files: {} };
  const NAT_SPEED = 0.85; // Standardtempo; die Aufnahmen sind dafür gemacht. Andere Tempi → schneller/langsamer abspielen, Tonhöhe bleibt.
  /* Muss mit audioKey() in tools/vertonen.js übereinstimmen */
  function audioKey(text) {
    const str = String(text).replace(/\s+/g, ' ').trim();
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ('0000000' + h.toString(16)).slice(-8);
  }
  const haveSets = {};
  function hasRecording(voice, lang, key) {
    const id = voice + '/' + lang;
    if (!haveSets[id]) haveSets[id] = new Set(((NAT.files[voice] || {})[lang] || '').split(' ').filter(Boolean));
    return haveSets[id].has(key);
  }
  function recordingUrl(text) {
    const v = cfg.natural; if (!v || NAT.voices.indexOf(v) < 0) return null;
    const k = audioKey(text);
    return hasRecording(v, cfg.lang, k) ? `audio/${v}/${cfg.lang}/${k}.mp3` : null;
  }
  const blobs = new Map(); // url → Promise<objectURL>, damit der nächste Satz schon bereitliegt
  function fetchRecording(url) {
    if (!blobs.has(url)) {
      const p = fetch(url).then((r) => { if (!r.ok) throw new Error(r.status); return r.blob(); }).then((b) => URL.createObjectURL(b));
      p.catch(() => blobs.delete(url));
      blobs.set(url, p);
      if (blobs.size > 60) { const first = blobs.keys().next().value; const old = blobs.get(first); blobs.delete(first); old.then((u) => URL.revokeObjectURL(u), () => {}); }
    }
    return blobs.get(url);
  }
  /* Lädt Aufnahmen vorab (z. B. alle Schritte einer Übung) – Fehler werden still ignoriert. */
  function prefetch(texts) { if (!cfg.voice) return; (texts || []).forEach((t) => { const u = recordingUrl(t); if (u) fetchRecording(u).catch(() => {}); }); }
  let player = null, voiceGain = null;
  function ensurePlayer() {
    if (player) return player;
    player = new Audio(); player.preload = 'auto'; player.setAttribute('playsinline', '');
    const c = ensureCtx();
    if (c && c.createMediaElementSource) {
      try { const src = c.createMediaElementSource(player); voiceGain = c.createGain(); voiceGain.gain.value = cfg.voiceVol; src.connect(voiceGain); voiceGain.connect(c.destination); } catch (e) { voiceGain = null; }
    }
    return player;
  }
  function playRecording(url, opt, token) {
    return fetchRecording(url).then((obj) => new Promise((res, rej) => {
      if (token !== speakToken) { res(false); return; }
      const a = ensurePlayer(); ensureCtx();
      let done = false, guard = null;
      const end = (ok) => { if (done) return; done = true; clearTimeout(guard); a.onended = a.onerror = a.onloadedmetadata = null; ok === 'err' ? rej(new Error('play')) : res(token === speakToken); };
      a.onended = () => end(true); a.onerror = () => end('err');
      a.onloadedmetadata = () => { clearTimeout(guard); guard = setTimeout(() => end(true), (a.duration || 20) * 1000 / a.playbackRate + 4000); };
      a.src = obj;
      a.preservesPitch = true; a.webkitPreservesPitch = true;
      a.playbackRate = Math.min(1.2, Math.max(0.8, (opt.rate ? opt.rate + 0.05 : cfg.rate) / NAT_SPEED));
      if (!voiceGain) a.volume = cfg.voiceVol;
      guard = setTimeout(() => end('err'), 8000); // lädt/startet nicht → Gerätestimme
      const pr = a.play(); if (pr && pr.catch) pr.catch(() => end('err'));
      a._end = end;
    }));
  }
  /* Spricht einen Text: zuerst mit der gewählten natürlichen Stimme, sonst mit der Gerätestimme.
     Liefert ein Promise, das nach dem Sprechen erfüllt wird (false, wenn abgebrochen). */
  function speak(text, opt = {}) {
    if (!cfg.voice || !text) return Promise.resolve(false);
    const token = ++speakToken;
    if (synth) synth.cancel();
    if (player && player._end) { player.pause(); player._end(false); }
    const url = recordingUrl(text);
    if (!url) return speakDevice(text, opt, token);
    return playRecording(url, opt, token).catch(() => (token === speakToken ? speakDevice(text, opt, token) : false));
  }
  function stopSpeech() { speakToken++; if (synth) synth.cancel(); if (player && player._end) { player.pause(); player._end(false); } }
  const speechAvailable = () => !!synth || NAT.voices.length > 0;
  const naturalVoices = () => NAT.voices.slice();

  /* ---------- Klang (Web Audio, A = 432 Hz) ---------- */
  const A = 432;
  const note = (semi) => A * Math.pow(2, semi / 12); // Halbtöne relativ zu a' = 432 Hz
  let ctx = null, master = null, padNodes = null;
  function ensureCtx() {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    if (!ctx) { ctx = new AC(); master = ctx.createGain(); master.gain.value = musicLevel(); master.connect(ctx.destination); }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  /* Muss aus einem Tipp heraus aufgerufen werden (iOS gibt Ton & Sprache sonst nicht frei). */
  function unlock() {
    const c = ensureCtx();
    if (c) { const b = c.createBuffer(1, 1, 22050); const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0); }
    if (synth && !unlock.done) { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; synth.speak(u); unlock.done = true; }
    if (cfg.natural && !unlock.player) { const a = ensurePlayer(); if (a.paused) { a.src = 'audio/stille.mp3'; const pr = a.play(); if (pr && pr.catch) pr.catch(() => {}); } unlock.player = true; }
  }

  /* Warmer Klangteppich: offene Quinten + Terz in A-Dur, sanft schwebend */
  function startPad() {
    const c = ensureCtx(); if (!c || padNodes) return;
    const out = c.createGain(); out.gain.value = 0;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 0.3;
    out.connect(lp); lp.connect(master);
    const voicesF = [note(-24), note(-17), note(-12), note(-8), note(-5)]; // A2 108 · E3 · A3 216 · C#4 · E4
    const amps = [0.32, 0.2, 0.22, 0.1, 0.09];
    const nodes = [];
    voicesF.forEach((f, i) => {
      [-3, 3].forEach((cents, j) => {
        const o = c.createOscillator(); o.type = i === 0 ? 'sine' : 'triangle'; o.frequency.value = f; o.detune.value = cents;
        const g = c.createGain(); g.gain.value = amps[i] * 0.5;
        const lfo = c.createOscillator(); lfo.frequency.value = 0.05 + i * 0.023 + j * 0.011;
        const lg = c.createGain(); lg.gain.value = amps[i] * 0.22; lfo.connect(lg); lg.connect(g.gain);
        o.connect(g); g.connect(out); o.start(); lfo.start(); nodes.push(o, lfo);
      });
    });
    // langsames Öffnen und Schließen des Filters – wie ruhiges Atmen
    const fl = c.createOscillator(); fl.frequency.value = 0.04; const fg = c.createGain(); fg.gain.value = 350; fl.connect(fg); fg.connect(lp.frequency); fl.start(); nodes.push(fl);
    out.gain.setTargetAtTime(0.9, c.currentTime, 2.5);
    padNodes = { out, nodes };
  }
  function stopPad() {
    if (!padNodes || !ctx) return;
    const p = padNodes; padNodes = null;
    p.out.gain.cancelScheduledValues(ctx.currentTime);
    p.out.gain.setTargetAtTime(0, ctx.currentTime, 1.2);
    setTimeout(() => { p.nodes.forEach((n) => { try { n.stop(); } catch (e) { /* */ } }); p.out.disconnect(); }, 6000);
  }
  /* Klangschale: unharmonische Teiltöne mit langem Ausklingen. kind: 'step' | 'in' | 'out' | 'end' */
  function bell(kind = 'step') {
    const c = ensureCtx(); if (!c || !cfg.music) return;
    const base = { step: note(-12), in: note(-5), out: note(-12), end: note(-24) }[kind] || note(-12);
    const vol = { step: 0.5, in: 0.22, out: 0.22, end: 0.6 }[kind] || 0.4;
    const dur = { step: 6, in: 3, out: 3, end: 9 }[kind] || 5;
    const t0 = c.currentTime;
    [[1, 1], [2.76, 0.45], [5.4, 0.22], [8.93, 0.1]].forEach(([r, a]) => {
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = base * r;
      const g = c.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol * a, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur / Math.sqrt(r));
      o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.1);
    });
  }

  /* ---------- Bildschirm wach halten ---------- */
  let wake = null;
  async function keepAwake(on) {
    try {
      if (on && 'wakeLock' in navigator && !wake) { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); }
      if (!on && wake) { await wake.release(); wake = null; }
    } catch (e) { /* nicht unterstützt oder verweigert */ }
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && keepAwake.want) keepAwake(true); });
  function awake(on) { keepAwake.want = on; keepAwake(on); }

  function stopAll() { stopSpeech(); stopPad(); awake(false); }

  window.SonnAudio = { configure, speak, stopSpeech, speechAvailable, naturalVoices, prefetch, audioKey, voicesFor, pickVoice, autoPitch, unlock, startPad, stopPad, bell, awake, stopAll, A };
})();
