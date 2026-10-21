# Media Bar 3.0.0.6 – Deutsche Einstellungen und kompakte Girlanden

Die Plugin-Einstellungen und das persönliche Media-Bar-Menü sind jetzt auf
Deutsch: Beschriftungen, Auswahlmöglichkeiten, Hilfetexte, Schaltflächen und
Bedienungshinweise. Bestehende Einstellungen bleiben erhalten. Deutsche
Ersatztexte verhindern englische Begriffe wie „Play“, falls Jellyfin keine
passende Übersetzung liefert. Lange Beschriftungen können auf schmalen
Bildschirmen umbrechen.

Die saisonale Girlande liegt jetzt als flacher Streifen am oberen Rand der
Media Bar. Die Schnur reicht über die Breite der Bar, und die Anhänger sind
kleiner. Ihr Seitenverhältnis bleibt auch auf schmalen Bildschirmen erhalten.
Der Abstand berücksichtigt die tatsächlich überlappende Jellyfin-Kopfzeile.
Dadurch wird bei einer Themenkarte unterhalb der Kopfzeile kein zusätzlicher
großer Abstand mehr addiert. Die bestehenden Motive und Animationen bleiben
erhalten; im TV-Modus und auf webOS erscheint weiterhin keine Girlande.

## Update

Die bisherige Repository-Adresse bleibt gültig:
https://github.com/S3NTIN3LOne/jellyfin-plugins/releases/latest/download/manifest.json

Media Bar auf 3.0.0.6 aktualisieren, Jellyfin neu starten und die Seite neu
laden bzw. die App vollständig neu starten. Als Asset-Version `embedded`
verwenden. File Transformation bleibt bei 3.0.0.1.

## Prüfungen

- Beide Release-Builds ohne Warnungen oder Fehler.
- 13 Verhaltenstests für Titelauswahl, Timer und Servervorgaben bestanden.
- Browserprüfungen für Halloween/Weihnachten/Aus, TV, webOS-Erkennung,
  Bewegungsreduktion und Layoutwechsel bestanden.
- Girlande bei 1920, 768 und 390 Pixel Breite in nachgebildetem Standardlayout
  und Kartenlayout geprüft, einschließlich geänderter Kopfzeilenhöhe.
- Deutsches Nutzermenü auf horizontalen Überlauf geprüft; Laden und Speichern
  der deutschen Plugin-Einstellungen erhält Kategorien, Bibliotheken und Anzahl.
- Die Original-Themedatei und ein echter LG-TV standen nicht zur Verfügung.