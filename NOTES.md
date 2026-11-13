# Sonnseite – Stand & nächste Schritte

_Stand: 13. November 2026 · Version 1.2.0 (live auf Render über `main`)_

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

## Offen / zu beobachten
- **Klang der Stimme auf echten Geräten nicht geprüft.** Im Test lief nur eine Attrappe. Rückmeldungen der Nutzerinnen abwarten: Tempo, Pausen, Tonhöhe, Lautstärke im Verhältnis zur Musik.
- **Klangteppich und Klangschale noch nicht angehört.** Eventuell zu laut, zu leise oder zu tief. Werte stehen in `audio.js` (`startPad`, `bell`).
- **Tschechische Texte** von einer Muttersprachlerin gegenlesen lassen. Die Gedanken stehen in weiblicher Form, die WHO-5-Übersetzung ist eine eigene, keine offiziell validierte.
- **Neue Impuls-Varianten 2 und 3** wurden mit „online stellen“ freigegeben, aber nicht einzeln kommentiert. Auf Rückmeldungen achten.
- **Hilfe-Nummern** regelmäßig prüfen (gesundheit.gv.at). Die Zeiten der Kummernummer 116 123 sind bewusst nicht angegeben.
- **Datensicherheit:** Die Daten liegen nur im Browser. Nutzerinnen auf die Sicherung hinweisen, vor allem vor einem Handywechsel oder dem Löschen der Browserdaten. iOS kann Daten von Webseiten löschen, die lange nicht genutzt wurden. Mit der App auf dem Home-Bildschirm ist das unwahrscheinlicher.
- Krisen- und Rückmeldungs-Schlüsselwörter sind einfache Wortstämme. Fehlauslöser oder Lücken sind möglich, daher Rückmeldungen sammeln.

## Mögliche nächste Schritte (Ideen, nicht beauftragt)
- Naturgeräusche als Alternative zum Klangteppich (in Runde 1.1 zurückgestellt, braucht lizenzfreie Aufnahmen)
- Weitere geführte Übungen oder ein zweites 8-Wochen-Programm, damit sich nach 8 Wochen weniger wiederholt
- Natürlichere Stimme über vorab erzeugte Audiodateien (ElevenLabs o. ä., braucht Konto und API-Schlüssel des Inhabers)
- Rückmeldungen bei Bedarf mit KI erweitern (bewusst zurückgestellt: Datenschutz und Kosten)
- Kurze Anleitung zum Weitergeben an Freundinnen (Installieren, iPhone-Premium-Stimmen, Sicherung)
