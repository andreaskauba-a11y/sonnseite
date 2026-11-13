#!/usr/bin/env node
/* Sonnseite – Sprachdateien mit ElevenLabs erzeugen (Werkzeug für Entwickler, läuft nicht in der App).

   Was es tut:
   - sammelt alle Texte, die die App vorliest (geführte Übungen, Atem-Hinweise, Start-/Schlusssätze, Probesatz)
   - erzeugt je Stimme und Sprache eine MP3 pro Text unter public/audio/<stimme>/<sprache>/<schlüssel>.mp3
   - der Schlüssel ist eine Prüfsumme des Wortlauts: Ändert sich ein Text, fehlt die Datei → die App nimmt
     automatisch die Gerätestimme, bis neu vertont wurde
   - schreibt public/audio/voices.js (Liste der vorhandenen Dateien für die App)

   Aufruf (im Projektordner):
     node tools/vertonen.js --zaehlen                 nur zählen, was fehlt (kostet nichts)
     node tools/vertonen.js                           alles Fehlende erzeugen
     node tools/vertonen.js --stimme ruhig --sprache de
     node tools/vertonen.js --aufraeumen              Dateien löschen, deren Text es nicht mehr gibt
   Braucht: ELEVENLABS_API_KEY (oder einen Proxy, der den Schlüssel einsetzt), Node 22+, ffmpeg (für „warm“). */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PUB = path.join(ROOT, 'public');
const OUT = path.join(PUB, 'audio');
const LANGS = ['de', 'en', 'cs'];

/* Die drei Stimmen. Reihenfolge = Reihenfolge in den Einstellungen, die erste ist voreingestellt.
   pitch: nachträgliche Tonhöhe (1 = unverändert; 0.92 ≈ 1,4 Halbtöne tiefer, Klangfarbe bleibt erhalten). */
const VOICES = [
  { id: 'ruhig', eleven: 'XVsA9XmCysqjP3c4WWjQ', pitch: 1 },
  { id: 'warm', eleven: 'dKjMeTLofsZ9ItQnjm8S', pitch: 0.92 },
  { id: 'tief', eleven: 'X9RzaVZxOTuDzXj3Qhp1', pitch: 1 }
];
const MODEL = 'eleven_multilingual_v2';
const SETTINGS = { stability: 0.6, similarity_boost: 0.75, style: 0, use_speaker_boost: true, speed: 0.9 };
const SENTENCE_BREAK = '0.8s';

/* Muss mit audioKey() in public/js/audio.js übereinstimmen */
function audioKey(text) {
  const s = String(text).replace(/\s+/g, ' ').trim();
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return ('0000000' + h.toString(16)).slice(-8);
}

function loadTexts() {
  global.window = {};
  require(path.join(PUB, 'js/i18n.js'));
  LANGS.forEach((l) => require(path.join(PUB, `js/content/${l}.js`)));
  const res = {};
  for (const l of LANGS) {
    const I = window.I18N[l], C = window.CONTENT[l], list = [];
    ['inhale', 'hold', 'exhale', 'wellDone', 'breathStartVoice', 'voiceEnd', 'sampleText', 'sampleShort'].forEach((k) => list.push(I[k]));
    Object.values(C.exercises).filter((e) => e.type === 'guided').forEach((e) => { list.push(e.intro); e.steps.forEach((s) => list.push(s.t)); });
    const m = new Map(); list.filter(Boolean).forEach((t) => m.set(audioKey(t), t));
    res[l] = m;
  }
  return res;
}

/* Wie splitSentences() in audio.js: Anführungszeichen weg, Gedankenstrich → Komma, Sätze mit ruhiger Pause */
function prepare(text) {
  const clean = String(text).replace(/[„“”"«»]/g, '').replace(/\s+[–—]\s+/g, ', ');
  const parts = (clean.match(/[^.!?…]+[.!?…]*/g) || [clean]).map((s) => s.trim()).filter(Boolean);
  return parts.join(` <break time="${SENTENCE_BREAK}" /> `);
}

async function tts(voice, lang, text) {
  const key = process.env.ELEVENLABS_API_KEY || 'proxy-injected';
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice.eleven}?output_format=mp3_44100_64`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    const r = await fetch(url, { method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: prepare(text), model_id: MODEL, language_code: lang, voice_settings: SETTINGS }) });
    if (r.ok) return { buf: Buffer.from(await r.arrayBuffer()), cost: +(r.headers.get('x-character-count') || r.headers.get('character-cost') || 0) };
    const body = await r.text();
    if (r.status === 429 || r.status >= 500) { await new Promise((res) => setTimeout(res, 2000 * attempt)); continue; }
    throw new Error(`ElevenLabs ${r.status}: ${body.slice(0, 300)}`);
  }
  throw new Error('ElevenLabs: zu viele Fehlversuche');
}

function writeManifest() {
  const have = {};
  for (const v of VOICES) {
    have[v.id] = {};
    for (const l of LANGS) {
      const dir = path.join(OUT, v.id, l);
      const keys = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4)).sort() : [];
      have[v.id][l] = keys.join(' ');
    }
  }
  const js = '/* Automatisch erzeugt von tools/vertonen.js – nicht von Hand bearbeiten. */\n' +
    'window.SONN_VOICES = ' + JSON.stringify({ voices: VOICES.map((v) => v.id).filter((id) => LANGS.some((l) => have[id][l])), files: have }, null, 1) + ';\n';
  fs.writeFileSync(path.join(OUT, 'voices.js'), js);
}

async function main() {
  const arg = (n) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : null; };
  const flag = (n) => process.argv.includes('--' + n);
  const texts = loadTexts();
  const voices = VOICES.filter((v) => !arg('stimme') || v.id === arg('stimme'));
  const langs = LANGS.filter((l) => !arg('sprache') || l === arg('sprache'));

  if (flag('aufraeumen')) {
    for (const v of VOICES) for (const l of LANGS) {
      const dir = path.join(OUT, v.id, l); if (!fs.existsSync(dir)) continue;
      fs.readdirSync(dir).filter((f) => f.endsWith('.mp3') && !texts[l].has(f.slice(0, -4))).forEach((f) => { fs.unlinkSync(path.join(dir, f)); console.log('gelöscht', v.id, l, f); });
    }
    writeManifest(); return;
  }

  let missing = 0, chars = 0, cost = 0;
  try {
  for (const v of voices) for (const l of langs) {
    const dir = path.join(OUT, v.id, l); fs.mkdirSync(dir, { recursive: true });
    for (const [k, t] of texts[l]) {
      const file = path.join(dir, k + '.mp3');
      if (fs.existsSync(file)) continue;
      missing++; chars += t.length;
      if (flag('zaehlen')) continue;
      const { buf, cost: c } = await tts(v, l, t); cost += c;
      if (v.pitch !== 1) {
        const tmp = file + '.roh.mp3'; fs.writeFileSync(tmp, buf);
        execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-af', `rubberband=pitch=${v.pitch}:formant=preserved`, '-ac', '1', '-b:a', '64k', file]);
        fs.unlinkSync(tmp);
      } else fs.writeFileSync(file, buf);
      console.log(v.id, l, k, t.slice(0, 50));
    }
  }
  } finally { if (!flag('zaehlen')) writeManifest(); } // auch bei Abbruch (z. B. Kontingent aufgebraucht) festhalten, was da ist
  console.log(`${flag('zaehlen') ? 'Fehlend' : 'Erzeugt'}: ${missing} Dateien, ${chars} Zeichen${cost ? `, verrechnet laut ElevenLabs: ${cost}` : ''}`);
}
main().catch((e) => { console.error(e.message); process.exit(1); });
