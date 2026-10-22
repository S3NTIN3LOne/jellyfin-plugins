# Media Bar 3.0.0.7 – Mehr Abstand für die Girlande

Die saisonale Girlande wurde weiter nach unten versetzt, damit sie weder die
Navigation im Standardlayout noch die Media-Bar-Schaltflächen in CSS-Themes
überlagert.

- Ein oberer Streifen bleibt grundsätzlich frei.
- Unter der Navigation und den oberen Media-Bar-Schaltflächen bleiben 16 Pixel Abstand.
- Auch Schaltflächen, die erst bei Mausberührung erscheinen, werden berücksichtigt.
- Nach dem Einfügen der Bedienelemente wird die Position erneut berechnet.
- Größenänderungen an Kopfzeile, Navigationszeilen und Bedienelementen werden
  beobachtet. Sichtbare Navigation in Kopfzeilen ohne eigene Höhe wird erkannt.

Nach dem Update Jellyfin neu starten und die Browserseite neu laden. Als
Asset-Version `embedded` verwenden. Die bestehende Repository-Adresse gilt weiter:
https://github.com/S3NTIN3LOne/jellyfin-plugins/releases/latest/download/manifest.json

Geprüft: 13 Verhaltenstests, Browserprüfungen für Standard- und Kartenlayout
bei 1920/768/390 Pixeln, nachträglich hinzugefügte Bedienelemente, unsichtbare
Hover-Schaltflächen und eine nachträglich vergrößerte Navigation. Saisonale
Animationen, Bewegungsreduktion und TV-Ausblendung ebenfalls geprüft. Die
konkrete CSS-Themedatei und ein echter LG-TV standen nicht zur Verfügung.