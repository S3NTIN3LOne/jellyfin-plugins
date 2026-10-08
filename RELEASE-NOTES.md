# Media Bar and File Transformation 3.0.0.1 for Jellyfin 12.2

Both plugins are built against Jellyfin 12.2.0 and target .NET 10.

- Updated Jellyfin package references and generated version metadata.
- Media Bar includes the supplied slideshow JavaScript and CSS as embedded resources.
- Release ZIPs contain the plugin DLL, logo and upstream license. Jellyfin's own assemblies are not bundled.
- Both Release builds are checked before packaging; ZIPs include MD5 checksums in the repository manifest.

## Installation

Add this URL under Dashboard > Plugins > Repositories in Jellyfin:

```text
https://github.com/S3NTIN3LOne/jellyfin-plugins/releases/latest/download/manifest.json
```

Install **File Transformation** and **Media Bar** from
the catalog, then restart Jellyfin. Leave Media Bar's asset version set to
`embedded`.

The plugins have been compiled against Jellyfin 12.2.0. Runtime verification
on a running Jellyfin 12.2 server remains outstanding.

Original plugin author: IAmParadox27. Slideshow credits are preserved in the
embedded assets.
