# Media Bar 3.0.0.8 – Datumsprüfung für saisonale Girlanden

Die Girlande erscheint nur noch im Zeitraum der ausgewählten Saison:

- Halloween: 1. bis 31. Oktober.
- Weihnachten: 1. bis 31. Dezember.

Maßgeblich ist das lokale Datum des Geräts. Bereits geöffnete Seiten aktualisieren
die Dekoration um Mitternacht sowie bei Rückkehr zum Tab oder Fenster.
Außerhalb der Saison wird die Girlande vollständig entfernt.
Im TV-Modus und auf webOS bleibt sie ausgeblendet. Die saisonalen Filmempfehlungen
bleiben unabhängig vom Datum verfügbar.

Geprüft: Saisonbeginn und Saisonende einschließlich Jahreswechsel mit simulierter
Browserzeit in Europe/Berlin, Web-/TV-/webOS-Erkennung, Animation und reduzierte
Bewegung, responsive Layouts und deutsche Einstellungen sowie 13 Verhaltenstests.

Nach dem Update Jellyfin neu starten und die Browserseite neu laden. Als
Asset-Version `embedded` verwenden. Die bestehende Repository-Adresse gilt weiter:
https://github.com/S3NTIN3LOne/jellyfin-plugins/releases/latest/download/manifest.json
