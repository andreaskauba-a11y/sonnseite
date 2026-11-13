# Sonnseite – Hinweise für Claude

Web-App (PWA) für Menschen in herausfordernden Lebensphasen. Sie soll Zuversicht, Motivation und Resilienz stärken und arbeitet mit evidenzbasierten Methoden. Zielgruppe: Erwachsene von 35 bis 65, eher weiblich, vor allem am Handy. Genutzt wird die App privat (Inhaber und dessen Freundes- und Bekanntenkreis), kommerziell ist sie nicht.

Der Inhaber schreibt auf Deutsch und ist kein Entwickler. **Antworten bitte auf Deutsch, verständlich und ohne Fachjargon.**

## Tech-Stack
- **Vanilla HTML, CSS und JavaScript.** Kein Framework, kein Build-Schritt, keine npm-Abhängigkeiten. Das soll so bleiben.
- **PWA:** `manifest.webmanifest` und `sw.js` (Netzwerk zuerst, Cache als Rückfall). Die App funktioniert offline.
- **Speicher:** nur `localStorage`, Schlüssel `sonnseite.v1`. Kein Server, kein Konto, kein Tracking, keine externen Schriften, Skripte oder Anfragen.
- **Stimme:** vorab erzeugte MP3-Aufnahmen (ElevenLabs, drei Stimmen) unter `public/audio/`, als Ersatz die Sprachausgabe des Geräts (Web Speech API).
- **Klang:** Web Audio API, live erzeugt. Es gibt keine Audiodateien.
- **Hosting:** GitHub (`andreaskauba-a11y/sonnseite`, Branch `main`) wird automatisch auf Render als Static Site veröffentlicht (`render.yaml`, Ordner `public/`). Jeder Push auf `main` geht live.

## Struktur
```
public/
  index.html            Grundgerüst, Kopfzeile, Tab-Leiste, lädt alle Skripte (Reihenfolge wichtig)
  sw.js                 Service Worker – CACHE-Version bei jeder Änderung erhöhen (Aufnahmen liegen in eigenem AUDIO_CACHE)
  manifest.webmanifest  PWA-Manifest
  css/style.css         Gesamtes Design (Farb-Tokens in :root, Dunkelmodus über [data-theme="dark"])
  audio/                Sprachaufnahmen: <stimme>/<sprache>/<prüfsumme>.mp3, voices.js (Liste, automatisch erzeugt), stille.mp3
  icons/                App-Icons (SVG + PNG, per Playwright aus SVG gerendert)
  js/i18n.js            Oberflächentexte de/en/cs (window.I18N)
  js/content/{de,en,cs}.js  Inhalte (window.CONTENT[lang]): Gedanken, Fragen, Impulse, Übungen,
                        8-Wochen-Programm, Rückmeldungsregeln, WHO-5, Hilfe-Nummern, Über-Texte.
                        Am Ende jeder Datei ein Object.assign-Block mit Impulsen und Wochen-Rückmeldungsstufen.
  js/audio.js           window.SonnAudio: speak() (Aufnahme, sonst Gerätestimme), prefetch(), Klangteppich, Klangschale, Wake Lock
  js/app.js             Ganze App in einer IIFE: Speicher, Router, Ansichten, Abläufe, Garten, Diagramme
tools/vertonen.js       Erzeugt fehlende Aufnahmen mit ElevenLabs (Node 22 + ffmpeg), schreibt audio/voices.js
render.yaml             Render-Blueprint (Static Site, Sicherheits-Header inkl. CSP)
README.md               Beschreibung und Deploy-Anleitung für Menschen
NOTES.md                Aktueller Stand, offene Punkte, nächste Schritte
```

