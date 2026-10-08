# Media Bar 3.0.0.2 for Jellyfin 12.2

Media Bar now defaults to a compact 40% screen height on LG webOS and Jellyfin
TV layout, so library rows remain visible. The height is adjustable from 30%
to 60% in Dashboard > Plugins > Media Bar > Web Config. TV layout omits the
plot summary and reduces logo size while preserving playback controls.

## Server-managed content

In Media Bar > Web Config, choose:

- Client selection: preserves existing client preferences and playlists.
- Random: server-managed selection of random unwatched titles with logos.
- Recently added: newest movies/series first, including watched titles and
  titles without logos. Titles without logos display their name instead.

Set the total item count (1-500), category (movies, series or both), and optional
library names (one per line). These server-managed modes override local
selection settings and bypass playlists/list.txt. Only libraries accessible
to the current user are queried. Missing library names do not broaden the
selection. For series, the date is when the series was added, not when its
latest episode was added.

Configuration is now available before slideshow initialization, avoiding the
previous race between initial loading and server settings.

## Update

The existing repository URL remains valid:

https://github.com/S3NTIN3LOne/jellyfin-plugins/releases/latest/download/manifest.json

Update Media Bar to 3.0.0.2, restart Jellyfin, and fully restart the TV app or
reload browser clients. Keep the asset version set to `embedded`.
File Transformation remains at 3.0.0.1 and is included unchanged.

## Validation

- Both Release builds: zero warnings or errors.
- Seven automated selection/configuration tests passed.
- CSS layout checks in headless Edge at 1920x1080: compact TV sizing and visible
  controls in Classic, Plate and Marquee; desktop sizing remains unchanged.
- An actual LG webOS device and a running Jellyfin server were not available
  for runtime verification.