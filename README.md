# Sonnseite ☀

Ein sanfter, wissenschaftlich fundierter Begleiter für **Zuversicht, Achtsamkeit und Resilienz** – für Menschen in herausfordernden Lebensphasen.
Web-App (PWA) für das Handy, auf Deutsch, Englisch und Tschechisch.

## Was die App kann
- **Morgenmoment** (3–5 Min.): inneres Wetter, drei ruhige Atemzüge, Gedanke des Tages, Ausrichtung, Vorfreude
- **Abendmoment** (5–10 Min.): drei gute Dinge, Reflexionsfrage, an schweren Tagen ein Selbstmitgefühls-Schritt, freundliche Rückmeldung mit Anschlussfrage
- **Journal** mit Schreibimpulsen und regelbasierter Rückmeldung (läuft lokal, keine KI, kein Server)
- **Wochen-Check-up**: WHO-5-Wohlbefindensfragebogen + Reflexionsfragen, sanfte Verlaufskurve ohne „Noten“
- **8-Wochen-Programm** mit Wochenthemen (frei wechselbar) und **16 Übungen** (Atem, Body-Scan, 5-4-3-2-1, Selbstmitgefühl, Gedanken prüfen, Werte, Stärken, bestmögliches Selbst, Genießen, Dankbarkeitsbrief, expressives Schreiben, Muskelentspannung …) – jeweils mit „Warum das hilft“ und Quellen
- **Stimme & Klang** bei allen geführten Übungen und Atemübungen: gesprochene Anleitung über die Sprachausgabe des Geräts (offline, Stimme/Tonhöhe/Tempo wählbar), live erzeugter Klangteppich und Klangschale auf 432 Hz (als Klangfarbe, ohne Wirkversprechen); der Bildschirm bleibt während der Übung an
- **Garten**, der mit jeder Selbstfürsorge wächst und nie welkt – keine Streaks, kein Druck
- **Hilfe-Seite** mit Krisennummern für Österreich/Wien; Krisenwörter in Texten zeigen sofort Hilfe an
- Erinnerungen über **Kalenderdatei (.ics)**, sanfte Hinweise in der App (abschaltbar)
- Suche, **PDF-Export**, Sicherung/Wiederherstellung (JSON), Schriftgröße, Hell/Dunkel/abends warm-dunkel

## Datenschutz
Keine Konten, kein Server, kein Tracking, keine externen Schriften oder Skripte. Alle Daten liegen im `localStorage` des Geräts.
Wer Browserdaten löscht, verliert die Einträge – deshalb gibt es die Sicherung in den Einstellungen.

## Lokal starten
```bash
cd public && python3 -m http.server 8080
```
Dann http://localhost:8080 öffnen.

## Auf Render veröffentlichen
1. Repository auf GitHub pushen.
2. In Render: **New → Blueprint** → dieses Repository wählen. `render.yaml` richtet eine kostenlose *Static Site* ein (Ordner `public`, kein Build).
   Alternativ: **New → Static Site**, Build Command leer lassen, Publish Directory `public`.
3. Die URL (z. B. `https://sonnseite.onrender.com`) am Handy öffnen und „Zum Home-Bildschirm“ hinzufügen.

## Stimme & Klang
Code in `public/js/audio.js` (Web Speech API + Web Audio API, keine Audiodateien).

## Inhalte anpassen
- Oberflächentexte: `public/js/i18n.js`
- Gedanken, Fragen, Übungen, Programm, Rückmeldungen, Hilfe-Nummern: `public/js/content/{de,en,cs}.js`
  (Die Reihenfolge der `affirmations` muss in allen Sprachen gleich bleiben.)
- Nach Änderungen in `public/sw.js` die Versionsnummer in `CACHE` erhöhen, damit Handys die neue Version laden.

## Hinweise
Sonnseite ist keine Therapie und kein Medizinprodukt. WHO-5 © Psychiatric Research Unit, WHO Collaborating Centre in Mental Health – nicht-kommerzielle Nutzung.
Krisennummern Stand November 2026 – bitte regelmäßig prüfen (gesundheit.gv.at).
