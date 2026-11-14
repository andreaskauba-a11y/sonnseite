#!/usr/bin/env node
/* Setzt einen neuen Zugangscode für die Sonnseite.
   Aufruf: node tools/zugangscode.js <neuer-code>
   Trägt den Prüfwert in public/js/app.js ein. Danach VERSION (app.js) und CACHE (sw.js) erhöhen und veröffentlichen.
   Wichtig: Alle bisherigen Geräte müssen sich dann mit dem neuen Code erneut freischalten. */
const crypto = require('crypto'); const fs = require('fs'); const path = require('path');
const code = String(process.argv[2] || '').toLowerCase().replace(/[^a-z0-9äöüß-]/g, '');
if (code.length < 6) { console.error('Bitte einen Code mit mindestens 6 Zeichen angeben (Buchstaben, Ziffern, Bindestrich).'); process.exit(1); }
const hash = crypto.createHash('sha256').update('sonnseite:' + code).digest('hex');
const file = path.join(__dirname, '..', 'public', 'js', 'app.js');
const src = fs.readFileSync(file, 'utf8');
if (!/const ACCESS_HASH = '[0-9a-f]{64}';/.test(src)) { console.error('ACCESS_HASH in app.js nicht gefunden.'); process.exit(1); }
fs.writeFileSync(file, src.replace(/const ACCESS_HASH = '[0-9a-f]{64}';/, `const ACCESS_HASH = '${hash}';`));
console.log('Neuer Zugangscode gesetzt: ' + code);