**Aufbau von app.js** (in dieser Reihenfolge): Helfer, Speicher (`defaults`/`load`/`save`), `t()` und `C()` für Texte und Inhalte, Icons (`P`, `ic()`), Ansicht und Aktionen (`view`, `act`, Klick-Delegation über `data-act`/`data-go`), Darstellung, Stimme und Klang (`syncAudio`, `audioBar`), Tagesinhalte (`programIndex`, `dailyAffIndex`, Impulse über `hint()`), Garten (`sunTimes`, `dayPhase`, `garden`), Rückmeldungen (`analyze`, `feedbackCard`, `crisisCard`), `flow()` für Abläufe mit Schritten, danach die Ansichten (Home, Morgen, Abend, Übungen, Journal, Woche, Mein Weg, Einstellungen, Hilfe, Onboarding) und am Ende der Router.

**Routen** (Hash): `#/`, `#/morning`, `#/evening`, `#/weekly`, `#/exercises`, `#/ex/:id`, `#/journal`, `#/journal/new`, `#/journal/:id`, `#/path`, `#/settings`, `#/help`, `#/imprint` (Impressum, auch vor dem Onboarding erreichbar; Name und E-Mail in `OWNER` in app.js, Texte unter `imprint` in `content/*.js`).

## Wichtige Befehle
```bash
# Lokal starten
cd public && python3 -m http.server 8765

# Syntax prüfen
node --check public/js/app.js && node --check public/js/audio.js

# Aufnahmen: zählen (kostenlos), erzeugen, alte löschen (Schlüssel kommt über den Proxy bzw. ELEVENLABS_API_KEY)
node tools/vertonen.js --zaehlen
NODE_USE_ENV_PROXY=1 node tools/vertonen.js
node tools/vertonen.js --aufraeumen

# Inhalte auf gleiche Länge prüfen (Beispiel)
node -e "global.window={};require('./public/js/content/de.js');const c=window.CONTENT.de;console.log(c.morningHints.length,c.morningQuestions.length)"
```
**Testen:** mit Playwright (vorinstalliert, `require('playwright')`), Gerät `devices['iPhone 13']`, `locale: 'de-AT'`, `timezoneId: 'Europe/Vienna'`. Tageszeiten testet man mit `page.clock.install({ time })`. Die Stimme im Test durch eine Attrappe von `speechSynthesis` ersetzen (Init-Script), die gesprochene Texte protokolliert. Testdaten über `localStorage.setItem('sonnseite.v1', …)` setzen, **danach `reload()`**, denn ein reiner Hash-Wechsel lädt die Daten nicht neu. Immer auf `pageerror` achten und auf waagrechtes Überlaufen prüfen.

## Konventionen
- **Jede Textänderung in allen drei Sprachen** (de, en, cs). Die Arrays müssen in allen Sprachen **gleich lang und gleich sortiert** sein: `affirmations`, `morningQuestions` und `morningHints`, `eveningQuestions` und `eveningHints`, `themeHints`, `program`, `who5Short`, die Felder der Übungen und `exerciseHints`. Gespeichert werden Indizes, keine Texte, damit ein Sprachwechsel funktioniert.
- **Deutsch:** Du-Form, warm, neutrales Hochdeutsch mit leicht österreichischer Note (Kassa, Sonnseite). Typografische Anführungszeichen „…“ und Halbgeviertstrich –.
- **Tschechisch:** Die Gedanken und Impulse stehen in weiblicher Form, passend zur Zielgruppe. Die Texte sollten von einer Muttersprachlerin gegengelesen werden.
- **Gesprochene Texte geändert?** (Übungen vom Typ `guided`, `inhale`/`hold`/`exhale`, `wellDone`, `breathStartVoice`, `voiceEnd`, `sampleText`, `sampleShort`) → `tools/vertonen.js` laufen lassen, danach `--aufraeumen`. Bis dahin spricht für geänderte Texte automatisch die Gerätestimme. Der Dateiname ist eine Prüfsumme des Wortlauts (`audioKey`, in `audio.js` und `vertonen.js` identisch halten).
- **Jede Nutzereingabe wird mit `esc()` ausgegeben** (XSS). Mehrzeiliger Text über `nl2br()`.
- **Bei jeder Änderung an `public/`:** `CACHE` in `sw.js` **und** `VERSION` in `app.js` erhöhen (aktuell 1.3.1). Sonst bekommen Handys die neue Version nicht.
- Icons sind feine, abgerundete Linien-SVGs im Objekt `P` (`stroke-width 1.6`). Emojis werden in der Oberfläche nicht verwendet.
- Lesbarkeit für die Zielgruppe: Grundschrift 18px, Schriftgröße in drei Stufen einstellbar, Touch-Ziele mindestens 44px.
- Commits auf Deutsch, Absender `Claude <noreply@anthropic.com>` (ein Hook prüft das).

