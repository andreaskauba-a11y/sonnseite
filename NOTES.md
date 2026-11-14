# Sonnseite – Stand & nächste Schritte

_Stand: 14. November 2026 · Version 1.4.0 (lokal committet, noch nicht online; 1.3.3 ist live)_

## Erledigt
### Version 1.4.0 – Zugangsschutz (noch nicht online)
- Beim ersten Öffnen: Zugangscode oder Einladungslink (`#/join/<code>`), gemerkt auf dem Gerät (`sonnseite.access`). Hilfe und Impressum bleiben ohne Code erreichbar.
- Einstellungen: „Freund:innen einladen“ (Teilen-Menü oder Kopieren, zeigt den Code als Ersatz für die installierte App)
- Code ändern: `node tools/zugangscode.js <neuer-code>`, dann VERSION und CACHE erhöhen und veröffentlichen (alle müssen sich neu freischalten). Aktueller Code: sonnenblume14 (Vorschlag, bitte vom Inhaber bestätigen oder ändern)
- Schutz nur gegen Zufallsbesucher: Der Prüfwert steht (als SHA-256) in `app.js`. `robots.txt` sperrt Suchmaschinen.
- Bestehende Nutzer:innen müssen sich nach dem Update einmal freischalten.
- Sicherungs-Erinnerung (Startseite, ab 28 Tagen seit der letzten Sicherung, „Später“ = 7 Tage), „Letzte Sicherung“ in den Einstellungen
- Update-Hinweis: kleines Fenster einmal pro Version (`seenVersion`, Texte in `changelog`), „Was ist neu?“ in den Einstellungen
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

- **Impressum** ist keine Rechtsberatung; bei Bedarf von einer Fachperson prüfen lassen. Bei Änderung von Hosting oder Kontakt anpassen.
- **Natürliche Stimmen auf echten Handys prüfen** (vor allem iPhone): Startet die Stimme zuverlässig, auch mit gesperrtem Bildschirm? Lautstärke im Verhältnis zu Klangteppich und Klangschale? Im Test lief nur Chromium.
- **Tschechische und englische Aufnahmen** von Muttersprachlerinnen probehören lassen (Aussprache, Betonung). Die Stimmen wurden auf Deutsch ausgesucht.
- **„Warm“ ist nachträglich tiefer gestellt** (Faktor 0.92). Auf Künstlichkeit achten; ohne Tieferstellen: in `tools/vertonen.js` `pitch: 1` setzen, Ordner `public/audio/warm` löschen und neu erzeugen.
- **Render-Header:** Die geänderte CSP in `render.yaml` greift nur, wenn Render den Blueprint übernimmt. Nach dem Online-Stellen prüfen, ob Aufnahmen abspielen (sonst in Render unter „Blueprint“ synchronisieren).
- **ElevenLabs:** Starter-Abo kann nach der Vertonung gekündigt werden; für spätere Textänderungen dann kurz wieder aktivieren. Die drei Stimmen bleiben im Konto gespeichert (IDs in `tools/vertonen.js`).
- **Klang der Stimme auf echten Geräten nicht geprüft.** Im Test lief nur eine Attrappe. Rückmeldungen der Nutzerinnen abwarten: Tempo, Pausen, Tonhöhe, Lautstärke im Verhältnis zur Musik.
- **Klangteppich und Klangschale noch nicht angehört.** Eventuell zu laut, zu leise oder zu tief. Werte stehen in `audio.js` (`startPad`, `bell`).
- **Tschechische Texte** von einer Muttersprachlerin gegenlesen lassen. Die Gedanken stehen in weiblicher Form, die WHO-5-Übersetzung ist eine eigene, keine offiziell validierte.
- **Neue Impuls-Varianten 2 und 3** wurden mit „online stellen“ freigegeben, aber nicht einzeln kommentiert. Auf Rückmeldungen achten.
- **Hilfe-Nummern** regelmäßig prüfen (gesundheit.gv.at). Die Zeiten der Kummernummer 116 123 sind bewusst nicht angegeben.
- **Datensicherheit:** Die Daten liegen nur im Browser. Nutzerinnen auf die Sicherung hinweisen, vor allem vor einem Handywechsel oder dem Löschen der Browserdaten. iOS kann Daten von Webseiten löschen, die lange nicht genutzt wurden. Mit der App auf dem Home-Bildschirm ist das unwahrscheinlicher.
- Krisen- und Rückmeldungs-Schlüsselwörter sind einfache Wortstämme. Fehlauslöser oder Lücken sind möglich, daher Rückmeldungen sammeln.

### Version 1.3.3 – Lebensthemen ergänzt
- „Was dich gerade beschäftigt“ hat jetzt 17 Themen in drei Gruppen: schön – verändert – schwer
- Neu: Neue oder gewachsene Liebe, Familie wächst, Ein Tier zieht ein, Eine gute Phase bewusst genießen, Umzug, Kinder werden selbstständig, Übergang in die Pension, Abschied von einem Tier
- „Lebensumbruch“ heißt jetzt „Neuanfang / Neuorientierung“ (gleicher Schlüssel `veraenderung`)
- Je zwei Gedanken pro neuem Thema (de/en/cs, am Ende von `affirmations` angehängt; Gruppen in `themeGroups`)
- Offen: tschechische Texte von Muttersprachlerin gegenlesen lassen

## Mögliche nächste Schritte (Ideen, nicht beauftragt)
- Naturgeräusche als Alternative zum Klangteppich (in Runde 1.1 zurückgestellt, braucht lizenzfreie Aufnahmen)
- Weitere geführte Übungen oder ein zweites 8-Wochen-Programm, damit sich nach 8 Wochen weniger wiederholt
- Rückmeldungen bei Bedarf mit KI erweitern (bewusst zurückgestellt: Datenschutz und Kosten)
- Kurze Anleitung zum Weitergeben an Freundinnen (Installieren, iPhone-Premium-Stimmen, Sicherung)
