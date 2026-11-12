# Jellyfin plugins

Media Bar and File Transformation target Jellyfin **12.2** by default
(`JellyfinVersion=12.2.0`, NuGet packages `12.2.0`, .NET 10).

## Install in Jellyfin

Add a plugin repository named **S3NTIN3LOne Jellyfin Plugins** under
Dashboard > Plugins > Repositories with this URL:

```text
https://github.com/S3NTIN3LOne/jellyfin-plugins/releases/latest/download/manifest.json
```

Install **File Transformation** and **Media Bar** from the catalog, then
restart Jellyfin. Keep Media Bar's asset version set to `embedded`.

These are modified builds of [Media Bar](https://github.com/IAmParadox27/jellyfin-plugin-media-bar)
and [File Transformation](https://github.com/IAmParadox27/jellyfin-plugin-file-transformation).
Upstream licenses are preserved in each plugin directory and release ZIP.
Slideshow credits are preserved in the JavaScript and CSS files.

## Media Bar settings (3.0.0.8)

Plugin and client settings are in German, including labels, help text and
accessibility descriptions. Stored configuration values and layout identifiers
remain compatible with existing installations.

Seasonal garlands now form a compact strip at the upper edge of the media bar.
The cord follows the full container width; small ornaments retain their aspect
ratio on narrow screens. A reserved top strip and 16px clearance below navigation
and upper Media Bar controls prevent overlap, including hover-hidden buttons.
Header and control resizing is observed, including zero-height header wrappers
with visible navigation children. TV/webOS remains undecorated.

Under Dashboard > Plugins > Media Bar > Web Config:

- TV bar height defaults to 50% (adjustable 30-60%) on LG webOS and TV layout.
- Content selection can remain client-controlled or use server-managed Random
  or Recently added modes. Set a total count, movies/series category and optional
  library names (one per line). Empty means all accessible libraries.
- Recently added sorts by creation date, includes watched titles and titles
  without logos, and ignores saved shuffle order and playlists. For series it
  uses the series creation date, not the newest episode date.
- Server-managed selections take priority over local preferences. Missing or
  inaccessible library names never fall back to all content.
- Seasonal recommendations: choose Disabled (default), Halloween or Christmas.
  Halloween matches genre `Horror` or tag `Halloween`. Christmas matches tags or
  genres `Christmas`, `Weihnachten` or `Xmas`. You can assign these tags in
  Jellyfin's metadata editor. The existing item count, category and library
  filters apply; Recently added preserves date order. Seasonal random selection
  also includes watched titles and titles without logos. No matches means no bar.
- An animated pumpkin/bat/ghost or bauble/star/holly garland appears near the
  top of the bar in web layout. It is never created in TV mode or webOS, is
  removed on layout changes, and stays still when reduced motion is enabled.
  Halloween decorations appear only October 1–31, Christmas decorations only
  December 1–31, using the client's local date. Open pages refresh at local
  midnight and when returning to the tab. Seasonal recommendations remain
  available year-round, including on TV.

Save settings, then restart the TV app or reload the browser. Use `embedded`
assets to receive these features. File Transformation remains at 3.0.0.1.

Run selection tests with `node --test tests/mediabar.test.cjs`. The optional
`node tests/mediabar-layout.cjs` check requires Playwright and Microsoft Edge
and checks CSS sizing in a desktop browser; it does not emulate webOS.
`node tests/mediabar-seasonal.cjs` checks decoration visibility, animation,
reduced motion and mode changes with the same browser dependencies.
`node tests/mediabar-ui.cjs` checks responsive garland geometry and German
settings, including a configuration load/save round-trip.

## Build

Install the .NET 10 SDK. Media Bar also requires `slideshowpure.js` and
`slideshowpure.css` in `jellyfin-plugin-media-bar-main/`; these are embedded into the plugin and
must come from the matching Media Bar source release.

```powershell
dotnet build ./jellyfin-plugin-file-transformation-main/Jellyfin.Plugin.FileTransformation/Jellyfin.Plugin.FileTransformation.csproj -c Release
dotnet build ./jellyfin-plugin-media-bar-main/Jellyfin.Plugin.MediaBar/Jellyfin.Plugin.MediaBar.csproj -c Release
```

Each plugin's output is under its project directory in `bin/Release/net10.0/`.
For this workspace, a local .NET 10.0.401 SDK is also available at
`.build-tools/dotnet/dotnet.exe`; it can be used instead of `dotnet` above.
Both plugins generate their Jellyfin version attribute from `JellyfinVersion`.
To build against another supported version, pass `-p:JellyfinVersion=12.0.0`
(or the appropriate supported 10.11 version) to `dotnet build`.

## Verify on Jellyfin 12.2

Install both plugin DLLs into their respective Jellyfin plugin directories and
restart Jellyfin. Check that both plugins load without dependency errors and
that MediaBar Startup registers the file transformations. Open Jellyfin Web
and verify that the media bar appears with the `embedded` asset setting and
that `/MediaBar/slideshowpure.js` and `/MediaBar/slideshowpure.css` return 200
(including the server's base path when configured).

## Validation status

- File Transformation: Release build against Jellyfin 12.2.0 succeeded with
  zero warnings and zero errors.
- Media Bar: Release build against Jellyfin 12.2.0 succeeded with zero warnings
  and zero errors, including the embedded `slideshowpure.js` and `slideshowpure.css`.
- Generated Jellyfin version attributes were verified as `12.2.0` for both
  projects. Runtime verification on a Jellyfin 12.2 server remains outstanding.

## Prepare a GitHub release

Run `./scripts/Prepare-Release.ps1 -Repository S3NTIN3LOne/jellyfin-plugins` with the actual
public GitHub repository name. Use `-Dotnet ./.build-tools/dotnet/dotnet.exe`
to select the local SDK when necessary. The script builds each plugin version from its project file,
checks assembly versions and ZIP contents, and generates `manifest.json` with
Jellyfin-compatible MD5 checksums and target ABI `12.2.0.0`.

Publish both ZIPs and `manifest.json` from `artifacts/v3.0.0.8-jellyfin-12.2/`
as assets of the GitHub release tagged `v3.0.0.8-jellyfin-12.2`. Use
`RELEASE-NOTES.md` for the release description. The repository must be public
so Jellyfin can fetch the manifest and packages without GitHub authentication.

The stable Jellyfin repository URL is
`https://github.com/S3NTIN3LOne/jellyfin-plugins/releases/latest/download/manifest.json`.
Every future latest release must also include the manifest and both plugins.
After adding this URL in Jellyfin, install File Transformation and Media Bar
from the catalog and restart the server.
