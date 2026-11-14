# Sonnseite – Stand & nächste Schritte

_Stand: 14. November 2026 · Version 1.4.1 (live auf Render über `main`)_

## Aktueller Stand
- App läuft auf Render, geschützt durch Zugangscode (einmal pro Gerät) und Einladungslink. Freund:innen sind informiert.
- Auf Android vom Inhaber geprüft (14.11.2026): Zugangsschutz, Teilen, Stimmen, Klangteppich und Klangschale passen. „Warm“ klingt manchmal etwas künstlich, ist aber in Ordnung. Anleitung zum Weitergeben ist erstellt. Impressum und Datenschutz zur Kenntnis genommen.
- Nutzungszahlen: nur die Render-Übersicht (bewusst kein Zähler).

## Offen
**Dringend**
- **Zugangscode stand im Klartext in `NOTES.md`** (öffentliches Repository, auch im Verlauf). Entscheidung des Inhabers: Code ändern (`node tools/zugangscode.js <neuer-code>`, alle müssen neu freischalten) oder Repository auf „privat“ stellen (Render muss danach noch Zugriff haben) oder bewusst so lassen (Schutz gilt ohnehin nur gegen Zufallsbesucher).

**Prüfen**
- **iPhone:** Zugangscode und Einladungslink (Safari vs. installierte App haben getrennten Speicher), Stimme bei gesperrtem Bildschirm, Speicherort der Sicherungsdatei, Update-Fenster.
- **Render:** Spielen die Aufnahmen ab (CSP aus `render.yaml`)? Auf Android offenbar ja. Falls nicht: Blueprint in Render synchronisieren.

**Gegenlesen lassen**
- Alle **tschechischen Texte** von einer Muttersprachlerin (weibliche Form bei Gedanken und Impulsen; die WHO-5-Übersetzung ist eine eigene, keine validierte).
- **Englische und tschechische Aufnahmen** probehören (Aussprache, Betonung). Die Stimmen wurden auf Deutsch ausgesucht.
- **Impressum und Datenschutz** sind keine Rechtsberatung, bei Bedarf von einer Fachperson prüfen lassen. Bei Änderung von Hosting oder Kontakt anpassen.

**Laufend beobachten**
- **Hilfe-Nummern** regelmäßig auf gesundheit.gv.at prüfen. Die Zeiten der Kummernummer 116 123 sind bewusst nicht angegeben.
- **Schlüsselwörter** für Krisen und Rückmeldungen sind einfache Wortstämme: Fehlauslöser oder Lücken sind möglich, Rückmeldungen sammeln. Das gilt auch für die Impuls-Varianten 2 und 3 (freigegeben, nicht einzeln kommentiert).
- **„Warm“** ist nachträglich tiefer gestellt (Faktor 0.92). Ohne Tieferstellen: in `tools/vertonen.js` `pitch: 1` setzen, Ordner `public/audio/warm` löschen und neu erzeugen.
- **ElevenLabs:** Das Starter-Abo kann gekündigt werden. Für Textänderungen an gesprochenen Texten kurz wieder aktivieren. Die drei Stimmen bleiben im Konto (IDs in `tools/vertonen.js`).
- **Datensicherheit:** Daten liegen nur im Browser. iOS kann Daten lange nicht genutzter Webseiten löschen, mit der App auf dem Home-Bildschirm ist das unwahrscheinlicher. Die Sicherungs-Erinnerung (alle 4 Wochen) soll das abfedern.

## Nächste Schritte (Ideen, nicht beauftragt)
- Naturgeräusche als Alternative zum Klangteppich (braucht lizenzfreie Aufnahmen)
- Weitere geführte Übungen oder ein zweites 8-Wochen-Programm, damit sich nach 8 Wochen weniger wiederholt
- Rückmeldungen bei Bedarf mit KI erweitern (bewusst zurückgestellt: Datenschutz, Kosten)
- Falls der Kreis wächst und einzelne Personen gesperrt werden sollen: Zugang pro Person (bräuchte einen Server, widerspricht dem heutigen Aufbau)

