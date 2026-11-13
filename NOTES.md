# Sonnseite – Stand & nächste Schritte

_Stand: 13. November 2026 · Version 1.3.0 (live auf Render über `main`)_

## Erledigt
### Version 1.0 – Grundversion
- Onboarding: Sprache, Name, Lebensthemen, Erklärung, wichtige Hinweise
- Morgenmoment, Abendmoment, Journal mit lokaler, regelbasierter Rückmeldung und Krisenerkennung
- Wochen-Check-up mit WHO-5 und Reflexionsfragen, Verlaufskurve ohne Noten
- 8-Wochen-Programm (wählbar) und 16 Übungen (Atem, geführt, Schreiben), jeweils mit „Warum das hilft“
- Garten, Stimmungsverlauf über 14 Tage, Lieblingsgedanken, Suche, PDF-Export, Sicherung und Import
- Hilfe-Seite mit Nummern für Österreich und Wien, Kalender-Erinnerungen (.ics), sanfte Hinweise in der App
- Drei Sprachen (de, en, cs), heller, dunkler und abends warm-dunkler Modus, drei Schriftgrößen, offline-fähig (PWA)
- Auf GitHub und Render veröffentlicht

### Version 1.1 – Stimme & Klang
- Gesprochene Anleitung bei allen geführten Übungen, Atemübungen und den Morgen-Atemzügen
- Stimme, Tonhöhe, Tempo und Lautstärke einstellbar, Tonhöhe automatisch Richtung neutrale Mitte
- Klangteppich und Klangschale auf 432 Hz (ohne Wirkversprechen), Bildschirm bleibt während der Übung an
- Schreibübungen optional mit leisen Klängen

### Version 1.2 – Feedback aus der Nutzung
- Garten-Himmel nach Tageszeit (echter Sonnenauf- und -untergang in Wien)
- Wochen-Check-up: Rückmeldung in drei Stufen mit Bezug auf die eigenen Antworten, Arzt-Hinweis bei mittleren Werten erst ab der zweiten Woche, Erklärung „Wie entsteht diese Rückmeldung?“
- Impulse bei allen Fragen, je drei Varianten, wechselnd täglich oder wöchentlich (de, en, cs)
- Textkorrekturen: „Gutes für dich tun“, klarere Abschlussnachricht bei „Gewitter“, „1 Moment“ in der Einzahl

### Version 1.3 – Natürliche Stimmen
- Drei selbst entworfene ElevenLabs-Stimmen für de, en, cs: Ruhig (eher neutral, voreingestellt), Warm (weiblich, leicht tiefer gestellt), Tief (männlich). 459 Aufnahmen, zusammen ca. 23 MB
- Auswahl in den Einstellungen, Gerätestimme als Wahlmöglichkeit und automatischer Ersatz für fehlende Aufnahmen
- Übungen laden ihre Aufnahmen vorab und speichern sie offline, getrennt von der App-Version
- Werkzeug `tools/vertonen.js` zum Nachvertonen geänderter Texte
- KI-Hinweis (EU AI Act) in den Einstellungen, in jeder Übung („Stimme: Ruhig (KI-generiert)“) und unter „Über Sonnseite“
- CSP um `media-src 'self' blob:` ergänzt
- Am Handy getestet und bestätigt (13.11.2026)

## Offen / zu beobachten
- **Natürliche Stimmen funktionieren am Handy** (vom Inhaber am 13.11.2026 bestätigt). Weiter beobachten: Lautstärke im Verhältnis zu Klangteppich und Klangschale, Verhalten bei gesperrtem Bildschirm, Rückmeldungen zu „Warm“ (tiefer gestellt).
- **Tschechische und englische Aufnahmen** von Muttersprachlerinnen probehören lassen (Aussprache, Betonung). Die Stimmen wurden auf Deutsch ausgesucht.
- **„Warm“ ist nachträglich tiefer gestellt** (Faktor 0.92). Auf Künstlichkeit achten; ohne Tieferstellen: in `tools/vertonen.js` `pitch: 1` setzen, Ordner `public/audio/warm` löschen und neu erzeugen.
- **ElevenLabs-Abo:** Das Starter-Abo kann gekündigt werden (Entscheidung beim Inhaber). Für spätere Textänderungen kurz wieder aktivieren. Die drei Stimmen bleiben im Konto gespeichert (IDs in `tools/vertonen.js`). Die nicht gewählten Entwürfe sind gelöscht.
- **Gerätestimme** (Ersatz und Wahlmöglichkeit) auf echten Geräten nicht gezielt geprüft. Im Test lief nur eine Attrappe.
- **Klangteppich und Klangschale noch nicht angehört.** Eventuell zu laut, zu leise oder zu tief. Werte stehen in `audio.js` (`startPad`, `bell`).
- **Tschechische Texte** von einer Muttersprachlerin gegenlesen lassen. Die Gedanken stehen in weiblicher Form, die WHO-5-Übersetzung ist eine eigene, keine offiziell validierte.
- **Neue Impuls-Varianten 2 und 3** wurden mit „online stellen“ freigegeben, aber nicht einzeln kommentiert. Auf Rückmeldungen achten.
- **Hilfe-Nummern** regelmäßig prüfen (gesundheit.gv.at). Die Zeiten der Kummernummer 116 123 sind bewusst nicht angegeben.
- **Datensicherheit:** Die Daten liegen nur im Browser. Nutzerinnen auf die Sicherung hinweisen, vor allem vor einem Handywechsel oder dem Löschen der Browserdaten. iOS kann Daten von Webseiten löschen, die lange nicht genutzt wurden. Mit der App auf dem Home-Bildschirm ist das unwahrscheinlicher.
- Krisen- und Rückmeldungs-Schlüsselwörter sind einfache Wortstämme. Fehlauslöser oder Lücken sind möglich, daher Rückmeldungen sammeln.

## Mögliche nächste Schritte (Ideen, nicht beauftragt)
- Naturgeräusche als Alternative zum Klangteppich (in Runde 1.1 zurückgestellt, braucht lizenzfreie Aufnahmen)
- Weitere geführte Übungen oder ein zweites 8-Wochen-Programm, damit sich nach 8 Wochen weniger wiederholt
- Rückmeldungen bei Bedarf mit KI erweitern (bewusst zurückgestellt: Datenschutz und Kosten)
- Kurze Anleitung zum Weitergeben an Freundinnen (Installieren, Stimme wählen, Sicherung)
- Tschechisch: eigene Stimme von einer tschechischen Sprecherin aus der ElevenLabs-Bibliothek (z. B. „Kami – Warm, Velvety and Soothing“), falls die Aufnahmen beim Probehören nicht überzeugen
- Stimme auch beim Morgenmoment-Hinweis kennzeichnen, falls gewünscht

## Nächste konkrete Schritte
1. Rückmeldungen von Freundinnen sammeln: Stimme (welche wird gewählt?), Tempo, Lautstärke der Stimme im Verhältnis zu den Klängen
2. Englische und tschechische Aufnahmen und Texte von Muttersprachlerinnen prüfen lassen
3. Danach gesammelte Korrekturen in einem Durchgang einbauen, geänderte Sätze nachvertonen (`tools/vertonen.js`, ElevenLabs-Abo dafür kurz aktivieren)