## Grundsatzentscheidungen (mit dem Inhaber abgestimmt)
**Inhalte und Haltung**
- Nur **evidenzbasierte Methoden**: Positive Psychologie (drei gute Dinge, Dankbarkeitsbrief, bestmögliches Selbst, Genießen, VIA-Stärken), Achtsamkeit (MBSR, Body-Scan, Atem), Selbstmitgefühl (Neff/Germer), KVT (Gedanken prüfen), ACT (Werte), PMR, expressives Schreiben. Jede Übung hat einen Abschnitt „Warum das hilft“ mit Quelle und ehrlicher Angabe zur Stärke der Wirkung.
- **Keine Heilsversprechen, keine Esoterik, kein „Manifestieren“.** Spiritualität ist ausgeschlossen (in der VIA-Liste steht „Sinnerleben“).
- **Gedanken des Tages realistisch und freundlich** („Ich darf …“), keine überzogenen „Ich bin glücklich“-Sätze (Wood et al., 2009).
- **Kein Druck:** keine Serien, keine Punkte. Der Garten wächst mit jedem Eintrag und welkt nie.
- **Rückmeldungen sind regelbasiert und lokal**, ohne KI und ohne Server: Schlüsselwörter → Kategorie → Antwort, Anschlussfrage und passende Übung. Die KI-Variante wurde bewusst abgelehnt (Datenschutz, Kosten), ist später aber nachrüstbar.
- **Krisenerkennung:** Bestimmte Wörter zeigen sofort eine Karte mit Notrufnummern (142, PSD 01 31330, 144). Die Hilfe-Seite ist jederzeit über das Herz-Symbol oben erreichbar.
- **Hilfe-Nummern für Österreich mit Schwerpunkt Wien** (Stand November 2026, geprüft auf gesundheit.gv.at). Sie stehen in `content/*.js` unter `help`.
- **Formulierungen dürfen nicht verunsichern.** Jede Rückmeldung bezieht sich ausdrücklich auf das, was die Person selbst angegeben hat. Kein unklares „so“.

**Abläufe**
- **Morgenmoment** (3–5 Min.): inneres Wetter, drei Atemzüge, Gedanke des Tages, Ausrichtung, Vorfreude.
- **Abendmoment** (5–10 Min.): drei gute Dinge, Reflexionsfrage (greift den Vorsatz vom Morgen auf), an schweren Tagen ein Selbstmitgefühls-Schritt, Rückmeldung.
- **Stimmung als „inneres Wetter“** (Gewitter, Regen, Bewölkt, Sonne & Wolken, Sonnig) statt Gesichtern.
- **8 Wochenthemen**, die sich automatisch abwechseln und manuell wählbar sind (`programShift`).
- **Wochen-Check-up:** WHO-5 (Originalskala, Bezug auf die letzten zwei Wochen) plus Reflexionsfragen. **Ergebnisse ohne Noten und ohne Zahlen**, nur als sanfte Kurve. Die Rückmeldung hat **drei Stufen**:
  - ≥ 50: nur ein Spiegel, zum Beispiel „besonders: {best}“.
  - 29–48: „am wenigsten: {low}“ und eine Übung. Der Arzt-Hinweis kommt **erst, wenn das zwei Wochen in Folge so ist**.
  - ≤ 28: sofort ein klarer Hinweis mit Begründung und Link zur Hilfe-Seite.
  - Dazu gibt es immer die aufklappbare Erklärung „Wie entsteht diese Rückmeldung?“.