## Erledigt
### Version 1.4.1 – Korrektur Hilfe-Seite
- 112 heißt jetzt „112 · Euro-Notruf“ (de, en, cs)
- Langer Name „Kriseninterventionszentrum Wien“ bricht sauber um (Trennstellen, `overflow-wrap`)

### Version 1.4.0 – Zugangsschutz, Sicherungs-Erinnerung, Update-Hinweis
- Beim ersten Öffnen: Zugangscode oder Einladungslink (`#/join/<code>`), gemerkt auf dem Gerät (`sonnseite.access`). Hilfe und Impressum bleiben ohne Code erreichbar.
- Einstellungen: „Freund:innen einladen“ (Teilen-Menü oder Kopieren, zeigt den Code als Ersatz für die installierte App)
- Code ändern: `node tools/zugangscode.js <neuer-code>`, dann VERSION und CACHE erhöhen und veröffentlichen (alle müssen sich neu freischalten). Der aktuelle Code ist dem Inhaber bekannt und steht bewusst **nicht** in den Dateien (das Repository ist öffentlich)
- Schutz nur gegen Zufallsbesucher: Der Prüfwert steht (als SHA-256) in `app.js`. `robots.txt` sperrt Suchmaschinen.
- Bestehende Nutzer:innen müssen sich nach dem Update einmal freischalten.
- Sicherungs-Erinnerung (Startseite, ab 28 Tagen seit der letzten Sicherung, „Später“ = 7 Tage), „Letzte Sicherung“ in den Einstellungen
- Update-Hinweis: kleines Fenster einmal pro Version (`seenVersion`, Texte in `changelog`), „Was ist neu?“ in den Einstellungen

### Version 1.3.3 – Lebensthemen ergänzt
- „Was dich gerade beschäftigt“ hat jetzt 17 Themen in drei Gruppen: schön – verändert – schwer
- Neu: Neue oder gewachsene Liebe, Familie wächst, Ein Tier zieht ein, Eine gute Phase bewusst genießen, Umzug, Kinder werden selbstständig, Übergang in die Pension, Abschied von einem Tier
- „Lebensumbruch“ heißt jetzt „Neuanfang / Neuorientierung“ (gleicher Schlüssel `veraenderung`)
- Je zwei Gedanken pro neuem Thema (de/en/cs, am Ende von `affirmations` angehängt; Gruppen in `themeGroups`)
- Offen: tschechische Texte von Muttersprachlerin gegenlesen lassen

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
- Drei selbst entworfene ElevenLabs-Stimmen für de, en, cs: Ruhig (voreingestellt), Warm, Tief – je 153 Aufnahmen, zusammen ca. 26 MB
- Auswahl in den Einstellungen, Gerätestimme als Wahlmöglichkeit und automatischer Ersatz
- Werkzeug `tools/vertonen.js` zum Nachvertonen geänderter Texte
- Offline-Speicher für Aufnahmen getrennt von der App-Version; CSP um `media-src 'self' blob:` ergänzt

### Version 1.3.1 – Impressum
- Eigene Seite (Route `#/imprint`): Offenlegung nach § 25 Mediengesetz (Andreas Kauba & Tomas Mikeska, Wien, sonnseite@tm-relations.com), Gesundheitshinweis, Haftung, Links, Datenschutz (inkl. Hosting bei Render), Urheberrecht (de, en, cs)
- Erreichbar über Einstellungen („Über“), Hilfe-Seite und Willkommens-Bildschirm
- „Über“: „hat keinen Server“ → „speichert nichts auf einem Server“

### Version 1.3.2 – Aufräumen nach dem Impressum
- Datenschutz-Absatz unter „Über Sonnseite“ entfernt (stand im Widerspruch zum Hosting-Hinweis, jetzt nur noch im Impressum)
- Link heißt „Impressum und Datenschutz“ (de, en, cs)
- WHO-5-Urheber im Impressum korrigiert (Psychiatric Research Unit, Frederiksborg, nicht die WHO selbst)
