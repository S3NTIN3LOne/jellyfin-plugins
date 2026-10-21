# Media Bar 3.0.0.3 - Seasonal recommendations and web garlands

Configure **Seasonal recommendations / Saisonale Empfehlungen** in Dashboard >
Plugins > Media Bar > Web Config. Choose Disabled (default), Halloween or Christmas.

- Halloween recommends titles with the Horror genre or Halloween tag.
- Christmas recommends titles tagged or categorized as Christmas, Weihnachten or Xmas.
- Add these tags using Jellyfin's metadata editor to include selected titles.
- The configured count, category and libraries apply. Recently added keeps its
  newest-first order; other modes select seasonal titles randomly, including
  watched titles and titles without logos. No matches means no bar.
- Seasonal selection overrides client selection and playlists/list.txt.

Enabling a season adds an animated garland near the top of the media bar:
Halloween pumpkins, bats and ghosts, or Christmas baubles, stars and holly.
The artwork is embedded SVG/CSS and requires no external image requests.
The garland does not intercept clicks or keyboard focus. Reduced-motion
preferences disable its animation.

**The garland is web-only:** no decoration nodes or animations are created in
Jellyfin TV mode or LG webOS. Switching to TV mode removes existing decorations.
Seasonal recommendations themselves remain available on TV.

## Update

Use the existing repository:
https://github.com/S3NTIN3LOne/jellyfin-plugins/releases/latest/download/manifest.json

Update Media Bar to 3.0.0.3, restart Jellyfin and reload browser clients / restart
TV apps. Keep asset version set to `embedded`. File Transformation remains at
3.0.0.1 and is included unchanged.

## Validation

- Both Release builds: zero warnings or errors.
- 12 automated selection/configuration tests passed, including seasonal filters,
  user/library scope, deduplication, count limits and no unrelated fallback.
- Browser checks passed for Disabled/Halloween/Christmas across web, TV layout
  and a webOS user agent, including animation, reduced motion and mode changes.
- Existing compact TV and desktop layout checks passed for all three layouts.
- Artwork previews visually inspected in headless Edge.
- No physical LG TV or running Jellyfin server was available for runtime testing.