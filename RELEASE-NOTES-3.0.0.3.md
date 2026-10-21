## Media Bar 3.0.0.3 für Jellyfin 12.2

Behebt den stehenbleibenden automatischen Vorschauwechsel: Nach dem Laden wurde der Slideshow-Timer gestoppt und seine Referenz gelöscht. Er bleibt jetzt erhalten, damit die vorhandene Vorschau-/Trailerlogik ihn starten und fortsetzen kann.

Manuelle Pause, laufende Trailer und Seitensichtbarkeit werden weiterhin berücksichtigt. Das Trailerende verwendet weiterhin den vorhandenen Wechsel zur nächsten Vorschau. File Transformation bleibt auf Version 3.0.0.1.

Validiert: 8 Media-Bar-Tests. Der neue Regressionstest scheiterte vor der Korrektur an der gelöschten Timerreferenz; er prüft jetzt auch mehrfache Fortschaltung, Pause, Trailerende und unsichtbare Seiten. Ein direkter Test auf dem Fernseher steht aus.

Über den vorhandenen Plugin-Katalog auf Media Bar 3.0.0.3 aktualisieren. Danach Server und TV-App vollständig neu starten. Für die dazugehörigen TV-Layoutkorrekturen zusätzlich ElegantFin TV 0.1.7.0 installieren.
