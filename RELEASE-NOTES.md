# Media Bar 3.0.0.9 – Gemeinsame Saisonprüfung mit Jelly+

Girlande und saisonale Empfehlungen verwenden jetzt dieselbe serverseitige
Datumsprüfung. Ist Jelly+ geladen, wird dessen tatsächliche Saisonregel aufgerufen.
Die aktuelle Jelly+-Version verwendet Halloween vom 15. Oktober bis 1. November
und Weihnachten vom 1. bis 31. Dezember. Diese Termine werden nicht in Media Bar
kopiert: Änderungen an der Jelly+-Regel werden übernommen.

Ohne Jelly+ gilt der Fallback: Halloween im Oktober, Weihnachten im Dezember.
Maßgeblich ist in beiden Fällen das Serverdatum. Außerhalb der gewählten Saison
zeigt die Media Bar wieder die normale Auswahl. Bei einem Saisonwechsel werden
bereits geladene saisonale Titel entfernt und die Auswahl neu geladen.

Unter „Darstellung und Inhalte“ lässt sich „Animierte saisonale Girlande anzeigen“
separat abschalten, ohne die Empfehlungen zu deaktivieren. TV-Modus und webOS
zeigen weiterhin keine Girlande.

Offene Seiten prüfen die Saison zum Server-Tageswechsel, regelmäßig jede Minute
und bei Rückkehr zum Tab. Netzwerkfehler gelten nicht als fehlendes Jelly+: Nach
Ablauf der letzten gültigen Auskunft bleiben saisonale Funktionen ausgeschaltet,
bis eine neue Auskunft vorliegt.

Geprüft: 16 JavaScript-Verhaltenstests, serverseitige Jelly+-Schnittstelle per
Test-Assembly, veränderte Datumsregeln, Fallback und Saison-/Jahresgrenzen,
Browserprüfungen für Inhaltswechsel und Girlanden-Schalter, Standard-/Kartenlayout,
deutsche Einstellungen sowie Web-/TV-/webOS-Erkennung. Kein Live-Test auf einem
Jellyfin-Server oder einem echten LG-TV.

Nach dem Update Jellyfin neu starten und die Clients neu laden. Als Asset-Version
`embedded` verwenden. File Transformation bleibt bei Version 3.0.0.1.
Die bestehende Repository-Adresse gilt weiter:
https://github.com/S3NTIN3LOne/jellyfin-plugins/releases/latest/download/manifest.json