- **Impulse als Platzhalter im Eingabefeld**, je drei Varianten pro Frage. Sie wechseln täglich (Morgen und Abend, `dayNum`), wöchentlich (Check-up, `weekIdx`) oder alle 8 Wochen (Wochenthema). Variante 1 ist jeweils vom Inhaber freigegeben.

**Erinnerungen**
- Push-Benachrichtigungen ohne Server sind unzuverlässig. Deshalb gibt es **eine Kalenderdatei (.ics)** mit zwei täglichen Terminen und sanfte Hinweise in der App, die sich abschalten lassen.

**Stimme und Klang**
- **Natürliche Stimmen (ab 1.3):** einmalig mit ElevenLabs erzeugte Aufnahmen (Starter-Tarif des Inhabers, `eleven_multilingual_v2`, stability 0.6, speed 0.9, 0,8 s Pause zwischen Sätzen). Drei selbst entworfene Stimmen (Voice Design) für alle drei Sprachen: **Ruhig** (eher neutral, ~125 Hz, voreingestellt), **Warm** (weiblich, nachträglich mit ffmpeg/rubberband um Faktor 0.92 tiefer gestellt, ~185 Hz) und **Tief** (männlich, ~100 Hz). Auswahlkriterien des Inhabers: tief, ruhig, gleichmäßig. Eine frühere weibliche Stimme wurde verworfen, weil ihre Tonhöhe von Satz zu Satz stark schwankte („als würde jemand anderer sprechen“).
- Aufnahmen werden erst beim Abspielen geladen (die ganze Übung vorab) und dann offline gespeichert. Wiedergabe über ein `Audio`-Element (Blob-URL, `preservesPitch`), Lautstärke über Web Audio. Das Tempo wirkt als Abspielgeschwindigkeit relativ zu 0.85.
- **Gerätestimme bleibt als Ersatz** (fehlende Aufnahme, Ladefehler, offline beim ersten Mal) und als Wahlmöglichkeit „Stimme des Geräts“. Dort gilt: weibliche Stimmen automatisch etwas tiefer (0.88), männliche etwas höher (1.14), Tonhöhe einstellbar.
- **Klang auf A = 432 Hz**, aber **ausdrücklich ohne Wirkversprechen** (nur als Klangfarbe). Das ist im Text der Einstellungen so festgehalten.
- **Geführte Übungen:** Einleitung, dann je Schritt Klangschale, gesprochener Satz und mindestens 5 Sekunden Stille. Bei Atemübungen werden die ersten 3 Zyklen gesprochen, danach geben nur Töne den Rhythmus vor. Der Bildschirm bleibt an (Wake Lock).

**Design**
- Warme Pastell- und Erdtöne (Terrakotta, Salbei, Ocker, Rosé, Creme), Serifenschrift für Überschriften, Systemschrift für Text. Abends automatisch warm-dunkel.
- **Der Garten-Himmel folgt der Tageszeit** (berechnet aus Sonnenauf- und -untergang in Wien, NOAA-Näherung): Morgenröte, Tag (Pastellblau, Sonne, Wolken), Abendrot, Nacht (Mond, Sterne). Unabhängig vom hellen oder dunklen Modus.

## Arbeitsweise mit dem Inhaber
- **Vor dem Umsetzen Zwischenergebnisse zur Freigabe vorlegen**: Vorschau-Bilder, Textentwürfe als Liste. Erst nach „passt“ oder „umsetzen“ einbauen.
- **Erst nach ausdrücklicher Freigabe („online stellen“) auf `main` pushen**, denn jeder Push geht live. Vorher nur lokal committen.
- Rückfragen mit Empfehlung stellen („[Vorschlag: …]“), damit der Inhaber kurz antworten kann.
- Nach Änderungen mit Playwright testen und Bildschirmfotos zeigen. Ehrlich sagen, was nicht geprüft werden konnte, etwa wie die Stimme tatsächlich klingt.
